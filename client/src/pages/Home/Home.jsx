import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import SearchBar from '../../components/SearchBar/SearchBar';
import api from '../../services/api';

const Home = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchWithCurrentLocation = async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        
        // Get location name using reverse geocoding
        const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const locationData = await geocodeResponse.json();
        
        const locationName = locationData.address?.city || 
                           locationData.address?.town || 
                           locationData.address?.county ||
                           'your location';

        // Search properties with coordinates
        const searchParams = {
          lat: latitude,
          lon: longitude,
          radius: 25,
          guests: 1
        };

        const response = await api.get('/properties/search', { params: searchParams });

        if (response.data.status === 'success') {
          setSearchResults({
            results: response.data.data,
            searchParams: {
              location: locationName,
              ...searchParams
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Unable to find properties in your area');
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        searchWithCurrentLocation,
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please enter it manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setLoading(false);
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <SearchBar 
          onSearchResults={handleSearchResults}
          initialLocation={searchResults?.searchParams?.location}
        />
      </Container>

      {loading ? (
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      ) : (
        searchResults?.results && (
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Properties near {searchResults.searchParams.location}
            </Typography>
            <Grid container spacing={3}>
              {searchResults.results.map((property) => (
                <Grid item key={property.id} xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={property.imageUrl || 'default-property-image.jpg'}
                      alt={property.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {property.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {property.city}, {property.country}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" color="primary">
                          ${property.price} / night
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.property_type}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {property.distance ? `${property.distance}km away` : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        )
      )}
    </Box>
  );
};

export default Home; 
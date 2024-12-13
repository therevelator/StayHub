import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Autocomplete, InputAdornment, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const propertyTypes = [
  { label: 'Any Type', value: '' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Villa', value: 'villa' },
  { label: 'Resort', value: 'resort' },
  { label: 'Guesthouse', value: 'guesthouse' },
  { label: 'Hostel', value: 'hostel' }
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else if (distance >= 1000) {
    return `${Math.round(distance)} km`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [guests, setGuests] = useState(1);
  const [searchResults, setSearchResults] = useState({ results: [], location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Restore state from history when navigating back
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setSearchLocation(event.state.searchLocation || '');
        setPropertyType(event.state.propertyType || '');
        setGuests(event.state.guests || 1);
        setSearchResults(event.state.searchResults || { results: [], location: '' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Check if we have state in current history entry
    if (window.history.state) {
      handlePopState({ state: window.history.state });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Get current location when component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let searchCoordinates;

      if (searchLocation) {
        const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchLocation)}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`;
        
        const geocodeResponse = await fetch(geocodingUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.results && geocodeData.results.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry;
          searchCoordinates = { lat, lon: lng };
        } else {
          throw new Error('Location not found');
        }
      } else {
        const position = await getCurrentPosition();
        searchCoordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
      }

      const response = await api.get('/properties/search', {
        params: {
          lat: searchCoordinates.lat,
          lon: searchCoordinates.lon,
          radius: 25,
          guests: guests || 1,
          propertyType: propertyType || undefined
        }
      });

      const newResults = {
        results: response.data.data,
        location: searchLocation || 'Current Location'
      };

      setSearchResults(newResults);

      // Save state to browser history
      const state = {
        searchLocation,
        propertyType,
        guests,
        searchResults: newResults
      };
      
      window.history.replaceState(state, '');
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (propertyId) => {
    // Save current state before navigating
    const state = {
      searchLocation,
      propertyType,
      guests,
      searchResults
    };
    window.history.replaceState(state, '');
    navigate(`/property/${propertyId}`);
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  return (
    <Container maxWidth="xl">
      {/* Search Section */}
      <Box
        sx={{
          py: 4,
          px: 2,
          mb: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: 1
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Location Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Where are you going?"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="primary" />
                  </InputAdornment>
                )
              }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          {/* Property Type */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              value={propertyTypes.find(type => type.value === propertyType) || propertyTypes[0]}
              onChange={(_, newValue) => setPropertyType(newValue?.value || '')}
              options={propertyTypes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Property Type"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          {/* Guests */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Number of guests"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
                inputProps: { min: 1 }
              }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          {/* Search Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{
                py: 1.7,
                fontSize: '1.1rem',
                textTransform: 'none'
              }}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading and Error states */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {searchResults.results.length > 0 && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Properties found {searchResults.location && `in ${searchResults.location}`}
        </Typography>
      )}

      <Grid container spacing={3}>
        {searchResults.results.map((property) => {
          // Calculate total price for each room including all fees
          const calculateRoomTotalPrice = (room) => {
            const basePrice = Number(room.basePrice) || 0;
            const cleaningFee = Number(room.cleaningFee) || 0;
            const serviceFee = Number(room.serviceFee) || 0;
            const taxRate = Number(room.taxRate) || 0;
            
            const subtotal = basePrice + cleaningFee + serviceFee;
            const taxAmount = subtotal * taxRate / 100;
            return subtotal + taxAmount;
          };

          // Find the cheapest room price
          const cheapestTotal = property.rooms?.length > 0
            ? Math.min(...property.rooms.map(room => calculateRoomTotalPrice(room)))
            : null;

          // Calculate real distance from current location
          const distance = currentLocation ? calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            parseFloat(property.latitude),
            parseFloat(property.longitude)
          ) : null;

          return (
            <Grid item key={property.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 3
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handlePropertyClick(property.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {property.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {property.city}, {property.country}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 2 
                  }}>
                    <Box>
                      <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
                        {cheapestTotal 
                          ? `From €${cheapestTotal.toFixed(2)} / night`
                          : 'Price unavailable'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Includes all fees
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {property.property_type}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {distance ? formatDistance(distance) : 'Distance not available'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Home; 
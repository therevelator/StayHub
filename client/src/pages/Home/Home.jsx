import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia } from '@mui/material';
import SearchBar from '../../components/SearchBar/SearchBar';

const Home = () => {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <SearchBar onSearchResults={handleSearchResults} />
      </Container>

      {searchResults && searchResults.results && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Search Results
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
      )}
    </Box>
  );
};

export default Home; 
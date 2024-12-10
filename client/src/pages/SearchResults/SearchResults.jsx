import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Alert
} from '@mui/material';

const SearchResults = () => {
  const location = useLocation();
  const { results, searchParams } = location.state || {};

  if (!results) {
    return (
      <Container>
        <Alert severity="error">No search results available</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Properties in {searchParams.location}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {results.length} properties found
      </Typography>

      <Grid container spacing={3}>
        {results.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={property.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={property.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {property.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.city}, {property.country}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">
                    ${property.price} / night
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.property_type}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchResults; 
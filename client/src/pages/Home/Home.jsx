import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import SearchBar from '../../components/SearchBar/SearchBar';
import PropertyTypes from '../../components/PropertyTypes/PropertyTypes';
import Destinations from '../../components/Destinations/Destinations';
import PropertyGrid from '../../components/PropertyGrid/PropertyGrid';

const Home = () => {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SearchBar onSearchResults={handleSearchResults} />
      
      {searchResults ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Properties in {searchResults.searchParams.location}
          </Typography>
          <PropertyGrid properties={searchResults.results} />
        </Box>
      ) : (
        <>
          <PropertyTypes />
          <Destinations />
        </>
      )}
    </Container>
  );
};

export default Home; 
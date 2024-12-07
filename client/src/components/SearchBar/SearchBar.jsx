import { useState } from 'react';
import { Box, TextField, Button, Container, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import PropertyGrid from '../Property/PropertyGrid';

const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#299d8f',
  color: 'white',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#005999',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1f7a6d',
  padding: theme.spacing(3, 0),
  marginBottom: theme.spacing(4),
}));

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location) return;

    setLoading(true);
    setError(null);
    setSearchLocation(location);

    try {
      // First, get coordinates for the location
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.length) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeData[0];

      // Then search for properties near these coordinates
      const response = await fetch(`/api/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lon,
          checkIn,
          checkOut,
          radius: 25, // Start with 25km radius
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SearchContainer>
        <Container maxWidth="xl">
          <Box sx={{ color: 'white', mb: 3 }}>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Find your perfect stay</h1>
            <p style={{ margin: '8px 0' }}>Discover amazing places to stay around the world</p>
          </Box>
          
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              gap: 1,
              p: 1,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <TextField
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{ flex: 2 }}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={setCheckIn}
                sx={{ flex: 1 }}
                slotProps={{
                  textField: {
                    InputProps: {
                      sx: { borderRadius: 1 }
                    }
                  }
                }}
              />
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={setCheckOut}
                sx={{ flex: 1 }}
                slotProps={{
                  textField: {
                    InputProps: {
                      sx: { borderRadius: 1 }
                    }
                  }
                }}
              />
            </LocalizationProvider>

            <SearchButton
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
            >
              Search
            </SearchButton>
          </Paper>
        </Container>
      </SearchContainer>

      <PropertyGrid
        properties={properties}
        loading={loading}
        error={error}
        searchLocation={searchLocation}
      />
    </>
  );
};

export default SearchBar;

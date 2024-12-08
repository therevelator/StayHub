import { useState } from 'react';
import { Box, TextField, Button, Container, Paper, Divider } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import PropertyGrid from '../Property/PropertyGrid';
import PeopleSelector from './PeopleSelector';

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
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
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
          guests: guests.adults + guests.children,
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
            />
            <Divider orientation="vertical" flexItem />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={setCheckIn}
                sx={{ flex: 1 }}
                minDate={new Date()}
              />
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={setCheckOut}
                sx={{ flex: 1 }}
                minDate={checkIn || new Date()}
              />
            </LocalizationProvider>
            <Divider orientation="vertical" flexItem />
            <PeopleSelector
              value={guests}
              onChange={setGuests}
            />
            <SearchButton
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              Search
            </SearchButton>
          </Paper>
        </Container>
      </SearchContainer>

      {error && (
        <Container maxWidth="xl">
          <Box sx={{ color: 'error.main', mt: 2 }}>{error}</Box>
        </Container>
      )}

      {searchLocation && !loading && !error && (
        <Container maxWidth="xl">
          <Box sx={{ mt: 4 }}>
            <h2>Properties in {searchLocation}</h2>
            <PropertyGrid properties={properties} />
          </Box>
        </Container>
      )}
    </>
  );
};

export default SearchBar;

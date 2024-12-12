import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  TextField,
  CircularProgress,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const propertyTypes = [
  'Any',
  'Hotel',
  'Apartment',
  'Villa',
  'Resort',
  'Guesthouse',
  'Hostel'
];

const SearchBar = ({ onSearchResults, initialLocation }) => {
  const [location, setLocation] = useState(initialLocation || '');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [propertyType, setPropertyType] = useState('Any');
  const [loading, setLoading] = useState(false);

  // Update location when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleSearch = async () => {
    try {
      setLoading(true);

      // First get coordinates for the location
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.length) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeData[0];

      // Then search properties with these coordinates
      const searchParams = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radius: 25,
        guests: parseInt(guests) || 1,
        checkIn: checkIn ? dayjs(checkIn).format('YYYY-MM-DD') : null,
        checkOut: checkOut ? dayjs(checkOut).format('YYYY-MM-DD') : null,
        propertyType: propertyType === 'Any' ? null : propertyType
      };

      console.log('Searching with params:', searchParams);

      const response = await api.get('/properties/search', { 
        params: searchParams 
      });

      console.log('Search response:', response.data);

      if (response.data.status === 'success') {
        onSearchResults({
          results: response.data.data,
          searchParams: {
            location,
            ...searchParams
          }
        });
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert(error.message || 'Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      component="form"
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 800,
        margin: 'auto'
      }}
      elevation={3}
    >
      <Box sx={{ flex: 2, mr: 2 }}>
        <InputBase
          fullWidth
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ ml: 1 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flex: 3, gap: 2 }}>
        <DatePicker
          label="Check-in"
          value={checkIn}
          onChange={setCheckIn}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="Check-out"
          value={checkOut}
          onChange={setCheckOut}
          slotProps={{ textField: { size: 'small' } }}
        />
        <TextField
          type="number"
          label="Guests"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
          size="small"
          InputProps={{ inputProps: { min: 1 } }}
          sx={{ width: 100 }}
        />
        <TextField
          select
          label="Type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          size="small"
          sx={{ width: 120 }}
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <IconButton 
        onClick={handleSearch} 
        disabled={loading || !location}
        sx={{ ml: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : <SearchIcon />}
      </IconButton>
    </Paper>
  );
};

export default SearchBar;

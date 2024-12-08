import React, { useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const LocationForm = ({ data, onChange }) => {
  const [addressError, setAddressError] = useState('');

  const handleChange = (field) => (event) => {
    onChange({ ...data, [field]: event.target.value });
  };

  const handleGeocoding = async () => {
    const address = `${data.street}, ${data.city}, ${data.country}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        onChange({
          ...data,
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
        });
        setAddressError('');
      } else {
        setAddressError('Could not find coordinates for this address');
      }
    } catch (error) {
      setAddressError('Error finding location coordinates');
      console.error('Geocoding error:', error);
    }
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Property Location
      </Typography>

      <TextField
        fullWidth
        label="Street Address"
        value={data.street}
        onChange={handleChange('street')}
        required
      />

      <TextField
        fullWidth
        label="City"
        value={data.city}
        onChange={handleChange('city')}
        required
      />

      <TextField
        fullWidth
        label="State/Province"
        value={data.state}
        onChange={handleChange('state')}
      />

      <TextField
        fullWidth
        label="Country"
        value={data.country}
        onChange={handleChange('country')}
        required
      />

      <TextField
        fullWidth
        label="Postal Code"
        value={data.postalCode}
        onChange={handleChange('postalCode')}
      />

      <Button
        variant="outlined"
        startIcon={<LocationOnIcon />}
        onClick={handleGeocoding}
        sx={{ mt: 2 }}
      >
        Find Coordinates
      </Button>

      {addressError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {addressError}
        </Alert>
      )}

      {data.latitude && data.longitude && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Location found! Coordinates: {data.latitude}, {data.longitude}
        </Alert>
      )}
    </Box>
  );
};

export default LocationForm;

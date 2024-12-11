import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';

const propertyTypes = [
  'apartment',
  'house',
  'room',
  'hotel',
  'villa'
];

const BasicInfoForm = ({ data, onChange }) => {
  const handleChange = (field) => (event) => {
    onChange({ ...data, [field]: event.target.value });
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Basic Property Information
      </Typography>

      <TextField
        fullWidth
        label="Property Name"
        value={data.name || ''}
        onChange={handleChange('name')}
        required
      />

      <TextField
        fullWidth
        label="Description"
        value={data.description || ''}
        onChange={handleChange('description')}
        multiline
        rows={4}
        required
        helperText="Describe your property, its unique features, and what makes it special"
      />

      <FormControl fullWidth required>
        <InputLabel>Property Type</InputLabel>
        <Select
          value={data.propertyType || ''}
          onChange={handleChange('propertyType')}
          label="Property Type"
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Maximum Guests"
        value={data.guests}
        disabled
        helperText="Maximum guests is calculated from room occupancy"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="number"
        label="Number of Bedrooms"
        value={data.bedrooms || ''}
        onChange={handleChange('bedrooms')}
        required
        InputProps={{ inputProps: { min: 0 } }}
      />

      <TextField
        fullWidth
        type="number"
        label="Number of Beds"
        value={data.beds || ''}
        onChange={handleChange('beds')}
        required
        InputProps={{ inputProps: { min: 1 } }}
      />

      <TextField
        fullWidth
        type="number"
        label="Number of Bathrooms"
        value={data.bathrooms || ''}
        onChange={handleChange('bathrooms')}
        required
        InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
      />
    </Box>
  );
};

export default BasicInfoForm;

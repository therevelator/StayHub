import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Rating,
  Autocomplete,
  Chip,
} from '@mui/material';

const propertyTypes = [
  'hotel',
  'apartment',
  'villa',
  'resort',
  'guesthouse',
  'hostel',
];

const languages = [
  'English',
  'Romanian',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Russian',
  'Chinese',
  'Japanese',
  'Arabic',
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
        value={data.name}
        onChange={handleChange('name')}
        required
      />

      <TextField
        fullWidth
        label="Description"
        value={data.description}
        onChange={handleChange('description')}
        multiline
        rows={4}
        required
        helperText="Describe your property, its unique features, and what makes it special"
      />

      <FormControl fullWidth required>
        <InputLabel>Property Type</InputLabel>
        <Select
          value={data.propertyType}
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

      <Box>
        <Typography component="legend">Star Rating (if applicable)</Typography>
        <Rating
          name="star-rating"
          value={data.starRating}
          precision={0.5}
          onChange={(event, newValue) => {
            onChange({ ...data, starRating: newValue });
          }}
        />
      </Box>

      <Autocomplete
        multiple
        value={data.languages}
        onChange={(event, newValue) => {
          onChange({ ...data, languages: newValue });
        }}
        options={languages}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              key={option}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Languages Spoken"
            placeholder="Select languages"
          />
        )}
      />
    </Box>
  );
};

export default BasicInfoForm;

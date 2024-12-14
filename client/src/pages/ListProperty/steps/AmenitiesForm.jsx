import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  IconButton,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

const AMENITY_CATEGORIES = {
  general: 'General',
  room: 'Room',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  outdoor: 'Outdoor',
  accessibility: 'Accessibility'
};

const DEFAULT_AMENITIES = {
  general: ['WiFi', 'TV', 'Air Conditioning', 'Heating'],
  room: ['Desk', 'Closet', 'Iron', 'Safe'],
  bathroom: ['Hair Dryer', 'Shampoo', 'Hot Water', 'Towels'],
  kitchen: ['Refrigerator', 'Microwave', 'Coffee Maker', 'Dishes'],
  outdoor: ['Balcony', 'Garden', 'Parking', 'BBQ Grill'],
  accessibility: ['Elevator', 'Wheelchair Access', 'Ground Floor', 'Wide Doorway']
};

const AmenitiesForm = ({ data, onChange }) => {
  const [newAmenity, setNewAmenity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [error, setError] = useState(null);

  const handleToggle = (category, amenity) => {
    const updatedAmenities = { ...data };
    const categoryAmenities = updatedAmenities[category] || [];

    if (categoryAmenities.includes(amenity)) {
      updatedAmenities[category] = categoryAmenities.filter(a => a !== amenity);
    } else {
      updatedAmenities[category] = [...categoryAmenities, amenity];
    }

    onChange(updatedAmenities);
  };

  const handleAddCustomAmenity = (category) => {
    if (!newAmenity.trim()) return;

    // Check for duplicates in the same category
    if (data[category]?.includes(newAmenity.trim())) {
      setError(`"${newAmenity}" is already added in ${category}`);
      return;
    }

    // Check for duplicates across all categories
    let isDuplicateAcrossCategories = false;
    Object.entries(data).forEach(([cat, amenities]) => {
      if (cat !== category && amenities.includes(newAmenity.trim())) {
        isDuplicateAcrossCategories = true;
        setError(`"${newAmenity}" already exists in ${cat}`);
      }
    });

    if (isDuplicateAcrossCategories) return;

    const updatedAmenities = {
      ...data,
      [category]: [...(data[category] || []), newAmenity.trim()]
    };

    onChange(updatedAmenities);
    setNewAmenity('');
  };

  const handleRemoveAmenity = (category, amenity) => {
    const updatedAmenities = {
      ...data,
      [category]: data[category].filter(a => a !== amenity)
    };
    onChange(updatedAmenities);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Property Amenities
      </Typography>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="warning"
          variant="filled"
          icon={<WarningIcon />}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {Object.entries(AMENITY_CATEGORIES).map(([category, title]) => (
        <Paper key={category} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {title}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {DEFAULT_AMENITIES[category].map((amenity) => (
              <Grid item xs={12} sm={6} md={4} key={amenity}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data[category]?.includes(amenity) || false}
                      onChange={() => handleToggle(category, amenity)}
                    />
                  }
                  label={amenity}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Custom amenities display */}
          <Box sx={{ mb: 2 }}>
            {data[category]?.filter(amenity => !DEFAULT_AMENITIES[category].includes(amenity))
              .map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onDelete={() => handleRemoveAmenity(category, amenity)}
                  color="primary"
                  variant="outlined"
                  sx={{ m: 0.5 }}
                />
              ))}
          </Box>

          {/* Add custom amenity input */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder={`Add custom ${title.toLowerCase()} amenity`}
              value={selectedCategory === category ? newAmenity : ''}
              onChange={(e) => {
                setSelectedCategory(category);
                setNewAmenity(e.target.value);
                setError(null); // Clear error when typing
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomAmenity(category);
                }
              }}
              error={Boolean(error && selectedCategory === category)}
              helperText={error && selectedCategory === category ? error : ''}
            />
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => handleAddCustomAmenity(category)}
              disabled={!newAmenity.trim() || selectedCategory !== category}
            >
              Add
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default AmenitiesForm;

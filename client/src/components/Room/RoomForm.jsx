import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput
} from '@mui/material';

const AMENITIES = [
  'TV', 'Wi-Fi', 'Air Conditioning', 'Mini Fridge', 'Safe', 'Desk',
  'Wardrobe', 'Iron', 'Hair Dryer', 'Coffee Maker'
];

const ACCESSIBILITY_FEATURES = [
  'Wheelchair Accessible', 'Roll-in Shower', 'Grab Bars', 'Wide Doorways',
  'Low Height Bed', 'Visual Aids', 'Audio Aids'
];

const RoomForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    bedType: '',
    bedCount: 1,
    roomSize: '',
    maxOccupancy: 2,
    viewType: '',
    hasPrivateBathroom: true,
    amenities: [],
    smoking: false,
    accessibilityFeatures: [],
    floorLevel: 1,
    hasBalcony: false,
    hasKitchen: false,
    hasMinibar: false,
    hasHeating: true,
    hasCooling: true,
    pricePerNight: '',
    cancellationPolicy: 'moderate',
    includesBreakfast: false,
    extraBedAvailable: false,
    petsAllowed: false,
    cleaningFrequency: 'daily',
    description: '',
    hasToiletries: true,
    hasTowelsLinens: true,
    hasRoomService: false,
    flooringType: '',
    energySavingFeatures: [],
    ...initialData
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (event, field) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">Basic Information</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="name"
            label="Room Name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="type"
            label="Room Type"
            value={formData.type}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="bedType"
            label="Bed Type"
            value={formData.bedType}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            name="bedCount"
            label="Number of Beds"
            value={formData.bedCount}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            name="roomSize"
            label="Room Size (m²)"
            value={formData.roomSize}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            name="maxOccupancy"
            label="Maximum Occupancy"
            value={formData.maxOccupancy}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Features & Amenities</Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Amenities</InputLabel>
            <Select
              multiple
              name="amenities"
              value={formData.amenities}
              onChange={(e) => handleMultiSelectChange(e, 'amenities')}
              input={<OutlinedInput label="Amenities" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {AMENITIES.map((amenity) => (
                <MenuItem key={amenity} value={amenity}>
                  {amenity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Accessibility Features</InputLabel>
            <Select
              multiple
              name="accessibilityFeatures"
              value={formData.accessibilityFeatures}
              onChange={(e) => handleMultiSelectChange(e, 'accessibilityFeatures')}
              input={<OutlinedInput label="Accessibility Features" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {ACCESSIBILITY_FEATURES.map((feature) => (
                <MenuItem key={feature} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Pricing & Policies</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            name="pricePerNight"
            label="Price per Night"
            value={formData.pricePerNight}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Cancellation Policy</InputLabel>
            <Select
              name="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={handleChange}
              label="Cancellation Policy"
            >
              <MenuItem value="flexible">Flexible</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="strict">Strict</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Room Description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Additional Features</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasPrivateBathroom}
                onChange={handleChange}
                name="hasPrivateBathroom"
              />
            }
            label="Private Bathroom"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.smoking}
                onChange={handleChange}
                name="smoking"
              />
            }
            label="Smoking Allowed"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasBalcony}
                onChange={handleChange}
                name="hasBalcony"
              />
            }
            label="Balcony/Patio"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.includesBreakfast}
                onChange={handleChange}
                name="includesBreakfast"
              />
            }
            label="Breakfast Included"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Save Room
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomForm;

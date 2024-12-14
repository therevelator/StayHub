import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  MenuItem,
  Divider,
  FormControlLabel,
  Checkbox,
  FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const BED_TYPES = [
  'Single Bed',
  'Double Bed',
  'Queen Bed',
  'King Bed',
  'Sofa Bed',
  'Bunk Bed',
];

const BATHROOM_TYPES = [
  { value: 'private', label: 'Private Bathroom' },
  { value: 'shared', label: 'Shared Bathroom' },
];

const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Suite',
  'Family Room',
  'Single Room',
  'Double Room',
];

const VIEW_TYPES = [
  'City View',
  'Ocean View',
  'Garden View',
  'Mountain View',
  'Pool View',
  'No View',
];

const CLEANING_FREQUENCIES = [
  'daily',
  'weekly',
  'on_request',
  'before_check_in',
];

const CANCELLATION_POLICIES = [
  'flexible',
  'moderate',
  'strict',
];

const FLOORING_TYPES = [
  'Carpet',
  'Hardwood',
  'Tile',
  'Marble',
  'Laminate',
];

const ROOM_AMENITIES = [
  'Air Conditioning',
  'TV',
  'WiFi',
  'Safe',
  'Mini Fridge',
  'Coffee Maker',
  'Hair Dryer',
  'Iron',
  'Work Desk',
  'Wardrobe',
  'Telephone',
  'Blackout Curtains',
  'USB Outlets',
  'Room Service',
  'Wake-up Service',
];

const RoomForm = ({ room, onSubmit, onDelete, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    room_type: ROOM_TYPES[0],
    beds: [],
    room_size: '',
    max_occupancy: '1',
    view_type: VIEW_TYPES[0],
    has_private_bathroom: true,
    amenities: [],
    smoking: false,
    accessibility_features: [],
    floor_level: 1,
    has_balcony: false,
    has_kitchen: false,
    has_minibar: false,
    climate: {
      hasHeating: true,
      hasCooling: true
    },
    price_per_night: '',
    cancellation_policy: CANCELLATION_POLICIES[0],
    includes_breakfast: false,
    extra_bed_available: false,
    pets_allowed: false,
    images: [],
    cleaning_frequency: CLEANING_FREQUENCIES[0],
    description: '',
    has_toiletries: true,
    has_towels_linens: true,
    has_room_service: false,
    flooring_type: FLOORING_TYPES[0],
    energy_saving_features: [],
    status: 'available'
  });

  useEffect(() => {
    if (room) {
      console.log('Initial room data:', room);
      const beds = Array.isArray(room.beds) ? room.beds : [];
      setFormData({
        name: room.name || '',
        room_type: room.room_type || ROOM_TYPES[0],
        beds: beds,
        room_size: room.room_size?.toString() || '',
        max_occupancy: calculateMaxOccupancy(beds).toString(),
        view_type: room.view_type || VIEW_TYPES[0],
        has_private_bathroom: room.has_private_bathroom ?? true,
        amenities: room.amenities || [],
        smoking: room.smoking ?? false,
        accessibility_features: room.accessibility_features || [],
        floor_level: room.floor_level || 1,
        has_balcony: room.has_balcony ?? false,
        has_kitchen: room.has_kitchen ?? false,
        has_minibar: room.has_minibar ?? false,
        climate: room.climate || { hasHeating: true, hasCooling: true },
        price_per_night: room.price_per_night?.toString() || '',
        cancellation_policy: room.cancellation_policy || CANCELLATION_POLICIES[0],
        includes_breakfast: room.includes_breakfast ?? false,
        extra_bed_available: room.extra_bed_available ?? false,
        pets_allowed: room.pets_allowed ?? false,
        images: room.images || [],
        cleaning_frequency: room.cleaning_frequency || CLEANING_FREQUENCIES[0],
        description: room.description || '',
        has_toiletries: room.has_toiletries ?? true,
        has_towels_linens: room.has_towels_linens ?? true,
        has_room_service: room.has_room_service ?? false,
        flooring_type: room.flooring_type || FLOORING_TYPES[0],
        energy_saving_features: room.energy_saving_features || [],
        status: room.status || 'available'
      });
    }
  }, [room]);

  const calculateMaxOccupancy = (beds) => {
    return beds.reduce((sum, bed) => {
      const occupancy = {
        'Single Bed': 1,
        'Double Bed': 2,
        'Queen Bed': 2,
        'King Bed': 2,
        'Sofa Bed': 1,
        'Bunk Bed': 2
      };
      return sum + (occupancy[bed.type] || 0) * (bed.count || 1);
    }, 0);
  };

  const handleBedChange = (index, field, value) => {
    const newBeds = [...formData.beds];
    if (!newBeds[index]) {
      newBeds[index] = { type: BED_TYPES[0], count: 1 };
    }
    newBeds[index][field] = field === 'count' ? parseInt(value, 10) || 1 : value;
    
    setFormData((prev) => ({
      ...prev,
      beds: newBeds,
      max_occupancy: calculateMaxOccupancy(newBeds).toString()
    }));
  };

  const addBed = () => {
    const newBeds = [...formData.beds, { type: BED_TYPES[0], count: 1 }];
    setFormData((prev) => ({
      ...prev,
      beds: newBeds,
      max_occupancy: calculateMaxOccupancy(newBeds).toString()
    }));
  };

  const removeBed = (index) => {
    const newBeds = formData.beds.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      beds: newBeds,
      max_occupancy: calculateMaxOccupancy(newBeds).toString()
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      const dataToSubmit = {
        ...formData,
        room_size: parseInt(formData.room_size) || null,
        price_per_night: parseFloat(formData.price_per_night) || null,
      };
      
      console.log('Submitting room data:', dataToSubmit);
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Room Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Room Type"
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            required
          >
            {ROOM_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Bed Configuration */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Beds
          </Typography>
          {formData.beds.map((bed, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                select
                label="Bed Type"
                value={bed.type}
                onChange={(e) => handleBedChange(index, 'type', e.target.value)}
                sx={{ flexGrow: 1 }}
              >
                {BED_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Count"
                value={bed.count}
                onChange={(e) => handleBedChange(index, 'count', e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ width: '100px' }}
              />
              <IconButton onClick={() => removeBed(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addBed}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Bed
          </Button>
        </Grid>

        {/* Room Details */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Room Size (sq ft)"
            name="room_size"
            value={formData.room_size}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Max Occupancy"
            name="max_occupancy"
            value={formData.max_occupancy}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />
        </Grid>

        {/* View and Bathroom */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="View Type"
            name="view_type"
            value={formData.view_type}
            onChange={handleChange}
          >
            {VIEW_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Room Amenities
          </Typography>
          <Grid container spacing={2}>
            {ROOM_AMENITIES.map((amenity) => (
              <Grid item xs={6} sm={4} key={amenity}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                  }
                  label={amenity}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Pricing */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Price per Night"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            inputProps={{ min: 0, step: "0.01" }}
          />
        </Grid>

        {/* Policies */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Cancellation Policy"
            name="cancellation_policy"
            value={formData.cancellation_policy}
            onChange={handleChange}
          >
            {CANCELLATION_POLICIES.map((policy) => (
              <MenuItem key={policy} value={policy}>
                {policy.charAt(0).toUpperCase() + policy.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Cleaning Frequency"
            name="cleaning_frequency"
            value={formData.cleaning_frequency}
            onChange={handleChange}
          >
            {CLEANING_FREQUENCIES.map((freq) => (
              <MenuItem key={freq} value={freq}>
                {freq.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Features */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Room Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.has_private_bathroom}
                    onChange={handleChange}
                    name="has_private_bathroom"
                  />
                }
                label="Private Bathroom"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.has_balcony}
                    onChange={handleChange}
                    name="has_balcony"
                  />
                }
                label="Balcony"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.has_kitchen}
                    onChange={handleChange}
                    name="has_kitchen"
                  />
                }
                label="Kitchen"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.has_minibar}
                    onChange={handleChange}
                    name="has_minibar"
                  />
                }
                label="Minibar"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includes_breakfast}
                    onChange={handleChange}
                    name="includes_breakfast"
                  />
                }
                label="Breakfast Included"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.extra_bed_available}
                    onChange={handleChange}
                    name="extra_bed_available"
                  />
                }
                label="Extra Bed Available"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.pets_allowed}
                    onChange={handleChange}
                    name="pets_allowed"
                  />
                }
                label="Pets Allowed"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.smoking}
                    onChange={handleChange}
                    name="smoking"
                  />
                }
                label="Smoking Allowed"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Grid>

        {/* Submit Buttons */}
        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {isEditing && room.id ? 'Update Room' : 'Save Room'}
          </Button>
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={onDelete}
              startIcon={<DeleteIcon />}
            >
              Delete Room
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomForm;

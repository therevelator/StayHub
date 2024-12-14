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

const RoomEditForm = ({ room, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    beds: [],
    max_occupancy: 1,
    base_price: '',
    cleaning_fee: '',
    service_fee: '',
    tax_rate: '',
    security_deposit: '',
    description: '',
    bathroom_type: 'private',
  });

  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        beds: Array.isArray(room.beds) ? room.beds : [],
        base_price: room.base_price?.toString() || '',
        cleaning_fee: room.cleaning_fee?.toString() || '',
        service_fee: room.service_fee?.toString() || '',
        tax_rate: room.tax_rate?.toString() || '',
        security_deposit: room.security_deposit?.toString() || '',
        max_occupancy: room.max_occupancy?.toString() || '1',
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBedChange = (index, field, value) => {
    const newBeds = [...formData.beds];
    if (!newBeds[index]) {
      newBeds[index] = { type: '', count: 1 };
    }
    newBeds[index][field] = field === 'count' ? parseInt(value, 10) || 1 : value;
    setFormData((prev) => ({
      ...prev,
      beds: newBeds,
    }));
  };

  const addBed = () => {
    setFormData((prev) => ({
      ...prev,
      beds: [...prev.beds, { type: BED_TYPES[0], count: 1 }],
    }));
  };

  const removeBed = (index) => {
    setFormData((prev) => ({
      ...prev,
      beds: prev.beds.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // Convert string values to numbers for the API
    const dataToSubmit = {
      ...formData,
      base_price: parseFloat(formData.base_price) || 0,
      cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
      service_fee: parseFloat(formData.service_fee) || 0,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      security_deposit: parseFloat(formData.security_deposit) || 0,
      max_occupancy: parseInt(formData.max_occupancy, 10) || 1,
    };
    onUpdate(dataToSubmit);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{formData.name || 'Edit Room'}</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete Room
        </Button>
      </Box>

      <Grid container spacing={3}>
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
            select
            fullWidth
            label="Room Type"
            name="type"
            value={formData.type}
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

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Beds
          </Typography>
          {formData.beds.map((bed, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Bed Type"
                value={bed.type}
                onChange={(e) => handleBedChange(index, 'type', e.target.value)}
                sx={{ minWidth: 200 }}
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
                sx={{ width: 100 }}
              />
              <IconButton onClick={() => removeBed(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addBed}>
            Add Bed
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Base Price"
            name="base_price"
            value={formData.base_price}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Cleaning Fee"
            name="cleaning_fee"
            value={formData.cleaning_fee}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Service Fee"
            name="service_fee"
            value={formData.service_fee}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Tax Rate (%)"
            name="tax_rate"
            value={formData.tax_rate}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Security Deposit"
            name="security_deposit"
            value={formData.security_deposit}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
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
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Bathroom Type"
            name="bathroom_type"
            value={formData.bathroom_type}
            onChange={handleChange}
          >
            {BATHROOM_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomEditForm;

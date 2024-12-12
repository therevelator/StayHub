import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const roomTypes = [
  'Single Room',
  'Double Room',
  'Suite',
  'Deluxe Room',
  'Studio',
  'Apartment'
];

const bedTypes = [
  'Single Bed',
  'Double Bed',
  'Queen Bed',
  'King Bed',
  'Sofa Bed',
  'Bunk Bed'
];

const RoomForm = ({ data = [], onChange }) => {
  const handleAddRoom = () => {
    onChange([
      ...data,
      {
        name: '',
        type: '',
        beds: [],
        maxOccupancy: 1,
        basePrice: '',
        description: ''
      }
    ]);
  };

  const handleAddBed = (roomIndex) => {
    const updatedRooms = data.map((room, i) => {
      if (i === roomIndex) {
        return {
          ...room,
          beds: [
            ...(room.beds || []),
            { type: '', count: 1 }
          ]
        };
      }
      return room;
    });
    onChange(updatedRooms);
  };

  const handleBedChange = (roomIndex, bedIndex, field, value) => {
    const updatedRooms = data.map((room, i) => {
      if (i === roomIndex) {
        const updatedBeds = (room.beds || []).map((bed, j) => {
          if (j === bedIndex) {
            return { ...bed, [field]: value };
          }
          return bed;
        });
        return { ...room, beds: updatedBeds };
      }
      return room;
    });
    onChange(updatedRooms);
  };

  const handleRemoveBed = (roomIndex, bedIndex) => {
    const updatedRooms = data.map((room, i) => {
      if (i === roomIndex) {
        return {
          ...room,
          beds: (room.beds || []).filter((_, j) => j !== bedIndex)
        };
      }
      return room;
    });
    onChange(updatedRooms);
  };

  const handleRemoveRoom = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = data.map((room, i) => {
      if (i === index) {
        return { ...room, [field]: value };
      }
      return room;
    });
    onChange(updatedRooms);
  };

  // Calculate total occupancy based on bed types
  const calculateOccupancy = (beds) => {
    return beds.reduce((total, bed) => {
      const occupancy = {
        'Single Bed': 1,
        'Double Bed': 2,
        'Queen Bed': 2,
        'King Bed': 2,
        'Sofa Bed': 1,
        'Bunk Bed': 2
      };
      return total + (occupancy[bed.type] || 0) * bed.count;
    }, 0);
  };

  const calculateTotalPrice = (room) => {
    const basePrice = Number(room.basePrice || room.base_price || 0);
    const cleaningFee = Number(room.cleaningFee || room.cleaning_fee || 0);
    const serviceFee = Number(room.serviceFee || room.service_fee || 0);
    const taxRate = Number(room.taxRate || room.tax_rate || 0);

    const subtotal = basePrice + cleaningFee + serviceFee;
    const taxAmount = subtotal * taxRate / 100;
    return subtotal + taxAmount;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rooms
      </Typography>
      
      {data.map((room, roomIndex) => (
        <Paper key={roomIndex} sx={{ p: 3, mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Name"
                  value={room.name || ''}
                  onChange={(e) => handleRoomChange(roomIndex, 'name', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Room Type"
                  value={room.type || room.room_type || ''}
                  onChange={(e) => handleRoomChange(roomIndex, 'type', e.target.value)}
                >
                  {roomTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Beds in this room
                </Typography>
                <List>
                  {(room.beds || []).map((bed, bedIndex) => (
                    <ListItem key={bedIndex}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            select
                            label="Bed Type"
                            value={bed.type || ''}
                            onChange={(e) => handleBedChange(roomIndex, bedIndex, 'type', e.target.value)}
                          >
                            {bedTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Count"
                            value={bed.count || 1}
                            onChange={(e) => handleBedChange(roomIndex, bedIndex, 'count', parseInt(e.target.value) || 1)}
                            InputProps={{ inputProps: { min: 1 } }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveBed(roomIndex, bedIndex)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddBed(roomIndex)}
                  sx={{ mt: 1 }}
                >
                  Add Bed
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Occupancy"
                  value={calculateOccupancy(room.beds || [])}
                  disabled
                  helperText="Calculated based on bed types"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Room Pricing
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Base Price per Night"
                        value={room.basePrice || room.base_price || ''}
                        onChange={(e) => handleRoomChange(roomIndex, 'basePrice', e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Total with fees: ${calculateTotalPrice(room).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cleaning Fee"
                      value={room.cleaningFee || room.cleaning_fee || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'cleaningFee', e.target.value)}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Service Fee"
                      value={room.serviceFee || room.service_fee || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'serviceFee', e.target.value)}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax Rate (%)"
                      value={room.taxRate || room.tax_rate || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'taxRate', e.target.value)}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Room Description"
                  value={room.description}
                  onChange={(e) => handleRoomChange(roomIndex, 'description', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveRoom(roomIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        onClick={handleAddRoom}
        sx={{ mt: 2 }}
      >
        Add Room
      </Button>
    </Box>
  );
};

export default RoomForm;

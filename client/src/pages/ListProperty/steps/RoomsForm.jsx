import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RoomForm from './RoomForm';

export const RoomsForm = ({ data = [], onChange }) => {
  const handleAddRoom = () => {
    const newRoom = {
      name: '',
      type: 'standard room',
      beds: [],
      maxOccupancy: 2,
      basePrice: '',
      cleaningFee: '',
      serviceFee: '',
      taxRate: '',
      description: '',
      amenities: []
    };
    
    onChange([...data, newRoom]);
  };

  const handleUpdateRoom = (index, updatedRoom) => {
    const updatedRooms = [...data];
    updatedRooms[index] = updatedRoom;
    onChange(updatedRooms);
  };

  const handleDeleteRoom = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rooms
      </Typography>

      {Array.isArray(data) && data.map((room, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <RoomForm
            room={room}
            onUpdate={(updatedRoom) => handleUpdateRoom(index, updatedRoom)}
            onDelete={() => handleDeleteRoom(index)}
          />
        </Box>
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
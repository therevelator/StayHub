import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const roomTypes = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Suite',
  'Studio',
  'Apartment',
  'Villa',
];

const bedTypes = [
  'Single Bed',
  'Double Bed',
  'Queen Bed',
  'King Bed',
  'Twin Beds',
  'Sofa Bed',
];

const RoomForm = ({ rooms = [], onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentRoom, setCurrentRoom] = useState({
    name: '',
    type: '',
    bedType: '',
    maxOccupancy: '',
    basePrice: '',
    description: '',
  });

  const handleOpenDialog = (index) => {
    if (index !== undefined) {
      setCurrentRoom(rooms[index]);
      setEditingIndex(index);
    } else {
      setCurrentRoom({
        name: '',
        type: '',
        bedType: '',
        maxOccupancy: '',
        basePrice: '',
        description: '',
      });
      setEditingIndex(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
    setCurrentRoom({
      name: '',
      type: '',
      bedType: '',
      maxOccupancy: '',
      basePrice: '',
      description: '',
    });
  };

  const handleSaveRoom = () => {
    // Validate required fields
    if (!currentRoom.name || !currentRoom.type || !currentRoom.bedType || !currentRoom.maxOccupancy) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedRooms = [...rooms];
    if (editingIndex !== null) {
      updatedRooms[editingIndex] = currentRoom;
    } else {
      updatedRooms.push(currentRoom);
    }
    
    onChange(updatedRooms);
    handleCloseDialog();
  };

  const handleDeleteRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    onChange(updatedRooms);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Rooms</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Room
        </Button>
      </Box>

      {rooms.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>
          No rooms added yet. Click "Add Room" to get started.
        </Typography>
      ) : (
        <List>
          {rooms.map((room, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleOpenDialog(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteRoom(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={room.name}
                secondary={`${room.type} - ${room.bedType} - Max Occupancy: ${room.maxOccupancy}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Room Name"
              value={currentRoom.name}
              onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Room Type"
              value={currentRoom.type}
              onChange={(e) => setCurrentRoom({ ...currentRoom, type: e.target.value })}
              margin="normal"
              required
            >
              {roomTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Bed Type"
              value={currentRoom.bedType}
              onChange={(e) => setCurrentRoom({ ...currentRoom, bedType: e.target.value })}
              margin="normal"
              required
            >
              {bedTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Maximum Occupancy"
              type="number"
              value={currentRoom.maxOccupancy}
              onChange={(e) => setCurrentRoom({ ...currentRoom, maxOccupancy: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              label="Base Price per Night"
              type="number"
              value={currentRoom.basePrice}
              onChange={(e) => setCurrentRoom({ ...currentRoom, basePrice: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              label="Room Description"
              value={currentRoom.description}
              onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveRoom} variant="contained">
            Save Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomForm;

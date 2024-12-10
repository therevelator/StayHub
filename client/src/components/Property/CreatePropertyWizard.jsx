import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import PropertyForm from './PropertyForm';
import RoomForm from '../Room/RoomForm';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const steps = ['Property Details', 'Rooms', 'Review'];

const CreatePropertyWizard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [propertyData, setPropertyData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);

  const handlePropertySubmit = async (data) => {
    setPropertyData(data);
    setActiveStep(1);
  };

  const handleRoomSubmit = (roomData) => {
    if (editingRoomIndex !== null) {
      // Edit existing room
      const updatedRooms = [...rooms];
      updatedRooms[editingRoomIndex] = roomData;
      setRooms(updatedRooms);
      setEditingRoomIndex(null);
    } else {
      // Add new room
      setRooms([...rooms, roomData]);
    }
    setEditingRoom(null);
    setIsRoomDialogOpen(false);
  };

  const handleEditRoom = (index) => {
    setEditingRoom(rooms[index]);
    setEditingRoomIndex(index);
    setIsRoomDialogOpen(true);
  };

  const handleDeleteRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleFinish = async () => {
    try {
      // Combine property data with rooms
      const finalPropertyData = {
        ...propertyData,
        rooms: rooms
      };

      // Create property with rooms in a single request
      const response = await api.post('/properties', finalPropertyData);
      
      if (response.data.status === 'success') {
        navigate('/properties');
      } else {
        console.error('Error response:', response.data);
      }
    } catch (error) {
      console.error('Error creating property:', error.response?.data || error.message);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PropertyForm onSubmit={handlePropertySubmit} initialData={propertyData} />;
      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Rooms</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingRoom(null);
                  setEditingRoomIndex(null);
                  setIsRoomDialogOpen(true);
                }}
              >
                Add Room
              </Button>
            </Box>
            <List>
              {rooms.map((room, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleEditRoom(index)}>
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
            {rooms.length > 0 && (
              <Box mt={2}>
                <Button variant="contained" onClick={handleNext}>
                  Continue to Review
                </Button>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Property Details
            </Typography>
            <Typography variant="body1" paragraph>
              {propertyData.name} - {propertyData.type}
            </Typography>
            <Typography variant="body2" paragraph>
              {propertyData.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Rooms ({rooms.length})
            </Typography>
            {rooms.map((room, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1">
                  {room.name} - ${room.pricePerNight} per night
                </Typography>
                <Typography variant="body2">
                  Type: {room.type}, Bed: {room.bedType}, Max Occupancy: {room.maxOccupancy}
                </Typography>
              </Box>
            ))}
            
            <Box mt={2}>
              <Button variant="contained" onClick={handleFinish}>
                Create Property
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Dialog
          open={isRoomDialogOpen}
          onClose={() => setIsRoomDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
          <DialogContent>
            <RoomForm
              onSubmit={handleRoomSubmit}
              initialData={editingRoom}
            />
          </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CreatePropertyWizard;

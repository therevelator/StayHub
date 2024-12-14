import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
} from '@mui/material';
import RoomEditForm from './components/RoomEditForm';
import api from '../../services/api';

const EditRooms = () => {
  const { propertyId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/properties/${propertyId}/rooms`);
      console.log('Rooms response:', response.data);
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchRooms();
    }
  }, [propertyId]);

  const handleRoomUpdate = async (roomId, updatedData) => {
    try {
      setError(null);
      const response = await api.put(`/api/rooms/${roomId}`, updatedData);
      if (response.data.status === 'success') {
        await fetchRooms(); // Refresh the rooms list
      }
    } catch (err) {
      console.error('Error updating room:', err);
      setError(err.message);
    }
  };

  const handleRoomDelete = async (roomId) => {
    try {
      setError(null);
      const response = await api.delete(`/api/rooms/${roomId}`);
      if (response.data.status === 'success') {
        await fetchRooms(); // Refresh the rooms list
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Rooms
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {rooms.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No rooms found for this property.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {rooms.map((room) => (
              <Paper key={room.id} sx={{ p: 3 }}>
                <RoomEditForm
                  room={room}
                  onUpdate={(data) => handleRoomUpdate(room.id, data)}
                  onDelete={() => handleRoomDelete(room.id)}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EditRooms;

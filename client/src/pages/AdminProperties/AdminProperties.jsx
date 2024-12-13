import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';

const AdminProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties...');
      const response = await api.get('/properties');
      console.log('Properties response:', response.data);
      if (response.data.status === 'success') {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/admin/properties/${propertyId}/edit`);
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/properties/${propertyToDelete.id}`);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      // Refresh the properties list
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await api.patch(`/properties/${propertyId}/status`, {
        is_active: newStatus === 1
      });
      
      // Update local state
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, is_active: newStatus }
          : property
      ));
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  // Only show delete button if user is admin
  const showDeleteButton = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">Properties</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{`${property.city}, ${property.country}`}</TableCell>
                  <TableCell>{property.property_type}</TableCell>
                  <TableCell>{property.host_email}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={property.is_active ? 1 : 0}
                      onChange={(e) => handleStatusChange(property.id, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                          Active
                        </Box>
                      </MenuItem>
                      <MenuItem value={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          Inactive
                        </Box>
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(property.id)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    {showDeleteButton && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(property)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the property "{propertyToDelete?.name}"? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminProperties; 
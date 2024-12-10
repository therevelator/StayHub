import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties...');
        const response = await api.get('/properties');
        console.log('Properties response:', response.data);
        
        if (response.data.status === 'success') {
          setProperties(response.data.data);
        } else {
          throw new Error('Failed to load properties');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(error.message || 'Failed to load properties');
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.isAdmin) {
      fetchProperties();
    }
  }, [isAuthenticated, user]);

  const handleEdit = (propertyId) => {
    navigate(`/admin/properties/${propertyId}/edit`);
  };

  if (!isAuthenticated) {
    return <Alert severity="error">Please sign in to access this page.</Alert>;
  }

  if (!user?.isAdmin) {
    return <Alert severity="error">Access denied. Admin privileges required.</Alert>;
  }

  if (loading) {
    return <Alert severity="info">Loading properties...</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Properties
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.id}</TableCell>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{`${property.city}, ${property.country}`}</TableCell>
                  <TableCell>{property.property_type}</TableCell>
                  <TableCell>${property.price}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(property.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminProperties; 
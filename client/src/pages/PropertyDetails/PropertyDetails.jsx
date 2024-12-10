import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ImageList,
  ImageListItem,
  Rating,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import WifiIcon from '@mui/icons-material/Wifi';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        console.log('Property data:', data);
        console.log('Current user:', user);
        setProperty(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user]);

  const handleEdit = () => {
    navigate(`/properties/${id}/edit`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!property) return null;

  // Convert both IDs to strings for comparison
  const isOwner = user && String(user.userId) === String(property.host_id);
  console.log('Is owner check:', { 
    userId: user?.userId, 
    userIdType: user?.userId ? typeof user.userId : 'undefined',
    hostId: property.host_id,
    hostIdType: property.host_id ? typeof property.host_id : 'undefined',
    isOwner 
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {property.name}
        </Typography>
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Property
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Images */}
          <Grid item xs={12}>
            <ImageList cols={3} gap={8}>
              {Array.isArray(property.images) ? property.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image.url}
                    alt={`Property image ${index + 1}`}
                    loading="lazy"
                    style={{ height: 200, width: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              )) : null}
            </ImageList>
          </Grid>

          {/* Basic Info */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              About this place
            </Typography>
            <Typography paragraph>
              {property.description}
            </Typography>

            {property.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={parseFloat(property.rating)} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({parseFloat(property.rating).toFixed(1)} / 5)
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PeopleIcon />
                    <Typography>{property.guests} guests</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BedIcon />
                    <Typography>{property.bedrooms} bedrooms</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BedIcon />
                    <Typography>{property.beds} beds</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BathtubIcon />
                    <Typography>{property.bathrooms} baths</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Pricing and Location */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ${property.price} <Typography component="span" variant="body2">per night</Typography>
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                <Typography component="span">
                  {property.street}, {property.city}, {property.country}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Grid container spacing={2}>
                {property.amenities.map((amenity, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <WifiIcon />
                      </ListItemIcon>
                      <ListItemText primary={amenity} />
                    </ListItem>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* House Rules */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              House Rules
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Check-in" 
                  secondary={property.check_in_time || 'Flexible'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Check-out" 
                  secondary={property.check_out_time || 'Flexible'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Cancellation Policy" 
                  secondary={property.cancellation_policy || 'Flexible'} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PropertyDetails;

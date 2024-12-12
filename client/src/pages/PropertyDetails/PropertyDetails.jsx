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
  Card,
  CardContent,
  IconButton,
  ImageList,
  ImageListItem,
  Rating,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import api from '../../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        if (response.data.status === 'success') {
          setProperty(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleEdit = () => {
    navigate(`/properties/${id}/edit`);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const calculateRoomTotalPrice = (room) => {
    const basePrice = Number(room.base_price) || 0;
    const cleaningFee = Number(room.cleaning_fee) || 0;
    const serviceFee = Number(room.service_fee) || 0;
    const taxRate = Number(room.tax_rate) || 0;
    
    const subtotal = basePrice + cleaningFee + serviceFee;
    const taxAmount = subtotal * taxRate / 100;
    return subtotal + taxAmount;
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

  const isOwner = user && String(user.userId) === String(property.host_id);
  const hasImages = property.images && property.images.length > 0;

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

      {/* Image Slideshow */}
      {hasImages && (
        <Box sx={{ position: 'relative', mb: 4, height: '400px' }}>
          <Box
            component="img"
            src={property.images[currentImageIndex]?.url || 'default-property-image.jpg'}
            alt={`Property image ${currentImageIndex + 1}`}
            sx={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: 2,
            }}
          />
          {property.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
              >
                <ArrowBack />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
              >
                <ArrowForward />
              </IconButton>
            </>
          )}
        </Box>
      )}

      {/* Property Details */}
      <Grid container spacing={4}>
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
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Available Rooms */}
      <Typography variant="h5" gutterBottom>
        Available Rooms
      </Typography>
      <Grid container spacing={3}>
        {property.rooms?.map((room) => {
          const totalPrice = calculateRoomTotalPrice(room);
          
          return (
            <Grid item xs={12} md={6} key={room.id}>
              <Card sx={{ 
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {room.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {room.room_type} • Max Occupancy: {room.max_occupancy}
                  </Typography>
                  
                  {/* Beds */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Beds:
                    </Typography>
                    {Array.isArray(room.beds) 
                      ? room.beds.map((bed, index) => (
                          <Typography key={index} variant="body2">
                            {bed.count}x {bed.type}
                          </Typography>
                        ))
                      : typeof room.beds === 'string'
                        ? JSON.parse(room.beds).map((bed, index) => (
                            <Typography key={index} variant="body2">
                              {bed.count}x {bed.type}
                            </Typography>
                          ))
                        : null
                    }
                  </Box>

                  {/* Price Breakdown */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${totalPrice.toFixed(2)} / night
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Includes all fees and taxes
                    </Typography>
                  </Box>

                  {/* Room Description */}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {room.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PropertyDetails;

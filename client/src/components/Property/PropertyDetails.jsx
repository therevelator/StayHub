import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  LocationOn,
  Person,
  Hotel,
  Restaurant,
  Wifi,
  LocalParking,
  Pool,
  Spa,
  FitnessCenter,
} from '@mui/icons-material';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      }
    };
    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (!property) {
    return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;
  }

  const amenityIcons = {
    'Free WiFi': <Wifi />,
    'Parking': <LocalParking />,
    'Pool': <Pool />,
    'Spa': <Spa />,
    'Fitness Center': <FitnessCenter />,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Property Title and Rating */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {property.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={property.rating} readOnly precision={0.5} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({property.rating} rating)
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            <LocationOn sx={{ fontSize: 'small', verticalAlign: 'middle' }} />
            {property.location}
          </Typography>
        </Box>
      </Box>

      {/* Property Images */}
      <ImageList
        sx={{ width: '100%', height: 450, mb: 4 }}
        variant="quilted"
        cols={4}
        rowHeight={225}
      >
        {property.images?.map((image, index) => (
          <ImageListItem
            key={index}
            cols={index === 0 ? 2 : 1}
            rows={index === 0 ? 2 : 1}
          >
            <img
              src={image}
              alt={`Property view ${index + 1}`}
              loading="lazy"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Grid container spacing={4}>
        {/* Left Column - Property Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About this place
            </Typography>
            <Typography paragraph>
              {property.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Room Types */}
            <Typography variant="h6" gutterBottom>
              Room Types Available
            </Typography>
            <List>
              {property.roomTypes?.map((room, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Hotel />
                  </ListItemIcon>
                  <ListItemText
                    primary={room.name}
                    secondary={`From $${room.price} per night • Max ${room.maxGuests} guests`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Amenities */}
            <Typography variant="h6" gutterBottom>
              What this place offers
            </Typography>
            <Grid container spacing={2}>
              {property.amenities?.map((amenity, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {amenityIcons[amenity] || <Hotel />}
                    <Typography sx={{ ml: 1 }}>{amenity}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Rooms
              </Typography>
              {property.rooms && property.rooms.length > 0 ? (
                <Grid container spacing={3}>
                  {property.rooms.map((room, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {room.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {room.description}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Room Type:</strong> {room.room_type}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Bed Type:</strong> {room.bed_type}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Max Occupancy:</strong> {room.max_occupancy} guests
                          </Typography>
                          <Typography variant="body2">
                            <strong>Price per Night:</strong> ${room.base_price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No rooms information available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Booking Widget */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>
              ${property.price_per_night}
              <Typography component="span" variant="body2" color="text.secondary">
                {' '}/ night
              </Typography>
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
                <DatePicker
                  label="Check-in"
                  value={checkIn}
                  onChange={setCheckIn}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
                <DatePicker
                  label="Check-out"
                  value={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn || dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Guests
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >
                  -
                </Button>
                <Typography sx={{ mx: 2 }}>
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                >
                  +
                </Button>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Reserve
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                You won't be charged yet
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetails;

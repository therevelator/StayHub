import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import BasicInfoForm from './steps/BasicInfoForm';
import LocationForm from './steps/LocationForm';
import AmenitiesForm from './steps/AmenitiesForm';
import RoomForm from './steps/RoomForm';
import PhotosForm from './steps/PhotosForm';
import RulesForm from './steps/RulesForm';

const steps = [
  'Basic Information',
  'Location',
  'Amenities',
  'Rooms',
  'Photos',
  'Rules & Policies'
];

const ListProperty = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {
      name: '',
      description: '',
      propertyType: '',
      guests: '0',
      bedrooms: '',
      beds: '',
      bathrooms: ''
    },
    location: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      coordinates: null
    },
    amenities: {
      general: [],
      room: [],
      bathroom: [],
      kitchen: [],
      outdoor: [],
      accessibility: []
    },
    rooms: [],
    photos: [],
    rules: {
      checkInTime: null,
      checkOutTime: null,
      cancellationPolicy: '',
      houseRules: []
    }
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.location.coordinates) {
        throw new Error('Location coordinates are missing');
      }

      const totalGuests = formData.rooms.reduce((sum, room) => {
        return sum + room.beds.reduce((bedSum, bed) => {
          const occupancy = {
            'Single Bed': 1,
            'Double Bed': 2,
            'Queen Bed': 2,
            'King Bed': 2,
            'Sofa Bed': 1,
            'Bunk Bed': 2
          };
          return bedSum + (occupancy[bed.type] || 0) * (bed.count || 1);
        }, 0);
      }, 0);

      const propertyData = {
        ...formData,
        basicInfo: {
          ...formData.basicInfo,
          guests: totalGuests.toString()
        }
      };

      const response = await api.post('/properties', propertyData);
      
      if (response.status === 201 && response.data.data.id) {
        console.log('Property created successfully:', response.data);
        navigate(`/admin/properties`);
      } else {
        throw new Error('Failed to create property - no ID returned');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert(error.message || 'Error creating property. Please try again.');
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm
            data={formData.basicInfo}
            onChange={(data) => setFormData(prev => ({ ...prev, basicInfo: data }))}
          />
        );
      case 1:
        return (
          <LocationForm
            data={formData.location}
            onChange={(data) => setFormData(prev => ({ ...prev, location: data }))}
          />
        );
      case 2:
        return (
          <AmenitiesForm
            data={formData.amenities}
            onChange={(data) => setFormData(prev => ({ ...prev, amenities: data }))}
          />
        );
      case 3:
        return (
          <RoomForm
            data={formData.rooms}
            onChange={(data) => {
              const totalGuests = data.reduce((sum, room) => {
                return sum + room.beds.reduce((bedSum, bed) => {
                  const occupancy = {
                    'Single Bed': 1,
                    'Double Bed': 2,
                    'Queen Bed': 2,
                    'King Bed': 2,
                    'Sofa Bed': 1,
                    'Bunk Bed': 2
                  };
                  return bedSum + (occupancy[bed.type] || 0) * (bed.count || 1);
                }, 0);
              }, 0);
              
              setFormData(prev => ({
                ...prev,
                rooms: data,
                basicInfo: {
                  ...prev.basicInfo,
                  guests: totalGuests.toString()
                }
              }));
            }}
          />
        );
      case 4:
        return (
          <PhotosForm
            data={formData.photos}
            onChange={(data) => setFormData(prev => ({ ...prev, photos: data }))}
          />
        );
      case 5:
        return (
          <RulesForm
            data={formData.rules}
            onChange={(data) => setFormData(prev => ({ ...prev, rules: data }))}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          List Your Property
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ListProperty;

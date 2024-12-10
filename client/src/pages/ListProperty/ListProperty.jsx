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
import PricingForm from './steps/PricingForm';
import RulesForm from './steps/RulesForm';

const steps = [
  'Basic Information',
  'Location',
  'Amenities',
  'Rooms',
  'Photos',
  'Pricing',
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
      guests: '',
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
    amenities: [],
    rooms: [],
    photos: [],
    pricing: {
      price: ''
    },
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
      // Check if we have coordinates
      if (!formData.location.coordinates) {
        throw new Error('Location coordinates are missing. Please select a valid address.');
      }

      const propertyData = {
        ...formData,
        location: {
          ...formData.location,
          latitude: formData.location.coordinates.lat,
          longitude: formData.location.coordinates.lng
        }
      };

      const response = await api.post('/properties', propertyData);
      
      if (response.status === 201) {
        navigate(`/properties/${response.data.data.id}`);
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
            rooms={formData.rooms}
            onChange={(rooms) => setFormData(prev => ({ ...prev, rooms }))}
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
          <PricingForm
            data={formData.pricing}
            onChange={(data) => setFormData(prev => ({ ...prev, pricing: data }))}
          />
        );
      case 6:
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

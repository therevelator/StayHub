import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import PhotosForm from './steps/PhotosForm';
import PricingForm from './steps/PricingForm';
import RulesForm from './steps/RulesForm';

const steps = [
  'Basic Information',
  'Location',
  'Amenities',
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
      starRating: null,
      languages: [],
    },
    location: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: null,
      longitude: null,
    },
    amenities: {
      general: [],
      room: [],
      bathroom: [],
      kitchen: [],
      outdoor: [],
      accessibility: [],
    },
    photos: [],
    pricing: {
      basePrice: '',
      cleaningFee: '',
      serviceFee: '',
      taxRate: '',
      securityDeposit: '',
    },
    rules: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'moderate',
      houseRules: [],
      petPolicy: '',
      eventPolicy: '',
    },
  });

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/list-property' } });
    }
  }, [isAuthenticated, navigate]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormChange = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          hostId: user.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/properties/${result.id}`);
      } else {
        throw new Error('Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      // Handle error (show notification, etc.)
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm
            data={formData.basicInfo}
            onChange={(data) => handleFormChange('basicInfo', data)}
          />
        );
      case 1:
        return (
          <LocationForm
            data={formData.location}
            onChange={(data) => handleFormChange('location', data)}
          />
        );
      case 2:
        return (
          <AmenitiesForm
            data={formData.amenities}
            onChange={(data) => handleFormChange('amenities', data)}
          />
        );
      case 3:
        return (
          <PhotosForm
            data={formData.photos}
            onChange={(data) => handleFormChange('photos', data)}
          />
        );
      case 4:
        return (
          <PricingForm
            data={formData.pricing}
            onChange={(data) => handleFormChange('pricing', data)}
          />
        );
      case 5:
        return (
          <RulesForm
            data={formData.rules}
            onChange={(data) => handleFormChange('rules', data)}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          List Your Property
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you're ready to list your property!
              </Typography>
              <Button onClick={handleSubmit} variant="contained" sx={{ mt: 3 }}>
                List Property
              </Button>
            </Box>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ListProperty;

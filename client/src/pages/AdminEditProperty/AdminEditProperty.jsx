import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  CircularProgress
} from '@mui/material';

import BasicInfoForm from '../ListProperty/steps/BasicInfoForm';
import LocationForm from '../ListProperty/steps/LocationForm';
import AmenitiesForm from '../ListProperty/steps/AmenitiesForm';
import PhotosForm from '../ListProperty/steps/PhotosForm';
import PricingForm from '../ListProperty/steps/PricingForm';
import RulesForm from '../ListProperty/steps/RulesForm';

const steps = [
  'Basic Information',
  'Location',
  'Amenities',
  'Photos',
  'Pricing',
  'Rules & Policies'
];

const AdminEditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        if (response.data.status === 'success') {
          setFormData(response.data.data);
        } else {
          throw new Error('Failed to load property data');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Ensure we have coordinates
      if (!formData.location.coordinates) {
        throw new Error('Location coordinates are missing');
      }

      const response = await api.put(`/properties/${id}`, formData);
      
      if (response.status === 200) {
        navigate('/admin/properties');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert(error.message || 'Error updating property. Please try again.');
    }
  };

  const getStepContent = (step) => {
    if (!formData) return null;

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
          <PhotosForm
            data={formData.photos}
            onChange={(data) => setFormData(prev => ({ ...prev, photos: data }))}
          />
        );
      case 4:
        return (
          <PricingForm
            data={formData.pricing}
            onChange={(data) => setFormData(prev => ({ ...prev, pricing: data }))}
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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Property not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Property
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
            {activeStep === steps.length - 1 ? 'Save Changes' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminEditProperty; 
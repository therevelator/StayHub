import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress,
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

const EditProperty = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        const property = await response.json();
        
        // Transform the flat property data into the nested structure expected by the forms
        setFormData({
          basicInfo: {
            name: property.name,
            description: property.description,
            propertyType: property.property_type,
            guests: property.guests,
            bedrooms: property.bedrooms,
            beds: property.beds,
            bathrooms: property.bathrooms,
          },
          location: {
            street: property.street,
            city: property.city,
            state: property.state,
            country: property.country,
            postalCode: property.postal_code,
            latitude: property.latitude,
            longitude: property.longitude,
          },
          amenities: {
            general: property.amenities?.filter(a => a.category === 'general') || [],
            room: property.amenities?.filter(a => a.category === 'room') || [],
            bathroom: property.amenities?.filter(a => a.category === 'bathroom') || [],
            kitchen: property.amenities?.filter(a => a.category === 'kitchen') || [],
            outdoor: property.amenities?.filter(a => a.category === 'outdoor') || [],
            accessibility: property.amenities?.filter(a => a.category === 'accessibility') || [],
          },
          photos: property.images || [],
          pricing: {
            basePrice: property.price.toString(),
            cleaningFee: property.cleaning_fee?.toString() || '',
            serviceFee: property.service_fee?.toString() || '',
            taxRate: property.tax_rate?.toString() || '',
            securityDeposit: property.security_deposit?.toString() || '',
          },
          rules: {
            checkInTime: property.check_in_time || '15:00',
            checkOutTime: property.check_out_time || '11:00',
            cancellationPolicy: property.cancellation_policy || 'moderate',
            houseRules: property.rules || [],
            petPolicy: property.pet_policy || '',
            eventPolicy: property.event_policy || '',
          },
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property data');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProperty();
    } else {
      navigate('/signin', { state: { from: `/properties/${id}/edit` } });
    }
  }, [id, isAuthenticated, navigate]);

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
      const response = await fetch(`http://localhost:5001/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/properties/${result.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      setError(error.message);
    }
  };

  const getStepContent = (step) => {
    if (!formData) return null;

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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Your Property
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
                All steps completed - you're ready to save your changes!
              </Typography>
              <Button onClick={handleSubmit} variant="contained" sx={{ mt: 3 }}>
                Save Changes
              </Button>
            </Box>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
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
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProperty;

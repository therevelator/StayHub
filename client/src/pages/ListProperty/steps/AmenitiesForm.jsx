import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const amenitiesData = {
  general: [
    'Free WiFi',
    'Air Conditioning',
    'Heating',
    'Elevator',
    'Parking',
    'Reception 24/7',
    'Luggage Storage',
    'Security',
  ],
  room: [
    'TV',
    'Safe',
    'Mini Bar',
    'Desk',
    'Wardrobe',
    'Iron',
    'Balcony',
    'City View',
  ],
  bathroom: [
    'Private Bathroom',
    'Shower',
    'Bathtub',
    'Hair Dryer',
    'Toiletries',
    'Washing Machine',
  ],
  kitchen: [
    'Full Kitchen',
    'Microwave',
    'Refrigerator',
    'Dishwasher',
    'Coffee Machine',
    'Dining Area',
  ],
  outdoor: [
    'Swimming Pool',
    'Garden',
    'Terrace',
    'BBQ Facilities',
    'Beach Access',
    'Bike Rental',
  ],
  accessibility: [
    'Wheelchair Accessible',
    'Elevator Access',
    'Roll-in Shower',
    'Grab Rails',
    'Emergency Cord',
    'Braille Signage',
  ],
};

const AmenitiesForm = ({ data, onChange }) => {
  const handleChange = (category, amenity) => (event) => {
    const updatedAmenities = event.target.checked
      ? [...data[category], amenity]
      : data[category].filter((item) => item !== amenity);

    onChange({
      ...data,
      [category]: updatedAmenities,
    });
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Property Amenities
      </Typography>

      {Object.entries(amenitiesData).map(([category, amenities]) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ textTransform: 'capitalize' }}>
              {category.replace('_', ' ')} Amenities
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {amenities.map((amenity) => (
                <FormControlLabel
                  key={amenity}
                  control={
                    <Checkbox
                      checked={data[category].includes(amenity)}
                      onChange={handleChange(category, amenity)}
                    />
                  }
                  label={amenity}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
          <Divider />
        </Accordion>
      ))}
    </Box>
  );
};

export default AmenitiesForm;

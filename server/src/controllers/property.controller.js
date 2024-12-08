import { findPropertiesInRadius, getPropertyDetails, getPropertyById, createProperty } from '../models/property.model.js';
import axios from 'axios';

// Function to map frontend property types to database enum values
const mapPropertyType = (frontendType) => {
  const typeMapping = {
    'resort': 'hotel',
    'apartment': 'apartment',
    'house': 'house',
    'room': 'room',
    'hotel': 'hotel',
    'villa': 'villa'
  };
  return typeMapping[frontendType.toLowerCase()] || 'hotel';
};

// Function to get coordinates from address using OpenStreetMap Nominatim
const getCoordinates = async (address) => {
  try {
    console.log('Geocoding address:', address);
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
    console.log('Geocoding URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'StayHub Property Listing App'
      }
    });

    console.log('Geocoding response:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      console.log('Found coordinates:', { latitude: lat, longitude: lon });
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw new Error('Failed to get coordinates for the address');
  }
};

const searchProperties = async (req, res) => {
  try {
    const { lat, lon, radius = 25, checkIn, checkOut, guests } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const properties = await findPropertiesInRadius(
      lat,
      lon,
      radius * 1000 // Convert km to meters
    );

    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ message: 'Error searching properties' });
  }
};

const getPropertyDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
};

const createNewProperty = async (req, res) => {
  try {
    console.log('Received property data:', JSON.stringify(req.body, null, 2));
    const { basicInfo, location, pricing, amenities, rules } = req.body;
    
    // Get coordinates from address
    const fullAddress = `${location.street}, ${location.city}, ${location.country}`;
    console.log('Attempting to geocode address:', fullAddress);
    
    let coordinates;
    try {
      coordinates = await getCoordinates(fullAddress);
      console.log('Successfully got coordinates:', coordinates);
    } catch (error) {
      console.error('Failed to get coordinates:', error.message);
      return res.status(400).json({
        message: 'Could not get coordinates for the provided address. Please check the address and try again.'
      });
    }
    
    // Transform nested data into flat structure
    const propertyData = {
      // Basic Info
      name: basicInfo.name,
      description: basicInfo.description,
      propertyType: mapPropertyType(basicInfo.propertyType),
      
      // Location
      street: location.street,
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: location.postalCode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      
      // Pricing
      price: parseFloat(pricing.basePrice),
      
      // Default values for required fields
      guests: 4, 
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      
      // Optional fields
      amenities: amenities ? Object.values(amenities).flat() : [],
      checkInTime: rules.checkInTime,
      checkOutTime: rules.checkOutTime,
      cancellationPolicy: rules.cancellationPolicy,
      
      // Host ID from authenticated user
      hostId: req.user ? req.user.id : req.body.hostId 
    };

    console.log('Transformed property data:', JSON.stringify(propertyData, null, 2));

    // Validate required fields
    const requiredFields = [
      'name',
      'description',
      'latitude',
      'longitude',
      'street',
      'city',
      'country',
      'price',
      'guests',
      'bedrooms',
      'beds',
      'bathrooms',
      'propertyType'
    ];

    const missingFields = requiredFields.filter(field => !propertyData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate propertyType against allowed values
    const allowedPropertyTypes = ['apartment', 'house', 'room', 'hotel', 'villa'];
    if (!allowedPropertyTypes.includes(propertyData.propertyType)) {
      console.error('Invalid property type:', propertyData.propertyType);
      return res.status(400).json({
        message: `Invalid property type. Allowed values are: ${allowedPropertyTypes.join(', ')}`
      });
    }

    // Create the property
    const propertyId = await createProperty(propertyData);
    console.log('Created property with ID:', propertyId);

    // Return the newly created property
    const newProperty = await getPropertyById(propertyId);
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};

export { searchProperties, getPropertyDetailsById, createNewProperty };

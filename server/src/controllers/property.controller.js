import { findPropertiesInRadius, getPropertyDetails, getPropertyById, createProperty, updateProperty, deleteProperty } from '../models/property.model.js';
import { createRoom, getRoomsByPropertyId } from '../models/room.model.js';
import axios from 'axios';
import db from '../db/index.js';

// Function to map frontend property types to database enum values
const mapPropertyType = (frontendType) => {
  const validTypes = ['hotel', 'apartment', 'villa', 'resort', 'guesthouse', 'hostel'];
  const type = frontendType?.toLowerCase();
  return validTypes.includes(type) ? type : 'hotel';
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
    const { lat, lon, radius = 25, guests = 1, propertyType } = req.query;
    console.log('Search params:', { lat, lon, radius, guests, propertyType });

    const properties = await findPropertiesInRadius(
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius),
      parseInt(guests),
      propertyType || null
    );

    res.json({
      status: 'success',
      data: properties
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error searching properties'
    });
  }
};

const getPropertyDetailsById = async (req, res) => {
  try {
    console.log('Getting property details for ID:', req.params.id);
    if (!req.params.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Property ID is required'
      });
    }

    const { id } = req.params;
    
    console.log('Fetching property from database...');
    const property = await getPropertyById(id);
    console.log('Property from database:', property);
    
    if (!property) {
      console.log('Property not found');
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    console.log('Fetching rooms for property...');
    const rooms = await getRoomsByPropertyId(id);
    console.log('Rooms from database:', rooms);
    
    const response = {
      status: 'success',
      data: {
        ...property,
        rooms
      }
    };
    console.log('Sending response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error in getPropertyDetailsById:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch property details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createNewProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      host_id: req.user.userId
    };

    const newProperty = await createProperty(propertyData);
    console.log('New property created:', newProperty);

    res.status(201).json({
      status: 'success',
      data: {
        id: newProperty.id,
        name: newProperty.basicInfo.name,
        description: newProperty.basicInfo.description,
        created_at: newProperty.created_at,
        updated_at: newProperty.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updatePropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const hostId = req.user.id;
    
    // Verify ownership
    const property = await getPropertyById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.host_id !== hostId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updatedProperty = await updateProperty(id, req.body);
    res.json({
      status: 'success',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const deletePropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow admin to delete properties
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: 'Only administrators can delete properties' 
      });
    }

    // Check if property exists
    const property = await getPropertyById(id);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    await deleteProperty(id);
    res.json({
      status: 'success',
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    console.log('Getting all properties. User:', req.user);

    // Default query without user filtering
    let query = `
      SELECT 
        p.*,
        u.email as host_email,
        u.first_name as host_first_name,
        u.last_name as host_last_name,
        (
          SELECT pi.url 
          FROM property_images pi 
          WHERE pi.property_id = p.id 
          LIMIT 1
        ) as imageUrl,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', r.id,
              'name', r.name,
              'type', r.room_type,
              'beds', r.beds,
              'maxOccupancy', r.max_occupancy,
              'basePrice', r.base_price,
              'cleaningFee', r.cleaning_fee,
              'serviceFee', r.service_fee,
              'taxRate', r.tax_rate,
              'securityDeposit', r.security_deposit
            )
          )
          FROM rooms r
          WHERE r.property_id = p.id
        ) as rooms
      FROM properties p
      LEFT JOIN users u ON p.host_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
    `;

    let queryParams = [];

    // Add user filtering only if user exists and is NOT admin
    if (req.user && req.user.role !== 'admin') {
      query += ' WHERE p.host_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci';
      queryParams.push(req.user.userId);
    }

    // Add ordering
    query += ' ORDER BY p.created_at DESC';

    console.log('Executing query:', {
      query,
      params: queryParams,
      user: req.user || 'No user'
    });

    const [properties] = await db.query(query, queryParams);
    
    console.log(`Found ${properties.length} properties`);
    
    // Transform the properties to include room data
    const formattedProperties = properties.map(property => {
      // Parse rooms if it's a string, otherwise use as is
      const rooms = typeof property.rooms === 'string' 
        ? JSON.parse(property.rooms)
        : property.rooms;

      // Get the lowest room price
      const lowestPrice = rooms?.reduce((min, room) => {
        const price = parseFloat(room.basePrice || room.base_price);
        return price < min ? price : min;
      }, Infinity) || 0;

      return {
        ...property,
        rooms: rooms || [],
        price: lowestPrice // Use lowest room price as property price
      };
    });

    res.json({
      status: 'success',
      data: formattedProperties
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching properties',
      details: error.message
    });
  }
};

export { searchProperties, getPropertyDetailsById, createNewProperty, updatePropertyById, deletePropertyById };

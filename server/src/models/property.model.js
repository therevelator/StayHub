import db from '../db/index.js';
import dayjs from 'dayjs';

// Create properties table
const createPropertiesTable = async () => {
  const queries = [
    // Properties table
    `CREATE TABLE IF NOT EXISTS properties (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      street VARCHAR(255),
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255),
      country VARCHAR(255) NOT NULL,
      postal_code VARCHAR(20),
      star_rating DECIMAL(2, 1),
      host_id VARCHAR(36) NOT NULL,
      guests INT NOT NULL,
      bedrooms INT NOT NULL,
      beds INT NOT NULL,
      bathrooms INT NOT NULL,
      property_type ENUM('hotel', 'apartment', 'villa', 'resort', 'guesthouse', 'hostel') NOT NULL,
      languages_spoken JSON,
      check_in_time TIME,
      check_out_time TIME,
      cancellation_policy VARCHAR(50),
      pet_policy VARCHAR(255),
      event_policy VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id)
    )`,

    // Property amenities table with categories
    `CREATE TABLE IF NOT EXISTS property_amenities (
      property_id INT,
      amenity VARCHAR(100),
      category VARCHAR(50) NOT NULL,
      PRIMARY KEY (property_id, amenity, category),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`,

    // Property images table
    `CREATE TABLE IF NOT EXISTS property_images (
      id INT PRIMARY KEY AUTO_INCREMENT,
      property_id INT,
      url VARCHAR(255) NOT NULL,
      caption VARCHAR(255),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`,

    // Property rules table
    `CREATE TABLE IF NOT EXISTS property_rules (
      property_id INT,
      rule VARCHAR(255),
      PRIMARY KEY (property_id, rule),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`,

    // Rooms table
    `CREATE TABLE IF NOT EXISTS rooms (
      id INT PRIMARY KEY AUTO_INCREMENT,
      property_id INT,
      name VARCHAR(255) NOT NULL,
      room_type VARCHAR(50),
      beds JSON,
      max_occupancy INT,
      base_price DECIMAL(10, 2),
      cleaning_fee DECIMAL(10, 2),
      service_fee DECIMAL(10, 2),
      tax_rate DECIMAL(5, 2),
      security_deposit DECIMAL(10, 2),
      description TEXT,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`
  ];

  for (const query of queries) {
    await db.query(query);
  }
};

// Find properties within radius using Haversine formula
const findPropertiesInRadius = async (lat, lon, radius, guests, propertyType) => {
  const query = `
    SELECT 
      p.*,
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
            'room_type', r.room_type,
            'bed_type', r.bed_type,
            'beds', r.beds,
            'max_occupancy', r.max_occupancy,
            'base_price', r.base_price,
            'cleaning_fee', r.cleaning_fee,
            'service_fee', r.service_fee,
            'tax_rate', r.tax_rate
          )
        )
        FROM rooms r
        WHERE r.property_id = p.id
      ) as rooms,
      ST_Distance_Sphere(
        point(p.longitude, p.latitude),
        point(?, ?)
      ) / 1000 as distance
    FROM properties p
    HAVING distance <= ?
    ORDER BY distance;
  `;

  try {
    console.log('Executing search query with params:', { lat, lon, radius: radius/1000, guests, propertyType });
    const queryParams = [lon, lat, radius/1000];
    console.log('Query params:', queryParams);
    
    const [rows] = await db.query(query, queryParams);
    console.log(`Found ${rows.length} properties within ${radius/1000}km radius`);
    
    return rows.map(property => {
      // Parse rooms if it's a string
      const rooms = typeof property.rooms === 'string' 
        ? JSON.parse(property.rooms)
        : property.rooms;

      return {
        ...property,
        distance: Math.round(property.distance * 10) / 10, // Round to 1 decimal place
        rooms: rooms || []
      };
    });
  } catch (error) {
    console.error('Error in findPropertiesInRadius:', error);
    throw error;
  }
};

// Get property details including amenities, images, and rules
const getPropertyDetails = async (propertyId) => {
  const queries = {
    property: 'SELECT * FROM properties WHERE id = ?',
    amenities: 'SELECT amenity FROM property_amenities WHERE property_id = ?',
    images: 'SELECT url, caption FROM property_images WHERE property_id = ?',
    rules: 'SELECT rule FROM property_rules WHERE property_id = ?'
  };

  try {
    const [[property]] = await db.query(queries.property, [propertyId]);
    if (!property) return null;

    const [amenities] = await db.query(queries.amenities, [propertyId]);
    const [images] = await db.query(queries.images, [propertyId]);
    const [rules] = await db.query(queries.rules, [propertyId]);

    return {
      ...property,
      amenities: amenities.map(a => a.amenity),
      images,
      rules: rules.map(r => r.rule)
    };
  } catch (error) {
    console.error('Error getting property details:', error);
    throw error;
  }
};

const validPropertyTypes = ['hotel', 'apartment', 'villa', 'resort', 'guesthouse', 'hostel'];

// Add this helper function at the top
const formatTimeString = (timeStr) => {
  if (!timeStr) return null;
  // Convert MySQL TIME format (HH:mm:ss) to HH:mm format
  const match = timeStr.match(/(\d{2}):(\d{2})/);
  if (match) {
    return dayjs().hour(match[1]).minute(match[2]);
  }
  return null;
};

// Get property by id including amenities and images
const getPropertyById = async (id) => {
  const query = `
    SELECT 
      p.*,
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
            'securityDeposit', r.security_deposit,
            'description', r.description
          )
        )
        FROM rooms r
        WHERE r.property_id = p.id
      ) as rooms,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'category', COALESCE(pa.category, 'general'),
            'amenity', pa.amenity
          )
        )
        FROM property_amenities pa
        WHERE pa.property_id = p.id
      ) as amenities,
      (
        SELECT JSON_ARRAYAGG(rule)
        FROM property_rules pr
        WHERE pr.property_id = p.id
      ) as house_rules,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'url', pi.url,
            'caption', pi.caption
          )
        )
        FROM property_images pi
        WHERE pi.property_id = p.id
      ) as images
    FROM properties p
    WHERE p.id = ?
  `;

  try {
    const [result] = await db.query(query, [id]);
    const property = result[0];
    
    if (!property) return null;

    // Helper function to safely parse JSON or return default
    const safeJSONParse = (data, defaultValue = []) => {
      if (!data) return defaultValue;
      if (typeof data === 'object') return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
      }
    };

    // Transform amenities array into categories
    const amenitiesByCategory = {
      general: [],
      room: [],
      bathroom: [],
      kitchen: [],
      outdoor: [],
      accessibility: []
    };

    const amenities = safeJSONParse(property.amenities);
    if (Array.isArray(amenities)) {
      amenities.forEach(item => {
        if (item && item.category && item.amenity) {
          if (amenitiesByCategory[item.category]) {
            amenitiesByCategory[item.category].push(item.amenity);
          }
        }
      });
    }

    // Transform room data to match form structure
    const rooms = safeJSONParse(property.rooms).map(room => ({
      name: room.name,
      type: room.type || room.room_type, // Handle both formats
      beds: safeJSONParse(room.beds),
      maxOccupancy: room.maxOccupancy || room.max_occupancy,
      basePrice: room.basePrice || room.base_price,
      cleaningFee: room.cleaningFee || room.cleaning_fee,
      serviceFee: room.serviceFee || room.service_fee,
      taxRate: room.taxRate || room.tax_rate,
      securityDeposit: room.securityDeposit || room.security_deposit,
      description: room.description
    }));

    return {
      basicInfo: {
        name: property.name || '',
        description: property.description || '',
        propertyType: property.property_type || 'hotel',
        guests: property.guests?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '',
        beds: property.beds?.toString() || '',
        bathrooms: property.bathrooms?.toString() || ''
      },
      location: {
        street: property.street || '',
        city: property.city || '',
        state: property.state || '',
        country: property.country || '',
        postalCode: property.postal_code || '',
        coordinates: {
          lat: parseFloat(property.latitude) || 0,
          lng: parseFloat(property.longitude) || 0
        }
      },
      amenities: amenitiesByCategory,
      rooms: rooms,
      photos: safeJSONParse(property.images),
      rules: {
        checkInTime: property.check_in_time ? dayjs(`2024-01-01T${property.check_in_time}`) : null,
        checkOutTime: property.check_out_time ? dayjs(`2024-01-01T${property.check_out_time}`) : null,
        cancellationPolicy: property.cancellation_policy || '',
        houseRules: safeJSONParse(property.house_rules),
        petPolicy: property.pet_policy || '',
        eventPolicy: property.event_policy || ''
      }
    };
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    throw error;
  }
};

// Create a new property
const createProperty = async (propertyData) => {
  console.log('Creating property with data:', propertyData);
  
  // Extract data from the nested form structure
  const {
    basicInfo,
    location,
    rules,
    rooms,
    photos,
    amenities
  } = propertyData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert property with all fields
    const [propertyResult] = await connection.query(
      `INSERT INTO properties (
        name, description, latitude, longitude, street, city, state, country,
        postal_code, host_id, guests, bedrooms, beds, bathrooms,
        property_type, check_in_time, check_out_time, cancellation_policy,
        pet_policy, event_policy, star_rating, languages_spoken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        basicInfo.name,
        basicInfo.description,
        location.coordinates.lat,
        location.coordinates.lng,
        location.street,
        location.city,
        location.state,
        location.country,
        location.postalCode,
        propertyData.host_id,
        parseInt(basicInfo.guests) || 4,
        parseInt(basicInfo.bedrooms) || 1,
        parseInt(basicInfo.beds) || 1,
        parseInt(basicInfo.bathrooms) || 1,
        basicInfo.propertyType,
        formatTime(rules.checkInTime),
        formatTime(rules.checkOutTime),
        rules.cancellationPolicy,
        rules.petPolicy,
        rules.eventPolicy,
        null, // star_rating
        null  // languages_spoken
      ]
    );

    const propertyId = propertyResult.insertId;

    // Insert rooms
    if (rooms?.length > 0) {
      const roomValues = rooms.map(room => [
        propertyId,
        room.name,
        room.type,
        JSON.stringify(room.beds),
        calculateOccupancy(room.beds),
        parseFloat(room.basePrice) || 0,
        parseFloat(room.cleaningFee) || null,
        parseFloat(room.serviceFee) || null,
        parseFloat(room.taxRate) || null,
        parseFloat(room.securityDeposit) || null,
        room.description
      ]);

      await connection.query(
        `INSERT INTO rooms 
        (property_id, name, room_type, beds, max_occupancy, base_price, cleaning_fee, service_fee, tax_rate, security_deposit, description) 
        VALUES ?`,
        [roomValues]
      );
    }

    // Insert amenities
    const amenityValues = [];
    Object.entries(amenities).forEach(([category, amenityList]) => {
      amenityList.forEach(amenity => {
        amenityValues.push([propertyId, amenity, category]);
      });
    });
    if (amenityValues.length > 0) {
      await connection.query(
        'INSERT INTO property_amenities (property_id, amenity, category) VALUES ?',
        [amenityValues]
      );
    }

    // Insert house rules
    if (rules.houseRules?.length > 0) {
      const ruleValues = rules.houseRules.map(rule => [propertyId, rule]);
      await connection.query(
        'INSERT INTO property_rules (property_id, rule) VALUES ?',
        [ruleValues]
      );
    }

    // Insert images
    if (photos?.length > 0) {
      const imageValues = photos.map(photo => [
        propertyId,
        photo.url,
        photo.caption || null
      ]);
      await connection.query(
        'INSERT INTO property_images (property_id, url, caption) VALUES ?',
        [imageValues]
      );
    }

    await connection.commit();
    // Return the basic property data including the ID
    return {
      id: propertyId,
      ...propertyData,
      // Add any other necessary fields
      created_at: new Date(),
      updated_at: new Date()
    };

  } catch (error) {
    console.error('Error in createProperty:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Helper function to format time
const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const date = new Date(timeStr);
  return date.toTimeString().split(' ')[0];
};

// Update a property
const updateProperty = async (propertyId, propertyData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Format time values
    const formatTime = (timeStr) => {
      if (!timeStr) return null;
      const date = new Date(timeStr);
      return date.toTimeString().split(' ')[0];
    };

    // Update main property data (removed pricing fields)
    await connection.query(
      `UPDATE properties SET
        name = ?,
        description = ?,
        property_type = ?,
        guests = ?,
        bedrooms = ?,
        beds = ?,
        bathrooms = ?,
        street = ?,
        city = ?,
        state = ?,
        country = ?,
        postal_code = ?,
        latitude = ?,
        longitude = ?,
        check_in_time = ?,
        check_out_time = ?,
        cancellation_policy = ?,
        pet_policy = ?,
        event_policy = ?
      WHERE id = ?`,
      [
        propertyData.basicInfo.name,
        propertyData.basicInfo.description,
        propertyData.basicInfo.propertyType,
        parseInt(propertyData.basicInfo.guests),
        parseInt(propertyData.basicInfo.bedrooms),
        parseInt(propertyData.basicInfo.beds),
        parseInt(propertyData.basicInfo.bathrooms),
        propertyData.location.street,
        propertyData.location.city,
        propertyData.location.state,
        propertyData.location.country,
        propertyData.location.postalCode,
        propertyData.location.coordinates.lat,
        propertyData.location.coordinates.lng,
        formatTime(propertyData.rules.checkInTime),
        formatTime(propertyData.rules.checkOutTime),
        propertyData.rules.cancellationPolicy,
        propertyData.rules.petPolicy,
        propertyData.rules.eventPolicy,
        propertyId
      ]
    );

    // Update rooms
    await connection.query('DELETE FROM rooms WHERE property_id = ?', [propertyId]);
    if (propertyData.rooms?.length > 0) {
      const roomValues = propertyData.rooms.map(room => {
        // Ensure all numeric values are properly parsed with fallbacks
        const basePrice = parseFloat(room.basePrice || room.base_price) || 0;
        const cleaningFee = parseFloat(room.cleaningFee || room.cleaning_fee) || null;
        const serviceFee = parseFloat(room.serviceFee || room.service_fee) || null;
        const taxRate = parseFloat(room.taxRate || room.tax_rate) || null;
        const securityDeposit = parseFloat(room.securityDeposit || room.security_deposit) || null;
        const roomType = room.type || room.room_type || 'Standard Room'; // Add default room type

        console.log('Processing room:', {
          name: room.name,
          type: roomType,
          basePrice,
          cleaningFee,
          serviceFee,
          taxRate,
          securityDeposit
        });

        return [
          propertyId,
          room.name,
          roomType,  // Use the processed room type
          JSON.stringify(room.beds),
          calculateOccupancy(room.beds),
          basePrice,
          cleaningFee,
          serviceFee,
          taxRate,
          securityDeposit,
          room.description
        ];
      });

      await connection.query(
        `INSERT INTO rooms 
        (property_id, name, room_type, beds, max_occupancy, base_price, cleaning_fee, service_fee, tax_rate, security_deposit, description) 
        VALUES ?`,
        [roomValues]
      );
    }

    // Update amenities
    await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [propertyId]);
    const amenityValues = [];
    Object.entries(propertyData.amenities).forEach(([category, amenities]) => {
      amenities.forEach(amenity => {
        amenityValues.push([propertyId, amenity, category]);
      });
    });
    if (amenityValues.length > 0) {
      await connection.query(
        'INSERT INTO property_amenities (property_id, amenity, category) VALUES ?',
        [amenityValues]
      );
    }

    // Update house rules
    await connection.query('DELETE FROM property_rules WHERE property_id = ?', [propertyId]);
    if (propertyData.rules.houseRules?.length > 0) {
      const ruleValues = propertyData.rules.houseRules.map(rule => [propertyId, rule]);
      await connection.query(
        'INSERT INTO property_rules (property_id, rule) VALUES ?',
        [ruleValues]
      );
    }

    // Update images
    await connection.query('DELETE FROM property_images WHERE property_id = ?', [propertyId]);
    if (propertyData.photos?.length > 0) {
      const imageValues = propertyData.photos.map(photo => [
        propertyId,
        photo.url,
        photo.caption || null
      ]);
      await connection.query(
        'INSERT INTO property_images (property_id, url, caption) VALUES ?',
        [imageValues]
      );
    }

    await connection.commit();
    return await getPropertyById(propertyId);

  } catch (error) {
    await connection.rollback();
    console.error('Error updating property:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Helper function to calculate occupancy
const calculateOccupancy = (beds) => {
  const occupancy = {
    'Single Bed': 1,
    'Double Bed': 2,
    'Queen Bed': 2,
    'King Bed': 2,
    'Sofa Bed': 1,
    'Bunk Bed': 2
  };

  return beds.reduce((total, bed) => {
    return total + (occupancy[bed.type] || 0) * (bed.count || 1);
  }, 0);
};

const deleteProperty = async (propertyId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Delete related records (cascade will handle this automatically)
    await connection.query('DELETE FROM properties WHERE id = ?', [propertyId]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting property:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export {
  createProperty,
  findPropertiesInRadius,
  getPropertyDetails,
  getPropertyById,
  updateProperty,
  deleteProperty,
  createPropertiesTable
};

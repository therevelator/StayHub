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
      base_price DECIMAL(10, 2) NOT NULL,
      cleaning_fee DECIMAL(10, 2),
      service_fee DECIMAL(10, 2),
      tax_rate DECIMAL(5, 2),
      security_deposit DECIMAL(10, 2),
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
      bed_type VARCHAR(50),
      max_occupancy INT,
      base_price DECIMAL(10, 2),
      description TEXT,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`
  ];

  for (const query of queries) {
    await db.query(query);
  }
};

// Find properties within radius using Haversine formula
const findPropertiesInRadius = async (lat, lon, radius) => {
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
        6371 * acos(
          cos(radians(?)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * 
          sin(radians(latitude))
        )
      ) AS distance
    FROM properties p
    HAVING distance <= ?
    ORDER BY distance;
  `;

  try {
    console.log('Executing search query with params:', { lat, lon, radius: radius/1000 });
    const [rows] = await db.query(query, [lat, lon, lat, radius/1000]);
    console.log(`Found ${rows.length} properties within ${radius/1000}km radius`);
    
    return rows.map(property => ({
      ...property,
      distance: Math.round(property.distance * 10) / 10, // Round to 1 decimal place
      price: parseFloat(property.price)
    }));
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
      photos: safeJSONParse(property.images),
      pricing: {
        price: property.base_price?.toString() || '',
        cleaningFee: property.cleaning_fee?.toString() || '',
        serviceFee: property.service_fee?.toString() || '',
        taxRate: property.tax_rate?.toString() || '',
        securityDeposit: property.security_deposit?.toString() || ''
      },
      rules: {
        checkInTime: property.check_in_time || null,
        checkOutTime: property.check_out_time || null,
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
  
  const {
    name,
    description,
    latitude,
    longitude,
    street,
    city,
    state,
    country,
    postal_code,
    base_price,
    cleaning_fee = null,
    service_fee = null,
    tax_rate = null,
    security_deposit = null,
    host_id,
    guests,
    bedrooms,
    beds,
    bathrooms,
    property_type,
    check_in_time = null,
    check_out_time = null,
    cancellation_policy = null,
    pet_policy = null,
    event_policy = null,
    star_rating = null,
    languages_spoken = null
  } = propertyData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert property with all fields
    const [propertyResult] = await connection.query(
      `INSERT INTO properties (
        name, description, latitude, longitude, street, city, state, country,
        postal_code, base_price, cleaning_fee, service_fee, tax_rate, 
        security_deposit, host_id, guests, bedrooms, beds, bathrooms,
        property_type, check_in_time, check_out_time, cancellation_policy,
        pet_policy, event_policy, star_rating, languages_spoken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        latitude,
        longitude,
        street,
        city,
        state || null,
        country,
        postal_code || null,
        parseFloat(base_price) || 0,
        cleaning_fee ? parseFloat(cleaning_fee) : null,
        service_fee ? parseFloat(service_fee) : null,
        tax_rate ? parseFloat(tax_rate) : null,
        security_deposit ? parseFloat(security_deposit) : null,
        host_id,
        parseInt(guests) || 4,
        parseInt(bedrooms) || 1,
        parseInt(beds) || 1,
        parseInt(bathrooms) || 1,
        property_type,
        check_in_time || null,
        check_out_time || null,
        cancellation_policy || null,
        pet_policy || null,
        event_policy || null,
        star_rating ? parseFloat(star_rating) : null,
        languages_spoken ? JSON.stringify(languages_spoken) : null
      ]
    );

    const propertyId = propertyResult.insertId;
    await connection.commit();

    // Get and return the created property
    const property = await getPropertyById(propertyId);
    console.log('Successfully created property:', property);
    return property;

  } catch (error) {
    console.error('Error in createProperty:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Update a property
const updateProperty = async (propertyId, propertyData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update main property data
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
        base_price = ?,
        cleaning_fee = ?,
        service_fee = ?,
        tax_rate = ?,
        security_deposit = ?,
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
        parseFloat(propertyData.pricing.price),
        parseFloat(propertyData.pricing.cleaningFee) || null,
        parseFloat(propertyData.pricing.serviceFee) || null,
        parseFloat(propertyData.pricing.taxRate) || null,
        parseFloat(propertyData.pricing.securityDeposit) || null,
        propertyData.rules.checkInTime,
        propertyData.rules.checkOutTime,
        propertyData.rules.cancellationPolicy,
        propertyData.rules.petPolicy,
        propertyData.rules.eventPolicy,
        propertyId
      ]
    );

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

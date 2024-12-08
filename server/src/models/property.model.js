import db from '../db/index.js';

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
      price DECIMAL(10, 2) NOT NULL,
      rating DECIMAL(2, 1) DEFAULT 0,
      host_id VARCHAR(36) NOT NULL,
      guests INT NOT NULL,
      bedrooms INT NOT NULL,
      beds INT NOT NULL,
      bathrooms INT NOT NULL,
      property_type ENUM('apartment', 'house', 'room', 'hotel', 'villa') NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      cancellation_policy VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Property amenities table
    `CREATE TABLE IF NOT EXISTS property_amenities (
      property_id INT,
      amenity VARCHAR(50),
      PRIMARY KEY (property_id, amenity),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Property images table
    `CREATE TABLE IF NOT EXISTS property_images (
      id INT PRIMARY KEY AUTO_INCREMENT,
      property_id INT,
      url VARCHAR(255) NOT NULL,
      caption VARCHAR(255),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Property rules table
    `CREATE TABLE IF NOT EXISTS property_rules (
      property_id INT,
      rule VARCHAR(255),
      PRIMARY KEY (property_id, rule),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Amenities table
    `CREATE TABLE IF NOT EXISTS amenities (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Breakfast options table
    `CREATE TABLE IF NOT EXISTS breakfast_options (
      id INT PRIMARY KEY AUTO_INCREMENT,
      property_id INT,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  try {
    for (const query of queries) {
      await db.query(query);
    }
    console.log('Properties tables created successfully');
  } catch (error) {
    console.error('Error creating properties tables:', error);
    throw error;
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
      CONCAT(p.street, ', ', p.city, ', ', p.country) as location
    FROM properties p
    WHERE ST_Distance_Sphere(
      point(p.longitude, p.latitude),
      point(?, ?)
    ) <= ?
    ORDER BY ST_Distance_Sphere(
      point(p.longitude, p.latitude),
      point(?, ?)
    );
  `;

  const [rows] = await db.query(query, [lon, lat, radius, lon, lat]);
  return rows;
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

// Get property by id including amenities and images
const getPropertyById = async (id) => {
  const query = `
    SELECT 
      p.*,
      (
        SELECT JSON_ARRAYAGG(amenity)
        FROM property_amenities
        WHERE property_id = p.id
      ) as amenities,
      (
        SELECT JSON_ARRAYAGG(rule)
        FROM property_rules
        WHERE property_id = p.id
      ) as rules,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'url', url,
            'caption', caption
          )
        )
        FROM property_images
        WHERE property_id = p.id
      ) as images
    FROM properties p
    WHERE p.id = ?;
  `;

  const [result] = await db.query(query, [id]);
  return result[0];
};

// Create a new property
const createProperty = async (propertyData) => {
  const {
    name,
    description,
    latitude,
    longitude,
    street,
    city,
    state,
    country,
    postalCode,
    price,
    hostId,
    guests,
    bedrooms,
    beds,
    bathrooms,
    propertyType,
    checkInTime,
    checkOutTime,
    cancellationPolicy,
    amenities = [],
    images = [],
    rules = []
  } = propertyData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert property
    const [propertyResult] = await connection.query(
      `INSERT INTO properties (
        name, description, latitude, longitude, street, city, state, country,
        postal_code, price, host_id, guests, bedrooms, beds, bathrooms,
        property_type, check_in_time, check_out_time, cancellation_policy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, latitude, longitude, street, city, state, country,
        postalCode, price, hostId, guests, bedrooms, beds, bathrooms,
        propertyType, checkInTime, checkOutTime, cancellationPolicy
      ]
    );

    const propertyId = propertyResult.insertId;

    // Insert amenities
    if (amenities.length > 0) {
      const amenityValues = amenities.map(amenity => [propertyId, amenity]);
      await connection.query(
        'INSERT INTO property_amenities (property_id, amenity) VALUES ?',
        [amenityValues]
      );
    }

    // Insert images
    if (images.length > 0) {
      const imageValues = images.map(image => [propertyId, image.url, image.caption]);
      await connection.query(
        'INSERT INTO property_images (property_id, url, caption) VALUES ?',
        [imageValues]
      );
    }

    // Insert rules
    if (rules.length > 0) {
      const ruleValues = rules.map(rule => [propertyId, rule]);
      await connection.query(
        'INSERT INTO property_rules (property_id, rule) VALUES ?',
        [ruleValues]
      );
    }

    await connection.commit();
    return propertyId;

  } catch (error) {
    await connection.rollback();
    console.error('Error creating property:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export {
  createProperty,
  findPropertiesInRadius,
  getPropertyDetails,
  getPropertyById
};

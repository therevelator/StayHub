import db from '../config/database.js';

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
      host_id INT NOT NULL,
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
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude))
          * cos(radians(longitude) - radians(?))
          + sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance
    FROM properties p
    HAVING distance < ?
    ORDER BY distance
    LIMIT 20;
  `;

  try {
    const [properties] = await db.query(query, [lat, lon, lat, radius]);
    return properties;
  } catch (error) {
    console.error('Error finding properties:', error);
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

export {
  createPropertiesTable,
  findPropertiesInRadius,
  getPropertyDetails
};

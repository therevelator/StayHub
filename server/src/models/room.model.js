import db from '../db/index.js';

// Define valid room types - must match exactly with the database values
const VALID_ROOM_TYPES = [
  'single room',
  'double room',
  'triple room',
  'quad room',
  'suite',
  'deluxe room',
  'executive suite',
  'presidential suite',
  'family room',
  'connecting room',
  'accessible room',
  'penthouse suite',
  'studio room',
  'ocean view room',
  'garden view room',
  'honeymoon suite',
  'junior suite',
  'standard room'
];

// Add descriptions for each room type
const ROOM_TYPE_DESCRIPTIONS = {
  'single room': 'Cozy room with a single bed, perfect for solo travelers',
  'double room': 'Comfortable room with a double bed or two single beds',
  'triple room': 'Spacious room that can accommodate up to three guests',
  'quad room': 'Large room suitable for four guests',
  'suite': 'Elegant suite with separate living area',
  'deluxe room': 'Premium room with enhanced amenities and comfort',
  'executive suite': 'Upscale suite with premium furnishings and business amenities',
  'presidential suite': 'Our most luxurious suite with exceptional amenities',
  'family room': 'Spacious room designed for families with children',
  'connecting room': 'Two adjacent rooms with a connecting door',
  'accessible room': 'Specially designed room with accessibility features',
  'penthouse suite': 'Luxury suite located on the top floor with panoramic views',
  'studio room': 'Open-plan room with living and sleeping areas combined',
  'ocean view room': 'Room with beautiful views of the ocean',
  'garden view room': 'Room overlooking our landscaped gardens',
  'honeymoon suite': 'Romantic suite perfect for newlyweds',
  'junior suite': 'Compact suite with a small sitting area',
  'standard room': 'Comfortable room with all essential amenities'
};

export const createRoom = async (propertyId, roomData) => {
  // Normalize the room type to match exactly with our ENUM values
  const normalizedType = roomData.type?.toLowerCase() || 'standard room';
  
  console.log('Original room type:', roomData.type);
  console.log('Normalized room type:', normalizedType);

  if (!VALID_ROOM_TYPES.includes(normalizedType)) {
    throw new Error(`Invalid room type. Must be one of: ${VALID_ROOM_TYPES.join(', ')}`);
  }

  // Add default description if none provided
  const description = roomData.description || ROOM_TYPE_DESCRIPTIONS[normalizedType];

  const query = `
    INSERT INTO rooms (
      property_id, 
      name, 
      room_type, 
      beds,
      max_occupancy, 
      base_price, 
      cleaning_fee,
      service_fee,
      tax_rate,
      security_deposit,
      description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    propertyId,
    roomData.name,
    normalizedType,
    JSON.stringify(roomData.beds || []),
    roomData.maxOccupancy || 2,
    roomData.basePrice || 0,
    roomData.cleaningFee || 0,
    roomData.serviceFee || 0,
    roomData.taxRate || 0,
    roomData.securityDeposit || null,
    description
  ];
  
  try {
    const [result] = await db.query(query, values);
    return { 
      id: result.insertId, 
      ...roomData,
      room_type: normalizedType,
      description
    };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getRoomsByPropertyId = async (propertyId) => {
  const query = `
    SELECT * FROM rooms 
    WHERE property_id = ? 
    ORDER BY created_at ASC
  `;
  
  try {
    const [rows] = await db.query(query, [propertyId]);
    return rows;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
};

export const updateRoom = async (roomId, roomData) => {
  const { name, type, bedType, maxOccupancy, basePrice, description } = roomData;
  
  const query = `
    UPDATE rooms 
    SET name = ?, room_type = ?, bed_type = ?, max_occupancy = ?, base_price = ?, description = ?
    WHERE id = ?
  `;
  
  const values = [name, type, bedType, maxOccupancy, basePrice, description, roomId];
  
  try {
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      throw new Error('Room not found');
    }
    return { id: roomId, ...roomData };
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const deleteRoom = async (roomId) => {
  const query = 'DELETE FROM rooms WHERE id = ?';
  
  try {
    const [result] = await db.query(query, [roomId]);
    if (result.affectedRows === 0) {
      throw new Error('Room not found');
    }
    return true;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

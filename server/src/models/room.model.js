import db from '../db/index.js';

export const createRoom = async (propertyId, roomData) => {
  const { name, type, bedType, maxOccupancy, basePrice, description } = roomData;
  
  const query = `
    INSERT INTO rooms (property_id, name, room_type, bed_type, max_occupancy, base_price, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [propertyId, name, type, bedType, maxOccupancy, basePrice, description];
  
  try {
    const [result] = await db.query(query, values);
    return { id: result.insertId, ...roomData };
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

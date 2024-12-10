import db from '../db/index.js';
import * as propertyModel from '../models/property.model.js';

export const createRoom = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const property = await propertyModel.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create rooms table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        property_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        bed_type VARCHAR(100) NOT NULL,
        bed_count INT NOT NULL,
        room_size INT NOT NULL,
        max_occupancy INT NOT NULL,
        view_type VARCHAR(100),
        has_private_bathroom BOOLEAN DEFAULT true,
        amenities JSON,
        smoking BOOLEAN DEFAULT false,
        accessibility_features JSON,
        floor_level INT,
        has_balcony BOOLEAN DEFAULT false,
        has_kitchen BOOLEAN DEFAULT false,
        has_minibar BOOLEAN DEFAULT false,
        climate JSON,
        price_per_night DECIMAL(10, 2) NOT NULL,
        cancellation_policy ENUM('flexible', 'moderate', 'strict') DEFAULT 'moderate',
        includes_breakfast BOOLEAN DEFAULT false,
        extra_bed_available BOOLEAN DEFAULT false,
        pets_allowed BOOLEAN DEFAULT false,
        images JSON,
        cleaning_frequency ENUM('daily', 'weekly', 'on_request', 'before_check_in') DEFAULT 'daily',
        description TEXT NOT NULL,
        has_toiletries BOOLEAN DEFAULT true,
        has_towels_linens BOOLEAN DEFAULT true,
        has_room_service BOOLEAN DEFAULT false,
        flooring_type VARCHAR(100),
        energy_saving_features JSON,
        status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )
    `);

    const roomData = {
      property_id: propertyId,
      name: req.body.name,
      type: req.body.type,
      bed_type: req.body.bedType,
      bed_count: req.body.bedCount,
      room_size: req.body.roomSize,
      max_occupancy: req.body.maxOccupancy,
      view_type: req.body.viewType,
      has_private_bathroom: req.body.hasPrivateBathroom,
      amenities: JSON.stringify(req.body.amenities || []),
      smoking: req.body.smoking,
      accessibility_features: JSON.stringify(req.body.accessibilityFeatures || []),
      floor_level: req.body.floorLevel,
      has_balcony: req.body.hasBalcony,
      has_kitchen: req.body.hasKitchen,
      has_minibar: req.body.hasMinibar,
      climate: JSON.stringify({
        hasHeating: req.body.hasHeating,
        hasCooling: req.body.hasCooling
      }),
      price_per_night: req.body.pricePerNight,
      cancellation_policy: req.body.cancellationPolicy,
      includes_breakfast: req.body.includesBreakfast,
      extra_bed_available: req.body.extraBedAvailable,
      pets_allowed: req.body.petsAllowed,
      images: JSON.stringify(req.body.images || []),
      cleaning_frequency: req.body.cleaningFrequency,
      description: req.body.description,
      has_toiletries: req.body.hasToiletries,
      has_towels_linens: req.body.hasTowelsLinens,
      has_room_service: req.body.hasRoomService,
      flooring_type: req.body.flooringType,
      energy_saving_features: JSON.stringify(req.body.energySavingFeatures || []),
      status: req.body.status || 'available'
    };

    const [result] = await db.query('INSERT INTO rooms SET ?', [roomData]);
    const [insertedRoom] = await db.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
    
    res.status(201).json(insertedRoom[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const [rooms] = await db.query('SELECT * FROM rooms WHERE property_id = ?', [propertyId]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(rooms[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const roomData = {
      ...req.body,
      amenities: JSON.stringify(req.body.amenities || []),
      accessibility_features: JSON.stringify(req.body.accessibilityFeatures || []),
      climate: JSON.stringify({
        hasHeating: req.body.hasHeating,
        hasCooling: req.body.hasCooling
      }),
      images: JSON.stringify(req.body.images || []),
      energy_saving_features: JSON.stringify(req.body.energySavingFeatures || [])
    };

    const [result] = await db.query('UPDATE rooms SET ? WHERE id = ?', [roomData, req.params.roomId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const [updatedRoom] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.roomId]);
    res.json(updatedRoom[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM rooms WHERE id = ?', [req.params.roomId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
};

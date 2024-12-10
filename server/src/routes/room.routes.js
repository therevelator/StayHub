import express from 'express';
import * as roomController from '../controllers/room.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import checkPropertyOwnership from '../middleware/checkPropertyOwnership.js';

const router = express.Router();

// Create a new room for a property
router.post('/properties/:propertyId/rooms', 
  authenticateToken,
  checkPropertyOwnership,
  roomController.createRoom
);

// Get all rooms for a property
router.get('/properties/:propertyId/rooms',
  roomController.getRooms
);

// Get a specific room
router.get('/rooms/:roomId',
  roomController.getRoom
);

// Update a room
router.put('/rooms/:roomId',
  authenticateToken,
  checkPropertyOwnership,
  roomController.updateRoom
);

// Delete a room
router.delete('/rooms/:roomId',
  authenticateToken,
  checkPropertyOwnership,
  roomController.deleteRoom
);

export default router;

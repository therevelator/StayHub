import express from 'express';
import { searchProperties, getPropertyDetailsById, createNewProperty } from '../controllers/property.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/search', searchProperties);
router.get('/:id', getPropertyDetailsById);
router.post('/', authenticateToken, createNewProperty);

export default router;

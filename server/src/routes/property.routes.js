import express from 'express';
import { searchProperties } from '../controllers/property.controller.js';

const router = express.Router();

router.post('/search', searchProperties);

export default router;

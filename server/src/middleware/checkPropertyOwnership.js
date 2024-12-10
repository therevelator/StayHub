import { getPropertyById } from '../models/property.model.js';

const checkPropertyOwnership = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.userId; // Updated to match the auth middleware user structure

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const property = await getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to modify this property' });
    }

    // Add property to request object for later use
    req.property = property;
    next();
  } catch (error) {
    console.error('Error checking property ownership:', error);
    res.status(500).json({ message: 'Error checking property ownership' });
  }
};

export default checkPropertyOwnership;

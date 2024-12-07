import { findPropertiesInRadius, getPropertyDetails } from '../models/property.model.js';

export const searchProperties = async (req, res) => {
  try {
    const { lat, lon, radius = 25, checkIn, checkOut } = req.body;

    let properties = await findPropertiesInRadius(
      parseFloat(lat),
      parseFloat(lon),
      radius
    );

    if (properties.length === 0 && radius < 100) {
      // If no properties found and radius is less than 100km, try with a larger radius
      properties = await findPropertiesInRadius(
        parseFloat(lat),
        parseFloat(lon),
        radius + 25
      );
    }

    // Get full details for each property
    const propertiesWithDetails = await Promise.all(
      properties.map(async (property) => {
        const details = await getPropertyDetails(property.id);
        return {
          ...details,
          distance: property.distance
        };
      })
    );

    res.json(propertiesWithDetails);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ message: 'Error searching properties' });
  }
};

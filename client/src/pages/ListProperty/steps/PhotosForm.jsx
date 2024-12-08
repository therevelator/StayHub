import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';

const photoCategories = [
  'exterior',
  'interior',
  'room',
  'bathroom',
  'view',
  'amenity',
  'dining',
];

const PhotosForm = ({ data, onChange }) => {
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // In a real application, you would upload these files to your server or cloud storage
    // For now, we'll create local URLs
    try {
      const newPhotos = files.map(file => ({
        url: URL.createObjectURL(file),
        file: file,
        category: 'exterior', // default category
        isPrimary: data.length === 0, // first photo is primary by default
      }));

      onChange([...data, ...newPhotos]);
      setUploadError('');
    } catch (error) {
      setUploadError('Error uploading photos. Please try again.');
      console.error('Upload error:', error);
    }
  };

  const handleDelete = (index) => {
    const newPhotos = data.filter((_, i) => i !== index);
    // If we deleted the primary photo, make the first remaining photo primary
    if (data[index].isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }
    onChange(newPhotos);
  };

  const handleCategoryChange = (index, category) => {
    const newPhotos = [...data];
    newPhotos[index] = { ...newPhotos[index], category };
    onChange(newPhotos);
  };

  const handleSetPrimary = (index) => {
    const newPhotos = data.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onChange(newPhotos);
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Property Photos
      </Typography>

      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
      >
        Upload Photos
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileUpload}
        />
      </Button>

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}

      {data.length > 0 && (
        <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={200}>
          {data.map((photo, index) => (
            <ImageListItem key={index}>
              <img
                src={photo.url}
                alt={`Property photo ${index + 1}`}
                loading="lazy"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <ImageListItemBar
                title={`Photo ${index + 1}`}
                actionIcon={
                  <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                    <IconButton
                      sx={{ color: photo.isPrimary ? 'yellow' : 'white' }}
                      onClick={() => handleSetPrimary(index)}
                    >
                      <StarIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => handleDelete(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
              <FormControl
                fullWidth
                size="small"
                sx={{ position: 'absolute', bottom: 0, bgcolor: 'rgba(0,0,0,0.5)' }}
              >
                <Select
                  value={photo.category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  sx={{ color: 'white' }}
                >
                  {photoCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <Typography variant="body2" color="text.secondary">
        * First uploaded photo will be set as primary by default. Click the star icon to change the primary photo.
      </Typography>
    </Box>
  );
};

export default PhotosForm;

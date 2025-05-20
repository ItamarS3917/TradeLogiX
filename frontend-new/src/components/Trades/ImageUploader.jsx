import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardActions,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import { useSnackbar } from '../../contexts/SnackbarContext';

const ImageUploader = ({ onUploadComplete, initialImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(initialImages);
  const { showSnackbar } = useSnackbar();
  
  const handleUpload = async (event) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    setUploading(true);
    
    // Create form data
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    
    try {
      // Upload file
      const response = await fetch('/api/uploads/screenshot', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Add to images
      const newImages = [...images, data.url];
      setImages(newImages);
      
      // Call callback
      if (onUploadComplete) {
        onUploadComplete(newImages);
      }
      
      showSnackbar('Image uploaded successfully', 'success');
      console.log('Uploaded image URL:', data.url); // Debug log
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = async (index) => {
    // Extract filename from the URL
    const url = images[index];
    const filename = url.split('/').pop();
    
    try {
      // Delete from server
      const response = await fetch(`/api/uploads/screenshot/${filename}`, {
        method: 'DELETE',
      });
      
      // Remove from state
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
      
      // Call callback
      if (onUploadComplete) {
        onUploadComplete(newImages);
      }
      
      showSnackbar('Image removed successfully', 'success');
    } catch (error) {
      console.error('Error removing image:', error);
      showSnackbar('Failed to remove image', 'error');
    }
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Trade Screenshots
      </Typography>
      
      <Box 
        sx={{ 
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        component="label"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1">
          Drag and drop image here or click to browse
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Upload screenshots of your trade charts and analysis
        </Typography>
        
        {uploading && (
          <CircularProgress 
            size={24} 
            sx={{ mt: 2 }} 
          />
        )}
      </Box>
      
      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2}>
                <CardMedia
                  component="img"
                  height="140"
                  image={image}
                  alt={`Screenshot ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleRemove(index)}
                  >
                    <ClearIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUploader;

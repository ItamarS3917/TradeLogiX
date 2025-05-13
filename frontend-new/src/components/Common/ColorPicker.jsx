// File: src/components/Common/ColorPicker.jsx
// Purpose: Color picker component for theme customization

import React, { useState } from 'react';
import { 
  Box,
  Button,
  Popover,
  TextField,
  Typography
} from '@mui/material';

export const ColorPicker = ({ color, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColor, setCurrentColor] = useState(color || '#1976d2');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
  };

  const handleApply = () => {
    onChange(currentColor);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-picker-popover' : undefined;

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: currentColor,
            borderRadius: 1,
            border: '1px solid #ccc',
            cursor: 'pointer',
            mr: 2
          }}
          onClick={handleClick}
        />
        <Typography>{currentColor}</Typography>
      </Box>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box p={2} width={300}>
          <Box display="flex" justifyContent="center" mb={2}>
            <input 
              type="color" 
              value={currentColor}
              onChange={handleColorChange}
              style={{ width: '100%', height: 50 }}
            />
          </Box>
          
          <TextField
            label="Color Hex"
            value={currentColor}
            onChange={handleColorChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleApply}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPicker;
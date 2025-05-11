import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading component to display while content is being fetched
 * Can be configured with a custom message and size
 */
const Loading = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        height: '100%',
        width: '100%',
        minHeight: '200px',
      }}
    >
      <CircularProgress size={size} color="primary" />
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mt: 2 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;

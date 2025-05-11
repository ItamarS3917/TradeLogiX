import React, { useState, useEffect } from 'react';
import { 
  Alert as MuiAlert,
  AlertTitle,
  Snackbar,
  IconButton, 
  Collapse
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Custom Alert component that can be used both inline or as a snackbar notification
 * 
 * @param {Object} props
 * @param {string} props.severity - error, warning, info, or success
 * @param {string} props.title - Optional title for the alert
 * @param {string|node} props.message - Message content
 * @param {boolean} props.snackbar - Whether to display as snackbar
 * @param {boolean} props.open - Control visibility
 * @param {function} props.onClose - Function to call when alert is closed
 * @param {number} props.autoHideDuration - Time in ms before auto-hiding (for snackbar)
 * @param {object} props.sx - Additional styling
 */
const Alert = ({
  severity = 'info',
  title,
  message,
  snackbar = false,
  open = true,
  onClose,
  autoHideDuration = 6000,
  sx = {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway' && snackbar) {
      return;
    }
    
    setIsOpen(false);
    
    if (onClose) {
      onClose();
    }
  };

  const alertContent = (
    <MuiAlert
      severity={severity}
      variant="filled"
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={handleClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{
        width: '100%',
        ...sx
      }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </MuiAlert>
  );

  if (snackbar) {
    return (
      <Snackbar
        open={isOpen}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {alertContent}
      </Snackbar>
    );
  }

  return (
    <Collapse in={isOpen}>
      {alertContent}
    </Collapse>
  );
};

export default Alert;

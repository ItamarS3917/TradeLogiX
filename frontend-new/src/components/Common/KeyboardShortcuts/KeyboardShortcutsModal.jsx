import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Divider,
  Box,
  Grid,
  Chip,
  DialogActions,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useKeyboardShortcuts } from '../../../contexts/KeyboardShortcutsContext';

const KeyboardShortcutsModal = () => {
  const { 
    showShortcutsModal, 
    setShowShortcutsModal, 
    shortcuts, 
    powerUserMode, 
    togglePowerUserMode
  } = useKeyboardShortcuts();

  // Group shortcuts by category
  const categories = {
    'Navigation': Object.entries(shortcuts).filter(([key]) => key.startsWith('g')),
    'Actions': Object.entries(shortcuts).filter(([key]) => key.startsWith('n')),
    'Other': Object.entries(shortcuts).filter(([key]) => !key.startsWith('g') && !key.startsWith('n')),
  };

  return (
    <Dialog 
      open={showShortcutsModal} 
      onClose={() => setShowShortcutsModal(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={powerUserMode} 
                onChange={togglePowerUserMode} 
                color="primary"
              />
            }
            label="Power User Mode"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {Object.entries(categories).map(([category, shortcutList]) => (
          <Box key={category} mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              {category}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {shortcutList.map(([key, { description }]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    bgcolor="background.paper"
                    p={1}
                    borderRadius={1}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2">{description}</Typography>
                    <Box>
                      {key.split(' ').map((k, i) => (
                        <React.Fragment key={i}>
                          <Chip 
                            size="small" 
                            label={k} 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              bgcolor: 'background.default'
                            }} 
                          />
                          {i < key.split(' ').length - 1 && (
                            <Typography variant="body2" component="span" mx={0.5}>
                              then
                            </Typography>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        <Box mt={4}>
          <Typography variant="body1" gutterBottom fontWeight="bold">
            How to use keyboard shortcuts:
          </Typography>
          <Typography variant="body2" paragraph>
            Press the keys in sequence (not simultaneously). For example, to go to the Dashboard, 
            press "g" followed by "d".
          </Typography>
          <Typography variant="body2">
            <strong>Note:</strong> Shortcuts won't work when you're typing in a text field or form.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowShortcutsModal(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;

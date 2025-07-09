import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  Collapse
} from '@mui/material';
import {
  Mic,
  MicOff,
  Stop,
  VolumeUp,
  KeyboardVoice,
  Refresh,
  CheckCircle,
  ErrorOutline,
  Info,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../../contexts/SnackbarContext';

const VoiceTradeEntry = ({ onTradeDataParsed, onClose, disabled = false }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'processing', 'success', 'error'
  const [parsedData, setParsedData] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Voice patterns for trade entry
  const patterns = {
    direction: /(long|short|buy|sell)/i,
    symbol: /(NQ|ES|YM|RTY|EURUSD|GBPUSD|USDJPY|XAUUSD|WTI|BTC|ETH)/i,
    quantity: /(\d+)\s*(contract|contracts|share|shares|lot|lots|unit|units)?/i,
    entry: /entry\s*(price)?\s*(at)?\s*([\d,]+\.?\d*)/i,
    stop: /(stop|stop\s*loss|sl)\s*(at)?\s*([\d,]+\.?\d*)/i,
    target: /(target|take\s*profit|tp)\s*(at)?\s*([\d,]+\.?\d*)/i,
    timeframe: /(\d+)\s*(minute|min|hour|h|daily|d)/i
  };
  
  // Example phrases users can say
  const examplePhrases = [
    "Long NQ, 2 contracts, entry 15450, stop 15430, target 15480",
    "Short ES, 1 contract, entry at 4385, stop loss 4395, take profit 4375",
    "Buy 3 contracts NQ, entry price 15465, stop at 15445, target 15485",
    "Sell YM, 1 contract, entry 34250, stop 34280, target 34220"
  ];
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setStatus('listening');
        setTranscript('');
        setConfidence(0);
      };
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setStatus('error');
        setIsListening(false);
        
        let errorMessage = 'Voice recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please enable microphone permissions.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (status === 'listening') {
          setStatus('idle');
        }
      };
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, enqueueSnackbar]);
  
  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isListening) return;
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setStatus('error');
      setIsListening(false);
      enqueueSnackbar('Failed to start voice recognition', { variant: 'error' });
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  const processVoiceCommand = (command) => {
    setStatus('processing');
    
    try {
      const normalizedCommand = command.toLowerCase().trim();
      console.log('Processing voice command:', normalizedCommand);
      
      // Parse trade data from voice command
      const tradeData = {
        direction: null,
        symbol: null,
        quantity: null,
        entry_price: null,
        stop_loss: null,
        target_price: null,
        timeframe: null,
        notes: `Voice entry: "${command}"`
      };
      
      // Extract direction
      const directionMatch = normalizedCommand.match(patterns.direction);
      if (directionMatch) {
        const direction = directionMatch[1];
        tradeData.direction = direction === 'long' || direction === 'buy' ? 'Long' : 'Short';
      }
      
      // Extract symbol
      const symbolMatch = normalizedCommand.match(patterns.symbol);
      if (symbolMatch) {
        tradeData.symbol = symbolMatch[1].toUpperCase();
      }
      
      // Extract quantity
      const quantityMatch = normalizedCommand.match(patterns.quantity);
      if (quantityMatch) {
        tradeData.quantity = parseFloat(quantityMatch[1]);
      }
      
      // Extract entry price
      const entryMatch = normalizedCommand.match(patterns.entry);
      if (entryMatch) {
        tradeData.entry_price = parseFloat(entryMatch[3].replace(/,/g, ''));
      }
      
      // Extract stop loss
      const stopMatch = normalizedCommand.match(patterns.stop);
      if (stopMatch) {
        tradeData.stop_loss = parseFloat(stopMatch[3].replace(/,/g, ''));
      }
      
      // Extract target
      const targetMatch = normalizedCommand.match(patterns.target);
      if (targetMatch) {
        tradeData.target_price = parseFloat(targetMatch[3].replace(/,/g, ''));
      }
      
      // Extract timeframe
      const timeframeMatch = normalizedCommand.match(patterns.timeframe);
      if (timeframeMatch) {
        const value = timeframeMatch[1];
        const unit = timeframeMatch[2];
        tradeData.timeframe = `${value}${unit.charAt(0)}`; // e.g., "5m", "1h", "1d"
      }
      
      // Validate parsed data
      const requiredFields = ['direction', 'symbol'];
      const missingFields = requiredFields.filter(field => !tradeData[field]);
      
      if (missingFields.length > 0) {
        setStatus('error');
        enqueueSnackbar(
          `Missing required information: ${missingFields.join(', ')}. Please try again.`,
          { variant: 'warning' }
        );
        return;
      }
      
      // Calculate risk-reward if we have entry, stop, and target
      if (tradeData.entry_price && tradeData.stop_loss && tradeData.target_price) {
        const risk = Math.abs(tradeData.entry_price - tradeData.stop_loss);
        const reward = Math.abs(tradeData.target_price - tradeData.entry_price);
        tradeData.planned_risk_reward = reward / risk;
      }
      
      setParsedData(tradeData);
      setStatus('success');
      
      enqueueSnackbar(
        '🎤 Voice command processed successfully!',
        { variant: 'success' }
      );
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      setStatus('error');
      enqueueSnackbar('Failed to process voice command', { variant: 'error' });
    }
  };
  
  const handleUseParsedData = () => {
    if (parsedData && onTradeDataParsed) {
      onTradeDataParsed(parsedData);
      onClose && onClose();
    }
  };
  
  const handleReset = () => {
    setTranscript('');
    setConfidence(0);
    setStatus('idle');
    setParsedData(null);
  };
  
  if (!isSupported) {
    return (
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
        action={
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        }
      >
        <Typography variant="body2">
          Voice recognition is not supported in your browser. 
          Please use Chrome, Edge, or Safari for voice trade entry.
        </Typography>
      </Alert>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardVoice color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Voice Trade Entry
            </Typography>
            <Chip
              label="Beta"
              size="small"
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Show voice commands examples">
              <IconButton 
                size="small" 
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <Info />
              </IconButton>
            </Tooltip>
            {onClose && (
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <CardContent>
          {/* Instructions */}
          <Collapse in={showInstructions}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Voice Command Examples:
              </Typography>
              {examplePhrases.map((phrase, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5, fontStyle: 'italic' }}>
                  • "{phrase}"
                </Typography>
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Speak clearly and include direction, symbol, and quantity at minimum.
              </Typography>
            </Alert>
          </Collapse>
          
          {/* Voice Control Interface */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Mic />}
                    onClick={startListening}
                    disabled={disabled || isListening}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    Start Voice Entry
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click and speak your trade details
                  </Typography>
                </motion.div>
              )}
              
              {status === 'listening' && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<MicOff />}
                        onClick={stopListening}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Stop Recording
                      </Button>
                    </motion.div>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    🎤 Listening... Speak your trade details now
                  </Typography>
                </motion.div>
              )}
              
              {status === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.2)
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    🧠 Processing your trade command...
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
          
          {/* Transcript Display */}
          {transcript && (
            <Fade in={!!transcript}>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.7),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Transcript {confidence > 0 && `(${Math.round(confidence * 100)}% confidence)`}:
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{transcript}"
                </Typography>
              </Box>
            </Fade>
          )}
          
          {/* Parsed Trade Data */}
          {parsedData && status === 'success' && (
            <Fade in={status === 'success'}>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Parsed Trade Data
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                  {Object.entries(parsedData).map(([key, value]) => {
                    if (!value || key === 'notes') return null;
                    return (
                      <Chip
                        key={key}
                        label={`${key.replace('_', ' ')}: ${value}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    );
                  })}
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleUseParsedData}
                    startIcon={<CheckCircle />}
                    sx={{ flex: 1 }}
                  >
                    Use This Data
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<Refresh />}
                  >
                    Try Again
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* Error State */}
          {status === 'error' && (
            <Fade in={status === 'error'}>
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button
                    size="small"
                    onClick={handleReset}
                    startIcon={<Refresh />}
                  >
                    Try Again
                  </Button>
                }
              >
                Voice recognition failed. Please check your microphone and try again.
              </Alert>
            </Fade>
          )}
          
          {/* Tips */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            💡 Tip: Speak clearly and include direction (long/short), symbol, quantity, and prices for best results
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoiceTradeEntry;
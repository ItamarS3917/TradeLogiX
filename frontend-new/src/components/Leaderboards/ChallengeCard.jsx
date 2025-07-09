import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Whatshot,
  Timer,
  People,
  EmojiEvents,
  Info,
  TrendingUp,
  Close,
  AccessTime,
  Flag
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ChallengeCard = ({ challenge, onJoin }) => {
  const theme = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(challenge.end_date);
    const diffTime = endDate - now;
    
    if (diffTime <= 0) return 'Ended';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
    return `${diffHours}h left`;
  };

  const getProgressPercentage = () => {
    if (!challenge.max_participants) return 0;
    return (challenge.current_participants / challenge.max_participants) * 100;
  };

  const getChallengeIcon = () => {
    const iconMap = {
      'weekly_scalper': <Timer />,
      'risk_manager': <EmojiEvents />,
      'consistency': <TrendingUp />,
      'best_friday': <Whatshot />,
      'profit_factor': <TrendingUp />
    };
    return iconMap[challenge.challenge_type] || <Whatshot />;
  };

  const getChallengeColor = () => {
    const colorMap = {
      'weekly_scalper': theme.palette.error.main,
      'risk_manager': theme.palette.success.main,
      'consistency': theme.palette.info.main,
      'best_friday': theme.palette.warning.main,
      'profit_factor': theme.palette.primary.main
    };
    return colorMap[challenge.challenge_type] || theme.palette.primary.main;
  };

  const isEnded = () => {
    return new Date() > new Date(challenge.end_date);
  };

  const isFull = () => {
    return challenge.max_participants && challenge.current_participants >= challenge.max_participants;
  };

  const handleJoin = async () => {
    if (isEnded() || isFull()) return;
    
    setJoining(true);
    try {
      await onJoin(challenge.id);
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setJoining(false);
    }
  };

  const challengeColor = getChallengeColor();

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: `linear-gradient(135deg, ${alpha(challengeColor, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
            border: `2px solid ${alpha(challengeColor, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: `0 8px 25px ${alpha(challengeColor, 0.2)}`
            }
          }}
        >
          {/* Challenge Status Banner */}
          {(challenge.is_featured || isEnded() || isFull()) && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: -25,
                backgroundColor: isEnded() ? theme.palette.error.main : 
                                isFull() ? theme.palette.warning.main : 
                                challenge.is_featured ? challengeColor : 'transparent',
                color: 'white',
                px: 4,
                py: 0.5,
                transform: 'rotate(45deg)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                zIndex: 1
              }}
            >
              {isEnded() ? 'ENDED' : isFull() ? 'FULL' : 'FEATURED'}
            </Box>
          )}

          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(challengeColor, 0.1)}, transparent)`,
              pointerEvents: 'none'
            }}
          />

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: challengeColor,
                  width: 48,
                  height: 48,
                  color: 'white'
                }}
              >
                {getChallengeIcon()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {challenge.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {getTimeRemaining()}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Challenge Details">
                <IconButton
                  size="small"
                  onClick={() => setDetailsOpen(true)}
                  sx={{ color: challengeColor }}
                >
                  <Info />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Description */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, lineHeight: 1.4 }}
            >
              {challenge.description}
            </Typography>

            {/* Challenge Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {challenge.current_participants}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Participants
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {challenge.target_metric?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Performance'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Metric
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Participation Progress */}
            {challenge.max_participants && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Spots Filled
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {challenge.current_participants}/{challenge.max_participants}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[500], 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: challengeColor,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            )}

            {/* Challenge Duration */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Starts
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {formatDate(challenge.start_date)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Ends
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {formatDate(challenge.end_date)}
                </Typography>
              </Box>
            </Box>

            {/* Rewards Preview */}
            {challenge.rewards && Object.keys(challenge.rewards).length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Rewards
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Object.entries(challenge.rewards).slice(0, 2).map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(challengeColor, 0.1),
                        color: challengeColor,
                        fontSize: '0.7rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0 }}>
            <Button
              variant={isEnded() || isFull() ? "outlined" : "contained"}
              fullWidth
              onClick={handleJoin}
              disabled={isEnded() || isFull() || joining}
              startIcon={isEnded() ? <Flag /> : isFull() ? <People /> : <Whatshot />}
              sx={{
                backgroundColor: !isEnded() && !isFull() ? challengeColor : 'transparent',
                borderColor: challengeColor,
                color: isEnded() || isFull() ? challengeColor : 'white',
                '&:hover': {
                  backgroundColor: !isEnded() && !isFull() ? alpha(challengeColor, 0.8) : alpha(challengeColor, 0.1)
                }
              }}
            >
              {joining ? 'Joining...' : 
               isEnded() ? 'Challenge Ended' : 
               isFull() ? 'Challenge Full' : 
               'Join Challenge'}
            </Button>
          </CardActions>
        </Card>
      </motion.div>

      {/* Challenge Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: challengeColor,
              width: 48,
              height: 48
            }}
          >
            {getChallengeIcon()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{challenge.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {challenge.challenge_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {challenge.description}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Challenge Info
              </Typography>
              <Box sx={{ space: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Target Metric:</strong> {challenge.target_metric?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Duration:</strong> {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Participants:</strong> {challenge.current_participants}{challenge.max_participants ? `/${challenge.max_participants}` : ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {challenge.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Rules & Rewards
              </Typography>
              {challenge.rules && Object.keys(challenge.rules).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Rules:
                  </Typography>
                  {Object.entries(challenge.rules).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                      • {key.replace('_', ' ')}: {value}
                    </Typography>
                  ))}
                </Box>
              )}
              
              {challenge.rewards && Object.keys(challenge.rewards).length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Rewards:
                  </Typography>
                  {Object.entries(challenge.rewards).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                      • {key.replace('_', ' ')}: {value}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleJoin}
            disabled={isEnded() || isFull() || joining}
            sx={{ backgroundColor: challengeColor }}
          >
            {joining ? 'Joining...' : 
             isEnded() ? 'Challenge Ended' : 
             isFull() ? 'Challenge Full' : 
             'Join Challenge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChallengeCard;
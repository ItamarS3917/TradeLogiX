import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Skeleton,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  EmojiEvents,
  Info,
  Close,
  Star,
  Timeline,
  TrendingUp,
  Shield,
  Assignment,
  Schedule,
  Whatshot,
  LocalFireDepartment,
  MilitaryTech
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementGrid = ({ achievements = [], loading = false, onRefresh }) => {
  const theme = useTheme();
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const getAchievementIcon = (achievementType) => {
    const iconMap = {
      'consistency_king': <Star />,
      'risk_manager': <Shield />,
      'ict_killzone_master': <TrendingUp />,
      'mmxm_breakout_expert': <Timeline />,
      'plan_follower': <Assignment />,
      'early_bird': <Schedule />,
      'win_streak_5': <Whatshot />,
      'win_streak_10': <LocalFireDepartment />,
      'win_streak_20': <MilitaryTech />,
      'green_week': <TrendingUp />,
      'green_month': <TrendingUp />
    };
    return iconMap[achievementType] || <EmojiEvents />;
  };

  const getAchievementColor = (achievementType) => {
    const colorMap = {
      'consistency_king': '#FFD700',
      'risk_manager': '#4CAF50',
      'ict_killzone_master': '#2196F3',
      'mmxm_breakout_expert': '#FF9800',
      'plan_follower': '#9C27B0',
      'early_bird': '#FF5722',
      'win_streak_5': '#F44336',
      'win_streak_10': '#E91E63',
      'win_streak_20': '#3F51B5',
      'green_week': '#8BC34A',
      'green_month': '#4CAF50'
    };
    return colorMap[achievementType] || theme.palette.primary.main;
  };

  const getAchievementRarity = (achievementType) => {
    const rarityMap = {
      'consistency_king': 'Epic',
      'risk_manager': 'Rare',
      'ict_killzone_master': 'Rare',
      'mmxm_breakout_expert': 'Rare',
      'plan_follower': 'Common',
      'early_bird': 'Common',
      'win_streak_5': 'Uncommon',
      'win_streak_10': 'Rare',
      'win_streak_20': 'Legendary',
      'green_week': 'Uncommon',
      'green_month': 'Rare'
    };
    return rarityMap[achievementType] || 'Common';
  };

  const getRarityColor = (rarity) => {
    const rarityColors = {
      'Common': theme.palette.grey[500],
      'Uncommon': theme.palette.success.main,
      'Rare': theme.palette.info.main,
      'Epic': theme.palette.warning.main,
      'Legendary': theme.palette.error.main
    };
    return rarityColors[rarity] || theme.palette.grey[500];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const handleCloseDialog = () => {
    setSelectedAchievement(null);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="40%" height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          textAlign: 'center',
          p: 4,
          '& .MuiAlert-icon': {
            fontSize: '2rem'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          No achievements yet
        </Typography>
        <Typography variant="body2">
          Start trading and following your plan to earn your first badges!
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        <AnimatePresence>
          {achievements.map((achievement, index) => {
            const iconColor = getAchievementColor(achievement.achievement_type);
            const rarity = getAchievementRarity(achievement.achievement_type);
            const rarityColor = getRarityColor(rarity);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={achievement.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${alpha(iconColor, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                      border: `2px solid ${alpha(iconColor, 0.3)}`,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(iconColor, 0.3)}`
                      }
                    }}
                    onClick={() => handleAchievementClick(achievement)}
                  >
                    {/* Rarity indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    >
                      <Chip
                        label={rarity}
                        size="small"
                        sx={{
                          backgroundColor: alpha(rarityColor, 0.1),
                          color: rarityColor,
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    {/* Background decoration */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(iconColor, 0.1)}, transparent)`,
                        pointerEvents: 'none'
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      {/* Achievement Icon and Title */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: iconColor,
                            width: 48,
                            height: 48,
                            color: 'white'
                          }}
                        >
                          {getAchievementIcon(achievement.achievement_type)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              lineHeight: 1.2
                            }}
                          >
                            {achievement.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Earned {formatDate(achievement.earned_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.4,
                          fontSize: '0.85rem'
                        }}
                      >
                        {achievement.description}
                      </Typography>

                      {/* Criteria Met */}
                      {achievement.criteria_met && Object.keys(achievement.criteria_met).length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Object.entries(achievement.criteria_met).slice(0, 2).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key.replace('_', ' ')}: ${value}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 24,
                                borderColor: alpha(iconColor, 0.5),
                                color: iconColor
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Info Icon */}
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          color: iconColor,
                          opacity: 0.7,
                          '&:hover': {
                            opacity: 1,
                            backgroundColor: alpha(iconColor, 0.1)
                          }
                        }}
                      >
                        <Info fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Achievement Detail Dialog */}
      <Dialog
        open={!!selectedAchievement}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedAchievement && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getAchievementColor(selectedAchievement.achievement_type),
                  width: 48,
                  height: 48
                }}
              >
                {getAchievementIcon(selectedAchievement.achievement_type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{selectedAchievement.title}</Typography>
                <Chip
                  label={getAchievementRarity(selectedAchievement.achievement_type)}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      getRarityColor(getAchievementRarity(selectedAchievement.achievement_type)), 
                      0.1
                    ),
                    color: getRarityColor(getAchievementRarity(selectedAchievement.achievement_type))
                  }}
                />
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedAchievement.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Achievement Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Earned:</strong> {formatDate(selectedAchievement.earned_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Type:</strong> {selectedAchievement.achievement_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              </Box>

              {selectedAchievement.criteria_met && Object.keys(selectedAchievement.criteria_met).length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Criteria Met
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(selectedAchievement.criteria_met).map(([key, value]) => (
                      <Grid item xs={6} key={key}>
                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 1,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default AchievementGrid;
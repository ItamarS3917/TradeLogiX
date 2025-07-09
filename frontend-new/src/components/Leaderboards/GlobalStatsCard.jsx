import React from 'react';
import {
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  Avatar,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  People,
  TrendingUp,
  EmojiEvents,
  Whatshot,
  Refresh,
  BarChart,
  Timeline,
  Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const GlobalStatsCard = ({ stats, loading = false, onRefresh }) => {
  const theme = useTheme();

  const statsCards = [
    {
      title: 'Active Traders',
      value: stats?.total_active_users || 0,
      icon: <People />,
      color: theme.palette.primary.main,
      description: 'Total users trading this month'
    },
    {
      title: 'Competing This Month',
      value: stats?.current_month_participants || 0,
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      description: 'Users in leaderboards'
    },
    {
      title: 'Active Challenges',
      value: stats?.active_challenges || 0,
      icon: <Whatshot />,
      color: theme.palette.warning.main,
      description: 'Ongoing competitions'
    },
    {
      title: 'Achievements Earned',
      value: stats?.achievements_awarded_this_month || 0,
      icon: <EmojiEvents />,
      color: theme.palette.info.main,
      description: 'Badges earned this month'
    },
    {
      title: 'Leaderboard Types',
      value: stats?.leaderboard_types || 0,
      icon: <BarChart />,
      color: theme.palette.secondary.main,
      description: 'Different ranking categories'
    },
    {
      title: 'Achievement Types',
      value: stats?.achievement_types || 0,
      icon: <Star />,
      color: theme.palette.error.main,
      description: 'Different badges available'
    }
  ];

  if (loading) {
    return (
      <Grid container spacing={3}>
        {statsCards.map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="100%" height={16} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmojiEvents color="primary" />
              Community Statistics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Global trading community insights and participation metrics
            </Typography>
          </Box>
          <IconButton onClick={onRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                  border: `2px solid ${alpha(stat.color, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  '&:hover': {
                    boxShadow: `0 8px 25px ${alpha(stat.color, 0.2)}`
                  }
                }}
              >
                {/* Background decoration */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(stat.color, 0.1)}, transparent)`,
                    pointerEvents: 'none'
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        width: 48,
                        height: 48,
                        color: 'white'
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.4 }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Community Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Community Insights
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats?.current_month_participants && stats?.total_active_users 
                    ? Math.round((stats.current_month_participants / stats.total_active_users) * 100)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participation Rate
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Users competing in leaderboards
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {stats?.achievements_awarded_this_month && stats?.current_month_participants
                    ? Math.round(stats.achievements_awarded_this_month / stats.current_month_participants * 100) / 100
                    : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Achievements
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Per active trader this month
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {stats?.active_challenges || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live Competitions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Join now to compete!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            🏆 Join the competition and climb the leaderboards! 🏆
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Rankings update in real-time • All data is anonymized for privacy
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default GlobalStatsCard;
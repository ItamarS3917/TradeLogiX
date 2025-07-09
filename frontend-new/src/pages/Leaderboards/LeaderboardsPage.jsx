import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Leaderboard as LeaderboardIcon,
  EmojiEvents,
  TrendingUp,
  Shield,
  Timer,
  Whatshot,
  Star,
  Refresh,
  Info,
  Celebration,
  BarChart,
  Timeline
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import components we'll create
import LeaderboardTable from '../../components/Leaderboards/LeaderboardTable';
import AchievementGrid from '../../components/Leaderboards/AchievementGrid';
import ChallengeCard from '../../components/Leaderboards/ChallengeCard';
import UserRankCard from '../../components/Leaderboards/UserRankCard';
import GlobalStatsCard from '../../components/Leaderboards/GlobalStatsCard';

// Import services
import { leaderboardService } from '../../services/leaderboardService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

const LeaderboardsPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('monthly_win_rate');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [leaderboardTypes, setLeaderboardTypes] = useState([]);

  // Available periods
  const periods = [
    { value: 'current_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'current_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' }
  ];

  // Tab configuration
  const tabs = [
    { 
      label: 'Rankings', 
      icon: <LeaderboardIcon />,
      description: 'Anonymous performance rankings'
    },
    { 
      label: 'My Achievements', 
      icon: <EmojiEvents />,
      description: 'Your earned badges and milestones'
    },
    { 
      label: 'Challenges', 
      icon: <Whatshot />,
      description: 'Active trading competitions'
    },
    { 
      label: 'Global Stats', 
      icon: <BarChart />,
      description: 'Community insights and statistics'
    }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when tab or filters change
  useEffect(() => {
    if (activeTab === 0) {
      loadLeaderboardData();
    } else if (activeTab === 1) {
      loadAchievements();
    } else if (activeTab === 2) {
      loadChallenges();
    } else if (activeTab === 3) {
      loadGlobalStats();
    }
  }, [activeTab, selectedLeaderboard, selectedPeriod]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load leaderboard types
      const types = await leaderboardService.getLeaderboardTypes();
      setLeaderboardTypes(types);
      
      // Load initial leaderboard data
      await loadLeaderboardData();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      enqueueSnackbar('Failed to load leaderboards data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setRefreshing(true);
      
      // Load leaderboard entries
      const [leaderboard, rank] = await Promise.all([
        leaderboardService.getLeaderboard(selectedLeaderboard, selectedPeriod),
        leaderboardService.getUserRank(selectedLeaderboard, selectedPeriod)
      ]);
      
      setLeaderboardData(leaderboard);
      setUserRank(rank);
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      enqueueSnackbar('Failed to load leaderboard data', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const loadAchievements = async () => {
    try {
      setRefreshing(true);
      const userAchievements = await leaderboardService.getUserAchievements();
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      enqueueSnackbar('Failed to load achievements', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const loadChallenges = async () => {
    try {
      setRefreshing(true);
      const activeChallenges = await leaderboardService.getActiveChallenges();
      setChallenges(activeChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      enqueueSnackbar('Failed to load challenges', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      setRefreshing(true);
      const stats = await leaderboardService.getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error('Error loading global stats:', error);
      enqueueSnackbar('Failed to load global statistics', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 0) {
      loadLeaderboardData();
    } else if (activeTab === 1) {
      loadAchievements();
    } else if (activeTab === 2) {
      loadChallenges();
    } else if (activeTab === 3) {
      loadGlobalStats();
    }
  };

  const handleCheckAchievements = async () => {
    try {
      setRefreshing(true);
      const result = await leaderboardService.checkAchievements();
      
      if (result.new_achievements > 0) {
        enqueueSnackbar(
          `🎉 Congratulations! You earned ${result.new_achievements} new achievement${result.new_achievements > 1 ? 's' : ''}!`,
          { variant: 'success', autoHideDuration: 6000 }
        );
        await loadAchievements();
      } else {
        enqueueSnackbar('No new achievements at this time. Keep trading!', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      enqueueSnackbar('Failed to check achievements', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const getLeaderboardIcon = (type) => {
    const iconMap = {
      'monthly_win_rate': <TrendingUp />,
      'monthly_profit_factor': <Timeline />,
      'monthly_max_drawdown': <Shield />,
      'weekly_consistency': <Timer />,
      'risk_manager': <Shield />,
      'streak_master': <Whatshot />
    };
    return iconMap[type] || <LeaderboardIcon />;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={500} height={30} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            <EmojiEvents sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: theme.palette.primary.main }} />
            Trading Leaderboards
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Anonymous rankings, achievements, and community challenges
          </Typography>
          
          {/* Quick Stats Banner */}
          {globalStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Grid container spacing={3} justifyContent="center">
                  <Grid item>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {globalStats.total_active_users}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Traders
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                      {globalStats.current_month_participants}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {globalStats.active_challenges}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Challenges
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {globalStats.achievements_awarded_this_month}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Achievements Earned
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </Box>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 80,
                flexDirection: 'column',
                gap: 1
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {tab.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tab.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Rankings Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Controls */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Leaderboard Type</InputLabel>
                      <Select
                        value={selectedLeaderboard}
                        label="Leaderboard Type"
                        onChange={(e) => setSelectedLeaderboard(e.target.value)}
                        startAdornment={getLeaderboardIcon(selectedLeaderboard)}
                      >
                        {leaderboardTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getLeaderboardIcon(type.value)}
                              <Box>
                                <Typography variant="body1">{type.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Time Period</InputLabel>
                      <Select
                        value={selectedPeriod}
                        label="Time Period"
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                      >
                        {periods.map((period) => (
                          <MenuItem key={period.value} value={period.value}>
                            {period.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="outlined"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      startIcon={<Refresh />}
                      fullWidth
                    >
                      Refresh Rankings
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <Tooltip title="Leaderboards update automatically. Refresh for latest data.">
                      <IconButton>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>

              {/* User Rank Card */}
              {userRank && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <UserRankCard 
                    rank={userRank} 
                    leaderboardType={selectedLeaderboard}
                    period={selectedPeriod}
                    sx={{ mb: 3 }}
                  />
                </motion.div>
              )}

              {/* Leaderboard Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LeaderboardTable
                  data={leaderboardData}
                  leaderboardType={selectedLeaderboard}
                  loading={refreshing}
                  userRank={userRank}
                />
              </motion.div>
            </Box>
          )}

          {/* Achievements Tab */}
          {activeTab === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEvents color="primary" />
                      Your Trading Achievements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Badges and milestones you've earned through exceptional trading performance
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleCheckAchievements}
                      disabled={refreshing}
                      startIcon={<Celebration />}
                    >
                      Check for New Achievements
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <AchievementGrid
                achievements={achievements}
                loading={refreshing}
                onRefresh={loadAchievements}
              />
            </Box>
          )}

          {/* Challenges Tab */}
          {activeTab === 2 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Whatshot color="primary" />
                  Active Trading Challenges
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join competitive challenges to test your skills against other traders
                </Typography>
              </Paper>

              <Grid container spacing={3}>
                {challenges.map((challenge) => (
                  <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                    <ChallengeCard
                      challenge={challenge}
                      onJoin={() => {
                        // Handle challenge join
                        enqueueSnackbar('Challenge joined successfully!', { variant: 'success' });
                      }}
                    />
                  </Grid>
                ))}
                
                {challenges.length === 0 && !refreshing && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ textAlign: 'center' }}>
                      No active challenges at the moment. Check back soon for new competitions!
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Global Stats Tab */}
          {activeTab === 3 && globalStats && (
            <Box>
              <GlobalStatsCard
                stats={globalStats}
                loading={refreshing}
                onRefresh={loadGlobalStats}
              />
            </Box>
          )}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};

export default LeaderboardsPage;
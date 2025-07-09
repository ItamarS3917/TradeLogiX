import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Person,
  BarChart,
  Timeline
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserRankCard = ({ 
  rank, 
  leaderboardType = 'monthly_win_rate', 
  period = 'current_month',
  sx = {} 
}) => {
  const theme = useTheme();

  if (!rank) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', ...sx }}>
        <Typography variant="h6" color="text.secondary">
          You haven't qualified for this leaderboard yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete at least 5 trades to appear in the rankings
        </Typography>
      </Paper>
    );
  }

  const getRankColor = () => {
    if (rank.rank === 1) return '#FFD700';
    if (rank.rank === 2) return '#C0C0C0';
    if (rank.rank === 3) return '#CD7F32';
    if (rank.rank <= 10) return theme.palette.primary.main;
    if (rank.rank <= 25) return theme.palette.info.main;
    return theme.palette.text.secondary;
  };

  const getRankIcon = () => {
    if (rank.rank === 1) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 40 }} />;
    if (rank.rank === 2) return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 40 }} />;
    if (rank.rank === 3) return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 40 }} />;
    return <Person sx={{ color: getRankColor(), fontSize: 40 }} />;
  };

  const getRankDescription = () => {
    if (rank.rank === 1) return "🏆 Champion! You're #1!";
    if (rank.rank <= 3) return `🥉 Podium finish! Top ${rank.rank}`;
    if (rank.rank <= 10) return "⭐ Elite performer! Top 10";
    if (rank.rank <= 25) return "🔥 Strong showing! Top 25";
    if (rank.percentile >= 75) return "💪 Above average trader";
    if (rank.percentile >= 50) return "📈 Keep improving!";
    return "🎯 Room to grow";
  };

  const getPrimaryMetric = () => {
    switch (leaderboardType) {
      case 'monthly_win_rate':
        return { value: `${rank.win_rate}%`, label: 'Win Rate', icon: <TrendingUp /> };
      case 'monthly_profit_factor':
        return { value: rank.profit_factor?.toFixed(2) || '0.00', label: 'Profit Factor', icon: <BarChart /> };
      case 'monthly_max_drawdown':
        return { value: `$${Math.abs(rank.max_drawdown || 0).toFixed(2)}`, label: 'Max Drawdown', icon: <Timeline /> };
      case 'weekly_consistency':
        return { value: `${rank.consistency_score?.toFixed(1) || '0.0'}`, label: 'Consistency', icon: <BarChart /> };
      case 'risk_manager':
        return { value: `${rank.risk_score?.toFixed(1) || '0.0'}`, label: 'Risk Score', icon: <BarChart /> };
      default:
        return { value: `${rank.win_rate}%`, label: 'Win Rate', icon: <TrendingUp /> };
    }
  };

  const primaryMetric = getPrimaryMetric();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(getRankColor(), 0.1)}, ${alpha(theme.palette.background.paper, 0.8)})`,
          border: `2px solid ${alpha(getRankColor(), 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
          ...sx
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(getRankColor(), 0.1)}, transparent)`,
            pointerEvents: 'none'
          }}
        />

        <Grid container spacing={3} alignItems="center">
          {/* Rank and Icon */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 1 }}>
                {getRankIcon()}
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: getRankColor(),
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                #{rank.rank}
              </Typography>
              <Chip
                label={`Top ${rank.percentile.toFixed(0)}%`}
                sx={{
                  backgroundColor: alpha(getRankColor(), 0.1),
                  color: getRankColor(),
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Grid>

          {/* Trader Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Avatar
                  sx={{
                    bgcolor: getRankColor(),
                    width: 48,
                    height: 48,
                    fontSize: '1.2rem'
                  }}
                >
                  {rank.anonymous_id?.charAt(0) || 'T'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {rank.anonymous_id || 'Your Anonymous ID'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Trading Identity
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: getRankColor(),
                  fontWeight: 'medium',
                  fontStyle: 'italic'
                }}
              >
                {getRankDescription()}
              </Typography>
            </Box>
          </Grid>

          {/* Primary Metric */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                {primaryMetric.icon}
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {primaryMetric.label}
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }}
              >
                {primaryMetric.value}
              </Typography>
            </Box>
          </Grid>

          {/* Stats Summary */}
          <Grid item xs={12} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Competition Stats
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {rank.total_trades} trades
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  color: (rank.total_pnl || 0) >= 0 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  fontWeight: 'medium'
                }}
              >
                ${(rank.total_pnl || 0).toFixed(2)} P&L
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Percentile Ranking
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {rank.percentile.toFixed(1)}% ({rank.total_participants} traders)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={rank.percentile}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.grey[500], 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: getRankColor(),
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Period Info */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
            {leaderboardType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Leaderboard
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default UserRankCard;
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  Box,
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Shield,
  Timeline,
  Whatshot
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LeaderboardTable = ({ 
  data = [], 
  leaderboardType = 'monthly_win_rate', 
  loading = false,
  userRank = null 
}) => {
  const theme = useTheme();

  const getPrimaryMetric = (entry) => {
    switch (leaderboardType) {
      case 'monthly_win_rate':
        return { value: `${entry.win_rate}%`, label: 'Win Rate' };
      case 'monthly_profit_factor':
        return { value: entry.profit_factor?.toFixed(2) || '0.00', label: 'Profit Factor' };
      case 'monthly_max_drawdown':
        return { value: `$${Math.abs(entry.max_drawdown || 0).toFixed(2)}`, label: 'Max Drawdown' };
      case 'weekly_consistency':
        return { value: `${entry.consistency_score?.toFixed(1) || '0.0'}`, label: 'Consistency' };
      case 'risk_manager':
        return { value: `${entry.risk_score?.toFixed(1) || '0.0'}`, label: 'Risk Score' };
      default:
        return { value: `${entry.win_rate}%`, label: 'Win Rate' };
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (rank === 2) return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return theme.palette.text.secondary;
  };

  const getPercentileColor = (percentile) => {
    if (percentile >= 90) return theme.palette.success.main;
    if (percentile >= 75) return theme.palette.info.main;
    if (percentile >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const isUserRow = (entry) => {
    return userRank && entry.anonymous_id === userRank.anonymous_id;
  };

  if (loading) {
    return (
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Trader</TableCell>
                <TableCell align="right">Primary Metric</TableCell>
                <TableCell align="right">Trades</TableCell>
                <TableCell align="right">Total P&L</TableCell>
                <TableCell align="right">Percentile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={30} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={40} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Whatshot sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No leaderboard data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Be the first to compete in this leaderboard!
        </Typography>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trader</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {getPrimaryMetric(data[0] || {}).label}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Trades</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total P&L</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Percentile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, index) => {
                const primaryMetric = getPrimaryMetric(entry);
                const isUser = isUserRow(entry);
                
                return (
                  <motion.tr
                    key={entry.id || index}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    sx={{
                      backgroundColor: isUser 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      border: isUser 
                        ? `2px solid ${theme.palette.primary.main}`
                        : 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRankIcon(entry.rank)}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: getRankColor(entry.rank),
                            fontWeight: entry.rank <= 3 ? 'bold' : 'normal'
                          }}
                        >
                          #{entry.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem'
                          }}
                        >
                          {entry.anonymous_id?.charAt(0) || 'T'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {entry.anonymous_id || 'Anonymous Trader'}
                          </Typography>
                          {isUser && (
                            <Chip 
                              label="You" 
                              size="small" 
                              color="primary"
                              sx={{ fontSize: '0.7rem', height: 18 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {primaryMetric.value}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2">
                        {entry.total_trades || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        sx={{
                          color: (entry.total_pnl || 0) >= 0 
                            ? theme.palette.success.main 
                            : theme.palette.error.main,
                          fontWeight: 'medium'
                        }}
                      >
                        ${(entry.total_pnl || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Chip
                        label={`${(entry.percentile || 0).toFixed(0)}%`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPercentileColor(entry.percentile || 0), 0.1),
                          color: getPercentileColor(entry.percentile || 0),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Footer with total entries info */}
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} traders • Updated in real-time
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default LeaderboardTable;
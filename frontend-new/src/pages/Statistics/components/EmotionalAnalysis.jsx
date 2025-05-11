import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Mood as MoodIcon,
  SentimentVeryDissatisfied as SadIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const EmotionalAnalysis = ({ data }) => {
  if (!data || !data.emotions || data.emotions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Emotional Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No emotional data available for the selected filters. Try changing your date range or other filters.
        </Typography>
      </Paper>
    );
  }
  
  // Colors for charts
  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'];
  
  // Sort emotions by count
  const sortedEmotions = [...data.emotions].sort((a, b) => b.count - a.count);
  
  // Prepare pie chart data
  const pieData = sortedEmotions.map(emotion => ({
    name: emotion.name,
    value: emotion.count
  }));
  
  // Prepare radar chart data - win rate by emotion
  const radarData = sortedEmotions.map(emotion => ({
    emotion: emotion.name,
    winRate: emotion.winRate
  }));
  
  // Prepare bar chart data - average profit by emotion
  const barData = sortedEmotions.map(emotion => ({
    name: emotion.name,
    averageProfit: emotion.averageProfit,
    color: emotion.averageProfit >= 0 ? '#4caf50' : '#f44336'
  }));

  // Extract best and worst emotions
  const { bestEmotionByWinRate, worstEmotionByWinRate, mostProfitableEmotion } = data;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Emotional Analysis
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <MoodIcon sx={{ mr: 1 }} />
                Best Emotional States
              </Typography>
              
              {bestEmotionByWinRate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Highest Win Rate
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {bestEmotionByWinRate.name} ({bestEmotionByWinRate.winRate}%)
                  </Typography>
                  <Typography variant="body2">
                    {bestEmotionByWinRate.count} trades
                  </Typography>
                </Box>
              )}
              
              {mostProfitableEmotion && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Most Profitable Emotion
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {mostProfitableEmotion.name} (${mostProfitableEmotion.averageProfit.toFixed(2)})
                  </Typography>
                  <Typography variant="body2">
                    {mostProfitableEmotion.count} trades
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="error" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <SadIcon sx={{ mr: 1 }} />
                Problematic Emotions
              </Typography>
              
              {worstEmotionByWinRate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lowest Win Rate
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {worstEmotionByWinRate.name} ({worstEmotionByWinRate.winRate}%)
                  </Typography>
                  <Typography variant="body2">
                    {worstEmotionByWinRate.count} trades
                  </Typography>
                </Box>
              )}
              
              {sortedEmotions.find(e => e.averageProfit < 0) && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Least Profitable Emotion
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {sortedEmotions.sort((a, b) => a.averageProfit - b.averageProfit)[0].name} 
                    (${sortedEmotions.sort((a, b) => a.averageProfit - b.averageProfit)[0].averageProfit.toFixed(2)})
                  </Typography>
                  <Typography variant="body2">
                    {sortedEmotions.sort((a, b) => a.averageProfit - b.averageProfit)[0].count} trades
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="info.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Emotional Trading Strategy
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">Optimize for Success:</Typography>
                <Typography variant="body2">
                  {bestEmotionByWinRate ? 
                    `Trade more when feeling ${bestEmotionByWinRate.name.toLowerCase()} to capitalize on your ${bestEmotionByWinRate.winRate}% win rate.` : 
                    'No emotion data available to analyze.'
                  }
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />
                  When to Avoid Trading:
                </Typography>
                <Typography variant="body2">
                  {worstEmotionByWinRate ? 
                    `Consider sitting out when feeling ${worstEmotionByWinRate.name.toLowerCase()} as it leads to only ${worstEmotionByWinRate.winRate}% win rate.` : 
                    'No emotion data available to analyze.'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Trade Distribution by Emotion
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Win Rate by Emotion
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="emotion" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Win Rate"
                    dataKey="winRate"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Average Profit by Emotion
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Average Profit ($)', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip formatter={(value) => ['$' + value.toFixed(2), 'Average Profit']} />
              <Legend />
              <Bar 
                dataKey="averageProfit" 
                name="Average Profit" 
                fill="fill"
                isAnimationActive={false}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Detailed Emotional Performance
        </Typography>
        
        <TableContainer component={Box} sx={{ maxHeight: 350, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Emotion</TableCell>
                <TableCell align="right">Trade Count</TableCell>
                <TableCell align="right">Win Count</TableCell>
                <TableCell align="right">Loss Count</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Net Profit</TableCell>
                <TableCell align="right">Avg Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEmotions.map((emotion) => (
                <TableRow 
                  key={emotion.name}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: emotion.netProfit > 0 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {emotion.name}
                  </TableCell>
                  <TableCell align="right">{emotion.count}</TableCell>
                  <TableCell align="right">{emotion.winCount}</TableCell>
                  <TableCell align="right">{emotion.lossCount}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      color: emotion.winRate >= 50 ? 'success.main' : 'error.main'
                    }}
                  >
                    {emotion.winRate}%
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: emotion.netProfit >= 0 ? 'success.main' : 'error.main' 
                    }}
                  >
                    ${emotion.netProfit.toFixed(2)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: emotion.averageProfit >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${emotion.averageProfit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Emotional Trading Insights
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Dominant Emotion:</strong> Your most common emotional state while trading is 
            <strong> {sortedEmotions[0]?.name}</strong> ({(sortedEmotions[0]?.count / sortedEmotions.reduce((acc, curr) => acc + curr.count, 0) * 100).toFixed(0)}% of trades).
          </Typography>
          
          {bestEmotionByWinRate && worstEmotionByWinRate && (
            <Typography variant="body2" paragraph>
              <strong>Emotional Spread:</strong> The difference between your best performing emotion 
              (<strong>{bestEmotionByWinRate.name}</strong> at {bestEmotionByWinRate.winRate}% win rate) and your worst performing emotion 
              (<strong>{worstEmotionByWinRate.name}</strong> at {worstEmotionByWinRate.winRate}% win rate) 
              is {(bestEmotionByWinRate.winRate - worstEmotionByWinRate.winRate).toFixed(1)} percentage points.
            </Typography>
          )}
          
          <Typography variant="body2" paragraph>
            <strong>Key Insight:</strong> {
              bestEmotionByWinRate?.name === sortedEmotions[0]?.name
                ? `Your most common emotional state (${bestEmotionByWinRate.name}) aligns with your best performing emotion, which is excellent.`
                : `Your most common emotional state (${sortedEmotions[0]?.name}) is not your best performing emotion. Consider working on achieving ${bestEmotionByWinRate?.name} more often when trading.`
            }
          </Typography>
          
          <Typography variant="body2" fontWeight="medium" color="primary">
            Trading Psychology Recommendation:
          </Typography>
          <Typography variant="body2" paragraph>
            {worstEmotionByWinRate && worstEmotionByWinRate.winRate < 40 
              ? `Implement a strict rule to avoid trading when feeling ${worstEmotionByWinRate.name.toLowerCase()}. The data clearly shows this emotional state leads to poor results.`
              : `Focus on developing emotional awareness before trading. A pre-trade routine to achieve your optimal emotional state (${bestEmotionByWinRate?.name.toLowerCase()}) could significantly improve your results.`
            }
          </Typography>
        </Box>
      </Paper>
    </Paper>
  );
};

export default EmotionalAnalysis;
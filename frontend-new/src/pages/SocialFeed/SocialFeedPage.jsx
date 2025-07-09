import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Avatar,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Badge,
  Tooltip,
  Fab,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  Add,
  Filter,
  Sort,
  Visibility,
  EmojiEvents,
  Star,
  Whatshot,
  ThumbUp,
  ThumbDown,
  Reply,
  Flag,
  BookmarkBorder,
  Bookmark,
  Send,
  Image,
  TrendingFlat,
  Timeline,
  Assessment,
  Group,
  Public,
  Lock,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

const SocialFeedPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showOnlyFollowing, setShowOnlyFollowing] = useState(false);

  // Tab configuration
  const tabs = [
    { label: 'Latest Feed', icon: <Timeline />, description: 'Recent community posts' },
    { label: 'Trade of the Day', icon: <EmojiEvents />, description: 'Featured exceptional trades' },
    { label: 'Hot Discussions', icon: <Whatshot />, description: 'Most commented posts' },
    { label: 'Following', icon: <Group />, description: 'Posts from traders you follow' }
  ];

  // Sample feed data (in production, this would come from your API)
  const sampleFeedData = [
    {
      id: 1,
      type: 'trade_share',
      user: {
        id: 'trader_001',
        username: 'NQ_Hunter',
        avatar: null,
        verified: true,
        rank: 'Elite Trader',
        followers: 1247
      },
      trade: {
        symbol: 'NQ',
        direction: 'Long',
        entry: 15450,
        exit: 15485,
        profit: '+$875',
        rr: '2.3:1',
        setup: 'FVG Fill + OTE',
        timeframe: '5m',
        screenshot: null
      },
      content: '🎯 Perfect FVG fill at the optimal trade entry! Waited patiently for the setup and got rewarded. The key was respecting the institutional order flow. #ICTconcepts #NQfutures',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 47,
      comments: 12,
      shares: 8,
      tags: ['ICT', 'FVG', 'NQ', 'Scalping'],
      privacy: 'public',
      featured: false,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      type: 'trade_of_day',
      user: {
        id: 'trader_002',
        username: 'SMC_Master',
        avatar: null,
        verified: false,
        rank: 'Funded Trader',
        followers: 892
      },
      trade: {
        symbol: 'ES',
        direction: 'Short',
        entry: 4385,
        exit: 4365,
        profit: '+$2,000',
        rr: '4.1:1',
        setup: 'Liquidity Grab + Order Block',
        timeframe: '15m',
        screenshot: '/api/placeholder/400/250'
      },
      content: '🔥 TRADE OF THE DAY submission! This liquidity grab was textbook. Market swept the highs to grab stops, then reacted perfectly from the order block. Risk was minimal but reward was massive! This is why we wait for quality setups. #TradeOfTheDay #SmartMoney',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 156,
      comments: 34,
      shares: 23,
      tags: ['SMC', 'OrderBlock', 'LiquidityGrab', 'ES'],
      privacy: 'public',
      featured: true,
      isLiked: true,
      isBookmarked: true
    },
    {
      id: 3,
      type: 'discussion',
      user: {
        id: 'trader_003',
        username: 'RiskManager_Pro',
        avatar: null,
        verified: true,
        rank: 'Professional',
        followers: 2156
      },
      content: '📚 Quick reminder about risk management: Your position size should be based on your stop loss distance, NOT your account size. I see too many traders risking 2% on a 50-point stop when they should be risking 2% on a 10-point stop with 5x the size. Thoughts? 🤔',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 203,
      comments: 67,
      shares: 41,
      tags: ['RiskManagement', 'Education', 'PositionSizing'],
      privacy: 'public',
      featured: false,
      isLiked: false,
      isBookmarked: true
    }
  ];

  useEffect(() => {
    loadFeedData();
  }, [activeTab, sortBy, filterBy, showOnlyFollowing]);

  const loadFeedData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter and sort sample data based on current settings
      let filteredData = [...sampleFeedData];
      
      // Apply tab filter
      switch (activeTab) {
        case 1: // Trade of the Day
          filteredData = filteredData.filter(post => post.featured || post.type === 'trade_of_day');
          break;
        case 2: // Hot Discussions
          filteredData = filteredData.sort((a, b) => b.comments - a.comments);
          break;
        case 3: // Following
          // In real app, filter by followed users
          filteredData = filteredData.filter(post => post.user.verified);
          break;
      }
      
      // Apply additional filters
      if (filterBy !== 'all') {
        filteredData = filteredData.filter(post => post.type === filterBy);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'popular':
          filteredData.sort((a, b) => b.likes - a.likes);
          break;
        case 'recent':
        default:
          filteredData.sort((a, b) => b.timestamp - a.timestamp);
          break;
      }
      
      setFeedPosts(filteredData);
    } catch (error) {
      console.error('Error loading feed:', error);
      enqueueSnackbar('Failed to load social feed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      setFeedPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      }));
      
      enqueueSnackbar('Reaction updated!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update reaction', { variant: 'error' });
    }
  };

  const handleBookmarkPost = async (postId) => {
    try {
      setFeedPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked
          };
        }
        return post;
      }));
      
      const post = feedPosts.find(p => p.id === postId);
      enqueueSnackbar(
        post?.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar('Failed to update bookmark', { variant: 'error' });
    }
  };

  const handleShareTrade = () => {
    setShareDialogOpen(true);
    // In real app, this would open a form to share a trade
  };

  const handleCommentOnPost = (post) => {
    setSelectedTrade(post);
    setCommentDialogOpen(true);
  };

  const getTradeDirectionIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'long':
        return <TrendingUp color="success" />;
      case 'short':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="primary" />;
    }
  };

  const getTradeDirectionColor = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'long':
        return 'success';
      case 'short':
        return 'error';
      default:
        return 'primary';
    }
  };

  const renderFeedPost = (post) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 3, position: 'relative', overflow: 'visible' }}>
        {/* Featured badge */}
        {post.featured && (
          <Chip
            icon={<EmojiEvents />}
            label="Featured"
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: 16,
              zIndex: 1,
              fontWeight: 'bold'
            }}
          />
        )}
        
        <CardContent>
          {/* User header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={post.user.avatar}
              sx={{ 
                mr: 2, 
                width: 48, 
                height: 48,
                bgcolor: theme.palette.primary.main
              }}
            >
              {post.user.username.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {post.user.username}
                </Typography>
                {post.user.verified && (
                  <Tooltip title="Verified Trader">
                    <Star color="primary" sx={{ fontSize: 16 }} />
                  </Tooltip>
                )}
                <Chip
                  label={post.user.rank}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })} • {post.user.followers} followers
              </Typography>
            </Box>
            
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          
          {/* Trade details (if trade post) */}
          {post.trade && (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTradeDirectionIcon(post.trade.direction)}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {post.trade.symbol}
                    </Typography>
                    <Chip
                      label={post.trade.direction}
                      color={getTradeDirectionColor(post.trade.direction)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Entry: {post.trade.entry}
                  </Typography>
                </Grid>
                
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Exit: {post.trade.exit}
                  </Typography>
                </Grid>
                
                <Grid item>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: post.trade.profit.startsWith('+') ? theme.palette.success.main : theme.palette.error.main
                    }}
                  >
                    {post.trade.profit}
                  </Typography>
                </Grid>
                
                <Grid item>
                  <Chip
                    label={`R:R ${post.trade.rr}`}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item>
                  <Chip
                    label={post.trade.setup}
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Post content */}
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            {post.content}
          </Typography>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {post.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  clickable
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              ))}
            </Box>
          )}
          
          {/* Screenshot */}
          {post.trade?.screenshot && (
            <CardMedia
              component="img"
              height="200"
              image={post.trade.screenshot}
              alt="Trade screenshot"
              sx={{ borderRadius: 2, mb: 2 }}
            />
          )}
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            startIcon={post.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
            onClick={() => handleLikePost(post.id)}
            size="small"
            color={post.isLiked ? "error" : "inherit"}
          >
            {post.likes}
          </Button>
          
          <Button
            startIcon={<Comment />}
            onClick={() => handleCommentOnPost(post)}
            size="small"
          >
            {post.comments}
          </Button>
          
          <Button
            startIcon={<Share />}
            size="small"
          >
            {post.shares}
          </Button>
          
          <Box sx={{ flex: 1 }} />
          
          <IconButton
            size="small"
            onClick={() => handleBookmarkPost(post.id)}
            color={post.isBookmarked ? "primary" : "default"}
          >
            {post.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          
          <IconButton size="small">
            <Flag />
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
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
            <Group sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: theme.palette.primary.main }} />
            Social Trading Feed
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Connect, learn, and share trading insights with the community
          </Typography>
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

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterBy}
                label="Filter"
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <MenuItem value="all">All Posts</MenuItem>
                <MenuItem value="trade_share">Trade Shares</MenuItem>
                <MenuItem value="discussion">Discussions</MenuItem>
                <MenuItem value="trade_of_day">Trade of Day</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyFollowing}
                  onChange={(e) => setShowOnlyFollowing(e.target.checked)}
                />
              }
              label="Following only"
            />
            
            <Box sx={{ flex: 1 }} />
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadFeedData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Feed Content */}
      <Grid container spacing={3}>
        {/* Main Feed */}
        <Grid item xs={12} md={8}>
          <AnimatePresence>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">Loading social feed...</Typography>
              </Box>
            ) : feedPosts.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  No posts found. Be the first to share a trade or start a discussion!
                </Typography>
              </Alert>
            ) : (
              feedPosts.map(renderFeedPost)
            )}
          </AnimatePresence>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={handleShareTrade}
                sx={{ mb: 2 }}
              >
                Share a Trade
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EmojiEvents />}
                sx={{ mb: 2 }}
              >
                Submit Trade of Day
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Comment />}
              >
                Start Discussion
              </Button>
            </CardContent>
          </Card>
          
          {/* Community Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Community Stats
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Traders</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1,247</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Trades Shared Today</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>89</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Discussions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>23</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Community Win Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>67.3%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          {/* Trending Topics */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Trending Topics
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['#ICTconcepts', '#FVG', '#SmartMoney', '#RiskManagement', '#NQfutures', '#Scalping'].map((topic, index) => (
                  <Chip
                    key={index}
                    label={topic}
                    size="small"
                    clickable
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="share"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleShareTrade}
      >
        <Add />
      </Fab>

      {/* Share Trade Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Share Your Trade</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Share your trades with the community to get feedback and help others learn from your experience.
          </Alert>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Describe your trade setup, what you learned, or ask for feedback..."
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            You can attach screenshots, select privacy settings, and tag your post for better discovery.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled>
            Share Trade (Coming Soon)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Join the discussion about this {selectedTrade?.type === 'trade_share' ? 'trade' : 'post'}.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add your comment..."
            sx={{ mb: 2 }}
          />
          
          <Typography variant="caption" color="text.secondary">
            Be respectful and constructive in your feedback.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled>
            Post Comment (Coming Soon)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SocialFeedPage;
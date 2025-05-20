import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  Alert, 
  Tab, 
  Tabs, 
  Grid, 
  Link, 
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// Tab panel component for sign in/register
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { startLoading, stopLoading } = useLoading();
  const { 
    user, 
    isLoading, 
    login, 
    register,
    isAuthenticated 
  } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  // Handle sign in form submission
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      startLoading('Signing in...');
      await login(email, password);
      showSnackbar('Successfully signed in!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in error:', err);
      let errorMessage = 'Invalid email or password';
      
      // Parse Firebase error messages for more user-friendly errors
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      setError(errorMessage);
      showSnackbar('Sign in failed: ' + errorMessage, 'error');
    } finally {
      stopLoading();
    }
  };

  // Handle sign up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      startLoading('Creating account...');
      // Use the register function we added to AuthContext
      await register(email, password);
      showSnackbar('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign up error:', err);
      let errorMessage = 'Failed to create account';
      
      // Parse Firebase error messages
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setError(errorMessage);
      showSnackbar('Sign up failed: ' + errorMessage, 'error');
    } finally {
      stopLoading();
    }
  };

  // Handle password reset form submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      startLoading('Sending reset email...');
      // Temporarily disabled - will implement in full migration
      // await resetPassword(resetEmail);
      showSnackbar('Password reset is currently unavailable. Contact support.', 'info');
      setShowResetForm(false);
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Failed to send reset email';
      
      // Parse Firebase error messages
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
      
      setError(errorMessage);
      showSnackbar('Password reset failed: ' + errorMessage, 'error');
    } finally {
      stopLoading();
    }
  };

  // Render password reset form
  const renderResetPasswordForm = () => (
    <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Reset Your Password
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="reset-email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 2 }}
      >
        Send Reset Link
      </Button>
      
      <Button
        fullWidth
        variant="outlined"
        onClick={() => setShowResetForm(false)}
        sx={{ mb: 1 }}
      >
        Back to Sign In
      </Button>
    </Box>
  );

  // If loading auth state, show loading indicator
  if (isLoading && !error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 8
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          Trading Journal App
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {showResetForm ? (
          renderResetPasswordForm()
        ) : (
          <>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} centered variant="fullWidth">
                <Tab label="Sign In" />
                <Tab label="Register" />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              <Box component="form" onSubmit={handleSignIn} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={() => setShowResetForm(true)}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Box component="form" onSubmit={handleSignUp} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="register-password"
                  label="Password"
                  type="password"
                  id="register-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirm-password"
                  label="Confirm Password"
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Create Account
                </Button>
              </Box>
            </TabPanel>
          </>
        )}
        
        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { authApi } from '../api/authApi';
import { showError, showSuccess } from '../utils/toast';
import logo from '../assets/logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.forgotPassword(email);

      if (response.warning) {
        setMessage(`Password reset token generated, but email could not be sent: ${response.warning}`);
        showError(`Email failed: ${response.warning}`);
      } else {
        setMessage('Password reset email sent. Please check your inbox.');
        showSuccess(response.message || 'Password reset email sent');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send reset email';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Container maxWidth="sm">
        <Paper elevation={2} className="p-8 rounded-lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src={logo}
                alt="Issue Tracker"
                style={{
                  height: '64px',
                  width: '64px',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1f2937',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' },
              }}
            >
              Issue Tracker
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              Reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" className="mb-4">
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box className="flex flex-col gap-4">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                variant="outlined"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="mt-2 py-2.5"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Box className="text-center mt-2">
                <Link
                  to="/login"
                  className="text-sm text-indigo-600 hover:text-indigo-800 no-underline"
                >
                  Back to Login
                </Link>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}


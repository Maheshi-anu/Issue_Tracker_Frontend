import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/logo.png';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setUserMenuAnchor(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const getInitials = () => {
    if (user?.fname && user?.lname) {
      return `${user.fname.charAt(0)}${user.lname.charAt(0)}`.toUpperCase();
    }
    if (user?.fname) {
      return user.fname.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return [user?.fname, user?.lname].filter(Boolean).join(' ') || user?.email || 'User';
  };

  return (
    <Box className="flex flex-col min-h-screen">
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#1f2937',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: { xs: 1, sm: 0 },
              mr: { xs: 0, sm: 4 },
              textDecoration: 'none',
            }}
          >
            <img
              src={logo}
              alt="Issue Tracker"
              style={{
                height: '32px',
                width: '32px',
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'white',
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Issue Tracker
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Issues
            </Button>
            {user?.role === 'admin' && (
              <Button
                component={Link}
                to="/users"
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Users
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {getUserDisplayName()}
            </Typography>
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                padding: 0,
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, color: 'error.main' }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                },
              }}
            >
              <MenuItem
                component={Link}
                to="/"
                onClick={handleMobileMenuClose}
                sx={{ py: 1.5 }}
              >
                Issues
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem
                  component={Link}
                  to="/users"
                  onClick={handleMobileMenuClose}
                  sx={{ py: 1.5 }}
                >
                  Users
                </MenuItem>
              )}
              <Divider />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getUserDisplayName()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMobileMenuClose();
                  handleLogout();
                }}
                sx={{ py: 1.5, color: 'error.main' }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          marginTop: { xs: '56px', sm: '64px' },
          flex: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}


import React from 'react';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}));

const NavigationGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(2),
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.dark,
  },
}));

const NavButtonsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = React.useState(null);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenu(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenu(null);
  };

  return (
    <StyledAppBar position="static">
      <Container>
        <NavigationGroup>
          <Logo component={RouterLink} to="/" variant="h6">
            StayHub
          </Logo>

          <NavButtonsGroup sx={{ display: { xs: 'none', md: 'flex' } }}>
            <NavButton component={RouterLink} to="/">
              Find Places
            </NavButton>
            
            {isAuthenticated ? (
              <>
                <NavButton
                  component={RouterLink}
                  to="/list-property"
                  startIcon={<AddBusinessIcon />}
                >
                  List Your Property
                </NavButton>
                {user?.isAdmin && (
                  <NavButton
                    component={RouterLink}
                    to="/admin/properties"
                    startIcon={<AdminPanelSettingsIcon />}
                  >
                    Admin Panel
                  </NavButton>
                )}
                <NavButton onClick={handleSignOut}>Sign Out</NavButton>
              </>
            ) : (
              [
                <NavButton key="sign-in" component={RouterLink} to="/signin">
                  Sign In
                </NavButton>,
                <NavButton
                  key="register"
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ color: 'white' }}
                >
                  Register
                </NavButton>
              ]
            )}
          </NavButtonsGroup>

          {/* Mobile Navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={mobileMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(mobileMenu)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem
                component={RouterLink}
                to="/"
                onClick={handleMobileMenuClose}
              >
                Find Places
              </MenuItem>
              
              {isAuthenticated ? [
                <MenuItem
                  key="list-property"
                  component={RouterLink}
                  to="/list-property"
                  onClick={handleMobileMenuClose}
                >
                  <AddBusinessIcon sx={{ mr: 1 }} />
                  List Your Property
                </MenuItem>,
                
                user?.isAdmin && (
                  <MenuItem
                    key="admin-panel"
                    component={RouterLink}
                    to="/admin/properties"
                    onClick={handleMobileMenuClose}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                    Admin Panel
                  </MenuItem>
                ),
                
                <MenuItem 
                  key="sign-out"
                  onClick={() => {
                    handleMobileMenuClose();
                    handleSignOut();
                  }}
                >
                  Sign Out
                </MenuItem>
              ].filter(Boolean) : [
                <MenuItem
                  key="sign-in"
                  component={RouterLink}
                  to="/signin"
                  onClick={handleMobileMenuClose}
                >
                  Sign In
                </MenuItem>,
                <MenuItem
                  key="register"
                  component={RouterLink}
                  to="/register"
                  onClick={handleMobileMenuClose}
                >
                  Register
                </MenuItem>
              ]}
            </Menu>
          </Box>
        </NavigationGroup>
      </Container>
    </StyledAppBar>
  );
};

export default Header;

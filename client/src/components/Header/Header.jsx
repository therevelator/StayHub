import { AppBar, Toolbar, Button, Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

const HeaderContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(0, 3),
}));

const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(4),
}));

const NavigationGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
}));

const NavButtonsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  letterSpacing: '-0.02em',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: '8px 16px',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <StyledAppBar elevation={0}>
      <HeaderContainer maxWidth="xl">
        <HeaderToolbar disableGutters>
          <NavigationGroup>
            <Logo component={RouterLink} to="/" variant="h1">
              StayHub
            </Logo>

            <NavButtonsGroup>
              <NavButton component={RouterLink} to="/">
                Find Places
              </NavButton>
              <NavButton>
                List Property
              </NavButton>
            </NavButtonsGroup>
          </NavigationGroup>

          <NavButtonsGroup>
            {isAuthenticated ? (
              <ActionButton
                onClick={handleSignOut}
                variant="outlined"
                color="primary"
              >
                Sign out
              </ActionButton>
            ) : (
              <>
                <NavButton component={RouterLink} to="/signin">
                  Sign in
                </NavButton>
                <ActionButton
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                >
                  Register
                </ActionButton>
              </>
            )}
          </NavButtonsGroup>
        </HeaderToolbar>
      </HeaderContainer>
    </StyledAppBar>
  );
};

export default Header;

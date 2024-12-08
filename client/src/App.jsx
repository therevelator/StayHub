import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import PropertyTypes from './components/PropertyTypes/PropertyTypes';
import Destinations from './components/Destinations/Destinations';
import RegisterForm from './components/Auth/RegisterForm';
import SignInForm from './components/Auth/SignInForm';
import PropertyDetails from './components/Property/PropertyDetails';
import ListProperty from './pages/ListProperty/ListProperty';
import { AuthProvider } from './context/AuthContext';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2A9D8F', // Teal
      light: '#4DB6AC',
      dark: '#1F7A6D',
    },
    secondary: {
      main: '#E76F51', // Coral
      light: '#FF8A65',
      dark: '#BF4D36',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#264653', // Dark blue-gray
      secondary: '#546E7A',
    },
    error: {
      main: '#E63946',
    },
    success: {
      main: '#2A9D8F',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <SearchBar />
                    <PropertyTypes />
                    <Destinations />
                  </>
                }
              />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/signin" element={<SignInForm />} />
              <Route path="/list-property" element={<ListProperty />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

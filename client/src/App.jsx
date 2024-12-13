import React from 'react';
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
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import ListProperty from './pages/ListProperty/ListProperty';
import CreatePropertyWizard from './components/Property/CreatePropertyWizard';
import EditProperty from './pages/EditProperty/EditProperty';
import { AuthProvider } from './context/AuthContext';
import AdminEditProperty from './pages/AdminEditProperty/AdminEditProperty';
import AdminProperties from './pages/AdminProperties/AdminProperties';
import SearchResults from './pages/SearchResults/SearchResults';
import Home from './pages/Home/Home';

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
      color: '#264653',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#264653',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#264653',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#264653',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#264653',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#264653',
    },
    body1: {
      fontSize: '1rem',
      color: '#546E7A',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#546E7A',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
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
                element={<Home />}
              />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/signin" element={<SignInForm />} />
              <Route path="/list-property" element={<ListProperty />} />
              <Route path="/create-property-wizard" element={<CreatePropertyWizard />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/properties/:id/edit" element={<EditProperty />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/properties/:id/edit" element={<AdminEditProperty />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Header from './components/Header/Header';
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
          <Header />
          <Outlet />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

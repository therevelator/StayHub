import { Box, TextField, Button, Container, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0071c2',
  color: 'white',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#005999',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#003580',
  padding: theme.spacing(3, 0),
  marginBottom: theme.spacing(4),
}));

const SearchBar = () => {
  return (
    <SearchContainer>
      <Container maxWidth="xl">
        <Box sx={{ color: 'white', mb: 3 }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Find your perfect stay</h1>
          <p style={{ margin: '8px 0' }}>Discover amazing places to stay around the world</p>
        </Box>
        
        <Paper
          component="form"
          sx={{
            display: 'flex',
            gap: 1,
            p: 1,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <TextField
            placeholder="Where are you going?"
            sx={{ flex: 2 }}
            InputProps={{
              sx: { borderRadius: 1 }
            }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Check-in"
              sx={{ flex: 1 }}
              slotProps={{
                textField: {
                  InputProps: {
                    sx: { borderRadius: 1 }
                  }
                }
              }}
            />
            <DatePicker
              label="Check-out"
              sx={{ flex: 1 }}
              slotProps={{
                textField: {
                  InputProps: {
                    sx: { borderRadius: 1 }
                  }
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            placeholder="2 adults · 0 children · 1 room"
            sx={{ flex: 1 }}
            InputProps={{
              sx: { borderRadius: 1 }
            }}
          />

          <SearchButton
            variant="contained"
            startIcon={<SearchIcon />}
          >
            Search
          </SearchButton>
        </Paper>
      </Container>
    </SearchContainer>
  );
};

export default SearchBar;

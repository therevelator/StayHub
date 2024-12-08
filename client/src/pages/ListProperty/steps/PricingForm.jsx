import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';

const PricingForm = ({ data, onChange }) => {
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onChange({ ...data, [field]: value });
    }
  };

  const calculateTotal = () => {
    const base = parseFloat(data.basePrice) || 0;
    const cleaning = parseFloat(data.cleaningFee) || 0;
    const service = parseFloat(data.serviceFee) || 0;
    const tax = base * (parseFloat(data.taxRate) || 0) / 100;
    return (base + cleaning + service + tax).toFixed(2);
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Pricing Information
      </Typography>

      <TextField
        fullWidth
        label="Base Price per Night"
        value={data.basePrice}
        onChange={handleChange('basePrice')}
        required
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Cleaning Fee"
        value={data.cleaningFee}
        onChange={handleChange('cleaningFee')}
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Service Fee"
        value={data.serviceFee}
        onChange={handleChange('serviceFee')}
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Tax Rate"
        value={data.taxRate}
        onChange={handleChange('taxRate')}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Security Deposit"
        value={data.securityDeposit}
        onChange={handleChange('securityDeposit')}
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
      />

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="subtitle1">
          Total price per night (including all fees and taxes): €{calculateTotal()}
        </Typography>
      </Alert>

      <Typography variant="body2" color="text.secondary">
        * All prices are in Euros (€). The security deposit will be held and returned after the stay if no damages are reported.
      </Typography>
    </Box>
  );
};

export default PricingForm;

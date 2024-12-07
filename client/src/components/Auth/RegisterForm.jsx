import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  maxWidth: 400,
  margin: '40px auto',
}));

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Convert array of errors to object
          const errorObj = {};
          data.errors.forEach((error) => {
            errorObj[error.path] = error.msg;
          });
          setErrors(errorObj);
          throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      // Redirect or update UI state
    } catch (err) {
      if (err.message !== 'Validation failed') {
        setErrors({ general: err.message });
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <FormContainer elevation={3}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Create your account
        </Typography>

        {errors.general && (
          <Alert severity="error" onClose={() => setErrors((prev) => ({ ...prev, general: '' }))}>
            {errors.general}
          </Alert>
        )}

        {success && (
          <Alert severity="success">
            Registration successful! You can now sign in.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || "Must contain uppercase, lowercase, number, and special character"}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="firstName"
            label="First Name"
            id="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="lastName"
            label="Last Name"
            id="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />

          <TextField
            margin="normal"
            fullWidth
            name="phoneNumber"
            label="Phone Number"
            id="phoneNumber"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </FormContainer>
    </Container>
  );
};

export default RegisterForm;

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';

const cancellationPolicies = [
  {
    value: 'flexible',
    label: 'Flexible - Full refund 1 day prior to arrival',
  },
  {
    value: 'moderate',
    label: 'Moderate - Full refund 5 days prior to arrival',
  },
  {
    value: 'strict',
    label: 'Strict - 50% refund up until 1 week prior to arrival',
  },
];

const RulesForm = ({ 
  data = {
    checkInTime: null,
    checkOutTime: null,
    cancellationPolicy: '',
    houseRules: [],
    restrictions: [],
    additionalRules: [],
    petPolicy: '',
    eventPolicy: ''
  }, 
  onChange 
}) => {
  const [newRule, setNewRule] = React.useState('');

  const handleChange = (field) => (event) => {
    onChange({ ...data, [field]: event.target.value });
  };

  const handleTimeChange = (field) => (newValue) => {
    onChange({
      ...data,
      [field]: newValue
    });
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      onChange({
        ...data,
        houseRules: [...data.houseRules, newRule.trim()],
      });
      setNewRule('');
    }
  };

  const handleDeleteRule = (index) => {
    const newRules = data.houseRules.filter((_, i) => i !== index);
    onChange({ ...data, houseRules: newRules });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ '& > :not(style)': { mb: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Rules and Policies
        </Typography>

        <Stack direction="row" spacing={2}>
          <TimePicker
            label="Check-in Time"
            value={data.checkInTime}
            onChange={handleTimeChange('checkInTime')}
            sx={{ flex: 1 }}
          />
          <TimePicker
            label="Check-out Time"
            value={data.checkOutTime}
            onChange={handleTimeChange('checkOutTime')}
            sx={{ flex: 1 }}
          />
        </Stack>

        <FormControl fullWidth>
          <InputLabel>Cancellation Policy</InputLabel>
          <Select
            value={data.cancellationPolicy}
            onChange={handleChange('cancellationPolicy')}
            label="Cancellation Policy"
          >
            {cancellationPolicies.map((policy) => (
              <MenuItem key={policy.value} value={policy.value}>
                {policy.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Pet Policy"
          value={data.petPolicy}
          onChange={handleChange('petPolicy')}
          multiline
          rows={2}
          placeholder="Describe your pet policy (e.g., 'Small pets allowed with additional deposit')"
        />

        <TextField
          fullWidth
          label="Event Policy"
          value={data.eventPolicy}
          onChange={handleChange('eventPolicy')}
          multiline
          rows={2}
          placeholder="Describe your event policy (e.g., 'Small gatherings allowed with prior approval')"
        />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            House Rules
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Add House Rule"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Enter a house rule"
            />
            <Button
              variant="contained"
              onClick={handleAddRule}
              disabled={!newRule.trim()}
            >
              Add Rule
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {data.houseRules.map((rule, index) => (
              <Chip
                key={index}
                label={rule}
                onDelete={() => handleDeleteRule(index)}
                deleteIcon={<DeleteIcon />}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary">
          * Clear house rules help set expectations and prevent misunderstandings with guests.
        </Typography>
      </Box>
    </LocalizationProvider>
  );
};

export default RulesForm;

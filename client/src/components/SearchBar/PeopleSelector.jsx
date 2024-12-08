import { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';

const PeopleSelector = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (type, operation) => {
    const newValue = { ...value };
    
    if (operation === 'add') {
      newValue[type] = Math.min((newValue[type] || 0) + 1, type === 'adults' ? 10 : 8);
    } else {
      newValue[type] = Math.max((newValue[type] || 0) - 1, type === 'adults' ? 1 : 0);
    }
    
    onChange(newValue);
  };

  const totalGuests = (value?.adults || 0) + (value?.children || 0);

  const CounterControl = ({ label, type, min = 0, max }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
      <Box>
        <Typography variant="subtitle1">{label}</Typography>
        {type === 'adults' && (
          <Typography variant="caption" color="text.secondary">
            Age 13+
          </Typography>
        )}
        {type === 'children' && (
          <Typography variant="caption" color="text.secondary">
            Ages 2-12
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => handleChange(type, 'subtract')}
          disabled={value[type] <= min}
        >
          <RemoveIcon />
        </IconButton>
        <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
          {value[type] || 0}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleChange(type, 'add')}
          disabled={value[type] >= max}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<PersonIcon />}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          minWidth: '150px',
          justifyContent: 'flex-start'
        }}
      >
        {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: '300px',
          },
        }}
      >
        <CounterControl
          label="Adults"
          type="adults"
          min={1}
          max={10}
        />
        <Divider />
        <CounterControl
          label="Children"
          type="children"
          max={8}
        />
      </Popover>
    </>
  );
};

export default PeopleSelector;

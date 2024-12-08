import { Card, CardContent, CardMedia, Typography, Box, Rating, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, sx }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  ...sx,
}));

const PropertyImage = styled(CardMedia)({
  height: 200,
  backgroundSize: 'cover',
});

const PropertyInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const Price = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginTop: 'auto',
}));

const PropertyCard = ({ property, onClick, sx = {} }) => {
  const {
    name,
    description,
    price,
    rating = 0,
    imageUrl,
    location,
  } = property;

  return (
    <StyledCard onClick={onClick} sx={sx}>
      <PropertyImage
        component="img"
        image={imageUrl || 'https://source.unsplash.com/random/?apartment'}
        alt={name}
        title={name}
      />
      <PropertyInfo>
        <Typography variant="h6" component="h2" gutterBottom>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {location}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={Number(rating) || 0} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {rating ? `${rating} / 5` : 'No ratings yet'}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>
        <Price variant="h6" sx={{ mt: 2 }}>
          €{Number(price).toFixed(2)} <Typography component="span" variant="body2">per night</Typography>
        </Price>
      </PropertyInfo>
    </StyledCard>
  );
};

export default PropertyCard;

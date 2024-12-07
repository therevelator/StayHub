import { Card, CardContent, CardMedia, Typography, Box, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
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

const PropertyCard = ({ property }) => {
  const {
    name,
    description,
    price,
    rating,
    imageUrl,
    location,
  } = property;

  return (
    <StyledCard>
      <PropertyImage
        image={imageUrl || 'https://source.unsplash.com/random/?apartment'}
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
          <Rating value={rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {rating} / 5
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
          €{price} <Typography component="span" variant="body2">per night</Typography>
        </Price>
      </PropertyInfo>
    </StyledCard>
  );
};

export default PropertyCard;

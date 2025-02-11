import { Card, CardMedia, CardContent, Button, Typography, Box } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

const ProductCard = ({ product, onBuy }) => (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 3
    }
  }}>
    <CardMedia
      component="img"
      height="240"
      image={product.image}
      alt={product.title}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        {product.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {product.description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" color="primary">
          {product.price}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {product.owner.slice(0, 6)}...{product.owner.slice(-4)}
        </Typography>
      </Box>
    </CardContent>
    <Box sx={{ p: 2 }}>
      <Button
        fullWidth
        variant="contained"
        startIcon={<ShoppingCart />}
        onClick={onBuy}
        sx={{ borderRadius: 2 }}
      >
        Purchase
      </Button>
    </Box>
  </Card>
);

export default ProductCard;
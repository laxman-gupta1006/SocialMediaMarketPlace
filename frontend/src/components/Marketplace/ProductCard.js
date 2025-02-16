import { Paper, Typography, Button, Box } from '@mui/material';

const ProductCard = ({ product, onBuy }) => (
  <Paper sx={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: 6
    }
  }}>
    <Box sx={{
      aspectRatio: '1/1',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <img
        src={product.image}
        alt={product.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </Box>
    
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {product.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {product.description}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 'auto'
      }}>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {product.price}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {product.owner.slice(0, 6)}...{product.owner.slice(-4)}
        </Typography>
      </Box>
    </Box>
    
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={() => onBuy(product)}
      sx={{
        borderRadius: 0,
        background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
        fontWeight: 700,
        letterSpacing: 1.1
      }}
    >
      Purchase Now
    </Button>
  </Paper>
);

export default ProductCard;
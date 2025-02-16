import { Box, Typography, Avatar } from '@mui/material';
import { ShoppingBasket } from '@mui/icons-material';

const MarketplaceLogo = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar sx={{ 
        bgcolor: 'primary.main', 
        width: 40, 
        height: 40,
        boxShadow: 2
      }}>
        <ShoppingBasket sx={{ fontSize: 24, color: 'white' }} />
      </Avatar>
      <Typography variant="h4" sx={{
        background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        letterSpacing: '-1px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif'
      }}>
        Digital Marketplace
      </Typography>
    </Box>
  );

export default MarketplaceLogo;
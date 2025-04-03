import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import { ChevronLeft, ChevronRight, Circle } from '@mui/icons-material';
import { useState } from 'react';
import PaymentDialog from './PaymentDialog'; // Import the PaymentDialog component

const ProductCard = ({ product, onBuy }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false); // Manage payment dialog state

  const hasMultipleImages = product.images.length > 1;

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handlePurchaseClick = () => {
    setOpenPaymentDialog(true);
  };

  const handleConfirmPayment = (paymentData) => {
    onBuy(paymentData); // Pass payment details to the parent
    setOpenPaymentDialog(false);
  };

  return (
    <>
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
          position: 'relative',
          '&:hover .nav-buttons': {
            opacity: 1
          }
        }}>
          <img
            src={`${product.images[currentImageIndex]}`}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {hasMultipleImages && (
            <>
              <IconButton
                className="nav-buttons"
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    bgcolor: 'background.default'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                className="nav-buttons"
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    bgcolor: 'background.default'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>

              <Stack 
                direction="row" 
                spacing={0.5}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                {product.images.map((_, index) => (
                  <Circle
                    key={index}
                    sx={{
                      fontSize: 8,
                      color: currentImageIndex === index ? 
                        'primary.main' : 'action.disabled',
                      cursor: 'pointer',
                      transition: 'color 0.3s'
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Stack>
            </>
          )}
        </Box>

        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            {product.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {product.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {product.price} ETH
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {product.owner?.username || 'Unknown Seller'}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePurchaseClick} // Open payment dialog
          disabled={product.status !== 'active'}
          sx={{
            borderRadius: 0,
            background: product.status === 'active' 
              ? 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)'
              : '#e0e0e0',
            fontWeight: 700,
            py: 1.5
          }}
        >
          {product.status === 'active' ? 'Purchase Now' : 'Sold Out'}
        </Button>
      </Paper>

      {/* Payment Dialog */}
      <PaymentDialog 
        open={openPaymentDialog} 
        onClose={() => setOpenPaymentDialog(false)} 
        product={product} 
        onConfirm={handleConfirmPayment} 
      />
    </>
  );
};

export default ProductCard;

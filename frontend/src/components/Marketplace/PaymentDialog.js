import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Grid, Typography, Box, LinearProgress, CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { styled } from '@mui/system';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

const PaymentDialog = ({ open, onClose, product, onConfirm, processing = false }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    netBankingId: ''
  });
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod('credit');
      setPaymentDetails({
        cardNumber: '',
        expiry: '',
        cvv: '',
        upiId: '',
        netBankingId: ''
      });
      setErrors({});
    }
  }, [open]);

  // Reset payment details when payment method changes
  useEffect(() => {
    setPaymentDetails({
      cardNumber: '',
      expiry: '',
      cvv: '',
      upiId: '',
      netBankingId: ''
    });
    setErrors({});
  }, [paymentMethod]);

  const handleChange = (field, value) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (paymentMethod === 'credit') {
      if (!paymentDetails.cardNumber) {
        valid = false;
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s+/g, ''))) {
        valid = false;
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!paymentDetails.expiry) {
        valid = false;
        newErrors.expiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiry)) {
        valid = false;
        newErrors.expiry = 'Expiry date must be in MM/YY format';
      }
      if (!paymentDetails.cvv) {
        valid = false;
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        valid = false;
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        valid = false;
        newErrors.upiId = 'UPI ID is required';
      }
      // Optionally, add more UPI format validation here
    } else if (paymentMethod === 'netbanking') {
      if (!paymentDetails.netBankingId) {
        valid = false;
        newErrors.netBankingId = 'Net Banking ID is required';
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const mockPaymentData = {
      method: paymentMethod,
      details: paymentDetails,
      amount: product.price,
      productId: product.id
    };
    onConfirm(mockPaymentData);
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        Secure Payment Gateway
        {processing && <LinearProgress color="secondary" sx={{ mt: 1 }} />}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {processing ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            p: 4,
            background: 'rgba(245,245,245,0.9)',
            borderRadius: 2
          }}>
            <CircularProgress size={60} sx={{ mb: 2, color: 'primary.main' }} />
            <Typography variant="h6" color="text.primary">
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please do not close this window
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}>
              <Typography variant="h6" gutterBottom>
                {product.title}
              </Typography>
              <Typography variant="h5" color="primary.main">
                ${product.price}
              </Typography>
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <MenuItem value="credit">💳 Credit/Debit Card</MenuItem>
                <MenuItem value="upi">📱 UPI Payment</MenuItem>
                <MenuItem value="netbanking">🏦 Net Banking</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === 'credit' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    placeholder="4111 1111 1111 1111"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => handleChange('cardNumber', e.target.value)}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    InputProps={{
                      endAdornment: <span style={{ opacity: 0.7 }}>VISA</span>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={paymentDetails.expiry}
                    onChange={(e) => handleChange('expiry', e.target.value)}
                    error={!!errors.expiry}
                    helperText={errors.expiry}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="•••"
                    type="password"
                    value={paymentDetails.cvv}
                    onChange={(e) => handleChange('cvv', e.target.value)}
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                  />
                </Grid>
              </Grid>
            )}

            {paymentMethod === 'upi' && (
              <TextField
                fullWidth
                label="UPI ID"
                placeholder="username@upi"
                value={paymentDetails.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                error={!!errors.upiId}
                helperText={errors.upiId}
                sx={{ mt: 1 }}
              />
            )}

            {paymentMethod === 'netbanking' && (
              <TextField
                fullWidth
                label="Net Banking ID"
                placeholder="Enter bank username"
                value={paymentDetails.netBankingId}
                onChange={(e) => handleChange('netBankingId', e.target.value)}
                error={!!errors.netBankingId}
                helperText={errors.netBankingId}
                sx={{ mt: 1 }}
              />
            )}
          </>
        )}
      </DialogContent>

      {!processing && (
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={onClose} 
            variant="outlined" 
            color="secondary"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default PaymentDialog;

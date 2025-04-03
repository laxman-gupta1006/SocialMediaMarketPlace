import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Grid } from '@mui/material';
import { useState } from 'react';

const PaymentDialog = ({ open, onClose, product, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    netBankingId: ''
  });

  const handleSubmit = () => {
    const mockPaymentData = {
      method: paymentMethod,
      details: paymentDetails,
      amount: product.price,
      productId: product.id
    };
    onConfirm(mockPaymentData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Payment Gateway - Test Environment
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="credit">Credit/Debit Card</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="netbanking">Net Banking</MenuItem>
          </Select>
        </FormControl>

        {paymentMethod === 'credit' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Card Number" placeholder="4111 1111 1111 1111" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="CVV" placeholder="123" />
            </Grid>
          </Grid>
        )}

        {paymentMethod === 'upi' && <TextField fullWidth label="UPI ID" placeholder="username@upi" />}
        {paymentMethod === 'netbanking' && <TextField fullWidth label="Net Banking ID" placeholder="Enter bank username" />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Confirm Payment</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;

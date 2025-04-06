// components/Marketplace/PurchasedItems.js
import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress, Card, CardContent, CardMedia, Chip, Box } from '@mui/material';
import config from '../../Config/config';

const PurchasedItems = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/marketplace/purchases`, {
          credentials: 'include'
        });
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Purchase History
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : purchases.length === 0 ? (
        <Typography variant="body1">No purchases found</Typography>
      ) : (
        <Grid container spacing={3}>
          {purchases.map(purchase => (
            <Grid item xs={12} sm={6} md={4} key={purchase._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={"https://192.168.2.250:3000/"+purchase.product.images[0]}
                  alt={purchase.product.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {purchase.product.title}
                  </Typography>
                  <Chip 
                    label={`₹${purchase.amount}`} 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Purchased on: {new Date(purchase.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method: {purchase.paymentMethod}
                  </Typography>
                  <Chip
                    label={purchase.status}
                    color={purchase.status === 'completed' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PurchasedItems;
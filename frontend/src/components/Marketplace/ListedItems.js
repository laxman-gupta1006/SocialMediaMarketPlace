// components/Marketplace/ListedItems.js
import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress, Card, CardContent, CardMedia, Chip, Button,Box } from '@mui/material';
import config from '../../Config/config';
const ListedItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/marketplace/my-listings`, {
          credentials: 'include'
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        My Listings
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : products.length === 0 ? (
        <Typography variant="body1">No listings found</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0]}
                  alt={product.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.title}
                  </Typography>
                  <Chip 
                    label={`₹${product.price}`} 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {product.views} views
                  </Typography>
                  <Chip
                    label={product.status}
                    color={product.status === 'active' ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {/* Add edit functionality */}}
                  >
                    Manage Listing
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ListedItems;
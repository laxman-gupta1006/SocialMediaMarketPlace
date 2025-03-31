import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Box, Snackbar } from '@mui/material';
import MarketplaceLogo from '../components/Marketplace/Marketplacelogo';
import ProductCard from '../components/Marketplace/ProductCard';
import SearchBar from '../components/Marketplace/SearchBar';
import AddProductDialog from '../components/Marketplace/AddProduct';
import PaymentDialog from '../components/Marketplace/PaymentDialog';
import config from '../Config/config';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    condition: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...searchParams,
        page,
        limit: 12
      }).toString();

      const response = await fetch(`https://localhost:3000/api/marketplace/search?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleSearch = (newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
  };

  const handleSubmitProduct = async () => {
    await fetchProducts();
    setOpenDialog(false);
  };

  const handleBuyProduct = (product) => {
    setSelectedProduct(product);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/marketplace/purchase/${selectedProduct.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setPaymentSuccess(true);
        await fetchProducts(currentPage);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1440, margin: '0 auto', p: 3, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, background: 'linear-gradient(45deg, #f8fafc 30%, #f1f5f9 90%)', boxShadow: 2 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <MarketplaceLogo />
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <SearchBar 
              searchParams={searchParams}
              onSearch={handleSearch}
              onAddProduct={() => setOpenDialog(true)}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} sx={{ color: 'primary.main', animationDuration: '0.8s' }} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {products.map(product => (
            <Grid item xs={12} sm={6} lg={4} key={product._id}>
              <ProductCard 
                product={product} 
                onBuy={() => handleBuyProduct(product)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Payment Dialog */}
      {selectedProduct && (
        <PaymentDialog 
          open={paymentDialogOpen} 
          onClose={() => setPaymentDialogOpen(false)} 
          product={selectedProduct} 
          onConfirm={handlePaymentConfirm} 
        />
      )}

      {/* Add Product Dialog */}
      <AddProductDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitProduct}
      />

      {/* Payment Success Snackbar */}
      <Snackbar
        open={paymentSuccess}
        autoHideDuration={6000}
        onClose={() => setPaymentSuccess(false)}
        message="Payment successful! The item is now yours."
      />
    </Box>
  );
};

export default MarketplacePage;

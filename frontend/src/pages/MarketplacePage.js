import React, { useState, useEffect, useCallback } from 'react';
import { Grid, CircularProgress, Box, Snackbar, Tabs, Tab, Alert } from '@mui/material';
import MarketplaceLogo from '../components/Marketplace/Marketplacelogo';
import ProductCard from '../components/Marketplace/ProductCard';
import SearchBar from '../components/Marketplace/SearchBar';
import AddProductDialog from '../components/Marketplace/AddProduct';
import PaymentDialog from '../components/Marketplace/PaymentDialog';
import ListedItems from '../components/Marketplace/ListedItems';
import PurchasedItems from '../components/Marketplace/PurchasedItems';
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
  const [paymentError, setPaymentError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [tab, setTab] = useState(0);

  const fetchProducts = useCallback(async (page = 1, controller) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ ...searchParams, page, limit: 12 }).toString();
      const response = await fetch(`${config.BACKEND_URL}/api/marketplace/search?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(currentPage, controller);
    return () => controller.abort();
  }, [fetchProducts, currentPage]);

  const handleSearch = (newParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSubmitProduct = async () => {
    await fetchProducts(1);
    setOpenDialog(false);
  };

  const handleBuyProduct = (product) => {
    setSelectedProduct(product);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`${config.BACKEND_URL}/api/marketplace/purchase/${selectedProduct.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Payment initiation failed');
      const { purchaseId } = await response.json();

      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`${config.BACKEND_URL}/api/marketplace/purchase/status/${purchaseId}`, {
            credentials: 'include'
          });

          if (!statusResponse.ok) throw new Error('Status check failed');
          const { status } = await statusResponse.json();

          if (status === 'completed') {
            setPaymentSuccess(true);
            await fetchProducts(currentPage);
          } else if (status === 'failed') {
            throw new Error('Payment processing failed');
          } else {
            setTimeout(pollStatus, 1000);
            return;
          }
        } catch (error) {
          setPaymentError(error.message || 'Payment failed');
          throw error;
        } finally {
          setProcessingPayment(false);
          setPaymentDialogOpen(false);
        }
      };

      await pollStatus();
    } catch (error) {
      setPaymentError(error.message || 'Payment failed');
      setProcessingPayment(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', p: 3, minHeight: '100vh' }}>
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 2 }}>
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

      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} sx={{ mb: 3 }}>
        <Tab label="Marketplace Feed" />
        <Tab label="My Listings" />
        <Tab label="My Purchases" />
      </Tabs>

      {tab === 0 && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} lg={4} key={product.id}>
                <ProductCard product={product} onBuy={() => handleBuyProduct(product)} />
              </Grid>
            ))}
          </Grid>
        )
      )}

      {tab === 1 && <ListedItems />}
      {tab === 2 && <PurchasedItems />}

      {/* Dialogs */}
      {selectedProduct && (
        <PaymentDialog 
          open={paymentDialogOpen} 
          onClose={() => !processingPayment && setPaymentDialogOpen(false)} 
          product={selectedProduct} 
          onConfirm={handlePaymentConfirm}
          processing={processingPayment}
        />
      )}

      <AddProductDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitProduct}
      />

      {/* Snackbar for success */}
      <Snackbar open={paymentSuccess} onClose={() => setPaymentSuccess(false)} autoHideDuration={6000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Payment successful! The item is now yours.
        </Alert>
      </Snackbar>

      {/* Snackbar for error */}
      <Snackbar open={!!paymentError} onClose={() => setPaymentError(null)} autoHideDuration={6000}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {paymentError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketplacePage;

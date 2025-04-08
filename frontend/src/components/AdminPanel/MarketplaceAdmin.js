// src/components/AdminPanel/MarketplaceAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, LinearProgress,
  Typography, Pagination, Snackbar, Alert, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, IconButton, Tooltip, Badge
} from '@mui/material';
import {
  Delete, Edit, Visibility, MonetizationOn, 
  ShoppingCart, Category, Store,CheckCircle
} from '@mui/icons-material';
import { format } from 'date-fns';

const MarketplaceAdmin = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState({ products: false, purchases: false });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priceRange: [0, 10000]
  });

  // Product categories and statuses from schema
  const productCategories = [
    'electronics', 'fashion', 'home', 'books', 'sports', 'other'
  ];
  
  const productStatuses = ['active', 'sold', 'inactive'];
  const purchaseStatuses = ['pending', 'completed', 'failed'];

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const query = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          search,
          category: filters.category,
          status: filters.status,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1]
        }).toString();
        
        const response = await fetch(`/api/admin/marketplace/products?${query}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch products');
        const { products, total } = await response.json();
        setProducts(products);
        setPagination(prev => ({ ...prev, total }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    if (activeTab === 0) fetchProducts();
  }, [activeTab, pagination.page, search, filters]);

  // Fetch purchases data
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(prev => ({ ...prev, purchases: true }));
        const query = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status
        }).toString();
        
        const response = await fetch(`/api/admin/marketplace/purchases?${query}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch purchases');
        const { purchases, total } = await response.json();
        setPurchases(purchases);
        setPagination(prev => ({ ...prev, total }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, purchases: false }));
      }
    };

    if (activeTab === 1) fetchPurchases();
  }, [activeTab, pagination.page, filters.status]);

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const response = await fetch(
        `/api/admin/marketplace/products/${productId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Delete failed');
      setProducts(products.filter(p => p._id !== productId));
      setSuccess('Product deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const handleUpdatePurchaseStatus = async (purchaseId, newStatus) => {
    try {
      setLoading(prev => ({ ...prev, purchases: true }));
      const response = await fetch(
        `/api/admin/marketplace/purchases/${purchaseId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      if (!response.ok) throw new Error('Status update failed');
      setPurchases(purchases.map(p => 
        p._id === purchaseId ? { ...p, status: newStatus } : p
      ));
      setSuccess('Purchase status updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, purchases: false }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={activeTab} onChange={(e, newVal) => setActiveTab(newVal)}>
        <Tab label="Product Management" icon={<Store />} />
        <Tab label="Purchase Management" icon={<ShoppingCart />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <TextField
              label="Search Products"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {productCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {productStatuses.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <TableContainer component={Paper}>
            {loading.products && <LinearProgress />}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={'/api/'+product.images[0]}
                          alt={product.title}
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={product.ownerUsername}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      ${product.price}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={product.category}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={product.status}
                        color={
                          product.status === 'active' ? 'success' :
                          product.status === 'sold' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Product">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
              sx={{ p: 2, display: 'flex', justifyContent: 'center' }}
            />
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {purchaseStatuses.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <TableContainer component={Paper}>
            {loading.purchases && <LinearProgress />}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>
                      <Typography variant="subtitle1">
                        {purchase.title}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={purchase.buyerUsername}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={purchase.productOwnerUsername}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      ${purchase.amount}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={purchase.paymentMethod}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={purchase.status}
                        color={
                          purchase.status === 'completed' ? 'success' :
                          purchase.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {purchase.status !== 'completed' && (
                          <Tooltip title="Mark as Completed">
                            <IconButton
                              color="success"
                              onClick={() => handleUpdatePurchaseStatus(purchase._id, 'completed')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => setSelectedPurchase(purchase)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
              sx={{ p: 2, display: 'flex', justifyContent: 'center' }}
            />
          </TableContainer>
        </>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} maxWidth="md">
        <DialogTitle>{selectedProduct?.title}</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Condition:</strong> {selectedProduct.condition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {selectedProduct.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Views:</strong> {selectedProduct.views}
                  </Typography>
                </Box>

                <Box sx={{ width: 300 }}>
                  <img
                    src={'/api/'+selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Owner Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={'/api'+selectedProduct.owner.profileImage}
                  alt={selectedProduct.ownerUsername}
                  style={{ width: 40, height: 40, borderRadius: '50%' }}
                />
                <Typography variant="body1">
                  {selectedProduct.ownerUsername}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProduct(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Detail Dialog */}
      <Dialog open={!!selectedPurchase} onClose={() => setSelectedPurchase(null)} maxWidth="md">
        <DialogTitle>Purchase Details</DialogTitle>
        <DialogContent>
          {selectedPurchase && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Transaction Details
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">
                    <strong>Product:</strong> {selectedPurchase.title}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Amount:</strong> ${selectedPurchase.amount}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Payment Method:</strong> {selectedPurchase.paymentMethod}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong> {format(new Date(selectedPurchase.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>

                <Box sx={{ width: 200 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Buyer:</strong> {selectedPurchase.buyerUsername}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Seller:</strong> {selectedPurchase.productOwnerUsername}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: 16 }}>
                {JSON.stringify(selectedPurchase.paymentDetails, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPurchase(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketplaceAdmin;
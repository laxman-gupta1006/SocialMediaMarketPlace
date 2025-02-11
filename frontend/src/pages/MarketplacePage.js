import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Box
} from '@mui/material';
import { Add, Search, ShoppingCart } from '@mui/icons-material';
import AddProductDialog from '../components/Marketplace/AddProduct';
import ProductCard from '../components/Marketplace/ProductCard';
import SearchBar from '../components/Marketplace/SearchBar';
const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });

  // Mock data for demonstration
  const mockProducts = [
    {
      id: 1,
      title: 'Digital Art #1',
      description: 'A beautiful digital artwork',
      price: '0.1 ETH',
      image: 'https://via.placeholder.com/300',
      owner: '0x123...abc',
    },
    {
      id: 2,
      title: 'AI-Generated Art',
      description: 'Unique AI-generated piece',
      price: '0.2 ETH',
      image: 'https://via.placeholder.com/300',
      owner: '0x456...def',
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setProducts(mockProducts.filter(product =>
      product.title.toLowerCase().includes(e.target.value.toLowerCase())
    ));
  };

  const handleSubmitProduct = () => {
    setProducts([...products, {
      id: products.length + 1,
      ...newProduct,
      owner: '0xYourAddress'
    }]);
    setOpenDialog(false);
    setNewProduct({ title: '', description: '', price: '', image: '' });
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      p: 3,
      backgroundColor: 'background.paper'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        backgroundColor: 'background.default'
      }}>
        <Typography variant="h4" component="h1">
          Digital Marketplace
        </Typography>
        <SearchBar 
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onAddProduct={() => setOpenDialog(true)}
        />
      </Box>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh'
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard 
                product={product}
                onBuy={() => alert(`Buying ${product.title}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddProductDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        onSubmit={handleSubmitProduct}
      />
    </Box>
  );
};

export default MarketplacePage;
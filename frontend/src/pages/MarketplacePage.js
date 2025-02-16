import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Box } from '@mui/material';
import MarketplaceLogo from '../components/Marketplace/Marketplacelogo';
import ProductCard from '../components/Marketplace/ProductCard';
import SearchBar from '../components/Marketplace/SearchBar';
import AddProductDialog from '../components/Marketplace/AddProduct';
import marketplaceItems from '../Data/marketplaceitems.json';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(marketplaceItems.products);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setProducts(marketplaceItems.products.filter(product =>
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

  const handleBuyProduct = (product) => {
    alert(`Purchasing: ${product.title}`);
  };

  return (
    <Box sx={{ 
      maxWidth: 1440, 
      margin: '0 auto', 
      p: 3,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ 
  mb: 4,
  p: 3,
  borderRadius: 3,
  background: 'linear-gradient(45deg, #f8fafc 30%, #f1f5f9 90%)',
  boxShadow: 2
}}>
  <Grid container alignItems="center" spacing={3}>
    <Grid item xs={12} md={5} lg={4}>
      <MarketplaceLogo />
    </Grid>
    <Grid item xs={12} md={7} lg={8}>
      <SearchBar 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onAddProduct={() => setOpenDialog(true)}
      />
    </Grid>
  </Grid>
</Box>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh'
        }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: 'primary.main',
              animationDuration: '0.8s',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {products.map(product => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <ProductCard 
                product={product} 
                onBuy={handleBuyProduct}
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
import { TextField, Button, Box } from '@mui/material';
import { Add, Search } from '@mui/icons-material';

const SearchBar = ({ searchTerm, onSearch, onAddProduct }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <TextField
      variant="outlined"
      placeholder="Search products..."
      value={searchTerm}
      onChange={onSearch}
      InputProps={{
        startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
        sx: { borderRadius: 2 }
      }}
      sx={{ width: 300 }}
    />
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={onAddProduct}
      sx={{ borderRadius: 2 }}
    >
      Add Product
    </Button>
  </Box>
);

export default SearchBar;
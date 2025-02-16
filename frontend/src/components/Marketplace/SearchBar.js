import { TextField, Button, Box } from '@mui/material';
import { Add, Search } from '@mui/icons-material';

const SearchBar = ({ searchTerm, onSearch, onAddProduct }) => (
  <Box sx={{ 
    display: 'flex', 
    gap: 1.5, 
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 2,
    boxShadow: 1,
    p: 1,
    width: '100%'
  }}>
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search assets..."
      value={searchTerm}
      onChange={onSearch}
      size="small"
      InputProps={{
        startAdornment: <Search sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />,
        sx: { 
          borderRadius: 1.5,
          '& fieldset': { border: 'none' },
          '& input': { py: 1 }
        }
      }}
    />
    <Button
      variant="contained"
      startIcon={<Add sx={{ fontSize: 20 }} />}
      onClick={onAddProduct}
      sx={{
        borderRadius: 1.5,
        px: 3,
        py: 1,
        background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
        fontWeight: 600,
        fontSize: '0.875rem',
        whiteSpace: 'nowrap'
      }}
    >
      Create Listing
    </Button>
  </Box>
);


export default SearchBar;
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AddProductDialog = ({ open, onClose, newProduct, setNewProduct, onSubmit }) => (
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{ sx: { borderRadius: 4 } }}
  >
    <DialogTitle sx={{ 
      background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
      color: 'white',
      fontWeight: 700
    }}>
      Create New Digital Listing
    </DialogTitle>
    <DialogContent sx={{ p: 3, '& .MuiTextField-root': { my: 2 } }}>
      <TextField
        fullWidth
        label="Asset Title"
        variant="outlined"
        value={newProduct.title}
        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
        InputProps={{ sx: { borderRadius: 2 } }}
      />
      <TextField
        fullWidth
        label="Description"
        variant="outlined"
        multiline
        rows={3}
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        InputProps={{ sx: { borderRadius: 2 } }}
      />
      <TextField
        fullWidth
        label="Price (ETH)"
        type="number"
        variant="outlined"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        InputProps={{ sx: { borderRadius: 2 } }}
      />
      <TextField
        fullWidth
        label="Image URL"
        variant="outlined"
        value={newProduct.image}
        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
        InputProps={{ sx: { borderRadius: 2 } }}
      />
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button 
        onClick={onClose}
        sx={{ 
          borderRadius: 2,
          px: 4,
          color: 'text.secondary'
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={onSubmit} 
        variant="contained"
        sx={{
          borderRadius: 2,
          px: 4,
          background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
          fontWeight: 700
        }}
      >
        List Asset
      </Button>
    </DialogActions>
  </Dialog>
);

export default AddProductDialog;
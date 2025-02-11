import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AddProductDialog = ({ open, onClose, newProduct, setNewProduct, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Create New Listing</DialogTitle>
    <DialogContent sx={{ '& .MuiTextField-root': { my: 1.5 } }}>
      <TextField
        fullWidth
        label="Product Title"
        value={newProduct.title}
        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
      />
      <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
      />
      <TextField
        fullWidth
        label="Price (ETH)"
        type="number"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <TextField
        fullWidth
        label="Image URL"
        value={newProduct.image}
        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained">Create Listing</Button>
    </DialogActions>
  </Dialog>
);

export default AddProductDialog;
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
         Select, MenuItem, InputLabel, FormControl, Chip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledUpload = styled('div')(({ theme, error }) => ({
  border: `2px dashed ${error ? theme.palette.error.main : theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(3),
  textAlign: 'center',
  margin: theme.spacing(2, 0),
  cursor: 'pointer',
  '&:hover': {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
  },
}));

const AddProductDialog = ({ open, onClose, onSubmit }) => {
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    condition: 'new',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formState.title.trim()) errors.title = 'Title is required';
    if (!formState.description.trim()) errors.description = 'Description is required';
    if (!formState.price || isNaN(formState.price)) errors.price = 'Valid price is required';
    if (!formState.category) errors.category = 'Category is required';
    if (!formState.location.trim()) errors.location = 'Location is required';
    if (selectedFiles.length === 0) errors.images = 'At least one image is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setSelectedFiles(files);
    setFormErrors(prev => ({ ...prev, images: null }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (key !== 'images') formData.append(key, value);
    });
    selectedFiles.forEach(file => formData.append('images', file));

    try {
      const response = await fetch('/api/marketplace/AddProduct', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.errors?.join(', ') || 'Failed to create product');
      }

      onSubmit(data);
      handleReset();
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleReset = () => {
    setFormState({
      title: '',
      description: '',
      price: '',
      category: '',
      location: '',
      condition: 'new',
      images: []
    });
    setSelectedFiles([]);
    setFormErrors({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
        color: 'white',
        fontWeight: 700
      }}>
        Create New Listing
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          margin="normal"
          value={formState.title}
          onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
          error={!!formErrors.title}
          helperText={formErrors.title}
        />

        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={formState.description}
          onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
          error={!!formErrors.description}
          helperText={formErrors.description}
        />

        <TextField
          fullWidth
          label="Price (ETH)"
          type="number"
          variant="outlined"
          margin="normal"
          value={formState.price}
          onChange={(e) => setFormState(prev => ({ ...prev, price: e.target.value }))}
          error={!!formErrors.price}
          helperText={formErrors.price}
        />

        <FormControl fullWidth margin="normal" error={!!formErrors.category}>
          <InputLabel>Category</InputLabel>
          <Select
            value={formState.category}
            label="Category"
            onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
          >
            <MenuItem value="electronics">Electronics</MenuItem>
            <MenuItem value="fashion">Fashion</MenuItem>
            <MenuItem value="home">Home</MenuItem>
            <MenuItem value="books">Books</MenuItem>
            <MenuItem value="sports">Sports</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {formErrors.category && <Typography variant="caption" color="error">{formErrors.category}</Typography>}
        </FormControl>

        <TextField
          fullWidth
          label="Location"
          variant="outlined"
          margin="normal"
          value={formState.location}
          onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
          error={!!formErrors.location}
          helperText={formErrors.location}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Condition</InputLabel>
          <Select
            value={formState.condition}
            label="Condition"
            onChange={(e) => setFormState(prev => ({ ...prev, condition: e.target.value }))}
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="like_new">Like New</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="fair">Fair</MenuItem>
            <MenuItem value="poor">Poor</MenuItem>
          </Select>
        </FormControl>

        <StyledUpload error={!!formErrors.images}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-images"
            type="file"
            multiple
            onChange={handleFileUpload}
          />
          <label htmlFor="upload-images">
            <Button variant="outlined" component="span">
              Upload Images (1-5)
            </Button>
            <div style={{ marginTop: 8 }}>
              {selectedFiles.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  style={{ margin: 4 }}
                />
              ))}
            </div>
            {formErrors.images && (
              <Typography variant="caption" color="error" display="block">
                {formErrors.images}
              </Typography>
            )}
          </label>
        </StyledUpload>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => { onClose(); handleReset(); }} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
            fontWeight: 700
          }}
        >
          List Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
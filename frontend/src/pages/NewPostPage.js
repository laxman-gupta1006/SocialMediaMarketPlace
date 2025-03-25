import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  IconButton, 
  CircularProgress, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { AddPhotoAlternate, Close } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
const BACKEND_URL = 'https://192.168.2.250:3000' ; 
const NewPostPage = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cleanup object URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Correctly create object URL
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
      setSelectedImageFile(file);
    }
  };

  const handlePost = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      formData.append('caption', caption);
      formData.append('visibility', visibility);
  
      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include', // Add this line
        headers: {
          // Remove Authorization header if backend uses cookies
          // Keep only if backend requires both cookie and header
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
  
      setSuccess('Post created successfully!');
      // Reset form
      setSelectedImage(null);
      setSelectedImageFile(null);
      setCaption('');
      setVisibility('public');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <Card sx={{ width: '100%', maxWidth: 600 }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Typography variant="h6">Create New Post</Typography>
            <IconButton 
              onClick={() => {
                setSelectedImage(null);
                setSelectedImageFile(null);
              }}
              disabled={isLoading}
            >
              <Close />
            </IconButton>
          </div>

          {!selectedImage ? (
            <div style={{ 
              border: '2px dashed #ccc',
              borderRadius: '8px',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
                disabled={isLoading}
              />
              <label htmlFor="image-upload">
                <IconButton component="span" disabled={isLoading}>
                  <AddPhotoAlternate fontSize="large" />
                </IconButton>
              </label>
              <Typography variant="subtitle1">Upload Photo</Typography>
              <Typography variant="caption" color="textSecondary">
                Supported formats: JPEG, PNG, WEBP, GIF (max 10MB)
              </Typography>
            </div>
          ) : (
            <>
              <img 
                src={selectedImage} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  objectFit: 'cover', 
                  borderRadius: '8px' 
                }} 
              />
              <TextField
                fullWidth
                label="Write a caption..."
                multiline
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                sx={{ mt: 2 }}
                disabled={isLoading}
              />

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={visibility}
                  label="Visibility"
                  onChange={(e) => setVisibility(e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value="public">Public (Visible to everyone)</MenuItem>
                  <MenuItem value="private">Private (Visible to followers only)</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handlePost}
                disabled={isLoading || !selectedImageFile}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Share Post'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NewPostPage;
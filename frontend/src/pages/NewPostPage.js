import React, { useState } from 'react';
import { Card, CardContent, Button, TextField, IconButton, CircularProgress,Typography } from '@mui/material';
import { AddPhotoAlternate, Close } from '@mui/icons-material';

const NewPostPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new URL.createObjectURL(file);
      setSelectedImage(reader);
    }
  };

  const handlePost = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Reset form
      setSelectedImage(null);
      setCaption('');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <Card sx={{ width: '100%', maxWidth: 600 }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Typography variant="h6">Create New Post</Typography>
            <IconButton onClick={() => setSelectedImage(null)}>
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
              cursor: 'pointer'
            }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <IconButton component="span">
                  <AddPhotoAlternate fontSize="large" />
                </IconButton>
              </label>
              <Typography variant="subtitle1">Upload Photo</Typography>
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
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handlePost}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Share Post'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPostPage;
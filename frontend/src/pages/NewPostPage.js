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
import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const NewPostPage = () => {
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia]);

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*') && !file.type.match('video.*')) {
      setError('Please upload only images (JPEG, PNG, WEBP, GIF) or videos (MP4, MOV)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedMedia(objectUrl);
    setSelectedMediaFile(file);
    setError(''); // Clear any previous errors
  };

  const handlePost = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('media', selectedMediaFile); // Changed from 'image' to 'media'
      formData.append('caption', caption);
      formData.append('visibility', visibility);
  
      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
  
      setSuccess('Post created successfully!');
      // Reset form
      setSelectedMedia(null);
      setSelectedMediaFile(null);
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
                setSelectedMedia(null);
                setSelectedMediaFile(null);
              }}
              disabled={isLoading}
            >
              <Close />
            </IconButton>
          </div>

          {!selectedMedia ? (
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
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="media-upload"
                type="file"
                onChange={handleMediaSelect}
                disabled={isLoading}
              />
              <label htmlFor="media-upload">
                <IconButton component="span" disabled={isLoading}>
                  <AddPhotoAlternate fontSize="large" />
                </IconButton>
              </label>
              <Typography variant="subtitle1">Upload Photo or Video</Typography>
              <Typography variant="caption" color="textSecondary">
                Supported formats: JPEG, PNG, WEBP, GIF, MP4, MOV (max 10MB)
              </Typography>
            </div>
          ) : (
            <>
              {selectedMediaFile.type.match('video.*') ? (
                <video 
                  controls
                  src={selectedMedia}
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }}
                />
              ) : (
                <img 
                  src={selectedMedia} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }} 
                />
              )}

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
                disabled={isLoading || !selectedMediaFile}
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
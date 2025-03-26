import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NewPost = () => {
  const navigate = useNavigate();
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleMediaSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedMediaFile(file);
      setSelectedMedia(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!selectedMediaFile) {
      setError('Please select a media file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('media', selectedMediaFile);
      formData.append('caption', caption);

      const response = await fetch('https://192.168.2.250:3000/api/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      navigate('/');
    } catch (error) {
      console.error('Post creation error:', error);
      setError('Failed to create post');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Create New Post</Typography>
      
      {selectedMedia ? (
        <>
          {selectedMediaFile.type.startsWith('video/') ? (
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
          <Button 
            variant="outlined" 
            onClick={() => {
              setSelectedMedia(null);
              setSelectedMediaFile(null);
            }}
            sx={{ mt: 2 }}
          >
            Change Media
          </Button>
        </>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('media-upload').click()}
        >
          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleMediaSelect}
          />
          <Typography variant="body1" color="text.secondary">
            Click to upload media
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, AVI
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        sx={{ mt: 2 }}
      />

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={() => navigate('/')}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handlePost}
          disabled={!selectedMediaFile}
        >
          Post
        </Button>
      </Box>
    </Box>
  );
};

export default NewPost; 
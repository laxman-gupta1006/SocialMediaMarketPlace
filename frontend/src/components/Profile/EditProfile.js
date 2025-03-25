import { 
    Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, Button, 
    Stack, InputAdornment, IconButton, Typography,
    Avatar, Box
  } from '@mui/material';
  import { Link, Close, PhotoCamera } from '@mui/icons-material';
  import { useState } from 'react';
  
  const EditProfileDialog = ({ open, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({ ...user });
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user.profileImage);
  
    const handleSubmit = async () => {
      try {
        setError(null);
        
        // Handle photo upload first if there's a new photo
        if (selectedPhoto) {
          const photoFormData = new FormData();
          photoFormData.append('photo', selectedPhoto);
          
          const response = await fetch('https://192.168.2.250:3000/api/users/profile-photo', {
            method: 'POST',
            credentials: 'include',
            body: photoFormData
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload profile photo');
          }
          
          const photoData = await response.json();
          formData.profileImage = photoData.profileImage;
        }
        
        await onSave(formData);

        // Clean up the preview URL to prevent memory leaks
        if (photoPreview && photoPreview !== user.profileImage) {
          URL.revokeObjectURL(photoPreview);
        }
      } catch (error) {
        setError(error.message || 'Failed to update profile');
      }
    };
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('Photo size should be less than 5MB');
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file');
          return;
        }
        
        setSelectedPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Profile
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Avatar
                src={photoPreview}
                alt={formData.username}
                sx={{ width: 100, height: 100 }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Change Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              helperText="Tell your story"
            />
            
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Link fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            sx={{ px: 4 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EditProfileDialog;
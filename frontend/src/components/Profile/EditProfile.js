import { 
    Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, Button, 
    Stack, InputAdornment, IconButton 
  } from '@mui/material';
  import { Link, Close } from '@mui/icons-material';
  import { useState } from 'react';
  
  const EditProfileDialog = ({ open, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({ ...user });
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Profile
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 2 }}>
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
            onClick={() => onSave(formData)}
            sx={{ px: 4 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EditProfileDialog;
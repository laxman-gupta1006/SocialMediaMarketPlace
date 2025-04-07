import {
  Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Button,
  Stack, InputAdornment, IconButton, Typography,
  Avatar, Box
} from '@mui/material';
import { Link, Close, PhotoCamera } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import VirtualKeyboard from '../VirtualKeyboard';

const EditProfileDialog = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({ ...user });
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user.profileImage);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset state when dialog closes
  const resetState = () => {
    setFormData({ ...user });
    setError(null);
    setSelectedPhoto(null);
    setPhotoPreview(user.profileImage);
    setOtp('');
    setOtpSent(false);
    setIsSendingOTP(false);
    setIsVerifying(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (open) {
      resetState(); // Also reset when dialog is reopened
    }
  }, [open]);

  const handleSendOTP = async () => {
    try {
      setIsSendingOTP(true);
      setError(null);
      const response = await fetch('https://192.168.2.250:3000/api/users/send-profile-update-otp', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setOtpSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsVerifying(true);
      setError(null);

      // Upload photo if changed
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

      await onSave({ ...formData, otp });

      if (photoPreview && photoPreview !== user.profileImage) {
        URL.revokeObjectURL(photoPreview);
      }

      handleClose(); // close and reset
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'Backspace') {
      setOtp(prev => prev.slice(0, -1));
    } else if (key === 'Clear') {
      setOtp('');
    } else if (/^\d$/.test(key)) {
      setOtp(prev => (prev.length < 6 ? prev + key : prev));
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {otpSent ? 'Verify OTP' : 'Edit Profile'}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {otpSent ? (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Typography variant="body1" textAlign="center">
              Enter the OTP sent to your email
            </Typography>
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              InputProps={{ readOnly: true }}
            />
            <VirtualKeyboard onKeyPress={handleKeyPress} />
          </Stack>
        ) : (
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
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {otpSent ? (
          <Button
            variant="contained"
            onClick={handleVerifyOTP}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSendOTP}
            disabled={isSendingOTP}
          >
            {isSendingOTP ? 'Sending OTP...' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;

// components/settings/RequestVerification.js
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Card,
  CardContent,
  Stack,
  Input,
  LinearProgress,
  SvgIcon
} from '@mui/material';
import { Upload as UploadIcon, FilePdfBox, Image } from 'mdi-material-ui';
import axios from 'axios';
import styled from '@emotion/styled';

const FileInput = styled('input')({
  display: 'none',
});

const FilePreview = ({ file }) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
    {file.type.startsWith('image/') ? (
      <Image color="primary" />
    ) : (
      <FilePdfBox color="primary" />
    )}
    <Typography variant="body2">{file.name}</Typography>
  </Stack>
);

const RequestVerification = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      setUploading(true);
      const response = await axios.post('/api/verification/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setMessage(response.data.message);
      setError('');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting request.');
      setMessage('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon fontSize="small" />
          Account Verification
        </Typography>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="verification-upload">
            <FileInput 
              id="verification-upload" 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,application/pdf"
            />
            <Button
              component="span"
              variant="outlined"
              color="primary"
              startIcon={<UploadIcon />}
              disabled={uploading}
              fullWidth
              sx={{ py: 2 }}
            >
              {file ? 'Change Document' : 'Upload Verification Document'}
            </Button>
          </label>

          {file && <FilePreview file={file} />}
          {uploading && <LinearProgress sx={{ mt: 2 }} />}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file || uploading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Supported formats: JPEG, PNG, PDF (Max size: 5MB)
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RequestVerification;
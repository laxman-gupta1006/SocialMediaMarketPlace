import React, { useRef } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { Send, AttachFile, Mood, Mic } from '@mui/icons-material';

const MessageInput = ({ value, onChange, onSend, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];

    if (!file) {
      console.error("❌ No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("❌ Only image files are allowed");
      return;
    }

    console.log("✅ File selected:", file);

    if (onFileUpload) {
      onFileUpload({ file, type: 'picture' });
    }

    // Optional: Clear file input to allow re-upload of same file
    e.target.value = '';
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      {/* <IconButton>
        <Mood />
      </IconButton> */}

      {/* <IconButton component="label">
        <AttachFile />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </IconButton> */}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onSend}>
                <Send />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* <IconButton>
        <Mic />
      </IconButton> */}
    </Box>
  );
};

export default MessageInput;

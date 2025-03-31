import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { Send, AttachFile, Mood, Mic } from '@mui/icons-material';

const MessageInput = ({ value, onChange, onSend, onFileUpload }) => {
  
  // ✅ Handle File Upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("❌ No file selected");
      return;
    }
  
    if (onFileUpload) {
      console.log("✅ File selected:", file);
      onFileUpload(file);  // ✅ Pass file, not event
    } else {
      console.error("❌ Error: onFileUpload function is not defined!");
    }
  };
  

  return (
    <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <IconButton>
        <Mood />
      </IconButton>

      {/* ✅ Single file upload button */}
      <IconButton component="label">
        <AttachFile />
        <input 
          type="file" 
          hidden 
          onChange={handleFileChange} 
        />
      </IconButton>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
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

      <IconButton>
        <Mic />
      </IconButton>
    </Box>
  );
};

export default MessageInput;

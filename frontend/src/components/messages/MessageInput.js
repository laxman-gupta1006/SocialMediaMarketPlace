import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { Send, AttachFile, Mood, Mic } from '@mui/icons-material';

const MessageInput = ({ value, onChange, onSend }) => (
  <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
    <IconButton>
      <Mood />
    </IconButton>
    
    <IconButton component="label">
      <input type="file" hidden />
      <AttachFile />
    </IconButton>
    
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Type a message to start chat..."
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

export default MessageInput;
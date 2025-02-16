// src/components/AdminPanel/ContentModeration.jsx
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  ButtonGroup,
  Button,
  TextField
} from '@mui/material';
import { Delete, Visibility, Report } from '@mui/icons-material';

const ContentModerationTable = ({ content }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = content.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TextField
        fullWidth
        label="Search Content"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Content</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContent.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ maxWidth: 300 }}>
                  {item.content.slice(0, 50)}...
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.type} 
                    color={
                      item.type === 'post' ? 'primary' : 
                      item.type === 'comment' ? 'secondary' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={item.status === 'reported' ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <ButtonGroup variant="contained">
                    <Button title="View">
                      <Visibility />
                    </Button>
                    <Button color="error" title="Delete">
                      <Delete />
                    </Button>
                    <Button color="warning" title="Report">
                      <Report />
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const ContentModeration = () => {
  const [content] = useState([
    // Sample data
    {
      id: 1,
      content: "Inappropriate post content...",
      type: "post",
      status: "reported",
      reports: 5
    }
  ]);

  return (
    <ContentModerationTable content={content} />
  );
};

export default ContentModeration;
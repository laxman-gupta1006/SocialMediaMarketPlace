// src/components/AdminPanel/ContentModeration.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Button, LinearProgress, Typography, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import { Delete, Report, CheckCircle, Warning, Close } from '@mui/icons-material';
import moment from 'moment';

const BACKEND_URL = 'https://localhost:3000';

const ContentModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 50
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        search,
        limit: pagination.limit
      }).toString();

      const response = await fetch(`${BACKEND_URL}/api/admin/posts?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      setPosts(posts.filter(post => post._id !== postId));
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearReports = async (postId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/posts/${postId}/reports`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear reports');
      }

      setPosts(posts.map(post => 
        post._id === postId ? { ...post, reports: [] } : post
      ));
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openDetails = (post) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  return (
    <>
      <TextField
        fullWidth
        label="Search Posts"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: <Warning color="action" />
        }}
      />

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        {error && <Typography color="error" p={2}>{error}</Typography>}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Preview</TableCell>
              <TableCell>Reports</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post._id} hover onClick={() => openDetails(post)}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={post.author?.profileImage} sx={{ mr: 1 }} />
                    {post.author?.username || 'Deleted User'}
                  </div>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {post.caption || 'No caption'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={post.reports?.length || 0}
                    color="error"
                    icon={<Report />}
                  />
                </TableCell>
                <TableCell>
                  {moment(post.createdAt).format('MMM D, YYYY')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post._id);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearReports(post._id);
                    }}
                  >
                    Clear
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md">
        <DialogTitle>
          Post Details
          <Button onClick={() => setDialogOpen(false)} sx={{ float: 'right' }}>
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPost && (
            <>
              <Typography variant="h6" gutterBottom>
                Author: {selectedPost.author?.username}
              </Typography>
              <Typography variant="body1" paragraph>
                Caption: {selectedPost.caption}
              </Typography>
              <div style={{ margin: '20px 0' }}>
                {selectedPost.mediaType === 'image' ? (
                  <img 
                    src={selectedPost.media} 
                    alt="Post content" 
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                ) : (
                  <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
                    <source src={selectedPost.media} type="video/mp4" />
                  </video>
                )}
              </div>
              <Typography variant="h6" gutterBottom>
                Reports ({selectedPost.reports.length})
              </Typography>
              {selectedPost.reports.map((report, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <Typography variant="body2">
                    <strong>{report.reason}</strong> - 
                    {moment(report.createdAt).format('MMM D, h:mm a')}
                  </Typography>
                </div>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDeletePost(selectedPost?._id)}
            color="error"
            startIcon={<Delete />}
          >
            Confirm Delete
          </Button>
          <Button 
            onClick={() => handleClearReports(selectedPost?._id)}
            color="primary"
            startIcon={<CheckCircle />}
          >
            Confirm Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContentModeration;
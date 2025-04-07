import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, LinearProgress, Typography, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Delete, Report, CheckCircle, Warning, Close } from '@mui/icons-material';
import moment from 'moment';

const BACKEND_URL = 'https://192.168.2.250:3000';

const ContentModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ mediaType: '', sort: '-createdAt' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 50
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        search,
        ...filters
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
  }, [search, filters]);

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

  const PaginationControls = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Button
        onClick={() => fetchPosts(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
      >
        Previous
      </Button>
      <Typography variant="body1" sx={{ mx: 2 }}>
        Page {pagination.currentPage} of {pagination.totalPages}
      </Typography>
      <Button
        onClick={() => fetchPosts(pagination.currentPage + 1)}
        disabled={pagination.currentPage >= pagination.totalPages}
      >
        Next
      </Button>
    </div>
  );

  const FiltersBar = () => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Media Type</InputLabel>
        <Select
          value={filters.mediaType}
          onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
          label="Media Type"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="image">Images</MenuItem>
          <MenuItem value="video">Videos</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          label="Sort By"
        >
          <MenuItem value="-createdAt">Newest First</MenuItem>
          <MenuItem value="createdAt">Oldest First</MenuItem>
          <MenuItem value="-reportsCount">Most Reported</MenuItem>
        </Select>
      </FormControl>
    </div>
  );

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

      <FiltersBar />

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        {error && <Typography color="error" p={2}>{error}</Typography>}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Media</TableCell>
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
                  {post.mediaType === 'image' ? (
                    <img
                      src={post.media}
                      alt="Post media"
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                  ) : (
                    <video
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                      src={post.media}
                    />
                  )}
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

      <PaginationControls />

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
                Reports Breakdown
              </Typography>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(
                  selectedPost.reports.reduce((acc, report) => {
                    acc[report.reason] = (acc[report.reason] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([reason, count]) => (
                  <Chip
                    key={reason}
                    label={`${reason}: ${count}`}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </div>
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

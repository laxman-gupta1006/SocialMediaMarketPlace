import React, { useState, useEffect } from 'react';
import {
Card,
CardContent,
Button,
TextField,
IconButton,
CircularProgress,
Typography,
FormControl,
InputLabel,
Select,
MenuItem,
Snackbar,
Alert,
Box,
Stack
} from '@mui/material';
import { AddPhotoAlternate, Close } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const NewPostPage = () => {
const { user } = useAuth();
const [selectedMedia,setSelectedMedia]=useState(null);
const [selectedMediaFile,setSelectedMediaFile]=useState(null);
const [caption,setCaption]=useState('');
const [isLoading,setIsLoading]=useState(false);
const [error,setError]=useState('');
const [success,setSuccess]=useState('');

useEffect(()=>{
return()=>{
if(selectedMedia){
URL.revokeObjectURL(selectedMedia);
}}},[selectedMedia]);

const handleMediaSelect=(e)=>{
const file=e.target.files[0];
if(!file)return;
if(!file.type.match('image.*')&&!file.type.match('video.*')){
setError('Please upload only images (JPEG, PNG, WEBP, GIF) or videos (MP4, MOV)');
return;}
if(file.size>10*1024*1024){
setError('File size exceeds 10MB limit');
return;}
const objectUrl=URL.createObjectURL(file);
setSelectedMedia(objectUrl);
setSelectedMediaFile(file);
setError('');
};

const handlePost=async()=>{
setIsLoading(true);
setError('');
setSuccess('');
try{
const formData=new FormData();
formData.append('media',selectedMediaFile);
formData.append('caption',caption);
const response=await fetch(`/api/posts`,{
method:'POST',
credentials:'include',
body:formData
});
if(!response.ok){
const errorData=await response.json();
throw new Error(errorData.error||'Failed to create post');
}
setSuccess('Post created successfully!');
setSelectedMedia(null);
setSelectedMediaFile(null);
setCaption('');
}catch(err){
setError(err.message);
}finally{
setIsLoading(false);
}};

return(
<Box display="flex" justifyContent="center" py={5} bgcolor="#f9fafb" minHeight="100vh">
<Card sx={{ width: '100%', maxWidth: 640, borderRadius: 4, boxShadow: 6 }}>
<CardContent>
<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
<Typography variant="h5" fontWeight={600}>📸 Create New Post</Typography>
<IconButton 
onClick={()=>{setSelectedMedia(null);setSelectedMediaFile(null);}} 
disabled={isLoading}
>
<Close />
</IconButton>
</Stack>

{!selectedMedia?(
<Box 
sx={{
border: '2px dashed #cbd5e1',
borderRadius: 3,
height: 400,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexDirection: 'column',
cursor: 'pointer',
transition: 'border-color 0.3s',
'&:hover': {
borderColor: '#6366f1'
}
}}
>
<input
accept="image/*,video/*"
style={{ display: 'none' }}
id="media-upload"
type="file"
onChange={handleMediaSelect}
disabled={isLoading}
/>
<label htmlFor="media-upload">
<IconButton component="span" disabled={isLoading} sx={{ color: '#6366f1' }}>
<AddPhotoAlternate fontSize="large" />
</IconButton>
</label>
<Typography variant="subtitle1" fontWeight={500}>Upload Photo or Video</Typography>
<Typography variant="caption" color="textSecondary">
Supported formats: JPEG, PNG, WEBP, GIF, MP4, MOV (max 10MB)
</Typography>
</Box>
):(
<>
{selectedMediaFile.type.match('video.*')?(
<video 
controls 
src={selectedMedia} 
style={{
width:'100%',
height:400,
objectFit:'cover',
borderRadius:12,
boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
}}
/>
):(
<img 
src={selectedMedia} 
alt="Preview" 
style={{
width:'100%',
height:400,
objectFit:'cover',
borderRadius:12,
boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
}} 
/>
)}

<TextField
fullWidth
label="Write a caption..."
multiline
rows={3}
value={caption}
onChange={(e)=>setCaption(e.target.value)}
sx={{ mt: 3 }}
disabled={isLoading}
/>

{/* <FormControl fullWidth sx={{ mt: 2 }}>
<InputLabel>Visibility</InputLabel>
<Select
value={visibility}
label="Visibility"
onChange={(e)=>setVisibility(e.target.value)}
disabled={isLoading}
>
<MenuItem value="public">🌍 Public (Visible to everyone)</MenuItem>
<MenuItem value="private">🔒 Private (Followers only)</MenuItem>
</Select>
</FormControl> */}

<Button
fullWidth
variant="contained"
onClick={handlePost}
disabled={isLoading||!selectedMediaFile}
sx={{
mt:3,
bgcolor:'#6366f1',
'&:hover':{bgcolor:'#4f46e5'},
borderRadius:2,
py:1.2,
fontWeight:600
}}
>
{isLoading?<CircularProgress size={24} sx={{color:'#fff'}} />:'🚀 Share Post'}
</Button>
</>
)}
</CardContent>
</Card>

<Snackbar open={!!error} autoHideDuration={6000} onClose={()=>setError('')}>
<Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
</Snackbar>

<Snackbar open={!!success} autoHideDuration={6000} onClose={()=>setSuccess('')}>
<Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
</Snackbar>
</Box>
);
};

export default NewPostPage;

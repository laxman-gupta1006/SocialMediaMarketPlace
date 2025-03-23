import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

const Loading = ({ message="Loading..." }) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
    <CircularProgress size={60} thickness={5} />
    <Typography variant="h6" mt={2}>{message}</Typography>
  </Box>
);

export default Loading;

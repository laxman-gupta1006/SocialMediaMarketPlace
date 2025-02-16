// src/components/AdminPanel/DashboardCard.jsx
import React from 'react';
import { 
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  SvgIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #f8fafc 30%, #f1f5f9 90%)',
  borderRadius: '12px',
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none'
  }
}));

const DashboardCard = ({ title, value, icon, trend, blockchain }) => {
  return (
    <GradientCard>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Box sx={{
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 1
            }}>
              <SvgIcon fontSize="medium" color="primary">
                {icon}
              </SvgIcon>
            </Box>
          </Stack>
          
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h4">{value}</Typography>
            {trend && (
              <Typography 
                variant="body2" 
                color={trend > 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Stack>

          {blockchain && (
            <Box sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              BLOCKCHAIN
            </Box>
          )}
        </Stack>
      </CardContent>
    </GradientCard>
  );
};

export default DashboardCard;
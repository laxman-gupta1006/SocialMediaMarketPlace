// src/components/AdminPanel/AdminSettings.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: []
  });

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Security Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControlLabel
          control={
            <Switch
              checked={settings.twoFactorAuth}
              onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
            />
          }
          label="Require Two-Factor Authentication"
        />
        
        <TextField
          label="Session Timeout (minutes)"
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
          sx={{ mt: 2, width: 200 }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const AdminSettings = () => {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>System Settings</Typography>
      
      <SecuritySettings />
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">General Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
              />
            }
            label="Maintenance Mode"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={systemSettings.registrationOpen}
                onChange={(e) => setSystemSettings({ ...systemSettings, registrationOpen: e.target.checked })}
              />
            }
            label="Open Registration"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Blockchain Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="NFT Contract Address"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Marketplace Fee (%)"
            type="number"
            fullWidth
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AdminSettings;
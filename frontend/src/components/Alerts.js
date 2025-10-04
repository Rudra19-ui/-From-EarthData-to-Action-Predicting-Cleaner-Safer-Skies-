import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';

function Alerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('/api/alerts/');
        setAlerts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Mock data for development
        setAlerts(Array.from({length: 8}, (_, i) => ({
          id: i + 1,
          type: ['high_pm25', 'sensor_offline', 'prediction_anomaly'][i % 3],
          message: [
            'High PM2.5 levels detected in region',
            'Sensor offline for more than 24 hours',
            'Anomalous prediction detected, requires verification'
          ][i % 3],
          severity: ['high', 'medium', 'low'][i % 3],
          acknowledged: i % 2 === 0,
          created_at: new Date(Date.now() - i * 3600000 * 24).toISOString(),
          grid_cell: {
            id: i + 1,
            location: {
              coordinates: [-77.0369 + Math.random() * 0.1, 38.9072 + Math.random() * 0.1]
            }
          }
        })));
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    setLoading(true);
    try {
      await axios.post(`/api/alerts/${alertId}/acknowledge/`);
      // Update the alert in the state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      // For development, just update the state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    }
    setLoading(false);
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'high_pm25':
        return 'High PM2.5';
      case 'sensor_offline':
        return 'Sensor Offline';
      case 'prediction_anomaly':
        return 'Prediction Anomaly';
      default:
        return type;
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Air Quality Alerts
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow 
                  key={alert.id}
                  sx={{ 
                    bgcolor: alert.acknowledged ? 'inherit' : 'rgba(255, 0, 0, 0.05)'
                  }}
                >
                  <TableCell>{alert.id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getAlertTypeLabel(alert.type)} 
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    <Chip 
                      label={alert.severity.toUpperCase()} 
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewDetails(alert)}
                      >
                        Details
                      </Button>
                      {!alert.acknowledged && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Alert Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedAlert.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {getAlertTypeLabel(selectedAlert.type)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Message:</strong> {selectedAlert.message}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Severity:</strong> {selectedAlert.severity}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> {selectedAlert.grid_cell.location.coordinates[1].toFixed(4)}, 
                {selectedAlert.grid_cell.location.coordinates[0].toFixed(4)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created:</strong> {new Date(selectedAlert.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedAlert.acknowledged ? 'Acknowledged' : 'Pending'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedAlert && !selectedAlert.acknowledged && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                handleAcknowledge(selectedAlert.id);
                handleCloseDialog();
              }}
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Alerts;
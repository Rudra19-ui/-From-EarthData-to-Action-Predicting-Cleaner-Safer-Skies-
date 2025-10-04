import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import axios from 'axios';

function Predictions() {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [formData, setFormData] = useState({
    lat: '',
    lon: '',
    temperature: '',
    humidity: '',
    wind_speed: '',
    model_type: 'latest'
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('/api/predictions/');
        setPredictions(response.data.slice(0, 10)); // Show only the latest 10
        setLoading(false);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        // Mock data for development
        setPredictions(Array.from({length: 10}, (_, i) => ({
          id: i + 1,
          value: Math.floor(Math.random() * 50) + 5,
          uncertainty: Math.random() * 5,
          model_type: i % 2 === 0 ? 'rf' : 'xgboost',
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          grid_cell: {
            id: i + 1,
            location: {
              coordinates: [-77.0369 + Math.random() * 0.1, 38.9072 + Math.random() * 0.1]
            },
            temperature: Math.floor(Math.random() * 15) + 15,
            humidity: Math.floor(Math.random() * 40) + 30
          }
        })));
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/predictions/predict/', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Error making prediction:', error);
      // Mock result for development
      setResult({
        pm25: parseFloat((Math.random() * 30 + 10).toFixed(2)),
        aqi: Math.floor(Math.random() * 150 + 50),
        uncertainty: parseFloat((Math.random() * 5).toFixed(2)),
        lat: parseFloat(formData.lat),
        lon: parseFloat(formData.lon),
        model_type: formData.model_type,
        timestamp: new Date().toISOString()
      });
    }

    setLoading(false);
  };

  if (loading && predictions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Air Quality Predictions
      </Typography>

      <Grid container spacing={3}>
        {/* Prediction Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Make a New Prediction
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Latitude"
                    name="lat"
                    type="number"
                    value={formData.lat}
                    onChange={handleInputChange}
                    inputProps={{ step: 'any' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Longitude"
                    name="lon"
                    type="number"
                    value={formData.lon}
                    onChange={handleInputChange}
                    inputProps={{ step: 'any' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    name="temperature"
                    type="number"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    inputProps={{ step: 'any' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Humidity (%)"
                    name="humidity"
                    type="number"
                    value={formData.humidity}
                    onChange={handleInputChange}
                    inputProps={{ step: 'any' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Wind Speed (m/s)"
                    name="wind_speed"
                    type="number"
                    value={formData.wind_speed}
                    onChange={handleInputChange}
                    inputProps={{ step: 'any' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Model Type"
                    name="model_type"
                    value={formData.model_type}
                    onChange={handleInputChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="latest">Latest</option>
                    <option value="rf">Random Forest</option>
                    <option value="xgboost">XGBoost</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Predict'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Prediction Result */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Prediction Result
            </Typography>
            {result ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>PM2.5:</strong> {result.pm25} μg/m³
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>AQI:</strong> {result.aqi}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Uncertainty:</strong> ±{result.uncertainty} μg/m³
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Location:</strong> {result.lat}, {result.lon}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Model:</strong> {result.model_type}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Enter location details and click "Predict" to get air quality prediction
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Predictions Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>PM2.5 (μg/m³)</TableCell>
                    <TableCell>Uncertainty</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>{prediction.id}</TableCell>
                      <TableCell>
                        {prediction.grid_cell.location.coordinates[1].toFixed(4)}, 
                        {prediction.grid_cell.location.coordinates[0].toFixed(4)}
                      </TableCell>
                      <TableCell>{prediction.value}</TableCell>
                      <TableCell>±{prediction.uncertainty}</TableCell>
                      <TableCell>{prediction.model_type}</TableCell>
                      <TableCell>{new Date(prediction.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Predictions;
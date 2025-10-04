import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for Leaflet marker icons
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map view when center changes
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function MapView() {
  const [loading, setLoading] = useState(true);
  const [gridCells, setGridCells] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [center, setCenter] = useState([38.9072, -77.0369]); // Default to Washington DC

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch datasets
        const datasetsRes = await axios.get('/api/datasets/');
        setDatasets(datasetsRes.data);
        
        if (datasetsRes.data.length > 0) {
          setSelectedDataset(datasetsRes.data[0].id);
          
          // Fetch grid cells for the first dataset
          const gridCellsRes = await axios.get(`/api/grid-cells/?dataset=${datasetsRes.data[0].id}`);
          setGridCells(gridCellsRes.data);
          
          // Set map center to the first grid cell if available
          if (gridCellsRes.data.length > 0) {
            const firstCell = gridCellsRes.data[0];
            const coords = firstCell.location.coordinates;
            setCenter([coords[1], coords[0]]); // Leaflet uses [lat, lng]
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching map data:', error);
        // Use mock data for development
        const mockGridCells = Array.from({length: 20}, (_, i) => ({
          id: i + 1,
          location: {
            type: 'Point',
            coordinates: [
              -77.0369 + (Math.random() - 0.5) * 0.5, // lng
              38.9072 + (Math.random() - 0.5) * 0.5   // lat
            ]
          },
          pm25_value: Math.floor(Math.random() * 50) + 5,
          temperature: Math.floor(Math.random() * 15) + 15,
          humidity: Math.floor(Math.random() * 40) + 30,
        }));
        
        setGridCells(mockGridCells);
        setDatasets([{ id: 1, name: 'Sample Dataset' }]);
        setSelectedDataset(1);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDatasetChange = async (event) => {
    const datasetId = event.target.value;
    setSelectedDataset(datasetId);
    setLoading(true);
    
    try {
      const gridCellsRes = await axios.get(`/api/grid-cells/?dataset=${datasetId}`);
      setGridCells(gridCellsRes.data);
      
      // Update map center
      if (gridCellsRes.data.length > 0) {
        const firstCell = gridCellsRes.data[0];
        const coords = firstCell.location.coordinates;
        setCenter([coords[1], coords[0]]); // Leaflet uses [lat, lng]
      }
    } catch (error) {
      console.error('Error fetching grid cells:', error);
    }
    
    setLoading(false);
  };

  // Function to determine circle color based on PM2.5 value
  const getColor = (value) => {
    if (value < 12) return '#00e400'; // Good
    if (value < 35.4) return '#ffff00'; // Moderate
    if (value < 55.4) return '#ff7e00'; // Unhealthy for Sensitive Groups
    if (value < 150.4) return '#ff0000'; // Unhealthy
    if (value < 250.4) return '#99004c'; // Very Unhealthy
    return '#7e0023'; // Hazardous
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Air Quality Map
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Dataset</InputLabel>
          <Select
            value={selectedDataset}
            label="Dataset"
            onChange={handleDatasetChange}
          >
            {datasets.map((dataset) => (
              <MenuItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Paper sx={{ height: '70vh', width: '100%' }}>
        <MapContainer 
          center={center} 
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {gridCells.map((cell) => {
            const coords = cell.location.coordinates;
            return (
              <CircleMarker
                key={cell.id}
                center={[coords[1], coords[0]]} // Leaflet uses [lat, lng]
                radius={10}
                pathOptions={{
                  fillColor: getColor(cell.pm25_value),
                  color: 'white',
                  weight: 1,
                  fillOpacity: 0.8
                }}
              >
                <Popup>
                  <div>
                    <strong>PM2.5:</strong> {cell.pm25_value} μg/m³<br />
                    <strong>Temperature:</strong> {cell.temperature}°C<br />
                    <strong>Humidity:</strong> {cell.humidity}%<br />
                    <strong>Coordinates:</strong> {coords[1].toFixed(4)}, {coords[0].toFixed(4)}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </Paper>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Air Quality Index (AQI) Legend
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#00e400', mr: 1 }} />
            <Typography variant="body2">Good (0-12)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#ffff00', mr: 1 }} />
            <Typography variant="body2">Moderate (12.1-35.4)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#ff7e00', mr: 1 }} />
            <Typography variant="body2">Unhealthy for Sensitive Groups (35.5-55.4)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#ff0000', mr: 1 }} />
            <Typography variant="body2">Unhealthy (55.5-150.4)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#99004c', mr: 1 }} />
            <Typography variant="body2">Very Unhealthy (150.5-250.4)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#7e0023', mr: 1 }} />
            <Typography variant="body2">Hazardous (250.5+)</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MapView;
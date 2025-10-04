import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardStats = async () => {
  try {
    const [datasets, sensors, alerts, gridCells] = await Promise.all([
      api.get('/datasets/'),
      api.get('/sensors/'),
      api.get('/alerts/'),
      api.get('/grid-cells/'),
    ]);
    
    // Calculate average PM2.5 from grid cells
    const pm25Values = gridCells.data
      .map(cell => cell.pm25)
      .filter(val => val !== null);
    
    const avgPm25 = pm25Values.length 
      ? pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length 
      : 0;
    
    return {
      totalDatasets: datasets.data.length,
      totalSensors: sensors.data.length,
      totalAlerts: alerts.data.length,
      averagePm25: avgPm25.toFixed(2),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchDatasets = async () => {
  try {
    const response = await api.get('/datasets/');
    return response.data;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
};

export const fetchGridCells = async (datasetId) => {
  try {
    const response = await api.get(`/grid-cells/?dataset=${datasetId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching grid cells:', error);
    throw error;
  }
};

export const fetchLatestGridCells = async () => {
  try {
    const response = await api.get('/grid-cells/latest/');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest grid cells:', error);
    throw error;
  }
};

export const fetchPredictions = async () => {
  try {
    const response = await api.get('/predictions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};

export const createPrediction = async (predictionData) => {
  try {
    const response = await api.post('/predictions/predict/', predictionData);
    return response.data;
  } catch (error) {
    console.error('Error creating prediction:', error);
    throw error;
  }
};

export const explainPrediction = async (predictionId) => {
  try {
    const response = await api.get(`/predictions/${predictionId}/explain/`);
    return response.data;
  } catch (error) {
    console.error('Error explaining prediction:', error);
    throw error;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const acknowledgeAlert = async (alertId) => {
  try {
    const response = await api.post(`/alerts/${alertId}/acknowledge/`);
    return response.data;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};

export default api;
import axios from 'axios';

// Set the base URL for API requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NASA API services
export const getNasaAPOD = async () => {
  try {
    const response = await api.get('/api/nasa/apod/');
    return response.data;
  } catch (error) {
    console.error('Error fetching NASA APOD:', error);
    throw error;
  }
};

export const getNasaMarsPhotos = async (sol = 1000) => {
  try {
    const response = await api.get(`/api/nasa/mars-photos/?sol=${sol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Mars photos:', error);
    throw error;
  }
};

export const getNasaEarthImagery = async (lat = 29.78, lon = -95.33) => {
  try {
    const response = await api.get(`/api/nasa/earth-imagery/?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Earth imagery:', error);
    throw error;
  }
};

export default api;
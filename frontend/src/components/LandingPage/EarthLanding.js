import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { TextureLoader, Vector3 } from 'three';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Fade,
  styled,
  Alert,
  Fab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PublicIcon from '@mui/icons-material/Public';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';

// Styled components
const FullScreenContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f3460 100%)',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '5%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  textAlign: 'center',
  color: 'white',
  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '5%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '10px',
  padding: theme.spacing(2),
  color: 'white',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  maxWidth: '300px',
}));

const RefreshButton = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 1000,
  backgroundColor: 'rgba(25, 118, 210, 0.8)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 1)',
  },
}));

const LoadingContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1000,
  textAlign: 'center',
  color: 'white',
});

// Earth component
function Earth({ airQualityData, isLoading }) {
  const earthRef = useRef();
  const pointsGroupRef = useRef();
  
  // Load Earth texture (using a data URL for a simple blue marble texture)
  const earthTexture = useLoader(TextureLoader, 'data:image/svg+xml;base64,' + btoa(`
    <svg width="512" height="256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#4FC3F7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="landGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#81C784;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#388E3C;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="512" height="256" fill="url(#oceanGrad)"/>
      <circle cx="100" cy="80" r="30" fill="url(#landGrad)"/>
      <circle cx="200" cy="120" r="40" fill="url(#landGrad)"/>
      <circle cx="350" cy="100" r="25" fill="url(#landGrad)"/>
      <circle cx="450" cy="150" r="35" fill="url(#landGrad)"/>
      <ellipse cx="150" cy="180" rx="60" ry="20" fill="url(#landGrad)"/>
      <ellipse cx="300" cy="200" rx="80" ry="25" fill="url(#landGrad)"/>
    </svg>
  `));

  // Auto-rotate Earth
  useFrame(() => {
    if (earthRef.current && !isLoading) {
      earthRef.current.rotation.y += 0.002;
    }
    if (pointsGroupRef.current && !isLoading) {
      pointsGroupRef.current.rotation.y += 0.002;
    }
  });

  // Convert lat/lon to 3D coordinates on sphere
  const latLonToVector3 = (lat, lon, radius = 2.02) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new Vector3(x, y, z);
  };

  // Get color based on AQI value
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50'; // Green - Good
    if (aqi <= 100) return '#FF9800'; // Orange - Moderate
    return '#F44336'; // Red - Poor
  };

  // Create air quality points
  const airQualityPoints = useMemo(() => {
    if (!airQualityData || airQualityData.length === 0) return [];
    
    return airQualityData.map((point, index) => {
      // Use grid cell geometry or sensor coordinates
      let lat, lon, aqi;
      
      if (point.grid_cell && point.grid_cell.geometry && point.grid_cell.geometry.coordinates) {
        // Extract coordinates from geometry (assuming first coordinate pair)
        const coords = point.grid_cell.geometry.coordinates[0][0];
        lon = coords[0];
        lat = coords[1];
        aqi = point.aqi || 0;
      } else if (point.latitude !== undefined && point.longitude !== undefined) {
        lat = point.latitude;
        lon = point.longitude;
        aqi = point.aqi || 0;
      } else {
        return null;
      }

      const position = latLonToVector3(lat, lon);
      const color = getAQIColor(aqi);
      
      return (
        <group key={index} position={position}>
          <mesh>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.8}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      );
    }).filter(Boolean);
  }, [airQualityData]);

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 32]} />
        <meshPhongMaterial 
          map={earthTexture}
          shininess={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 32]} />
        <meshBasicMaterial 
          color="#87CEEB"
          transparent 
          opacity={0.1}
        />
      </mesh>
      
      {/* Air quality data points */}
      <group ref={pointsGroupRef}>
        {airQualityPoints}
      </group>
    </group>
  );
}

// Legend component
function Legend() {
  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '10px',
      padding: 2,
      color: 'white',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <Typography variant="h6" gutterBottom>
        Air Quality Legend
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 10px #4CAF50'
          }} />
          <Typography variant="body2">Good (AQI ≤ 50)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#FF9800',
            boxShadow: '0 0 10px #FF9800'
          }} />
          <Typography variant="body2">Moderate (AQI 51-100)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#F44336',
            boxShadow: '0 0 10px #F44336'
          }} />
          <Typography variant="body2">Poor (AQI > 100)</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Main EarthLanding component
export default function EarthLanding() {
  const navigate = useNavigate();
  const [airQualityData, setAirQualityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataStats, setDataStats] = useState({ total: 0, good: 0, moderate: 0, poor: 0 });

  // Fetch air quality data
  const fetchAirQualityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch predictions first, fall back to sensors if needed
      let response;
      try {
        response = await axios.get('/api/predictions/');
      } catch (err) {
        // If predictions endpoint fails, try sensors endpoint
        console.log('Predictions endpoint failed, trying sensors...');
        response = await axios.get('/api/sensors/');
      }
      
      const data = response.data.results || response.data;
      setAirQualityData(Array.isArray(data) ? data : []);
      
      // Calculate statistics
      if (Array.isArray(data)) {
        const stats = data.reduce((acc, point) => {
          const aqi = point.aqi || 0;
          acc.total++;
          if (aqi <= 50) acc.good++;
          else if (aqi <= 100) acc.moderate++;
          else acc.poor++;
          return acc;
        }, { total: 0, good: 0, moderate: 0, poor: 0 });
        
        setDataStats(stats);
      }
      
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Unable to load air quality data. Please ensure the backend is running.');
      // Set some sample data for demonstration
      const sampleData = [
        { latitude: 40.7128, longitude: -74.0060, aqi: 45 }, // NYC
        { latitude: 34.0522, longitude: -118.2437, aqi: 75 }, // LA
        { latitude: 41.8781, longitude: -87.6298, aqi: 120 }, // Chicago
        { latitude: 29.7604, longitude: -95.3698, aqi: 65 }, // Houston
        { latitude: 37.7749, longitude: -122.4194, aqi: 35 }, // SF
      ];
      setAirQualityData(sampleData);
      setDataStats({ total: 5, good: 2, moderate: 2, poor: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAirQualityData();
  }, []);

  const handleEnterDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <FullScreenContainer>
      {/* Header */}
      <HeaderContainer>
        <Fade in timeout={2000}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(45deg, #64B5F6, #42A5F5, #2196F3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
              NASA Air Quality Monitoring System 🌍
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 300,
                fontSize: { xs: '1rem', md: '1.2rem' }
              }}
            >
              Interactive Global Air Quality Visualization
            </Typography>
          </Box>
        </Fade>
      </HeaderContainer>

      {/* Refresh Button */}
      <RefreshButton
        onClick={fetchAirQualityData}
        disabled={isLoading}
        size="small"
      >
        <RefreshIcon />
      </RefreshButton>

      {/* Info Panel */}
      <InfoContainer>
        <Typography variant="h6" gutterBottom>
          <PublicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Data Overview
        </Typography>
        {!isLoading && (
          <>
            <Typography variant="body2" gutterBottom>
              Total Locations: {dataStats.total}
            </Typography>
            <Typography variant="body2" color="#4CAF50" gutterBottom>
              Good Quality: {dataStats.good}
            </Typography>
            <Typography variant="body2" color="#FF9800" gutterBottom>
              Moderate: {dataStats.moderate}
            </Typography>
            <Typography variant="body2" color="#F44336" gutterBottom>
              Poor Quality: {dataStats.poor}
            </Typography>
          </>
        )}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading data...</Typography>
          </Box>
        )}
      </InfoContainer>

      {/* Error Alert */}
      {error && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: { xs: '90%', md: '400px' }
        }}>
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* 3D Earth Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={
          <Html center>
            <LoadingContainer>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading Earth...
              </Typography>
            </LoadingContainer>
          </Html>
        }>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={false}
            minDistance={3}
            maxDistance={8}
            rotateSpeed={0.5}
          />
          
          {/* Background Stars */}
          <Stars 
            radius={300} 
            depth={60} 
            count={3000} 
            factor={7} 
            saturation={0.5}
            fade 
          />
          
          {/* Earth */}
          <Earth airQualityData={airQualityData} isLoading={isLoading} />
        </Suspense>
      </Canvas>

      {/* Controls */}
      <ControlsContainer>
        <Fade in timeout={3000}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                mb: 2,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              🌐 Drag to rotate • 🔍 Scroll to zoom • 🎯 Click points for details
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleEnterDashboard}
              startIcon={<DashboardIcon />}
              sx={{
                bgcolor: 'rgba(25, 118, 210, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 'bold',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
                }
              }}
            >
              Enter Dashboard
            </Button>
          </Box>
        </Fade>
      </ControlsContainer>

      {/* Legend */}
      <Legend />
    </FullScreenContainer>
  );
}
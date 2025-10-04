import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './components/LandingPage/LandingPage';
import EarthLanding from './components/LandingPage/EarthLanding';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Predictions from './components/Predictions';
import Alerts from './components/Alerts';
import Layout from './components/Layout';

// Create a dark theme for space-themed UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb',
    },
    secondary: {
      main: '#4db6ac',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing page - comprehensive multi-section page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Interactive Earth view - full screen 3D visualization */}
          <Route path="/earth-view" element={<EarthLanding />} />
          
          {/* Dashboard routes - with layout */}
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/map" element={
            <Layout>
              <MapView />
            </Layout>
          } />
          <Route path="/predictions" element={
            <Layout>
              <Predictions />
            </Layout>
          } />
          <Route path="/alerts" element={
            <Layout>
              <Alerts />
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
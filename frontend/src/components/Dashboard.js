import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalSensors: 0,
    totalAlerts: 0,
    averagePM25: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch datasets
        const datasetsRes = await axios.get('/api/datasets/');
        
        // Fetch predictions
        const predictionsRes = await axios.get('/api/predictions/');
        
        // Fetch alerts
        const alertsRes = await axios.get('/api/alerts/');
        
        // Fetch sensors
        const sensorsRes = await axios.get('/api/sensors/');
        
        // Calculate stats
        const avgPM25 = predictionsRes.data.length > 0
          ? predictionsRes.data.reduce((sum, pred) => sum + pred.value, 0) / predictionsRes.data.length
          : 0;
        
        setStats({
          totalDatasets: datasetsRes.data.length,
          totalSensors: sensorsRes.data.length,
          totalAlerts: alertsRes.data.length,
          averagePM25: avgPM25.toFixed(2),
        });
        
        // Prepare chart data
        const sortedPredictions = [...predictionsRes.data]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-20); // Get last 20 predictions
        
        const labels = sortedPredictions.map(pred => {
          const date = new Date(pred.timestamp);
          return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        });
        
        const datasets = [{
          label: 'PM2.5 Values',
          data: sortedPredictions.map(pred => pred.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }];
        
        setChartData({
          labels,
          datasets,
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use mock data for development
        setStats({
          totalDatasets: 3,
          totalSensors: 12,
          totalAlerts: 5,
          averagePM25: 18.45,
        });
        
        // Mock chart data
        const mockLabels = Array.from({length: 20}, (_, i) => `Day ${i+1}`);
        const mockData = Array.from({length: 20}, () => Math.floor(Math.random() * 30) + 10);
        
        setChartData({
          labels: mockLabels,
          datasets: [{
            label: 'PM2.5 Values',
            data: mockData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }],
        });
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
        Air Quality Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Datasets
              </Typography>
              <Typography variant="h4">
                {stats.totalDatasets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Sensors
              </Typography>
              <Typography variant="h4">
                {stats.totalSensors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average PM2.5
              </Typography>
              <Typography variant="h4">
                {stats.averagePM25}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4">
                {stats.totalAlerts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              PM2.5 Trend
            </Typography>
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Air Quality Measurements Over Time',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
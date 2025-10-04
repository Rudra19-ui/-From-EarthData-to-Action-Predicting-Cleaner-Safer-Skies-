# NASA Air Quality Monitoring System - Landing Pages

This directory contains the landing page components for the NASA Air Quality Monitoring System.

## Components

### 1. LandingPage.js (Main Landing Page)
**Route:** `/`

A comprehensive, professional landing page featuring:

#### Sections:
- **Navigation Bar**: Fixed header with smooth scrolling navigation
- **Hero Section**: Eye-catching introduction with main value proposition
- **Features Section**: 6 key capabilities with animated cards
- **Statistics Section**: Real-time data metrics fetched from API
- **About Section**: Mission explanation and technology overview
- **Call-to-Action**: Final conversion section with navigation buttons
- **Footer**: Contact information and credits

#### Key Features:
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- 🎨 **Modern Design**: Material-UI with custom styling and animations
- 📊 **Real-time Data**: Live statistics from backend APIs
- 🧭 **Smooth Navigation**: Section scrolling and mobile-friendly menu
- ⚡ **Performance Optimized**: Fade animations and lazy loading
- 🎯 **Conversion Focused**: Strategic CTAs and user flow

### 2. EarthLanding.js (3D Interactive Earth)
**Route:** `/earth-view`

Full-screen 3D Earth visualization with:

#### 🌍 Interactive 3D Earth
- Realistic Earth globe with blue marble texture
- Smooth rotation animation
- Mouse controls for rotation and zoom
- Atmospheric glow effects

#### 📊 Real-time Air Quality Data
- Fetches live data from `/api/predictions/` endpoint
- Fallback to `/api/sensors/` if predictions unavailable
- Color-coded data points on the globe:
  - 🟢 Green: Good air quality (AQI ≤ 50)
  - 🟠 Orange: Moderate air quality (AQI 51-100)
  - 🔴 Red: Poor air quality (AQI > 100)

#### 🎨 Modern UI Design
- Space-themed gradient background
- Animated starfield with twinkling effects
- Glassmorphism UI elements with blur effects
- Professional typography and spacing

## Navigation Flow

```
/ (Landing Page) 
├── "Explore Dashboard" → /dashboard
├── "View Interactive Earth" → /earth-view
└── "Launch Earth View" → /earth-view

/earth-view (3D Earth)
└── "Enter Dashboard" → /dashboard
```

## Technical Implementation

### Dependencies
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers and controls
- `three` - 3D graphics library
- `@mui/material` - UI components and theming
- `axios` - API requests

### Performance Optimizations
- Suspense boundaries for 3D loading
- Efficient coordinate calculations
- Optimized re-renders with useMemo
- Lazy loading with fade animations
- Mobile-responsive optimizations

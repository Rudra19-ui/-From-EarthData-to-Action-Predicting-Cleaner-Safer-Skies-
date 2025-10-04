# NASA Air Quality Monitoring System 🛰️

A comprehensive full-stack application for monitoring, predicting, and visualizing air quality data using machine learning algorithms and real-time data processing. This system provides interactive visualizations, predictive analytics, and alert mechanisms for air quality management.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.13.0-blue)
![Django](https://img.shields.io/badge/Django-5.2.7-green)
![React](https://img.shields.io/badge/React-18.2.0-lightblue)
![Node.js](https://img.shields.io/badge/Node.js-22.16.0-green)

## 🌟 Features

### Core Functionality
- **🌍 Interactive 3D Earth**: Stunning Three.js-powered landing page with rotating Earth visualization
- **📊 Data Ingestion**: Import and process air quality data from multiple sources (CSV, GeoJSON)
- **🤖 Machine Learning**: Advanced prediction models using Random Forest and XGBoost algorithms
- **🗺️ Interactive Mapping**: Real-time geospatial visualization with Leaflet.js and 3D globe
- **📈 Predictive Analytics**: Generate air quality forecasts with uncertainty quantification
- **🚨 Alert System**: Automated monitoring and alert generation for air quality thresholds
- **📱 Responsive Design**: Mobile-friendly interface with Material-UI components
- **🔄 Real-time Updates**: Live data streaming and automatic refresh capabilities
- **📋 Data Management**: Comprehensive dataset and sensor management system

### Advanced Features
- **SHAP Integration**: Model explainability and feature importance analysis (temporarily disabled)
- **Grid-based Predictions**: Spatial interpolation and grid cell predictions
- **Multi-model Support**: Ensemble learning with multiple ML algorithms
- **Historical Analysis**: Time-series analysis and trend visualization
- **Export Capabilities**: Data export in multiple formats (CSV, JSON, GeoJSON)

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2.7 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Machine Learning**: 
  - scikit-learn 1.7.0 (Random Forest, preprocessing)
  - XGBoost 3.0.5 (gradient boosting) *
  - SHAP 0.48.0 (model interpretability) *
  - NumPy, Pandas for data processing
- **Geospatial**: Django GIS extensions (temporarily using JSON storage)
- **Task Queue**: Celery with Redis (configured)
- **API**: RESTful API with pagination and filtering

### Frontend
- **Framework**: React 18.2.0 with modern hooks
- **UI Library**: Material-UI (MUI) 5.13.0
- **Mapping**: Leaflet 1.9.4 with React-Leaflet 4.2.1
- **Charts**: Chart.js 4.3.0 with React-Chart.js-2
- **HTTP Client**: Axios 1.4.0
- **Routing**: React Router DOM 6.11.1
- **Build Tool**: Create React App with Webpack

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload, auto-compilation
- **Proxy**: Development proxy for API integration
- **Version Control**: Git with comprehensive .gitignore

*Note: XGBoost and SHAP temporarily disabled for Python 3.13 compatibility

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended for Production)

```bash
# Clone the repository
git clone <repository-url>
cd nasa

# Start all services with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000/api/
```

### Option 2: Manual Setup (Development)

#### Prerequisites
- Python 3.13.0 or higher
- Node.js 22.16.0 or higher
- npm or yarn package manager
- Git (for version control)

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create sample data
python manage.py ingest_sample

# Optional: Train ML models (if available)
python manage.py train_models --generate_predictions

# Start Django development server
python manage.py runserver
# Backend will be available at http://127.0.0.1:8000/
```

#### Frontend Setup (New Terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
# Frontend will be available at http://localhost:3000
```

## 📁 Project Structure

```
nasa/
├── README.md                    # This comprehensive guide
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Docker services configuration
├── Makefile                     # Build automation commands
├── demo.html                    # Demo page
│
├── backend/                     # Django Backend Application
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── db.sqlite3              # SQLite database (created after setup)
│   │
│   ├── config/                 # Django Configuration
│   │   ├── __init__.py
│   │   ├── settings.py         # Main settings file
│   │   ├── urls.py             # URL routing
│   │   ├── wsgi.py             # WSGI configuration
│   │   └── celery.py           # Celery configuration
│   │
│   └── apps/                   # Django Applications
│       ├── core/               # Core Data Models
│       │   ├── models.py       # Database models (Dataset, Sensor, GridCell, etc.)
│       │   ├── admin.py        # Django admin configuration
│       │   └── migrations/     # Database migrations
│       │
│       ├── api/                # REST API Endpoints
│       │   ├── views.py        # API view classes
│       │   ├── serializers.py  # Data serialization
│       │   ├── urls.py         # API URL patterns
│       │   └── filters.py      # Query filtering
│       │
│       ├── ingest/             # Data Ingestion Services
│       │   ├── ingest.py       # Data processing functions
│       │   ├── management/     # Custom management commands
│       │   │   └── commands/
│       │   │       └── ingest_sample.py  # Sample data command
│       │   └── tasks.py        # Celery background tasks
│       │
│       └── ml/                 # Machine Learning Components
│           ├── models.py       # ML model classes
│           ├── train.py        # Model training utilities
│           ├── management/     # ML management commands
│           │   └── commands/
│           │       └── train_models.py   # Model training command
│           └── models/         # Saved model files (created after training)
│
├── frontend/                   # React Frontend Application
│   ├── package.json            # Node.js dependencies and scripts
│   ├── package-lock.json       # Dependency lock file
│   ├── .gitignore             # Frontend-specific ignore rules
│   │
│   ├── public/                 # Static Public Assets
│   │   ├── index.html          # Main HTML template
│   │   ├── favicon.ico         # Website favicon
│   │   └── manifest.json       # PWA manifest
│   │
│   ├── src/                    # React Source Code
│   │   ├── index.js            # Application entry point
│   │   ├── App.js              # Main App component
│   │   ├── App.css             # Global styles
│   │   │
│   │   ├── components/         # React Components
│   │   │   ├── Dashboard/      # Dashboard components
│   │   │   ├── Map/            # Map visualization components
│   │   │   ├── Charts/         # Chart components
│   │   │   ├── Alerts/         # Alert system components
│   │   │   ├── DataTable/      # Data display components
│   │   │   └── Layout/         # Layout and navigation components
│   │   │
│   │   ├── services/           # API Integration
│   │   │   ├── api.js          # Base API configuration
│   │   │   ├── datasets.js     # Dataset API calls
│   │   │   ├── sensors.js      # Sensor API calls
│   │   │   ├── predictions.js  # Prediction API calls
│   │   │   └── alerts.js       # Alert API calls
│   │   │
│   │   ├── utils/              # Utility Functions
│   │   │   ├── formatters.js   # Data formatting utilities
│   │   │   ├── validators.js   # Input validation
│   │   │   └── constants.js    # Application constants
│   │   │
│   │   └── styles/             # Styling
│   │       ├── theme.js        # Material-UI theme configuration
│   │       └── globals.css     # Global CSS styles
│   │
│   └── node_modules/           # Node.js dependencies (created after npm install)
│
├── sample_data/                # Sample Data Files
│   ├── sensors.csv             # Sample sensor data
│   ├── air_quality.csv         # Sample air quality measurements
│   └── grid_cells.geojson      # Sample spatial grid data
│
├── docs/                       # Documentation
│   ├── API.md                  # API documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── DEVELOPMENT.md          # Development setup guide
│
└── .github/                    # GitHub Configuration
    └── workflows/              # GitHub Actions CI/CD
        ├── backend-tests.yml   # Backend testing pipeline
        └── frontend-tests.yml  # Frontend testing pipeline
```

## 🔌 API Endpoints

### Core Data Endpoints
- **GET/POST** `/api/datasets/` - Air quality datasets management
- **GET/POST** `/api/sensors/` - Sensor information and registration
- **GET/POST** `/api/grid-cells/` - Spatial grid cells with air quality data
- **GET/POST** `/api/predictions/` - Air quality predictions and forecasts
- **GET** `/api/ingestion-jobs/` - Data ingestion job status and history
- **GET/POST** `/api/alerts/` - Air quality alerts and notifications

### Advanced Endpoints
- **POST** `/api/predictions/predict/` - Generate new predictions
- **GET** `/api/predictions/{id}/explain/` - Get model explanations (SHAP)
- **POST** `/api/ingestion/upload/` - Upload data files
- **GET** `/api/stats/` - System statistics and metrics
- **GET** `/api/health/` - System health check

### Query Parameters
- **Filtering**: `?dataset=1&active=true`
- **Pagination**: `?page=2&page_size=20`
- **Ordering**: `?ordering=-created_at`
- **Search**: `?search=sensor_name`
- **Date Range**: `?start_date=2024-01-01&end_date=2024-12-31`

## 🗃️ Database Schema

### Core Models

#### Dataset
- `id`: Primary key
- `name`: Dataset name (CharField)
- `description`: Description (TextField)
- `source_url`: Data source URL (URLField)
- `created_at`, `updated_at`: Timestamps

#### Sensor
- `id`: Primary key
- `dataset`: Foreign key to Dataset
- `name`: Sensor identifier
- `latitude`, `longitude`: Location coordinates (FloatField)
- `elevation`: Elevation in meters (FloatField, optional)
- `active`: Status flag (BooleanField)
- `created_at`, `updated_at`: Timestamps

#### GridCell
- `id`: Primary key
- `dataset`: Foreign key to Dataset
- `cell_id`: Unique cell identifier
- `geometry`: Spatial geometry data (JSONField)
- `created_at`: Timestamp

#### Prediction
- `id`: Primary key
- `grid_cell`: Foreign key to GridCell
- `timestamp`: Prediction timestamp
- `pm25`: PM2.5 concentration (FloatField)
- `aqi`: Air Quality Index (IntegerField)
- `uncertainty`: Prediction uncertainty (FloatField)
- `created_at`: Timestamp

#### Alert
- `id`: Primary key
- `prediction`: Foreign key to Prediction
- `severity`: Alert level (low, medium, high, critical)
- `message`: Alert message (TextField)
- `acknowledged`: Status flag (BooleanField)
- `created_at`: Timestamp

## 🧠 Machine Learning Pipeline

### Supported Models
1. **Random Forest Regressor**
   - Ensemble method for robust predictions
   - Feature importance analysis
   - Handles missing data well
   - Currently active

2. **XGBoost Regressor** *(temporarily disabled)*
   - Gradient boosting for high performance
   - Advanced regularization
   - GPU acceleration support

### Feature Engineering
- **Spatial Features**: Latitude, longitude, elevation
- **Temporal Features**: Hour, day, month, weekend flag
- **Environmental**: Temperature, humidity, wind speed, wind direction
- **Preprocessing**: StandardScaler, SimpleImputer for missing values

### Model Training
```bash
# Train models with sample data
python manage.py train_models

# Train with prediction generation
python manage.py train_models --generate_predictions

# Retrain existing models
python manage.py train_models --retrain
```

### Prediction Workflow
1. Data preprocessing and feature extraction
2. Model inference with uncertainty quantification
3. Post-processing and AQI calculation
4. Alert generation based on thresholds
5. Storage and API exposure

## 🎨 Frontend Architecture

### Component Structure
- **App.js**: Main application component with routing
- **Dashboard**: Main dashboard with metrics and charts
- **Map**: Interactive Leaflet map with sensor locations
- **DataTable**: Sortable, filterable data tables
- **Charts**: Line charts, bar charts, and time series
- **Alerts**: Alert management and notifications
- **Layout**: Navigation, header, sidebar components

### State Management
- React Hooks (useState, useEffect, useContext)
- Custom hooks for API integration
- Local component state for UI interactions
- Props for parent-child communication

### Styling Approach
- Material-UI for consistent design system
- Custom CSS for specific styling needs
- Responsive design for mobile compatibility
- Dark/light theme support (configurable)

## 🚀 Development Workflow

### Backend Development
```bash
# Create new Django app
cd backend
python manage.py startapp newapp

# Create migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

### Frontend Development
```bash
cd frontend

# Add new dependency
npm install package-name

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Analyze bundle size
npm run analyze
```

### Docker Development
```bash
# Build and start services
docker-compose up --build

# View logs
docker-compose logs -f

# Run backend commands in container
docker-compose exec web python manage.py migrate

# Run frontend commands in container
docker-compose exec frontend npm test

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in the root directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:password@localhost:5432/dbname

# Redis Configuration (for Celery)
REDIS_HOST=localhost
REDIS_PORT=6379

# Machine Learning
ML_MODEL_DIR=apps/ml/models
SAMPLE_DATA_DIR=sample_data

# API Keys (if needed)
WEATHER_API_KEY=your-weather-api-key
AIR_QUALITY_API_KEY=your-air-quality-api-key
```

### Django Settings Customization
Modify `backend/config/settings.py` for:
- Database configuration
- CORS settings
- Static file handling
- Logging configuration
- Security settings

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.core

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests (if configured)
npm run test:e2e
```

## 📦 Deployment

### Production Deployment

#### Using Docker (Recommended)
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Deployment
1. **Backend**:
   - Set `DEBUG=False` in settings
   - Configure PostgreSQL database
   - Set up Redis for Celery
   - Use Gunicorn as WSGI server
   - Configure Nginx as reverse proxy

2. **Frontend**:
   - Build production bundle: `npm run build`
   - Serve with Nginx or CDN
   - Configure environment variables

### Cloud Deployment Options
- **AWS**: EC2, RDS, S3, CloudFront
- **Google Cloud**: Compute Engine, Cloud SQL, Cloud Storage
- **Azure**: Virtual Machines, PostgreSQL, Blob Storage
- **Heroku**: Easy deployment with add-ons
- **DigitalOcean**: Droplets with managed databases

## 🔍 Monitoring and Logging

### Logging Configuration
- Django logging for backend events
- Console and file logging
- Error tracking and reporting
- Performance monitoring

### Monitoring Tools
- **Backend**: Django Debug Toolbar, Sentry
- **Frontend**: React DevTools, Lighthouse
- **Infrastructure**: Docker stats, system monitoring

## 🛡️ Security Considerations

### Backend Security
- CSRF protection enabled
- SQL injection prevention
- XSS protection
- Secure headers configuration
- API rate limiting
- Authentication and authorization

### Frontend Security
- Input validation and sanitization
- Secure API communication (HTTPS)
- Content Security Policy (CSP)
- Dependency vulnerability scanning

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **Import Errors**: Check Python path and installed packages
2. **Database Errors**: Ensure migrations are applied
3. **Port Conflicts**: Check if port 8000 is available
4. **CORS Errors**: Verify CORS_ALLOW_ALL_ORIGINS setting

#### Frontend Issues
1. **Proxy Errors**: Ensure backend server is running
2. **Build Failures**: Clear node_modules and reinstall
3. **Port Conflicts**: Change PORT in .env file
4. **API Errors**: Check network tab in browser DevTools

#### Docker Issues
1. **Build Failures**: Check Dockerfile syntax
2. **Volume Issues**: Verify volume mounts
3. **Network Issues**: Check Docker network configuration

### Debug Commands
```bash
# Check backend health
curl http://localhost:8000/api/health/

# Test database connection
python manage.py dbshell

# Check frontend build
npm run build --verbose

# Inspect Docker containers
docker ps
docker logs container_name
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards and write tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Coding Standards
- **Python**: Follow PEP 8, use Black for formatting
- **JavaScript**: Follow Airbnb style guide, use Prettier
- **Git**: Use conventional commit messages
- **Documentation**: Update README and inline comments

### Issue Reporting
- Use GitHub Issues template
- Include system information
- Provide reproduction steps
- Add relevant logs and screenshots

## 📚 Additional Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

### Tutorials and Guides
- [Django REST Framework Tutorial](https://www.django-rest-framework.org/tutorial/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [Machine Learning with scikit-learn](https://scikit-learn.org/stable/tutorial/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue on GitHub
- Check the [FAQ section](docs/FAQ.md)
- Review existing issues and discussions

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core functionality
- Django 5.2.7 and React 18.2.0
- SQLite database support
- Sample data generation
- Basic ML pipeline
- Material-UI interface
- Docker containerization

### Roadmap
- [ ] GeoDjango integration
- [ ] Real-time data streaming
- [ ] Advanced ML models
- [ ] Mobile application
- [ ] API versioning
- [ ] Performance optimization
- [ ] Comprehensive testing

---

**Made with ❤️ for NASA Space Apps Challenge**

*For technical support or questions, please refer to the issue tracker or documentation.*

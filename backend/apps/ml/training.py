import os
import pandas as pd
import numpy as np
from datetime import datetime
from django.conf import settings
from .models import RandomForestAQModel, XGBoostAQModel
from apps.core.models import Dataset, GridCell, Prediction


def prepare_training_data(dataset_id=None):
    """
    Prepare training data from the database
    
    Args:
        dataset_id: Optional dataset ID to filter data
    
    Returns:
        X: Feature matrix
        y: Target vector
    """
    # Get data from database
    if dataset_id:
        dataset = Dataset.objects.get(id=dataset_id)
        grid_cells = GridCell.objects.filter(dataset=dataset)
    else:
        # Use the most recent dataset if none specified
        dataset = Dataset.objects.order_by('-created_at').first()
        if not dataset:
            raise ValueError("No datasets found in the database")
        grid_cells = GridCell.objects.filter(dataset=dataset)
    
    # Convert to pandas DataFrame
    data = []
    for cell in grid_cells:
        # Extract features from grid cell
        row = {
            'lat': cell.location.y,
            'lon': cell.location.x,
            'elevation': cell.elevation,
            'temperature': cell.temperature,
            'humidity': cell.humidity,
            'wind_speed': cell.wind_speed,
            'wind_direction': cell.wind_direction,
            'pm25': cell.pm25_value,
            'timestamp': cell.timestamp
        }
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Add time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day'] = df['timestamp'].dt.day
    df['month'] = df['timestamp'].dt.month
    df['is_weekend'] = df['timestamp'].dt.dayofweek >= 5
    
    # Define features and target
    features = [
        'lat', 'lon', 'elevation', 'temperature', 
        'humidity', 'wind_speed', 'wind_direction',
        'hour', 'day', 'month', 'is_weekend'
    ]
    
    X = df[features].values
    y = df['pm25'].values
    
    return X, y


def train_models(dataset_id=None):
    """
    Train both RandomForest and XGBoost models
    
    Args:
        dataset_id: Optional dataset ID to filter training data
    
    Returns:
        Dictionary with model paths and metrics
    """
    # Prepare data
    X, y = prepare_training_data(dataset_id)
    
    # Train RandomForest model
    rf_model = RandomForestAQModel()
    rf_model.train(X, y)
    rf_model.save()
    
    # Train XGBoost model
    xgb_model = XGBoostAQModel()
    xgb_model.train(X, y)
    xgb_model.save()
    
    # Save the best model as the latest model
    # In a real application, we would evaluate both models and select the best one
    # For simplicity, we'll use XGBoost as the default
    best_model = xgb_model
    best_model.model_path = os.path.join(settings.ML_MODEL_DIR, 'latest_model.joblib')
    best_model.save()
    
    return {
        'rf_model_path': rf_model.model_path,
        'xgb_model_path': xgb_model.model_path,
        'best_model_path': best_model.model_path,
        'training_samples': len(y),
        'training_date': datetime.now().isoformat()
    }


def generate_predictions(model_type='xgboost', dataset_id=None):
    """
    Generate predictions for all grid cells in a dataset
    
    Args:
        model_type: Type of model to use ('rf', 'xgboost', or 'latest')
        dataset_id: Optional dataset ID to filter data
    
    Returns:
        List of created prediction objects
    """
    # Load the appropriate model
    if model_type == 'rf':
        model = RandomForestAQModel()
    elif model_type == 'xgboost':
        model = XGBoostAQModel()
    else:  # 'latest'
        model = XGBoostAQModel(os.path.join(settings.ML_MODEL_DIR, 'latest_model.joblib'))
    
    # Get grid cells to predict
    if dataset_id:
        dataset = Dataset.objects.get(id=dataset_id)
        grid_cells = GridCell.objects.filter(dataset=dataset)
    else:
        # Use the most recent dataset if none specified
        dataset = Dataset.objects.order_by('-created_at').first()
        if not dataset:
            raise ValueError("No datasets found in the database")
        grid_cells = GridCell.objects.filter(dataset=dataset)
    
    # Generate predictions
    predictions = []
    for cell in grid_cells:
        # Prepare features
        features = {
            'lat': cell.location.y,
            'lon': cell.location.x,
            'elevation': cell.elevation,
            'temperature': cell.temperature,
            'humidity': cell.humidity,
            'wind_speed': cell.wind_speed,
            'wind_direction': cell.wind_direction,
            'hour': cell.timestamp.hour,
            'day': cell.timestamp.day,
            'month': cell.timestamp.month,
            'is_weekend': cell.timestamp.weekday() >= 5
        }
        
        # Make prediction
        result = model.predict(features)
        
        # Create prediction object
        prediction = Prediction.objects.create(
            grid_cell=cell,
            value=result['pm25'],
            uncertainty=result['uncertainty'],
            model_type=model_type,
            timestamp=datetime.now()
        )
        
        predictions.append(prediction)
    
    return predictions


def generate_explanations(grid_cell_id, model_type='xgboost'):
    """
    Generate explanations for a specific prediction
    
    Args:
        grid_cell_id: ID of the grid cell to explain
        model_type: Type of model to use ('rf', 'xgboost', or 'latest')
    
    Returns:
        Dictionary with explanation data
    """
    # Load the appropriate model
    if model_type == 'rf':
        model = RandomForestAQModel()
    elif model_type == 'xgboost':
        model = XGBoostAQModel()
    else:  # 'latest'
        model = XGBoostAQModel(os.path.join(settings.ML_MODEL_DIR, 'latest_model.joblib'))
    
    # Get the grid cell
    cell = GridCell.objects.get(id=grid_cell_id)
    
    # Prepare features
    features = {
        'lat': cell.location.y,
        'lon': cell.location.x,
        'elevation': cell.elevation,
        'temperature': cell.temperature,
        'humidity': cell.humidity,
        'wind_speed': cell.wind_speed,
        'wind_direction': cell.wind_direction,
        'hour': cell.timestamp.hour,
        'day': cell.timestamp.day,
        'month': cell.timestamp.month,
        'is_weekend': cell.timestamp.weekday() >= 5
    }
    
    # Generate explanation
    explanation = model.explain(features)
    
    return {
        'grid_cell_id': grid_cell_id,
        'model_type': model_type,
        'explanation': explanation
    }
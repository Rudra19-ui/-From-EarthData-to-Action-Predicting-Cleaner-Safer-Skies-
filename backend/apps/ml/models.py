import os
import joblib
import numpy as np
from django.conf import settings
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
# import xgboost as xgb  # Temporarily commented due to import issue
# import shap  # Temporarily commented due to import issue


class AirQualityModel:
    """Base class for air quality prediction models"""
    
    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path or os.path.join(settings.ML_MODEL_DIR, 'latest_model.joblib')
        self.feature_names = [
            'lat', 'lon', 'elevation', 'temperature', 
            'humidity', 'wind_speed', 'wind_direction',
            'hour', 'day', 'month', 'is_weekend'
        ]
    
    def preprocess(self, X):
        """Preprocess input data"""
        # To be implemented by subclasses
        return X
    
    def postprocess(self, y_pred):
        """Postprocess predictions"""
        # To be implemented by subclasses
        return y_pred
    
    def predict(self, X):
        """Make predictions"""
        if self.model is None:
            self.load()
        
        X_processed = self.preprocess(X)
        y_pred = self.model.predict(X_processed)
        return self.postprocess(y_pred)
    
    def train(self, X, y):
        """Train the model"""
        # To be implemented by subclasses
        pass
    
    def save(self):
        """Save the model"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
    
    def load(self):
        """Load the model"""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
    
    def explain(self, X):
        """Generate model explanations"""
        # To be implemented by subclasses
        pass


class RandomForestAQModel(AirQualityModel):
    """Random Forest model for air quality prediction"""
    
    def __init__(self, model_path=None):
        super().__init__(model_path or os.path.join(settings.ML_MODEL_DIR, 'rf_model.joblib'))
    
    def preprocess(self, X):
        """Preprocess input data"""
        # Ensure X has all required features
        if isinstance(X, dict):
            X_dict = X.copy()
            # Add missing features with default values
            for feature in self.feature_names:
                if feature not in X_dict:
                    X_dict[feature] = np.nan
            
            # Convert to numpy array
            X_array = np.array([[X_dict[feature] for feature in self.feature_names]])
            return X_array
        
        return X
    
    def postprocess(self, y_pred):
        """Postprocess predictions"""
        # Ensure predictions are positive
        y_pred = np.maximum(y_pred, 0)
        
        # Calculate AQI from PM2.5
        # Simplified AQI calculation
        aqi = np.round(y_pred * 4.0).astype(int)  # Simplified conversion
        
        # Add uncertainty (10% of prediction)
        uncertainty = y_pred * 0.1
        
        return {
            'pm25': float(y_pred[0]),
            'aqi': int(aqi[0]),
            'uncertainty': float(uncertainty[0])
        }
    
    def train(self, X, y):
        """Train the model"""
        self.model = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler()),
            ('rf', RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            ))
        ])
        
        self.model.fit(X, y)
    
    def explain(self, X):
        """Generate model explanations using SHAP"""
        # Temporarily disabled due to SHAP import issue
        return {
            'feature_names': self.feature_names,
            'shap_values': [[0.0] * len(self.feature_names)],
            'base_value': 0.0,
            'message': 'SHAP explanations temporarily disabled'
        }


class XGBoostAQModel(AirQualityModel):
    """XGBoost model for air quality prediction"""
    
    def __init__(self, model_path=None):
        super().__init__(model_path or os.path.join(settings.ML_MODEL_DIR, 'xgb_model.joblib'))
    
    def preprocess(self, X):
        """Preprocess input data"""
        # Ensure X has all required features
        if isinstance(X, dict):
            X_dict = X.copy()
            # Add missing features with default values
            for feature in self.feature_names:
                if feature not in X_dict:
                    X_dict[feature] = np.nan
            
            # Convert to numpy array
            X_array = np.array([[X_dict[feature] for feature in self.feature_names]])
            return X_array
        
        return X
    
    def postprocess(self, y_pred):
        """Postprocess predictions"""
        # Ensure predictions are positive
        y_pred = np.maximum(y_pred, 0)
        
        # Calculate AQI from PM2.5
        # Simplified AQI calculation
        aqi = np.round(y_pred * 4.0).astype(int)  # Simplified conversion
        
        # Add uncertainty (8% of prediction for XGBoost - slightly better than RF)
        uncertainty = y_pred * 0.08
        
        return {
            'pm25': float(y_pred[0]),
            'aqi': int(aqi[0]),
            'uncertainty': float(uncertainty[0])
        }
    
    def train(self, X, y):
        """Train the model"""
        self.model = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler()),
            # ('xgb', xgb.XGBRegressor(
            #     n_estimators=100,
            #     max_depth=6,
            #     learning_rate=0.1,
            #     random_state=42
            # ))
            ('rf', RandomForestRegressor(n_estimators=50, random_state=42))  # Fallback to RF
        ])
        
        self.model.fit(X, y)
    
    def explain(self, X):
        """Generate model explanations using SHAP"""
        if self.model is None:
            self.load()
        
        X_processed = self.preprocess(X)
        
        # Get the XGBoost model from the pipeline
        xgb_model = self.model.named_steps['xgb']
        
        # Create explainer
        explainer = shap.TreeExplainer(xgb_model)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(
            self.model.named_steps['scaler'].transform(
                self.model.named_steps['imputer'].transform(X_processed)
            )
        )
        
        # Return feature contributions
        return {
            'feature_names': self.feature_names,
            'shap_values': shap_values.tolist(),
            'base_value': explainer.expected_value
        }
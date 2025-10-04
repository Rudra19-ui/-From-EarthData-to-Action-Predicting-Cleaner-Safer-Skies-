from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from apps.core.models import Dataset, Sensor, GridCell, Prediction, IngestionJob, Alert
from apps.ml.training import generate_predictions, generate_explanations
from .serializers import (
    DatasetSerializer, SensorSerializer, GridCellSerializer,
    PredictionSerializer, IngestionJobSerializer, AlertSerializer,
    PredictionRequestSerializer, ExplanationRequestSerializer
)


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all().order_by('-created_at')
    serializer_class = DatasetSerializer


class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    
    def get_queryset(self):
        queryset = Sensor.objects.all()
        active = self.request.query_params.get('active')
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        return queryset


class GridCellViewSet(viewsets.ModelViewSet):
    queryset = GridCell.objects.all()
    serializer_class = GridCellSerializer
    
    def get_queryset(self):
        queryset = GridCell.objects.all()
        dataset_id = self.request.query_params.get('dataset')
        if dataset_id:
            queryset = queryset.filter(dataset_id=dataset_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest grid cells from the most recent dataset"""
        latest_dataset = Dataset.objects.order_by('-created_at').first()
        if not latest_dataset:
            return Response({"error": "No datasets found"}, status=status.HTTP_404_NOT_FOUND)
        
        queryset = GridCell.objects.filter(dataset=latest_dataset)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all().order_by('-timestamp')
    serializer_class = PredictionSerializer
    
    def get_queryset(self):
        queryset = Prediction.objects.all().order_by('-timestamp')
        
        # Filter by grid cell
        grid_cell_id = self.request.query_params.get('grid_cell')
        if grid_cell_id:
            queryset = queryset.filter(grid_cell_id=grid_cell_id)
        
        # Filter by model type
        model_type = self.request.query_params.get('model_type')
        if model_type:
            queryset = queryset.filter(model_type=model_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def predict(self, request):
        """Generate a prediction for a specific location and conditions"""
        serializer = PredictionRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Extract data from request
            data = serializer.validated_data
            model_type = data.pop('model_type', 'latest')
            
            # Find the nearest grid cell for reference
            lat = data['lat']
            lon = data['lon']
            
            # Generate prediction
            try:
                from apps.ml.models import RandomForestAQModel, XGBoostAQModel
                
                # Select model based on type
                if model_type == 'rf':
                    model = RandomForestAQModel()
                elif model_type == 'xgboost':
                    model = XGBoostAQModel()
                else:  # 'latest'
                    model = XGBoostAQModel()
                
                # Make prediction
                result = model.predict(data)
                
                # Add metadata
                result['lat'] = lat
                result['lon'] = lon
                result['model_type'] = model_type
                result['timestamp'] = timezone.now().isoformat()
                
                return Response(result)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def explain(self, request):
        """Generate explanation for a prediction"""
        serializer = ExplanationRequestSerializer(data=request.data)
        if serializer.is_valid():
            grid_cell_id = serializer.validated_data['grid_cell_id']
            model_type = serializer.validated_data['model_type']
            
            try:
                explanation = generate_explanations(grid_cell_id, model_type)
                return Response(explanation)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IngestionJobViewSet(viewsets.ModelViewSet):
    queryset = IngestionJob.objects.all().order_by('-started_at')
    serializer_class = IngestionJobSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
    
    def get_queryset(self):
        queryset = Alert.objects.all().order_by('-created_at')
        
        # Filter by acknowledged status
        acknowledged = self.request.query_params.get('acknowledged')
        if acknowledged is not None:
            queryset = queryset.filter(acknowledged=acknowledged.lower() == 'true')
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Mark an alert as acknowledged"""
        alert = self.get_object()
        alert.acknowledged = True
        alert.save()
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
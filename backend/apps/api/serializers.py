from rest_framework import serializers
from apps.core.models import Dataset, Sensor, GridCell, Prediction, IngestionJob, Alert


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['id', 'name', 'type', 'location', 'active', 'created_at']


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'name', 'description', 'source', 'created_at']


class GridCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = GridCell
        fields = [
            'id', 'dataset', 'location', 'elevation', 'temperature', 
            'humidity', 'wind_speed', 'wind_direction', 'pm25_value', 
            'timestamp'
        ]


class PredictionSerializer(serializers.ModelSerializer):
    grid_cell = GridCellSerializer(read_only=True)
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'grid_cell', 'value', 'uncertainty', 
            'model_type', 'timestamp'
        ]


class IngestionJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestionJob
        fields = [
            'id', 'dataset', 'status', 'file_path', 
            'records_processed', 'started_at', 'completed_at'
        ]


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            'id', 'grid_cell', 'type', 'message', 
            'severity', 'acknowledged', 'created_at'
        ]


class PredictionRequestSerializer(serializers.Serializer):
    lat = serializers.FloatField(required=True)
    lon = serializers.FloatField(required=True)
    elevation = serializers.FloatField(required=False)
    temperature = serializers.FloatField(required=False)
    humidity = serializers.FloatField(required=False)
    wind_speed = serializers.FloatField(required=False)
    wind_direction = serializers.FloatField(required=False)
    model_type = serializers.ChoiceField(
        choices=['rf', 'xgboost', 'latest'],
        default='latest'
    )


class ExplanationRequestSerializer(serializers.Serializer):
    grid_cell_id = serializers.IntegerField(required=True)
    model_type = serializers.ChoiceField(
        choices=['rf', 'xgboost', 'latest'],
        default='latest'
    )
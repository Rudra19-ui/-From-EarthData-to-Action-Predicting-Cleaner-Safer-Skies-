from django.db import models
from django.utils import timezone


class Dataset(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Sensor(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='sensors')
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.latitude:.4f}, {self.longitude:.4f})"


class GridCell(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='grid_cells')
    # Using JSON field to store geometry as text for now
    geometry = models.JSONField()
    cell_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.cell_id


class Prediction(models.Model):
    grid_cell = models.ForeignKey(GridCell, on_delete=models.CASCADE, related_name='predictions')
    timestamp = models.DateTimeField()
    pm25 = models.FloatField()
    aqi = models.IntegerField()
    uncertainty = models.FloatField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Prediction for {self.grid_cell.cell_id} at {self.timestamp}"


class IngestionJob(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='ingestion_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=255)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Ingestion job for {self.dataset.name} ({self.status})"


class Alert(models.Model):
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE, related_name='alerts')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    message = models.TextField()
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.severity.upper()} alert for {self.prediction.grid_cell.cell_id}"
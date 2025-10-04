from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DatasetViewSet, SensorViewSet, GridCellViewSet,
    PredictionViewSet, IngestionJobViewSet, AlertViewSet
)

router = DefaultRouter()
router.register(r'datasets', DatasetViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'grid-cells', GridCellViewSet)
router.register(r'predictions', PredictionViewSet)
router.register(r'ingestion-jobs', IngestionJobViewSet)
router.register(r'alerts', AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
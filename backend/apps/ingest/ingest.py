import os
import pandas as pd
# import geopandas as gpd  # Disabled for compatibility
import numpy as np
from django.conf import settings
from apps.core.models import Dataset, Sensor, GridCell, IngestionJob
# from django.contrib.gis.geos import Point, Polygon  # Disabled for compatibility


def ingest_csv(file_path, dataset_name, dataset_description=""):
    """
    Ingest CSV data containing sensor readings
    Expected format: timestamp, sensor_id, lat, lon, pm25
    """
    try:
        # Create or get dataset
        dataset, created = Dataset.objects.get_or_create(
            name=dataset_name,
            defaults={'description': dataset_description}
        )
        
        # Create ingestion job
        job = IngestionJob.objects.create(
            dataset=dataset,
            file_path=file_path,
            status='processing'
        )
        
        # Read CSV
        df = pd.read_csv(file_path)
        
        # Process each row
        for _, row in df.iterrows():
            # Create or get sensor
            sensor, _ = Sensor.objects.get_or_create(
                dataset=dataset,
                name=str(row['sensor_id']),
                defaults={
                    'latitude': float(row['lat']),
                    'longitude': float(row['lon']),
                    'active': True
                }
            )
            
            # Create grid cell (simplified for demo)
            buffer = 0.01  # ~1km buffer
            min_lon, min_lat = row['lon'] - buffer, row['lat'] - buffer
            max_lon, max_lat = row['lon'] + buffer, row['lat'] + buffer
            
            # Store geometry as GeoJSON
            geometry = {
                "type": "Polygon",
                "coordinates": [[
                    [min_lon, min_lat],
                    [max_lon, min_lat],
                    [max_lon, max_lat],
                    [min_lon, max_lat],
                    [min_lon, min_lat]
                ]]
            }
            cell_id = f"cell_{row['lat']:.4f}_{row['lon']:.4f}"
            
            grid_cell, _ = GridCell.objects.get_or_create(
                dataset=dataset,
                cell_id=cell_id,
                defaults={'geometry': geometry}
            )
        
        # Update job status
        job.status = 'completed'
        job.save()
        
        return True, f"Successfully ingested {len(df)} records"
        
    except Exception as e:
        if 'job' in locals():
            job.status = 'failed'
            job.error_message = str(e)
            job.save()
        return False, str(e)


def ingest_geojson(file_path, dataset_name, dataset_description=""):
    """
    Ingest GeoJSON data containing sensor locations
    """
    try:
        # Create or get dataset
        dataset, created = Dataset.objects.get_or_create(
            name=dataset_name,
            defaults={'description': dataset_description}
        )
        
        # Create ingestion job
        job = IngestionJob.objects.create(
            dataset=dataset,
            file_path=file_path,
            status='processing'
        )
        
        # Note: GeoJSON ingestion temporarily disabled due to GeoPandas dependency
        return False, "GeoJSON ingestion temporarily disabled"
            
        # Update job status
        job.status = 'completed'
        job.save()
        
        return True, f"Successfully ingested {len(gdf)} sensors"
        
    except Exception as e:
        if 'job' in locals():
            job.status = 'failed'
            job.error_message = str(e)
            job.save()
        return False, str(e)


def create_sample_data():
    """
    Create sample data for demonstration purposes
    """
    # Create sample dataset
    dataset, _ = Dataset.objects.get_or_create(
        name="Sample Air Quality Data",
        defaults={'description': "Sample data for demonstration purposes"}
    )
    
    # Create sample sensors
    cities = [
        ("New York", 40.7128, -74.0060),
        ("Los Angeles", 34.0522, -118.2437),
        ("Chicago", 41.8781, -87.6298),
        ("Houston", 29.7604, -95.3698),
        ("Phoenix", 33.4484, -112.0740),
        ("Philadelphia", 39.9526, -75.1652),
        ("San Antonio", 29.4241, -98.4936),
        ("San Diego", 32.7157, -117.1611),
        ("Dallas", 32.7767, -96.7970),
        ("San Jose", 37.3382, -121.8863)
    ]
    
    sensors = []
    grid_cells = []
    
    for city, lat, lon in cities:
        # Create sensor
        sensor, _ = Sensor.objects.get_or_create(
            dataset=dataset,
            name=city,
            defaults={
                'latitude': lat,
                'longitude': lon,
                'active': True
            }
        )
        sensors.append(sensor)
        
        # Create grid cell
        buffer = 0.01  # ~1km buffer
        min_lon, min_lat = lon - buffer, lat - buffer
        max_lon, max_lat = lon + buffer, lat + buffer
        
        # Store geometry as GeoJSON
        geometry = {
            "type": "Polygon",
            "coordinates": [[
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat]
            ]]
        }
        cell_id = f"cell_{lat:.4f}_{lon:.4f}"
        
        grid_cell, _ = GridCell.objects.get_or_create(
            dataset=dataset,
            cell_id=cell_id,
            defaults={'geometry': geometry}
        )
        grid_cells.append(grid_cell)
    
    return dataset, sensors, grid_cells
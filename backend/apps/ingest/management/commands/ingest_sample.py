import os
from django.core.management.base import BaseCommand
from apps.ingest.ingest import create_sample_data


class Command(BaseCommand):
    help = 'Ingest sample data for demonstration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting sample data ingestion...'))
        
        dataset, sensors, grid_cells = create_sample_data()
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created sample dataset "{dataset.name}" with '
            f'{len(sensors)} sensors and {len(grid_cells)} grid cells'
        ))
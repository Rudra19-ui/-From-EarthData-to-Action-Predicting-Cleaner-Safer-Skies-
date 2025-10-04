from django.core.management.base import BaseCommand
from apps.ml.training import train_models, generate_predictions


class Command(BaseCommand):
    help = 'Train ML models and generate predictions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dataset-id',
            type=int,
            help='Dataset ID to use for training',
            required=False
        )
        parser.add_argument(
            '--predict',
            action='store_true',
            help='Generate predictions after training'
        )
        parser.add_argument(
            '--model-type',
            type=str,
            choices=['rf', 'xgboost', 'latest'],
            default='xgboost',
            help='Model type to use for predictions'
        )

    def handle(self, *args, **options):
        dataset_id = options.get('dataset_id')
        predict = options.get('predict')
        model_type = options.get('model_type')

        # Train models
        self.stdout.write(self.style.SUCCESS('Training models...'))
        result = train_models(dataset_id)
        self.stdout.write(self.style.SUCCESS(
            f'Models trained successfully with {result["training_samples"]} samples'
        ))

        # Generate predictions if requested
        if predict:
            self.stdout.write(self.style.SUCCESS(f'Generating predictions using {model_type} model...'))
            predictions = generate_predictions(model_type, dataset_id)
            self.stdout.write(self.style.SUCCESS(
                f'Generated {len(predictions)} predictions'
            ))
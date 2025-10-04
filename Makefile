.PHONY: build up down logs test lint

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	docker-compose run --rm web python manage.py test
	docker-compose run --rm frontend npm test

lint:
	docker-compose run --rm web flake8
	docker-compose run --rm frontend npm run lint
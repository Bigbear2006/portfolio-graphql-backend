all: up

up:
	docker-compose up --build -d

migrate:
	docker-compose exec backend npx prisma migrate deploy

seed:
	docker-compose exec backend npx prisma db seed

logs:
	docker-compose logs backend -f

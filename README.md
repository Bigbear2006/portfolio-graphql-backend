# Portfolio GraphQL Backend

GraphQL API для получения данных портфолио.
Реализовано автозаполнение БД из файла `profile.yaml`,
автогенерация типов с помощью `prisma-nestjs-graphql`,
оптимизация запросов (включая N+1) и ограничение глубины Query.

## Запуск

```bash
make
# or
docker-compose up --build -d

make migrate
# or
docker-compose exec backend npx prisma migrate deploy

make seed
# or
docker-compose exec backend npx prisma db seed
```

## Запрос
Запрос на получение все данных:
https://graphql.classflow.ru/graphql
```
query {
  profile {
    firstName,
    lastName,
    jobTitle,
    description,
    resources {
      resource {
        name
      },
      url
    },
    skills {
      skill {
        name
      }
    },
    experience {
      company {
        name
      }
      position,
      description,
      startDate,
      endDate
    }
    projects {
      name,
      description,
      problem,
      solution,
      url,
      type,
      github,
      role
    }
  }
}
```

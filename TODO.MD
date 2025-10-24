# TODO

## Backend
- Set up de autenticación, ORM y base de datos.
- CRUD de endpoints para matches:
  - GET /matches
  - GET /matches/:id
  - POST /matches
  - PUT /matches/:id
  - DELETE /matches/:id

- CRUD de endpoints para accounts:
  - GET /accounts
  - GET /accounts/:id
  - POST /accounts
  - PUT /accounts/:id
  - DELETE /accounts/:id

- Crear el endpoint principal:
```
GET
/api/reader/:matchId/:accountId
```

## Frontend
- Crear página principal con input para el email y selector de match.
- Crear página de CRUD para los matches y cuentas.

## Dependencias
- Auth: Better Auth.
- Frontend: React y react router, tanstack router o Nextjs.
- Backend: NodeJS y Express.
- Base de datos: Supabase.
- ORM: drizzle.
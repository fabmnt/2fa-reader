# TODO

## Backend
- Set up de autenticación, ORM y base de datos.
- CRUD de endpoints para matches
  - GET /matches
  - GET /matches/:id
  - POST /matches
  - PUT /matches/:id
  - DELETE /matches/:id

- CRUD de endpoints para accounts
  - GET /accounts
  - GET /accounts/:id
  - POST /accounts
  - PUT /accounts/:id
  - DELETE /accounts/:id

- Terminar el endpoint principal /api/reader
```
GET
/api/reader/:matchId/:accountId
```

## Frontend
- Crear página principal con input para el email y selector de match (plataforma)
- Crear página de CRUD para los matches y cuentas. (Autenticado)


## Dependencias
- Auth: Better Auth.
- Frontend: React y react router o tanstack router.
- Backend: NodeJS y Express.
- Base de datos: Supabase.
- ORM: drizzle.
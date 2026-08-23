# GestionFincas

Aplicacion web para la gestion agricola de fincas, parcelas y su estado por celda (riego, plagas, abonado, etc.).

## Estructura

- `backend/` — API REST en Node.js + Express + MySQL (mysql2).
- `frontend/` — SPA en React + Vite + Tailwind CSS.

## Backend

```bash
cd backend
npm install
cp .env.example .env   # completa los datos de tu MySQL
npm run seed            # crea los estados por defecto (solo si la tabla esta vacia)
npm run dev              # http://localhost:3001
```

Variables de entorno (`backend/.env`):

| Variable | Descripcion |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3001) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexion a MySQL |
| `DB_SSL` | `true` para conexiones que requieren TLS (proveedores en la nube como Aiven) |

El esquema de la base de datos esta en `backend/schema.sql`.

## Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Por defecto el frontend apunta al backend de produccion (Render). Para desarrollar contra un backend local, crea `frontend/.env.local`:

```
VITE_API_URL=http://localhost:3001/api
```

## Despliegue

- **Backend**: Render (build: `npm install`, start: `npm start`). Variables de entorno iguales a `backend/.env.example`.
- **Base de datos**: MySQL gestionado en Aiven.
- **Frontend**: Vercel. Incluye `frontend/vercel.json` con una regla de rewrite a `index.html` para que las rutas internas (React Router) funcionen al recargar o entrar directo por URL.

# Gestión de Fincas Agrícolas

Aplicación web (PWA) para la gestión integral de fincas agrícolas: trazabilidad de parcelas por celda, contabilidad y planificación de abonado, con autenticación cerrada para un único usuario autorizado.

## Características principales

- **Gestión de fincas y parcelas**: matriz táctil interactiva por parcela (filas × columnas configurables), con selección múltiple por arrastre (ratón y dedo), auto-scroll cerca de los bordes y cabeceras fijas para parcelas grandes.
- **Catálogo de estados personalizable**: crea tus propios estados (nombre + color) y asígnalos a celdas; el color se pinta directamente en la matriz (sólido, degradado si hay dos estados activos, o con asterisco si hay más).
- **Histórico de trazabilidad**: registro completo de qué estado tuvo cada celda y cuándo, con filtros por fecha, finca, parcela y estado, y exportación a CSV.
- **Contabilidad**: registro de ingresos y gastos por finca, con categorías personalizables, balance neto en tiempo real y filtrado por año/finca.
- **Plan de abonado**: cuadrícula de 12 meses por finca y temporada, con tipos de abono personalizables (nombre + color), dosis y observaciones por mes, rango de fechas de temporada editable, y **clonación del plan completo de un año a otro**.
- **PWA instalable**: optimizada para tablet y móvil, con icono y pantalla de carga propios, pensada para uso en el campo.
- **Autenticación segura**: acceso cerrado (sin registro público) mediante JWT, con protección de todas las rutas de la API y de la interfaz, e inicio de sesión persistente opcional ("recordar usuario").

## Stack tecnológico

**Frontend**: React · Vite · Tailwind CSS · React Router · Axios · Lucide Icons · vite-plugin-pwa

**Backend**: Node.js · Express · MySQL2 · JSON Web Tokens (`jsonwebtoken`) · `bcryptjs`

**Base de datos**: MySQL ([Aiven Cloud](https://aiven.io))

**Despliegue**: [Vercel](https://vercel.com) (frontend) · [Render](https://render.com) (backend)

## Estructura del repositorio

```
GestionFincas/
├── backend/     API REST (Express + MySQL2)
│   ├── config/        conexion a la base de datos
│   ├── controllers/   logica de negocio por recurso
│   ├── middlewares/   autenticacion (JWT)
│   ├── routes/        definicion de endpoints
│   ├── migrations/    migraciones SQL incrementales
│   └── schema.sql      esquema completo de referencia
└── frontend/    SPA (React + Vite)
    └── src/
        ├── auth/        sesion, ruta protegida, almacenamiento del token
        ├── api/         instancia de axios (interceptores)
        ├── components/  componentes reutilizables y modales
        └── pages/       una pagina por seccion de la app
```

## Configuración del entorno

### Backend (`backend/.env`, ver `backend/.env.example`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto `3001`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `DB_SSL` | `true` para conexiones que requieren TLS (proveedores en la nube como Aiven) |
| `JWT_SECRET` | Clave secreta para firmar los tokens de sesión — genera una propia con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `AUTH_USERNAME`, `AUTH_PASSWORD` | Credenciales del único usuario autorizado (no hay registro público) |

El esquema completo de la base de datos está en `backend/schema.sql`; las migraciones incrementales aplicadas sobre él están en `backend/migrations/`.

### Frontend (`frontend/.env.local`, opcional)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API. Si no se define, usa el backend de producción en Render por defecto — defínela solo para desarrollar contra un backend local. |

```
VITE_API_URL=http://localhost:3001/api
```

## Scripts disponibles

### Backend

```bash
cd backend
npm install
cp .env.example .env    # completa tus credenciales
npm run seed              # crea los estados agricolas por defecto (solo si la tabla esta vacia)
npm run dev                # arranca con nodemon -> http://localhost:3001
npm start                  # arranca en modo produccion (sin recarga automatica)
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # servidor de desarrollo -> http://localhost:5173
npm run build       # build de produccion en frontend/dist
npm run preview     # sirve el build de produccion localmente
```

## Despliegue

- **Backend** en Render — build `npm install`, start `npm start`, variables de entorno iguales a `backend/.env.example`.
- **Base de datos** MySQL gestionada en Aiven (conexión con TLS).
- **Frontend** en Vercel — incluye `frontend/vercel.json` con una regla de *rewrite* a `index.html` para que las rutas internas de React Router funcionen al recargar la página o entrar directo por URL.

# Capa de Aplicación — Backend del Sistema de Monitoreo

API REST del sistema IoT para monitoreo de temperatura en cámaras de frío.

---

## Índice

- [1. Objetivo](#1-objetivo)
- [2. Tecnologías](#2-tecnologías)
- [3. Estructura del proyecto](#3-estructura-del-proyecto)
- [4. Inicio rápido](#4-inicio-rápido)
- [5. Usuarios de prueba](#5-usuarios-de-prueba)
- [6. Endpoints](#6-endpoints)
  - [6.1 Autenticación](#61-autenticación)
  - [6.2 Sedes](#62-sedes)
  - [6.3 Cámaras](#63-cámaras)
  - [6.4 Sensores](#64-sensores)
  - [6.5 Lecturas](#65-lecturas)
  - [6.6 Alertas](#66-alertas)
  - [6.7 Dashboard](#67-dashboard)
- [7. Roles y permisos](#7-roles-y-permisos)
- [8. Documentación interactiva](#8-documentación-interactiva)
- [9. Arquitectura](#9-arquitectura)

---

## 1. Objetivo

Conectar la base de datos con la interfaz del sistema. Expone una API REST que permite consultar el estado de las cámaras, las lecturas, las alertas, y gestionar la infraestructura (sedes, cámaras, sensores) con autenticación JWT y autorización por roles.

---

## 2. Tecnologías

| Tecnología | Propósito |
|---|---|
| Node.js 20 (Alpine) | Entorno de ejecución |
| Express.js 4 | Framework web |
| pg 8 | Cliente PostgreSQL |
| jsonwebtoken + bcrypt | Autenticación JWT |
| swagger-jsdoc + swagger-ui-express | Documentación OpenAPI |
| dotenv | Variables de entorno |
| cors | Habilitar CORS |

---

## 3. Estructura del proyecto

```
Capa_de_Aplicacion/
├── src/
│   ├── config/
│   │   ├── database.js           # Pool de conexión a PostgreSQL
│   │   └── swagger.js            # Configuración OpenAPI/Swagger
│   ├── middlewares/
│   │   ├── auth.js               # verificarToken + requiereRol
│   │   └── validateId.js         # Validación de IDs (params + query)
│   ├── routes/
│   │   ├── index.js              # Agrupador /api/*
│   │   ├── authRoutes.js
│   │   ├── sedeRoutes.js
│   │   ├── camaraRoutes.js
│   │   ├── sensorRoutes.js
│   │   ├── lecturaRoutes.js
│   │   ├── alertaRoutes.js
│   │   └── dashboardRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sedeController.js
│   │   ├── camaraController.js
│   │   ├── sensorController.js
│   │   ├── lecturaController.js
│   │   ├── alertaController.js
│   │   └── dashboardController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── sedeService.js
│   │   ├── camaraService.js
│   │   ├── sensorService.js
│   │   ├── lecturaService.js
│   │   ├── alertaService.js
│   │   └── dashboardService.js
│   ├── app.js                    # Configuración Express
│   └── server.js                 # Punto de entrada
├── docs/
│   └── diagrama-clases.puml      # Diagrama UML
├── Dockerfile
├── docker-compose.yml
├── .env
└── package.json
```

---

## 4. Inicio rápido

```bash
# Desde la raíz del proyecto (D:\TB2_Redes)
docker-compose up -d
```

Servicios levantados:

| Servicio | URL |
|---|---|
| API REST | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| PostgreSQL | localhost:5433 |
| pgAdmin | http://localhost:5050 |

---

## 5. Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| admin@farmacia.com | admin123 | **admin** — acceso total |
| operador@farmacia.com | admin123 | **operador** — solo lectura + resolver alertas |
| tecnico@farmacia.com | admin123 | **tecnico** — gestiona sensores y cámaras |

---

## 6. Endpoints

Todas las rutas bajo `/api` requieren autenticación vía `Authorization: Bearer <token>` excepto `/api/auth/login`.

### 6.1 Autenticación

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | — | Iniciar sesión |
| `POST` | `/api/auth/register` | ✅ | admin | Registrar nuevo usuario |

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmacia.com","password":"admin123"}'
```
```json
{
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": { "id": 1, "nombre": "Administrador", "email": "admin@farmacia.com", "rol": "admin" }
  }
}
```

**Registrar usuario (solo admin):**
```json
POST /api/auth/register
Authorization: Bearer <token_admin>
Body: { "nombre": "Nuevo Usuario", "email": "nuevo@farmacia.com", "password": "miPassword123", "rol": "operador" }
Respuesta: 201 { "datos": { "id": 4, "nombre": "Nuevo Usuario", "email": "nuevo@farmacia.com", "rol": "operador", "activo": true, "created_at": "..." } }
```

---

### 6.2 Sedes

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/sedes` | admin, operador, tecnico | Listar todas |
| `GET` | `/api/sedes/:id` | admin, operador, tecnico | Obtener por ID |
| `POST` | `/api/sedes` | admin | Crear |
| `PUT` | `/api/sedes/:id` | admin | Actualizar |
| `DELETE` | `/api/sedes/:id` | admin | Eliminar |

**Crear sede:**
```json
POST /api/sedes
Body: { "nombre": "Distribuidora Sur", "tipo": "distribuidora", "direccion": "Av. Sur 456" }
Respuesta: 201
```

**Actualizar sede (parcial):**
```json
PUT /api/sedes/1
Body: { "direccion": "Av. Principal 456, Lima" }
Respuesta: 200
```

---

### 6.3 Cámaras

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/camaras?sede_id=` | admin, operador, tecnico | Listar (filtro por sede) |
| `GET` | `/api/camaras/:id` | admin, operador, tecnico | Obtener por ID |
| `POST` | `/api/camaras` | admin | Crear |
| `PUT` | `/api/camaras/:id` | admin, tecnico | Actualizar |
| `DELETE` | `/api/camaras/:id` | admin | Eliminar |

**Crear cámara:**
```json
POST /api/camaras
Body: { "sede_id": 1, "nombre": "Cámara Nueva", "temp_min": 2, "temp_max": 8 }
Respuesta: 201
```

**Tipos de sensor válidos:** `temperatura`, `humedad`, `apertura`, `movimiento`, `agua`, `humo`

---

### 6.4 Sensores

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/sensores?camara_id=` | admin, operador, tecnico | Listar (filtro por cámara) |
| `GET` | `/api/sensores/:id` | admin, operador, tecnico | Obtener por ID |
| `POST` | `/api/sensores` | admin, tecnico | Crear |
| `PUT` | `/api/sensores/:id` | admin, tecnico | Actualizar |
| `DELETE` | `/api/sensores/:id` | admin | Eliminar |

**Crear sensor:**
```json
POST /api/sensores
Body: { "camara_id": 1, "tipo": "temperatura", "unidad": "°C" }
Respuesta: 201
```

---

### 6.5 Lecturas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/lecturas?sensor_id=&limite=` | admin, operador, tecnico | Histórico de lecturas |
| `GET` | `/api/lecturas/ultimas-por-camara` | admin, operador, tecnico | Última temperatura por cámara |

- `sensor_id` (opcional): filtra por sensor específico
- `limite` (opcional, default 50): cantidad de registros

---

### 6.6 Alertas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/alertas?resuelta=&limite=` | admin, operador, tecnico | Listar alertas |
| `GET` | `/api/alertas/:id` | admin, operador, tecnico | Obtener por ID |
| `PATCH` | `/api/alertas/:id/resolver` | admin, operador | Resolver alerta |

**Resolver alerta:**
```json
PATCH /api/alertas/1/resolver
Body: { "usuario_id": 1 }
Respuesta: 200
```

---

### 6.7 Dashboard

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/dashboard` | admin, operador, tecnico | Resumen general |

**Respuesta:**
```json
{
  "datos": {
    "sedes": 2,
    "camaras": 4,
    "camarasInactivas": 0,
    "sensores": 19,
    "alertasActivas": 6,
    "ultimasLecturas": [
      { "camara_id": 1, "camara_nombre": "Cámara Farmacia Central", "valor": 7.32, "registrado_en": "..." }
    ]
  }
}
```

---

## 7. Roles y permisos

| Recurso | admin | operador | tecnico |
|---|---|---|---|
| GET sedes, cámaras, sensores, lecturas, dashboard | ✅ | ✅ | ✅ |
| PATCH resolver alerta | ✅ | ✅ | ❌ |
| POST / PUT / DELETE sedes | ✅ | ❌ | ❌ |
| POST / PUT / DELETE cámaras | ✅ | ❌ | ✅ (solo PUT) |
| POST / PUT / DELETE sensores | ✅ | ❌ | ✅ (POST y PUT) |
| DELETE cámaras / sensores | ✅ | ❌ | ❌ |

---

## 8. Documentación interactiva

- **Swagger UI** (navegador): http://localhost:3000/api-docs
- **OpenAPI JSON** (Postman): http://localhost:3000/api-docs.json

Para importar en Postman: `File → Import → Link` y pegar `http://localhost:3000/api-docs.json`.

---

## 9. Arquitectura

```
Cliente (frontend / Postman)
       │
       ▼
  ┌─────────────┐
  │   Routes     │  ← /api/auth/login (público)
  │   index.js   │  ← /api/* (protegido con JWT)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Middlewares  │
  │  • auth.js  │  → verificarToken() + requiereRol()
  │  • validate │  → validateId() + validateQueryInt()
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Controllers │  → Reciben request, delegan en services
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Services   │  → Lógica de negocio + queries SQL
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Database   │  → PostgreSQL (pool pg)
  │  config     │
  └─────────────┘
```

Diagrama de clases UML: `docs/diagrama-clases.puml`

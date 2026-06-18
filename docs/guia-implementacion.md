# Guía de implementación — Capa de Aplicación

## 1. Propósito de esta guía
Documentar la implementación completa de la capa de aplicación del proyecto TB2_Redes. Sirve como referencia técnica para entender la arquitectura, los endpoints, la autenticación y cómo se conecta con las demás capas.

---

## 2. Objetivo general
La capa de aplicación permite que la información almacenada en la base de datos sea consultada, procesada y enviada al frontend de forma organizada y segura.

Responde a preguntas como:
- ¿Qué cámaras existen y en qué sede están?
- ¿Qué lecturas se registraron recientemente?
- ¿Qué alertas están activas?
- ¿Cómo está el estado general del sistema?
- ¿Quién puede acceder a cada funcionalidad?

---

## 3. Arquitectura implementada

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

---

## 4. Estructura final del proyecto

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
│   │   ├── authRoutes.js         # POST /login, POST /register
│   │   ├── sedeRoutes.js         # CRUD completo
│   │   ├── camaraRoutes.js       # CRUD completo
│   │   ├── sensorRoutes.js       # CRUD completo
│   │   ├── lecturaRoutes.js      # GET (histórico + últimas por cámara)
│   │   ├── alertaRoutes.js       # GET + PATCH resolver
│   │   └── dashboardRoutes.js    # GET resumen
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
│   ├── app.js                    # Configuración Express + Swagger
│   └── server.js                 # Punto de entrada
├── docs/
│   ├── guia-implementacion.md    # Este archivo
│   └── diagrama-clases.puml      # Diagrama UML
├── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
└── package.json
```

---

## 5. Funcionalidades implementadas

### 5.1 Autenticación JWT

| Endpoint | Método | Auth | Rol | Descripción |
|---|---|---|---|---|
| `/api/auth/login` | POST | ❌ | — | Inicia sesión, devuelve token + usuario |
| `/api/auth/register` | POST | ✅ | admin | Registra un nuevo usuario en el sistema |

**Flujo de autenticación:**
1. El usuario envía `email` + `password` a `/api/auth/login`
2. El servidor verifica el hash con bcrypt y genera un JWT con `id`, `nombre`, `email`, `rol`
3. El token se envía en cada request como `Authorization: Bearer <token>`
4. El middleware `verificarToken()` decodifica el token y lo adjunta en `req.usuario`
5. El middleware `requiereRol(...roles)` verifica que el rol del usuario esté permitido

### 5.2 CRUD de Sedes

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/sedes` | admin, operador, tecnico | Lista todas las sedes |
| GET | `/api/sedes/:id` | admin, operador, tecnico | Obtiene una sede por ID |
| POST | `/api/sedes` | admin | Crea una nueva sede |
| PUT | `/api/sedes/:id` | admin | Actualiza una sede existente |
| DELETE | `/api/sedes/:id` | admin | Elimina una sede |

**Validaciones:** `nombre` y `tipo` requeridos. `tipo` debe ser `farmacia`, `distribuidora` o `botica`.

### 5.3 CRUD de Cámaras

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/camaras?sede_id=` | admin, operador, tecnico | Lista cámaras (filtro por sede) |
| GET | `/api/camaras/:id` | admin, operador, tecnico | Obtiene una cámara por ID |
| POST | `/api/camaras` | admin | Crea una nueva cámara |
| PUT | `/api/camaras/:id` | admin, tecnico | Actualiza una cámara |
| DELETE | `/api/camaras/:id` | admin | Elimina una cámara |

**Validaciones:** `sede_id`, `nombre`, `temp_min`, `temp_max` requeridos. `temp_min` debe ser menor a `temp_max`.

### 5.4 CRUD de Sensores

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/sensores?camara_id=` | admin, operador, tecnico | Lista sensores (filtro por cámara) |
| GET | `/api/sensores/:id` | admin, operador, tecnico | Obtiene un sensor por ID |
| POST | `/api/sensores` | admin, tecnico | Crea un nuevo sensor |
| PUT | `/api/sensores/:id` | admin, tecnico | Actualiza un sensor |
| DELETE | `/api/sensores/:id` | admin | Elimina un sensor |

**Tipos de sensor válidos:** `temperatura`, `humedad`, `apertura`, `movimiento`, `agua`, `humo`

### 5.5 Lecturas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/lecturas?sensor_id=&limite=` | admin, operador, tecnico | Histórico de lecturas |
| GET | `/api/lecturas/ultimas-por-camara` | admin, operador, tecnico | Última temperatura por cámara |

**Parámetros:** `sensor_id` (opcional) filtra por sensor; `limite` (opcional, default 50) controla la cantidad.

### 5.6 Alertas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/alertas?resuelta=&limite=` | admin, operador, tecnico | Lista alertas |
| GET | `/api/alertas/:id` | admin, operador, tecnico | Obtiene una alerta por ID |
| PATCH | `/api/alertas/:id/resolver` | admin, operador | Resuelve una alerta |

### 5.7 Dashboard

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/dashboard` | admin, operador, tecnico | Resumen general del sistema |

**Respuesta:** conteo de sedes, cámaras, sensores, alertas activas y últimas lecturas de temperatura.

---

## 6. Matriz de roles y permisos

| Acción | admin | operador | tecnico |
|---|---|---|---|
| GET (sedes, cámaras, sensores, lecturas, dashboard) | ✅ | ✅ | ✅ |
| PATCH resolver alerta | ✅ | ✅ | ❌ |
| POST / PUT / DELETE sedes | ✅ | ❌ | ❌ |
| POST cámaras | ✅ | ❌ | ❌ |
| PUT cámaras | ✅ | ❌ | ✅ |
| DELETE cámaras | ✅ | ❌ | ❌ |
| POST / PUT sensores | ✅ | ❌ | ✅ |
| DELETE sensores | ✅ | ❌ | ❌ |
| POST register (crear usuarios) | ✅ | ❌ | ❌ |

---

## 7. Middlewares implementados

### auth.js
- `verificarToken()` — extrae y valida el JWT del header `Authorization`. Si es válido, inyecta `req.usuario`.
- `requiereRol(...roles)` — verifica que `req.usuario.rol` esté incluido en los roles permitidos.

### validateId.js
- `validateId()` — valida que `req.params.id` sea un número entero positivo.
- `validateQueryInt(paramName)` — valida que un query param específico sea un número entero positivo (se aplica a `sede_id`, `camara_id`, `sensor_id`, `limite`).

---

## 8. Conexión con las otras capas

### Capa de Datos (PostgreSQL)
- La API se conecta al contenedor `postgres` en el puerto `5432` (interno) / `5433` (host).
- Usa un pool de conexiones con `pg`.
- Todas las consultas usan parámetros con `$1`, `$2`, etc. (SQL injection safe).

### Capa de Presentación (frontend)
- La API expone JSON en todos los endpoints.
- CORS habilitado para permitir peticiones desde cualquier origen (frontend en desarrollo).
- El frontend puede consumir los endpoints usando `Authorization: Bearer <token>`.

### Docker
- `Dockerfile` basado en `node:20-alpine`.
- `docker-compose.yml` propio y también incluido desde el `docker-compose.yml` raíz.
- Comparte la red `cadena_frio_net` con la base de datos.

---

## 9. Documentación interactiva

- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api-docs.json (para importar en Postman)

---

## 10. Cómo probar la API

```bash
# 1. Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmacia.com","password":"admin123"}'

# 2. Usar el token para consultar sedes
TOKEN="el_token_obtenido"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/sedes

# 3. Crear una nueva sede
curl -X POST http://localhost:3000/api/sedes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Distribuidora Sur","tipo":"distribuidora"}'

# 4. Consultar el dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/dashboard
```

---

## 11. Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| admin@farmacia.com | admin123 | admin |
| operador@farmacia.com | admin123 | operador |
| tecnico@farmacia.com | admin123 | tecnico |

---

## 12. Resultado final

La capa de aplicación cuenta con:
- ✅ Backend funcional con Node.js + Express
- ✅ Conexión segura a PostgreSQL
- ✅ Autenticación JWT con login y registro
- ✅ Autorización por roles (admin, operador, tecnico)
- ✅ CRUD completo de sedes, cámaras y sensores
- ✅ Consultas de lecturas y alertas
- ✅ Dashboard con resumen general
- ✅ Validación de parámetros (IDs y query params)
- ✅ Documentación Swagger/OpenAPI
- ✅ Dockerizado y listo para producción académica
- ✅ Diagrama UML de clases actualizado

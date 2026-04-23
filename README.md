# POS API - Clean Architecture & CQRS

Este proyecto es una API de Facturación desarrollada con **NestJS** para demostrar el uso de patrones avanzados y principios de ingeniería de software, siguiendo una estructura de **Clean Architecture** y el patrón **CQRS**.

## Stack Tecnológico
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma (PostgreSQL)
- **Arquitectura**: Clean Architecture (Hexagonal)
- **Patrones**: CQRS (@nestjs/cqrs), Snapshot (Integridad de datos), Repository Pattern.
- **Documentación**: Swagger UI.
- **Infraestructura**: Docker & Docker Compose.

## Estructura de Capas
- `src/domain`: Entidades puras y contratos (interfaces) de repositorios.
- `src/application`: Lógica de negocio, Handlers de Commands y Queries.
- `src/infrastructure`: Implementaciones de persistencia (Prisma), filtros e interceptores.
- `src/presentation`: Controladores, DTOs de validación y configuración de Swagger.

## Cómo empezar (Setup)

### 1. Clonar e Instalar
```bash
git clone <url-del-repositorio>
cd pos-api
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz (el puerto por defecto es el 3001 para evitar conflictos):
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/pos_db?schema=public"
PORT=3001
```

### 3. Levantar Infraestructura
El proyecto utiliza Docker para la base de datos PostgreSQL.
```bash
# Levantar solo la base de datos
npm run infra
```

### 4. Preparar la Base de Datos
Es necesario aplicar las migraciones y ejecutar el semillero (Seed). 
> **Nota técnica**: El seed utiliza `upsert` basado en campos únicos (correo/nombre) y deja que la base de datos gestione los IDs autoincrementales de forma nativa.
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Ejecutar la Aplicación
```bash
# Modo desarrollo con hot-reload
npm run dev
```

### 6. Acceder a la Documentación
Una vez levantado, puedes interactuar con la API a través de Swagger:
👉 **Swagger UI:** [http://localhost:3001/docs](http://localhost:3001/docs)

## Comandos Útiles
- `npm run dev`: Levanta la DB en Docker y arranca la app en modo watch.
- `npx prisma studio`: Interfaz gráfica para explorar la base de datos.
- `npm run lint`: Corregir problemas de estilo y tipos.
- `npm run build`: Generar la versión de producción.

## Solución de Problemas (Troubleshooting)

### Error EPERM (Windows)
Si al ejecutar comandos de Prisma (`migrate`, `generate`) recibes un error de "operation not permitted" sobre archivos `.dll`, asegúrate de **apagar el servidor de NestJS (`npm run dev`)** antes de ejecutar el comando. Windows bloquea estos archivos mientras el proceso está activo.

### Error de Puerto 3001 ocupado
Si el puerto 3001 está ocupado, puedes cerrarlo en Windows con:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```

## Git Flow
El proyecto sigue el flujo de trabajo Git Flow con las ramas `main` (producción) y `develop` (desarrollo).

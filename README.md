# Opina Ingeniería USAC

Aplicación universitaria para publicar opiniones de cursos y docentes, comentar y consultar perfiles con cursos aprobados. Angular consume una API Express y toda la información persiste en MySQL.

## Ramas y publicación

- GitHub / main: versión completa, con catálogo DTT del segundo semestre de 2026.
- completa-local: copia de trabajo completa conservada localmente.
- Repositorio: https://github.com/mrquinho22/opina-ingenieria-usac
- El avance parcial se conserva en el historial; la actualización completa no reescribe commits.

## Ejecutar en esta computadora

```powershell
cd C:\Users\HP27DP0005LA\OneDrive\Documentos\Opi_USAC
git switch completa-local
powershell -ExecutionPolicy Bypass -File tools/start-local-mysql.ps1
npm run dev
```

Abrir **http://127.0.0.1:4200**. La configuración local ya está en `backend/.env`, ignorada por Git. La instancia MySQL del proyecto usa `127.0.0.1:3307` y `.local/mysql-data`; no modifica el servicio MySQL80 existente. El script solo reutiliza esta instancia. Si los servidores ya están iniciados, usarlos o detenerlos con Ctrl+C antes de abrir otros.

## Instalación en otro equipo

Requisitos: Node **24.15.0 o posterior de la rama 24**, npm 11, MySQL **8.0.16+**, Git. MySQL 5.7 no aplica los CHECK necesarios.

```bash
git clone https://github.com/mrquinho22/opina-ingenieria-usac.git
cd opina-ingenieria-usac
npm ci
```


1. Abrir `database/create-user.example.sql` en MySQL Workbench como administrador. Cambiar la contraseña ilustrativa y ejecutar.
2. Copiar `.env.example` y ajustar host, puerto, usuario, contraseña y nombre de base:

```powershell
# Windows
Copy-Item backend/.env.example backend/.env
```

```bash
# Linux / macOS
cp backend/.env.example backend/.env
```

3. Desde la raíz:

```bash
npm run db:setup
npm run db:seed
npm run dev
```

Angular: http://127.0.0.1:4200. API: http://127.0.0.1:3000/api. No alternar `localhost` y `127.0.0.1` en la misma sesión.

## Comandos

| Comando                  | Función                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `npm ci`                 | Instalar versiones del lockfile                             |
| `npm run dev`            | Angular y Express                                           |
| `npm start -w frontend`  | Solo Angular                                                |
| `npm run dev -w backend` | Solo Express                                                |
| `npm run build`          | Compilar Angular                                            |
| `npm start`              | Servir API y frontend compilado en puerto 3000              |
| `npm run db:setup`       | Crear esquema sin borrar datos                              |
| `npm run db:seed`        | Catálogo y cuentas demo, sin sobrescribir cuentas existentes        |
| `npm test`               | Pruebas contra `opina_test`, incluido reinicio HTTP en 3101 |

Para `npm start`, compilar primero. En HTTP local mantener `NODE_ENV=development`; `production` activa cookies Secure y requiere HTTPS. No se realiza despliegue público.

## Variables

| Variable              | Uso                                |
| --------------------- | ---------------------------------- |
| PORT                  | Puerto Express, 3000               |
| DB_HOST               | Servidor MySQL, 127.0.0.1          |
| DB_PORT               | 3306 estándar; 3307 en este equipo |
| DB_USER / DB_PASSWORD | Usuario y contraseña locales       |
| DB_NAME               | opina_usac                         |
| FRONTEND_ORIGIN       | http://127.0.0.1:4200              |
| NODE_ENV              | development en HTTP local          |
| SEMESTER              | 2026-2                             |

Angular utiliza `/api` y `frontend/proxy.conf.json`. No necesita secretos ni credenciales de base de datos.

## Cuentas ficticias de demostración

| Registro  | Nombre inicial | Correo            | Contraseña de prueba |
| --------- | -------------- | ----------------- | -------------------- |
| 202600001 | Ana Demo       | ana@example.test  | Demo2026!            |
| 202600002 | Luis Demo      | luis@example.test | Demo2026!            |

Las pruebas de navegador cambiaron Ana a **Ana María Demo** y dejaron dos publicaciones, un comentario y dos cursos aprobados en la base local. Una semilla limpia empieza sin publicaciones ni aprobados. Ningún mensaje de prueba es una evaluación real de un docente.

## Versiones verificadas

Node 24.15.0; npm 11.12.1; Angular 22.1.6; TypeScript 6.0.3; Bootstrap 5.3.8; Express 5.2.1; mysql2 3.24.4; bcryptjs 3.0.3; Zod 4.6.5; MySQL 8.0.36; Git 2.53.0. Versiones de dependencias fijadas en `package-lock.json`.

## Documentación

- `docs/manual-usuario.md`: pantallas, validaciones y capturas reales.
- `docs/manual-tecnico.md`: estructura, modelo, API y permisos.
- `docs/estudio.md`: explicación del código, guion y preguntas.
- `docs/cumplimiento.md`: matriz de requisitos.
- `docs/verificacion.md`: resultados reales de pruebas.
- `docs/decisiones.md`: supuestos y fuentes oficiales.
- `output/pdf/`: manuales y guía de estudio en PDF.

## Restauración sin afectar datos existentes

Los scripts no usan DROP ni TRUNCATE. `db:setup` aplica `IF NOT EXISTS` y una migración idempotente para créditos desconocidos y `db:seed` conserva usuarios existentes, incluidas sus contraseñas. Para una instalación limpia crear **otra base** (por ejemplo `opina_demo_nueva`), conceder permisos al usuario, cambiar DB_NAME y ejecutar setup/seed. Conservar la anterior.

Las pruebas usan exclusivamente `opina_test` con registros únicos; no utilizar ese nombre para datos personales. Las ejecuciones acumulan datos intencionalmente.

Respaldar con Workbench o `mysqldump -h 127.0.0.1 -P 3307 -u opina -p --result-file=opina-respaldo.sql opina_usac`. `-p` solicita la contraseña de forma interactiva. Restaurar en una base nueva desde Workbench. No versionar respaldos con datos personales.

## Problemas comunes

- **ECONNREFUSED:** verificar MySQL/API y puertos. En este equipo iniciar `tools/start-local-mysql.ps1`.
- **Access denied:** revisar `.env` y permisos del usuario MySQL. No compartir contraseñas en el chat.
- **Puerto ocupado:** detener la ejecución anterior o cambiar PORT y el proxy juntos.
- **404 en puerto 3000:** compilar con `npm run build` y reiniciar `npm start`.
- **Sesión no permanece:** no mezclar hosts; no usar cookies Secure en HTTP local.
- **npm.ps1 bloqueado:** utilizar `npm.cmd`.
- **Sin resultados:** pulsar Limpiar; los filtros combinados usan AND.
- **Catálogo vacío:** ejecutar seed y mantener SEMESTER=2026-2 para esta captura.

## Límites

La recuperación por registro+correo es académica y necesita verificación adicional de identidad antes de uso público. Los aprobados son declaraciones del usuario, sin validar prerrequisitos ni certificar historial. Publicaciones: 34 cursos DTT y 169 asignaciones; aprobados: 75 cursos del pénsum CLAR 2025. No se incluyen calificaciones numéricas, moderación ni edición/borrado de publicaciones porque el enunciado no las exige.

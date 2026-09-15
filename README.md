# Opina Ingeniería USAC — avance parcial

Aplicación académica Angular + Bootstrap, API REST Express y persistencia MySQL.

Este commit es un **avance parcial solicitado por el propietario**, no una entrega final. Incluye esquema relacional, catálogo oficial, registro, inicio/cierre de sesión, recuperación y listado con filtros. La creación desde interfaz, comentarios y perfiles se completarán en la siguiente etapa. Los enlaces de esas pantallas todavía no forman parte de este avance.

## Ejecutar

Requisitos: Node.js 24.15+, npm 11, MySQL 8.0.16+ (restricciones CHECK).

1. `npm ci`
2. Copiar `backend/.env.example` a `backend/.env` y configurar una base y usuario MySQL propios.
3. `npm run db:setup`
4. `npm run db:seed`
5. `npm run dev`

Abrir http://127.0.0.1:4200. API: http://127.0.0.1:3000/api.
En PowerShell: `Copy-Item backend/.env.example backend/.env`.

DEMOSTRACIÓN: registros `202600001` y `202600002`, contraseña `Demo2026!`. Son cuentas ficticias, exclusivas para una base de prueba. La carga no sobrescribe usuarios existentes.

Compilación: `npm run build`. Configuración de producción local: `npm start`, sirve el frontend compilado en el puerto 3000. Usar siempre el mismo host (127.0.0.1) para las cookies.

Ver `docs/decisiones.md` para supuestos y fuentes oficiales. No se incluyen secretos ni credenciales personales.

# Requisitos y decisiones

Fuente principal: «Actividad - Desarrollo web», cinco páginas, Prácticas Iniciales F, segundo semestre 2026. Entrega 17/09/2026 09:00; calificación 10:40. Las reglas sobre grupos y asistencia pertenecen al enunciado académico: el desarrollo aquí se realiza con un solo asistente, según la solicitud del usuario. No se fabrican contribuciones de compañeros.

- Registro personal = registro académico del estudiante. Es una cadena de 5 a 20 dígitos, conserva ceros y es inmutable.
- Los cuatro filtros se interpretan como tipo curso, tipo docente, nombre de curso y nombre de docente. También se ofrecen selecciones exactas; los filtros simultáneos se combinan mediante AND.
- Auxiliar se representa como docente con rol `auxiliar`. Las publicaciones siguen teniendo exactamente dos destinos posibles: curso o docente.
- Semestre: `2026-2`. Créditos: CLAR del plan vigente desde 2025. No se mezclan con los créditos del pénsum anterior.
- Se capturó el pénsum completo (75 entradas), incluidos cursos comunes, optativos y prácticas con cero créditos. Se agregan libremente aprobados, sin validar prerrequisitos, como permite el PDF.
- Publicaciones: 34 cursos de DTT, 80 secciones y 169 asignaciones únicas. La tabla tenía 97 filas por repetición de secciones con distintos practicantes. Se usan los profesores y practicantes publicados; ocho secciones no publican profesor y no se completa ese dato.
- Los catálogos DTT y CLAR se mantienen separados, sin suponer equivalencias entre planes. DTT usa códigos internos DTT-* (no oficiales), nombres legibles y créditos NULL; esos cursos no se pueden agregar como aprobados. Los nombres personales conservan el orden apellidos, nombres publicado en DTT.
- Recuperación académica: registro + correo + nueva contraseña; invalida todas las sesiones. Antes de uso público requiere verificación adicional (por ejemplo enlace de un solo uso al correo).
- Sesión opaca de 8 horas en MySQL. Cookie HttpOnly/SameSite; hash del token en la base. Identidad exclusivamente del servidor.
- La interfaz es propia y usa el ejemplo del PDF como referencia de disposición del formulario; no solicita credenciales institucionales.
- Versionamiento actualizado por el propietario: publicar ahora toda la implementación en main y conservar la copia local.

## Fuentes oficiales consultadas el 15/09/2026

- DTT: lectura de navegador del 15/09/2026; nuevos intentos del 16/09/2026 agotaron tiempo de espera: https://dtt-ecys.org/resources?r=10
- Pénsum CLAR 2025: https://redesestudio.ingenieria.usac.edu.gt/redesDeEstudio/ingenieriaEnCienciasYSistemas/28/clar
- Horario segundo semestre 2026: https://usuarios.ingenieria.usac.edu.gt/horarios/semestre/2

`database/catalog.json` conserva la captura estructurada y la procedencia. `node tools/import-catalog.mjs` reproduce el catálogo a partir de `database/dtt-2026-2.tsv` (transcripción de la lectura de navegador) y `database/pensum-clar-2025.json`. No necesita descargar páginas. La transcripción no incluye enlaces de reuniones. No se inventaron docentes, créditos ni asignaciones. Las cuentas Ana y Luis Demo son ficticias.

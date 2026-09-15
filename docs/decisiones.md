# Requisitos y decisiones

Fuente principal: «Actividad - Desarrollo web», cinco páginas, Prácticas Iniciales F, segundo semestre 2026. Entrega 17/09/2026 09:00; calificación 10:40. Las reglas sobre grupos y asistencia pertenecen al enunciado académico: el desarrollo aquí se realiza con un solo asistente, según la solicitud del usuario. No se fabrican contribuciones de compañeros.

- Registro personal = registro académico del estudiante. Es una cadena de 5 a 20 dígitos, conserva ceros y es inmutable.
- Los cuatro filtros se interpretan como tipo curso, tipo docente, nombre de curso y nombre de docente. También se ofrecen selecciones exactas; los filtros simultáneos se combinan mediante AND.
- Auxiliar se representa como docente con rol `auxiliar`. Las publicaciones siguen teniendo exactamente dos destinos posibles: curso o docente.
- Semestre: `2026-2`. Créditos: CLAR del plan vigente desde 2025. No se mezclan con los créditos del pénsum anterior.
- Se capturó el pénsum completo (75 entradas), incluidos cursos comunes, optativos y prácticas con cero créditos. Se agregan libremente aprobados, sin validar prerrequisitos, como permite el PDF.
- Publicaciones: materias marcadas con `area` en la red curricular y con asignación en el horario oficial. Se excluyen cursos sin oferta encontrada en el semestre. Son 26 cursos y 174 asignaciones únicas de curso/docente/rol/sección. DTT no respondió; se documentan las fuentes sustitutas abajo.
- Los nombres de cursos vienen del pénsum; la unión con horarios se hace por código. Los nombres pueden diferir entre planes. La aplicación muestra un catálogo de referencia, no certifica inscripciones ni historial oficial.
- Recuperación académica: registro + correo + nueva contraseña; invalida todas las sesiones. Antes de uso público requiere verificación adicional (por ejemplo enlace de un solo uso al correo).
- Sesión opaca de 8 horas en MySQL. Cookie HttpOnly/SameSite; hash del token en la base. Identidad exclusivamente del servidor.
- La interfaz es propia y usa el ejemplo del PDF como referencia de disposición del formulario; no solicita credenciales institucionales.
- Versionamiento solicitado: publicar un avance parcial honesto en `main`; conservar la aplicación terminada en `completa-local` sin subirla todavía.

## Fuentes oficiales consultadas el 15/09/2026

- Enlace del PDF (no disponible durante revisión): https://dtt-ecys.org/resources?r=10
- Pénsum CLAR 2025: https://redesestudio.ingenieria.usac.edu.gt/redesDeEstudio/ingenieriaEnCienciasYSistemas/28/clar
- Horario segundo semestre 2026: https://usuarios.ingenieria.usac.edu.gt/horarios/semestre/2

`database/catalog.json` conserva la captura estructurada y la procedencia. `tools/import-catalog.py` permite repetir la extracción. No se inventaron docentes, créditos ni asignaciones. Las cuentas Ana y Luis Demo son ficticias.

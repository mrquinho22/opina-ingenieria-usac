# Lista de cumplimiento

Fuente: PDF de cinco páginas «Actividad - Desarrollo web», segundo semestre 2026. Esta lista corresponde a **completa-local**; el remoto main contiene el avance parcial autorizado.

| Requisito del PDF                                    | Ubicación                          | Verificación                            | Estado                                |
| ---------------------------------------------------- | ---------------------------------- | --------------------------------------- | ------------------------------------- |
| Cliente Angular o React, p.2                         | frontend, Angular 22               | Compilación y navegador                 | Cumplido                              |
| Node como REST API, p.2                              | backend/src/app.js, rutas          | Supertest y HTTP real                   | Cumplido                              |
| Persistencia en BD, p.2                              | MySQL, database/schema.sql         | Reinicio de proceso y consultas         | Cumplido                              |
| Cursos Sistemas, semestre actual, p.2                | catalog.json; import-catalog.py    | Pénsum/horario oficial 2026-2           | Cumplido con alternativa a DTT        |
| Repositorio y varios commits, p.3                    | main y completa-local              | git log, ls-remote                      | Avance parcial publicado según pedido |
| Login de usuarios registrados, p.3                   | auth-page.ts; routes-auth.js       | Login correcto/incorrecto, API/UI       | Cumplido                              |
| Referencia visual de acceso, p.3                     | auth-page.ts, styles.css           | Captura login.png                       | Cumplido con diseño propio            |
| Registro con cinco campos, pp.3-4                    | validation.js; /auth/register      | Registro válido, inválido y duplicado   | Cumplido                              |
| Redirección después de registro, p.4                 | auth-page.ts                       | Navegador con cuenta de prueba          | Cumplido                              |
| Recuperación registro/correo, p.4                    | /auth/recover                      | Coincidencia/rechazo y login nuevo      | Cumplido; mecanismo académico         |
| Listado por fecha descendente, p.4                   | routes-posts.js; feed.ts           | API y tarjetas en navegador             | Cumplido                              |
| Filtro por curso, p.4                                | type=course, course_id             | API y navegador                         | Cumplido                              |
| Filtro por catedrático, p.4                          | type=teacher, teacher_id           | API y navegador                         | Cumplido                              |
| Filtro nombre curso, p.4                             | course_name, LOCATE                | API y navegador                         | Cumplido                              |
| Filtro nombre docente, p.4                           | teacher_name, LOCATE               | API y navegador                         | Cumplido                              |
| Publicación curso o docente específico, p.4          | new-post.ts; /posts; CHECK         | Ambos destinos y rechazo de dos         | Cumplido                              |
| Autor, tema, mensaje y fecha, p.4                    | posts + JOIN; post-card.ts         | Autor de sesión y reloj UTC             | Cumplido                              |
| Comentarios por publicación, p.5                     | post-detail.ts; /comments          | Segunda cuenta y recarga                | Cumplido                              |
| Buscar perfil por registro y error, p.5              | feed.ts; /users/by-record          | Existente/inexistente, API/UI           | Cumplido                              |
| Perfil propio editable sin registro, p.5             | profile.ts; PATCH /users/:id       | Edición propia; 403 ajeno; 400 registro | Cumplido                              |
| Aprobados y créditos de otros, p.5                   | GET /users/:id                     | Segunda cuenta ve total 15              | Cumplido                              |
| Agregar aprobados propios, p.5                       | approved_courses; profile.ts       | Duplicados, permisos y suma             | Cumplido                              |
| Catálogo del pénsum, p.5                             | 75 cursos CLAR 2025                | Captura oficial y carga                 | Cumplido; plan documentado            |
| Manual usuario, p.5                                  | docs/manual-usuario.md; output/pdf | Capturas y revisión PDF                 | Cumplido                              |
| Manual técnico servidor, p.5                         | docs/manual-tecnico.md; output/pdf | Rutas documentadas contra código        | Cumplido                              |
| Grupos, presencia de integrantes y entrega UEDI, p.5 | Responsabilidad académica externa  | No automatizable por la aplicación      | Acción del estudiante                 |

## Requisitos adicionales del usuario

| Requisito                               | Evidencia                           | Estado   |
| --------------------------------------- | ----------------------------------- | -------- |
| Bootstrap, español y responsive         | styles.css, capturas, prueba 390 px | Cumplido |
| Cierre y protección de sesión           | Cookie + tabla sessions + guard     | Cumplido |
| Hashes y consultas parametrizadas       | bcryptjs; mysql2.execute            | Cumplido |
| Estados carga/error/vacío y Limpiar     | componentes y navegador             | Cumplido |
| Catálogo sin invenciones                | JSON con fuentes y fecha            | Cumplido |
| Dos cuentas demo y semilla reproducible | seed.js; README                     | Cumplido |
| .env.example, .gitignore, lockfile      | Raíz y backend/frontend             | Cumplido |
| Documentación editable y PDF            | Markdown + output/pdf               | Cumplido |
| Guion y preguntas basadas en código     | docs/estudio.md                     | Cumplido |
| Versión completa solo local             | completa-local sin upstream         | Cumplido |
| Remoto verificado sin force push        | origin/main = 782fe98               | Cumplido |

## Límites reales

DTT no respondió. Se usaron dos fuentes oficiales alternativas y se documentó el criterio: materias con área propia en la red CLAR y oferta encontrada en 2026-2. No se mezclaron planes ni se inventaron asignaciones. Las reglas de asistencia, conformación del grupo y entrega en UEDI no son funciones de software; las debe atender el estudiante. La publicación completa se hará solo cuando el propietario la solicite.

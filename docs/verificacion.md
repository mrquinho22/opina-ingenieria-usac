# Registro de verificación

Fecha: 15/09/2026. Entorno: Windows, Node 24.15.0, MySQL 8.0.36, Angular 22.1.6. Base de aplicación opina_usac; pruebas en opina_test, ambas en la instancia aislada 3307.

## Pruebas automatizadas ejecutadas

Comando: `npm test`. Resultado: **12 pruebas contabilizadas por node:test, 12 aprobadas, 0 fallidas** (10 subpruebas, su prueba contenedora y una prueba independiente de reinicio).

1. Registro válido, duplicado y formato inválido.
2. Acceso interno sin sesión rechazado.
3. Login incorrecto/correcto; cookie HttpOnly y respuestas sin hashes.
4. Publicaciones para curso/docente; autor de sesión; rechazo sin destino/con dos destinos/autor falsificado; CHECK SQL; fecha UTC correcta.
5. Orden por fecha/ID; cuatro filtros; selecciones exactas; búsqueda vacía; rechazo de ID con SQL.
6. Comentario de segunda cuenta, consulta posterior y publicación inexistente.
7. Búsqueda de perfiles, edición propia, rechazo ajeno y registro inmutable.
8. Aprobados, duplicados, permiso propio y suma desde catálogo.
9. Origin ajeno rechazado y logout invalidado en servidor.
10. Recuperación incorrecta/correcta, contraseña anterior rechazada y revocación de sesiones.
11. Proceso HTTP real en 3101: crear sesión, publicación, comentario y aprobado; detener y reiniciar Node; verificar los cuatro datos sin reautenticar.

Las pruebas consultan MySQL real. No hay mocks de persistencia. Setup y seed se repitieron con éxito en la base de pruebas sin borrar datos existentes.

## Compilación

`npm run build` ejecutado con éxito. Verifica TypeScript y plantillas Angular estrictas. Se corrigieron errores detectados de plantilla, ruta de Bootstrap y CSS. El bundle quedó dentro del presupuesto de 800 kB de advertencia / 1 MB máximo.

## Recorridos ejecutados en navegador integrado

| Recorrido                                   | Resultado observado                                   |
| ------------------------------------------- | ----------------------------------------------------- |
| Abrir sin sesión                            | Redirección a login                                   |
| Credenciales erróneas                       | Mensaje comprensible                                  |
| Login Ana                                   | Acceso a inicio                                       |
| Crear publicación de curso                  | Tarjeta guardada y fecha visible                      |
| Editar Ana                                  | Nombre cambiado a Ana María                           |
| Agregar IPC1 y Matemática Básica 1          | 6 + 9 = 15 CLAR, persistente al recargar              |
| Logout y login Luis                         | Cambio de usuario correcto                            |
| Luis comenta publicación de Ana             | Comentario visible después de recargar                |
| Buscar registro inexistente                 | Error visible                                         |
| Buscar Ana desde Luis                       | Perfil e historial sin controles de edición           |
| Publicar sobre docente                      | Segunda tarjeta, más reciente primero                 |
| Cuatro filtros                              | Resultados correspondientes                           |
| Filtro sin coincidencias y Limpiar          | Estado vacío y retorno al listado                     |
| Registro cuenta 202699901                   | Redirección y confirmación en login                   |
| Recuperación con correo incorrecto/correcto | Rechazo y actualización confirmada                    |
| Escritorio 1366 x 900                       | Tarjetas y columnas sin superposición                 |
| Móvil solicitado 390 x 844                  | Contenido adaptado, ancho útil 375 sin desbordamiento |

Capturas reales en `docs/capturas/`. La fecha inicialmente mostraba seis horas de desfase; se corrigió fijando UTC en la sesión MySQL y se añadió una aserción de reloj. Se volvió a comprobar en pantalla.

## Git

Comandos de arranque verificados también en una segunda sesión: script PowerShell de MySQL y `npm run dev`. Se desactivó la vigilancia automática de Node porque producía reinicios repetidos; para aplicar cambios al backend se reinicia el comando. Angular conserva su recarga de desarrollo.

Remoto verificado: https://github.com/mrquinho22/opina-ingenieria-usac.git. Dos commits publicados en main; último `782fe98016eabb0cf2168737711b2062b0a8f8a8`, confirmado con `git ls-remote`. El resto permanece en completa-local. No force push, no reescritura de historia ni contribuciones inventadas.

## Alcance de las comprobaciones

Se generaron los tres PDF desde sus fuentes Markdown y se revisaron visualmente todas las páginas renderizadas. Se ajustaron los saltos para mantener los títulos con su contenido. Las capturas de escritorio corresponden a recorridos reales.

No se realizó auditoría de seguridad profesional, prueba de carga, despliegue HTTPS público ni validación en dispositivos físicos. Responsive se comprobó en navegador con viewport móvil. La recuperación cumple el mecanismo académico, pero requiere verificación adicional antes de uso público. La revisión visual de PDF se realiza sobre los archivos generados y sus páginas renderizadas.

-- Ejecutar como administrador de MySQL. Cambiar la contraseña antes de usar.
CREATE DATABASE IF NOT EXISTS opina_usac CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'opina'@'127.0.0.1' IDENTIFIED BY 'CAMBIAR_LOCALMENTE';
GRANT ALL PRIVILEGES ON opina_usac.* TO 'opina'@'127.0.0.1';
-- Solo para pruebas de integración, base distinta:
CREATE DATABASE IF NOT EXISTS opina_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON opina_test.* TO 'opina'@'127.0.0.1';
-- En producción separar el usuario de migración del usuario de la API.

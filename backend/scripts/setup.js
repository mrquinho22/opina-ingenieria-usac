import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { config } from "../src/config.js";
if (!/^[a-zA-Z0-9_]+$/.test(config.db.database))
  throw Error("Nombre de base inválido.");
const connection = await mysql.createConnection({
  ...config.db,
  database: undefined,
  multipleStatements: true,
});
await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
);
await connection.changeUser({ database: config.db.database });
await connection.query(
  await readFile(new URL("../../database/schema.sql", import.meta.url), "utf8"),
);
// Migración idempotente: NULL significa créditos desconocidos en cursos DTT.
const [columns] = await connection.query(
  "SHOW COLUMNS FROM courses LIKE 'credits'",
);
if (columns[0].Null === "NO")
  await connection.query(
    "ALTER TABLE courses MODIFY credits SMALLINT UNSIGNED NULL",
  );
await connection.end();
console.log("Esquema preparado sin eliminar datos.");

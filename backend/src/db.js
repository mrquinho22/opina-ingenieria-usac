import mysql from "mysql2/promise";
import { config } from "./config.js";
export const pool = mysql.createPool({ ...config.db, connectionLimit: 10 });
// MySQL TIMESTAMP se convierte según la sesión; mysql2 interpreta fechas en UTC.
// Fijar ambos evita aplicar dos veces la zona horaria de Guatemala.
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

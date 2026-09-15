import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});
export const config = {
  port: Number(process.env.PORT || 3000),
  origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:4200",
  production: process.env.NODE_ENV === "production",
  semester: process.env.SEMESTER || "2026-2",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "opina",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "opina_usac",
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: false,
  },
};

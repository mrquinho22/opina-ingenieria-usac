import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";
const data = JSON.parse(
  await readFile(
    new URL("../../database/catalog.json", import.meta.url),
    "utf8",
  ),
);
const db = await pool.getConnection();
try {
  await db.beginTransaction();
  for (const c of data.courses)
    await db.execute(
      "INSERT INTO courses(code,name,credits,publication_enabled,source) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE code=VALUES(code)",
      [c.code, c.name, c.credits, c.publication_enabled, c.source],
    );
  for (const a of data.assignments) {
    await db.execute(
      "INSERT INTO teachers(name,role) VALUES(?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
      [a.teacher, a.role],
    );
    await db.execute(
      "INSERT INTO assignments(course_id,teacher_id,semester,section,source) SELECT c.id,t.id,?,?,? FROM courses c JOIN teachers t ON t.name=? AND t.role=? WHERE c.code=? ON DUPLICATE KEY UPDATE source=VALUES(source)",
      [a.semester, a.section, a.source, a.teacher, a.role, a.code],
    );
  }
  for (const [record, first, last, email] of [
    ["202600001", "Ana", "Demo", "ana@example.test"],
    ["202600002", "Luis", "Demo", "luis@example.test"],
  ]) {
    const h = await bcrypt.hash("Demo2026!", 12);
    await db.execute(
      "INSERT INTO users(academic_record,first_name,last_name,email,password_hash) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE academic_record=VALUES(academic_record)",
      [record, first, last, email, h],
    );
  }
  await db.commit();
  console.log(
    "Catálogo oficial y dos cuentas DEMO cargados. No se sustituyeron cuentas existentes.",
  );
} catch (e) {
  await db.rollback();
  throw e;
} finally {
  db.release();
  await pool.end();
}

import { Router } from "express";
import bcrypt from "bcryptjs";
import { query, pool } from "./db.js";
import * as v from "./validation.js";
import {
  authenticate,
  createSession,
  fields,
  hash,
  tokenFrom,
  cookieOptions,
} from "./auth.js";
export const authRoutes = Router();
authRoutes.post("/register", async (req, res) => {
  const b = v.registration.parse(req.body);
  const h = await bcrypt.hash(b.password, 12);
  const r = await query(
    "INSERT INTO users(academic_record,first_name,last_name,email,password_hash) VALUES(?,?,?,?,?)",
    [b.academic_record, b.first_name, b.last_name, b.email, h],
  );
  res
    .status(201)
    .json({
      id: r.insertId,
      message: "Cuenta creada. Ya puedes iniciar sesión.",
    });
});
authRoutes.post("/login", async (req, res) => {
  const b = v.login.parse(req.body);
  const [u] = await query("SELECT * FROM users WHERE academic_record=?", [
    b.academic_record,
  ]);
  if (!u || !(await bcrypt.compare(b.password, u.password_hash)))
    v.fail(401, "Registro o contraseña incorrectos.");
  const old = tokenFrom(req);
  if (old) await query("DELETE FROM sessions WHERE token_hash=?", [hash(old)]);
  await createSession(u.id, res);
  const [safe] = await query(`SELECT ${fields} FROM users WHERE id=?`, [u.id]);
  res.json(safe);
});
authRoutes.post("/recover", async (req, res) => {
  const b = v.recovery.parse(req.body);
  const [u] = await query(
    "SELECT id FROM users WHERE academic_record=? AND email=?",
    [b.academic_record, b.email],
  );
  if (!u) v.fail(400, "El registro académico y el correo no coinciden.");
  const h = await bcrypt.hash(b.password, 12);
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    await db.execute("UPDATE users SET password_hash=? WHERE id=?", [h, u.id]);
    await db.execute("DELETE FROM sessions WHERE user_id=?", [u.id]);
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    db.release();
  }
  res
    .clearCookie("opina_session", cookieOptions)
    .json({ message: "Contraseña actualizada. Inicia sesión de nuevo." });
});
authRoutes.get("/me", authenticate, (req, res) => res.json(req.user));
authRoutes.post("/logout", async (req, res) => {
  const token = tokenFrom(req);
  if (token)
    await query("DELETE FROM sessions WHERE token_hash=?", [hash(token)]);
  res
    .clearCookie("opina_session", cookieOptions)
    .json({ message: "Sesión cerrada." });
});

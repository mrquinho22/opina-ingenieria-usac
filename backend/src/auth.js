import { randomBytes, createHash } from "node:crypto";
import { query } from "./db.js";
import { config } from "./config.js";
export const hash = (token) => createHash("sha256").update(token).digest("hex");
export const fields = "id, academic_record, first_name, last_name, email";
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.production,
  path: "/",
};
export function tokenFrom(req) {
  return req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("opina_session="))
    ?.slice(14);
}
export async function authenticate(req, res, next) {
  const token = tokenFrom(req);
  if (!token)
    return res.status(401).json({ message: "Inicia sesión para continuar." });
  const rows = await query(
    `SELECT u.${fields.replaceAll(", ", ", u.")} FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()`,
    [hash(token)],
  );
  if (!rows.length)
    return res
      .status(401)
      .json({ message: "La sesión expiró. Inicia sesión de nuevo." });
  req.user = rows[0];
  next();
}
export async function createSession(userId, res) {
  const token = randomBytes(32).toString("hex");
  await query("DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP()");
  await query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))",
    [hash(token), userId],
  );
  res.cookie("opina_session", token, {
    ...cookieOptions,
    maxAge: 8 * 3600 * 1000,
  });
}

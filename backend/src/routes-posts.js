import { Router } from "express";
import { query } from "./db.js";
import { config } from "./config.js";
import * as v from "./validation.js";
export const postRoutes = Router();
const select = `SELECT p.*,u.academic_record,CONCAT(u.first_name,' ',u.last_name) author_name,c.name course_name,t.name teacher_name,t.role teacher_role,(SELECT COUNT(*) FROM comments x WHERE x.post_id=p.id) comment_count FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN courses c ON c.id=p.course_id LEFT JOIN teachers t ON t.id=p.teacher_id`;
postRoutes.get("/", async (req, res) => {
  const where = [],
    params = [];
  const q = req.query;
  if (q.type) {
    if (!["course", "teacher"].includes(q.type))
      v.fail(400, "Filtro de tipo inválido.");
    where.push(
      q.type === "course"
        ? "p.course_id IS NOT NULL"
        : "p.teacher_id IS NOT NULL",
    );
  }
  for (const [key, column] of [
    ["course_id", "p.course_id"],
    ["teacher_id", "p.teacher_id"],
  ])
    if (q[key]) {
      where.push(`${column}=?`);
      params.push(v.id(q[key]));
    }
  for (const [key, column] of [
    ["course_name", "c.name"],
    ["teacher_name", "t.name"],
  ])
    if (q[key]) {
      if (typeof q[key] !== "string" || q[key].length > 150)
        v.fail(400, "Filtro inválido.");
      where.push(`LOCATE(?,${column})>0`);
      params.push(q[key]);
    }
  res.json(
    await query(
      select +
        (where.length ? " WHERE " + where.join(" AND ") : "") +
        " ORDER BY p.created_at DESC,p.id DESC",
      params,
    ),
  );
});
postRoutes.post("/", async (req, res) => {
  const b = v.post.parse(req.body);
  if (b.course_id) {
    const rows = await query(
      "SELECT id FROM courses WHERE id=? AND publication_enabled=1",
      [b.course_id],
    );
    if (!rows.length)
      v.fail(400, "Selecciona un curso del catálogo de publicaciones.");
  } else {
    const rows = await query(
      "SELECT id FROM assignments WHERE teacher_id=? AND semester=? AND source='https://dtt-ecys.org/resources?r=10'",
      [b.teacher_id, config.semester],
    );
    if (!rows.length) v.fail(400, "Selecciona un docente del semestre actual.");
  }
  const r = await query(
    "INSERT INTO posts(author_id,course_id,teacher_id,message) VALUES(?,?,?,?)",
    [req.user.id, b.course_id || null, b.teacher_id || null, b.message],
  );
  res
    .status(201)
    .json((await query(select + " WHERE p.id=?", [r.insertId]))[0]);
});
postRoutes.get("/:id", async (req, res) => {
  const [p] = await query(select + " WHERE p.id=?", [v.id(req.params.id)]);
  if (!p) v.fail(404, "La publicación no existe.");
  res.json(p);
});
postRoutes.get("/:id/comments", async (req, res) => {
  const postId = v.id(req.params.id);
  if (!(await query("SELECT id FROM posts WHERE id=?", [postId])).length)
    v.fail(404, "La publicación no existe.");
  res.json(
    await query(
      `SELECT c.*,u.academic_record,CONCAT(u.first_name,' ',u.last_name) author_name FROM comments c JOIN users u ON u.id=c.author_id WHERE post_id=? ORDER BY c.created_at,c.id`,
      [postId],
    ),
  );
});
postRoutes.post("/:id/comments", async (req, res) => {
  const b = v.comment.parse(req.body),
    postId = v.id(req.params.id);
  if (!(await query("SELECT id FROM posts WHERE id=?", [postId])).length)
    v.fail(404, "La publicación no existe.");
  const r = await query(
    "INSERT INTO comments(post_id,author_id,message) VALUES(?,?,?)",
    [postId, req.user.id, b.message],
  );
  res.status(201).json({ id: r.insertId });
});

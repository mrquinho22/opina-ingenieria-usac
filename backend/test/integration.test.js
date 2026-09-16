import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import request from "supertest";
// Base exclusiva: nunca truncar ni borrar datos de la aplicación.
process.env.DB_NAME = "opina_test";
execFileSync(process.execPath, ["scripts/setup.js"], {
  cwd: new URL("..", import.meta.url),
  env: process.env,
});
execFileSync(process.execPath, ["scripts/seed.js"], {
  cwd: new URL("..", import.meta.url),
  env: process.env,
});
const { app } = await import("../src/app.js");
const { pool, query } = await import("../src/db.js");
const a = request.agent(app),
  b = request.agent(app);
const unique = String(Date.now()),
  recordA = "81" + unique,
  recordB = "82" + unique;
const password = "Prueba2026!";
let userA, userB, course, teacher, postA, postB;
after(async () => pool.end());
test("integración contra MySQL real", async (t) => {
  await t.test("registro válido, duplicados y campos inválidos", async () => {
    const body = {
      academic_record: recordA,
      first_name: "Prueba",
      last_name: "Uno",
      email: `a${unique}@example.test`,
      password,
    };
    userA = (await a.post("/api/auth/register").send(body).expect(201)).body.id;
    await a.post("/api/auth/register").send(body).expect(409);
    await a
      .post("/api/auth/register")
      .send({ ...body, academic_record: "mal" })
      .expect(400);
    userB = (
      await b
        .post("/api/auth/register")
        .send({
          ...body,
          academic_record: recordB,
          first_name: "Prueba Dos",
          email: `b${unique}@example.test`,
        })
        .expect(201)
    ).body.id;
  });
  await t.test(
    "sin sesión se niega acceso a todos los recursos internos",
    async () => {
      for (const url of [
        "/api/posts",
        "/api/catalogs",
        "/api/users/1",
        "/api/auth/me",
      ])
        await request(app).get(url).expect(401);
      await request(app).post("/api/posts").send({ message: "x" }).expect(401);
    },
  );
  await t.test(
    "inicio incorrecto y correcto; sin hashes en respuestas",
    async () => {
      await a
        .post("/api/auth/login")
        .send({ academic_record: recordA, password: "incorrecta" })
        .expect(401);
      const r = await a
        .post("/api/auth/login")
        .send({ academic_record: recordA, password })
        .expect(200);
      assert.equal(r.body.id, userA);
      assert.ok(!JSON.stringify(r.body).includes("password"));
      assert.match(r.headers["set-cookie"][0], /HttpOnly/);
      await b
        .post("/api/auth/login")
        .send({ academic_record: recordB, password })
        .expect(200);
      const c = (await a.get("/api/catalogs").expect(200)).body;
      course = c.courses.find((x) => x.publication_enabled);
      teacher = c.teachers[0];
      assert.ok(course && teacher);
      assert.equal(c.courses.filter((x) => x.credits !== null).length, 75);
      assert.equal(c.courses.filter((x) => x.publication_enabled).length, 34);
      assert.equal(c.assignments.length, 169);
    },
  );
  await t.test(
    "publicaciones curso/docente, exclusión de destinos y autor servidor",
    async () => {
      postA = (
        await a
          .post("/api/posts")
          .send({ course_id: course.id, message: "Opinión curso " + unique })
          .expect(201)
      ).body;
      postB = (
        await b
          .post("/api/posts")
          .send({
            teacher_id: teacher.id,
            message: "Opinión docente " + unique,
          })
          .expect(201)
      ).body;
      assert.equal(postA.author_id, userA);
      assert.equal(postB.author_id, userB);
      assert.ok(
        Math.abs(Date.now() - new Date(postA.created_at).getTime()) < 60000,
        "La fecha del servidor debe representar el instante actual en UTC",
      );
      for (const body of [
        { message: "Sin destino" },
        {
          course_id: course.id,
          teacher_id: teacher.id,
          message: "Dos destinos",
        },
        { course_id: course.id, message: "  " },
        { course_id: course.id, message: "Fraude", author_id: userB },
      ])
        await a.post("/api/posts").send(body).expect(400);
      await assert.rejects(
        query("INSERT INTO posts(author_id,message) VALUES(?,?)", [
          userA,
          "Sin destino SQL",
        ]),
      );
    },
  );
  await t.test(
    "orden descendente y cuatro filtros, selecciones exactas y sin resultados",
    async () => {
      const all = (await a.get("/api/posts").expect(200)).body;
      assert.equal(all[0].id, postB.id);
      assert.equal(all[1].id, postA.id);
      for (let i = 1; i < all.length; i++)
        assert.ok(
          new Date(all[i - 1].created_at) >= new Date(all[i].created_at),
        );
      for (const [q, check] of [
        [{ type: "course" }, (x) => !!x.course_id],
        [{ type: "teacher" }, (x) => !!x.teacher_id],
        [{ course_name: course.name }, (x) => x.course_name === course.name],
        [
          { teacher_name: teacher.name },
          (x) => x.teacher_name === teacher.name,
        ],
        [{ course_id: course.id }, (x) => x.course_id === course.id],
        [{ teacher_id: teacher.id }, (x) => x.teacher_id === teacher.id],
      ]) {
        const rows = (await a.get("/api/posts").query(q).expect(200)).body;
        assert.ok(rows.length);
        assert.ok(rows.every(check));
      }
      assert.deepEqual(
        (
          await a
            .get("/api/posts")
            .query({ course_name: "NO_EXISTE_" + unique })
            .expect(200)
        ).body,
        [],
      );
      await a.get("/api/posts").query({ course_id: "1 OR 1=1" }).expect(400);
    },
  );
  await t.test(
    "segunda cuenta comenta; recarga conserva comentario",
    async () => {
      await b
        .post(`/api/posts/${postA.id}/comments`)
        .send({ message: "Aporte segunda cuenta" })
        .expect(201);
      const rows = (await a.get(`/api/posts/${postA.id}/comments`).expect(200))
        .body;
      assert.equal(rows[0].author_id, userB);
      assert.equal(rows[0].message, "Aporte segunda cuenta");
      assert.equal(
        (await a.get(`/api/posts/${postA.id}`).expect(200)).body.comment_count,
        1,
      );
      await a
        .post("/api/posts/999999999/comments")
        .send({ message: "x" })
        .expect(404);
    },
  );
  await t.test(
    "perfiles, búsqueda, edición propia, inmutabilidad y permisos",
    async () => {
      assert.equal(
        (await a.get("/api/users/by-record/" + recordB).expect(200)).body.id,
        userB,
      );
      await a.get("/api/users/by-record/99999999999999999999").expect(404);
      const body = {
        first_name: "Editado",
        last_name: "Uno",
        email: `a${unique}@example.test`,
      };
      await a
        .patch("/api/users/" + userA)
        .send(body)
        .expect(200);
      await b
        .patch("/api/users/" + userA)
        .send(body)
        .expect(403);
      await a
        .patch("/api/users/" + userA)
        .send({ ...body, academic_record: "1234567" })
        .expect(400);
      const u = (await a.get("/api/users/" + userA).expect(200)).body;
      assert.equal(u.first_name, "Editado");
      assert.equal(u.academic_record, recordA);
      assert.ok(!JSON.stringify(u).includes("password"));
    },
  );
  await t.test(
    "aprobados persistentes, duplicados, permisos y créditos desde catálogo",
    async () => {
      const list = (await a.get("/api/catalogs")).body.courses;
      for (const c of list.slice(0, 2))
        await a
          .post(`/api/users/${userA}/approved-courses`)
          .send({ course_id: c.id })
          .expect(201);
      await a
        .post(`/api/users/${userA}/approved-courses`)
        .send({ course_id: list[0].id })
        .expect(409);
      await b
        .post(`/api/users/${userA}/approved-courses`)
        .send({ course_id: course.id })
        .expect(403);
      const u = (await b.get("/api/users/" + userA)).body;
      assert.equal(u.total_credits, list[0].credits + list[1].credits);
      assert.equal(u.courses.length, 2);
    },
  );
  await t.test(
    "catálogo DTT, créditos separados y recarga sin pérdida de datos",
    async () => {
      const before = (await a.get("/api/catalogs").expect(200)).body;
      const dtt = before.courses.filter((c) => c.publication_enabled);
      assert.equal(dtt.length, 34);
      assert.ok(
        dtt.every(
          (c) =>
            c.credits === null &&
            c.source === "https://dtt-ecys.org/resources?r=10",
        ),
      );
      assert.ok(dtt.some((c) => c.name === "Comunicación Asertiva"));
      assert.ok(
        dtt.some(
          (c) => c.name === "Introducción a los Algoritmos y Flujos de Datos",
        ),
      );
      const communication = dtt.find((c) => c.name === "Comunicación Asertiva");
      const assigned = before.assignments.filter(
        (x) => x.course_id === communication.id,
      );
      assert.equal(assigned.length, 2);
      assert.ok(
        assigned.every(
          (x) =>
            before.teachers.find((t) => t.id === x.teacher_id).role ===
            "auxiliar",
        ),
      );
      await a
        .post(`/api/users/${userA}/approved-courses`)
        .send({ course_id: communication.id })
        .expect(400);
      const profile = (await a.get("/api/users/" + userA)).body;
      const posts = (await a.get("/api/posts")).body;
      execFileSync(process.execPath, ["scripts/setup.js"], {
        cwd: new URL("..", import.meta.url),
        env: process.env,
      });
      execFileSync(process.execPath, ["scripts/seed.js"], {
        cwd: new URL("..", import.meta.url),
        env: process.env,
      });
      assert.deepEqual((await a.get("/api/catalogs")).body, before);
      assert.deepEqual((await a.get("/api/users/" + userA)).body, profile);
      assert.deepEqual((await a.get("/api/posts")).body, posts);
      const approvedOnly = before.courses.find((c) => c.credits !== null);
      await a
        .post("/api/posts")
        .send({ course_id: approvedOnly.id, message: "No disponible en DTT" })
        .expect(400);
    },
  );
  await t.test(
    "rechazo de origen ajeno y cierre de sesión invalidado en servidor",
    async () => {
      await a
        .post("/api/posts")
        .set("Origin", "https://ajeno.invalid")
        .send({ course_id: course.id, message: "x" })
        .expect(403);
      await b.post("/api/auth/logout").send({}).expect(200);
      await b.get("/api/auth/me").expect(401);
    },
  );
  await t.test(
    "recuperación académica y revocación de sesiones previas",
    async () => {
      await a
        .post("/api/auth/recover")
        .send({
          academic_record: recordA,
          email: "incorrecto@example.test",
          password: "Cambio2026!",
        })
        .expect(400);
      await request(app)
        .post("/api/auth/recover")
        .send({
          academic_record: recordA,
          email: `a${unique}@example.test`,
          password: "Cambio2026!",
        })
        .expect(200);
      await a.get("/api/auth/me").expect(401);
      await a
        .post("/api/auth/login")
        .send({ academic_record: recordA, password })
        .expect(401);
      await a
        .post("/api/auth/login")
        .send({ academic_record: recordA, password: "Cambio2026!" })
        .expect(200);
    },
  );
});

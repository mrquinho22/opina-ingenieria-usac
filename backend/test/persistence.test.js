import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
const env = { ...process.env, DB_NAME: "opina_test", PORT: "3101" };
const cwd = new URL("..", import.meta.url);
execFileSync(process.execPath, ["scripts/setup.js"], { cwd, env });
execFileSync(process.execPath, ["scripts/seed.js"], { cwd, env });
async function start() {
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd,
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(Error("El servidor no inició en 20 segundos"));
    }, 20000);
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Opina:")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(Error("Servidor terminó: " + code));
    });
  });
  return child;
}
async function stop(child) {
  await new Promise((resolve) => {
    child.once("exit", resolve);
    child.kill();
  });
}
test("sesión, publicación, comentario y créditos sobreviven reinicio real del proceso", async () => {
  let child = await start();
  try {
    const base = "http://127.0.0.1:3101/api";
    let cookie = "";
    async function call(path, method = "GET", body) {
      const r = await fetch(base + path, {
        method,
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: body ? JSON.stringify(body) : undefined,
      });
      assert.ok(r.ok, `${method} ${path}: ${r.status}`);
      return { body: await r.json(), cookie: r.headers.get("set-cookie") };
    }
    const record = "83" + Date.now();
    const user = (
      await call("/auth/register", "POST", {
        academic_record: record,
        first_name: "Persistencia",
        last_name: "Prueba",
        email: record + "@example.test",
        password: "Prueba2026!",
      })
    ).body;
    cookie = (
      await call("/auth/login", "POST", {
        academic_record: record,
        password: "Prueba2026!",
      })
    ).cookie.split(";")[0];
    const courses = (await call("/catalogs")).body.courses;
    const course = courses.find((c) => c.publication_enabled);
    const approved = courses.find((c) => c.credits !== null);
    const post = (
      await call("/posts", "POST", {
        course_id: course.id,
        message: "Persistencia tras reinicio",
      })
    ).body;
    await call(`/posts/${post.id}/comments`, "POST", {
      message: "Comentario persistente",
    });
    await call(`/users/${user.id}/approved-courses`, "POST", {
      course_id: approved.id,
    });
    await stop(child);
    child = await start();
    assert.equal((await call("/auth/me")).body.id, user.id);
    assert.equal((await call(`/posts/${post.id}`)).body.message, post.message);
    assert.equal(
      (await call(`/posts/${post.id}/comments`)).body[0].message,
      "Comentario persistente",
    );
    assert.equal(
      (await call(`/users/${user.id}`)).body.total_credits,
      approved.credits,
    );
  } finally {
    await stop(child);
  }
});

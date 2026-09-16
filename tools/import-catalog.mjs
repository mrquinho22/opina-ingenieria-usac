// Reproduce el catálogo desde las capturas versionadas, sin Internet.
// DTT-* son identificadores internos, no códigos oficiales ni equivalencias.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const root = new URL("../database/", import.meta.url);
const source = "https://dtt-ecys.org/resources?r=10";
const courses = JSON.parse(
  readFileSync(new URL("pensum-clar-2025.json", root), "utf8"),
);
for (const c of courses) c.publication_enabled = false;
const assignments = [],
  seen = new Set();
for (const line of readFileSync(new URL("dtt-2026-2.tsv", root), "utf8").split(
  /\r?\n/,
)) {
  if (!line || line.startsWith("#")) continue;
  const [name, section, professor, practitioners] = line.split("|");
  const code =
    "DTT-" + createHash("sha256").update(name).digest("hex").slice(0, 8);
  if (!seen.has(code)) {
    seen.add(code);
    courses.push({
      code,
      name,
      credits: null,
      publication_enabled: true,
      source,
    });
  }
  for (const [names, role] of [
    [professor, "catedratico"],
    [practitioners, "auxiliar"],
  ])
    for (const teacher of names
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      assignments.push({
        code,
        teacher,
        role,
        section,
        semester: "2026-2",
        source,
      });
}
if (
  seen.size < 25 ||
  new Set(courses.map((c) => c.code)).size !== courses.length
)
  throw Error("Captura incompleta o identificador duplicado");
const data = {
  captured_at: "2026-09-15",
  plan: "CLAR 2025",
  semester: "2026-2",
  sources: { pensum: courses[0].source, horarios: source },
  courses,
  assignments,
};
writeFileSync(
  new URL("catalog.json", root),
  JSON.stringify(data, null, 2) + "\n",
);
console.log(
  `${seen.size} cursos DTT, ${courses.length - seen.size} cursos CLAR, ${assignments.length} asignaciones.`,
);

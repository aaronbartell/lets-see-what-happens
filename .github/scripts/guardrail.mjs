// Fails if any changed file matches a protected path.
// Usage: node .github/scripts/guardrail.mjs <base-ref>
// Reads the pattern list from constitution/protected-paths.json.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "origin/main";
const { protected: patterns } = JSON.parse(
  readFileSync("constitution/protected-paths.json", "utf8"),
);

export function isProtected(file, list = patterns) {
  return list.some((p) =>
    p.endsWith("/**") ? file.startsWith(p.slice(0, -2)) : file === p,
  );
}

const diff = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
  encoding: "utf8",
});
const changed = diff.split("\n").filter(Boolean);
const violations = changed.filter((f) => isProtected(f));

if (violations.length > 0) {
  console.error("GUARDRAIL VIOLATION — protected paths modified:");
  for (const f of violations) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Guardrail OK: ${changed.length} changed file(s), none protected.`);

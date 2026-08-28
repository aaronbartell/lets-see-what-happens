// Independent, model-free enforcement of the constitution's protected paths
// and scope caps. This code ships in the worker image — the agent edits a
// throwaway clone and can never touch it.
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** Read the protected list from origin/main, NOT the working tree — the agent
 *  could have edited the working-tree copy (which is itself a violation). */
export function loadProtectedPatterns(cloneDir: string): string[] {
  const raw = git(cloneDir, [
    "show",
    "origin/main:constitution/protected-paths.json",
  ]);
  return JSON.parse(raw).protected as string[];
}

export function isProtectedPath(file: string, patterns: string[]): boolean {
  return patterns.some((p) =>
    p.endsWith("/**") ? file.startsWith(p.slice(0, -2)) : file === p,
  );
}

export type GuardrailResult = { ok: true } | { ok: false; reason: string };

export function checkClone(cloneDir: string): GuardrailResult {
  const patterns = loadProtectedPatterns(cloneDir);
  const changed = git(cloneDir, ["diff", "--name-only", "origin/main...HEAD"])
    .split("\n")
    .filter(Boolean);

  const violations = changed.filter((f) => isProtectedPath(f, patterns));
  if (violations.length > 0) {
    return {
      ok: false,
      reason: `Protected paths modified: ${violations.join(", ")}`,
    };
  }

  if (changed.length === 0) {
    return { ok: false, reason: "No changes were made." };
  }
  if (changed.length > config.maxChangedFiles) {
    return {
      ok: false,
      reason: `Too many files changed (${changed.length} > ${config.maxChangedFiles}).`,
    };
  }

  const stat = git(cloneDir, ["diff", "--shortstat", "origin/main...HEAD"]);
  const nums = [...stat.matchAll(/(\d+) (?:insertion|deletion)/g)].map((m) =>
    Number(m[1]),
  );
  const totalLines = nums.reduce((a, b) => a + b, 0);
  if (totalLines > config.maxChangedLines) {
    return {
      ok: false,
      reason: `Diff too large (${totalLines} lines > ${config.maxChangedLines}).`,
    };
  }

  for (const f of changed) {
    try {
      const size = statSync(join(cloneDir, f)).size;
      if (size > config.maxFileBytes) {
        return {
          ok: false,
          reason: `File too large: ${f} (${size} bytes > ${config.maxFileBytes}).`,
        };
      }
    } catch {
      // deleted file — size check not applicable
    }
  }

  return { ok: true };
}

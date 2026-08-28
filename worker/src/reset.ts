// The weekly reset: every Sunday 02:00 America/Chicago the public playground
// (routes under apps/web/app/ideas/ and the live registry) is wiped back to
// the seed. History survives — it lives in GitHub issues and /features.
// The reset ships as a normal PR through CI, same as any feature.
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { config } from "./config.js";
import { cloneUrl, getGitToken, getOctokit } from "./github.js";
import { mergeWhenGreen } from "./merge.js";
import { sh } from "./shell.js";

const TZ = "America/Chicago";
const SEASON_PATH = "apps/web/lib/season.json";
const IDEAS_DIR = "apps/web/app/ideas";
const SEED_SLUG = "hello-world";

const SEED_REGISTRY = `// The permanent log of features this app has grown THIS SEASON.
//
// The autonomous agent appends ONE entry here per shipped feature and never
// removes or edits existing entries (Constitution, Article IV). Newest last.
// Every Sunday at 2:00 AM Central the weekly reset wipes this back to the
// seed entry — the all-time history lives on /features via GitHub issues.

export type Feature = {
  slug: string; // route: /ideas/<slug>
  title: string;
  description: string;
  issue: number | null; // GitHub issue number (null for the seed feature)
  shippedAt: string; // YYYY-MM-DD
};

export const features: Feature[] = [
  {
    slug: "hello-world",
    title: "Hello, World",
    description:
      "The seed feature. Proof that the machine is alive and the /ideas playground works.",
    issue: null,
    shippedAt: "2026-08-27",
  },
];
`;

/** Most recent Sunday 02:00 America/Chicago, as a UTC Date. DST-correct. */
export function lastSundayBoundary(now: Date): Date {
  const wall = toZonedTime(now, TZ);
  const d = new Date(wall);
  d.setHours(2, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  let boundary = fromZonedTime(d, TZ);
  if (boundary.getTime() > now.getTime()) {
    d.setDate(d.getDate() - 7);
    boundary = fromZonedTime(d, TZ);
  }
  return boundary;
}

async function readSeasonStart(): Promise<Date> {
  const { owner, name } = config.repo;
  const res = await getOctokit().rest.repos.getContent({
    owner,
    repo: name,
    path: SEASON_PATH,
    ref: "main",
  });
  const data = res.data as { content?: string };
  if (!data.content) throw new Error(`${SEASON_PATH} has no content`);
  const parsed = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  return new Date(parsed.seasonStart);
}

/** Returns true if a reset PR was attempted. */
export async function maybeReset(): Promise<boolean> {
  const boundary = lastSundayBoundary(new Date());
  const seasonStart = await readSeasonStart();
  if (seasonStart.getTime() >= boundary.getTime()) return false;

  const stamp = boundary.toISOString().slice(0, 10);
  const branch = `reset/${stamp}`;
  console.log(`[reset] Season ended — resetting the playground (${branch})`);

  const token = await getGitToken();
  const cloneDir = mkdtempSync(join(tmpdir(), `reset-`));
  try {
    sh(tmpdir(), "git", ["clone", "--depth", "1", cloneUrl(token), cloneDir]);
    sh(cloneDir, "git", ["checkout", "-b", branch]);
    sh(cloneDir, "git", ["config", "user.name", "lets-see-what-happens[bot]"]);
    sh(cloneDir, "git", ["config", "user.email", "robot@users.noreply.github.com"]);

    // Wipe every idea except the seed (and the index page.tsx).
    const ideasPath = join(cloneDir, IDEAS_DIR);
    for (const entry of readdirSync(ideasPath, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== SEED_SLUG) {
        rmSync(join(ideasPath, entry.name), { recursive: true, force: true });
      }
    }
    writeFileSync(join(cloneDir, "apps/web/lib/feature-registry.ts"), SEED_REGISTRY);
    writeFileSync(
      join(cloneDir, SEASON_PATH),
      JSON.stringify({ seasonStart: boundary.toISOString() }, null, 2) + "\n",
    );

    sh(cloneDir, "git", ["add", "-A"]);
    sh(cloneDir, "git", ["commit", "-m", `chore: weekly reset (${stamp})`]);
    sh(cloneDir, "git", ["push", "-f", "origin", branch]);

    const { owner, name } = config.repo;
    const pr = await getOctokit().rest.pulls.create({
      owner,
      repo: name,
      head: branch,
      base: "main",
      title: `🧹 Weekly reset (${stamp})`,
      body: "The Sunday 2am Central reset: wiping this week's public features. The history stays on /features and in the issues.\n\n🤖 Automated by the build worker.",
    });

    const merge = await mergeWhenGreen(
      pr.data.number,
      pr.data.head.sha,
      branch,
    );
    if (merge.merged) {
      console.log(`[reset] Done — season now starts ${boundary.toISOString()}`);
    } else {
      console.log(`[reset] Reset PR did not merge: ${merge.reason} — will retry next loop`);
    }
    return true;
  } finally {
    rmSync(cloneDir, { recursive: true, force: true });
  }
}

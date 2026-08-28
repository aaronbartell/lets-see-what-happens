function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const repo = required("GITHUB_REPO");
const [owner, name] = repo.split("/");
if (!owner || !name) throw new Error("GITHUB_REPO must be owner/name");

export const config = {
  repo: { owner, name, full: repo },
  agentModel: process.env.AGENT_MODEL ?? "claude-opus-5",
  maxCostPerIssueUsd: Number(process.env.MAX_COST_PER_ISSUE_USD ?? 10),
  maxBuildsPerDay: Number(process.env.MAX_BUILDS_PER_DAY ?? 10),
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 60_000),
  maxTurns: Number(process.env.MAX_AGENT_TURNS ?? 80),
  repairRounds: 2,
  ciTimeoutMs: 15 * 60_000,
  staleBuildingMs: 2 * 60 * 60_000,
  // Scope caps from the constitution, Article IV
  maxChangedFiles: 40,
  maxChangedLines: 3000,
  maxFileBytes: 500 * 1024,
};

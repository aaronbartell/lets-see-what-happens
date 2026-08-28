// Wait for CI on the PR, then squash-merge (green) or close (red).
import { config } from "./config.js";
import { getOctokit } from "./github.js";

const { owner, name } = config.repo;

type CiOutcome = "success" | "failure" | "timeout";

async function waitForChecks(headSha: string): Promise<CiOutcome> {
  const octokit = getOctokit();
  const deadline = Date.now() + config.ciTimeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 30_000));
    const res = await octokit.rest.checks.listForRef({
      owner,
      repo: name,
      ref: headSha,
      per_page: 50,
    });
    const runs = res.data.check_runs;
    if (runs.length === 0) continue; // CI hasn't started yet
    if (runs.some((r) => r.status !== "completed")) continue;
    const allGreen = runs.every(
      (r) => r.conclusion === "success" || r.conclusion === "skipped",
    );
    return allGreen ? "success" : "failure";
  }
  return "timeout";
}

export type MergeResult =
  | { merged: true }
  | { merged: false; reason: string };

export async function mergeWhenGreen(
  prNumber: number,
  headSha: string,
  branch: string,
): Promise<MergeResult> {
  const octokit = getOctokit();
  const outcome = await waitForChecks(headSha);

  if (outcome === "success") {
    try {
      await octokit.rest.pulls.merge({
        owner,
        repo: name,
        pull_number: prNumber,
        merge_method: "squash",
      });
      return { merged: true };
    } catch (err) {
      return {
        merged: false,
        reason: `CI was green but the merge failed: ${(err as Error).message}`,
      };
    }
  }

  // Red or timed out: close the PR and delete the branch.
  const reason =
    outcome === "failure"
      ? "CI checks failed."
      : "CI did not finish within 15 minutes.";
  try {
    await octokit.rest.pulls.update({
      owner,
      repo: name,
      pull_number: prNumber,
      state: "closed",
    });
    await octokit.rest.git.deleteRef({
      owner,
      repo: name,
      ref: `heads/${branch}`,
    });
  } catch {
    // best-effort cleanup
  }
  return { merged: false, reason };
}

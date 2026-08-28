// The poll loop: pick one approved issue at a time, build it, merge it,
// report back on the issue. GitHub labels are the whole state machine:
// approved -> building -> shipped | failed
import { config } from "./config.js";
import {
  comment,
  countBuildsToday,
  listIssuesWithLabel,
  swapLabel,
} from "./github.js";
import { buildFeature } from "./build-feature.js";
import { mergeWhenGreen } from "./merge.js";

const SITE_URL = process.env.SITE_URL ?? "";

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

/** Issues stuck in `building` (worker crashed mid-build) go back to the queue. */
async function recoverStaleBuilds() {
  const building = await listIssuesWithLabel("building");
  for (const issue of building) {
    const age = Date.now() - new Date(issue.updatedAt).getTime();
    if (age > config.staleBuildingMs) {
      log(`Recovering stale build on issue #${issue.number}`);
      await swapLabel(issue.number, "building", "approved");
      await comment(
        issue.number,
        "🤖 My previous attempt was interrupted. Back in the queue.",
      );
    }
  }
}

async function processOne(): Promise<void> {
  const builds = await countBuildsToday();
  if (builds >= config.maxBuildsPerDay) {
    log(`Daily build cap reached (${builds}/${config.maxBuildsPerDay}); sleeping.`);
    return;
  }

  const queue = await listIssuesWithLabel("approved");
  const issue = queue[0];
  if (!issue) return;

  log(`Building issue #${issue.number}: ${issue.title}`);
  await swapLabel(issue.number, "approved", "building");
  await comment(issue.number, "🤖 On it. Cloning the repo and getting to work…");

  const result = await buildFeature(issue);
  if (!result.ok) {
    log(`Issue #${issue.number} failed: ${result.reason.slice(0, 200)}`);
    await swapLabel(issue.number, "building", "failed");
    await comment(
      issue.number,
      `💥 I couldn't ship this one.\n\n${result.reason}\n\n_(spent ~$${result.costUsd.toFixed(2)})_`,
    );
    return;
  }

  await comment(
    issue.number,
    `🔀 Opened ${result.prUrl} — waiting for CI to go green.`,
  );
  const merge = await mergeWhenGreen(result.prNumber, result.headSha, result.branch);

  if (merge.merged) {
    await swapLabel(issue.number, "building", "shipped");
    const liveUrl = SITE_URL ? `${SITE_URL}/ideas/${result.slug}` : `/ideas/${result.slug}`;
    await comment(
      issue.number,
      `🚀 Shipped! Merged ${result.prUrl}.\n\nIt'll be live at ${liveUrl} as soon as the deploy finishes.\n\n_(build cost ~$${result.costUsd.toFixed(2)})_`,
    );
    log(`Issue #${issue.number} shipped.`);
  } else {
    await swapLabel(issue.number, "building", "failed");
    await comment(
      issue.number,
      `💥 The PR didn't make it: ${merge.reason} (${result.prUrl})`,
    );
    log(`Issue #${issue.number} failed at merge: ${merge.reason}`);
  }
}

async function main() {
  log(
    `Worker up. repo=${config.repo.full} model=${config.agentModel} ` +
      `caps: $${config.maxCostPerIssueUsd}/issue, ${config.maxBuildsPerDay} builds/day`,
  );
  await recoverStaleBuilds().catch((e) => log(`recover failed: ${e.message}`));
  // Sequential forever-loop: one build at a time, by design.
  for (;;) {
    try {
      await processOne();
    } catch (err) {
      log(`Loop error: ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, config.pollIntervalMs));
  }
}

main();

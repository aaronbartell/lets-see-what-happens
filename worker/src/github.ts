import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { config } from "./config.js";

const { owner, name } = config.repo;

function appCreds() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  if (appId && privateKey && installationId) {
    return { appId, privateKey, installationId };
  }
  return null;
}

export function getOctokit(): Octokit {
  const creds = appCreds();
  if (creds) {
    return new Octokit({ authStrategy: createAppAuth, auth: creds });
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Set GITHUB_APP_* env vars or GITHUB_TOKEN");
  }
  return new Octokit({ auth: token });
}

/** Token usable in a git clone/push URL. */
export async function getGitToken(): Promise<string> {
  const creds = appCreds();
  if (creds) {
    const auth = createAppAuth(creds);
    const { token } = await auth({ type: "installation" });
    return token;
  }
  return process.env.GITHUB_TOKEN!;
}

export function cloneUrl(token: string): string {
  return `https://x-access-token:${token}@github.com/${owner}/${name}.git`;
}

export async function comment(issueNumber: number, body: string) {
  await getOctokit().rest.issues.createComment({
    owner,
    repo: name,
    issue_number: issueNumber,
    body,
  });
}

export async function swapLabel(
  issueNumber: number,
  remove: string,
  add: string,
) {
  const octokit = getOctokit();
  try {
    await octokit.rest.issues.removeLabel({
      owner,
      repo: name,
      issue_number: issueNumber,
      name: remove,
    });
  } catch {
    // label may already be gone — fine
  }
  await octokit.rest.issues.addLabels({
    owner,
    repo: name,
    issue_number: issueNumber,
    labels: [add],
  });
}

export type WorkIssue = {
  number: number;
  title: string;
  body: string;
  updatedAt: string;
};

export async function listIssuesWithLabel(
  label: string,
  state: "open" | "closed" | "all" = "open",
): Promise<WorkIssue[]> {
  const res = await getOctokit().rest.issues.listForRepo({
    owner,
    repo: name,
    labels: `request,${label}`,
    state,
    sort: "created",
    direction: "asc",
    per_page: 100,
  });
  return res.data
    .filter((i) => !i.pull_request)
    .map((i) => ({
      number: i.number,
      title: i.title,
      body: i.body ?? "",
      updatedAt: i.updated_at,
    }));
}

export async function countBuildsToday(): Promise<number> {
  const octokit = getOctokit();
  const today = new Date().toISOString().slice(0, 10);
  let total = 0;
  for (const label of ["building", "shipped", "failed"]) {
    const res = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${name} is:issue label:request label:${label} updated:>=${today}`,
      per_page: 1,
    });
    total += res.data.total_count;
  }
  return total;
}

export async function openPullRequest(input: {
  branch: string;
  title: string;
  issueNumber: number;
}): Promise<{ number: number; url: string; headSha: string }> {
  const octokit = getOctokit();
  const res = await octokit.rest.pulls.create({
    owner,
    repo: name,
    head: input.branch,
    base: "main",
    title: input.title,
    body: `Closes #${input.issueNumber}\n\n🤖 Implemented autonomously by the build worker.`,
  });
  return {
    number: res.data.number,
    url: res.data.html_url,
    headSha: res.data.head.sha,
  };
}

// The request status board: what the robot is thinking about, building,
// has shipped, or gave up on. Rendered straight from GitHub issue labels.
import { isGitHubConfigured, listRequestIssues, type RequestIssue } from "@/lib/github";

export const revalidate = 30;
export const metadata = { title: "Status — Let's See What Happens" };

const COLUMNS: { state: RequestIssue["state"]; label: string; hint: string }[] = [
  { state: "approved", label: "⏳ Queued", hint: "Waiting for the robot" },
  { state: "building", label: "🔨 Building", hint: "The robot is typing" },
  { state: "shipped", label: "🚀 Shipped", hint: "Live on this site" },
  { state: "failed", label: "💥 Failed", hint: "The robot gave up" },
];

export default async function StatusPage() {
  if (!isGitHubConfigured()) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status board</h1>
        <p className="text-zinc-500 mt-2">
          The machine isn&apos;t wired to GitHub yet. Nothing to see here.
        </p>
      </div>
    );
  }

  let issues: RequestIssue[] = [];
  let error = false;
  try {
    issues = await listRequestIssues();
  } catch {
    error = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status board</h1>
        <p className="text-zinc-500 mt-2">
          Every request the robot has accepted, and where it is in the pipeline.
        </p>
      </div>
      {error ? (
        <p className="text-zinc-500">GitHub isn&apos;t answering right now. Refresh in a minute.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {COLUMNS.map((col) => {
            const items = issues.filter((i) => i.state === col.state);
            return (
              <div
                key={col.state}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
              >
                <p className="font-semibold">{col.label}</p>
                <p className="text-xs text-zinc-500 mb-3">{col.hint}</p>
                {items.length === 0 ? (
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">Nothing here.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {items.map((i) => (
                      <li key={i.number}>
                        <a
                          href={i.url}
                          className="text-sm hover:text-fuchsia-500"
                          target="_blank"
                          rel="noreferrer"
                        >
                          #{i.number} {i.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

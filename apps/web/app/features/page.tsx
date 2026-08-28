// PROTECTED FILE — see constitution/protected-paths.json
// Constitution, Article I: the permanent log of implemented features.
// Rendered from GitHub issues (which survive the weekly reset), with the
// live registry deciding which entries still have a working page.
import Link from "next/link";
import { features } from "@/lib/feature-registry";
import {
  isGitHubConfigured,
  listShippedFeatures,
  type ShippedFeature,
} from "@/lib/github";

export const revalidate = 60;
export const metadata = { title: "Features — Let's See What Happens" };

export default async function FeaturesPage() {
  const liveSlugs = new Set(features.map((f) => f.slug));

  let history: ShippedFeature[] = [];
  let historyAvailable = isGitHubConfigured();
  if (historyAvailable) {
    try {
      history = await listShippedFeatures();
    } catch {
      historyAvailable = false;
    }
  }
  const seed = features.find((f) => f.issue === null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">The feature log</h1>
        <p className="text-zinc-500 mt-2">
          Everything the robot has ever shipped, newest first. Features live for
          one week — the app resets every Sunday at 2am Central — but this log
          is forever.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {history.map((f) => {
          const live = f.slug !== null && liveSlugs.has(f.slug);
          return (
            <li
              key={f.number}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {live ? (
                  <Link
                    href={`/ideas/${f.slug}`}
                    className="font-semibold hover:text-fuchsia-500"
                  >
                    {f.title}
                  </Link>
                ) : (
                  <span className="font-semibold">{f.title}</span>
                )}
                <span className="text-xs text-zinc-500">
                  {f.shippedAt.slice(0, 10)}
                </span>
              </div>
              <div className="flex gap-4 mt-3 text-xs items-center">
                {live ? (
                  <Link
                    href={`/ideas/${f.slug}`}
                    className="text-fuchsia-500 hover:underline"
                  >
                    Try it
                  </Link>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600">
                    🧹 retired in a weekly reset
                  </span>
                )}
                <a href={f.url} className="text-zinc-500 hover:underline">
                  Issue #{f.number}
                </a>
              </div>
            </li>
          );
        })}
        {seed && (
          <li className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                href={`/ideas/${seed.slug}`}
                className="font-semibold hover:text-fuchsia-500"
              >
                {seed.title}
              </Link>
              <span className="text-xs text-zinc-500">{seed.shippedAt}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">{seed.description}</p>
            <div className="flex gap-4 mt-3 text-xs">
              <Link
                href={`/ideas/${seed.slug}`}
                className="text-fuchsia-500 hover:underline"
              >
                Try it
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">
                survives every reset
              </span>
            </div>
          </li>
        )}
      </ul>
      {!historyAvailable && (
        <p className="text-sm text-zinc-500">
          (GitHub isn&apos;t reachable right now, so only this season&apos;s
          features are shown.)
        </p>
      )}
    </div>
  );
}

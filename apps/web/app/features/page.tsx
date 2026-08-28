// PROTECTED FILE — see constitution/protected-paths.json
// Constitution, Article I: the permanent log of implemented features.
import Link from "next/link";
import { features } from "@/lib/feature-registry";

const REPO_URL = `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO ?? "aaronbartell/lets-see-what-happens"}`;

export const metadata = { title: "Features — Let's See What Happens" };

export default function FeaturesPage() {
  const log = [...features].reverse();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">The feature log</h1>
        <p className="text-zinc-500 mt-2">
          Every feature this app has grown, newest first. This log is permanent
          — the robot is constitutionally forbidden from deleting anything here.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {log.map((f) => (
          <li
            key={f.slug}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                href={`/ideas/${f.slug}`}
                className="font-semibold hover:text-fuchsia-500"
              >
                {f.title}
              </Link>
              <span className="text-xs text-zinc-500">{f.shippedAt}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">{f.description}</p>
            <div className="flex gap-4 mt-3 text-xs">
              <Link href={`/ideas/${f.slug}`} className="text-fuchsia-500 hover:underline">
                Try it
              </Link>
              {f.issue !== null && (
                <a
                  href={`${REPO_URL}/issues/${f.issue}`}
                  className="text-zinc-500 hover:underline"
                >
                  Issue #{f.issue}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

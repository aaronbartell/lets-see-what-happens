// Index of the agent's playground: every shipped idea lives at /ideas/<slug>.
import Link from "next/link";
import { features } from "@/lib/feature-registry";

export const metadata = { title: "Ideas — Let's See What Happens" };

export default function IdeasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">The playground</h1>
        <p className="text-zinc-500 mt-2">
          This week&apos;s ideas, ready to try — until the reset on Sunday at
          2am Central sweeps them away.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {[...features].reverse().map((f) => (
          <li key={f.slug}>
            <Link
              href={`/ideas/${f.slug}`}
              className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-fuchsia-500 transition-colors h-full"
            >
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-zinc-500 mt-1">{f.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

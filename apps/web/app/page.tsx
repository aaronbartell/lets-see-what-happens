// PROTECTED FILE — see constitution/protected-paths.json
// The home page hosts the constitutionally-guaranteed request form.
import Link from "next/link";
import { FeatureRequestForm } from "@/components/FeatureRequestForm";
import { features } from "@/lib/feature-registry";

export default function Home() {
  const recent = [...features].reverse().slice(0, 3);
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          This app builds{" "}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            itself
          </span>
          .
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Describe a feature. A robot will triage it, write the code, open a
          pull request, merge it, and ship it — no humans involved. Let&apos;s
          see what happens.
        </p>
        <p className="text-sm text-zinc-500">
          ⏳ Nothing lasts: every Sunday at 2am Central the playground resets
          and the public&apos;s features are wiped. The{" "}
          <Link href="/features" className="underline hover:text-fuchsia-500">
            history
          </Link>{" "}
          is forever, though.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Request a feature</h2>
        <FeatureRequestForm />
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-sm">
        {[
          ["1. You ask", "Your request becomes a GitHub issue with a best-guess spec — if it passes moderation."],
          ["2. Robot builds", "An autonomous agent writes the code and opens a PR. Guardrails keep it from touching the important bits."],
          ["3. It ships", "Green CI merges automatically and the feature goes live on this very site."],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <p className="font-semibold mb-1">{title}</p>
            <p className="text-zinc-500">{body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Recently shipped</h2>
          <Link href="/features" className="text-sm text-fuchsia-500 hover:underline">
            Full log →
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {recent.map((f) => (
            <li key={f.slug}>
              <Link
                href={`/ideas/${f.slug}`}
                className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-fuchsia-500 transition-colors"
              >
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-zinc-500">{f.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

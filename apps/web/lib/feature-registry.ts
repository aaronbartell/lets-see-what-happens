// The permanent log of features this app has grown THIS SEASON.
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

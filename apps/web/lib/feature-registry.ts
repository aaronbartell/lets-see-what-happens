// The permanent log of features this app has grown.
//
// The autonomous agent appends ONE entry here per shipped feature and never
// removes or edits existing entries (Constitution, Article IV). Newest last.

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

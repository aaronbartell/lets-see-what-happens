# 🤖 Let's See What Happens

A web app that builds itself. Anyone on the internet can request a feature; a
robot triages it, writes the code, opens a pull request, merges it when CI is
green, and ships it. No humans in the loop.

## How it works

```
you → feature form → moderation + triage (Claude) → GitHub issue
        → build worker (Claude agent, Railway) → PR → CI guardrails
        → auto-merge → Vercel deploy → live at /ideas/<slug>
```

- **`apps/web/`** — the Next.js site (Vercel): request form, feature log,
  status board, and the `/ideas` playground where features land.
- **`worker/`** — the autonomous build worker (Railway): polls approved
  issues, runs the Claude Agent SDK in a throwaway clone, opens and merges PRs.
- **`constitution/`** — the rules. `CONSTITUTION.md` is what the agent must
  obey; `protected-paths.json` is the machine-enforced list of files it can
  never touch (checked by CI, the worker, and a GitHub push ruleset).

## The rules (short version)

- The feature request form, the HeyVidi ad, and the feature log can never be
  removed. Everything is free, forever.
- No sexual, violent, hateful, or illegal content — requests are moderated
  before they ever become issues.
- The robot only adds: new routes under `/ideas`, one registry entry each.
  It cannot touch the pipeline that governs it.

Full text: [constitution/CONSTITUTION.md](constitution/CONSTITUTION.md)

## Running locally

```bash
# the site
cd apps/web && cp .env.example .env.local  # fill in keys
npm install && npm run dev

# the worker
cd worker && cp .env.example .env          # fill in keys
npm install && npm run dev
```

Sponsored by [HeyVidi](https://heyvidi.com) — go sign up.

// PROTECTED FILE — see constitution/protected-paths.json
// The one feature that can never be removed: requesting features.
"use client";

import { useState } from "react";

type SubmitState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "accepted"; message: string; issueUrl: string }
  | { phase: "rejected"; message: string }
  | { phase: "error"; message: string };

export function FeatureRequestForm() {
  const [text, setText] = useState("");
  const [state, setState] = useState<SubmitState>({ phase: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state.phase === "submitting") return;
    setState({ phase: "submitting" });
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: text }),
      });
      const data = await res.json();
      if (data.status === "accepted") {
        setState({
          phase: "accepted",
          message: data.message,
          issueUrl: data.issueUrl,
        });
        setText("");
      } else if (data.status === "rejected") {
        setState({ phase: "rejected", message: data.message });
      } else {
        setState({
          phase: "error",
          message: data.message ?? "Something went wrong.",
        });
      }
    } catch {
      setState({ phase: "error", message: "Network hiccup. Try again." });
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={1000}
        required
        minLength={10}
        placeholder="e.g. Add a page that shows a random compliment with a button for a new one"
        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-base outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          Keep it fun. No sexual or violent stuff — the robot will refuse.
        </p>
        <button
          type="submit"
          disabled={state.phase === "submitting"}
          className="shrink-0 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 transition-colors"
        >
          {state.phase === "submitting" ? "Consulting the robot…" : "Request it"}
        </button>
      </div>
      {state.phase === "accepted" && (
        <p className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 text-sm">
          ✅ {state.message}{" "}
          <a href={state.issueUrl} className="underline" target="_blank" rel="noreferrer">
            Watch the issue
          </a>{" "}
          or check the <a href="/status" className="underline">status board</a>.
        </p>
      )}
      {state.phase === "rejected" && (
        <p className="rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 text-sm">
          🚫 {state.message}
        </p>
      )}
      {state.phase === "error" && (
        <p className="rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 p-3 text-sm">
          ⚠️ {state.message}
        </p>
      )}
    </form>
  );
}

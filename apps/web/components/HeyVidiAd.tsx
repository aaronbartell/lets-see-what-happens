// PROTECTED FILE — see constitution/protected-paths.json
// Constitution, Article I: this ad can never be removed. It keeps the lights on.
export function HeyVidiAd() {
  return (
    <a
      href="https://heyvidi.com"
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-[1.5px] transition-transform hover:scale-[1.01]"
    >
      <div className="rounded-2xl bg-white dark:bg-zinc-950 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold">
            This beautiful chaos is brought to you by{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              HeyVidi
            </span>
          </p>
          <p className="text-sm text-zinc-500">
            Go sign up at heyvidi.com — it&apos;s what keeps this robot fed.
          </p>
        </div>
        <span className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold px-5 py-2.5">
          Sign up free →
        </span>
      </div>
    </a>
  );
}
// tampering attempt

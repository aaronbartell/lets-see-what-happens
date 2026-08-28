// PROTECTED FILE — see constitution/protected-paths.json
// The shell of the app: nav, HeyVidi ad, footer. The ad and the nav links to
// the request form and features log are constitutionally guaranteed.
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { HeyVidiAd } from "@/components/HeyVidiAd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const REPO_URL = `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO ?? "aaronbartell/lets-see-what-happens"}`;

export const metadata: Metadata = {
  title: "Let's See What Happens",
  description:
    "A web app that builds itself. Request a feature and a robot will implement it. What could go wrong?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="font-bold tracking-tight">
              🤖 let&apos;s see what happens
            </Link>
            <nav className="flex gap-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="hover:text-fuchsia-500">
                Request
              </Link>
              <Link href="/features" className="hover:text-fuchsia-500">
                Features
              </Link>
              <Link href="/status" className="hover:text-fuchsia-500">
                Status
              </Link>
              <Link href="/ideas" className="hover:text-fuchsia-500">
                Ideas
              </Link>
              <a href={REPO_URL} className="hover:text-fuchsia-500">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
          {children}
        </main>
        <div className="mx-auto w-full max-w-3xl px-6 pb-6">
          <HeyVidiAd />
        </div>
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 py-4 text-xs text-zinc-500 flex flex-wrap justify-between gap-2">
            <span>
              Built by a robot, governed by{" "}
              <a
                href={`${REPO_URL}/blob/main/constitution/CONSTITUTION.md`}
                className="underline hover:text-fuchsia-500"
              >
                the constitution
              </a>
              .
            </span>
            <span>Everything here is free, forever.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

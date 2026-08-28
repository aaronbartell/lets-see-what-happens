// PROTECTED FILE — see constitution/protected-paths.json
// The submission pipeline. Every step fails closed:
// bot check -> validation -> daily cap -> moderation/triage -> GitHub issue.
import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { z } from "zod";
import { triageRequest } from "@/lib/triage";
import {
  countRequestsCreatedToday,
  createFeatureIssue,
  isGitHubConfigured,
} from "@/lib/github";

export const runtime = "nodejs";

const BodySchema = z.object({
  request: z
    .string()
    .trim()
    .min(10, "Give the robot at least 10 characters to work with.")
    .max(1000, "Keep it under 1,000 characters — the robot has a short attention span."),
});

const MAX_ISSUES_PER_DAY = Number(process.env.MAX_ISSUES_PER_DAY ?? 10);

export async function POST(req: Request) {
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json(
        { status: "rejected", message: "Bots requesting features from a bot? No." },
        { status: 403 },
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "rejected",
          message: parsed.error.issues[0]?.message ?? "That request didn't parse.",
        },
        { status: 400 },
      );
    }

    if (!isGitHubConfigured()) {
      return NextResponse.json(
        {
          status: "error",
          message: "The machine isn't wired to GitHub yet. Try again later.",
        },
        { status: 503 },
      );
    }

    const todayCount = await countRequestsCreatedToday();
    if (todayCount >= MAX_ISSUES_PER_DAY) {
      return NextResponse.json(
        {
          status: "rejected",
          message: `The robot is tired today (${MAX_ISSUES_PER_DAY} requests already). Come back tomorrow.`,
        },
        { status: 429 },
      );
    }

    const triage = await triageRequest(parsed.data.request);
    if (triage.verdict === "rejected") {
      return NextResponse.json({
        status: "rejected",
        message: triage.public_message,
      });
    }

    const issue = await createFeatureIssue({
      title: triage.title,
      spec: triage.spec,
      slug: triage.slug,
      originalRequest: parsed.data.request,
    });

    return NextResponse.json({
      status: "accepted",
      message: triage.public_message,
      issueUrl: issue.url,
      issueNumber: issue.number,
    });
  } catch (err) {
    console.error("submit failed:", err);
    return NextResponse.json(
      { status: "error", message: "Something in the machine sparked. Try again." },
      { status: 500 },
    );
  }
}

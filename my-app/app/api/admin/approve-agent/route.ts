import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const approveAgentSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  approved: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = approveAgentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { agentId, approved } = parsed.data;

    // Update user profile document
    await adminDb.collection("users").doc(agentId).set(
      {
        approved,
        verified: approved,
        rejected: !approved,
      },
      { merge: true }
    );

    // Update agent document
    await adminDb.collection("agents").doc(agentId).set(
      {
        approved,
        verified: approved,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `Agent ${agentId} status updated to ${approved ? "Approved" : "Rejected"}`,
    });
  } catch (err: any) {
    console.error("Admin approve agent API error:", err);
    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 }
    );
  }
}

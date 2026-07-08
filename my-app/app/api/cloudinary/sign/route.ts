import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder: return dummy signature info
  return NextResponse.json({ ok: true, signature: "signed-placeholder" });
}

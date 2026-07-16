import { NextResponse } from "next/server";

/**
 * /api/seed — DISABLED
 *
 * This seed endpoint was used during development to pre-populate Firestore
 * with mock data. Now that the platform is production-ready and all data
 * is written by real agents and students via the app, this route is no
 * longer needed and has been disabled to prevent accidental data pollution.
 *
 * To add lodges: agents must sign up, get verified, and create listings.
 * To add users: students/agents must register via /auth.
 */
export async function GET() {
  return NextResponse.json(
    {
      message:
        "Seed endpoint is disabled. All data is now written by real users via the CampusHub app.",
      status: "disabled",
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Seed endpoint is disabled. All data is now written by real users via the CampusHub app.",
      status: "disabled",
    },
    { status: 410 }
  );
}

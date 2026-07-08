import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { public_id } = await request.json();
    // TODO: call Cloudinary SDK to destroy
    return NextResponse.json({ ok: true, deleted: public_id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

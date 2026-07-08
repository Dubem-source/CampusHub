import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactFrom = process.env.CONTACT_FROM_EMAIL ?? "CampusHub <onboarding@resend.dev>";
const contactTo = process.env.CONTACT_TO_EMAIL ?? "hello@campushub.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "All contact fields are required." },
        { status: 400 },
      );
    }

    if (!resendApiKey) {
      return NextResponse.json({
        ok: true,
        message: "Message received. Email service will be connected later.",
      });
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: contactFrom,
      to: contactTo,
      replyTo: email,
      subject: `CampusHub contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New CampusHub contact submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      message: "Message sent successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

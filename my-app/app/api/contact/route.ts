import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resendApiKey = process.env.RESEND_API_KEY;
const contactFrom = process.env.CONTACT_FROM_EMAIL ?? "CampusHub <onboarding@resend.dev>";
const contactTo = process.env.CONTACT_TO_EMAIL ?? "hello@campushub.com";

// In-memory rate limiting store (max 5 requests per IP per minute)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const contactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject is too short"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    // Basic IP rate limiting
    const ip = request.headers.get("x-forwarded-for") || "global-client";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > 60000) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count += 1;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > 5) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a minute before sending another message." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

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

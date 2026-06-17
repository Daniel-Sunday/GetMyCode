import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email, sessionId } = await request.json();

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: "Email and Session ID are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // 1. Check if unclaimed attendee exists for session + email
    const { data: attendee, error: attendeeError } = await supabase
      .from("attendees")
      .select("id")
      .eq("email", trimmedEmail)
      .eq("session_id", sessionId)
      .eq("is_claimed", false)
      .maybeSingle();

    if (attendeeError) {
      return NextResponse.json(
        { error: `Database error: ${attendeeError.message}` },
        { status: 500 }
      );
    }

    if (!attendee) {
      return NextResponse.json(
        { error: "Email not found in this session or code already claimed" },
        { status: 404 }
      );
    }

    // 2. Generate a random 6-digit numeric token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // 3. Delete existing unused OTP rows for this email + session_id combo
    await supabase
      .from("otp_tokens")
      .delete()
      .eq("email", trimmedEmail)
      .eq("session_id", sessionId)
      .eq("used", false);

    // 4. Insert new OTP row
    const { error: insertError } = await supabase
      .from("otp_tokens")
      .insert({
        email: trimmedEmail,
        session_id: sessionId,
        token,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to generate OTP: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 5. Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "Email service configuration error." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: "GetCode Verification <onboarding@resend.dev>",
      to: trimmedEmail,
      subject: "Your Attendance Verification Code",
      html: `
        <div style="font-family: 'Poppins', sans-serif, Arial; background-color: #fffdf0; padding: 32px; border-radius: 16px; border: 1px solid rgba(40, 92, 204, 0.2); max-width: 480px; margin: 0 auto; color: #0f1f4b;">
          <h2 style="color: #285ccc; font-weight: 700; margin-bottom: 16px;">GetCode Verification</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Your 6-digit verification code is:</p>
          <div style="background-color: #fff2bd; border: 2px dashed rgba(40, 92, 204, 0.4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; tracking: 0.1em; color: #285ccc; font-family: monospace;">${token}</span>
          </div>
          <p style="font-size: 14px; color: rgba(15, 31, 75, 0.7); margin-bottom: 8px;">This code is valid for 10 minutes and can only be used once.</p>
          <p style="font-size: 12px; color: rgba(15, 31, 75, 0.5);">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: `Failed to send email: ${emailError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

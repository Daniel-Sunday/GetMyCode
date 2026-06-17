import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, sessionId, token } = await request.json();

    if (!email || !sessionId || !token) {
      return NextResponse.json(
        { error: "Email, Session ID, and Token are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedToken = token.trim();
    const supabase = createAdminClient();

    // 1. Find the active, unused, unexpired OTP token row
    const { data: otpRow, error: otpError } = await supabase
      .from("otp_tokens")
      .select("id")
      .eq("email", trimmedEmail)
      .eq("session_id", sessionId)
      .eq("token", trimmedToken)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      return NextResponse.json(
        { error: `Database error: ${otpError.message}` },
        { status: 500 }
      );
    }

    if (!otpRow) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // 2. Mark the OTP row as used = true
    const { error: updateError } = await supabase
      .from("otp_tokens")
      .update({ used: true })
      .eq("id", otpRow.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update OTP status: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 3. Fetch the attendee's code from the attendees table
    const { data: attendee, error: attendeeError } = await supabase
      .from("attendees")
      .select("code")
      .eq("email", trimmedEmail)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (attendeeError) {
      return NextResponse.json(
        { error: `Failed to retrieve code: ${attendeeError.message}` },
        { status: 500 }
      );
    }

    if (!attendee) {
      return NextResponse.json(
        { error: "Attendee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      attendanceCode: attendee.code,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

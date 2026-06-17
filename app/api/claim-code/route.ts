import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    // Set is_claimed = true on the attendee row
    const { error } = await supabase
      .from("attendees")
      .update({ is_claimed: true })
      .eq("email", trimmedEmail)
      .eq("session_id", sessionId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to claim code: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Claim code error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

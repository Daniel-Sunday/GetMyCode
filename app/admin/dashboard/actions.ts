"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface ParsedAttendee {
  email: string;
  code: string;
}

interface AttendeeDB {
  id: string;
  is_claimed: boolean;
}

interface SessionDB {
  id: string;
  name: string;
  created_at: string;
  attendees: AttendeeDB[];
}

export async function uploadSession(sessionName: string, rawData: string) {
  try {
    // 1. Session Name Validation
    if (!sessionName.trim()) {
      return { success: false, error: "Session name must not be empty" };
    }

    // 2. CSV Parsing
    const lines = rawData.split(/\r?\n/);
    const parsedAttendees: ParsedAttendee[] = [];
    let headerFound = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmedLine = rawLine.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;

      // Validate and skip header
      if (!headerFound) {
        if (trimmedLine.toLowerCase() !== "email,code") {
          return {
            success: false,
            error: "First line must be the header row (email,code)",
          };
        }
        headerFound = true;
        continue;
      }

      // Parse attendee row (split by the first comma only)
      const commaIndex = trimmedLine.indexOf(",");
      if (commaIndex === -1) {
        return {
          success: false,
          error: `Invalid format on line ${i + 1}. Each line must be: email,code`,
        };
      }

      const email = trimmedLine.substring(0, commaIndex).trim();
      const code = trimmedLine.substring(commaIndex + 1).trim();

      if (!email || !code) {
        return {
          success: false,
          error: `Invalid format on line ${i + 1}. Each line must be: email,code`,
        };
      }

      parsedAttendees.push({ email, code });
    }

    // 3. Validation: Row Count
    if (parsedAttendees.length === 0) {
      return {
        success: false,
        error: "Must have at least 1 valid attendee row",
      };
    }

    // 4. Validation: Duplicate Emails in the same paste
    const emailSet = new Set<string>();
    for (const attendee of parsedAttendees) {
      if (emailSet.has(attendee.email)) {
        return {
          success: false,
          error: `Duplicate email found in paste: ${attendee.email}`,
        };
      }
      emailSet.add(attendee.email);
    }

    // 5. Validation: Duplicate Codes in the same paste
    const codeSet = new Set<string>();
    for (const attendee of parsedAttendees) {
      if (codeSet.has(attendee.code)) {
        return {
          success: false,
          error: `Duplicate code found in paste: ${attendee.code}`,
        };
      }
      codeSet.add(attendee.code);
    }

    // 6. Supabase Transaction using Admin Client (Service Role)
    const supabase = createAdminClient();

    // Insert new session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({ name: sessionName.trim() })
      .select("id")
      .single();

    if (sessionError) {
      return { success: false, error: `Session Insertion Error: ${sessionError.message}` };
    }

    const sessionId = sessionData.id;

    // Prepare attendees for bulk insert
    const attendeesToInsert = parsedAttendees.map((attendee) => ({
      session_id: sessionId,
      email: attendee.email,
      code: attendee.code,
    }));

    // Bulk insert attendees
    const { error: attendeesError } = await supabase
      .from("attendees")
      .insert(attendeesToInsert);

    if (attendeesError) {
      // Clean up the session since attendee import failed (transaction simulation)
      await supabase.from("sessions").delete().eq("id", sessionId);

      // Check for common unique constraint violations to give user-friendly errors
      if (attendeesError.code === "23505") {
        return {
          success: false,
          error: "A code or email is already registered for this session or exists in another session with constraints.",
        };
      }
      return { success: false, error: `Attendee Insertion Error: ${attendeesError.message}` };
    }

    return { success: true, sessionId, count: parsedAttendees.length };
  } catch (error) {
    console.error("Upload session error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during upload.";
    return { success: false, error: errorMessage };
  }
}

export async function getSessions() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        created_at,
        attendees (
          id,
          is_claimed
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const sessions = (data as unknown as SessionDB[] || []).map((session) => {
      const attendees = session.attendees || [];
      return {
        id: session.id,
        name: session.name,
        created_at: session.created_at,
        attendees_count: attendees.length,
        claimed_count: attendees.filter((a) => a.is_claimed).length,
      };
    });

    return { success: true, sessions };
  } catch (error) {
    console.error("Get sessions error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred fetching sessions.";
    return { success: false, error: errorMessage };
  }
}

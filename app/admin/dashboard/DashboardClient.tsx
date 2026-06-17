"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { logoutAdmin } from "../actions";
import { uploadSession, getSessions } from "./actions";
import { LogOut, PlusCircle, Database, Calendar, Users, CheckCircle } from "lucide-react";

interface Session {
  id: string;
  name: string;
  created_at: string;
  attendees_count: number;
  claimed_count: number;
}

interface DashboardClientProps {
  initialSessions: Session[];
}

export default function DashboardClient({ initialSessions }: DashboardClientProps) {
  const [sessionName, setSessionName] = useState("");
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const router = useRouter();

  // Sync state if initialSessions prop changes (e.g., from server-side refetches)
  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success("Logged out successfully");
      router.push("/admin");
    } catch (err) {
      toast.error("Failed to log out");
      console.error(err);
    }
  };

  const refreshSessionsList = async () => {
    const res = await getSessions();
    if (res.success && res.sessions) {
      setSessions(res.sessions);
    }
    router.refresh();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      toast.error("Session name is required");
      return;
    }
    if (!csvData.trim()) {
      toast.error("Attendee data is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await uploadSession(sessionName, csvData);
      if (result.success) {
        toast.success(`Session uploaded successfully — ${result.count || 0} attendees added`);
        setSessionName("");
        setCsvData("");
        await refreshSessionsList();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-buttermilk p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-cream shadow-sm rounded-2xl p-4 md:px-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy">GetCode Admin</h1>
          <p className="text-xs md:text-sm text-navy/60">Manage your OTP sessions and attendees</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 h-12 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 active:scale-95 transition-all rounded-xl border border-red-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upload New Session */}
        <Card>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-navy/10 pb-4">
              <PlusCircle className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-bold text-navy">New Session</h2>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <TextInput
                id="sessionName"
                label="Session Name"
                placeholder="e.g. Week 3 Class"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isLoading}
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="csvData" className="text-sm font-semibold text-navy">
                  Paste attendee data below
                </label>
                <textarea
                  id="csvData"
                  rows={8}
                  disabled={isLoading}
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="email,code&#10;daniel@gmail.com,ATT-4821&#10;john@gmail.com,ATT-9932&#10;amaka@gmail.com,ATT-1143"
                  className="w-full rounded-xl border-[1.5px] border-brand/40 bg-white/50 px-4 py-3 font-medium text-navy placeholder:text-navy/40 transition-all focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none font-mono text-sm leading-relaxed"
                />
                <p className="text-xs text-navy/60 leading-normal">
                  Each line should be: email,code — the first line must be the header row (email,code)
                </p>
              </div>

              <PrimaryButton type="submit" isLoading={isLoading}>
                Upload Session
              </PrimaryButton>
            </form>
          </div>
        </Card>

        {/* Right Column: Past Sessions */}
        <Card>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-navy/10 pb-4">
              <Database className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-bold text-navy">Sessions</h2>
            </div>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-navy/50 text-sm">
                  No sessions yet. Upload your first session above.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white/40 border border-brand/10 hover:border-brand/25 transition-all rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-bold text-navy text-base leading-none">
                        {session.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-navy/40" />
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-navy/40" />
                          {session.attendees_count} Attendees
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-navy/40" />
                          {session.claimed_count} Claimed
                        </span>
                      </div>
                    </div>

                    <button
                      disabled
                      className="self-end sm:self-center h-12 px-4 flex items-center justify-center bg-brand/10 text-brand text-xs font-semibold rounded-xl hover:bg-brand/20 transition-all cursor-not-allowed opacity-60"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

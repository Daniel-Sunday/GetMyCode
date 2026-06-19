"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { logoutAdmin } from "../actions";
import { uploadSession, getSessions, deleteSession, getSessionAttendees, updateAttendeeEmail } from "./actions";
import { LogOut, PlusCircle, Database, Calendar, Users, CheckCircle, Eye, Trash2, AlertTriangle, Pencil, Check, X } from "lucide-react";

interface Session {
  id: string;
  name: string;
  created_at: string;
  attendees_count: number;
  claimed_count: number;
}

interface Attendee {
  id: string;
  email: string;
  code: string;
  is_claimed: boolean;
}

interface DashboardClientProps {
  initialSessions: Session[];
}

export default function DashboardClient({ initialSessions }: DashboardClientProps) {
  const [sessionName, setSessionName] = useState("");
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // View Session Attendees Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSessionForView, setSelectedSessionForView] = useState<Session | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);
  const [editingAttendeeId, setEditingAttendeeId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingAttendeeId, setIsSavingAttendeeId] = useState<string | null>(null);
  const [successAttendeeId, setSuccessAttendeeId] = useState<string | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteSession(sessionToDelete.id);
      if (result.success) {
        toast.success(`Session "${sessionToDelete.name}" deleted successfully`);
        setIsDeleteModalOpen(false);
        setSessionToDelete(null);
        await refreshSessionsList();
      } else {
        toast.error(result.error || "Failed to delete session");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during deletion.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
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

  const handleViewSession = async (session: Session) => {
    setSelectedSessionForView(session);
    setIsViewModalOpen(true);
    setIsAttendeesLoading(true);
    setEditingAttendeeId(null);
    setEditingEmail("");
    setSaveError(null);
    setSuccessAttendeeId(null);
    try {
      const result = await getSessionAttendees(session.id);
      if (result.success && result.attendees) {
        setAttendees(result.attendees);
      } else {
        toast.error(result.error || "Failed to load attendees");
        setIsViewModalOpen(false);
      }
    } catch (err) {
      toast.error("An error occurred while loading attendees.");
      console.error(err);
      setIsViewModalOpen(false);
    } finally {
      setIsAttendeesLoading(false);
    }
  };

  const handleStartEdit = (attendee: Attendee) => {
    setEditingAttendeeId(attendee.id);
    setEditingEmail(attendee.email);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingAttendeeId(null);
    setEditingEmail("");
    setSaveError(null);
  };

  const handleSaveEmail = async (attendeeId: string) => {
    if (!selectedSessionForView) return;
    
    setSaveError(null);
    const cleanEmail = editingEmail.trim().toLowerCase();

    // Validations
    if (!cleanEmail) {
      setSaveError("Email cannot be empty");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setSaveError("Email must contain @ and a dot (.)");
      return;
    }

    // Check duplicate locally
    const isDuplicate = attendees.some(
      (a) => a.id !== attendeeId && a.email.toLowerCase() === cleanEmail
    );
    if (isDuplicate) {
      setSaveError("An attendee with this email already exists in this session");
      return;
    }

    setIsSavingAttendeeId(attendeeId);
    try {
      const result = await updateAttendeeEmail(attendeeId, cleanEmail, selectedSessionForView.id);
      if (result.success) {
        // Update local state
        setAttendees((prev) =>
          prev.map((a) => (a.id === attendeeId ? { ...a, email: cleanEmail } : a))
        );
        setSuccessAttendeeId(attendeeId);
        setEditingAttendeeId(null);
        setEditingEmail("");
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          setSuccessAttendeeId((prev) => (prev === attendeeId ? null : prev));
        }, 2000);
      } else {
        setSaveError(result.error || "Failed to update email");
      }
    } catch (err) {
      setSaveError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSavingAttendeeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-buttermilk py-4 md:py-6 xl:py-8 flex flex-col gap-4 md:gap-6 xl:gap-8 max-w-[1200px] mx-auto w-full">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-cream shadow-sm rounded-2xl p-5 md:p-6 gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-navy">GetMyCode Admin</h1>
          <p className="text-xs md:text-sm text-navy/60">Manage your OTP sessions and attendees</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 active:scale-95 transition-all rounded-xl border border-red-200 cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 xl:gap-8 items-start w-full max-w-[1100px] mx-auto">
        {/* Left Column: Upload New Session */}
        <Card className="w-full max-w-[680px] lg:max-w-none mx-auto">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center gap-2 border-b border-navy/10 pb-4">
              <PlusCircle className="h-5 w-5 text-brand" />
              <h2 className="text-xl md:text-2xl font-bold text-navy">New Session</h2>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-4 md:gap-6">
              <TextInput
                id="sessionName"
                label="Session Name"
                placeholder="e.g. Week 3 Class"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isLoading}
              />

              <div className="flex flex-col gap-1.5 w-full text-left">
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
                  className="w-full min-h-[180px] rounded-xl border-[1.5px] border-brand/40 bg-white/50 px-4 py-3 font-medium text-navy placeholder:text-navy/40 transition-all focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none font-mono text-sm leading-relaxed"
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
        <Card className="w-full max-w-[680px] lg:max-w-none mx-auto">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center gap-2 border-b border-navy/10 pb-4">
              <Database className="h-5 w-5 text-brand" />
              <h2 className="text-xl md:text-2xl font-bold text-navy">Sessions</h2>
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
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <h3 className="font-bold text-navy text-base leading-none truncate w-full" title={session.name}>
                        {session.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-[18px] w-[18px] text-navy/40" />
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-[18px] w-[18px] text-navy/40" />
                          {session.attendees_count} Attendees
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-[18px] w-[18px] text-navy/40" />
                          {session.claimed_count} Claimed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleViewSession(session)}
                        className="h-12 w-12 flex items-center justify-center bg-brand/10 text-brand rounded-xl hover:bg-brand/20 active:scale-95 transition-all cursor-pointer"
                        title="View session details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSessionToDelete(session);
                          setIsDeleteModalOpen(true);
                        }}
                        className="h-12 w-12 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all border border-red-100 cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Session Warning Modal */}
      {isDeleteModalOpen && sessionToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
          onClick={() => {
            if (!isDeleting) {
              setIsDeleteModalOpen(false);
              setSessionToDelete(null);
            }
          }}
        >
          <div
            className="bg-cream rounded-2xl w-full max-w-[calc(100vw-32px)] md:max-w-[440px] p-5 md:p-6 xl:p-8 shadow-2xl flex flex-col items-center text-center gap-4 md:gap-6 border border-brand/10 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="bg-red-50 p-4 rounded-full border border-red-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-5 w-5 sm:h-10 sm:w-10 text-red-600" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl md:text-2xl xl:text-3xl font-bold text-navy font-poppins text-center">
                Delete Session?
              </h3>
              <p className="text-sm md:text-base text-navy/70 leading-relaxed text-center">
                This will permanently delete this session and all {sessionToDelete.attendees_count} attendee records inside it. Any attendees who have not yet claimed their code will lose access. This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3 w-full">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSessionToDelete(null);
                }}
                className="h-12 w-full border-2 border-navy text-navy font-semibold rounded-xl hover:bg-navy/5 active:scale-[0.98] transition-all text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-12 w-full bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Yes, Delete It"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Session Attendees Modal */}
      {isViewModalOpen && selectedSessionForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
          onClick={() => {
            if (!isSavingAttendeeId) {
              setIsViewModalOpen(false);
              setSelectedSessionForView(null);
              setAttendees([]);
            }
          }}
        >
          <div
            className="bg-cream rounded-2xl w-full max-w-[calc(100vw-32px)] md:max-w-[560px] lg:max-w-[640px] p-5 md:p-6 xl:p-8 shadow-2xl flex flex-col gap-4 md:gap-6 border border-brand/10 relative max-h-[85vh] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              disabled={!!isSavingAttendeeId}
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedSessionForView(null);
                setAttendees([]);
              }}
              className="absolute top-4 right-4 text-navy/40 hover:text-navy p-1 hover:bg-navy/5 rounded transition-all cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-navy/10 pb-4 pr-8 text-center flex flex-col items-center">
              <h3 className="text-xl md:text-2xl xl:text-3xl font-bold text-navy font-poppins text-center w-full">
                {selectedSessionForView.name}
              </h3>
              <p className="text-sm md:text-base text-navy/60 mt-1 text-center w-full">
                Total Attendees: {attendees.length}
              </p>
            </div>

            {/* Modal Content / Attendees Table */}
            <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[50vh] pr-1">
              {isAttendeesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-8 w-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                  <span className="text-sm font-medium text-navy/60">Loading attendees...</span>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-12 text-navy/50 text-sm">
                  No attendees in this session.
                </div>
              ) : (
                <div className="overflow-x-auto w-full min-w-0">
                  <table className="w-full text-left border-collapse table-fixed min-w-[480px] sm:min-w-0">
                    <colgroup>
                      <col className="w-[45%] sm:w-[50%]" />
                      <col className="w-[25%] sm:w-[20%]" />
                      <col className="w-[20%] sm:w-[20%]" />
                      <col className="w-[10%] sm:w-[10%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-navy/10">
                        <th className="px-2 py-2 sm:px-4 text-xs font-bold text-navy/60 uppercase tracking-wider">Email</th>
                        <th className="px-2 py-2 sm:px-4 text-xs font-bold text-navy/60 uppercase tracking-wider">Code</th>
                        <th className="px-2 py-2 sm:px-4 text-xs font-bold text-navy/60 uppercase tracking-wider">Status</th>
                        <th className="px-2 py-2 sm:px-4 text-xs font-bold text-navy/60 uppercase tracking-wider text-right">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee) => (
                        <tr key={attendee.id} className="border-b border-navy/5">
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm">
                            {editingAttendeeId === attendee.id ? (
                              <div className="flex flex-col gap-1.5 w-full">
                                <input
                                  type="email"
                                  value={editingEmail}
                                  onChange={(e) => setEditingEmail(e.target.value)}
                                  className="w-full rounded-lg border border-brand/40 bg-white px-2.5 py-1.5 text-sm text-navy focus:border-brand focus:outline-none"
                                  placeholder="email@example.com"
                                  disabled={isSavingAttendeeId === attendee.id}
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEmail(attendee.id)}
                                    disabled={isSavingAttendeeId === attendee.id}
                                    className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold min-h-[44px] min-w-[44px] px-2"
                                    title="Save"
                                  >
                                    <Check className="h-5 w-5" />
                                    <span className="hidden sm:inline">Save</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={isSavingAttendeeId === attendee.id}
                                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold min-h-[44px] min-w-[44px] px-2"
                                    title="Cancel"
                                  >
                                    <X className="h-5 w-5" />
                                    <span className="hidden sm:inline">Cancel</span>
                                  </button>
                                </div>
                                {saveError && (
                                  <span className="text-xs text-red-600 font-semibold">{saveError}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-navy font-medium break-all">{attendee.email}</span>
                                {successAttendeeId === attendee.id && (
                                  <span className="text-xs text-green-600 font-bold animate-fade-out">
                                    Updated ✓
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-navy/70 font-mono">
                            {attendee.code}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm">
                            {attendee.is_claimed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                Claimed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Unclaimed
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-right">
                            {editingAttendeeId !== attendee.id && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(attendee)}
                                className="text-brand hover:text-brand-dark p-2 hover:bg-brand/10 rounded transition-colors cursor-pointer inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
                                title="Edit email"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import OTPInput from "@/components/OTPInput";
import PrimaryButton from "@/components/PrimaryButton";
import { getSessions } from "@/app/admin/dashboard/actions";
import { ArrowLeft, Check, Copy, RefreshCw, AlertCircle, Info } from "lucide-react";

interface Session {
  id: string;
  name: string;
  created_at: string;
  attendees_count: number;
  claimed_count: number;
}

interface AttendeeLandingClientProps {
  initialSessions: Session[];
}

export default function AttendeeLandingClient({ initialSessions }: AttendeeLandingClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSession, setSelectedSession] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [emailError, setEmailError] = useState("");
  const [isEmailNotFound, setIsEmailNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Timer for resend code
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Load sessions client-side on mount to show active state
  useEffect(() => {
    async function loadSessions() {
      try {
        const result = await getSessions();
        if (result.success && result.sessions) {
          setSessions(result.sessions);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setIsSessionsLoading(false);
      }
    }
    loadSessions();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setIsEmailNotFound(false);

    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          sessionId: selectedSession,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification code sent!");
        setStep(2);
        setCountdown(30);
      } else {
        if (response.status === 404) {
          setIsEmailNotFound(true);
        } else {
          setEmailError(data.error || "Failed to send verification code");
          toast.error(data.error || "Verification failed");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          sessionId: selectedSession,
          token: otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Code verified successfully!");
        setAttendanceCode(data.attendanceCode);
        setStep(3);

        // Silent background API request to mark code as claimed
        fetch("/api/claim-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            sessionId: selectedSession,
          }),
        }).catch((err) => {
          console.error("Silent background code claim failed:", err);
        });
      } else {
        toast.error(data.error || "Invalid verification code");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          sessionId: selectedSession,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("New verification code sent!");
        setCountdown(30);
      } else {
        toast.error(data.error || "Failed to resend code");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(attendanceCode);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleReset = () => {
    setStep(1);
    setEmail("");
    setSelectedSession("");
    setOtp("");
    setAttendanceCode("");
    setEmailError("");
  };

  const hasNoSessions = !isSessionsLoading && sessions.length === 0;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">


        <Card className="w-full">
          {hasNoSessions ? (
            /* Empty State: No Sessions Found */
            <div className="flex flex-col gap-5 text-center py-4">
              <div className="mx-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-1">
                <AlertCircle className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">No active sessions</h2>
                <p className="text-sm text-navy/60 mt-1.5 leading-relaxed">
                  No active sessions right now. Check back after class.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSessionsLoading(true);
                  getSessions().then((res) => {
                    if (res.success && res.sessions) setSessions(res.sessions);
                    setIsSessionsLoading(false);
                  });
                }}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand hover:underline mt-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry fetching sessions</span>
              </button>
            </div>
          ) : step === 1 ? (
            /* Step 1: Session & Email Selection */
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-navy">Get Your Attendance Code</h1>
                <p className="text-sm text-navy/60 mt-1.5">
                  Enter the email you used to join the class
                </p>
              </div>

              <form onSubmit={handleSendCode} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="sessionSelect" className="text-sm font-semibold text-navy">
                    Select Session
                  </label>
                  <select
                    id="sessionSelect"
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value);
                      setIsEmailNotFound(false);
                    }}
                    disabled={isLoading || isSessionsLoading}
                    className="w-full rounded-xl border-[1.5px] border-brand/40 bg-white/50 px-4 py-3 font-medium text-navy transition-all focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:opacity-50"
                  >
                    {isSessionsLoading ? (
                      <option value="">Loading sessions...</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Choose a session --</option>
                        {sessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <TextInput
                  id="email"
                  type="email"
                  label="Your email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                    if (isEmailNotFound) setIsEmailNotFound(false);
                  }}
                  error={emailError}
                  disabled={isLoading || isSessionsLoading}
                />

                {isEmailNotFound && (
                  <div className="flex gap-3 bg-amber-50 border border-amber-200/50 rounded-xl p-4 animate-fade-in text-left">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-amber-900 leading-relaxed">
                      Email not found. If you believe this is an error, contact your coordinator.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <PrimaryButton type="submit" isLoading={isLoading || isSessionsLoading} disabled={isSessionsLoading}>
                    Send Verification Code
                  </PrimaryButton>
                  <p className="text-center text-xs text-navy/50">
                    A 6-digit code will be sent to your email
                  </p>
                </div>
              </form>
            </div>
          ) : step === 2 ? (
            /* Step 2: OTP Verification */
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy self-start transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-navy">Check your email</h1>
                <p className="text-sm text-navy/60 mt-1.5">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-navy break-all">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
                <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

                <div className="flex flex-col gap-3.5 items-center">
                  <PrimaryButton type="submit" isLoading={isLoading}>
                    Verify Code
                  </PrimaryButton>

                  {countdown > 0 ? (
                    <span className="text-xs font-semibold text-navy/40">
                      Resend code in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* Step 3: Code Reveal View */
            <div className="flex flex-col gap-6 text-center animate-reveal">
              <div>
                <h1 className="text-2xl font-bold text-navy">Here&apos;s your code</h1>
                <p className="text-sm text-navy/60 mt-1.5 leading-relaxed">
                  Copy it and paste it on the Imodigitalcity website to mark your attendance
                </p>
              </div>

              {/* Code Display Ticket/Badge */}
              <div className="bg-brand text-buttermilk rounded-2xl p-6 py-8 shadow-md border-2 border-brand relative group overflow-hidden select-all">
                <div className="absolute top-0 bottom-0 left-0 w-2.5 flex flex-col justify-around py-2 -ml-[6px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-cream rounded-full" />
                  ))}
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-2.5 flex flex-col justify-around py-2 -mr-[6px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-cream rounded-full" />
                  ))}
                </div>
                
                <span className="text-4xl font-extrabold tracking-widest font-mono">
                  {attendanceCode}
                </span>
              </div>

              <div className="flex flex-col gap-3.5 items-center w-full">
                <PrimaryButton onClick={handleCopy} className="flex gap-2">
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  <span>{copied ? "Copied ✓" : "Copy Code"}</span>
                </PrimaryButton>

                <div className="flex items-center gap-1.5 text-xs text-navy/60">
                  <AlertCircle className="h-4 w-4 text-brand" />
                  <span>This code is now yours. Do not share it.</span>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy mt-4 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Verify another code</span>
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

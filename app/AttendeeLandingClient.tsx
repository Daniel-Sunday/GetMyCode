"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import OTPInput from "@/components/OTPInput";
import PrimaryButton from "@/components/PrimaryButton";
import { ArrowLeft } from "lucide-react";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSession, setSelectedSession] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // Timer for resend code
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

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
        setEmailError(data.error || "Failed to send verification code");
        toast.error(data.error || "Verification failed");
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
        router.push(`/reveal?code=${encodeURIComponent(data.attendanceCode)}`);
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* App Title Logo */}
        <div className="text-center mb-6">
          <span className="text-xl font-bold tracking-wider text-brand font-sans">
            GETCODE
          </span>
        </div>

        <Card className="w-full">
          {step === 1 ? (
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
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full rounded-xl border-[1.5px] border-brand/40 bg-white/50 px-4 py-3 font-medium text-navy transition-all focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
                  >
                    <option value="" disabled>-- Choose a session --</option>
                    {initialSessions.length === 0 ? (
                      <option disabled>No sessions available</option>
                    ) : (
                      initialSessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.name}
                        </option>
                      ))
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
                  }}
                  error={emailError}
                  disabled={isLoading}
                />

                <div className="flex flex-col gap-2.5">
                  <PrimaryButton type="submit" isLoading={isLoading}>
                    Send Verification Code
                  </PrimaryButton>
                  <p className="text-center text-xs text-navy/50">
                    A 6-digit code will be sent to your email
                  </p>
                </div>
              </form>
            </div>
          ) : (
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
          )}
        </Card>
      </div>
    </div>
  );
}

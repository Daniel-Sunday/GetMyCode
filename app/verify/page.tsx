"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import OTPInput from "@/components/OTPInput";
import PrimaryButton from "@/components/PrimaryButton";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

const MOCK_SESSIONS = [
  { id: "1", name: "Week 1 Orientation" },
  { id: "2", name: "Week 2 Frontend Basics" },
];

export default function VerifyPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSession, setSelectedSession] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Verification code sent! (Mocked)");
      setStep(2);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Code verified successfully! (Mocked)");
      // Redirect to reveal page with a mock claim code
      router.push("/reveal?code=ATT-4821");
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {step === 1 ? (
          <div className="flex flex-col gap-4 sm:gap-5 text-left">
            <div>
              <div className="mr-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <h1 className="text-2xl font-bold text-navy">Verify Attendance</h1>
              <p className="text-sm text-navy/60 mt-1">
                Select your session and enter your email to claim your code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
                  {MOCK_SESSIONS.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              <TextInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <PrimaryButton type="submit" isLoading={isLoading}>
                Send Code
              </PrimaryButton>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5 text-left">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy self-start transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to email
            </button>

            <div>
              <div className="mr-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-3">
                <KeyRound className="h-5 w-5 text-brand" />
              </div>
              <h1 className="text-2xl font-bold text-navy">Enter Verification Code</h1>
              <p className="text-sm text-navy/60 mt-1">
                We&apos;ve sent a 6-digit code to <span className="font-semibold text-navy break-all">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 sm:gap-5">
              <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

              <PrimaryButton type="submit" isLoading={isLoading}>
                Verify &amp; Reveal Code
              </PrimaryButton>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}

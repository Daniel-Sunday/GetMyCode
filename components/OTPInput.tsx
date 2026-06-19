"use client";

import React, { useRef, useState, useEffect } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ value, onChange, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync internal state with external value if changed from parent
  useEffect(() => {
    const valArray = value.split("").slice(0, 6);
    const newOtp = [...Array(6)].map((_, i) => valArray[i] || "");
    setOtp(newOtp);
  }, [value]);

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    onChange(newOtp.join(""));
  };

  const handleChange = (index: number, val: string) => {
    // Take the last character typed to handle overwrite/replace
    const sanitizedVal = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = sanitizedVal;
    handleOtpChange(newOtp);

    // Auto-advance to next input if filled
    if (sanitizedVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current field is empty, delete content of the previous one and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        handleOtpChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Delete current field content
        const newOtp = [...otp];
        newOtp[index] = "";
        handleOtpChange(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^[a-zA-Z0-9]+$/.test(pasteData)) return; // Allow alphanumeric characters

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (pasteData[i]) {
        newOtp[i] = pasteData[i];
      }
    }
    handleOtpChange(newOtp);

    // Focus the last filled box or last box
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-between gap-2 md:gap-3 w-full max-w-sm mr-auto">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          disabled={disabled}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-[44px] h-[52px] sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl md:text-3xl font-bold rounded-xl border-[1.5px] border-brand/40 bg-white/50 text-navy transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:opacity-50"
        />
      ))}
    </div>
  );
}

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
    // Sanitize non-alphanumeric characters (like spaces, hyphens, etc.)
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, "");

    // Check if the value is a multi-character paste or autofill
    if (cleanVal.length > 1) {
      // If it's a full 6-digit code, start filling from index 0; otherwise fill from current index
      const isFullCode = cleanVal.length >= 6;
      const startIndex = isFullCode ? 0 : index;
      const pasteData = cleanVal.slice(0, 6 - startIndex);

      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        if (startIndex + i < 6) {
          newOtp[startIndex + i] = pasteData[i];
        }
      }
      handleOtpChange(newOtp);

      // Focus the next empty input or the last input
      const nextFocusIndex = Math.min(startIndex + pasteData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
      return;
    }

    // Single character input or delete
    const sanitizedVal = cleanVal.slice(-1);
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
    const rawData = e.clipboardData.getData("text");
    const pasteData = rawData.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

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
    <div className="w-full flex justify-between gap-1.5">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="flex-1 max-w-[46px] h-12 md:max-w-[52px] md:h-14 text-center text-lg md:text-2xl font-bold rounded-xl border-[1.5px] border-brand/40 bg-white/50 text-navy transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:opacity-50"
        />
      ))}
    </div>
  );
}

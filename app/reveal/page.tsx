"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";
import { createClient } from "@/lib/supabase/client";
import { Check, Copy, RefreshCw } from "lucide-react";

function RevealContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "ATT-XXXX";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);

      // Mark code as claimed in Supabase once copied
      const supabase = createClient();
      const { error } = await supabase
        .from("attendees")
        .update({ is_claimed: true })
        .eq("code", code);

      if (error) {
        console.error("Failed to mark code as claimed:", error);
      }
    } catch (err) {
      toast.error("Failed to copy code");
      console.error(err);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="flex flex-col gap-6 text-center">
        <div>
          <div className="mx-auto w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600 stroke-[3px]" />
          </div>
          <h1 className="text-2xl font-bold text-navy">Your Code is Claimed!</h1>
          <p className="text-sm text-navy/60 mt-1">
            Copy the code below to use it for your class attendance.
          </p>
        </div>

        {/* Code display box */}
        <div className="bg-white border-2 border-dashed border-brand/30 rounded-xl p-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-3xl md:text-4xl font-extrabold tracking-wider text-brand font-mono">
            {code}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={handleCopy} className="flex gap-2">
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </PrimaryButton>

          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-navy/60 hover:text-navy py-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Verify another code</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function RevealPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </Card>
        }
      >
        <RevealContent />
      </Suspense>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="flex flex-col gap-6 text-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">
              GetCode Portal
            </h1>
            <p className="text-sm md:text-base text-navy/60 mt-2">
              Welcome! Select one of the portals below to manage or claim your class codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {/* Attendee Portal */}
            <Link
              href="/verify"
              className="flex flex-col gap-3 p-5 rounded-xl border border-brand/20 bg-white/40 hover:bg-brand/5 hover:border-brand/40 active:scale-98 transition-all text-left"
            >
              <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="font-bold text-navy text-lg leading-tight">Attendee</h2>
                <p className="text-xs text-navy/60 mt-1 leading-normal">
                  Verify your email with an OTP code and claim your session code.
                  </p>
              </div>
            </Link>

            {/* Admin Portal */}
            <Link
              href="/admin"
              className="flex flex-col gap-3 p-5 rounded-xl border border-navy/15 bg-white/40 hover:bg-navy/5 hover:border-navy/30 active:scale-98 transition-all text-left"
            >
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-navy" />
              </div>
              <div>
                <h2 className="font-bold text-navy text-lg leading-tight">Admin</h2>
                <p className="text-xs text-navy/60 mt-1 leading-normal">
                  Create classes, upload attendee CSV files, and track claim statistics.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

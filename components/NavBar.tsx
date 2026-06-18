"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isGetMyCodeActive = pathname === "/" || pathname === "/verify";
  const isAdminActive = pathname.startsWith("/admin");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-cream border-b border-brand/20 flex items-center justify-between px-4 md:px-8">
      {/* Brand logo */}
      <Link
        href="/"
        className="text-sm sm:text-base md:text-lg font-bold text-brand font-sans tracking-widest select-none transition-all"
      >
        GETMYCODE
      </Link>

      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 h-full items-center">
        <Link
          href="/"
          className={`relative h-full flex items-center text-sm font-semibold transition-all duration-200 ${
            isGetMyCodeActive ? "text-brand" : "text-navy/60 hover:text-navy"
          }`}
        >
          <span>Get Code</span>
          {isGetMyCodeActive && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </Link>

        <Link
          href="/admin"
          className={`relative h-full flex items-center text-sm font-semibold transition-all duration-200 ${
            isAdminActive ? "text-brand" : "text-navy/60 hover:text-navy"
          }`}
        >
          <span>Admin</span>
          {isAdminActive && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </Link>
      </div>
    </nav>
  );
}

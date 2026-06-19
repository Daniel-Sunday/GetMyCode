"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isGetMyCodeActive = pathname === "/" || pathname === "/verify";
  const isAdminActive = pathname.startsWith("/admin");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-cream border-b border-brand/20 flex flex-row items-center justify-between px-4 md:px-8 xl:px-12 whitespace-nowrap overflow-hidden">
      {/* Brand logo */}
      <Link
        href="/"
        className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-brand font-sans tracking-widest select-none transition-all"
      >
        GetMyCode
      </Link>

      {/* Tabs */}
      <div className="flex flex-row gap-4 md:gap-6 xl:gap-8 h-full items-center whitespace-nowrap">
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

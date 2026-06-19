import React from "react";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function PrimaryButton({
  children,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`w-full h-12 rounded-xl bg-brand text-white font-semibold px-4 whitespace-nowrap text-sm sm:text-base transition-all hover:bg-brand/90 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      <span>{children}</span>
    </button>
  );
}

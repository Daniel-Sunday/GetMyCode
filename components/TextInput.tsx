import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function TextInput({
  label,
  error,
  className = "",
  id,
  ...props
}: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border-[1.5px] border-brand/40 bg-white/50 px-4 py-3 font-medium text-navy placeholder:text-navy/40 transition-all focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

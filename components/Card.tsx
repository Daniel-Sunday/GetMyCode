import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-cream rounded-2xl shadow-sm p-5 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

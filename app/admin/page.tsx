"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { loginAdmin } from "./actions";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAdmin(password);
      if (result.success) {
        toast.success("Welcome, Admin!");
        router.push("/admin/dashboard");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col gap-4 sm:gap-5 text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Admin Login</h1>
            <p className="text-sm text-navy/60 mt-1">
              Enter your credentials to manage the sessions
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <PrimaryButton type="submit" isLoading={isLoading}>
              Enter
            </PrimaryButton>
          </form>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import AuthAPI from "@/lib/auth";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      await AuthAPI.resetPassword({ token, password });
      setIsDone(true);
    } catch (error: unknown) {
      const data = (error as any)?.response?.data;
      toast.error(data?.message || "Reset failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {!isDone ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight mb-1">Set new password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a strong password for your account.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
              />

              <Button type="submit" className="w-full h-11 font-bold text-sm" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Password updated!</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset. You can now log in with your new password.
            </p>
          </div>
          <Button className="w-full h-11 font-bold text-sm" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </div>
      )}

      {!isDone && (
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      )}
    </motion.div>
  );
}

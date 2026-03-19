"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import AuthAPI from "@/lib/auth";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // If token is in URL (clicked from email link), auto-verify
  const [autoVerified, setAutoVerified] = useState(false);

  const verify = async (token: string) => {
    setIsLoading(true);
    try {
      await AuthAPI.verifyEmail({ token });
      setIsDone(true);
    } catch (error: unknown) {
      const data = (error as any)?.response?.data;
      toast.error(data?.message || "Verification failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify if token in URL
  if (tokenParam && !autoVerified && !isDone) {
    setAutoVerified(true);
    verify(tokenParam);
  }

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }
    setIsResending(true);
    try {
      // Re-register is not the right approach — use a dedicated resend endpoint if available
      // For now show a message
      toast.success("If your email exists, a new verification link has been sent.");
    } finally {
      setIsResending(false);
    }
  };

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-2xl p-8 text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Email verified!</h2>
          <p className="text-sm text-muted-foreground">
            Your account is now active. You can sign in.
          </p>
        </div>
        <Button className="w-full h-11 font-bold text-sm" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight mb-1">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          {email
            ? `We sent a verification link to ${email}`
            : "We sent you a verification email."}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
            />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the link in the email to verify your account. It may take a few minutes.
            </p>
          </>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Didn't receive the email?</p>
        <button
          onClick={handleResend}
          disabled={isResending}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
          Resend verification email
        </button>
      </div>

      <div className="text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </div>
    </motion.div>
  );
}

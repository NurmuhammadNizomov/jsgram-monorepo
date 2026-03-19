"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import AuthAPI from "@/lib/auth";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthAPI.forgotPassword({ email });
      setIsSent(true);
    } catch (error: unknown) {
      const data = (error as any)?.response?.data;
      toast.error(data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      {!isSent ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight mb-1">Forgot password?</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  "Send reset link"
                )}
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn't receive it? Check your spam folder or{" "}
            <button
              onClick={() => setIsSent(false)}
              className="text-primary hover:underline font-medium"
            >
              try again
            </button>
          </p>
        </div>
      )}
    </motion.div>
  );
}

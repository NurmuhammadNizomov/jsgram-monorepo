"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import type { LoginFormData } from "@/types/auth";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push("/feed");
    } catch (error: unknown) {
      const data = (error as any)?.response?.data;
      const message = typeof data?.message === "string" ? data.message : "Login failed";
      const errors = Array.isArray(data?.errors) ? data.errors.map(String) : [];
      toast.error(message, { description: errors.join("\n") || undefined });
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
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight mb-1">{t("title") || "Sign in to JSGram"}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle") || "Welcome back!"}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
          />

          <Input
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded border-border accent-primary"
              />
              <span className="text-muted-foreground">{t("rememberMe")}</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 font-bold text-sm mt-1" disabled={isLoading}>
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

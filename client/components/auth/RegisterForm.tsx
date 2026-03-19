"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { RegisterFormData } from "@/types/auth";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await register({ email: formData.email, password: formData.password });
      console.log("Registration successful:", response.message);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: any } };
      const data = axiosError.response?.data;
      const message = typeof data?.message === "string" ? data.message : "Registration failed";
      const errors = Array.isArray(data?.errors) ? (data.errors as unknown[]) : [];
      const description = errors.length > 0 ? errors.map(String).join("\n") : undefined;
      toast.error(message, { description });
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight mb-1">{t("title") || "Create your account"}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Form card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            name="email"
            placeholder={t("email")}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
          />

          <Input
            type="password"
            name="password"
            placeholder={t("password")}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
          />

          <p className="text-[11px] text-center text-muted-foreground leading-relaxed pt-1">
            {t("terms")}{" "}
            <Link href="#" className="text-primary hover:underline">{t("termsLink")}</Link>
            {" & "}
            <Link href="#" className="text-primary hover:underline">{t("privacyLink")}</Link>
          </p>

          <Button
            type="submit"
            className="w-full h-11 font-bold text-sm"
            disabled={isLoading}
          >
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>
      </div>

      {/* Login card */}
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

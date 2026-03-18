"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main card */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5">
        <p className="text-center text-muted-foreground font-medium">
          {t("description")}
        </p>

        {/* Social buttons */}
        <div className="space-y-2.5">
          <Button
            className="w-full h-11 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium"
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t("orContinue")} Facebook
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("orContinue")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <Input
            type="text"
            placeholder={t("email")}
            required
            disabled={isLoading}
            className="h-[44px] bg-secondary/50 border-border text-sm placeholder:text-muted-foreground/60"
          />

          <Input
            type="text"
            placeholder={t("firstName")}
            required
            disabled={isLoading}
            className="h-[44px] bg-secondary/50 border-border text-sm placeholder:text-muted-foreground/60"
          />

          <Input
            type="text"
            placeholder={t("username")}
            required
            disabled={isLoading}
            className="h-[44px] bg-secondary/50 border-border text-sm placeholder:text-muted-foreground/60"
          />

          <Input
            type="password"
            placeholder={t("password")}
            required
            disabled={isLoading}
            className="h-[44px] bg-secondary/50 border-border text-sm placeholder:text-muted-foreground/60"
          />

          <p className="text-[11px] text-center text-muted-foreground/80 leading-relaxed py-2">
            People who use our service may have uploaded your contact information to JSGram.{" "}
            <Link href="#" className="text-violet-500 hover:text-violet-400">
              Learn More
            </Link>
          </p>

          <p className="text-[11px] text-center text-muted-foreground/80 leading-relaxed">
            {t("terms")}{" "}
            <Link href="#" className="text-violet-500 hover:text-violet-400">
              {t("termsLink")}
            </Link>
            ,{" "}
            <Link href="#" className="text-violet-500 hover:text-violet-400">
              {t("privacyLink")}
            </Link>
          </p>

          <Button
            type="submit"
            className="w-full h-[44px] bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      </div>

      {/* Login card */}
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="text-violet-500 font-semibold hover:text-violet-400 transition"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

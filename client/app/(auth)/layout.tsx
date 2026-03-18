"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("landing.footer");
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-background">
      {/* Left side - Phone mockup with app preview */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-950 items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="relative mx-auto">
            {/* Phone frame */}
            <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />
              
              {/* Phone screen */}
              <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-[2.5rem] overflow-hidden">
                {/* App content mockup */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white font-semibold text-lg">JSGram</span>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/20" />
                      <div className="w-6 h-6 rounded-full bg-white/20" />
                    </div>
                  </div>
                  
                  {/* Stories */}
                  <div className="flex gap-3 mb-6 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Post mockup */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
                      <div className="flex-1">
                        <div className="w-24 h-3 bg-white/30 rounded" />
                      </div>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-lg" />
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded bg-white/20" />
                      <div className="w-6 h-6 rounded bg-white/20" />
                      <div className="w-6 h-6 rounded bg-white/20" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-16 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
          </svg>
        </motion.div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden px-4 py-8 sm:px-6 sm:py-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">J</span>
            </div>
          </Link>
          <h2 className="mt-4 text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            JSGram
          </h2>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-[380px]">
            {/* Desktop logo */}
            <div className="hidden lg:block text-center mb-8">
              <Link href="/" className="inline-block">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  JSGram
                </h1>
              </Link>
            </div>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition">{t("about")}</Link>
            <Link href="#" className="hover:text-foreground transition">{t("blog")}</Link>
            <Link href="#" className="hover:text-foreground transition">{t("api")}</Link>
            <Link href="#" className="hover:text-foreground transition">{t("privacy")}</Link>
            <Link href="#" className="hover:text-foreground transition">{t("terms")}</Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} JSGram
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const mockFeedItems = [
  { avatar: "A", color: "from-blue-500 to-indigo-500", user: "alex_dev", time: "2m", content: "Just launched my first open-source project! 🚀 Check it out!", likes: 142, comments: 28 },
  { avatar: "S", color: "from-pink-500 to-rose-500", user: "sarah_ui", time: "8m", content: "Design tip: whitespace is your best friend. Less is more. ✨", likes: 891, comments: 67 },
  { avatar: "M", color: "from-emerald-500 to-teal-500", user: "mike_photo", time: "25m", content: "Golden hour in the mountains never disappoints 📸 #photography", likes: 2340, comments: 89 },
  { avatar: "L", color: "from-violet-500 to-purple-500", user: "luna_codes", time: "1h", content: "Code review done, coffee refilled, ready to ship! ☕", likes: 156, comments: 12 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("landing.footer");

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-background">

      {/* Left side — Social feed preview */}
      <div className="hidden lg:flex flex-col bg-muted/20 border-r border-border relative overflow-hidden">

        {/* Brand header */}
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-primary-foreground">J</span>
            </div>
            <span className="text-2xl font-black tracking-tight">JSGram</span>
          </Link>
        </div>

        {/* Tagline */}
        <div className="px-8 mb-8">
          <h2 className="text-4xl font-black leading-tight tracking-tight mb-3">
            See what's
            <br />
            happening now.
          </h2>
          <p className="text-muted-foreground text-base">
            Join the conversation. Share your world.
          </p>
        </div>

        {/* Live feed mockup */}
        <div className="flex-1 px-6 pb-8 overflow-hidden">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Live Feed</span>
            </div>

            <div className="divide-y divide-border">
              {mockFeedItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="px-4 py-3 hover:bg-muted/40 transition"
                >
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-xs">{item.user}</span>
                        <span className="text-muted-foreground text-[11px]">· {item.time}</span>
                      </div>
                      <p className="text-xs text-foreground leading-snug mb-2 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {item.likes > 999 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {item.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trending topics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs font-semibold mb-3">Trending today</p>
            <div className="flex flex-wrap gap-2">
              {["#webdev", "#design", "#photography", "#coding", "#startup"].map((tag) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side — Auth form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-10 pb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black text-primary-foreground">J</span>
            </div>
            <span className="text-3xl font-black tracking-tight">JSGram</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto">
          <div className="w-full max-w-[360px]">
            {/* Desktop logo */}
            <div className="hidden lg:block text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 justify-center group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-foreground">J</span>
                </div>
                <span className="text-3xl font-black tracking-tight">JSGram</span>
              </Link>
            </div>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
            {["about", "blog", "api", "privacy", "terms"].map((key) => (
              <Link key={key} href="#" className="hover:text-foreground transition">{t(key as any)}</Link>
            ))}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} JSGram
          </p>
        </div>
      </div>
    </div>
  );
}

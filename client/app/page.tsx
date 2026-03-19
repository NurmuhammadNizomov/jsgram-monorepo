"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { type Locale } from "@/i18n/config";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const featureKeys = ["stories", "community", "messages", "live", "engagement", "explore"] as const;

const featureIcons = [
  // Camera / Stories
  <svg key="stories" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  // Users / Community
  <svg key="community" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  // Chat
  <svg key="messages" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  // Video
  <svg key="live" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  // Heart
  <svg key="engagement" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  // Search / Explore
  <svg key="explore" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
];

const stats = [
  { value: "10M+", key: "users" },
  { value: "500M+", key: "posts" },
  { value: "50M+", key: "stories" },
  { value: "99.9%", key: "uptime" },
];

const mockPosts = [
  { user: "alex_dev", handle: "@alex_dev", time: "2m", avatar: "A", content: "Just shipped a new feature! The community feedback has been incredible 🚀 #buildinpublic", likes: 142, comments: 28, color: "from-blue-500 to-indigo-500" },
  { user: "sarah_design", handle: "@sarah_ui", time: "15m", avatar: "S", content: "Dark mode is not a feature, it's a lifestyle 🌙 Who else codes at 2am?", likes: 891, comments: 67, color: "from-pink-500 to-rose-500" },
  { user: "tech_talks", handle: "@techtalks", time: "1h", avatar: "T", content: "Hot take: the best social network is one where real conversations happen, not just vanity metrics.", likes: 2.1, comments: 203, color: "from-violet-500 to-purple-500" },
];

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Navbar */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-black text-primary-foreground">J</span>
              </div>
              <span className="text-lg font-bold">JSGram</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.features")}</Link>
              <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.stats")}</Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.testimonials")}</Link>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-sm">{t("landing.nav.signIn")}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm font-semibold">{t("landing.nav.getStarted")}</Button>
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-20 lg:pt-0 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center min-h-screen py-24 lg:py-0">

            {/* Left: Text */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium mb-6 border border-border">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                {t("landing.badge")}
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                {t("landing.hero.title1")}
                <br />
                <span className="text-primary">{t("landing.hero.title2")}</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                {t("landing.hero.description")}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-bold">
                    {t("landing.hero.cta")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base">
                    {t("landing.nav.signIn")}
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {["A", "B", "C", "D", "E"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-background">{l}</div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span> {t("landing.hero.joinedThisWeek")}
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Feed mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />

                {/* Feed card */}
                <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                  {/* Header */}
                  <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                    <span className="font-bold text-sm">For You</span>
                    <div className="flex gap-3">
                      <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition">Following</span>
                      <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition">Trending</span>
                    </div>
                  </div>

                  {/* Posts */}
                  <div className="divide-y divide-border">
                    {mockPosts.map((post, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                        className="p-4 hover:bg-muted/40 transition cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                            {post.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-semibold text-sm">{post.user}</span>
                              <span className="text-muted-foreground text-xs">{post.handle}</span>
                              <span className="text-muted-foreground text-xs">· {post.time}</span>
                            </div>
                            <p className="text-sm text-foreground leading-snug mb-2">{post.content}</p>
                            <div className="flex items-center gap-5 text-muted-foreground">
                              <button className="flex items-center gap-1.5 text-xs hover:text-primary transition group">
                                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                {post.comments}
                              </button>
                              <button className="flex items-center gap-1.5 text-xs hover:text-rose-500 transition group">
                                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                {typeof post.likes === "number" && post.likes > 999 ? `${post.likes}k` : post.likes}
                              </button>
                              <button className="flex items-center gap-1.5 text-xs hover:text-primary transition">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Compose hint */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">Y</span>
                      </div>
                      <div className="flex-1 h-9 bg-muted rounded-full flex items-center px-4">
                        <span className="text-xs text-muted-foreground">What's on your mind?</span>
                      </div>
                      <Button size="sm" className="rounded-full h-8 px-4 text-xs font-bold">Post</Button>
                    </div>
                  </div>
                </div>

                {/* Trending sidebar hint */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -right-8 top-1/4 bg-card border border-border rounded-xl p-3 shadow-lg w-44"
                >
                  <p className="text-xs font-semibold mb-2">Trending</p>
                  {["#webdev", "#opensource", "#design"].map((tag, i) => (
                    <div key={i} className="text-xs text-primary font-medium py-0.5">{tag}</div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              {t("landing.features.title")}{" "}
              <span className="text-primary">{t("landing.features.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("landing.features.description")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all group cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition">
                  {featureIcons[i]}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">{t(`landing.features.items.${key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`landing.features.items.${key}.description`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{t(`landing.stats.${stat.key}`)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              {t("landing.testimonials.title")}{" "}
              <span className="text-primary">{t("landing.testimonials.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("landing.testimonials.description")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((num, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-foreground mb-5 leading-relaxed">&ldquo;{t(`landing.testimonials.items.${num}.content`)}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {t(`landing.testimonials.items.${num}.author`).charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t(`landing.testimonials.items.${num}.author`)}</div>
                    <div className="text-xs text-muted-foreground">{t(`landing.testimonials.items.${num}.role`)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">{t("landing.cta.title")}</h2>
            <p className="text-muted-foreground text-lg mb-8">{t("landing.cta.description")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-bold">{t("landing.cta.createAccount")}</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 h-12 text-base">{t("landing.cta.signIn")}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-sm font-black text-primary-foreground">J</span>
                </div>
                <span className="font-bold">JSGram</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("landing.footer.description")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.features")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.pricing")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.api")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.company")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.about")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.blog")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.careers")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.privacy")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.terms")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.security")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} JSGram. {t("landing.footer.copyright")}</p>
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

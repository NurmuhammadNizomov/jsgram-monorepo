"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { type Locale } from "@/i18n/config";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const featureKeys = ["stories", "community", "messages", "live", "engagement", "explore"] as const;
const stats = [
  { value: "10M+", key: "users" },
  { value: "500M+", key: "posts" },
  { value: "50M+", key: "stories" },
  { value: "99.9%", key: "uptime" },
];

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-xl sm:text-2xl font-bold text-white">J</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">JSGram</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.features")}</Link>
              <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.stats")}</Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition">{t("landing.nav.testimonials")}</Link>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">{t("landing.nav.signIn")}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25">{t("landing.nav.getStarted")}</Button>
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div style={{ opacity, scale }} className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div className="max-w-4xl mx-auto text-center" variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              {t("landing.badge")}
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              {t("landing.hero.title1")}
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">{t("landing.hero.title2")}</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{t("landing.hero.description")}</motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl px-8 h-12">{t("landing.hero.cta")}</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12">{t("landing.hero.learnMore")}</Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex -space-x-3">
                {["A", "B", "C", "D", "E"].map((l, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-background">{l}</div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">10,000+</span> {t("landing.hero.joinedThisWeek")}</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{t("landing.features.title")} <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{t("landing.features.titleHighlight")}</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("landing.features.description")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureKeys.map((key, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }} className="group p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-violet-500/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t(`landing.features.items.${key}.title`)}</h3>
                <p className="text-muted-foreground">{t(`landing.features.items.${key}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="py-24 sm:py-32 bg-gradient-to-b from-violet-500/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.key} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{t(`landing.stats.${stat.key}`)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{t("landing.testimonials.title")} <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{t("landing.testimonials.titleHighlight")}</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("landing.testimonials.description")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num, i) => (
              <motion.div key={num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ scale: 1.02 }} className="p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-violet-500/30 transition-all">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <svg key={j} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                <p className="text-foreground mb-6">&ldquo;{t(`landing.testimonials.items.${num}.content`)}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">{t(`landing.testimonials.items.${num}.author`).charAt(0)}</div>
                  <div>
                    <div className="font-medium">{t(`landing.testimonials.items.${num}.author`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`landing.testimonials.items.${num}.role`)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t("landing.cta.title")}</h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">{t("landing.cta.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"><Button size="lg" className="w-full sm:w-auto bg-white text-violet-600 hover:bg-white/90 px-8 h-12">{t("landing.cta.createAccount")}</Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 h-12">{t("landing.cta.signIn")}</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center"><span className="text-xl font-bold text-white">J</span></div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">JSGram</span>
              </Link>
              <p className="text-muted-foreground text-sm">{t("landing.footer.description")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.product")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.features")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.pricing")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.api")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.company")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.about")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.blog")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.careers")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.legal")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.privacy")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.terms")}</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">{t("landing.footer.security")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} JSGram. {t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

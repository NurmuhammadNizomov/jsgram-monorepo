import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JSGram - Connect with friends",
  description: "JSGram - A modern social network to connect, share, and discover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = localeCookie && locales.includes(localeCookie as Locale) 
    ? localeCookie as Locale 
    : defaultLocale;
  
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col`}>
        <AuthProvider>
          <ThemeProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <QueryProvider>
                {children}
              </QueryProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}

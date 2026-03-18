import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
                  J
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">JSGram</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 dark:hover:bg-white/10 text-sm sm:text-base px-3 sm:px-4"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="sm"
                  className="bg-white dark:bg-white/10 text-violet-600 dark:text-white hover:bg-white/90 dark:hover:bg-white/20 border-0 text-sm sm:text-base px-3 sm:px-4"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Connect with friends and the world around you
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0">
                Share your moments, discover new content, and stay connected with
                the people who matter most. JSGram makes it easy to express
                yourself and find your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white dark:bg-white/10 text-violet-600 dark:text-white hover:bg-white/90 dark:hover:bg-white/20 border-0 text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12"
                  >
                    Get Started - It&apos;s Free
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/50 dark:border-white/30 text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12"
                  >
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid gap-3 sm:gap-4 order-1 lg:order-2">
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20 dark:border-white/10">
                <CardContent className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Share Your Moments
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 mt-1">
                      Post photos, videos, and stories to share your life with
                      friends and followers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20 dark:border-white/10">
                <CardContent className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Build Your Community
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 mt-1">
                      Follow friends, discover creators, and connect with people
                      who share your interests.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20 dark:border-white/10">
                <CardContent className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Real-time Messaging
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 mt-1">
                      Stay in touch with instant messaging, voice notes, and video
                      calls.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/60 text-sm">
            <p>&copy; 2024 JSGram. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-white transition">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white transition">
                Terms
              </Link>
              <Link href="#" className="hover:text-white transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

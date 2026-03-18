import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left side - Branding (hidden on mobile/tablet) */}
      <div className="hidden lg:flex bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950 p-8 xl:p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              J
            </span>
          </div>
          <span className="text-2xl font-bold text-white">JSGram</span>
        </Link>

        <div className="space-y-6 max-w-lg">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Share your moments with the world
          </h1>
          <p className="text-lg xl:text-xl text-white/80">
            Join millions of people who use JSGram to connect with friends,
            share photos, and discover new content every day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 xl:gap-8 text-sm text-white/60">
          <span>&copy; 2024 JSGram</span>
          <Link href="#" className="hover:text-white transition">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition">
            Terms
          </Link>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950 px-4 py-4 sm:px-6 sm:py-6">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
                J
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">JSGram</span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 bg-background overflow-y-auto">
          <div className="w-full max-w-[400px] sm:max-w-md">
            {children}
          </div>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden bg-background border-t border-border px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>&copy; 2024 JSGram</span>
            <Link href="#" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

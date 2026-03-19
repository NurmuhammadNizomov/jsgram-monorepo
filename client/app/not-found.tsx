import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-background">
      <div className="space-y-2">
        <p className="text-8xl font-bold text-primary/20 select-none">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:ml-16 xl:ml-64 flex justify-center">
        <main className="w-full max-w-[600px] min-h-screen border-x border-border">
          {children}
        </main>

        <div className="hidden lg:block pl-6 pt-4 sticky top-0 h-screen overflow-y-auto">
          <RightPanel />
        </div>
      </div>

      {/* Mobile bottom bar spacer */}
      <div className="md:hidden h-16" />
    </div>
  );
}

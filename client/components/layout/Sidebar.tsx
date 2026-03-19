"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import {
  Home,
  Search,
  Bell,
  Mail,
  Compass,
  Bookmark,
  User,
  Settings,
  LogOut,
  PlusSquare,
} from "lucide-react";

const navItems = [
  { href: "/feed",          icon: Home,       label: "Home" },
  { href: "/explore",       icon: Compass,    label: "Explore" },
  { href: "/notifications", icon: Bell,       label: "Notifications" },
  { href: "/messages",      icon: Mail,       label: "Messages" },
  { href: "/bookmarks",     icon: Bookmark,   label: "Bookmarks" },
  { href: "/profile",       icon: User,       label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.username[0].toUpperCase()
    : "?";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-16 xl:w-64 border-r border-border bg-background z-40 py-4 px-2 xl:px-4 justify-between">
        {/* Top: logo + nav */}
        <div className="flex flex-col gap-1">
          {/* Logo */}
          <Link
            href="/feed"
            className="flex items-center gap-3 px-2 xl:px-3 py-3 mb-2 rounded-xl hover:bg-accent transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
              JS
            </span>
            <span className="hidden xl:block font-bold text-lg tracking-tight">JSGram</span>
          </Link>

          {/* Nav links */}
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-2 xl:px-3 py-3 rounded-xl transition-colors font-medium text-sm
                  ${active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="hidden xl:block">{label}</span>
              </Link>
            );
          })}

          {/* New post button */}
          <button className="flex items-center gap-3 px-2 xl:px-3 py-3 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            <PlusSquare className="w-5 h-5 flex-shrink-0" />
            <span className="hidden xl:block">New Post</span>
          </button>
        </div>

        {/* Bottom: theme + settings + profile */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center xl:justify-start px-2 xl:px-3 py-2">
            <ThemeToggle />
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-2 xl:px-3 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-sm"
          >
            <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
            <span className="hidden xl:block">Settings</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-2 xl:px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
            <span className="hidden xl:block">Log out</span>
          </button>

          {/* User profile card */}
          <Link
            href="/profile"
            className="flex items-center gap-3 px-2 xl:px-3 py-3 mt-1 rounded-xl hover:bg-accent transition-colors"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                  : user?.username}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                @{user?.username}
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors
                ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        {/* Profile tab */}
        <Link href="/profile" className="flex flex-col items-center gap-0.5 p-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-medium text-muted-foreground">Profile</span>
        </Link>
      </nav>
    </>
  );
}

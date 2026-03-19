"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  User, Lock, Bell, Palette, Shield, Smartphone,
  ChevronRight, LogOut, Trash2, Globe, Moon, Eye, EyeOff,
  Check,
} from "lucide-react";

const SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit profile", sub: "Update your name, bio, avatar", href: "profile" },
      { icon: Lock, label: "Change password", sub: "Update your password", href: "password" },
      { icon: Globe, label: "Language", sub: "English", href: "language" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { icon: Eye, label: "Account privacy", sub: "Public account", href: "privacy", toggle: true, value: false },
      { icon: Shield, label: "Blocked users", sub: "Manage blocked accounts", href: "blocked" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { icon: Bell, label: "Push notifications", sub: "Likes, comments, follows", href: "notif-push", toggle: true, value: true },
      { icon: Bell, label: "Email notifications", sub: "Activity updates via email", href: "notif-email", toggle: true, value: false },
    ],
  },
  {
    title: "Appearance",
    items: [
      { icon: Palette, label: "Theme", sub: "System default", href: "theme" },
      { icon: Moon, label: "Reduce motion", sub: "Minimize animations", href: "motion", toggle: true, value: false },
    ],
  },
  {
    title: "Devices",
    items: [
      { icon: Smartphone, label: "Active sessions", sub: "Manage your logged-in devices", href: "devices" },
    ],
  },
];

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const logoutAll = useAuthStore(s => s.logoutAll);
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    privacy: false,
    "notif-push": true,
    "notif-email": false,
    motion: false,
  });

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user?.username ?? "";

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <h1 className="font-bold text-lg">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="px-4 py-4 border-b border-border">
        <button className="flex items-center gap-3 w-full hover:bg-accent/50 rounded-xl p-2 -mx-2 transition-colors">
          <Avatar className="w-14 h-14">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-purple-500 text-primary-foreground">
              {displayName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            <p className="text-xs text-primary mt-0.5">Edit profile →</p>
          </div>
        </button>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => (
        <div key={section.title} className="border-b border-border">
          <p className="px-4 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </p>
          {section.items.map(item => (
            <button
              key={item.href}
              onClick={() => {
                if ("toggle" in item && item.toggle) {
                  setToggles(prev => ({ ...prev, [item.href]: !prev[item.href] }));
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {"toggle" in item && item.toggle
                    ? toggles[item.href] ? "On" : "Off"
                    : item.sub}
                </p>
              </div>
              {"toggle" in item && item.toggle ? (
                <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${
                  toggles[item.href] ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"
                }`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      ))}

      {/* Account actions */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={async () => { await logout(); router.replace("/login"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent/50 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Log out</p>
            <p className="text-xs text-muted-foreground">Log out from this device</p>
          </div>
        </button>

        <button
          onClick={async () => { await logoutAll(); router.replace("/login"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent/50 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Log out all devices</p>
            <p className="text-xs text-muted-foreground">Remove all active sessions</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/20 hover:bg-destructive/5 transition-colors text-left">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="text-xs text-muted-foreground">Permanently delete your account</p>
          </div>
        </button>
      </div>

      <div className="px-4 pb-8 text-center">
        <p className="text-xs text-muted-foreground">JSGram v1.0.0 · &copy; 2026</p>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { toast } from "sonner";
import { PostAPI, UploadAPI } from "@/lib/social";
import {
  Home, Search, Bell, Mail, Compass, Bookmark, User,
  Settings, LogOut, PlusSquare, ImageIcon, X, Loader2,
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
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<{ url: string; publicId: string; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.username[0].toUpperCase()
    : "?";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await UploadAPI.image(file);
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url: data.url, publicId: data.publicId, preview }]);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    setPosting(true);
    try {
      await PostAPI.create({ content, images: images.map(({ url, publicId }) => ({ url, publicId })) });
      toast.success("Post published!");
      setContent("");
      setImages([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
    } catch {
      toast.error("Failed to publish post");
    } finally {
      setPosting(false);
    }
  };

  const canPost = (content.trim().length > 0 || images.length > 0) && !posting;

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
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                <span className="hidden xl:block">{label}</span>
              </Link>
            );
          })}

          {/* New post button */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 px-2 xl:px-3 py-3 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <PlusSquare className="w-5 h-5 flex-shrink-0" />
            <span className="hidden xl:block">New Post</span>
          </button>
        </div>

        {/* Bottom: theme + settings + logout + profile */}
        <div className="flex flex-col gap-1">
          <ThemeToggle />
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
                {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.username}
              </span>
              <span className="text-xs text-muted-foreground truncate">@{user?.username}</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 4).map(({ href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors
                ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            </Link>
          );
        })}
        {/* Compose */}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground">
          <PlusSquare className="w-5 h-5" strokeWidth={1.8} />
        </button>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 p-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </nav>

      {/* Compose dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
            <DialogTitle>New Post</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="What's happening?"
                className="resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img src={img.preview} className="w-full h-32 object-cover" alt="" />
                    <button
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-primary"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || images.length >= 4}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                size="sm" className="rounded-full px-5"
                onClick={handlePost}
                disabled={!canPost}
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

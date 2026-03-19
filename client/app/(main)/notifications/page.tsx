"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, AtSign, Bell, Loader2, Check } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { NotificationAPI } from "@/lib/social";
import { tokenManager } from "@/lib/tokenManager";
import type { Notification } from "@/types/social";
import { io, Socket } from "socket.io-client";

dayjs.extend(relativeTime);

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:3001";

const TYPE_ICON: Record<string, React.ReactNode> = {
  like: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />,
  comment: <MessageCircle className="w-3.5 h-3.5 text-blue-500" />,
  reply: <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />,
  follow: <UserPlus className="w-3.5 h-3.5 text-green-500" />,
  mention: <AtSign className="w-3.5 h-3.5 text-violet-500" />,
};

const TYPE_TEXT: Record<string, string> = {
  like: "liked your post",
  comment: "commented on your post",
  reply: "replied to your comment",
  follow: "started following you",
  mention: "mentioned you",
};

type FilterTab = "all" | "mentions" | "likes" | "follows";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const qc = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => NotificationAPI.getAll(pageParam as number).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (page) => (page as Notification[]).length === 20 ? undefined : undefined,
  });

  const markAllMut = useMutation({
    mutationFn: () => NotificationAPI.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneMut = useMutation({
    mutationFn: (id: string) => NotificationAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Real-time socket
  useEffect(() => {
    const token = tokenManager.get();
    if (!token) return;

    const socket: Socket = io(`${API_URL}/notifications`, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("notification", () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => { socket.disconnect(); };
  }, [qc]);

  const allNotifs = data?.pages.flat() ?? [];
  const filtered = allNotifs.filter((n) => {
    if (filter === "all") return true;
    if (filter === "likes") return n.type === "like";
    if (filter === "mentions") return n.type === "mention" || n.type === "comment" || n.type === "reply";
    if (filter === "follows") return n.type === "follow";
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "mentions", label: "Mentions" },
    { key: "likes", label: "Likes" },
    { key: "follows", label: "Follows" },
  ];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        {allNotifs.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => markAllMut.mutate()}>
            <Check className="w-3.5 h-3.5 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${filter === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
            {filter === t.key && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div>
          {filtered.map((notif) => {
            const senderName = [notif.sender.firstName, notif.sender.lastName].filter(Boolean).join(" ") || notif.sender.username;
            return (
              <div
                key={notif._id}
                className={`flex items-start gap-3 px-5 py-3.5 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}
                onClick={() => !notif.isRead && markOneMut.mutate(notif._id)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notif.sender.avatar ?? ""} />
                    <AvatarFallback>{senderName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                    {TYPE_ICON[notif.type]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{senderName}</span>{" "}
                    <span className="text-muted-foreground">{TYPE_TEXT[notif.type]}</span>
                  </p>
                  {notif.post?.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.post.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{dayjs(notif.createdAt).fromNow()}</p>
                </div>
                {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                {notif.post?.images?.[0] && (
                  <img src={notif.post.images[0].url} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                )}
              </div>
            );
          })}
          {hasNextPage && (
            <div className="flex justify-center py-6">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

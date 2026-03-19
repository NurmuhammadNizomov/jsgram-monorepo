"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign, Bell } from "lucide-react";

const TABS = ["All", "Mentions", "Likes", "Follows"];

type NType = "like" | "comment" | "follow" | "repost" | "mention";

interface Notif {
  id: number;
  type: NType;
  user: string;
  username: string;
  text: string;
  time: string;
  read: boolean;
  postPreview?: string;
}

const NOTIFS: Notif[] = [
  { id: 1, type: "like", user: "Sardor T.", username: "sardor_codes", text: "liked your post", time: "2m", read: false, postPreview: "Just shipped a new feature in JSGram! Real-time..." },
  { id: 2, type: "follow", user: "Kamola E.", username: "kamola_ux", text: "started following you", time: "5m", read: false },
  { id: 3, type: "comment", user: "Jasur M.", username: "jasur_ui", text: "replied to your post", time: "12m", read: false, postPreview: "TypeScript tip: use `satisfies` operator..." },
  { id: 4, type: "repost", user: "Malika H.", username: "malika_h", text: "reposted your post", time: "30m", read: true, postPreview: "Design systems are not about consistency..." },
  { id: 5, type: "mention", user: "Bobur A.", username: "bobur_a", text: "mentioned you in a post", time: "1h", read: true },
  { id: 6, type: "like", user: "Dilnoza Y.", username: "dilnoza_dev", text: "liked your reply", time: "2h", read: true },
  { id: 7, type: "follow", user: "Zulfiya N.", username: "zulfiya_n", text: "started following you", time: "3h", read: true },
  { id: 8, type: "like", user: "Azizbek K.", username: "azizbek_k", text: "and 23 others liked your post", time: "5h", read: true, postPreview: "Golden hour shoot in Tashkent 📸..." },
];

const typeIcon: Record<NType, React.ReactNode> = {
  like:    <Heart className="w-4 h-4 text-red-500 fill-current" />,
  comment: <MessageCircle className="w-4 h-4 text-primary" />,
  follow:  <UserPlus className="w-4 h-4 text-green-500" />,
  repost:  <Repeat2 className="w-4 h-4 text-green-500" />,
  mention: <AtSign className="w-4 h-4 text-primary" />,
};

const typeFilter: Record<string, NType[]> = {
  "All":     ["like", "comment", "follow", "repost", "mention"],
  "Mentions": ["mention"],
  "Likes":   ["like"],
  "Follows": ["follow"],
};

export default function NotificationsPage() {
  const [tab, setTab] = useState("All");
  const [notifs, setNotifs] = useState(NOTIFS);

  const filtered = notifs.filter(n => typeFilter[tab].includes(n.type));
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">Notifications</h1>
            {unread > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
              Mark all read
            </button>
          )}
        </div>

        <div className="flex border-b border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bell className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        filtered.map(notif => (
          <div
            key={notif.id}
            className={`flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer ${
              !notif.read ? "bg-primary/5" : ""
            }`}
          >
            {/* Icon overlay on avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm">{notif.user[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                {typeIcon[notif.type]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm">
                  <span className="font-semibold">{notif.user}</span>
                  {" "}
                  <span className="text-muted-foreground">{notif.text}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{notif.time}</span>
              </div>
              {notif.postPreview && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{notif.postPreview}</p>
              )}
            </div>

            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            )}
          </div>
        ))
      )}
    </div>
  );
}

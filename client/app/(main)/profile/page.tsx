"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Bookmark, Settings, Link as LinkIcon, MapPin, CalendarDays, MoreHorizontal } from "lucide-react";

const TABS = ["Posts", "Replies", "Media", "Likes"];

const POSTS = [
  { id: 1, content: "Just shipped a new feature in JSGram! Real-time notifications are live. 🚀", image: true, color: "from-violet-400 to-indigo-500", likes: 142, comments: 28, time: "2h" },
  { id: 2, content: "TypeScript + NestJS is the perfect combo for backend development. Change my mind.", image: false, likes: 891, comments: 67, time: "1d" },
  { id: 3, content: "Golden hour in Tashkent never disappoints 📸 #photography #tashkent", image: true, color: "from-orange-300 to-rose-400", likes: 2340, comments: 89, time: "3d" },
  { id: 4, content: "Design systems are not about consistency — they're about velocity. When your team stops making the same decisions, they focus on what matters.", image: false, likes: 567, comments: 44, time: "1w" },
  { id: 5, content: "Morning coffee + good music + open-source contribution. Perfect Saturday. ☕", image: true, color: "from-amber-400 to-orange-500", likes: 321, comments: 15, time: "2w" },
  { id: 6, content: "New blog post: 'Building Real-time Apps with Socket.io and NestJS' — link in bio.", image: false, likes: 435, comments: 32, time: "3w" },
];

const GRID = [
  "from-violet-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-amber-500",
  "from-cyan-400 to-sky-500",
  "from-red-400 to-rose-500",
];

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState("Posts");
  const [following, setFollowing] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user?.username ?? "My Profile";

  return (
    <div>
      {/* Cover */}
      <div className="h-36 md:h-48 bg-gradient-to-br from-primary via-purple-500 to-pink-500 relative">
        <button className="absolute top-3 right-3 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-500 text-primary-foreground">
              {displayName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 mt-10">
            <button className="p-2 rounded-full border border-border hover:bg-accent transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFollowing(!following)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                following
                  ? "border border-border hover:bg-accent text-foreground"
                  : "bg-foreground text-background hover:bg-foreground/90"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Name & bio */}
        <div className="space-y-2">
          <div>
            <h1 className="font-bold text-xl">{displayName}</h1>
            <p className="text-muted-foreground text-sm">@{user?.username ?? "username"}</p>
          </div>

          {user?.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Tashkent, Uzbekistan</span>
            <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /><span className="text-primary hover:underline cursor-pointer">jsgram.io</span></span>
            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />Joined March 2026</span>
          </div>

          {/* Stats */}
          <div className="flex gap-5 text-sm">
            <button className="hover:underline"><span className="font-bold">248</span> <span className="text-muted-foreground">Following</span></button>
            <button className="hover:underline"><span className="font-bold">3.4K</span> <span className="text-muted-foreground">Followers</span></button>
            <span><span className="font-bold">{POSTS.length}</span> <span className="text-muted-foreground">Posts</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "Posts" && (
        <div>
          {POSTS.map(post => (
            <article key={post.id} className="px-4 py-3 border-b border-border hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username} · {post.time}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-2">{post.content}</p>
              {"color" in post && post.color && (
                <div className={`rounded-2xl bg-gradient-to-br ${post.color} h-44 w-full mb-2`} />
              )}
              <div className="flex items-center gap-5 text-muted-foreground text-xs">
                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />{post.likes}
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />{post.comments}
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "Media" && (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {GRID.map((color, i) => (
            <div key={i} className={`aspect-square bg-gradient-to-br ${color} cursor-pointer hover:opacity-90 transition-opacity`} />
          ))}
        </div>
      )}

      {(tab === "Replies" || tab === "Likes") && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-muted-foreground text-sm">No {tab.toLowerCase()} yet</p>
        </div>
      )}
    </div>
  );
}

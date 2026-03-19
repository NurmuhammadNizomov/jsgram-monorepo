"use client";

import { Search, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const trends = [
  { topic: "#nextjs",     posts: "12.4K posts" },
  { topic: "#typescript", posts: "8.9K posts" },
  { topic: "#webdev",     posts: "34.1K posts" },
  { topic: "#openai",     posts: "21.7K posts" },
  { topic: "#jsgram",     posts: "1.2K posts" },
];

const suggestions = [
  { name: "Dilnoza Yusupova", username: "dilnoza_dev",   avatar: "" },
  { name: "Sardor Toshmatov", username: "sardor_codes",  avatar: "" },
  { name: "Kamola Ergasheva", username: "kamola_ux",     avatar: "" },
];

export function RightPanel() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-88 flex-shrink-0 py-4 pr-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search JSGram"
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Trends */}
      <div className="rounded-2xl bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Trending</span>
        </div>
        {trends.map((trend, i) => (
          <button
            key={i}
            className="w-full flex flex-col px-4 py-3 hover:bg-accent/50 transition-colors text-left"
          >
            <span className="font-semibold text-sm">{trend.topic}</span>
            <span className="text-xs text-muted-foreground">{trend.posts}</span>
          </button>
        ))}
        <button className="w-full px-4 py-3 text-sm text-primary hover:bg-accent/50 transition-colors text-left">
          Show more
        </button>
      </div>

      {/* Who to follow */}
      <div className="rounded-2xl bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Who to follow</span>
        </div>
        {suggestions.map((user, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors flex-shrink-0">
              Follow
            </button>
          </div>
        ))}
        <button className="w-full px-4 py-3 text-sm text-primary hover:bg-accent/50 transition-colors text-left">
          Show more
        </button>
      </div>

      <p className="text-xs text-muted-foreground px-1">
        &copy; {new Date().getFullYear()} JSGram
      </p>
    </aside>
  );
}

"use client";

import { useState } from "react";
import { Search, TrendingUp, Hash } from "lucide-react";

const TABS = ["For you", "Trending", "People", "Media"];

const TRENDS = [
  { tag: "#nextjs", posts: "12.4K", category: "Technology" },
  { tag: "#jsgram", posts: "3.2K", category: "Social" },
  { tag: "#typescript", posts: "8.9K", category: "Technology" },
  { tag: "#uzbekistan", posts: "45.1K", category: "Places" },
  { tag: "#webdev", posts: "34.7K", category: "Technology" },
  { tag: "#photography", posts: "21.3K", category: "Art" },
  { tag: "#openai", posts: "67.8K", category: "Technology" },
  { tag: "#tashkent", posts: "18.4K", category: "Places" },
];

const PEOPLE = [
  { name: "Dilnoza Yusupova", username: "dilnoza_dev", bio: "Full-stack dev. Building in public. ☕", followers: "12.4K", following: false },
  { name: "Sardor Toshmatov", username: "sardor_codes", bio: "TypeScript evangelist. Open source contributor.", followers: "8.9K", following: true },
  { name: "Kamola Ergasheva", username: "kamola_ux", bio: "UI/UX designer. Figma enthusiast.", followers: "21.3K", following: false },
  { name: "Jasur Mirzayev", username: "jasur_ui", bio: "Design systems. React. Coffee.", followers: "5.7K", following: false },
];

const GRID_COLORS = [
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

export default function ExplorePage() {
  const [tab, setTab] = useState("For you");
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState<Record<string, boolean>>(
    Object.fromEntries(PEOPLE.map(p => [p.username, p.following]))
  );

  return (
    <div>
      {/* Search */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search JSGram"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Tabs */}
        <div className="flex mt-3 gap-0 border-b border-border -mb-3">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3">
        {tab === "For you" && (
          /* Instagram explore grid */
          <div className="grid grid-cols-3 gap-0.5 px-0.5">
            {GRID_COLORS.map((color, i) => (
              <div
                key={i}
                className={`aspect-square bg-gradient-to-br ${color} cursor-pointer hover:opacity-90 transition-opacity relative ${
                  i === 4 ? "col-span-1 row-span-1" : ""
                }`}
              >
                {i === 0 && (
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">VIDEO</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "Trending" && (
          <div>
            {TRENDS.map((trend, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border/50"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{trend.category}</p>
                  <p className="font-semibold text-sm">{trend.tag}</p>
                  <p className="text-xs text-muted-foreground">{trend.posts} posts</p>
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {tab === "People" && (
          <div>
            {PEOPLE.map(person => (
              <div
                key={person.username}
                className="flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {person.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{person.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{person.bio}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{person.followers} followers</p>
                </div>
                <button
                  onClick={() => setFollowing(prev => ({ ...prev, [person.username]: !prev[person.username] }))}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors flex-shrink-0 ${
                    following[person.username]
                      ? "bg-muted border-border text-foreground"
                      : "bg-primary border-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {following[person.username] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Media" && (
          <div className="grid grid-cols-2 gap-0.5 px-0.5">
            {[...GRID_COLORS, ...GRID_COLORS.slice(0, 5)].map((color, i) => (
              <div
                key={i}
                className={`aspect-video bg-gradient-to-br ${color} cursor-pointer hover:opacity-90 transition-opacity`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

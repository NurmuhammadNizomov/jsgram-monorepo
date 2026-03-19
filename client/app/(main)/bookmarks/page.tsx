"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, LayoutGrid, List, Heart, MessageCircle, Repeat2, Trash2 } from "lucide-react";

const SAVED = [
  { id: 1, user: { name: "Sardor T.", username: "sardor_codes" }, time: "2d", content: "TypeScript tip: use `satisfies` operator to get the best of both type inference and type checking. Game changer!", image: false, likes: 891, comments: 67 },
  { id: 2, user: { name: "Kamola E.", username: "kamola_ux" }, time: "3d", content: "Golden hour shoot in Tashkent 📸", image: true, color: "from-orange-300 to-rose-400", likes: 2340, comments: 89 },
  { id: 3, user: { name: "Dilnoza Y.", username: "dilnoza_dev" }, time: "5d", content: "Just shipped a new feature in JSGram! Real-time notifications are live. 🚀", image: false, likes: 142, comments: 28 },
  { id: 4, user: { name: "Jasur M.", username: "jasur_ui" }, time: "1w", content: "Design systems are not about consistency — they're about velocity.", image: true, color: "from-violet-400 to-indigo-500", likes: 567, comments: 44 },
  { id: 5, user: { name: "Malika H.", username: "malika_h" }, time: "2w", content: "Morning coffee + good music + open-source contribution. Perfect Saturday. ☕", image: false, likes: 321, comments: 15 },
  { id: 6, user: { name: "Bobur A.", username: "bobur_a" }, time: "2w", content: "Mountains of Chimgan 🏔️ #nature #uzbekistan", image: true, color: "from-emerald-400 to-teal-500", likes: 1204, comments: 56 },
];

export default function BookmarksPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [saved, setSaved] = useState(SAVED);

  const remove = (id: number) => setSaved(prev => prev.filter(p => p.id !== id));

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Bookmarks</h1>
          <p className="text-xs text-muted-foreground">{saved.length} saved posts</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bookmark className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No saved posts yet</p>
        </div>
      ) : view === "list" ? (
        /* List view — Twitter style */
        <div>
          {saved.map(post => (
            <article key={post.id} className="flex gap-3 px-4 py-3 border-b border-border hover:bg-accent/20 transition-colors group">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="text-xs">{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-semibold text-sm">{post.user.name}</span>
                  <span className="text-muted-foreground text-xs">@{post.user.username} · {post.time}</span>
                  <button
                    onClick={() => remove(post.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed mb-2">{post.content}</p>
                {"color" in post && post.color && (
                  <div className={`rounded-xl bg-gradient-to-br ${post.color} h-36 w-full mb-2`} />
                )}
                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments}</span>
                  <span className="flex items-center gap-1 ml-auto text-primary"><Bookmark className="w-3.5 h-3.5 fill-current" /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Grid view — Instagram style */
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {saved.map(post => (
            <div key={post.id} className="aspect-square relative group cursor-pointer">
              {"color" in post && post.color ? (
                <div className={`w-full h-full bg-gradient-to-br ${post.color}`} />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center p-3">
                  <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-4">
                    {post.content}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current" />{post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

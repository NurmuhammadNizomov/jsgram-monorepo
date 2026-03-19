"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Image, Smile, MapPin, Send } from "lucide-react";

const STORIES = [
  { id: 1, user: "dilnoza", avatar: "", seen: false },
  { id: 2, user: "sardor", avatar: "", seen: false },
  { id: 3, user: "kamola", avatar: "", seen: true },
  { id: 4, user: "jasur", avatar: "", seen: false },
  { id: 5, user: "malika", avatar: "", seen: true },
  { id: 6, user: "bobur", avatar: "", seen: false },
  { id: 7, user: "zulfiya", avatar: "", seen: true },
];

const POSTS = [
  {
    id: 1,
    user: { name: "Dilnoza Yusupova", username: "dilnoza_dev", avatar: "" },
    time: "2m",
    content: "Just shipped a new feature in JSGram! Real-time notifications are live. The tech stack is Next.js + NestJS + MongoDB. So excited! 🚀",
    image: true,
    imageColor: "from-violet-400 to-indigo-500",
    likes: 142, comments: 28, reposts: 12, saved: false, liked: false,
  },
  {
    id: 2,
    user: { name: "Sardor Toshmatov", username: "sardor_codes", avatar: "" },
    time: "15m",
    content: "TypeScript tip: use `satisfies` operator to get the best of both type inference and type checking. Game changer for large codebases.",
    image: false,
    likes: 891, comments: 67, reposts: 203, saved: true, liked: true,
  },
  {
    id: 3,
    user: { name: "Kamola Ergasheva", username: "kamola_ux", avatar: "" },
    time: "1h",
    content: "Golden hour shoot in Tashkent 📸 Nothing beats natural light.",
    image: true,
    imageColor: "from-orange-300 to-rose-400",
    likes: 2340, comments: 89, reposts: 45, saved: false, liked: false,
  },
  {
    id: 4,
    user: { name: "Jasur Mirzayev", username: "jasur_ui", avatar: "" },
    time: "3h",
    content: "Design systems are not about consistency — they're about velocity. When your team stops making the same decisions over and over, they can focus on what actually matters.",
    image: false,
    likes: 567, comments: 44, reposts: 189, saved: false, liked: false,
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(POSTS);
  const [draft, setDraft] = useState("");

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleSave = (id: number) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, saved: !p.saved } : p
    ));
  };

  return (
    <div>
      {/* Stories */}
      <div className="flex gap-3 px-4 py-3 border-b border-border overflow-x-auto scrollbar-none">
        {/* Add story */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
            <span className="text-xl text-muted-foreground">+</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Your story</span>
        </div>

        {STORIES.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <div className={`w-14 h-14 rounded-full p-0.5 ${s.seen ? "bg-muted" : "bg-gradient-to-tr from-primary via-purple-500 to-pink-500"}`}>
              <div className="w-full h-full rounded-full bg-background p-0.5">
                <div className="w-full h-full rounded-full bg-muted" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground max-w-[56px] truncate">{s.user}</span>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="flex gap-3 px-4 py-3 border-b border-border">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className="text-xs">Me</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="What's happening?"
            rows={1}
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground resize-none outline-none pt-1.5"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-primary">
              <button className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"><Image className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"><Smile className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"><MapPin className="w-4 h-4" /></button>
            </div>
            <button
              disabled={!draft.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold disabled:opacity-40 transition-opacity"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      {posts.map(post => (
        <article key={post.id} className="border-b border-border hover:bg-accent/20 transition-colors">
          <div className="flex gap-3 px-4 pt-4 pb-3">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback className="text-xs">{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-semibold text-sm">{post.user.name}</span>
                <span className="text-muted-foreground text-sm">@{post.user.username}</span>
                <span className="text-muted-foreground text-xs">· {post.time}</span>
                <button className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed mb-3">{post.content}</p>

              {post.image && (
                <div className={`rounded-2xl bg-gradient-to-br ${post.imageColor} mb-3 h-52 w-full`} />
              )}

              <div className="flex items-center gap-5 text-muted-foreground">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors hover:text-red-500 ${post.liked ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-green-500 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                  {post.reposts}
                </button>
                <button
                  onClick={() => toggleSave(post.id)}
                  className={`flex items-center gap-1.5 text-xs ml-auto transition-colors hover:text-primary ${post.saved ? "text-primary" : ""}`}
                >
                  <Bookmark className={`w-4 h-4 ${post.saved ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

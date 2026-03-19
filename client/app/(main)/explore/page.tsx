"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, TrendingUp, Hash, Users, ImageIcon } from "lucide-react";
import { PostAPI, UserAPI, FollowAPI, HashtagAPI } from "@/lib/social";
import type { Post } from "@/types/social";
import type { User } from "@/types/auth";

type Tab = "foryou" | "trending" | "people" | "media";

function UserCard({ user }: { user: User & { isFollowing?: boolean } }) {
  const router = useRouter();
  const qc = useQueryClient();
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  const [following, setFollowing] = useState(!!user.isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await FollowAPI.toggle(user._id);
      setFollowing(res.data.following);
      // invalidate stories so new following's stories appear in feed
      qc.invalidateQueries({ queryKey: ["stories-feed"] });
    } catch {
      // keep current state on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => router.push(`/profile?u=${user.username}`)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={(user as any).avatar ?? ""} />
          <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-muted-foreground text-xs">@{user.username}</p>
          {(user as any).bio && <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{(user as any).bio}</p>}
        </div>
      </div>
      <Button
        variant={following ? "outline" : "default"}
        size="sm" className="rounded-full text-xs h-7 px-4"
        onClick={handleFollow}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : following ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("foryou");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  const exploreQuery = useQuery({
    queryKey: ["explore-posts"],
    queryFn: () => PostAPI.getExplore().then((r) => r.data),
    enabled: tab === "foryou" || tab === "media",
  });

  const searchQuery = useQuery({
    queryKey: ["user-search", debouncedSearch],
    queryFn: () => UserAPI.search(debouncedSearch).then((r) => r.data),
    enabled: debouncedSearch.length >= 2,
  });

  const suggestedQuery = useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => UserAPI.getSuggested(20).then((r) => r.data),
    enabled: tab === "people" && !debouncedSearch,
  });

  const trendingQuery = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: () => HashtagAPI.trending(30).then((r) => r.data),
    enabled: tab === "trending",
  });

  const explorePosts = exploreQuery.data ?? [];
  // Server already returns only image posts for explore
  const mediaPosts = explorePosts;
  const peopleList: (User & { isFollowing?: boolean })[] =
    (debouncedSearch.length >= 2 ? searchQuery.data : suggestedQuery.data) ?? [];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "foryou", label: "For you", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "trending", label: "Trending", icon: <Hash className="w-4 h-4" /> },
    { key: "people", label: "People", icon: <Users className="w-4 h-4" /> },
    { key: "media", label: "Media", icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <div>
      {/* Header + Search */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 space-y-3">
        <h1 className="text-xl font-bold">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-muted border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-2 text-sm font-medium transition-colors relative flex items-center justify-center gap-1 ${tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon}{t.label}
              {tab === t.key && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Search results overlay */}
      {debouncedSearch.length >= 2 && (
        <div className="border-b border-border">
          {searchQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : peopleList.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No users found for "{debouncedSearch}"</p>
          ) : (
            peopleList.map((u) => <UserCard key={u._id} user={u}  />)
          )}
        </div>
      )}

      {/* Tab content */}
      {!debouncedSearch && (
        <>
          {tab === "foryou" && (
            exploreQuery.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-0.5 p-0.5">
                {explorePosts.map((post: Post) => (
                  <div key={post._id} className="aspect-square bg-muted group relative cursor-pointer">
                    {post.images[0] ? (
                      <img src={post.images[0].url} className="w-full h-full object-cover" alt="" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3">
                        <p className="text-xs text-muted-foreground line-clamp-5 text-center">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "trending" && (
            trendingQuery.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (trendingQuery.data ?? []).length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-sm">No trending hashtags yet</p>
            ) : (
              <div>
                {(trendingQuery.data ?? []).map((item, i) => (
                  <div key={item.tag} className="px-5 py-3.5 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                    <p className="text-xs text-muted-foreground">#{i + 1} Trending</p>
                    <p className="font-semibold">#{item.tag}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.postsCount.toLocaleString()} posts</p>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "people" && (
            suggestedQuery.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div>
                <p className="px-5 py-3 text-sm font-medium text-muted-foreground">Suggested for you</p>
                {peopleList.map((u) => <UserCard key={u._id} user={u}  />)}
              </div>
            )
          )}

          {tab === "media" && (
            exploreQuery.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {mediaPosts.map((post: Post) => (
                  <div key={post._id} className="aspect-square bg-muted cursor-pointer">
                    <img src={post.images[0].url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, LayoutGrid, List, Loader2, BookmarkX } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PostAPI } from "@/lib/social";
import type { Post } from "@/types/social";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function BookmarksPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const qc = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam = 1 }) => PostAPI.getBookmarks(pageParam as number).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (page) => (page as Post[]).length === 20 ? undefined : undefined,
  });

  const unbookmarkMut = useMutation({
    mutationFn: (id: string) => PostAPI.toggleBookmark(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Removed from bookmarks");
    },
  });

  const posts = data?.pages.flat() ?? [];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <div className="flex items-center gap-1">
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("list")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("grid")}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No saved posts yet</p>
          <p className="text-sm">Posts you save will appear here</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {posts.map((post) => (
            <div key={post._id} className="relative aspect-square group cursor-pointer bg-muted">
              {post.images[0] ? (
                <img src={post.images[0].url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <p className="text-xs text-muted-foreground line-clamp-4">{post.content}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 text-white text-sm">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likesCount}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.commentsCount}</span>
              </div>
              <button
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                onClick={() => unbookmarkMut.mutate(post._id)}
              >
                <BookmarkX className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {posts.map((post) => {
            const authorName = [post.author.firstName, post.author.lastName].filter(Boolean).join(" ") || post.author.username;
            return (
              <article key={post._id} className="px-5 py-4 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={post.author.avatar ?? ""} />
                    <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{authorName}</span>
                      <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{dayjs(post.createdAt).fromNow()}</span>
                    </div>
                    {post.content && <p className="text-sm mt-1">{post.content}</p>}
                    {post.images[0] && (
                      <img src={post.images[0].url} className="mt-2 rounded-xl max-h-64 w-full object-cover" alt="" />
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />{post.likesCount}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />{post.commentsCount}
                      </span>
                      <button
                        className="flex items-center gap-1.5 text-sm text-primary ml-auto hover:text-muted-foreground transition-colors"
                        onClick={() => unbookmarkMut.mutate(post._id)}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
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

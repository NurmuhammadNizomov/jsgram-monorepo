"use client";

import { useState, useRef } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal,
  Plus, Loader2, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PostAPI, StoryAPI } from "@/lib/social";
import { useAuthStore } from "@/store/authStore";
import type { Post, StoryGroup } from "@/types/social";
import { StoryViewer } from "@/components/stories/StoryViewer";

dayjs.extend(relativeTime);

// ── Story bar ──────────────────────────────────────────────────────────────
function StoryBar({
  groups,
  myGroupIdx,
  onOpen,
  onUploaded,
}: {
  groups: StoryGroup[];
  myGroupIdx: number;
  onOpen: (idx: number) => void;
  onUploaded: () => void;
}) {
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const myGroup = myGroupIdx !== -1 ? groups[myGroupIdx] : null;
  // unread stories first, then viewed
  const otherGroups = groups
    .filter((_, i) => i !== myGroupIdx)
    .sort((a, b) => (b.hasUnread ? 1 : 0) - (a.hasUnread ? 1 : 0));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await StoryAPI.create(file);
      toast.success("Story added!");
      onUploaded();
    } catch {
      toast.error("Failed to upload story");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-3 px-5 py-4 overflow-x-auto scrollbar-none border-b border-border">
      {/* My story — one item, ring if has stories */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
        <div
          className="relative"
          onClick={() => {
            if (myGroup && myGroupIdx !== -1) onOpen(myGroupIdx);
            else fileRef.current?.click();
          }}
        >
          <Avatar className={`w-14 h-14 ring-2 ${myGroup ? "ring-primary" : "ring-border"}`}>
            <AvatarImage src={user?.avatar ?? ""} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </span>
        </div>
        <span className="text-xs text-muted-foreground truncate w-14 text-center">
          {uploading ? "Uploading…" : "Your story"}
        </span>
      </div>

      {otherGroups.map((g) => {
        const idx = groups.indexOf(g);
        return (
          <div
            key={(g.author as any)._id}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
            onClick={() => onOpen(idx)}
          >
            <Avatar className={`w-14 h-14 ring-2 ${g.hasUnread ? "ring-primary" : "ring-muted"}`}>
              <AvatarImage src={g.author.avatar ?? ""} />
              <AvatarFallback>{g.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate w-14 text-center">{g.author.username}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Post card ──────────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();
  const isOwner = me?._id === post.author._id;

  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const likeMut = useMutation({
    mutationFn: () => PostAPI.toggleLike(post._id),
    onMutate: () => {
      setLiked((p) => !p);
      setLikesCount((p) => liked ? p - 1 : p + 1);
    },
    onError: () => { setLiked((p) => !p); setLikesCount((p) => liked ? p + 1 : p - 1); },
  });

  const bookmarkMut = useMutation({
    mutationFn: () => PostAPI.toggleBookmark(post._id),
    onMutate: () => setBookmarked((p) => !p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
    onError: () => setBookmarked((p) => !p),
  });

  const deleteMut = useMutation({
    mutationFn: () => PostAPI.delete(post._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const editMut = useMutation({
    mutationFn: () => PostAPI.update(post._id, editContent),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post updated");
    },
    onError: () => toast.error("Failed to update post"),
  });

  const authorName = [post.author.firstName, post.author.lastName].filter(Boolean).join(" ") || post.author.username;

  return (
    <article className="px-5 py-4 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={post.author.avatar ?? ""} />
          <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm truncate">{authorName}</span>
              <span className="text-muted-foreground text-sm flex-shrink-0">@{post.author.username}</span>
              <span className="text-muted-foreground text-sm flex-shrink-0">·</span>
              <span className="text-muted-foreground text-sm flex-shrink-0">{dayjs(post.createdAt).fromNow()}</span>
            </div>

            {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => { setEditContent(post.content); setEditing(true); }}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteMut.mutate()}
                    disabled={deleteMut.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMut.isPending ? "Deleting…" : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="resize-none text-sm min-h-[80px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => editMut.mutate()} disabled={editMut.isPending || !editContent.trim()}>
                  {editMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            post.content && <p className="text-sm mt-1 leading-relaxed">{post.content}</p>
          )}

          {post.images.length > 0 && (
            <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${post.images.length > 1 ? "grid-cols-2" : ""}`}>
              {post.images.map((img, i) => (
                <img key={i} src={img.url} className="w-full object-cover max-h-72" alt="" loading="lazy" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-5 mt-3">
            <button
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
              onClick={() => likeMut.mutate()}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </button>

            <button
              className={`flex items-center gap-1.5 text-sm ml-auto transition-colors ${bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              onClick={() => bookmarkMut.mutate()}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [storyOpen, setStoryOpen] = useState<number | null>(null);

  const storiesQuery = useQuery({
    queryKey: ["stories-feed"],
    queryFn: () => StoryAPI.getFeed().then((r) => r.data),
  });

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) => PostAPI.getFeed(pageParam as number).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      (lastPage as Post[]).length === 20 ? allPages.length + 1 : undefined,
  });

  const posts = feedQuery.data?.pages.flat() ?? [];
  const storyGroups = storiesQuery.data ?? [];
  const myGroupIdx = storyGroups.findIndex(
    (g) => g.author.username === user?.username || (g.author as any)._id === user?._id
  );

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      {/* Stories */}
      <StoryBar
        groups={storyGroups}
        myGroupIdx={myGroupIdx}
        onOpen={(i) => setStoryOpen(i)}
        onUploaded={() => qc.invalidateQueries({ queryKey: ["stories-feed"] })}
      />

      {storyOpen !== null && (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={storyOpen}
          onClose={() => {
            setStoryOpen(null);
            qc.invalidateQueries({ queryKey: ["stories-feed"] });
          }}
        />
      )}


      {/* Feed */}
      {feedQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No posts yet. Follow people to see their posts!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
          {feedQuery.hasNextPage && (
            <div className="flex justify-center py-6">
              <Button
                variant="outline" size="sm"
                onClick={() => feedQuery.fetchNextPage()}
                disabled={feedQuery.isFetchingNextPage}
              >
                {feedQuery.isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

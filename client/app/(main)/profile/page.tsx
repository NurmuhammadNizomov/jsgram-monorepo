"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Bookmark, Grid3x3, FileText, Loader2, Settings, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PostAPI, UserAPI, FollowAPI, StoryAPI } from "@/lib/social";
import { useAuthStore } from "@/store/authStore";
import { StoryViewer } from "@/components/stories/StoryViewer";
import type { Post } from "@/types/social";
import type { User } from "@/types/auth";
import { toast } from "sonner";

dayjs.extend(relativeTime);

type Tab = "posts" | "media" | "likes";
type ListType = "followers" | "following" | null;

// ── Followers / Following modal ────────────────────────────────────────────
function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: ListType;
  onClose: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["follow-list", userId, type],
    queryFn: () =>
      type === "followers"
        ? FollowAPI.getFollowers(userId).then((r) => r.data)
        : FollowAPI.getFollowing(userId).then((r) => r.data),
    enabled: !!type,
  });

  const followMut = useMutation({
    mutationFn: (u: User & { isFollowing?: boolean }) =>
      FollowAPI.toggle(u._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-list", userId, type] });
    },
  });

  const users = (listQuery.data ?? []) as (User & { isFollowing?: boolean })[];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {listQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground text-sm">
              No {type} yet
            </p>
          ) : (
            users.map((u) => {
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username;
              return (
                <div key={u._id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => { router.push(`/profile?u=${u.username}`); onClose(); }}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={(u as any).avatar ?? ""} />
                      <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{name}</p>
                      <p className="text-muted-foreground text-xs">@{u.username}</p>
                    </div>
                  </button>
                  <Button
                    variant={u.isFollowing ? "outline" : "default"}
                    size="sm" className="rounded-full text-xs h-7 px-4 flex-shrink-0 ml-2"
                    onClick={() => followMut.mutate(u)}
                    disabled={followMut.isPending}
                  >
                    {u.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Profile page ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("u");
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("posts");
  const [followList, setFollowList] = useState<ListType>(null);
  const [storyOpen, setStoryOpen] = useState(false);

  const targetId = identifier ?? me?._id ?? "";
  const isMe = !identifier || identifier === me?._id || identifier === me?.username;

  const profileQuery = useQuery({
    queryKey: ["profile", targetId],
    queryFn: () => UserAPI.getByIdentifier(targetId).then((r) => r.data),
    enabled: !!targetId,
    staleTime: 0,
    gcTime: 0,
  });

  const postsQuery = useQuery({
    queryKey: ["user-posts", targetId],
    queryFn: () => PostAPI.getUserPosts(profileQuery.data?._id ?? targetId).then((r) => r.data),
    enabled: !!profileQuery.data,
  });

  const storiesQuery = useQuery({
    queryKey: ["profile-stories", profileQuery.data?._id],
    queryFn: async () => {
      const res = await StoryAPI.getByUser(profileQuery.data!._id);
      return res.data ? [res.data] : [];
    },
    enabled: !!profileQuery.data,
    staleTime: 0,
  });

  const followMut = useMutation({
    mutationFn: () => FollowAPI.toggle(profile!._id),
    onSuccess: (res) => {
      const isNowFollowing = res.data.following;
      qc.setQueryData(["profile", targetId], (old: typeof profile) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: isNowFollowing,
          followersCount: (old as any).followersCount + (isNowFollowing ? 1 : -1),
        };
      });
      toast.success(isNowFollowing ? "Followed" : "Unfollowed");
      qc.invalidateQueries({ queryKey: ["stories-feed"] });
    },
  });

  const profile = profileQuery.data;
  const posts = postsQuery.data ?? [];
  const mediaPosts = posts.filter((p: Post) => p.images.length > 0);

  if (profileQuery.isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!profile) return null;

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold truncate">{displayName}</h1>
        {isMe && (
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary/30 to-violet-500/30" />
        <div className="px-5 pb-4">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {(() => {
              const hasStory = (storiesQuery.data?.length ?? 0) > 0;
              return (
                <button
                  className={`rounded-full p-0.5 ${hasStory ? "bg-gradient-to-tr from-primary to-violet-500" : "bg-transparent"}`}
                  onClick={() => hasStory && setStoryOpen(true)}
                  style={{ cursor: hasStory ? "pointer" : "default" }}
                >
                  <Avatar className="w-20 h-20 ring-4 ring-background">
                    <AvatarImage src={profile.avatar ?? ""} />
                    <AvatarFallback className="text-2xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              );
            })()}
            {isMe ? (
              <Link href="/settings">
                <Button variant="outline" size="sm" className="rounded-full">Edit profile</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={profile.isFollowing ? "outline" : "default"}
                  size="sm" className="rounded-full px-5"
                  onClick={() => followMut.mutate()}
                  disabled={followMut.isPending}
                >
                  {followMut.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : profile.isFollowing ? "Unfollow" : "Follow"
                  }
                </Button>
                <Link href={`/messages?u=${profile._id}`}>
                  <Button variant="outline" size="sm" className="rounded-full px-4 gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Message
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground text-sm">@{profile.username}</p>
          {(profile as any).bio && <p className="text-sm mt-2">{(profile as any).bio}</p>}

          {/* Stats — bosganda modal ochiladi */}
          <div className="flex gap-5 mt-4">
            <div className="text-center">
              <p className="font-bold text-lg">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <button
              className="text-center hover:opacity-70 transition-opacity"
              onClick={() => setFollowList("followers")}
            >
              <p className="font-bold text-lg">{(profile as any).followersCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </button>
            <button
              className="text-center hover:opacity-70 transition-opacity"
              onClick={() => setFollowList("following")}
            >
              <p className="font-bold text-lg">{(profile as any).followingCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["posts", "media", "likes"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative capitalize flex items-center justify-center gap-1 ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab(t)}
          >
            {t === "posts" && <FileText className="w-4 h-4" />}
            {t === "media" && <Grid3x3 className="w-4 h-4" />}
            {t === "likes" && <Heart className="w-4 h-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tab === t && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      {postsQuery.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {tab === "posts" && (
            posts.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-sm">No posts yet</p>
            ) : (
              <div>
                {posts.map((post: Post) => (
                  <article key={post._id} className="px-5 py-4 border-b border-border">
                    {post.content && <p className="text-sm">{post.content}</p>}
                    {post.images[0] && (
                      <img src={post.images[0].url} className="mt-2 rounded-xl max-h-72 w-full object-cover" alt="" loading="lazy" />
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.commentsCount}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-4 h-4" />{post.bookmarksCount}</span>
                      <span className="ml-auto">{dayjs(post.createdAt).fromNow()}</span>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}

          {tab === "media" && (
            mediaPosts.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-sm">No media yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {mediaPosts.map((post: Post) => (
                  <div key={post._id} className="aspect-square">
                    <img src={post.images[0].url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "likes" && (
            <p className="text-center py-12 text-muted-foreground text-sm">Likes are private</p>
          )}
        </>
      )}

      {/* Followers / Following modal */}
      {followList && (
        <FollowListModal
          userId={profile._id}
          type={followList}
          onClose={() => {
            setFollowList(null);
            qc.invalidateQueries({ queryKey: ["profile", targetId] });
          }}
        />
      )}

      {/* Story viewer */}
      {storyOpen && (storiesQuery.data?.length ?? 0) > 0 && (
        <StoryViewer
          groups={storiesQuery.data!}
          initialGroupIndex={0}
          onClose={() => setStoryOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { StoryAPI, ChatAPI } from "@/lib/social";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { StoryGroup } from "@/types/social";

dayjs.extend(relativeTime);

interface Props {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export function StoryViewer({ groups, initialGroupIndex, onClose }: Props) {
  const { user: me } = useAuthStore();
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const isOwn = me?._id === (group?.author as any)?._id || me?.username === group?.author?.username;

  // Per-story like state
  const [liked, setLiked] = useState(story?.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(story?.likesCount ?? 0);

  // Reset like state when story changes
  useEffect(() => {
    setLiked(story?.isLiked ?? false);
    setLikesCount(story?.likesCount ?? 0);
  }, [story?._id]);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goNext = useCallback(() => {
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx((i) => i + 1);
      setProgress(0);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setStoryIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIdx, group, groupIdx, groups, onClose]);

  const goPrev = () => {
    if (storyIdx > 0) { setStoryIdx((i) => i - 1); setProgress(0); }
    else if (groupIdx > 0) { setGroupIdx((i) => i - 1); setStoryIdx(0); setProgress(0); }
  };

  // Mark viewed
  useEffect(() => {
    if (story) StoryAPI.markViewed(story._id).catch(() => null);
  }, [story?._id]);

  const isVideo = story?.mediaType === 'video';

  // Pause/resume video on hold
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (paused) v.pause();
    else v.play().catch(() => null);
  }, [paused, isVideo]);

  // Auto-progress (only for images)
  const isPaused = paused || document.activeElement === inputRef.current;
  useEffect(() => {
    if (isPaused || !story || isVideo) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { goNext(); return 0; }
        return p + (100 / (STORY_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused, story, goNext, isVideo]);

  const handleLike = async () => {
    if (!story) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => next ? c + 1 : c - 1);
    try {
      await StoryAPI.toggleLike(story._id);
    } catch {
      setLiked(!next);
      setLikesCount((c) => next ? c - 1 : c + 1);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || sending || !story) return;
    const authorId = (story.author as any)._id ?? story.author;
    setSending(true);
    try {
      await ChatAPI.sendDirect(authorId, reply.trim(), {
        storyId: story._id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
      });
      setReply("");
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (!group || !story) return null;

  const authorName = [group.author.firstName, group.author.lastName].filter(Boolean).join(" ") || group.author.username;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative w-full max-w-sm h-full max-h-[812px] bg-black select-none">
        {/* Progress bars */}
        <div className="absolute top-3 inset-x-3 z-10 flex gap-1">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 inset-x-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 ring-2 ring-white">
              <AvatarImage src={group.author.avatar ?? ""} />
              <AvatarFallback className="text-xs">{authorName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-semibold leading-none">{authorName}</p>
              <p className="text-white/70 text-xs mt-0.5">{dayjs(story.createdAt).fromNow()}</p>
            </div>
          </div>
          <button className="text-white p-1" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story media */}
        {story.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={story.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            loop={false}
            onTimeUpdate={() => {
              const v = videoRef.current;
              if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
            }}
            onEnded={goNext}
          />
        ) : (
          <img
            src={story.mediaUrl}
            className="w-full h-full object-cover"
            alt=""
            draggable={false}
          />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-20 inset-x-4 z-10">
            <p className="text-white text-sm text-center drop-shadow">{story.caption}</p>
          </div>
        )}

        {/* Bottom bar: like + reply */}
        <div
          className="absolute bottom-0 inset-x-0 z-10 px-4 py-3 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors flex-shrink-0 ${liked ? "text-rose-500" : "text-white/80 hover:text-rose-400"}`}
            onClick={handleLike}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
            {likesCount > 0 && <span className="text-white text-xs">{likesCount}</span>}
          </button>

          {/* Reply input (only for other people's stories) */}
          {!isOwn && (
            <>
              <input
                ref={inputRef}
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Reply..."
                className="flex-1 bg-white/15 text-white placeholder:text-white/50 text-sm rounded-full px-4 py-2 outline-none border border-white/20 focus:border-white/50 transition-colors"
              />
              <button
                className="text-white/80 hover:text-white flex-shrink-0 disabled:opacity-40 transition-colors"
                onClick={handleReply}
                disabled={!reply.trim() || sending}
              >
                <Send className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Tap zones */}
        <button className="absolute left-0 top-0 w-1/3 h-4/5 z-20 opacity-0" onClick={goPrev} />
        <button className="absolute right-0 top-0 w-1/3 h-4/5 z-20 opacity-0" onClick={goNext} />
      </div>

      {/* Side navigation (desktop) */}
      {groupIdx > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition hidden md:flex"
          onClick={() => { setGroupIdx((i) => i - 1); setStoryIdx(0); setProgress(0); }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {groupIdx < groups.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition hidden md:flex"
          onClick={() => { setGroupIdx((i) => i + 1); setStoryIdx(0); setProgress(0); }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

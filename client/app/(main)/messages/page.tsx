"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { UserAPI } from "@/lib/social";
import { tokenManager } from "@/lib/tokenManager";
import { getSocket, connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Edit, Send, Smile, Paperclip, Check, CheckCheck, MoreVertical, Ban } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Participant {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface StoryReply {
  storyId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

interface ConversationMessage {
  _id: string;
  conversationId: string;
  sender: Participant;
  text: string;
  storyReply?: StoryReply | null;
  readBy: string[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: ConversationMessage | null;
  lastMessageAt?: string;
  isBlocked?: boolean;
}

function getOtherParticipant(conv: Conversation, myId: string): Participant | undefined {
  return conv.participants.find(p => p._id !== myId);
}

function formatLastSeen(lastSeen?: string) {
  if (!lastSeen) return "last seen a while ago";
  return `last seen ${dayjs(lastSeen).fromNow()}`;
}

// Generic blocked-user placeholder
const JSGRAM_ACCOUNT: Participant = {
  _id: "__blocked__",
  username: "JSGram Account",
  firstName: "JSGram",
  lastName: "Account",
  isOnline: false,
};

export default function MessagesPage() {
  const user = useAuthStore(s => s.user);
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("u");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeConv = conversations.find(c => c._id === activeId);
  const isActiveBlocked = activeConv?.isBlocked ?? false;
  const otherUser = activeConv && user
    ? (isActiveBlocked ? JSGRAM_ACCOUNT : getOtherParticipant(activeConv, user._id))
    : pendingUser;

  // Load conversations, then auto-open ?u= target
  useEffect(() => {
    api.get<Conversation[]>('/conversations').then(async r => {
      const seen = new Set<string>();
      const convs: Conversation[] = (r.data as Conversation[]).filter(c => {
        const other = user ? c.participants.find(p => p._id !== user._id) : null;
        if (!other) return true;
        if (seen.has(other._id)) return false;
        seen.add(other._id);
        return true;
      });
      setConversations(convs);

      if (targetUserId) {
        const existing = convs.find(c => c.participants.some(p => p._id === targetUserId));
        if (existing) {
          setActiveId(existing._id);
          setPendingUser(null);
        } else {
          try {
            const res = await api.get<Participant>(`/users/${targetUserId}`);
            setPendingUser(res.data);
            setActiveId(null);
            setMessages([]);
          } catch {}
        }
      }
    }).catch(() => {});
  }, [targetUserId]);

  // Socket setup
  useEffect(() => {
    const token = tokenManager.get();
    if (!token) return;

    const s = connectSocket(token);

    s.on('new_message', (msg: ConversationMessage) => {
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c =>
        c._id === msg.conversationId
          ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
          : c
      ).sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()));
    });

    s.on('typing', ({ userId, conversationId, isTyping }: { userId: string; conversationId: string; isTyping: boolean }) => {
      setTyping(prev => ({ ...prev, [`${conversationId}_${userId}`]: isTyping }));
    });

    s.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
      setConversations(prev => prev.map(c => ({
        ...c,
        participants: c.participants.map(p => p._id === userId ? { ...p, isOnline: true } : p),
      })));
    });

    s.on('user_offline', ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
      setConversations(prev => prev.map(c => ({
        ...c,
        participants: c.participants.map(p => p._id === userId ? { ...p, isOnline: false, lastSeen } : p),
      })));
    });

    return () => {
      s.off('new_message');
      s.off('typing');
      s.off('user_online');
      s.off('user_offline');
    };
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    api.get<ConversationMessage[]>(`/conversations/${activeId}/messages`).then(r => {
      setMessages(r.data);
      getSocket().emit('join_conversation', activeId);
      getSocket().emit('mark_read', { conversationId: activeId });
    }).catch(() => {});
  }, [activeId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!draft.trim() || isActiveBlocked) return;
    const text = draft.trim();
    setDraft("");

    if (!activeId && pendingUser) {
      try {
        const res = await api.post<Conversation>('/conversations', { participantId: pendingUser._id });
        const newConv: Conversation = res.data;
        setConversations(prev => prev.some(c => c._id === newConv._id) ? prev : [newConv, ...prev]);
        setActiveId(newConv._id);
        setPendingUser(null);
        getSocket().emit('join_conversation', newConv._id);
        getSocket().emit('send_message', { conversationId: newConv._id, text });
      } catch {}
      return;
    }

    if (!activeId) return;
    getSocket().emit('send_message', { conversationId: activeId, text });
  }, [draft, activeId, pendingUser, isActiveBlocked]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    if (!activeId) return;
    getSocket().emit('typing', { conversationId: activeId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      getSocket().emit('typing', { conversationId: activeId, isTyping: false });
    }, 1500);
  };

  const handleToggleBlock = async () => {
    if (!activeConv || !user) return;
    const realOther = getOtherParticipant(activeConv, user._id);
    if (!realOther) return;

    setBlockLoading(true);
    try {
      const res = await UserAPI.toggleBlock(realOther._id);
      const nowBlocked = res.data.blocked;
      setConversations(prev => prev.map(c =>
        c._id === activeConv._id ? { ...c, isBlocked: nowBlocked } : c
      ));
      toast.success(nowBlocked ? "User blocked" : "User unblocked");
    } catch {
      toast.error("Failed");
    } finally {
      setBlockLoading(false);
    }
  };

  const filtered = conversations.filter(c => {
    const other = user ? getOtherParticipant(c, user._id) : null;
    if (!other) return true;
    if (c.isBlocked) return "JSGram Account".toLowerCase().includes(search.toLowerCase());
    const name = `${other.firstName ?? ''} ${other.lastName ?? ''} ${other.username}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const isOtherTyping = otherUser && activeId && !isActiveBlocked
    ? typing[`${activeId}_${otherUser._id}`]
    : false;

  return (
    <div className="flex h-[calc(100vh-1px)]">
      {/* Conversation list */}
      <div className={`${(activeId || pendingUser) ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 lg:w-80 border-r border-border flex-shrink-0`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="font-bold text-lg">Messages</h1>
          <button className="p-2 rounded-full hover:bg-accent transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-full bg-muted text-xs placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-8">No conversations</p>
          )}
          {filtered.map(conv => {
            const realOther = user ? getOtherParticipant(conv, user._id) : null;
            if (!realOther) return null;
            const displayUser = conv.isBlocked ? JSGRAM_ACCOUNT : realOther;
            const isOnline = !conv.isBlocked && (realOther.isOnline || onlineUsers.has(realOther._id));
            const name = displayUser.firstName ? `${displayUser.firstName} ${displayUser.lastName ?? ''}`.trim() : displayUser.username;
            const convTyping = !conv.isBlocked && typing[`${conv._id}_${realOther._id}`];

            return (
              <button
                key={conv._id}
                onClick={() => { setActiveId(conv._id); setPendingUser(null); }}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-accent/50 transition-colors text-left ${activeId === conv._id ? "bg-accent" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11">
                    {!conv.isBlocked && <AvatarImage src={displayUser.avatar} />}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground font-semibold text-sm">
                      {conv.isBlocked ? "JS" : name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-semibold text-sm truncate ${conv.isBlocked ? "text-muted-foreground" : ""}`}>{name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {conv.lastMessageAt ? dayjs(conv.lastMessageAt).fromNow(true) : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">
                    {convTyping
                      ? <span className="text-primary italic">typing...</span>
                      : conv.isBlocked
                      ? <span className="italic">Blocked</span>
                      : conv.lastMessage?.text ?? "No messages yet"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat view */}
      {(activeId || pendingUser) && otherUser ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button onClick={() => { setActiveId(null); setPendingUser(null); }} className="md:hidden p-1 rounded-full hover:bg-accent mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative flex-shrink-0">
              <Avatar className="w-9 h-9">
                {!isActiveBlocked && <AvatarImage src={otherUser.avatar} />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground font-semibold text-sm">
                  {isActiveBlocked ? "JS" : (otherUser.firstName?.[0] ?? otherUser.username[0])}
                </AvatarFallback>
              </Avatar>
              {!isActiveBlocked && (otherUser.isOnline || onlineUsers.has(otherUser._id)) && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${isActiveBlocked ? "text-muted-foreground" : ""}`}>
                {isActiveBlocked ? "JSGram Account" : (otherUser.firstName ? `${otherUser.firstName} ${otherUser.lastName ?? ''}`.trim() : otherUser.username)}
              </p>
              {!isActiveBlocked && (
                <p className="text-xs text-muted-foreground">
                  {isOtherTyping
                    ? <span className="text-primary">typing...</span>
                    : (otherUser.isOnline || onlineUsers.has(otherUser._id))
                    ? <span className="text-green-500">online</span>
                    : formatLastSeen(otherUser.lastSeen)}
                </p>
              )}
            </div>
            {/* Block/Unblock menu */}
            {activeConv && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-accent transition-colors">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    className={isActiveBlocked ? "text-green-600 focus:text-green-600" : "text-destructive focus:text-destructive"}
                    onClick={handleToggleBlock}
                    disabled={blockLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {isActiveBlocked ? "Unblock" : "Block"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Blocked notice */}
          {isActiveBlocked && (
            <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-muted text-sm text-muted-foreground text-center">
              You blocked this account. Unblock to send messages.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.length === 0 && !isActiveBlocked && (
              <p className="text-center text-xs text-muted-foreground mt-8">Say hello 👋</p>
            )}
            {messages.map((msg, i) => {
              const isMe = user && msg.sender._id === user._id;
              const isRead = user && otherUser && msg.readBy.includes(otherUser._id);

              return (
                <div key={msg._id ?? i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    {/* Story reply preview */}
                    {msg.storyReply && (
                      <div className={`rounded-2xl overflow-hidden border border-white/20 ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                        style={{ width: 160 }}>
                        {msg.storyReply.mediaType === 'video' ? (
                          <video
                            src={msg.storyReply.mediaUrl}
                            className="w-full h-28 object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={msg.storyReply.mediaUrl}
                            className="w-full h-28 object-cover"
                            alt="story"
                            loading="lazy"
                          />
                        )}
                        <div className={`px-2 py-1 text-[10px] ${isMe ? "bg-primary/80 text-primary-foreground" : "bg-muted"}`}>
                          Replied to story
                        </div>
                      </div>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${isMe ? "flex-row-reverse" : ""}`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (isRead
                        ? <CheckCheck className="w-3 h-3 text-primary" />
                        : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input — disabled when blocked */}
          {!isActiveBlocked && (
            <div className="border-t border-border px-3 py-3 flex items-end gap-2">
              <button className="p-2 rounded-full hover:bg-accent transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5 flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground resize-none outline-none max-h-32"
                />
                <button className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={sendMessage}
                className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                  draft.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Send className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <h2 className="font-bold text-lg mb-1">Your Messages</h2>
            <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}

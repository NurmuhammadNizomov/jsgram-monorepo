"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { getSocket, connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Edit, Phone, Video, MoreVertical, Send, Smile, Paperclip, Check, CheckCheck, Circle } from "lucide-react";
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

interface ConversationMessage {
  _id: string;
  conversationId: string;
  sender: Participant;
  text: string;
  readBy: string[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: ConversationMessage | null;
  lastMessageAt?: string;
}

function getOtherParticipant(conv: Conversation, myId: string): Participant | undefined {
  return conv.participants.find(p => p._id !== myId);
}

function formatLastSeen(lastSeen?: string) {
  if (!lastSeen) return "last seen a while ago";
  return `last seen ${dayjs(lastSeen).fromNow()}`;
}

export default function MessagesPage() {
  const user = useAuthStore(s => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout>();

  const activeConv = conversations.find(c => c._id === activeId);
  const otherUser = activeConv && user ? getOtherParticipant(activeConv, user._id) : null;

  // Load conversations
  useEffect(() => {
    api.get<Conversation[]>('/conversations').then(r => setConversations(r.data)).catch(() => {});
  }, []);

  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
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
    if (!activeId) return;
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

  const sendMessage = useCallback(() => {
    if (!draft.trim() || !activeId) return;
    getSocket().emit('send_message', { conversationId: activeId, text: draft.trim() });
    setDraft("");
  }, [draft, activeId]);

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

  const filtered = conversations.filter(c => {
    const other = user ? getOtherParticipant(c, user._id) : null;
    if (!other) return true;
    const name = `${other.firstName ?? ''} ${other.lastName ?? ''} ${other.username}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const isOtherTyping = otherUser && activeId
    ? typing[`${activeId}_${otherUser._id}`]
    : false;

  return (
    <div className="flex h-[calc(100vh-1px)]">
      {/* Chat list */}
      <div className={`${activeId ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 lg:w-80 border-r border-border flex-shrink-0`}>
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
            const other = user ? getOtherParticipant(conv, user._id) : null;
            if (!other) return null;
            const isOnline = other.isOnline || onlineUsers.has(other._id);
            const name = other.firstName ? `${other.firstName} ${other.lastName ?? ''}`.trim() : other.username;
            const convTyping = typing[`${conv._id}_${other._id}`];

            return (
              <button
                key={conv._id}
                onClick={() => setActiveId(conv._id)}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-accent/50 transition-colors text-left ${activeId === conv._id ? "bg-accent" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={other.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground font-semibold text-sm">
                      {name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate">{name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {conv.lastMessageAt ? dayjs(conv.lastMessageAt).fromNow(true) : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">
                    {convTyping
                      ? <span className="text-primary italic">typing...</span>
                      : conv.lastMessage?.text ?? "No messages yet"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat view */}
      {activeId && otherUser ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button onClick={() => setActiveId(null)} className="md:hidden p-1 rounded-full hover:bg-accent mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative flex-shrink-0">
              <Avatar className="w-9 h-9">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground font-semibold text-sm">
                  {otherUser.firstName?.[0] ?? otherUser.username[0]}
                </AvatarFallback>
              </Avatar>
              {(otherUser.isOnline || onlineUsers.has(otherUser._id)) && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {otherUser.firstName ? `${otherUser.firstName} ${otherUser.lastName ?? ''}`.trim() : otherUser.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOtherTyping
                  ? <span className="text-primary">typing...</span>
                  : (otherUser.isOnline || onlineUsers.has(otherUser._id))
                  ? <span className="text-green-500">online</span>
                  : formatLastSeen(otherUser.lastSeen)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-accent transition-colors"><Phone className="w-4 h-4 text-muted-foreground" /></button>
              <button className="p-2 rounded-full hover:bg-accent transition-colors"><Video className="w-4 h-4 text-muted-foreground" /></button>
              <button className="p-2 rounded-full hover:bg-accent transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-8">Say hello 👋</p>
            )}
            {messages.map((msg, i) => {
              const isMe = user && msg.sender._id === user._id;
              const isRead = user && msg.readBy.includes(otherUser._id);

              return (
                <div key={msg._id ?? i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
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

          {/* Input */}
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

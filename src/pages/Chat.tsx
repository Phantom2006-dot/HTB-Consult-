import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare, Send, Bot, Trash2, User, Users, AlertCircle,
  Pencil, Check, X, Moon, Sun, Plus, ArrowLeft, SmilePlus, Search
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Layout from "@/components/Layout";

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  reactions?: Record<string, string[]>;
  sender_id?: string | null;
  sender_name?: string | null;
  sender_avatar?: string | null;
}

interface Conversation {
  id: string;
  title: string;
  type: "ai" | "user" | "group";
  participant_id: string | null;
  participant_name?: string | null;
  participant_avatar?: string | null;
  participant_online?: boolean;
  last_message_preview?: string | null;
  created_at: string;
  updated_at: string;
}

interface AppUser {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  is_online?: boolean;
}

type ChatError = { message: string } | null;

// ── Constants ────────────────────────────────────────────────────────────────
const CHAT_URL = "/api/chat";
const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name: string | null | undefined, email?: string) {
  if (name) return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return "?";
}

// ── AI Streaming ──────────────────────────────────────────────────────────────
async function streamChat({
  messages, onDelta, onDone, onError,
}: {
  messages: Pick<ChatMessage, "role" | "content">[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => null);
    onError(data?.error || `Error ${resp.status}`);
    return;
  }
  if (!resp.body) { onError("No response body"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ url, name, email, size = 8, online, isBot }: { url?: string | null; name?: string | null; email?: string; size?: number; online?: boolean; isBot?: boolean }) {
  const px = size * 4;
  const style = { width: px, height: px, minWidth: px, minHeight: px };
  const fontSize = px < 28 ? 10 : 12;
  return (
    <div className="relative shrink-0" style={style}>
      {isBot ? (
        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={px * 0.5} className="text-primary" />
        </div>
      ) : url ? (
        <img src={url} alt={name || ""} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold" style={{ fontSize }}>
          {initials(name, email)}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${online ? "bg-green-500" : "bg-gray-400"}`} />
      )}
    </div>
  );
}

// ── Emoji Picker ──────────────────────────────────────────────────────────────
function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 flex gap-1">
      {COMMON_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => { onPick(emoji); onClose(); }}
          className="text-lg hover:scale-125 transition-transform p-0.5"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg, isOwn, isAI, currentUserId, currentUserAvatar, currentUserName,
  onEdit, onDelete, onReact,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  isAI: boolean;
  currentUserId: string;
  currentUserAvatar?: string | null;
  currentUserName?: string | null;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(msg.content);
  const [showPicker, setShowPicker] = useState(false);

  const totalReactions = Object.values(msg.reactions || {}).reduce((s, arr) => s + arr.length, 0);

  const handleSaveEdit = () => {
    if (editVal.trim() && editVal.trim() !== msg.content) {
      onEdit(msg.id, editVal.trim());
    }
    setEditing(false);
  };

  if (msg.is_deleted) {
    return (
      <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        <span className="text-xs text-gray-400 italic px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
          This message was deleted
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} mb-1 group`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowPicker(false); }}
    >
      {isOwn ? (
        <Avatar url={currentUserAvatar} name={currentUserName} size={7} />
      ) : isAI ? (
        <Avatar isBot size={7} />
      ) : (
        <Avatar url={msg.sender_avatar} name={msg.sender_name} size={7} />
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}>
        {!isOwn && msg.sender_name && !isAI && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 px-1">{msg.sender_name}</span>
        )}

        <div className="relative">
          {editing ? (
            <div className="flex gap-1 items-center">
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditing(false); }}
                className="text-sm px-3 py-2 rounded-xl border border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[180px]"
              />
              <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
          ) : (
            <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              isOwn
                ? "bg-primary text-white rounded-tr-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm"
            }`}>
              {isAI && !isOwn ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0 text-inherit">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap break-words">{msg.content}</span>
              )}
            </div>
          )}

          {/* Hover actions */}
          {hovering && !editing && (
            <div className={`absolute ${isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} top-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow text-gray-500 hover:text-primary hover:shadow-md transition-all"
                  title="React"
                >
                  <SmilePlus size={14} />
                </button>
                {showPicker && <EmojiPicker onPick={(e) => onReact(msg.id, e)} onClose={() => setShowPicker(false)} />}
              </div>
              {isOwn && !isAI && (
                <>
                  <button
                    onClick={() => { setEditing(true); setEditVal(msg.content); }}
                    className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow text-gray-500 hover:text-primary hover:shadow-md transition-all"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(msg.id)}
                    className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow text-gray-500 hover:text-red-500 hover:shadow-md transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {totalReactions > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1 px-1">
            {Object.entries(msg.reactions || {}).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                    users.includes(currentUserId)
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {emoji} {users.length}
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Timestamp & edited */}
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-[10px] text-gray-400">{timeAgo(msg.created_at)}</span>
          {msg.edited_at && <span className="text-[10px] text-gray-400 italic">edited</span>}
        </div>
      </div>
    </div>
  );
}

// ── User Selector Modal ───────────────────────────────────────────────────────
function UserSelectorModal({
  users, onSelect, onClose,
}: {
  users: AppUser[];
  onSelect: (u: AppUser) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = users.filter(u =>
    (u.full_name || u.email).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search people..."
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto pb-2">
          {filtered.map(u => (
            <button
              key={u.id}
              onClick={() => onSelect(u)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar url={u.avatar_url} name={u.full_name} email={u.email} size={9} online={u.is_online} />
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.full_name || u.email}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              {u.is_online && <span className="ml-auto text-[10px] text-green-500 font-medium">Online</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-center text-gray-400 py-6">No users found</p>}
        </div>
      </div>
    </div>
  );
}

// ── Main Chat Component ───────────────────────────────────────────────────────
const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"ai" | "user" | "group">("ai");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<ChatError>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [typingDots, setTypingDots] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dark mode toggle
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // Ping last_seen
  useEffect(() => {
    if (!user) return;
    api.post("/api/chat/ping").catch(() => {});
    const t = setInterval(() => api.post("/api/chat/ping").catch(() => {}), 60_000);
    return () => clearInterval(t);
  }, [user]);

  // Load users for DMs
  useEffect(() => {
    if (!user) return;
    api.get<AppUser[]>("/api/chat/users").then(setUsers).catch(() => {});
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    api.get<Conversation[]>("/api/chat/conversations").then((data) => {
      if (data) {
        setConversations(data);
        const convParam = searchParams.get("conv");
        if (convParam) {
          const found = data.find(c => c.id === convParam);
          if (found) { setActiveConv(convParam); setActiveType(found.type); }
        }
      }
    }).catch(() => {});
  }, [user, searchParams]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }
    api.get<ChatMessage[]>(`/api/chat/conversations/${activeConv}/messages`).then(data => {
      if (data) setMessages(data);
    }).catch(() => {});
  }, [activeConv]);

  // Poll messages in user chats every 3s
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeConv && activeType !== "ai") {
      pollRef.current = setInterval(() => {
        api.get<ChatMessage[]>(`/api/chat/conversations/${activeConv}/messages`)
          .then(data => { if (data) setMessages(data); })
          .catch(() => {});
      }, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConv, activeType]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingDots]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv.id);
    setActiveType(conv.type);
    setChatError(null);
    if (window.innerWidth < 640) setShowSidebar(false);
  };

  const createConversation = async (type: "ai" | "user" | "group" = "ai", title?: string, participantId?: string) => {
    if (!user) return null;
    const data = await api.post<Conversation>("/api/chat/conversations", {
      title: title || (type === "ai" ? "New AI Chat" : "New Conversation"),
      type,
      participant_id: participantId || null,
    }).catch(() => null);
    if (data) {
      setConversations(prev => {
        const exists = prev.find(c => c.id === data.id);
        return exists ? prev : [data, ...prev];
      });
      setActiveConv(data.id);
      setActiveType(data.type as "ai" | "user" | "group");
      setMessages([]);
    }
    return data;
  };

  const startDM = async (u: AppUser) => {
    setShowUserModal(false);
    const conv = await createConversation("user", u.full_name || u.email, u.id);
    if (conv && window.innerWidth < 640) setShowSidebar(false);
  };

  const deleteConversation = async (id: string) => {
    await api.delete(`/api/chat/conversations/${id}`).catch(() => {});
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv === id) { setActiveConv(null); setMessages([]); }
  };

  const handleEditMessage = useCallback(async (msgId: string, content: string) => {
    if (!activeConv) return;
    const data = await api.patch<ChatMessage>(`/api/chat/conversations/${activeConv}/messages/${msgId}`, { content }).catch(() => null);
    if (data) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: data.content, edited_at: data.edited_at } : m));
  }, [activeConv]);

  const handleDeleteMessage = useCallback(async (msgId: string) => {
    if (!activeConv) return;
    await api.delete(`/api/chat/conversations/${activeConv}/messages/${msgId}`).catch(() => {});
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, content: "This message was deleted" } : m));
  }, [activeConv]);

  const handleReact = useCallback(async (msgId: string, emoji: string) => {
    if (!activeConv) return;
    const data = await api.post<{ reactions: Record<string, string[]> }>(
      `/api/chat/conversations/${activeConv}/messages/${msgId}/react`,
      { emoji }
    ).catch(() => null);
    if (data) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: data.reactions } : m));
  }, [activeConv]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !user) return;
    let convId = activeConv;
    let convType = activeType;

    if (!convId) {
      const data = await createConversation("ai", input.slice(0, 40));
      if (!data) return;
      convId = data.id;
      convType = data.type as "ai" | "user" | "group";
    }

    const userMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
    };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }

    await api.post(`/api/chat/conversations/${convId}/messages`, { role: "user", content: userMsg.content }).catch(() => {});

    if (messages.length === 0) {
      await api.patch(`/api/chat/conversations/${convId}`, { title: userMsg.content.slice(0, 50) }).catch(() => {});
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: userMsg.content.slice(0, 50) } : c));
    }

    if (convType === "ai") {
      setIsStreaming(true);
      setTypingDots(true);
      let assistantText = "";
      await streamChat({
        messages: newMsgs,
        onDelta: (chunk) => {
          setTypingDots(false);
          setChatError(null);
          assistantText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && !last.id.startsWith("tmp-")) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
            }
            return [...prev.filter(m => m.role !== "assistant" || !m.id.startsWith("tmp-")),
              { id: `tmp-ai-${Date.now()}`, role: "assistant" as const, content: assistantText, created_at: new Date().toISOString() }];
          });
        },
        onDone: async () => {
          setIsStreaming(false);
          setTypingDots(false);
          if (assistantText && convId) {
            await api.post(`/api/chat/conversations/${convId}/messages`, { role: "assistant", content: assistantText }).catch(() => {});
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setTypingDots(false);
          setChatError({ message: err });
        },
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }
  if (!user) return null;

  const activeConvData = conversations.find(c => c.id === activeConv);
  const isAIConv = activeType === "ai";
  const headerTitle = activeConvData
    ? isAIConv ? "HTB AI Assistant" : (activeConvData.participant_name || activeConvData.title)
    : "Select a conversation";
  const participantOnline = activeConvData?.participant_online;

  const aiConvs = conversations.filter(c => c.type === "ai");
  const userConvs = conversations.filter(c => c.type !== "ai");

  return (
    <Layout>
      <div className="flex h-[calc(100vh-65px)] bg-white dark:bg-gray-950 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className={`
          ${showSidebar ? "flex" : "hidden"}
          sm:flex flex-col
          ${activeConv && showSidebar ? "absolute sm:relative inset-0 sm:inset-auto z-40 sm:z-auto" : ""}
          w-full sm:w-72 shrink-0
          bg-white dark:bg-gray-900
          border-r border-gray-100 dark:border-gray-800
        `}>
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Chats</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleDark}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setShowUserModal(true)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="New direct message"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => createConversation("ai")}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="New AI chat"
              >
                <Bot size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* AI Chats */}
            {aiConvs.length > 0 && (
              <div>
                <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">AI Assistant</p>
                {aiConvs.map(c => (
                  <ConvItem key={c.id} conv={c} active={activeConv === c.id} onSelect={() => selectConversation(c)} onDelete={() => deleteConversation(c.id)} />
                ))}
              </div>
            )}

            {/* User Chats */}
            {userConvs.length > 0 && (
              <div>
                <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Direct Messages</p>
                {userConvs.map(c => (
                  <ConvItem key={c.id} conv={c} active={activeConv === c.id} onSelect={() => selectConversation(c)} onDelete={() => deleteConversation(c.id)} showAvatar />
                ))}
              </div>
            )}

            {conversations.length === 0 && (
              <div className="px-4 py-12 text-center">
                <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400">No conversations yet.</p>
                <p className="text-xs text-gray-400 mt-1">Start an AI chat or message a teammate.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Chat area ───────────────────────────────────────────────────── */}
        <main className={`flex-1 flex flex-col min-w-0 ${showSidebar && !activeConv ? "hidden sm:flex" : "flex"}`}>

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white sm:hidden"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden sm:block"
            >
              <MessageSquare size={18} />
            </button>

            {activeConvData ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isAIConv ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot size={16} className="text-primary" />
                  </div>
                ) : (
                  <Avatar
                    url={activeConvData.participant_avatar}
                    name={activeConvData.participant_name}
                    size={8}
                    online={participantOnline}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{headerTitle}</p>
                  {!isAIConv && (
                    <p className="text-[10px] text-gray-400">{participantOnline ? "Online" : "Offline"}</p>
                  )}
                  {isAIConv && <p className="text-[10px] text-gray-400">AI-powered assistant</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <Bot size={18} className="text-primary" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">HTB AI Assistant</span>
              </div>
            )}

            <button onClick={toggleDark} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:block">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-950"
          >
            {messages.length === 0 && !isStreaming && !typingDots && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                {isAIConv ? (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bot size={32} className="text-primary" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User size={32} className="text-blue-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {isAIConv ? "HTB AI Assistant" : headerTitle}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    {isAIConv
                      ? "Ask anything about PM, Business Analysis, CV tips, or career advice."
                      : "Send a message to start the conversation."}
                  </p>
                </div>
              </div>
            )}

            {!activeConv && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <MessageSquare size={48} className="text-gray-200 dark:text-gray-700" />
                <div>
                  <p className="font-medium text-gray-400">No conversation selected</p>
                  <div className="flex gap-2 mt-4 justify-center flex-wrap">
                    <button
                      onClick={() => createConversation("ai")}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Bot size={16} /> New AI Chat
                    </button>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Users size={16} /> New Message
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.sender_id === user.id || (msg.role === "user" && !msg.sender_id)}
                isAI={isAIConv}
                currentUserId={user.id}
                currentUserAvatar={user.avatar_url}
                currentUserName={user.full_name}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReact={handleReact}
              />
            ))}

            {/* Typing indicator */}
            {typingDots && (
              <div className="flex gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {chatError && (
            <div className="mx-4 mb-0 mt-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 flex items-start gap-3 text-sm">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="flex-1 text-red-600 dark:text-red-400">{chatError.message}</p>
              <button onClick={() => setChatError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={isAIConv ? "Ask the AI assistant..." : "Type a message... (Shift+Enter for new line)"}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none resize-none max-h-28 disabled:opacity-50"
                style={{ minHeight: "24px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </main>
      </div>

      {/* User selector modal */}
      {showUserModal && (
        <UserSelectorModal users={users} onSelect={startDM} onClose={() => setShowUserModal(false)} />
      )}
    </Layout>
  );
};

// ── Sidebar conversation item ─────────────────────────────────────────────────
function ConvItem({ conv, active, onSelect, onDelete, showAvatar }: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  showAvatar?: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onSelect()}
      className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer group transition-colors ${
        active
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {showAvatar ? (
        <Avatar url={conv.participant_avatar} name={conv.participant_name} size={8} online={conv.participant_online} />
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-primary/20" : "bg-gray-100 dark:bg-gray-800"}`}>
          {conv.type === "ai" ? <Bot size={15} className="text-primary" /> : <Users size={15} className="text-gray-500" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${active ? "font-semibold text-primary" : "text-gray-800 dark:text-gray-200"}`}>
          {conv.type === "ai" ? conv.title : (conv.participant_name || conv.title)}
        </p>
        {conv.last_message_preview && (
          <p className="text-xs text-gray-400 truncate">{conv.last_message_preview}</p>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default Chat;

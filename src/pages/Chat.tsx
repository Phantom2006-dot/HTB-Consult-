import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare, Send, Bot, Plus, Trash2, ArrowLeft, User, Users
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import Layout from "@/components/Layout";

type Msg = { role: "user" | "assistant"; content: string };

interface Conversation {
  id: string;
  title: string;
  type: string;
  participant_id: string | null;
  created_at: string;
}

const CHAT_URL = "/api/chat";

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("ai");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    api.get<Conversation[]>("/api/chat/conversations").then((data) => {
      if (data) {
        setConversations(data);
        const convParam = searchParams.get("conv");
        if (convParam && data.find((c) => c.id === convParam)) {
          setActiveConv(convParam);
          const conv = data.find((c) => c.id === convParam);
          if (conv) setActiveType(conv.type);
        }
      }
    }).catch(() => {});
  }, [user, searchParams]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }
    api.get<Msg[]>(`/api/chat/conversations/${activeConv}/messages`).then((data) => {
      if (data) setMessages(data);
    }).catch(() => {});
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv.id);
    setActiveType(conv.type);
  };

  const createConversation = async (type: "ai" | "user" = "ai", title?: string) => {
    if (!user) return;
    const data = await api.post<Conversation>("/api/chat/conversations", {
      title: title || (type === "ai" ? "New AI Chat" : "New Conversation"),
      type,
    }).catch(() => null);
    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveConv(data.id);
      setActiveType(data.type);
      setMessages([]);
    }
    return data;
  };

  const deleteConversation = async (id: string) => {
    await api.delete(`/api/chat/conversations/${id}`).catch(() => {});
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConv === id) { setActiveConv(null); setMessages([]); }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !user) return;
    let convId = activeConv;
    let convType = activeType;

    // Auto-create conversation if none
    if (!convId) {
      const data = await createConversation("ai", input.slice(0, 40));
      if (!data) return;
      convId = data.id;
      convType = data.type;
    }

    const userMsg: Msg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");

    // Save user message
    await api.post(`/api/chat/conversations/${convId}/messages`, { role: "user", content: input }).catch(() => {});

    // Update conversation title if first message
    if (messages.length === 0) {
      await api.patch(`/api/chat/conversations/${convId}`, { title: input.slice(0, 50) }).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: input.slice(0, 50) } : c))
      );
    }

    // If AI conversation, stream response
    if (convType === "ai") {
      setIsStreaming(true);
      let assistantText = "";
      const upsert = (chunk: string) => {
        assistantText += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
          }
          return [...prev, { role: "assistant", content: assistantText }];
        });
      };

      await streamChat({
        messages: newMsgs,
        onDelta: upsert,
        onDone: async () => {
          setIsStreaming(false);
          if (assistantText && convId) {
            await api.post(`/api/chat/conversations/${convId}/messages`, { role: "assistant", content: assistantText }).catch(() => {});
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          toast({ title: "Error", description: err, variant: "destructive" });
        },
      });
    }
    // For user-to-user, the message is saved above and realtime handles delivery
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

  const activeConvData = conversations.find((c) => c.id === activeConv);
  const headerTitle = activeConvData
    ? activeConvData.type === "ai" ? "HTB AI Assistant" : activeConvData.title
    : "HTB AI Assistant";
  const headerIcon = activeConvData?.type === "user" ? Users : Bot;
  const HeaderIcon = headerIcon;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-65px)]">
        {/* Conversation list */}
        <div className={`${showSidebar ? "w-64" : "w-0"} transition-all overflow-hidden border-r border-border bg-card flex flex-col shrink-0`}>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Chats</h2>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => createConversation("user", "New Conversation")} title="New user chat">
                <Users size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => createConversation("ai")} title="New AI chat">
                <Bot size={14} />
              </Button>
            </div>
          </div>

          {/* AI Chats */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Assistant</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.filter((c) => c.type === "ai").map((c) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c)}
                className={`px-3 py-2.5 cursor-pointer flex items-center justify-between group transition-colors ${
                  activeConv === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bot size={14} className="shrink-0" />
                  <span className="text-xs truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* User Chats */}
            <div className="px-3 pt-4 pb-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
            </div>
            {conversations.filter((c) => c.type === "user").map((c) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c)}
                className={`px-3 py-2.5 cursor-pointer flex items-center justify-between group transition-colors ${
                  activeConv === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users size={14} className="shrink-0" />
                  <span className="text-xs truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8 px-3">No conversations yet.</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="text-muted-foreground hover:text-foreground">
              {showSidebar ? <ArrowLeft size={18} /> : <MessageSquare size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <HeaderIcon size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">{headerTitle}</span>
              {activeConvData?.type === "user" && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Live</span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isStreaming && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col items-center justify-center h-full text-center">
                <HeaderIcon size={48} className="text-primary mb-4" />
                <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                  {activeType === "ai" ? "HTB AI Assistant" : headerTitle}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {activeType === "ai"
                    ? "Ask me anything about Project Management, Business Analysis, CV tips, or career development!"
                    : "Start a conversation. Messages are delivered in real-time."}
                </p>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    {activeType === "ai" ? <Bot size={14} className="text-primary" /> : <User size={14} className="text-primary" />}
                  </div>
                )}
                <Card className={`max-w-[75%] px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}>
                  {msg.role === "assistant" && activeType === "ai" ? (
                    <div className="prose prose-sm prose-invert max-w-none text-foreground text-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </Card>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <User size={14} className="text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <Card className="bg-card border-border px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </Card>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeType === "ai" ? "Ask the AI assistant..." : "Type a message..."}
                disabled={isStreaming}
                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="bg-gradient-gold hover:opacity-90 shrink-0"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;

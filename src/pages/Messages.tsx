import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Bot, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

interface Conversation {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_conversations")
      .select("id, title, type, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
      });
  }, [user]);

  const startNewUserChat = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Conversation", type: "user" })
      .select("id")
      .single();
    if (data) navigate(`/chat?conv=${data.id}`);
  };

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1 flex items-center gap-2">
            <MessageSquare size={22} className="text-primary" /> Messages
          </h1>
          <p className="text-muted-foreground text-sm">Your conversations</p>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Career & training help</p>
                </div>
              </div>
              <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90">
                <Link to="/chat">Open</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">New Chat</p>
                  <p className="text-xs text-muted-foreground">Start a conversation</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={startNewUserChat}>
                Start
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent conversations */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Conversations</h2>
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">No conversations yet. Start one above!</p>
          )}
          {conversations.map((c) => (
            <Link key={c.id} to={`/chat?conv=${c.id}`}>
              <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer mb-2">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {c.type === "ai" ? (
                      <Bot size={18} className="text-primary" />
                    ) : (
                      <Users size={18} className="text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">{c.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {c.type === "ai" ? "AI" : "Chat"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Messages;

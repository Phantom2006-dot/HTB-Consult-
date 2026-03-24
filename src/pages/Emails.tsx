import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Paperclip, Search, Plus, Send, Trash2, Star, RefreshCw, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fadeUp } from "@/lib/animations";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Email {
  id: string;
  user_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  is_draft: boolean;
  has_attachment: boolean;
  folder: string;
  created_at: string;
  updated_at: string;
}

const Emails = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Email[]>("/api/emails");
      setEmails(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const filteredEmails = emails.filter((e) => {
    const matchesTab =
      activeTab === "inbox" ? e.folder === "inbox" && !e.is_draft :
      activeTab === "sent" ? e.folder === "sent" :
      activeTab === "drafts" ? e.is_draft :
      true;
    const matchesSearch = search === "" ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.body.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = emails.filter((e) => !e.is_read && e.folder === "inbox" && !e.is_draft).length;

  const handleSend = async () => {
    if (!user || !composeSubject.trim()) return;
    setSending(true);
    try {
      await api.post("/api/emails", {
        subject: composeSubject,
        body: composeBody,
        folder: "sent",
        is_read: true,
      });
      toast({ title: "Sent", description: "Email sent successfully" });
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      fetchEmails();
    } catch {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setSending(true);
    try {
      await api.post("/api/emails", {
        subject: composeSubject || "(No subject)",
        body: composeBody,
        is_draft: true,
        folder: "inbox",
      });
      toast({ title: "Saved", description: "Draft saved" });
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      fetchEmails();
    } catch {
      toast({ title: "Error", description: "Failed to save draft", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const toggleRead = async (email: Email) => {
    await api.patch(`/api/emails/${email.id}`, { is_read: !email.is_read });
    fetchEmails();
  };

  const deleteEmail = async (id: string) => {
    await api.delete(`/api/emails/${id}`);
    if (selectedEmail?.id === id) setSelectedEmail(null);
    fetchEmails();
    toast({ title: "Deleted", description: "Email removed" });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Detail view
  if (selectedEmail) {
    return (
      <Layout>
        <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)} className="mb-2 gap-1">
              <ArrowLeft size={16} /> Back
            </Button>
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground">{selectedEmail.subject || "(No subject)"}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(selectedEmail.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleRead(selectedEmail)} title={selectedEmail.is_read ? "Mark unread" : "Mark read"}>
                      <Mail size={16} className={selectedEmail.is_read ? "text-muted-foreground" : "text-primary"} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteEmail(selectedEmail.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedEmail.body || "No content"}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Mail size={22} className="text-primary" /> Emails
              {unreadCount > 0 && <Badge variant="secondary" className="text-xs ml-1">{unreadCount}</Badge>}
            </h1>
            <p className="text-muted-foreground text-sm">Manage your inbox</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button size="sm" onClick={() => setComposeOpen(true)} className="gap-1">
              <Plus size={14} /> Compose
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="max-h-[60vh]">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {search ? "No emails match your search" : "No emails here yet"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEmails.map((e) => (
                      <Card
                        key={e.id}
                        onClick={() => {
                          setSelectedEmail(e);
                          if (!e.is_read) toggleRead(e);
                        }}
                        className={`border-border hover:border-primary/30 transition-colors cursor-pointer ${
                          !e.is_read ? "border-l-2 border-l-primary bg-card" : "bg-card/60"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${!e.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                              {e.is_draft ? "Draft" : e.folder === "sent" ? "To: You" : "HTB Consults"}
                            </span>
                            <div className="flex items-center gap-2">
                              {e.has_attachment && <Paperclip size={12} className="text-muted-foreground" />}
                              {e.is_draft && <Badge variant="outline" className="text-[10px] py-0">Draft</Badge>}
                              <span className="text-[10px] text-muted-foreground">{timeAgo(e.created_at)}</span>
                            </div>
                          </div>
                          <p className={`text-sm ${!e.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {e.subject || "(No subject)"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{e.body}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Compose Dialog */}
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">New Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="To" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} />
              <Input placeholder="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
              <Textarea placeholder="Write your message..." value={composeBody} onChange={(e) => setComposeBody(e.target.value)} rows={8} />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleSaveDraft} disabled={sending}>Save Draft</Button>
              <Button onClick={handleSend} disabled={sending} className="gap-1">
                <Send size={14} /> Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Emails;

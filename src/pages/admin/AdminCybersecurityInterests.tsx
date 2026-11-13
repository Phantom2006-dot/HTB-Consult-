import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Mail, Search, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Interest = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  background: string;
  goal: string | null;
  consent: boolean;
  created_at: string;
};

const formatDate = (value: string) => new Date(value).toLocaleString("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

const AdminCybersecurityInterests = () => {
  const [search, setSearch] = useState("");
  const { data: interests, isLoading, isError } = useQuery({
    queryKey: ["admin-cybersecurity-interests"],
    queryFn: () => api.get<Interest[]>("/api/admin/cybersecurity-interests"),
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return interests || [];
    return (interests || []).filter((interest) => [
      interest.full_name, interest.email, interest.country, interest.background, interest.goal || "",
    ].some((value) => value.toLowerCase().includes(query)));
  }, [interests, search]);

  const downloadCsv = () => {
    const headers = ["Name", "Email", "Country", "Background", "Goal", "Consent", "Submitted"];
    const rows = (interests || []).map((interest) => [
      interest.full_name, interest.email, interest.country, interest.background,
      interest.goal || "", interest.consent ? "Yes" : "No", formatDate(interest.created_at),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cybersecurity-interest-submissions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><ShieldCheck size={22} className="text-primary" /><h1 className="text-2xl font-serif font-bold text-foreground">Cybersecurity Interests</h1></div>
            <p className="text-sm text-muted-foreground mt-1">{interests?.length ?? 0} responses from the cybersecurity registration form</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadCsv} disabled={!interests?.length} className="gap-2"><Download size={14} /> Export CSV</Button>
        </motion.div>

        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or background…" className="pl-9 bg-card border-border text-sm" /></div>

        {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-lg" />)}</div> : isError ? <Card><CardContent className="p-8 text-center text-destructive">Could not load cybersecurity interest submissions.</CardContent></Card> : filtered.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">{search ? "No responses match your search." : "No cybersecurity responses yet."}</CardContent></Card> : (
          <div className="space-y-3">
            {filtered.map((interest) => (
              <Card key={interest.id} className="border-border bg-card hover:border-primary/25 transition-colors">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h2 className="font-semibold text-foreground">{interest.full_name}</h2><span className="text-xs text-muted-foreground">{formatDate(interest.created_at)}</span></div>
                      <a href={`mailto:${interest.email}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"><Mail size={13} /> {interest.email}</a>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1">{interest.country}</span><span className="rounded-full border border-border bg-muted/40 text-muted-foreground px-2.5 py-1">{interest.background}</span></div>
                  </div>
                  {interest.goal && <div className="mt-4 border-t border-border pt-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What they want to achieve</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{interest.goal}</p></div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCybersecurityInterests;

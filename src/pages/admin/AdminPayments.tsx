import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Search, CheckCircle2, XCircle, Clock,
  UserCheck, RefreshCw, BookOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const STATUS_CONFIG = {
  successful: { icon: CheckCircle2, label: "Paid", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pending:    { icon: Clock,        label: "Pending", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  failed:     { icon: XCircle,      label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

const AdminPayments = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "successful" | "pending" | "failed">("all");

  const { data: payments, isLoading, refetch, isFetching } = useQuery<any[]>({
    queryKey: ["admin-payments"],
    queryFn: () => api.get("/api/payments/admin"),
    refetchInterval: 30_000,
  });

  const manualEnroll = useMutation({
    mutationFn: (payment_id: string) =>
      api.post("/api/payments/admin/manual-enroll", { payment_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({ title: "Enrolled!", description: "Student manually enrolled and notified." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const totals = (payments || []).reduce(
    (acc, p) => {
      if (p.status === "successful") {
        acc.paid++;
        // sum in GBP equivalent — use actual flw_amount and currency
        acc.revenue += Number(p.amount || 0);
      }
      if (p.status === "pending") acc.pending++;
      if (p.status === "failed") acc.failed++;
      return acc;
    },
    { paid: 0, pending: 0, failed: 0, revenue: 0 }
  );

  const filtered = (payments || []).filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.course_title || "").toLowerCase().includes(q) ||
      (p.tx_ref || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Payments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track course payments and manually confirm enrollments
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
        </motion.div>

        {/* Stats cards */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Payments", value: (payments || []).length, icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Paid / Enrolled", value: totals.paid, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Pending", value: totals.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Failed", value: totals.failed, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          ].map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{isLoading ? "—" : s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, email, course, or reference…"
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "successful", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize
                  ${statusFilter === s
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}
              >
                {s === "all" ? "All" : s === "successful" ? "Paid" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Payments list */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : filtered.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={24} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {search || statusFilter !== "all" ? "No payments match your filters." : "No payments yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((payment: any, i: number) => {
              const cfg = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const isEnrolled = !!payment.enrollment_id;

              return (
                <motion.div key={payment.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className="border-border bg-card hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">

                        {/* Course thumbnail */}
                        <div className="w-12 h-11 rounded-lg overflow-hidden shrink-0 border border-border">
                          {payment.thumbnail_url ? (
                            <img src={payment.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                              <BookOpen size={14} className="text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Student + course */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate">{payment.full_name || "Unknown"}</p>
                            <Badge variant="outline" className={`text-[10px] border ${cfg.cls} shrink-0`}>
                              <StatusIcon size={9} className="mr-1" />
                              {cfg.label}
                            </Badge>
                            {isEnrolled && (
                              <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 shrink-0">
                                <UserCheck size={9} className="mr-1" /> Enrolled
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{payment.email}</p>
                          <p className="text-xs text-primary/80 truncate">{payment.course_title}</p>
                        </div>

                        {/* Amount + ref */}
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-sm font-bold text-foreground">
                            {payment.flw_currency || payment.currency} {Number(payment.flw_amount || payment.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{payment.tx_ref}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(payment.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        {/* Manual enroll button — only for pending/failed non-enrolled */}
                        {!isEnrolled && payment.status !== "successful" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => {
                              if (confirm(`Manually enroll ${payment.full_name} into "${payment.course_title}"?\n\nThis marks the payment as successful and sends them an enrollment notification.`)) {
                                manualEnroll.mutate(payment.id);
                              }
                            }}
                            disabled={manualEnroll.isPending}
                          >
                            <UserCheck size={13} /> Enroll Manually
                          </Button>
                        )}
                      </div>

                      {/* Mobile amount row */}
                      <div className="mt-2 pt-2 border-t border-border sm:hidden flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">{payment.tx_ref}</span>
                        <span className="font-bold text-foreground">
                          {payment.flw_currency || payment.currency} {Number(payment.flw_amount || payment.amount).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;

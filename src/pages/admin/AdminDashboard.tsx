import { motion } from "framer-motion";
import { useState } from "react";
import {
  BookOpen, Users, GraduationCap, UserCheck, PoundSterling,
  ArrowRight, CalendarDays, FileText, TrendingUp, Eye, MousePointerClick,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useAdminStats } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#e67000", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

const PERIODS = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "All", value: "all" },
];

const VISITOR_PERIODS = [
  { label: "7D", value: "7d" },
  { label: "14D", value: "14d" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
];

function PeriodSelector({ value, options, onChange }: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
            value === o.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const AdminDashboard = () => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState("3m");
  const [visitorPeriod, setVisitorPeriod] = useState("14d");

  const { data: stats, isLoading } = useAdminStats();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics", analyticsPeriod],
    queryFn: () => api.get<any>(`/api/admin/analytics?period=${analyticsPeriod}`),
  });

  const { data: recentEnrollments } = useQuery({
    queryKey: ["admin-recent-enrollments"],
    queryFn: () => api.get<any[]>("/api/admin/recent-enrollments"),
  });

  const { data: visitors, isLoading: visitorsLoading } = useQuery({
    queryKey: ["admin-visitors", visitorPeriod],
    queryFn: () => api.get<any>(`/api/admin/visitors?period=${visitorPeriod}`),
    refetchInterval: 60_000,
  });

  const statCards = [
    { icon: Users, label: "Registered Users", value: stats?.users ?? 0, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: GraduationCap, label: "Enrollments", value: stats?.enrollments ?? 0, color: "text-primary", bg: "bg-primary/10" },
    { icon: BookOpen, label: "Published Courses", value: stats?.courses ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: UserCheck, label: "Active Mentors", value: stats?.mentors ?? 0, color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Eye, label: "Visitors Today", value: visitors?.uniqueToday ?? 0, color: "text-teal-500", bg: "bg-teal-500/10" },
    { icon: MousePointerClick, label: "Total Page Views", value: visitors?.totalVisits ?? 0, color: "text-sky-500", bg: "bg-sky-500/10" },
    {
      icon: PoundSterling,
      label: "Total Revenue",
      value: stats?.revenue != null ? `£${Number(stats.revenue).toLocaleString()}` : "£0",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    { icon: FileText, label: "Published Articles", value: stats?.articles ?? 0, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const quickActions = [
    { label: "Manage Courses", href: "/admin/courses", primary: true },
    { label: "Manage Mentors", href: "/admin/mentors" },
    { label: "Manage Users", href: "/admin/users" },
    { label: "View Enrollments", href: "/admin/enrollments" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Articles", href: "/admin/articles" },
  ];

  const userGrowthData = analytics?.userGrowth ?? [];
  const enrollmentData = analytics?.enrollmentTrend ?? [];
  const topCourses = analytics?.topCourses ?? [];
  const roleBreakdown = analytics?.roleBreakdown ?? [];
  const recentUsers = analytics?.recentUsers ?? [];

  const combinedTrend = userGrowthData.map((u: any) => {
    const enroll = enrollmentData.find((e: any) => e.period === u.period);
    return { period: u.period, users: parseInt(u.count), enrollments: parseInt(enroll?.count ?? 0) };
  });

  const periodLabel = PERIODS.find(p => p.value === analyticsPeriod)?.label ?? "3M";

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview — members, courses, revenue &amp; trends</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <Skeleton className="h-6 w-12 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                size="sm"
                variant={a.primary ? "default" : "outline"}
                asChild
                className={a.primary ? "bg-gradient-gold hover:opacity-90 gap-1.5" : "gap-1.5"}
              >
                <Link to={a.href}>
                  {a.label} <ArrowRight size={12} />
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Member & Enrollment Growth — full width with period picker */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Member &amp; Enrollment Growth
                </CardTitle>
                <PeriodSelector value={analyticsPeriod} options={PERIODS} onChange={setAnalyticsPeriod} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {analyticsLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : combinedTrend.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">No data for this period yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={combinedTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e67000" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#e67000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorUsers)" name="New Members" />
                    <Area type="monotone" dataKey="enrollments" stroke="#e67000" strokeWidth={2} fill="url(#colorEnroll)" name="Enrollments" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-purple-500 inline-block rounded" /> New Members</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Enrollments</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Courses + Role Breakdown */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Courses with period picker */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-sm font-semibold text-foreground">Top Courses by Enrollment</CardTitle>
                <PeriodSelector value={analyticsPeriod} options={PERIODS} onChange={setAnalyticsPeriod} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {analyticsLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : topCourses.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No courses yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topCourses} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="enrollments" fill="#e67000" radius={[0, 4, 4, 0]} name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">Showing top 8 courses · {periodLabel} period</p>
            </CardContent>
          </Card>

          {/* Role Breakdown */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Member Roles</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {analyticsLoading ? (
                <div className="flex justify-center"><Skeleton className="h-40 w-40 rounded-full" /></div>
              ) : roleBreakdown.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={roleBreakdown.map((r: any) => ({ ...r, count: parseInt(r.count) }))}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          outerRadius={68}
                          innerRadius={30}
                          paddingAngle={3}
                        >
                          {roleBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#0f172a",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                          itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                          labelStyle={{ color: "#64748b" }}
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-1">
                    {roleBreakdown.map((r: any, i: number) => (
                      <span key={r.role} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="capitalize">{r.role}</span>
                        <span className="font-semibold text-foreground">({parseInt(r.count)})</span>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Visitor Traffic */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visitor Trend with period picker */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Eye size={16} className="text-teal-500" /> Site Traffic
                </CardTitle>
                <PeriodSelector value={visitorPeriod} options={VISITOR_PERIODS} onChange={setVisitorPeriod} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {visitorsLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (visitors?.visitTrend ?? []).length === 0 ? (
                <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No visit data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={visitors.visitTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#14b8a6" strokeWidth={2} fill="url(#colorVisits)" name="Page Views" />
                    <Area type="monotone" dataKey="unique_visitors" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorUnique)" name="Unique Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-teal-500 inline-block rounded" /> Page Views</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-sky-500 inline-block rounded" /> Unique Visitors</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MousePointerClick size={16} className="text-sky-500" /> Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {visitorsLoading ? (
                <div className="px-5 py-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (visitors?.topPages ?? []).length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground text-center">No data yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {(visitors.topPages as any[]).map((p: any) => (
                    <div key={p.page} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <p className="text-xs text-foreground truncate font-mono flex-1" title={p.page}>{p.page}</p>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{p.unique_views} uniq</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{p.views}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users + Recent Enrollments */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Recently Joined Members</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground h-7">
                  <Link to="/admin/users">View all <ArrowRight size={11} /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {analyticsLoading ? (
                <div className="px-5 py-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : recentUsers.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground text-center">No members yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentUsers.map((u: any) => (
                    <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.full_name || u.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {(u.roles || []).filter(Boolean).map((r: string) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5">{r}</Badge>
                        ))}
                        {(!u.roles || u.roles.filter(Boolean).length === 0) && (
                          <Badge variant="outline" className="text-[10px] px-1.5">student</Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground hidden sm:block">
                          {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Recent Enrollments</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground h-7">
                  <Link to="/admin/enrollments">View all <ArrowRight size={11} /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!recentEnrollments ? (
                <div className="px-5 py-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : recentEnrollments.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground text-center">No enrollments yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentEnrollments.map((e: any) => (
                    <div key={e.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {(e.full_name || e.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.courses?.title || "Unknown course"}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.full_name || e.email}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {e.completed ? (
                          <Badge className="bg-green-500/10 text-green-500 border-0 text-[10px]">Completed</Badge>
                        ) : e.progress > 0 ? (
                          <Badge variant="secondary" className="text-[10px]">{e.progress}%</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">New</Badge>
                        )}
                        <p className="text-[11px] text-muted-foreground hidden sm:block">
                          {new Date(e.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

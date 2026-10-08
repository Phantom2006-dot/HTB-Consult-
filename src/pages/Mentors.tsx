import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, CalendarDays, Briefcase, Search, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, scaleIn } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useMentors } from "@/hooks/use-mentors";

const MENTOR_GRADIENTS_DARK = [
  { grad: "from-blue-600/30 to-blue-500/10",     border: "border-blue-500/30",    text: "text-blue-300",    tag: "bg-blue-500/10 text-blue-300 border-blue-500/20"    },
  { grad: "from-amber-600/30 to-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-300",   tag: "bg-amber-500/10 text-amber-300 border-amber-500/20"   },
  { grad: "from-emerald-600/30 to-emerald-500/10",border:"border-emerald-500/30", text: "text-emerald-300", tag: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"},
  { grad: "from-purple-600/30 to-purple-500/10", border: "border-purple-500/30",  text: "text-purple-300",  tag: "bg-purple-500/10 text-purple-300 border-purple-500/20"  },
  { grad: "from-cyan-600/30 to-cyan-500/10",     border: "border-cyan-500/30",    text: "text-cyan-300",    tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"    },
  { grad: "from-rose-600/30 to-rose-500/10",     border: "border-rose-500/30",    text: "text-rose-300",    tag: "bg-rose-500/10 text-rose-300 border-rose-500/20"    },
];

const MENTOR_GRADIENTS_LIGHT = [
  { grad: "from-blue-100 to-blue-50",     border: "border-blue-200",    text: "text-blue-700",    tag: "bg-blue-50 text-blue-700 border-blue-200"    },
  { grad: "from-amber-100 to-amber-50",   border: "border-amber-200",   text: "text-amber-700",   tag: "bg-amber-50 text-amber-700 border-amber-200"   },
  { grad: "from-emerald-100 to-emerald-50",border:"border-emerald-200", text: "text-emerald-700", tag: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  { grad: "from-purple-100 to-purple-50", border: "border-purple-200",  text: "text-purple-700",  tag: "bg-purple-50 text-purple-700 border-purple-200"  },
  { grad: "from-cyan-100 to-cyan-50",     border: "border-cyan-200",    text: "text-cyan-700",    tag: "bg-cyan-50 text-cyan-700 border-cyan-200"    },
  { grad: "from-rose-100 to-rose-50",     border: "border-rose-200",    text: "text-rose-700",    tag: "bg-rose-50 text-rose-700 border-rose-200"    },
];

const Mentors = () => {
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();
  const { data: mentors, isLoading } = useMentors();

  const GRADIENTS = isDark ? MENTOR_GRADIENTS_DARK : MENTOR_GRADIENTS_LIGHT;

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const filtered = (mentors || []).filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SidebarLayout>
      {/* Page banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1280&q=72&auto=format&fit=crop"
            srcSet="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=768&q=72&auto=format&fit=crop 768w, https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1280&q=72&auto=format&fit=crop 1280w"
            sizes="100vw"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${isDark ? "bg-[hsl(163,36%,8%)]/92 backdrop-blur-[2px]" : "bg-slate-900/60 backdrop-blur-[1px]"}`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? "from-[hsl(163,40%,8%)]/85 via-[hsl(163,40%,8%)]/45 to-transparent" : "from-slate-900/70 via-slate-900/35 to-transparent"}`} />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-purple-500/7 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-primary/6 blur-[60px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-md shrink-0">
              <Users size={18} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-white text-shadow-lg">Book a Mentor</h1>
              <p className="text-xs text-white/80 text-shadow">Connect with experienced professionals for 1-on-1 guidance</p>
            </div>
          </motion.div>

          {/* Search inside banner */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialization…"
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Stats bar */}
        {!isLoading && mentors && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className={`flex flex-wrap items-center gap-3 sm:gap-6 mb-8 p-3 sm:p-4 rounded-xl border ${isDark ? "glass border-white/8" : "bg-card border-border shadow-sm"}`}>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-purple-500 shrink-0" />
              <span className={`text-xs sm:text-sm ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
                <span className={`font-semibold ${isDark ? "text-white" : "text-foreground"}`}>{mentors.length}</span> mentors
              </span>
            </div>
            <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-white/10" : "bg-border"}`} />
            <div className="flex items-center gap-2">
              <Award size={15} className={`shrink-0 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
              <span className={`text-xs sm:text-sm ${isDark ? "text-white/60" : "text-muted-foreground"}`}>Expert professionals</span>
            </div>
            <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-white/10" : "bg-border"}`} />
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className={`shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className={`text-xs sm:text-sm ${isDark ? "text-white/60" : "text-muted-foreground"}`}>1-on-1 sessions</span>
            </div>
          </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`rounded-xl border p-5 flex flex-col items-center space-y-3 ${isDark ? "glass border-white/8" : "bg-card border-border shadow-sm"}`}>
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-3 ${isDark ? "glass border-white/10" : "bg-muted border-border"}`}>
                <Search size={22} className={isDark ? "text-white/20" : "text-muted-foreground/40"} />
              </div>
              <p className={`text-sm ${isDark ? "text-white/40" : "text-muted-foreground"}`}>No mentors found matching "{search}"</p>
            </div>
          ) : (
            filtered.map((m, i) => {
              const g = GRADIENTS[i % GRADIENTS.length];
              return (
                <motion.div key={m.id} initial="hidden" animate="visible" variants={scaleIn} custom={i % 6} className="card-lift">
                  <Link to={`/mentor/${m.id}`}>
                    <div className={`rounded-xl border transition-all duration-300 h-full overflow-hidden ${isDark ? `glass ${g.border} hover:border-opacity-60` : `bg-card ${g.border} shadow-sm hover:shadow-md`}`}>

                      {/* Gradient accent top bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${g.grad}`} />

                      <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
                        {/* Avatar with rings */}
                        <div className="relative mt-2">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${g.grad} border-2 ${g.border} ${g.text} flex items-center justify-center text-xl font-bold`}>
                            {getInitials(m.name)}
                          </div>
                          <div className={`absolute inset-0 rounded-full border ${g.border} scale-[1.3] opacity-30`} />
                          <div className={`absolute inset-0 rounded-full border ${g.border} scale-[1.6] opacity-15`} />
                        </div>

                        <div>
                          <h3 className={`font-semibold text-sm ${isDark ? "text-white" : "text-foreground"}`}>{m.name}</h3>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-white/45" : "text-muted-foreground"}`}>{m.title}</p>
                        </div>

                        <div className={`flex items-center gap-3 text-xs ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                          <span className="flex items-center gap-1"><Star size={12} className={`fill-current ${isDark ? "text-amber-400" : "text-amber-500"}`} /> {m.rating}</span>
                          <span className="flex items-center gap-1"><Briefcase size={12} /> {m.years_experience} yrs</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {m.total_sessions}</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-1.5">
                          {m.specializations.slice(0, 3).map((t) => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] border ${g.tag}`}>{t}</span>
                          ))}
                        </div>

                        <Button size="sm" className="w-full text-xs gap-1 mt-auto bg-gradient-gold hover:opacity-90 btn-shimmer">
                          <CalendarDays size={12} /> View Profile
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default Mentors;

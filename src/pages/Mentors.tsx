import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, CalendarDays, Briefcase, Search, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, scaleIn } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useMentors } from "@/hooks/use-mentors";

const MENTOR_GRADIENTS = [
  "from-blue-600/30 to-blue-500/10 border-blue-500/30 text-blue-300",
  "from-amber-600/30 to-amber-500/10 border-amber-500/30 text-amber-300",
  "from-emerald-600/30 to-emerald-500/10 border-emerald-500/30 text-emerald-300",
  "from-purple-600/30 to-purple-500/10 border-purple-500/30 text-purple-300",
  "from-cyan-600/30 to-cyan-500/10 border-cyan-500/30 text-cyan-300",
  "from-rose-600/30 to-rose-500/10 border-rose-500/30 text-rose-300",
];

const Mentors = () => {
  const [search, setSearch] = useState("");
  const { data: mentors, isLoading } = useMentors();

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
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/92 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,40%,8%)]/85 via-[hsl(163,40%,8%)]/45 to-transparent" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-purple-500/7 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-primary/6 blur-[60px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-md">
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
              placeholder="Search mentors by name or specialization..."
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(163,40%,8%)]/70 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Stats bar */}
        {!isLoading && mentors && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="flex items-center gap-6 mb-8 p-4 glass rounded-xl border border-white/8">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              <span className="text-sm text-white/60"><span className="text-white font-semibold">{mentors.length}</span> mentors available</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span className="text-sm text-white/60">Expert professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-400" />
              <span className="text-sm text-white/60">1-on-1 sessions</span>
            </div>
          </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl border border-white/8 p-5 flex flex-col items-center space-y-3">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-14 h-14 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-3">
                <Search size={22} className="text-white/20" />
              </div>
              <p className="text-white/40">No mentors found matching "{search}"</p>
            </div>
          ) : (
            filtered.map((m, i) => {
              const gradientClass = MENTOR_GRADIENTS[i % MENTOR_GRADIENTS.length];
              const [gradFrom, gradTo, border, textColor] = gradientClass.split(" ");
              return (
                <motion.div key={m.id} initial="hidden" animate="visible" variants={scaleIn} custom={i % 6} className="card-lift">
                  <Link to={`/mentor/${m.id}`}>
                    <div className={`glass rounded-xl border ${border} hover:border-opacity-60 transition-all duration-300 h-full overflow-hidden`}
                      style={{ boxShadow: "none" }}>

                      {/* Gradient accent top bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${gradFrom} ${gradTo}`} />

                      <div className="p-5 flex flex-col items-center text-center space-y-3">
                        {/* Avatar with rings */}
                        <div className="relative mt-2">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradFrom} ${gradTo} border-2 ${border} ${textColor} flex items-center justify-center text-xl font-bold`}>
                            {getInitials(m.name)}
                          </div>
                          <div className={`absolute inset-0 rounded-full border ${border} scale-[1.3] opacity-30`} />
                          <div className={`absolute inset-0 rounded-full border ${border} scale-[1.6] opacity-15`} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-white">{m.name}</h3>
                          <p className="text-xs text-white/45">{m.title}</p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {m.rating}</span>
                          <span className="flex items-center gap-1"><Briefcase size={12} /> {m.years_experience} yrs</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {m.total_sessions}</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-1.5">
                          {m.specializations.slice(0, 3).map((t) => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] bg-white/5 ${textColor} border border-white/8`}>{t}</span>
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

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, CalendarDays, Briefcase, Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useMentors } from "@/hooks/use-mentors";

const Mentors = () => {
  const [search, setSearch] = useState("");
  const { data: mentors, isLoading } = useMentors();

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const filtered = (mentors || []).filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">Mentors</h1>
          <p className="text-sm text-muted-foreground">Connect with experienced professionals for 1-on-1 guidance</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors by name or specialization..." className="pl-10 bg-secondary border-border text-secondary-foreground placeholder:text-secondary-foreground/50" />
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="p-5 flex flex-col items-center space-y-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No mentors found matching "{search}"</p>
            </div>
          ) : (
            filtered.map((m) => (
              <Link key={m.id} to={`/mentor/${m.id}`}>
                <Card className="border-border bg-card hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">{getInitials(m.name)}</div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">{m.title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star size={12} className="text-primary fill-primary" /> {m.rating}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {m.years_experience} yrs</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {m.total_sessions}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {m.specializations.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                    <Button size="sm" className="w-full text-xs gap-1 mt-auto">
                      <CalendarDays size={12} /> View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default Mentors;

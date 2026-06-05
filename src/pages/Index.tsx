import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, Target, CheckCircle, Star, Lightbulb,
  UserCheck, Briefcase, Brain, BarChart3, Quote, LogIn,
  LayoutDashboard, Sparkles, TrendingUp, Award, ChevronRight,
  Users, Clock, Shield, Rocket, GraduationCap, Building2, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/use-courses";

/* ── Animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ── Data ── */
const learningSteps = [
  {
    num: "01",
    title: "BA Foundation Bootcamp",
    desc: "Build strong foundations in Business Analysis principles, techniques and best practices.",
    tag: "Foundation",
    tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    icon: BookOpen,
    iconBg: "bg-blue-500/15 text-blue-400",
  },
  {
    num: "02",
    title: "Practical BA Application & Simulation",
    desc: "Apply your knowledge through hands-on exercises, case studies and real-world simulations.",
    tag: "Application",
    tagColor: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    icon: Target,
    iconBg: "bg-purple-500/15 text-purple-400",
  },
  {
    num: "03",
    title: "Domain Specialisation",
    desc: "Specialise in your industry of choice and deepen your domain knowledge.",
    tag: "Specialisation",
    tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    icon: Brain,
    iconBg: "bg-amber-500/15 text-amber-400",
  },
  {
    num: "04",
    title: "Industry Project Experience & Mentorship",
    desc: "Work on real projects with expert mentors and build your professional portfolio.",
    tag: "Impact",
    tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    icon: Users,
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
];

const programmes = [
  {
    icon: GraduationCap,
    iconBg: "bg-primary/15 text-primary",
    title: "BA Foundation Bootcamp",
    badge: "Beginner Friendly",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    desc: "Perfect for beginners and career changers. Start your BA journey with confidence.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-purple-500/15 text-purple-400",
    title: "Practical BA Simulation",
    badge: "Hands-on Learning",
    badgeColor: "bg-purple-500/15 text-purple-400",
    desc: "Build practical skills through real scenarios, case studies and deliverable simulations.",
  },
  {
    icon: Building2,
    iconBg: "bg-amber-500/15 text-amber-400",
    title: "Domain Specialisation",
    badge: "Industry Focused",
    badgeColor: "bg-amber-500/15 text-amber-400",
    desc: "Choose your domain and become an expert BA in high-demand industries.",
  },
];

const whyReasons = [
  {
    icon: Target,
    title: "Practical & Relevant Learning",
    desc: "Real-world scenarios and industry aligned curriculum.",
    color: "bg-primary/15 text-primary",
  },
  {
    icon: UserCheck,
    title: "Expert Mentorship",
    desc: "Learn from senior BAs with years of industry experience.",
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Career Focused",
    desc: "Build the right skills, portfolio and mindset to get hired.",
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: Shield,
    title: "Trusted by Learners",
    desc: "Join thousands of learners transforming their careers.",
    color: "bg-emerald-500/15 text-emerald-400",
  },
];

const testimonials = [
  {
    quote: "The BA Foundation Bootcamp gave me the clarity and confidence to start my BA career. The practical approach is outstanding!",
    name: "Aisha M.",
    role: "Junior Business Analyst",
    initial: "A",
    color: "bg-primary/20 text-primary",
  },
  {
    quote: "The simulations and real-world projects helped me transition from theory to practice seamlessly. Highly recommended!",
    name: "Kevin L.",
    role: "Business Analyst",
    initial: "K",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    quote: "The mentorship and domain specialisation helped me stand out and land my dream role in the banking sector.",
    name: "Sarah T.",
    role: "BA Associate",
    initial: "S",
    color: "bg-purple-500/20 text-purple-400",
  },
];

const stats = [
  { value: "500+", label: "Professionals Trained", icon: TrendingUp },
  { value: "95%", label: "Satisfaction Rate", icon: Star },
  { value: "12+", label: "Expert Programmes", icon: BookOpen },
  { value: "10+", label: "Years Consulting", icon: Award },
];

const trustBadges = [
  { icon: BookOpen, label: "Practical Learning", sub: "Hands-on projects & simulations" },
  { icon: UserCheck, label: "Industry Mentorship", sub: "Learn from experienced BA professionals" },
  { icon: Rocket, label: "Structured Pathway", sub: "From foundation to industry readiness" },
  { icon: TrendingUp, label: "Career Growth", sub: "Build skills that get you hired" },
];

/* ═══════════════════════════════════════════════════════════ */

const POPULAR_CATEGORIES = [
  "Business Analysis",
  "Project Delivery",
  "Digital Transformation",
  "Business Strategy",
  "Bid Writing",
  "Consulting & Leadership",
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: courses } = useCourses();

  const searchResults = searchQuery.trim().length >= 2
    ? (courses || []).filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.tags || []).some((t: string) => t.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length === 1) {
      navigate(`/course/${searchResults[0].id}`);
      setShowResults(false);
    } else if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    navigate(`/courses?category=${encodeURIComponent(cat)}`);
  };

  return (
    <Layout>

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center -mt-[72px] pt-[72px]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)/0.92) 50%, hsl(var(--background)/0.80) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 35%)" }} />
        <div className="absolute inset-0 grid-pattern opacity-15" />

        {/* Glow blob */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: "hsl(var(--primary) / 0.06)" }} />

        <div className="container mx-auto px-6 lg:px-16 relative z-10 py-20 lg:py-28 max-w-5xl">

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest glass border border-primary/30 mb-8"
            style={{ color: "hsl(var(--primary))" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))" }} />
            More visibility. More skills. More impact.
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl xl:text-[3.5rem] font-bold text-white leading-[1.1] mb-5 tracking-tight max-w-3xl"
          >
            Find the perfect{" "}
            <span className="text-gradient-gold">course</span>{" "}
            for your career
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-sm lg:text-base text-white/55 mb-10 leading-relaxed font-light max-w-xl"
          >
            Find the right training for your professional goals — practical, industry-aligned, and delivered by real consulting experts.
          </motion.p>

          {/* Search bar + inline results */}
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="relative w-full max-w-2xl mb-8"
          >
            <form onSubmit={handleSearch} className="flex items-center w-full">
              <div className="flex flex-1 items-center bg-white rounded-l-full shadow-2xl overflow-hidden">
                <Search size={17} className="ml-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search for any course..."
                  className="flex-1 px-4 py-4 text-slate-800 text-sm bg-transparent outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setShowResults(false); }}
                    className="mr-3 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-[52px] px-6 rounded-r-full font-semibold text-white text-sm transition-opacity hover:opacity-90 shrink-0 flex items-center gap-2"
                style={{ background: "hsl(var(--primary))" }}
              >
                <Search size={15} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Inline results dropdown */}
            {showResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <>
                    <ul>
                      {searchResults.map((course) => (
                        <li key={course.id}>
                          <Link
                            to={`/course/${course.id}`}
                            onClick={() => { setShowResults(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <BookOpen size={14} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary transition-colors">
                                {course.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{course.category}</p>
                            </div>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-slate-100 px-5 py-3 bg-slate-50">
                      <Link
                        to={`/courses?search=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => setShowResults(false)}
                        className="text-xs font-semibold flex items-center gap-1.5"
                        style={{ color: "hsl(var(--primary))" }}
                      >
                        View all {searchResults.length >= 6 ? "results" : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`} for "{searchQuery.trim()}"
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="px-5 py-5 text-center">
                    <p className="text-sm text-slate-500">No courses found for <strong className="text-slate-700">"{searchQuery}"</strong></p>
                    <Link
                      to="/courses"
                      onClick={() => setShowResults(false)}
                      className="text-xs mt-1 inline-block"
                      style={{ color: "hsl(var(--primary))" }}
                    >
                      Browse all courses →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Popular categories */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.45 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-white/40 text-xs font-medium mr-1">Popular:</span>
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="px-3.5 py-1.5 rounded-full border border-white/20 text-white/65 text-xs font-medium hover:border-primary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200 glass"
              >
                {cat}
              </button>
            ))}
          </motion.div>

        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </section>

      {/* ─────────────────── LEARNING PATHWAY (white) ─────────────────── */}
      <section className="pt-24 lg:pt-32 pb-0 relative overflow-hidden bg-white">
        {/* Top divider from dark hero */}
        <div className="absolute top-0 left-0 right-0 h-px bg-slate-200" />

        {/* Very subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Our Learning Pathway
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              A structured journey from{" "}
              <em className="not-italic text-gradient-gold">foundation to industry impact</em>
            </motion.h2>
          </motion.div>

          {/* ── Desktop/tablet: flex row with inline connectors (md+) ── */}
          <div className="hidden md:flex items-start">
            {learningSteps.map((step, i) => (
              <div key={step.num} className="flex items-start flex-1 min-w-0">
                {/* Step column */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.45 }}
                  className="flex-1 min-w-0"
                >
                  {/* Numbered circle — centered */}
                  <div className="flex justify-center mb-5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300 card-lift mx-1 h-full text-center">
                    <div className={`w-11 h-11 rounded-xl ${step.iconBg} flex items-center justify-center mb-4 mx-auto`}>
                      <step.icon size={19} />
                    </div>
                    <h3 className="font-serif text-base font-normal text-slate-900 mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{step.desc}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${step.tagColor}`}>
                      {step.tag}
                    </span>
                  </div>
                </motion.div>

                {/* Connector between steps — mt aligns with circle centre (circle=3rem → centre=1.5rem, arrow=1.75rem → half=0.875rem → mt=0.625rem) */}
                {i < learningSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.25, duration: 0.4 }}
                    className="flex items-center shrink-0 mt-[0.625rem]"
                  >
                    {/* Left dashed segment */}
                    <div
                      className="w-4 xl:w-6"
                      style={{ borderTop: "2px dashed hsl(var(--primary) / 0.35)", height: 0 }}
                    />
                    {/* Arrow circle */}
                    <div
                      className="w-7 h-7 rounded-full border-2 bg-white flex items-center justify-center shrink-0"
                      style={{
                        borderColor: "hsl(var(--primary) / 0.4)",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      <ChevronRight size={13} />
                    </div>
                    {/* Right dashed segment */}
                    <div
                      className="w-4 xl:w-6"
                      style={{ borderTop: "2px dashed hsl(var(--primary) / 0.35)", height: 0 }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* ── Mobile: vertical list ── */}
          <div className="flex flex-col gap-4 md:hidden">
            {learningSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex gap-4"
              >
                {/* Left column: number + vertical line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    {i + 1}
                  </div>
                  {i < learningSteps.length - 1 && (
                    <div
                      className="flex-1 w-px mt-2"
                      style={{ background: "hsl(var(--primary) / 0.2)" }}
                    />
                  )}
                </div>
                {/* Card content */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex-1 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center mb-3`}>
                    <step.icon size={17} />
                  </div>
                  <h3 className="font-serif text-base font-normal text-slate-900 mb-1.5 leading-snug">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{step.desc}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${step.tagColor}`}>
                    {step.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── EXPLORE PROGRAMMES (white, seamless) ─────────────────── */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-white">
        {/* Subtle section divider */}
        <div className="absolute top-0 left-6 right-6 lg:left-12 lg:right-12 h-px bg-slate-100" />

        {/* Very light grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Soft radial accent blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.06] pointer-events-none"
          style={{ background: "hsl(var(--primary))" }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Start Your Journey
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Explore Our{" "}
              <em className="not-italic text-gradient-gold">Programmes</em>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2}
              className="mt-4 text-slate-500 text-sm max-w-xl mx-auto leading-relaxed"
            >
              Choose the pathway that matches your experience level and career goals.
            </motion.p>
          </motion.div>

          {/* Programme cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {programmes.map((prog, i) => (
              <motion.div
                key={prog.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={scaleIn}
                className="card-lift"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-7 h-full hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 group">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${prog.iconBg} flex items-center justify-center mb-5`}>
                    <prog.icon size={24} />
                  </div>
                  {/* Badge */}
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                  {/* Title */}
                  <h3 className="font-serif text-xl font-normal text-slate-900 mb-2 leading-snug">
                    {prog.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{prog.desc}</p>
                  {/* CTA link */}
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA row */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              className="bg-gradient-gold hover:opacity-90 font-semibold px-8 h-11 text-sm btn-shimmer shadow-orange"
            >
              <Link to="/auth?tab=signup">Get Started Free <ArrowRight className="ml-2" size={15} /></Link>
            </Button>
            <Button
              asChild
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-8 h-11 text-sm shadow-none"
            >
              <Link to="/courses">View All Courses</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── WHY HTB (white) ─────────────────── */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-6 right-6 lg:left-12 lg:right-12 h-px bg-slate-100" />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-start">
            {/* Left text */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <motion.p variants={fadeUp} custom={0}
                className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
                style={{ color: "hsl(var(--primary))" }}
              >
                Why HTB Academy
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1}
                className="text-5xl md:text-6xl font-serif text-slate-900 mb-4 leading-[1.1]"
              >
                We don't just teach.{" "}
                <em className="not-italic text-gradient-gold">We prepare you for impact.</em>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2}
                className="text-slate-500 leading-[1.9] mb-8 text-sm lg:text-base max-w-md"
              >
                Our practical and structured approach ensures you gain the skills, confidence and experience to thrive in real-world BA roles.
              </motion.p>
              <motion.div variants={fadeUp} custom={3}>
                <Button
                  asChild
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 shadow-none"
                >
                  <Link to="/about">Learn More About Us <ChevronRight size={15} className="ml-1" /></Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right — 2×2 feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {whyReasons.map((reason, i) => (
                <motion.div
                  key={reason.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={scaleIn}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/8 transition-all duration-300 card-lift"
                >
                  <div className={`w-10 h-10 rounded-xl ${reason.color} flex items-center justify-center mb-3`}>
                    <reason.icon size={18} />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">{reason.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{reason.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── STATS (white) ─────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeIn}
                className="py-10 px-6 text-center"
              >
                <s.icon size={18} className="mx-auto mb-3 text-primary opacity-70" />
                <p className="text-4xl lg:text-5xl font-serif stat-number mb-1">{s.value}</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS (white) ─────────────────── */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-6 right-6 lg:left-12 lg:right-12 h-px bg-slate-100" />
        {/* Bottom divider back to dark */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />

        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
          style={{ background: "hsl(var(--primary))" }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              What Our Learners Say
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900"
            >
              Real people.{" "}
              <em className="not-italic text-gradient-gold">Real growth. Real impact.</em>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={scaleIn}
                className="card-lift"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-7 h-full hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  {/* Quote mark */}
                  <Quote size={26} className="mb-3" style={{ color: "hsl(var(--primary) / 0.35)" }} />
                  <p className="font-elegant text-lg italic text-slate-600 leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                  {/* Divider */}
                  <div className="h-px bg-slate-100 mb-5" />
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-sm font-bold`}>
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── CTA BANNER ─────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-cta-bg)" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-15"
          style={{ background: "hsl(var(--primary))" }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="max-w-xl"
            >
              <motion.div
                variants={fadeUp} custom={0}
                className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6"
              >
                <Rocket size={22} className="text-primary" />
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1}
                className="text-3xl md:text-4xl font-serif text-white mb-3 leading-tight"
              >
                Ready to start your BA journey?
              </motion.h2>
              <motion.p variants={fadeUp} custom={2}
                className="text-white/50 text-sm leading-relaxed"
              >
                Join HTB Academy and take the next step towards a future ready career in Business Analysis.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="flex flex-wrap gap-3 shrink-0"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-gold hover:opacity-90 font-semibold px-8 h-12 text-sm btn-shimmer shadow-orange"
              >
                <Link to="/auth?tab=signup">Register Now <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="glass border-white/20 hover:bg-white/10 text-white font-semibold px-8 h-12 text-sm"
              >
                <Link to="/services">Explore Pathways</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Index;

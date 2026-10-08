import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, ArrowRight, BookOpen, ArrowDownAZ, ArrowUpAZ, Hash, Lock, X, Bell,
  GraduationCap, CreditCard, ChevronRight, ArrowLeft, Brain, Users, Target,
  Building2, Search, RefreshCw, Layers, ChevronDown, BarChart3,
  Video, Award, FileText, CheckCircle2, CalendarDays, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/contexts/AuthContext";

/* ── Category folder metadata (4 official pathways) ── */
const FOLDERS = [
  {
    key: "Business Analysis & Digital Transformation",
    label: "Business Analysis & Digital Transformation",
    description:
      "Learn to analyse, improve and transform business with practical frameworks, elicitation techniques and digital tools.",
    icon: BarChart3,
    accent: "hsl(30 100% 46%)",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    borderIdle: "border-orange-500/15",
    borderHover: "hover:border-orange-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(234,119,0,0.22)]",
    tag: "Analysis",
    tagCls: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    programme: {
      type: "foundation" as const,
      badge: "Foundation Programme",
      subtitle:
        "Master the fundamentals of Business Analysis and Digital Transformation through structured learning, practical exercises, real project simulations and a live Bootcamp. Build the confidence and capability required to operate effectively in real project environments.",
      phases: [
        {
          title: "Phase 1: Foundation Learning",
          intro: "Complete the 10 structured learning modules covering:",
          items: [
            "Introduction to Business Analysis",
            "Business Analysis in the SDLC",
            "Requirements Engineering",
            "Stakeholder Management",
            "Process Modelling",
            "Documentation & Business Analysis Artefacts",
            "Agile Business Analysis",
            "User Acceptance Testing",
            "BA Tools & Techniques",
            "End to End Project Simulation",
          ],
        },
        {
          title: "Phase 2: Live Practical Bootcamp",
          intro: "Apply everything you've learned through instructor-led workshops including:",
          items: [
            "Live Zoom Sessions",
            "Real Project Simulation",
            "Group Workshops",
            "Stakeholder Role Play",
            "Documentation Reviews",
            "CV & Portfolio Development",
            "Interview Preparation",
            "Career Coaching",
          ],
        },
      ],
    },
  },
  {
    key: "Leadership & Professional Development",
    label: "Leadership & Professional Development",
    description:
      "Strengthen mindset, communication, influence and leadership for career growth and professional impact.",
    icon: Users,
    accent: "hsl(160 60% 45%)",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    borderIdle: "border-emerald-500/15",
    borderHover: "hover:border-emerald-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.18)]",
    tag: "Leadership",
    tagCls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    programme: {
      type: "live" as const,
      badge: "Live Instructor-Led Programme",
      subtitle:
        "Develop the mindset, leadership and communication skills needed to influence others, lead with confidence and create lasting professional impact. This live programme combines practical learning, reflection and real world application through interactive Zoom sessions.",
      learn: [
        "Leadership Foundations",
        "Emotional Intelligence",
        "Effective Communication",
        "Influencing & Stakeholder Management",
        "Decision Making",
        "Personal Effectiveness",
        "Mindset Before Skillset® Principles",
        "Leading Teams with Confidence",
        "Certificate of Completion",
      ],
      delivery: [
        "Live Zoom Sessions",
        "Practical Workshops",
        "Interactive Group Discussions",
        "Practical Course Resources",
        "Certificate of Completion",
      ],
      who: [
        "Emerging Leaders",
        "Team Leaders",
        "Supervisors",
        "Managers",
        "Business Professionals",
        "Anyone looking to strengthen their leadership capability",
      ],
      cohortSub:
        "Secure your place today and join our next instructor-led cohort. Learn through engaging discussions, practical exercises and leadership scenarios that prepare you to lead with confidence.",
      cta: "Take the next step in your leadership journey.",
    },
  },
  {
    key: "Agile, Product & Delivery Management",
    label: "Agile, Product & Delivery Management",
    description:
      "Build capability in Agile, Scrum, Product Ownership and delivery excellence for high-velocity teams.",
    icon: Layers,
    accent: "hsl(217 91% 56%)",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    borderIdle: "border-blue-500/15",
    borderHover: "hover:border-blue-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.18)]",
    tag: "Agile",
    tagCls: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    programme: {
      type: "live" as const,
      badge: "Live Instructor-Led Programme",
      subtitle:
        "Build practical capability in Agile, Scrum, Product Ownership and Delivery Management through live Zoom sessions, interactive workshops and real world case studies. This hands-on programme is designed for professionals who want to lead and deliver successful projects with confidence.",
      learn: [
        "Agile & Scrum Foundations",
        "Product Ownership in Practice",
        "Sprint Planning & Backlog Management",
        "Stakeholder Management",
        "Delivery Planning",
        "Agile Ceremonies",
        "User Stories & Backlog Refinement",
        "Real Project Scenarios",
        "Certificate of Completion",
      ],
      delivery: [
        "Live Zoom Sessions",
        "Practical Workshops",
        "Interactive Group Discussions",
        "Practical Course Resources",
        "Certificate of Completion",
      ],
      who: [
        "Aspiring Product Owners",
        "Scrum Masters",
        "Business Analysts",
        "Project Managers",
        "Delivery Managers",
        "Professionals transitioning into Agile roles",
      ],
      cohortSub:
        "Secure your place today and join our next instructor-led cohort. Learn through live teaching, practical workshops and real project discussions that prepare you for Agile delivery in the workplace.",
      cta: "Take the next step in your Agile journey and build practical skills that you can apply with confidence.",
    },
  },
  {
    key: "Industry & Domain Specialisation",
    label: "Industry & Domain Specialisation",
    description:
      "Apply your skills across real world industries and professional domains — finance, healthcare, technology and more.",
    icon: Building2,
    accent: "hsl(270 80% 60%)",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    borderIdle: "border-purple-500/15",
    borderHover: "hover:border-purple-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.18)]",
    tag: "Specialisation",
    tagCls: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    programme: {
      type: "live" as const,
      badge: "Live Instructor-Led Programme",
      subtitle:
        "Build practical knowledge across key industries and understand how Business Analysis, Product Management and Agile delivery are applied in different business environments. Learn from real world examples, case studies and practical discussions.",
      learn: [
        "Banking & Financial Services",
        "Healthcare",
        "Insurance",
        "Retail & E-Commerce",
        "Public Sector",
        "Cyber Security & Identity Management",
        "Digital Transformation",
        "Industry Case Studies",
        "Certificate of Completion",
      ],
      delivery: [
        "Live Zoom Sessions",
        "Practical Workshops",
        "Interactive Group Discussions",
        "Practical Course Resources",
        "Certificate of Completion",
      ],
      who: [
        "Business Analysts",
        "Product Owners",
        "Scrum Masters",
        "Project Managers",
        "Consultants",
        "Professionals looking to specialise in industry domains",
      ],
      cohortSub:
        "Secure your place today and explore how professionals deliver value across different industries through practical learning and real business scenarios.",
      cta: "Expand your industry knowledge and become more confident across multiple sectors.",
    },
  },
];

type SortOption = "numeric" | "az" | "za";

/* ── Programme info panel rendered inside an open folder ── */
type FoundationProgramme = {
  type: "foundation";
  badge: string;
  subtitle: string;
  phases: { title: string; intro: string; items: string[] }[];
};
type LiveProgramme = {
  type: "live";
  badge: string;
  subtitle: string;
  learn: string[];
  delivery: string[];
  who: string[];
  cohortSub: string;
  cta: string;
};
type Programme = FoundationProgramme | LiveProgramme;

const DELIVERY_ICONS: Record<string, React.ElementType> = {
  "Live Zoom Sessions": Video,
  "Practical Workshops": Target,
  "Interactive Group Discussions": Users,
  "Practical Course Resources": FileText,
  "Certificate of Completion": Award,
};

function ProgrammePanel({ programme, accentColor }: { programme: Programme; accentColor: string }) {
  const accentBorder = accentColor.replace("text-", "border-").replace("-400", "-500/30");
  const accentBg = accentColor.replace("text-", "bg-").replace("-400", "-500/8");
  const accentText = accentColor;

  if (programme.type === "foundation") {
    return (
      <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden">
        {/* Header */}
        <div className={`px-6 pt-6 pb-5 border-b border-gray-100`}>
          <span className={`inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${accentBg} ${accentText} border ${accentBorder}`}>
            {programme.badge}
          </span>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{programme.subtitle}</p>
        </div>

        {/* Phases */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Programme Structure</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {programme.phases.map((phase, pi) => (
              <div key={pi} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
                    style={{ background: pi === 0 ? "hsl(30 100% 46%)" : "hsl(163 60% 35%)" }}>
                    {pi + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{phase.title}</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">{phase.intro}</p>
                <ul className="space-y-1.5">
                  {phase.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 size={12} className={`mt-0.5 shrink-0 ${accentText}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-start">
            <Link
              to="/auth?tab=signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Register Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <span className={`inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${accentBg} ${accentText} border ${accentBorder}`}>
          {programme.badge}
        </span>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{programme.subtitle}</p>
      </div>

      {/* Three-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* What You'll Learn */}
        <div className="p-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">What You'll Learn</p>
          <ul className="space-y-1.5">
            {programme.learn.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 size={12} className={`mt-0.5 shrink-0 ${accentText}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery Format */}
        <div className="p-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">Delivery Format</p>
          <ul className="space-y-2">
            {programme.delivery.map((item, i) => {
              const Icon = DELIVERY_ICONS[item] ?? CheckCircle2;
              return (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <Icon size={13} className={`shrink-0 ${accentText}`} />
                  {item}
                </li>
              );
            })}
          </ul>

          {/* Next Cohort */}
          <div className={`mt-5 rounded-xl p-3.5 border ${accentBorder} ${accentBg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays size={12} className={accentText} />
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">Next Cohort</p>
            </div>
            <p className={`text-xs font-semibold ${accentText} mb-1`}>Live Cohort Launching Soon</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">{programme.cohortSub}</p>
          </div>
        </div>

        {/* Who Is This For */}
        <div className="p-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">Who Is This For?</p>
          <ul className="space-y-1.5 mb-5">
            {programme.who.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <UserCheck size={12} className={`mt-0.5 shrink-0 ${accentText}`} />
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-[11px] text-gray-500 italic leading-relaxed">{programme.cta}</p>
            <Link
              to="/auth?tab=signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Register Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Advanced: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const SORT_LABELS: Record<SortOption, string> = {
  numeric: "Numeric (1, 2, 3…)",
  az: "A → Z",
  za: "Z → A",
};

function extractLeadingNumber(title: string): number {
  const match = title.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

/* ═══════════════════════════════════════════════════════ */

const Courses = () => {
  const { user } = useAuth();
  const { data: courses, isLoading } = useCourses();
  const { data: enrollmentsData } = useEnrollments();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("numeric");
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

  // Support ?category= deep-link
  useEffect(() => {
    const cat = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat) {
      const match = FOLDERS.find(
        (f) => f.key.toLowerCase() === cat.toLowerCase() || f.label.toLowerCase() === cat.toLowerCase()
      );
      if (match) setSelectedFolder(match.key);
    }
    if (search) setSearchQuery(search);
  }, [searchParams]);

  const enrolledIds = useMemo(
    () => new Set((enrollmentsData || []).map((e: any) => e.course_id)),
    [enrollmentsData]
  );

  // Count courses per folder key
  const folderCounts = useMemo(() => {
    if (!courses) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    FOLDERS.forEach((f) => { counts[f.key] = 0; });
    courses.forEach((c) => {
      if (counts[c.category] !== undefined) counts[c.category]++;
    });
    return counts;
  }, [courses]);

  // Courses to show in the open folder (or global search)
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    let base = selectedFolder
      ? courses.filter((c) => c.category === selectedFolder)
      : courses;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      base = base.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return [...base].sort((a, b) => {
      if (sortBy === "numeric") return extractLeadingNumber(a.title) - extractLeadingNumber(b.title);
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return 0;
    });
  }, [courses, selectedFolder, searchQuery, sortBy]);

  const activeFolderMeta = selectedFolder
    ? FOLDERS.find((f) => f.key === selectedFolder)
    : null;

  // When user is searching from folder view, show results across all
  const isSearching = searchQuery.trim().length > 0;
  const showCourseGrid = selectedFolder !== null || isSearching;

  const openFolder = (key: string) => {
    setSelectedFolder(key);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeFolder = () => {
    setSelectedFolder(null);
    setSearchQuery("");
  };

  return (
    <Layout>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden -mt-[72px] pt-[140px] lg:pt-[160px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1280&q=72&auto=format&fit=crop"
            srcSet="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=768&q=72&auto=format&fit=crop 768w, https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1280&q=72&auto=format&fit=crop 1280w"
            sizes="100vw"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/93 backdrop-blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,40%,8%)]/90 via-[hsl(163,40%,8%)]/60 to-[hsl(163,40%,8%)]/30" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/6 blur-[100px]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 mb-4 backdrop-blur-md">
              <GraduationCap size={13} className="text-primary" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">HTB Consult Academy</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white mb-4 text-shadow-lg leading-[1.08] tracking-display">
              Practical Training for <em className="text-gradient-gold not-italic">Professional Growth</em>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-white/85 max-w-2xl leading-relaxed text-shadow">
              Practical skills training in business analysis, project delivery, digital transformation, and professional development — built from real consulting experience.
            </motion.p>
            {!isLoading && courses && (
              <motion.div variants={fadeUp} custom={3} className="flex items-center gap-2 mt-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/15 backdrop-blur-md">
                  <BookOpen size={13} className="text-white/70" />
                  <span className="text-xs text-white/85">{courses.length} courses available across {FOLDERS.length} pathways</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Main Content Area ────────────────────────────────── */}
      <section className="py-12 lg:py-16 relative bg-white min-h-[50vh]">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">

          <AnimatePresence mode="wait">

            {/* ════════════════════════════════
                FOLDER GRID VIEW (default)
            ════════════════════════════════ */}
            {!showCourseGrid && (
              <motion.div
                key="folders"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Global search */}
                <div className="relative max-w-lg mb-10">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across all pathways…"
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Section label */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                  <h2 className="text-xl font-semibold text-gray-900">Choose Your Learning Pathway</h2>
                </div>

                {/* Folder card grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FOLDERS.map((folder, i) => {
                      const Icon = folder.icon;
                      const count = folderCounts[folder.key] ?? 0;
                      return (
                        <motion.div
                          key={folder.key}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeUp}
                          custom={i}
                        >
                          <button
                            onClick={() => openFolder(folder.key)}
                            className={`w-full text-left bg-card rounded-2xl border-2 ${folder.borderIdle} ${folder.borderHover} ${folder.glow} overflow-hidden h-full flex flex-col transition-all duration-300 group card-lift`}
                          >
                            {/* Coloured accent strip */}
                            <div className="h-0.5 w-full" style={{ background: folder.accent }} />

                            <div className="p-6 flex-1 flex flex-col">
                              {/* Icon row */}
                              <div className="flex items-start justify-between mb-5">
                                <div className={`w-12 h-12 rounded-xl ${folder.iconBg} flex items-center justify-center shrink-0`}>
                                  <Icon size={22} className={folder.iconColor} />
                                </div>
                                <Badge variant="outline" className={`text-[10px] border ${folder.tagCls} shrink-0`}>
                                  {folder.tag}
                                </Badge>
                              </div>

                              {/* Title */}
                              <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-foreground/90 transition-colors">
                                {folder.label}
                              </h3>

                              {/* Description */}
                              <p className="text-xs text-foreground/40 leading-relaxed flex-1">
                                {folder.description}
                              </p>

                              {/* Footer */}
                              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                                <span className="text-xs text-foreground/30 flex items-center gap-1.5">
                                  <BookOpen size={11} />
                                  {count === 0 ? "No modules yet" : `${count} module${count !== 1 ? "s" : ""}`}
                                </span>
                                <span className={`text-xs ${folder.iconColor} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                                  Open <ChevronRight size={13} />
                                </span>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════════
                COURSE LIST VIEW (inside a folder, or global search)
            ════════════════════════════════ */}
            {showCourseGrid && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Top bar: breadcrumb + search + sort */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">

                  {/* Back + breadcrumb */}
                  <button
                    onClick={closeFolder}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0 group"
                  >
                    <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      <ArrowLeft size={13} />
                    </div>
                    {isSearching && !selectedFolder ? (
                      <span>All Pathways</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        All Pathways
                        <ChevronRight size={12} className="text-gray-300" />
                        <span className="text-gray-700">{activeFolderMeta?.label}</span>
                      </span>
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-2 sm:justify-end">
                    {/* Inline search */}
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/35 transition-all"
                      />
                    </div>

                    {/* Sort */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-primary/30 transition-all whitespace-nowrap shrink-0">
                          {sortBy === "numeric" && <Hash size={12} />}
                          {sortBy === "az" && <ArrowDownAZ size={12} />}
                          {sortBy === "za" && <ArrowUpAZ size={12} />}
                          <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
                          <ChevronDown size={11} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                          <DropdownMenuRadioItem value="numeric" className="text-xs gap-2"><Hash size={12} /> Numeric</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="az" className="text-xs gap-2"><ArrowDownAZ size={12} /> A → Z</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="za" className="text-xs gap-2"><ArrowUpAZ size={12} /> Z → A</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Folder heading (when inside a specific folder) */}
                {activeFolderMeta && !isSearching && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl ${activeFolderMeta.iconBg} flex items-center justify-center`}>
                        <activeFolderMeta.icon size={18} className={activeFolderMeta.iconColor} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 leading-tight">{activeFolderMeta.label}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{activeFolderMeta.description}</p>
                      </div>
                    </div>
                    {activeFolderMeta.programme && (
                      <ProgrammePanel
                        programme={activeFolderMeta.programme}
                        accentColor={activeFolderMeta.iconColor}
                      />
                    )}
                  </>
                )}

                {isSearching && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                    </h2>
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && filteredCourses.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 mb-2">
                      {isSearching ? "No courses match your search." : "No courses in this pathway yet."}
                    </p>
                    <button onClick={closeFolder} className="text-primary text-sm hover:underline mt-1">
                      ← Back to all pathways
                    </button>
                  </div>
                )}

                {/* Course grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-white/8 overflow-hidden">
                          <Skeleton className="h-44 w-full rounded-none" />
                          <div className="p-5 space-y-3">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        </div>
                      ))
                    : filteredCourses.map((course, i) => {
                        const isLocked = !!course.is_locked;
                        return (
                          <motion.div
                            key={course.id}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={i % 6}
                            variants={fadeUp}
                            className="card-lift"
                          >
                            <div className={`bg-card rounded-xl border overflow-hidden h-full flex flex-col transition-all duration-300 ${isLocked ? "border-border/40 opacity-75" : "border-border hover:border-primary/40 hover:shadow-[0_20px_60px_-15px_rgba(234,119,0,0.25)]"}`}>
                              {/* Thumbnail */}
                              <div className="h-44 bg-muted overflow-hidden shrink-0 relative">
                                {(course as any).thumbnail_url ? (
                                  <img
                                    src={(course as any).thumbnail_url}
                                    alt={course.title}
                                    loading="lazy"
                                    decoding="async"
                                    className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? "grayscale" : "hover:scale-105"}`}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                    <BookOpen size={36} className="text-primary/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,10%)]/60 to-transparent" />
                                {isLocked && (
                                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                                      <Lock size={22} className="text-amber-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">Locked</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary border border-primary/20">{course.category}</span>
                                  {(course as any).skill_level && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${LEVEL_COLORS[(course as any).skill_level] || ""}`}>
                                      {(course as any).skill_level}
                                    </span>
                                  )}
                                  {(course as any).course_type === "live" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">🔴 Live</span>
                                  )}
                                  {isLocked && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                      <Lock size={9} /> Locked
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-serif text-lg font-normal text-foreground mb-2 leading-snug">{course.title}</h3>
                                <p className="text-xs text-foreground/40 leading-relaxed mb-4 line-clamp-3 flex-1">{course.description}</p>
                                <div className="flex items-center gap-4 text-xs text-foreground/35">
                                  <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {(course.tags || []).slice(0, 3).map((t: string) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-foreground/5 text-foreground/35 border border-border">{t}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="p-5 pt-0 flex items-center justify-between">
                                <span className="text-xl font-bold text-gradient-gold">
                                  {(course as any).price > 0 ? `£${(course as any).price}` : "Free"}
                                </span>
                                {isLocked && !enrolledIds.has(course.id) ? (
                                  (course as any).price > 0 ? (
                                    <Button size="sm" asChild className="bg-gradient-gold hover:opacity-90 text-xs gap-1.5 btn-shimmer">
                                      <Link to={`/course/${course.id}`}><CreditCard size={12} /> Pay to Access</Link>
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                      onClick={() => setLockedCourse({ title: course.title, category: course.category })}
                                    >
                                      <Lock size={12} /> Locked
                                    </Button>
                                  )
                                ) : (
                                  <Button size="sm" asChild className="bg-gradient-gold hover:opacity-90 text-xs gap-1 btn-shimmer">
                                    <Link to={`/course/${course.id}`}>View Course <ArrowRight size={13} /></Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* ── Locked Course Modal ────────────────────────────── */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative glass-dark border border-amber-500/25 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center glow-gold"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <Lock size={36} className="text-amber-400" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 mb-3">{lockedCourse.category}</Badge>
              <h2 className="text-xl font-serif font-normal text-white mb-2">This Course is Currently Locked</h2>
              <p className="text-sm text-white/50 font-medium mb-1">"{lockedCourse.title}"</p>
              <p className="text-sm text-white/40 leading-relaxed mt-3 mb-6">
                This course has been temporarily locked by an admin. Access will be restored once it is unlocked.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="gap-2 border-white/10 text-white/60 hover:text-white text-sm" onClick={() => setLockedCourse(null)}>
                  <Bell size={14} /> Noted, I'll check back
                </Button>
                <Button className="bg-gradient-gold hover:opacity-90 text-sm gap-2 btn-shimmer" onClick={() => setLockedCourse(null)}>
                  <BookOpen size={14} /> Browse Other Courses
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  );
};

export default Courses;

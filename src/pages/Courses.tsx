import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, ArrowRight, BookOpen, ArrowDownAZ, ArrowUpAZ, Hash, Lock, X, Bell,
  GraduationCap, CreditCard, ChevronRight, ArrowLeft, Brain, Users, Target,
  Building2, Search, RefreshCw, Layers, ChevronDown, BarChart3,
  Video, Award, FileText, CheckCircle2, CalendarDays, UserCheck, Shield,
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
import { breadcrumbSchema, courseListSchema, SEO_PAGES, SITE_ORIGIN, setSeoMetadata } from "@/lib/seo";

/* ── Category folder metadata (5 official pathways) ── */
const FOLDERS = [
  {
    key: "Business Analysis & Digital Transformation",
    label: "Business Analysis & Digital Transformation",
    aliases: [],
    description:
      "Build capability in requirements engineering, stakeholder management, BPMN, Agile, business systems, digital transformation and practical project delivery.",
    audience: "Aspiring BAs, career changers and working professionals.",
    icon: BarChart3,
    accent: "hsl(30 100% 46%)",
    surface: "bg-orange-50/50",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-700",
    borderIdle: "border-orange-500/15",
    borderHover: "hover:border-orange-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(234,119,0,0.22)]",
    tag: "Flagship",
    tagCls: "bg-orange-500/10 text-orange-700 border-orange-500/25",
    programme: {
      type: "foundation" as const,
      badge: "Foundation Programme",
      subtitle:
        "Develop practical capability across requirements engineering, stakeholder management, BPMN, Agile, business systems and digital transformation through structured learning, project simulations and a live bootcamp.",
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
    key: "Business Process Improvement & Operational Excellence",
    label: "Business Process Improvement & Operational Excellence",
    aliases: [],
    description:
      "Learn process discovery, AS-IS/TO-BE mapping, BPMN, root cause analysis, customer journeys, bottlenecks, KPIs and continuous improvement.",
    audience: "Business Analysts, operations professionals, managers and business owners.",
    icon: Target,
    accent: "hsl(160 60% 45%)",
    surface: "bg-emerald-50/45",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    borderIdle: "border-emerald-500/15",
    borderHover: "hover:border-emerald-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.18)]",
    tag: "Process Excellence",
    tagCls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
    programme: {
      type: "live" as const,
      badge: "Business Process Improvement Programme",
      subtitle:
        "Learn to discover, analyse and improve business processes using practical methods, process models and operational measures, then apply them to realistic business scenarios.",
      learn: [
        "Process Discovery",
        "AS-IS and TO-BE Mapping",
        "BPMN Process Modelling",
        "Root Cause Analysis",
        "Customer Journey Mapping",
        "Bottleneck Analysis",
        "KPI Design",
        "Continuous Improvement",
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
        "Operations Professionals",
        "Managers",
        "Business Owners",
      ],
      cohortSub:
        "Apply process-improvement methods to practical scenarios and build skills you can use to improve operational performance.",
      cta: "Build the confidence to identify process problems and deliver measurable improvements.",
    },
  },
  {
    key: "Change Management & Business Transformation",
    label: "Change Management & Business Transformation",
    aliases: [],
    description:
      "Cover change impact assessment, stakeholder engagement, communication planning, resistance management, adoption strategies and benefits realisation.",
    audience: "Project professionals, team leaders, managers and change practitioners.",
    icon: Users,
    accent: "hsl(270 80% 60%)",
    surface: "bg-purple-50/45",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-600",
    borderIdle: "border-purple-500/15",
    borderHover: "hover:border-purple-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.18)]",
    tag: "Transformation",
    tagCls: "bg-purple-500/15 text-purple-700 border-purple-500/25",
    programme: {
      type: "live" as const,
      badge: "Change Management Programme",
      subtitle:
        "Plan and support business change with practical approaches to impact assessment, stakeholder engagement, communication, resistance, adoption and benefits realisation.",
      learn: [
        "Change Impact Assessment",
        "Stakeholder Engagement",
        "Communication Planning",
        "Resistance Management",
        "Adoption Strategies",
        "Benefits Realisation",
        "Transformation Planning",
        "Practical Change Scenarios",
      ],
      delivery: [
        "Live Zoom Sessions",
        "Practical Workshops",
        "Interactive Group Discussions",
        "Practical Course Resources",
        "Certificate of Completion",
      ],
      who: [
        "Project Professionals",
        "Team Leaders",
        "Managers",
        "Change Practitioners",
      ],
      cohortSub:
        "Work through practical change scenarios and build the confidence to support people and organisations through transformation.",
      cta: "Help teams adopt change and realise the benefits of transformation.",
    },
  },
  {
    key: "Agile, Product & Project Delivery Management",
    label: "Agile, Product & Project Delivery Management",
    aliases: ["Agile, Product & Delivery Management"],
    description:
      "Cover Scrum, Kanban, Product Ownership, backlog management, user stories, sprint planning, delivery governance, Jira and project execution.",
    audience: "Aspiring Product Owners, Scrum Masters, delivery leads and project professionals.",
    icon: Layers,
    accent: "hsl(217 91% 56%)",
    surface: "bg-blue-50/45",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-600",
    borderIdle: "border-blue-500/15",
    borderHover: "hover:border-blue-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.18)]",
    tag: "Agile Delivery",
    tagCls: "bg-blue-500/15 text-blue-700 border-blue-500/25",
    programme: {
      type: "live" as const,
      badge: "Agile, Product & Project Delivery Programme",
      subtitle:
        "Develop practical capability in Agile, Product Ownership and project delivery, with a focus on Scrum, Kanban, backlog management, planning, governance and execution.",
      learn: [
        "Scrum and Kanban",
        "Product Ownership",
        "Backlog Management",
        "User Stories",
        "Sprint Planning",
        "Delivery Governance",
        "Jira",
        "Project Execution",
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
        "Delivery Leads",
        "Project Professionals",
      ],
      cohortSub:
        "Practise delivery methods through realistic team scenarios and build capability you can apply to active projects.",
      cta: "Build practical confidence in planning, guiding and delivering products and projects.",
    },
  },
  {
    key: "Cybersecurity Bootcamp",
    label: "Cybersecurity Bootcamp",
    aliases: [],
    description:
      "Over five practical days, learn to protect devices and networks, spot cyber threats, investigate security alerts and respond to incidents.",
    audience: "Beginners and career changers exploring their first role in cybersecurity.",
    icon: Shield,
    accent: "hsl(174 72% 40%)",
    surface: "bg-teal-50/45",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-700",
    borderIdle: "border-teal-500/15",
    borderHover: "hover:border-teal-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(20,184,166,0.18)]",
    tag: "Five-Day Bootcamp",
    tagCls: "bg-teal-500/15 text-teal-700 border-teal-500/25",
    programme: {
      type: "live" as const,
      badge: "Cybersecurity Bootcamp",
      subtitle:
        "Build practical first-line cybersecurity awareness and incident-response capability through five focused days of guided learning, hands-on exercises and realistic security scenarios.",
      learn: [
        "Cybersecurity Foundations",
        "Protecting Devices and Networks",
        "Recognising Cyber Threats",
        "Security Alerts and Triage",
        "Incident Response Basics",
        "Practical Security Scenarios",
      ],
      delivery: [
        "Five Practical Days",
        "Hands-on Exercises",
        "Interactive Group Discussions",
        "Practical Course Resources",
        "Certificate of Completion",
      ],
      who: [
        "Beginners",
        "Career Changers",
        "Aspiring Cybersecurity Professionals",
        "Professionals Building Security Awareness",
      ],
      cohortSub:
        "Learn how to recognise common threats, protect everyday systems and respond methodically when a security incident occurs.",
      cta: "Build a practical foundation for your first step into cybersecurity.",
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

function ProgrammePanel({ programme, accentColor, registrationHref }: { programme: Programme; accentColor: string; registrationHref: string }) {
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
              to={registrationHref}
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
              to={registrationHref}
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
        (f) => f.key.toLowerCase() === cat.toLowerCase() || f.label.toLowerCase() === cat.toLowerCase() || f.aliases?.some((alias) => alias.toLowerCase() === cat.toLowerCase())
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
    FOLDERS.forEach((f) => {
      counts[f.key] = courses.filter((course) => course.category === f.key || f.aliases?.includes(course.category)).length;
    });
    return counts;
  }, [courses]);

  // Courses to show in the open folder (or global search)
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    const selectedPathway = FOLDERS.find((folder) => folder.key === selectedFolder);
    let base = selectedFolder
      ? courses.filter((c) => c.category === selectedFolder || selectedPathway?.aliases?.includes(c.category))
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

  useEffect(() => {
    if (!courses) return;
    const listSchema = courseListSchema(filteredCourses);
    const page = SEO_PAGES["/courses"];
    setSeoMetadata({
      ...page,
      pathname: "/courses",
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: SITE_ORIGIN },
          { name: page.h1, url: `${SITE_ORIGIN}/courses` },
        ]),
        ...(listSchema ? [listSchema] : []),
      ],
    });
  }, [courses, filteredCourses]);

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
          <div className="absolute inset-0 backdrop-blur-[3px]" style={{ background: "hsl(var(--hero-overlay) / 0.93)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsl(var(--hero-gradient-from) / 0.9), hsl(var(--hero-gradient-from) / 0.6) 60%, hsl(var(--hero-gradient-from) / 0.3))" }} />
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

                {/* Flagship programmes heading */}
                <div className="text-center mb-10">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-3">Our Flagship Programmes</p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                    Build Skills. Create Impact. Grow Your Career.
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Focused training designed to build practical capability, business impact and career growth.
                  </p>
                </div>

                {/* Folder card grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {FOLDERS.map((folder, i) => {
                      const Icon = folder.icon;
                      const count = folderCounts[folder.key] ?? 0;
                      return (
                        <motion.div
                          key={folder.key}
                          className={folder.key === "Cybersecurity Bootcamp" ? "lg:col-span-2" : undefined}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeUp}
                          custom={i}
                        >
                          <button
                            onClick={() => openFolder(folder.key)}
                            className={`w-full text-left ${folder.surface} rounded-2xl border ${folder.borderIdle} ${folder.borderHover} ${folder.glow} overflow-hidden h-full flex flex-col transition-all duration-300 group card-lift`}
                          >
                            {/* Coloured accent strip */}
                            <div className="h-0.5 w-full" style={{ background: folder.accent }} />

                            <div className="p-6 md:p-7 flex-1 grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-5">
                              <div className={`w-12 h-12 rounded-xl ${folder.iconBg} flex items-center justify-center shrink-0`}>
                                <Icon size={22} className={folder.iconColor} />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge variant="outline" className={`text-[10px] border ${folder.tagCls} shrink-0`}>
                                    {folder.tag}
                                  </Badge>
                                  {count > 0 && <span className="text-xs text-slate-500">{count} {count === 1 ? "course" : "courses"}</span>}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug mb-2 group-hover:text-slate-700 transition-colors">
                                  {folder.label}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {folder.description}
                                </p>
                              </div>

                              <div className="col-span-2 flex items-start gap-3 border-t border-slate-200/80 pt-4">
                                <Users size={18} className="text-slate-700 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 mb-0.5">Ideal for</p>
                                  <p className="text-sm text-slate-600 leading-relaxed">{folder.audience}</p>
                                </div>
                                <span className={`w-9 h-9 rounded-full ${folder.iconBg} ${folder.iconColor} flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform`}>
                                  <ChevronRight size={17} />
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
                        registrationHref={activeFolderMeta.key === "Cybersecurity Bootcamp" ? "/cybersecurity#register" : "/auth?tab=signup"}
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
                                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--hero-overlay) / 0.6), transparent)" }} />
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

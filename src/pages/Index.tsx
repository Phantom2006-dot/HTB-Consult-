import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, Target, CheckCircle, Star, Lightbulb,
  UserCheck, Briefcase, Brain, BarChart3, Quote, LogIn,
  LayoutDashboard, Sparkles, ChevronRight,
  Users, Clock, Shield, Rocket, GraduationCap, Building2, Layers,
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
    icon: BarChart3,
    iconBg: "bg-orange-500/15 text-orange-500",
    title: "Business Analysis & Digital Transformation",
    badge: "Flagship",
    badgeColor: "bg-orange-500/10 text-orange-700",
    desc: "Build capability in requirements engineering, stakeholder management, BPMN, Agile, business systems and practical digital transformation delivery.",
  },
  {
    icon: Target,
    iconBg: "bg-emerald-500/15 text-emerald-600",
    title: "Business Process Improvement & Operational Excellence",
    badge: "Process Excellence",
    badgeColor: "bg-emerald-500/10 text-emerald-700",
    desc: "Learn process discovery, AS-IS/TO-BE mapping, BPMN, root cause analysis, customer journeys, KPI design and continuous improvement.",
  },
  {
    icon: Users,
    iconBg: "bg-purple-500/15 text-purple-600",
    title: "Change Management & Business Transformation",
    badge: "Transformation",
    badgeColor: "bg-purple-500/10 text-purple-700",
    desc: "Develop practical skills in change impact assessment, stakeholder engagement, communication, adoption and benefits realisation.",
  },
  {
    icon: Layers,
    iconBg: "bg-blue-500/15 text-blue-600",
    title: "Agile, Product & Project Delivery Management",
    badge: "Agile Delivery",
    badgeColor: "bg-blue-500/10 text-blue-700",
    desc: "Build capability in Scrum, Kanban, Product Ownership, backlog management, user stories, Jira and project execution.",
  },
];

const whyReasons = [
  {
    icon: Briefcase,
    title: "Industry-Led Training",
    desc: "Learning informed by real business and consulting experience.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: BookOpen,
    title: "Practical Project Experience",
    desc: "Apply your knowledge through case studies, exercises and simulations.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Target,
    title: "Structured Learning Pathways",
    desc: "Progress from essential concepts to practical application.",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: UserCheck,
    title: "Professional Mentorship",
    desc: "Learn from experienced practitioners and receive practical guidance.",
    color: "bg-purple-500/10 text-purple-600",
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

const trustBadges = [
  { icon: BarChart3, label: "Business Analysis & Digital Transformation", sub: "Requirements, stakeholders, BPMN, Agile and practical delivery.", iconBg: "bg-orange-500/20", iconColor: "text-orange-400" },
  { icon: Target, label: "Business Process Improvement", sub: "Process discovery, mapping, root causes, KPIs and improvement.", iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400" },
  { icon: Users, label: "Change Management & Transformation", sub: "Engagement, adoption strategies and benefits realisation.", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
  { icon: Layers, label: "Agile, Product & Project Delivery", sub: "Scrum, Kanban, product ownership and delivery governance.", iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
];

/* ═══════════════════════════════════════════════════════════ */

/* ── Home page pathway folders (mirrors /courses FOLDERS) ── */
const HOME_FOLDERS = [
  {
    key: "Business Analysis & Digital Transformation",
    label: "Business Analysis & Digital Transformation",
    description: "Requirements engineering, stakeholder management, BPMN, Agile, business systems, digital transformation and practical project delivery.",
    audience: "Aspiring BAs, career changers and working professionals.",
    aliases: [],
    icon: BarChart3,
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-700",
    accent: "border-orange-500/25 hover:border-orange-500/50",
    glow: "hover:shadow-[0_12px_40px_-10px_rgba(234,119,0,0.18)]",
    tag: "Flagship",
    tagCls: "bg-orange-500/10 text-orange-700 border-orange-500/25",
  },
  {
    key: "Business Process Improvement & Operational Excellence",
    label: "Business Process Improvement & Operational Excellence",
    description: "Process discovery, AS-IS/TO-BE mapping, BPMN, root cause analysis, customer journeys, bottlenecks, KPIs and continuous improvement.",
    audience: "Business Analysts, operations professionals, managers and business owners.",
    aliases: [],
    icon: Target,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    accent: "border-emerald-500/25 hover:border-emerald-500/50",
    glow: "hover:shadow-[0_12px_40px_-10px_rgba(16,185,129,0.15)]",
    tag: "Process Excellence",
    tagCls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  },
  {
    key: "Change Management & Business Transformation",
    label: "Change Management & Business Transformation",
    description: "Change impact assessment, stakeholder engagement, communication planning, resistance management, adoption strategies and benefits realisation.",
    audience: "Project professionals, team leaders, managers and change practitioners.",
    aliases: [],
    icon: Users,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-600",
    accent: "border-purple-500/25 hover:border-purple-500/50",
    glow: "hover:shadow-[0_12px_40px_-10px_rgba(139,92,246,0.15)]",
    tag: "Transformation",
    tagCls: "bg-purple-500/15 text-purple-700 border-purple-500/25",
  },
  {
    key: "Agile, Product & Project Delivery Management",
    label: "Agile, Product & Project Delivery Management",
    description: "Scrum, Kanban, Product Ownership, backlog management, user stories, sprint planning, delivery governance, Jira and project execution.",
    audience: "Aspiring Product Owners, Scrum Masters, delivery leads and project professionals.",
    aliases: ["Agile, Product & Delivery Management"],
    icon: Layers,
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-700",
    accent: "border-blue-500/25 hover:border-blue-500/50",
    glow: "hover:shadow-[0_12px_40px_-10px_rgba(59,130,246,0.15)]",
    tag: "Agile Delivery",
    tagCls: "bg-blue-500/10 text-blue-700 border-blue-500/25",
  },
];

const Index = () => {
  const { user } = useAuth();
  const { data: courses } = useCourses();

  // Count courses per pathway
  const folderCounts = courses
      ? HOME_FOLDERS.reduce<Record<string, number>>((acc, f) => {
        acc[f.key] = courses.filter((c) => c.category === f.key || f.aliases?.includes(c.category)).length;
        return acc;
      }, {})
    : {};

  return (
    <Layout>

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative overflow-hidden min-h-[100vh] flex items-center -mt-[72px] pt-[72px]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.webp"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center brightness-110 contrast-105"
          />
        </div>

        {/* Overlays — left text area covered, trainer on right kept clear */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, hsl(var(--hero-overlay)) 38%, hsl(var(--hero-overlay) / 0.18) 58%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 22%)" }} />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full blur-[120px] animate-[pulse-glow_8s_ease-in-out_infinite]"
          style={{ background: "hsl(var(--primary) / 0.07)" }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col min-h-[calc(100vh-72px)] justify-between py-16 lg:py-24">

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest glass border border-primary/25 mb-10"
            style={{ color: "hsl(var(--primary))" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))" }} />
            Build Skills. Grow Mindset. Create Impact.
          </motion.div>

          {/* Main row */}
          <div className="flex-1 flex items-center">
            <div className="w-full lg:max-w-[55%]">

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl xl:text-7xl font-serif font-normal text-white leading-[1.05] mb-6 tracking-display text-shadow-lg"
              >
                Build Capability for the Future{" "}
                <em className="not-italic text-gradient-gold">of Work</em>
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55 }}
                className="mb-8 max-w-2xl rounded-2xl border border-white/15 bg-slate-950/70 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-md sm:px-6 sm:py-5"
              >
                <p className="text-lg lg:text-xl text-white font-bold mb-3 leading-snug [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
                  Business Analysis<span className="text-primary">.</span> Process Improvement<span className="text-primary">.</span> Change Management<span className="text-primary">.</span> Agile Delivery<span className="text-primary">.</span>
                </p>
                <p className="text-base lg:text-lg text-white/90 leading-relaxed font-medium">
                  Practical learning. Real project simulation. Business-ready delivery skills.<br />
                  Develop the skills, mindset and confidence to excel in today's workplace.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Button size="lg" asChild
                  className="bg-gradient-gold hover:opacity-90 font-semibold px-8 h-12 shadow-orange btn-shimmer text-sm"
                >
                  <Link to="/services">Explore Pathways <ArrowRight className="ml-2" size={16} /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild
                  className="font-semibold px-8 h-12 glass border-white/20 hover:bg-white/10 text-white text-sm"
                >
                  <Link to="/courses">View Courses</Link>
                </Button>
              </motion.div>

              {/* Trust badges — 4 items in a row below buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 border-t border-white/10 pt-8"
              >
                {trustBadges.map((b, i) => (
                  <div key={b.label} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${b.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <b.icon size={14} className={b.iconColor} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{b.label}</p>
                      <p className="text-[10px] text-white/45 leading-snug mt-0.5">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Community badge — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="self-end mt-10 lg:mt-0"
          >
            <Link to="/auth" className="block glass border border-white/15 rounded-2xl px-5 py-4 text-right hover:border-primary/40 transition-colors duration-200">
              <p className="text-sm font-semibold text-white mb-0.5">Join a community of</p>
              <p className="text-xs text-white/50 mb-3">aspiring and practising Business Analysts</p>
              <div className="flex items-center justify-end gap-2">
                <div className="flex -space-x-2">
                  {["A", "K", "S", "R", "M"].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-white border-2"
                      style={{ borderColor: "hsl(var(--background))" }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  +2K
                </span>
              </div>
            </Link>
          </motion.div>

        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28"
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

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={4}
            className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-5 sm:px-7"
          >
            <div className="text-center sm:text-left">
              <p className="font-semibold text-slate-900">Ready to take your next step?</p>
              <p className="text-sm text-slate-600">Join a pathway and start building practical skills for work.</p>
            </div>
            <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold px-7 h-11 text-sm btn-shimmer shadow-orange shrink-0">
              <Link to="/auth?tab=signup">Enroll Now <ArrowRight className="ml-2" size={15} /></Link>
            </Button>
          </motion.div>
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

      {/* ─────────────────── BROWSE COURSES (white) ─────────────────── */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-6 right-6 lg:left-12 lg:right-12 h-px bg-slate-100" />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Our Flagship Programmes
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Build Skills. Create Impact. Grow Your Career.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2}
              className="mt-4 text-slate-500 text-sm max-w-xl mx-auto leading-relaxed"
            >
              Focused training designed to build practical capability, business impact and career growth.
            </motion.p>
          </motion.div>

          {/* Folder cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {HOME_FOLDERS.map((folder, i) => {
              const Icon = folder.icon;
              const count = folderCounts[folder.key] ?? 0;
              return (
                <motion.div
                  key={folder.key}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={scaleIn}
                >
                  <Link
                    to={`/courses?category=${encodeURIComponent(folder.key)}`}
                    className={`flex flex-col h-full bg-white border rounded-2xl p-6 transition-all duration-300 group ${folder.accent} ${folder.glow} hover:-translate-y-1`}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${folder.iconBg} flex items-center justify-center mb-4`}>
                      <Icon size={22} className={folder.iconColor} />
                    </div>

                    {/* Tag + count */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${folder.tagCls}`}>
                        {folder.tag}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {count} {count === 1 ? "course" : "courses"}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base font-normal text-slate-900 mb-2 leading-snug">
                      {folder.label}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
                      {folder.description}
                    </p>

                    <div className="flex items-start gap-2.5 border-t border-slate-100 pt-4 mb-5">
                      <Users size={16} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600 leading-relaxed">{folder.audience}</p>
                    </div>

                    {/* CTA */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200 ${folder.iconColor}`}
                    >
                      Browse Courses <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={4}
            className="text-center"
          >
            <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold px-8 h-11 text-sm btn-shimmer shadow-orange">
              <Link to="/courses">View All Courses <ArrowRight className="ml-2" size={15} /></Link>
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
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-10"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Why HTB Academy
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight"
            >
              Built for Learning. Designed for Real-World Impact.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {whyReasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={scaleIn}
                className={`p-8 md:p-10 text-center hover:bg-slate-50/70 transition-colors duration-300 ${i < 3 ? "border-b border-slate-200" : ""} ${i < 2 ? "md:border-b" : "md:border-b-0"} ${i % 2 === 1 ? "md:border-l" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl ${reason.color} flex items-center justify-center mx-auto mb-4`}>
                  <reason.icon size={18} />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">{reason.title}</h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-md mx-auto">{reason.desc}</p>
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

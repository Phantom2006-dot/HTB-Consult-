import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, Target, Users, Briefcase,
  CheckCircle, ChevronRight, BarChart3, GraduationCap,
  Brain, Lightbulb, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

/* ── Stage data ── */
const stages = [
  {
    num: 1,
    code: "01",
    tag: "Foundation",
    tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg: "bg-blue-600",
    circleBg: "bg-blue-600",
    icon: BookOpen,
    title: "BA Foundation Bootcamp",
    short: "BA Foundation Bootcamp",
    desc: "Build a strong foundation in Business Analysis principles, techniques and best practices.",
    bullets: [
      "Business Analysis Fundamentals",
      "Requirements Elicitation",
      "Documentation Techniques",
      "Process Modelling (BPMN)",
      "Stakeholder Management",
      "Agile & Waterfall Basics",
      "BA Tools Introduction",
    ],
    outcome: "Strong BA foundation and core skillset.",
    accentText: "text-blue-600",
    accentBorder: "border-blue-100",
  },
  {
    num: 2,
    code: "02",
    tag: "Application",
    tagColor: "bg-teal-100 text-teal-700 border-teal-200",
    iconBg: "bg-teal-600",
    circleBg: "bg-teal-600",
    icon: Target,
    title: "Practical BA Application & Simulation",
    short: "Practical BA Application & Simulation",
    desc: "Apply your knowledge through hands-on exercises, case studies and real-world simulations.",
    bullets: [
      "Real-world Case Studies",
      "Requirements Analysis",
      "Solution Evaluation",
      "User Stories & Use Cases",
      "Mock Interviews & Assessments",
      "BA Deliverables Simulation",
      "Tools & Templates Practice",
    ],
    outcome: "Applied skills through practice and simulation.",
    accentText: "text-teal-600",
    accentBorder: "border-teal-100",
  },
  {
    num: 3,
    code: "03",
    tag: "Specialisation",
    tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    iconBg: "bg-purple-600",
    circleBg: "bg-purple-600",
    icon: Brain,
    title: "Domain Specialisation",
    short: "Domain Specialisation",
    desc: "Specialise in your industry of choice and deepen your domain knowledge.",
    bullets: [
      "Banking Business Analysis",
      "Insurance Business Analysis",
      "Healthcare Business Analysis",
      "Logistics & Warehouse Analysis",
      "Other Emerging Domains",
      "Domain Processes & Regulations",
      "Industry Case Studies",
    ],
    outcome: "Domain expertise and industry-relevant knowledge.",
    accentText: "text-purple-600",
    accentBorder: "border-purple-100",
  },
  {
    num: 4,
    code: "04",
    tag: "Impact",
    tagColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-600",
    circleBg: "bg-emerald-600",
    icon: Users,
    title: "Industry Project Experience & Mentorship",
    short: "Industry Project Experience & Mentorship",
    desc: "Work on real projects with expert mentors and build your professional portfolio to get hired.",
    bullets: [
      "Real Industry Projects",
      "Expert Mentorship",
      "End-to-End Project Execution",
      "Portfolio Development",
      "Career Coaching",
      "Job Readiness Preparation",
    ],
    outcome: "Industry experience and career readiness.",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-100",
  },
];

const heroFeatures = [
  { icon: BarChart3, title: "Structured", desc: "A clear progression from foundation to industry impact." },
  { icon: Lightbulb, title: "Practical", desc: "Hands-on learning, simulations and real project experience." },
  { icon: GraduationCap, title: "Career Focused", desc: "Build the skills and confidence to grow and get hired." },
];

const pathOptions = [
  {
    icon: BookOpen,
    title: "New to Business Analysis?",
    desc: "Start with the Foundation Bootcamp and build your BA career from the ground up.",
    cta: "Start from Stage 1",
    href: "/courses",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: Target,
    title: "Have BA Knowledge?",
    desc: "Skip to Practical BA Application & Simulation and strengthen your hands-on experience.",
    cta: "Start from Stage 2",
    href: "/courses",
    iconBg: "bg-teal-100 text-teal-600",
  },
  {
    icon: Briefcase,
    title: "Experienced BA?",
    desc: "Advance to Domain Specialisation or Industry Project & Mentorship to accelerate your career.",
    cta: "Explore Advanced Stages",
    href: "/courses",
    iconBg: "bg-purple-100 text-purple-600",
  },
];

const Services = () => {
  return (
    <Layout>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "hsl(var(--hero-gradient-from))" }}>
        {/* background texture */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none bg-primary" />

        <div className="container mx-auto px-4 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-20 relative z-10">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 text-xs text-white/40 mb-8"
          >
            <Home size={12} />
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-white/60">Learning Pathways</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible">
              <motion.h1
                variants={fadeUp} custom={0}
                className="text-4xl md:text-5xl lg:text-[3.25rem] font-serif font-bold text-white leading-[1.08] mb-5 tracking-tight"
              >
                Your Journey to<br />
                <span className="text-gradient-gold">Industry Impact</span>
              </motion.h1>
              <motion.p
                variants={fadeUp} custom={1}
                className="text-base text-white/65 leading-relaxed mb-10 max-w-md"
              >
                A structured learning pathway designed to turn aspiring Business Analysts into industry-ready professionals.
              </motion.p>

              {/* Feature highlights */}
              <motion.div variants={fadeUp} custom={2} className="grid grid-cols-3 gap-4">
                {heroFeatures.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex flex-col gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-primary" />
                      </div>
                      <p className="text-[13px] font-semibold text-white">{f.title}</p>
                      <p className="text-[11.5px] text-white/50 leading-snug">{f.desc}</p>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right — pathway staircase diagram */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:flex justify-center items-end"
            >
              <PathwayDiagram />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4 STAGES CARDS ──────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Label */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-10"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.22em] uppercase text-primary mb-3">
              Our Learning Pathway
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              4 Stages. One Goal. Your Success.
            </motion.h2>
          </motion.div>

          {/* Cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-0 relative">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.num} className="flex items-stretch">
                  <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i * 0.5}
                    className={`flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${i > 0 ? "lg:ml-[-1px]" : ""}`}
                  >
                    {/* Number circle + icon */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${stage.circleBg} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {stage.num}
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0`}>
                        <Icon size={20} className="text-slate-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-2">{stage.title}</h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed">{stage.desc}</p>
                    </div>
                    <span className={`self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border ${stage.tagColor}`}>
                      {stage.tag}
                    </span>
                  </motion.div>
                  {/* Arrow between cards */}
                  {i < stages.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center w-8 shrink-0 z-10">
                      <ChevronRight size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info bar */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={2}
            className="mt-8 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle size={16} className="text-white" />
            </div>
            <p className="text-[13px] text-blue-800 leading-snug">
              Each stage builds upon the previous one, ensuring you gain the skills, confidence and experience to create real impact in your career.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT YOU WILL LEARN ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.22em] uppercase text-primary mb-3">
              What You Will Learn
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Progressively Build. Continuously Grow.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.num}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i * 0.4}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className={`w-7 h-7 rounded-full ${stage.circleBg} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                      {stage.num}
                    </div>
                    <p className={`text-[11px] font-bold tracking-wide uppercase ${stage.accentText}`}>
                      {stage.short}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-1.5 flex-1">
                    {stage.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${stage.iconBg}`} />
                        <span className="text-[12.5px] text-slate-600 leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Outcome */}
                  <div className={`flex items-start gap-2 pt-3 border-t ${stage.accentBorder}`}>
                    <CheckCircle size={14} className={`${stage.accentText} shrink-0 mt-0.5`} />
                    <p className={`text-[12px] font-semibold ${stage.accentText} leading-snug`}>
                      <span className="text-slate-500 font-normal">Outcome: </span>{stage.outcome}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CHOOSE YOUR PATH ────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.22em] uppercase text-primary mb-3">
              Choose Your Path
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Start Where You Are.<br className="hidden sm:block" /> Grow Where You Want to Go.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pathOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.div
                  key={opt.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i * 0.4}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-[15px] mb-2">{opt.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{opt.desc}</p>
                  </div>
                  <Button asChild className="w-full bg-white border border-slate-300 text-slate-800 hover:bg-primary hover:text-white hover:border-primary text-sm mt-1 font-semibold shadow-sm transition-colors">
                    <Link to={opt.href}>{opt.cta}</Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-14 lg:py-16" style={{ background: "hsl(var(--hero-gradient-from))" }}>
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-primary pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <BarChart3 size={26} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-1">
                  Your future in Business Analysis starts here.
                </h2>
                <p className="text-sm text-white/60">
                  Take the next step in your learning journey and become an industry-ready Business Analyst.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer px-6">
                <Link to="/courses">Explore Courses</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 px-6">
                <Link to="/contact">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* ── Pathway staircase diagram ─────────────────────────────────── */
const stairSteps = [
  {
    num: "01",
    label: "Foundation",
    gradient: "linear-gradient(160deg, #1a3a6e 0%, #0f2550 100%)",
    border: "rgba(255,255,255,0.12)",
    delay: 0,
    icon: BookOpen,
  },
  {
    num: "02",
    label: "Practical\nApplication",
    gradient: "linear-gradient(160deg, #1b5e80 0%, #0d4060 100%)",
    border: "rgba(255,255,255,0.14)",
    delay: 0.4,
    icon: Target,
  },
  {
    num: "03",
    label: "Domain\nSpecialisation",
    gradient: "linear-gradient(160deg, #4a2080 0%, #2d1260 100%)",
    border: "rgba(255,255,255,0.14)",
    delay: 0.8,
    icon: Brain,
  },
  {
    num: "04",
    label: "Industry Project\n& Mentorship",
    gradient: "linear-gradient(160deg, #2d6a4f 0%, #1b4332 100%)",
    border: "rgba(255,255,255,0.14)",
    delay: 1.2,
    icon: Users,
  },
];

const BOTTOM_OFFSETS = [0, 30, 65, 100];
const LEFT_OFFSETS   = [0, 130, 260, 390];

const PathwayDiagram = () => {
  return (
    <div className="relative" style={{ width: 520, height: 230 }}>

      {/* SVG — step platforms + dashed connectors + upward arrow */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 520 230"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Step platforms — top face */}
        <polygon points="10,180 130,180 130,200 10,200"   fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
        <polygon points="10,200 130,200 130,220 10,220"   fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        <polygon points="130,150 260,150 260,170 130,170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
        <polygon points="130,170 260,170 260,200 130,200" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        <polygon points="260,115 390,115 390,135 260,135" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
        <polygon points="260,135 390,135 390,170 260,170" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        <polygon points="390,78 510,78 510,98 390,98"     fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
        <polygon points="390,98 510,98 510,135 390,135"   fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>

        {/* Dashed connectors between steps */}
        <line x1="120" y1="160" x2="140" y2="145" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <line x1="250" y1="128" x2="270" y2="112" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <line x1="380" y1="93"  x2="400" y2="77"  stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeDasharray="4,3"/>

        {/* Upward arrow */}
        <g transform="translate(490,10)">
          <polygon points="0,80 8,0 16,80" fill="white" opacity="0.85"/>
          <rect x="5" y="75" width="6" height="30" fill="white" opacity="0.85" rx="1"/>
        </g>
      </svg>

      {/* Cards — absolutely positioned at staircase offsets */}
      {stairSteps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.num}
            className="absolute"
            style={{ left: LEFT_OFFSETS[i], bottom: BOTTOM_OFFSETS[i] }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: step.delay }}
              style={{
                background: step.gradient,
                border: `1px solid ${step.border}`,
                boxShadow: i === 3
                  ? "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)"
                  : "0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "14px 14px 12px",
                width: 115,
                textAlign: "center" as const,
              }}
            >
              {/* Step number */}
              <div style={{
                fontFamily: "inherit",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
                justifyContent: "center",
                letterSpacing: "0.04em",
              }}>
                <span style={{ display:"inline-block", width:4, height:4, background:"rgba(255,255,255,0.4)", borderRadius:"50%" }}/>
                {step.num}
              </div>

              {/* Icon */}
              <div style={{
                width: 42, height: 42,
                borderRadius: 8,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px",
              }}>
                <Icon size={20} color="white" strokeWidth={2} />
              </div>

              {/* Label */}
              <p style={{
                fontFamily: "inherit",
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.3,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "pre-line",
                margin: 0,
              }}>
                {step.label}
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Services;

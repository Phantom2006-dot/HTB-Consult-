import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Users, BookOpen, Lightbulb, UserCheck, Building2,
  GraduationCap, Briefcase, TrendingUp, ArrowRight, ChevronRight,
  Rocket, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

/* ── Data ── */
const stats = [
  { value: "500+", label: "Professionals Supported" },
  { value: "15+",  label: "Years Experience" },
  { value: "98%",  label: "Learner Satisfaction" },
  { value: "50+",  label: "Organisations Served" },
];

const pillars = [
  {
    icon: Briefcase,
    title: "Real Consulting Experience",
    desc: "Built from live project experience across business analysis, delivery and transformation.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Lightbulb,
    title: "Grounded & Relevant",
    desc: "Training that reflects how work is actually done — not just what textbooks say.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: UserCheck,
    title: "People Centred",
    desc: "We meet learners where they are and guide them toward where they want to be.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    desc: "A growing curriculum that evolves with industry demands and learner needs.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
];

const individuals = [
  "Build practical skills in business analysis and project delivery",
  "Gain real world understanding of how projects and organisations operate",
  "Improve career positioning through applied knowledge and guidance",
];

const organisations = [
  "Strengthen team capability and performance",
  "Support workforce development in key business areas",
  "Improve delivery through structured, skills-based training",
];

const approach = [
  {
    icon: GraduationCap,
    title: "Practical Learning",
    desc: "Skills you can apply in real roles and business environments from day one.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Target,
    title: "Structured Development",
    desc: "Clear learning paths from fundamentals to fully applied capability.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Lightbulb,
    title: "Real World Insight",
    desc: "Training built from consulting experience, not theory alone.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: TrendingUp,
    title: "Business Focused Growth",
    desc: "Supporting both professional development and organisational performance.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
];

const focusItems = [
  {
    icon: Users,
    title: "For Individuals",
    desc: "Individuals build confidence and real capability that unlocks career growth.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "For Organisations",
    desc: "Organisations develop stronger, more effective teams that deliver better results.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "For Performance",
    desc: "Professionals and businesses improve how they work and deliver outcomes.",
    color: "bg-amber-500/10 text-amber-500",
  },
];

/* ══════════════════════════════════════════════════════════ */

const AboutHTB = () => {
  return (
    <Layout>

      {/* ─────────────────── HERO ─────────────────── */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center -mt-[72px] pt-[72px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, hsl(var(--hero-overlay)) 50%, hsl(var(--hero-overlay) / 0.55) 80%, transparent)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 35%)" }} />
        <div className="absolute inset-0 grid-pattern opacity-15" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeIn} custom={0}
                className="flex items-center gap-2 text-xs text-white/45 mb-6"
              >
                <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-white/70">About HTB Academy</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white leading-[1.08] mb-3 tracking-display text-shadow-lg"
              >
                About HTB Academy
              </motion.h1>

              <motion.div variants={fadeIn} custom={2}
                className="w-14 h-1 rounded-full mb-6"
                style={{ background: "hsl(var(--primary))" }}
              />

              <motion.p variants={fadeUp} custom={3}
                className="text-base lg:text-lg text-white/70 leading-[1.8] max-w-lg"
              >
                A learning platform built from real consulting experience — equipping individuals and organisations with practical skills that create lasting impact.
              </motion.p>
            </motion.div>

            {/* Right — quote card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="hidden lg:flex justify-end"
            >
              <div className="glass border border-white/15 rounded-2xl p-7 max-w-xs">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "hsl(var(--primary))" }}>
                  <span className="text-white font-serif text-xl leading-none">&ldquo;</span>
                </div>
                <p className="text-white/90 font-medium leading-relaxed mb-2">Beyond theory.</p>
                <p className="text-white/65 text-sm leading-relaxed">
                  We help learners and teams build the confidence to solve problems, deliver projects, and contribute effectively in their roles.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </section>

      {/* ─────────────────── STATS (white) ─────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.015) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-2">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHO WE ARE (white) ─────────────────── */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">

          {/* Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Who We Are
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight max-w-2xl mx-auto"
            >
              Built from Real Consulting{" "}
              <em className="not-italic text-gradient-gold">Experience.</em>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2}
              className="text-slate-500 mt-5 max-w-2xl mx-auto text-base leading-relaxed"
            >
              HTB Consult Academy's programmes reflect how work is actually done across business analysis, project delivery, and digital transformation — grounded, relevant, and aligned with real industry expectations.
            </motion.p>
          </motion.div>

          {/* 4-pillar grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHAT WE DO (slate-50) ─────────────────── */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              What We Do
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Training for Individuals &amp; Organisations.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2}
              className="text-slate-500 mt-5 max-w-xl mx-auto text-base leading-relaxed"
            >
              We support both individuals and organisations through structured, results-driven training and development.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* For Individuals */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
              className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">For</p>
                  <h3 className="text-xl font-serif font-semibold text-slate-900">Individuals</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {individuals.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Organisations */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/8 transition-all duration-300 card-lift"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Building2 size={22} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-0.5">For</p>
                  <h3 className="text-xl font-serif font-semibold text-slate-900">Organisations</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {organisations.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────── OUR APPROACH (white) ─────────────────── */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Our Approach
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Clarity. Structure. Real Application.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── OUR FOCUS (slate-50) ─────────────────── */}
      <section className="py-20 lg:py-24 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Our Focus
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              We are committed to helping.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {focusItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── CTA BANNER ─────────────────── */}
      <section className="py-16 lg:py-20 relative overflow-hidden"
        style={{ background: "var(--gradient-cta-bg)" }}
      >
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "hsl(var(--primary) / 0.3)" }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
              <Rocket size={28} style={{ color: "hsl(var(--primary))" }} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-serif font-normal text-white leading-snug mb-2">
                Ready to take the next step?
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Explore our courses and learning pathways designed to build real, industry-ready skills.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0 justify-center">
              <Button asChild size="lg"
                className="bg-gradient-gold hover:opacity-90 font-semibold px-7 h-12 text-sm btn-shimmer shadow-orange"
              >
                <Link to="/services">Explore Pathways <ArrowRight className="ml-2" size={15} /></Link>
              </Button>
              <Button asChild size="lg"
                className="bg-white/8 border border-white/20 text-white hover:bg-white/15 font-semibold px-7 h-12 text-sm"
              >
                <Link to="/courses">View Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default AboutHTB;

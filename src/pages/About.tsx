import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Users, BookOpen, UserCheck, Briefcase, TrendingUp,
  Brain, Shield, Award, Rocket, ArrowRight, ChevronRight,
  GraduationCap, Lightbulb, BarChart3, FileCheck, Network,
  Building2, RefreshCw, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

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
const differentiators = [
  {
    icon: Target,
    title: "Practical & Hands-on Learning",
    desc: "Real projects, case studies and simulations to build job-ready skills.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: UserCheck,
    title: "Industry Experienced Mentorship",
    desc: "Learn from senior Business Analysts with years of real-world experience.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: BookOpen,
    title: "Structured Learning Pathway",
    desc: "A clear journey from foundation to industry impact and career growth.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Briefcase,
    title: "Career Focused Training",
    desc: "We focus on the skills, mindset and portfolio that employers actually value.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: FileCheck,
    title: "Tools & Templates Included",
    desc: "Access real BA tools, templates and frameworks used in the industry.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Users,
    title: "Trusted by Learners",
    desc: "A growing community of aspiring and practising Business Analysts.",
    color: "bg-rose-500/10 text-rose-500",
  },
];

const approachSteps = [
  {
    icon: Brain,
    title: "Right Mindset",
    desc: "We develop a problem-solving mindset, curiosity and business acumen first.",
  },
  {
    icon: BookOpen,
    title: "Strong Foundation",
    desc: "We build your BA foundation with proven concepts and best practices.",
  },
  {
    icon: Target,
    title: "Practical Application",
    desc: "We apply learning through scenarios, case studies and real-world simulations.",
  },
  {
    icon: Building2,
    title: "Industry Exposure",
    desc: "We expose you to real projects, domain knowledge and industry expectations.",
  },
  {
    icon: TrendingUp,
    title: "Career Impact",
    desc: "We prepare you to deliver impact, grow your career and seize opportunities.",
  },
];

const gains = [
  {
    icon: GraduationCap,
    title: "Job-Ready Skills",
    desc: "Develop the skills and competencies required to perform confidently as a Business Analyst.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Briefcase,
    title: "Practical Experience",
    desc: "Work on realistic scenarios and build a portfolio that sets you apart.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: BarChart3,
    title: "Industry Relevance",
    desc: "Learn what's relevant today and what employers are looking for.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Network,
    title: "Stronger Network",
    desc: "Connect with mentors, peers and a community that supports your growth.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Award,
    title: "Recognised Certificate",
    desc: "Earn a certificate that validates your skills and completing journey.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    desc: "Increase your confidence, open new opportunities and accelerate your career.",
    color: "bg-rose-500/10 text-rose-500",
  },
];

const audiences = [
  {
    icon: GraduationCap,
    title: "Aspiring Business Analysts",
    desc: "Start your BA journey with the right foundation.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: RefreshCw,
    title: "Career Changers",
    desc: "Transition into Business Analysis with confidence.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Star,
    title: "Existing BAs",
    desc: "Strengthen your practical skills and advance your career.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Briefcase,
    title: "Professionals",
    desc: "Upskill and add value in digital transformation initiatives.",
    color: "bg-purple-500/10 text-purple-500",
  },
];

/* ═══════════════════════════════════════════════════════════ */

const About = () => {
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
              {/* Breadcrumb */}
              <motion.div variants={fadeIn} custom={0}
                className="flex items-center gap-2 text-xs text-white/45 mb-6"
              >
                <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-white/70">Why HTB Academy</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white leading-[1.08] mb-3 tracking-display text-shadow-lg"
              >
                Why HTB Academy?
              </motion.h1>

              {/* Blue accent underline */}
              <motion.div variants={fadeIn} custom={2}
                className="w-14 h-1 rounded-full mb-6"
                style={{ background: "hsl(var(--primary))" }}
              />

              <motion.p variants={fadeUp} custom={3}
                className="text-base lg:text-lg text-white/70 leading-[1.8] max-w-lg"
              >
                We don't just teach theory. We build confident, practical Business Analysts ready to create real impact.
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
                <p className="text-white/90 font-medium leading-relaxed mb-2">Our goal is simple:</p>
                <p className="text-white/65 text-sm leading-relaxed">
                  Equip you with the mindset, skills and experience to thrive in the real world.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </section>

      {/* ─────────────────── WHAT MAKES HTB DIFFERENT (white) ─────────────────── */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-slate-200" />
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
              What Makes HTB Academy Different
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Practical. Structured. Industry Focused.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {differentiators.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── OUR APPROACH (slate-50) ─────────────────── */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
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
              Mindset Before Skillset.
            </motion.h2>
          </motion.div>

          {/* Desktop: horizontal flex with connectors */}
          <div className="hidden md:flex items-start">
            {approachSteps.map((step, i) => (
              <div key={step.title} className="flex items-start flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.45 }}
                  className="flex-1 min-w-0"
                >
                  {/* Circle */}
                  <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center bg-white shadow-sm"
                      style={{ borderColor: "hsl(var(--primary) / 0.4)", color: "hsl(var(--primary))" }}>
                      <step.icon size={22} />
                    </div>
                  </div>
                  {/* Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 mx-1 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>

                {/* Connector */}
                {i < approachSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.25 }}
                    className="flex items-center shrink-0 mt-[0.875rem]"
                  >
                    <div className="w-3 xl:w-5" style={{ borderTop: "2px dashed hsl(var(--primary) / 0.3)", height: 0 }} />
                    <div className="w-7 h-7 rounded-full border-2 bg-white flex items-center justify-center shrink-0"
                      style={{ borderColor: "hsl(var(--primary) / 0.35)", color: "hsl(var(--primary))" }}>
                      <ArrowRight size={12} />
                    </div>
                    <div className="w-3 xl:w-5" style={{ borderTop: "2px dashed hsl(var(--primary) / 0.3)", height: 0 }} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical list */}
          <div className="flex flex-col gap-4 md:hidden">
            {approachSteps.map((step, i) => (
              <motion.div key={step.title}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center bg-white"
                    style={{ borderColor: "hsl(var(--primary) / 0.4)", color: "hsl(var(--primary))" }}>
                    <step.icon size={18} />
                  </div>
                  {i < approachSteps.length - 1 && (
                    <div className="flex-1 w-px mt-2" style={{ background: "hsl(var(--primary) / 0.2)" }} />
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex-1 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHAT YOU'LL GAIN (white) ─────────────────── */}
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
              What You'll Gain
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight"
            >
              Real Skills. Real Confidence.{" "}
              <em className="not-italic text-gradient-gold">Real Opportunities.</em>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {gains.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHO IS THIS FOR (white) ─────────────────── */}
      <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
              style={{ color: "hsl(var(--primary))" }}
            >
              Who Is This For?
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((a, i) => (
              <motion.div
                key={a.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/6 transition-all duration-300 card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-4`}>
                  <a.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{a.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
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
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
              <Rocket size={28} style={{ color: "hsl(var(--primary))" }} />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-serif font-normal text-white leading-snug mb-2">
                Ready to build a career that creates impact?
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Join HTB Academy and take the next step towards a future ready career in Business Analysis.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 shrink-0 justify-center">
              <Button asChild size="lg"
                className="bg-gradient-gold hover:opacity-90 font-semibold px-7 h-12 text-sm btn-shimmer shadow-orange"
              >
                <Link to="/services">Explore Learning Pathways <ArrowRight className="ml-2" size={15} /></Link>
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

export default About;

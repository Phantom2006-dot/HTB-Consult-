import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, CheckCircle, Star, Lightbulb, UserCheck, Briefcase, Brain, BarChart3, Quote, LogIn, LayoutDashboard, Sparkles, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp, scaleIn, slideLeft, slideRight } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";

const learningAreas = [
  {
    icon: BarChart3,
    title: "Business Analysis & Digital Transformation",
    description: "Analyse business problems, gather requirements, and support organisational change.",
    image: "/images/Business-Solutions.jpg",
    courses: [
      "Foundations of Business Analysis",
      "Requirements Engineering",
      "Process Mapping and BPMN",
      "Digital Transformation Strategy",
    ],
    link: "/courses",
    accent: "from-blue-500/20 to-blue-600/5",
    iconColor: "bg-blue-500/20 text-blue-400",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)]",
  },
  {
    icon: Briefcase,
    title: "Project Delivery & Business Execution",
    description: "Manage projects, coordinate stakeholders, and deliver business initiatives successfully.",
    image: "/images/Strategic-Growth-Sustainability-Solutions.jpg",
    courses: [
      "Project Management Foundations",
      "Project Governance",
      "Delivering Business Transformation",
      "Stakeholder Management",
    ],
    link: "/courses",
    accent: "from-amber-500/20 to-amber-600/5",
    iconColor: "bg-amber-500/20 text-amber-400",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]",
  },
  {
    icon: Brain,
    title: "Professional & Leadership Development",
    description: "Strengthen the professional skills required to perform effectively in modern organisations.",
    image: "/images/Bid-Writing-2.jpg",
    courses: [
      "Communication and Professional Writing",
      "Time Management and Productivity",
      "Emotional Intelligence",
      "Leadership and Influence",
    ],
    link: "/courses",
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "bg-emerald-500/20 text-emerald-400",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
  },
];

const whyReasons = [
  { icon: Target, text: "Practical learning focused on real business environments", color: "bg-blue-500/15 text-blue-400" },
  { icon: Lightbulb, text: "Industry-informed training built from genuine consulting experience", color: "bg-amber-500/15 text-amber-400" },
  { icon: UserCheck, text: "Structured programmes designed for measurable professional growth", color: "bg-emerald-500/15 text-emerald-400" },
  { icon: BookOpen, text: "Flexible online learning that fits around your career", color: "bg-purple-500/15 text-purple-400" },
];

const testimonials = [
  { name: "Sarah K.", role: "Project Manager", text: "HTB Consult transformed my career. The training was practical, relevant, and immediately applicable." },
  { name: "James O.", role: "Business Analyst", text: "The mentoring programme gave me the confidence and skills to transition into business analysis seamlessly." },
  { name: "Amara T.", role: "Senior Consultant", text: "Their CV review service helped me land three interviews within two weeks. Highly recommended!" },
];

const stats = [
  { value: "500+", label: "Professionals Trained", icon: TrendingUp, color: "text-amber-400" },
  { value: "95%", label: "Satisfaction Rate", icon: Star, color: "text-blue-400" },
  { value: "12+", label: "Expert Programmes", icon: BookOpen, color: "text-emerald-400" },
  { value: "10+", label: "Years Consulting", icon: Award, color: "text-purple-400" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* ── Hero with background video ── */}
      <section className="relative overflow-hidden min-h-[100vh] flex items-center -mt-[72px] pt-[72px]">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/Strategic-Growth-Sustainability-Solutions-1.jpg"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-group-of-colleagues-working-in-a-business-meeting-4851-large.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-business-team-having-a-meeting-around-a-table-17-large.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay + gradient */}
        <div className="absolute inset-0 bg-[hsl(163,36%,10%)]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,36%,8%)]/95 via-[hsl(163,36%,10%)]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,12%)]/90 via-transparent to-transparent" />

        {/* Animated radial glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-[pulse-glow_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px] animate-[pulse-glow_10s_ease-in-out_infinite_2s]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-24 lg:py-36">
          <div className="max-w-3xl xl:max-w-4xl">
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8"
            >
              <Sparkles size={14} className="text-primary" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">HTB Consult Academy</span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-5xl md:text-6xl xl:text-7xl font-serif font-normal text-white leading-[1.05] mb-8 tracking-display text-shadow-lg"
            >
              Practical Training for{" "}
              <em className="text-gradient-gold not-italic">Business,{" "}
              Transformation</em>
              {" "}&amp; Professional Growth
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-base lg:text-lg text-white/65 max-w-xl mb-10 leading-[1.9] font-light"
            >
              The learning platform of HTB Consult — equipping professionals and organisations with practical skills in business analysis, project delivery, digital transformation, and professional development.
            </motion.p>

            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-sm font-semibold px-8 h-12 shadow-orange btn-shimmer">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm font-semibold px-8 h-12 glass border-white/20 hover:bg-white/10 text-white">
                <Link to="/about">Our Story</Link>
              </Button>
              {user ? (
                <Button size="lg" asChild className="text-sm font-semibold px-8 h-12 glass hover:bg-white/10 text-white border border-white/15">
                  <Link to="/dashboard"><LayoutDashboard className="mr-2" size={16} />My Dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="text-sm font-semibold px-8 h-12 glass hover:bg-white/10 text-white border border-white/15">
                  <Link to="/auth"><LogIn className="mr-2" size={16} />Sign In / Register</Link>
                </Button>
              )}
            </motion.div>

            {/* Floating trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex items-center gap-3 mt-12"
            >
              <div className="flex -space-x-2">
                {["S", "J", "A", "R"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-white border-2 border-[hsl(163,36%,14%)]">{l}</div>
                ))}
              </div>
              <p className="text-sm text-white/60"><span className="text-white font-semibold">500+</span> professionals already enrolled</p>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Stats Strip ── */}
      <section className="relative bg-[hsl(163,36%,13%)] border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={scaleIn}
                className="py-10 px-6 text-center group"
              >
                <s.icon size={20} className={`${s.color} mx-auto mb-3 opacity-70`} />
                <p className="text-4xl lg:text-5xl font-serif stat-number mb-1">{s.value}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Areas ── */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(163,36%,14%)] to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">What You'll Learn</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-white max-w-lg mx-auto leading-tight">
              Our <em className="text-gradient-gold not-italic">Learning Areas</em>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {learningAreas.map((area, i) => (
              <motion.div key={area.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card-lift">
                <Link to={area.link}>
                  <div className={`rounded-2xl overflow-hidden glass border border-white/8 ${area.glow} transition-all duration-500 h-full group`}>
                    {/* Card image */}
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={area.image}
                        alt={area.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${area.accent} opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,14%)]/90 via-[hsl(163,36%,14%)]/20 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <div className={`w-10 h-10 rounded-xl ${area.iconColor} backdrop-blur-sm flex items-center justify-center`}>
                          <area.icon size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-lg font-normal text-white mb-2 leading-snug group-hover:text-gradient-gold transition-colors">{area.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">{area.description}</p>
                      <ul className="space-y-2">
                        {area.courses.map((course) => (
                          <li key={course} className="flex items-start gap-2 text-xs text-white/60">
                            <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                            <span>{course}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why HTB ── */}
      <section className="py-28 lg:py-36 overflow-hidden relative">
        <div className="absolute inset-0 bg-[hsl(163,36%,13%)]" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/4 blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            {/* Image column */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft} custom={0}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] glow-gold">
                <img
                  src="/images/Business-Solutions.jpg"
                  alt="Business professionals"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,10%)]/70 to-transparent" />
              </div>
              {/* Floating accent card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 glass-gold rounded-2xl p-5 shadow-orange max-w-[200px] border border-primary/30"
              >
                <p className="text-2xl font-serif text-gradient-gold">500+</p>
                <p className="text-xs text-white/70 mt-1 font-medium">Professionals trained across the UK</p>
              </motion.div>
              {/* Secondary floating badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -left-4 glass rounded-xl p-4 border border-blue-500/20 max-w-[160px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/60 uppercase tracking-wider">Live Learning</span>
                </div>
                <p className="text-sm font-semibold text-white">12+ Active Courses</p>
              </motion.div>
            </motion.div>

            {/* Text column */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">Why Choose Us</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-white mb-6 leading-tight">
                Built from Real <em className="text-gradient-gold not-italic">Consulting Experience</em>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/55 leading-[1.9] mb-10 text-sm lg:text-base">
                Our training is designed to give you skills that are immediately applicable in business environments. Every programme is structured to support professional growth and deliver measurable results.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-3 mb-10">
                {whyReasons.map((reason, i) => (
                  <motion.div
                    key={reason.text}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-3 p-3 rounded-xl glass border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg ${reason.color} flex items-center justify-center shrink-0`}>
                      <reason.icon size={16} />
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed mt-1">{reason.text}</p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} custom={4}>
                <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold text-sm px-7 h-11 shadow-orange btn-shimmer">
                  <Link to="/courses">Start Learning <ArrowRight className="ml-2" size={15} /></Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        {/* Background with Unsplash image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/92" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">Client Stories</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-white">
              What Our <em className="text-gradient-gold not-italic">Clients Say</em>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={scaleIn} className="card-lift">
                <div className="glass rounded-2xl border border-white/8 p-7 h-full hover:border-primary/20 transition-all duration-300">
                  <Quote className="text-primary/50 mb-4" size={28} />
                  <p className="font-elegant text-lg italic text-white/75 leading-relaxed mb-6">"{t.text}"</p>
                  <div className="glow-line mb-4" />
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="text-amber-400 fill-amber-400" size={13} />
                    ))}
                  </div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 lg:py-40 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(163,36%,8%)]/96 via-[hsl(220,40%,8%)]/90 to-[hsl(163,36%,8%)]/96" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        {/* Animated glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-[pulse-glow_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full bg-blue-500/5 blur-[80px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-6">
              <Sparkles size={12} className="text-primary" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">Get Started Today</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight max-w-3xl mx-auto text-shadow-lg">
              Build the Skills That <em className="text-gradient-gold not-italic">Drive Results</em>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/55 max-w-xl mx-auto mb-10 leading-[1.9] text-sm lg:text-base">
              Develop the knowledge and capabilities required to succeed in today's evolving business landscape.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-sm font-semibold px-10 h-12 shadow-orange btn-shimmer glow-gold">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm font-semibold px-10 h-12 glass border-white/20 hover:bg-white/10 text-white">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

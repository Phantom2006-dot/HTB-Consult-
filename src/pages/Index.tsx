import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, CheckCircle, Star, Lightbulb, UserCheck, Briefcase, Brain, BarChart3, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

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
  },
];

const whyReasons = [
  { icon: Target, text: "Practical learning focused on real business environments" },
  { icon: Lightbulb, text: "Industry-informed training built from genuine consulting experience" },
  { icon: UserCheck, text: "Structured programmes designed for measurable professional growth" },
  { icon: BookOpen, text: "Flexible online learning that fits around your career" },
];

const testimonials = [
  { name: "Sarah K.", role: "Project Manager, Deloitte", text: "HTB Consult transformed my career. The training was practical, relevant, and immediately applicable." },
  { name: "James O.", role: "Business Analyst, HSBC", text: "The mentoring programme gave me the confidence and skills to transition into business analysis seamlessly." },
  { name: "Amara T.", role: "Senior Consultant", text: "Their CV review service helped me land three interviews within two weeks. Highly recommended!" },
];

const stats = [
  { value: "500+", label: "Professionals Trained" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "12+", label: "Expert Programmes" },
  { value: "10+", label: "Years Consulting" },
];

const Index = () => {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-green" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url('/images/HTB-abstract.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        {/* Right image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="/images/Strategic-Growth-Sustainability-Solutions-1.jpg"
            alt="Professional growth"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,36%,14%)] via-[hsl(163,36%,14%)]/60 to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-24 lg:py-32">
          <div className="max-w-2xl xl:max-w-3xl">
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
              className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-8 flex items-center gap-3"
            >
              <span className="w-8 h-px bg-primary inline-block" />
              HTB Consult Academy
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-5xl md:text-6xl xl:text-7xl font-serif font-normal text-foreground leading-[1.05] mb-8 tracking-display text-shadow"
            >
              Practical Training for{" "}
              <em className="text-gradient-gold not-italic">Business, Transformation</em>
              {" "}&amp; Professional Growth
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-base lg:text-lg text-white/70 max-w-xl mb-10 leading-[1.85] font-light"
            >
              The learning platform of HTB Consult — equipping professionals and organisations with practical skills in business analysis, project delivery, digital transformation, and professional development.
            </motion.p>
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-sm font-semibold px-8 h-12 shadow-orange">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm font-semibold px-8 h-12 border-white/20 hover:bg-white/10 text-white">
                <Link to="/about">Our Story</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-card border-y border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="py-8 px-6 text-center"
              >
                <p className="text-3xl lg:text-4xl font-serif text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Areas ── */}
      <section className="py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-3 flex items-center gap-3">
              <span className="w-6 h-px bg-primary" /> What You'll Learn
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-secondary-foreground max-w-lg leading-tight">
              Our Learning Areas
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {learningAreas.map((area, i) => (
              <motion.div key={area.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Link to={area.link}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-gold group h-full overflow-hidden">
                    {/* Card image */}
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={area.image}
                        alt={area.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/90 flex items-center justify-center">
                          <area.icon className="text-white" size={18} />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-serif text-lg font-normal text-foreground mb-2 leading-snug">{area.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{area.description}</p>
                      <ul className="space-y-1.5">
                        {area.courses.map((course) => (
                          <li key={course} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                            <span>{course}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why HTB ── */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                <img
                  src="/images/Business-Solutions.jpg"
                  alt="Business professionals"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 bg-primary/90 backdrop-blur-sm rounded-xl p-5 shadow-orange max-w-[200px]">
                <p className="text-2xl font-serif text-white font-normal">500+</p>
                <p className="text-xs text-white/80 mt-0.5 font-medium">Professionals trained across the UK</p>
              </div>
            </motion.div>

            {/* Text column */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-primary" /> Why Choose Us
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-foreground mb-6 leading-tight">
                Built from Real Consulting Experience
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/70 leading-[1.85] mb-10 text-sm lg:text-base">
                Our training is designed to give you skills that are immediately applicable in business environments. Every programme is structured to support professional growth and deliver measurable results.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-3 mb-10">
                {whyReasons.map((reason) => (
                  <div key={reason.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <reason.icon className="text-primary" size={15} />
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{reason.text}</p>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} custom={4}>
                <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold text-sm px-7 h-11 shadow-orange">
                  <Link to="/courses">Start Learning <ArrowRight className="ml-2" size={15} /></Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 lg:py-32 bg-secondary relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url('/images/HTB-abstract.png')", backgroundSize: "cover" }}
        />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-3">Client Stories</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-normal text-secondary-foreground">
              What Our Clients Say
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-7">
                    <Quote className="text-primary/40 mb-4" size={28} />
                    <p className="font-elegant text-lg italic text-white/80 leading-relaxed mb-6">"{t.text}"</p>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="text-primary fill-primary" size={13} />
                      ))}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/Strategic-Growth-Sustainability-Solutions.jpg" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-green opacity-90" />
        </div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-6">Get Started Today</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-foreground mb-6 leading-tight max-w-3xl mx-auto">
              Build the Skills That Drive Results
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/70 max-w-xl mx-auto mb-10 leading-[1.85] text-sm lg:text-base">
              Develop the knowledge and capabilities required to succeed in today's evolving business landscape.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-sm font-semibold px-8 h-12 shadow-orange">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm font-semibold px-8 h-12 border-white/20 hover:bg-white/10 text-white">
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

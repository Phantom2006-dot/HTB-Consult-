import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Puzzle,
  BarChart3,
  Users,
  Target,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const steps = [
  {
    n: "01",
    icon: BookOpen,
    accent: "primary",
    title: "Structured Learning with Clear Direction",
    short: "Structured Learning",
    desc: "Each programme follows a clear path, starting from core principles and building into practical application. You will understand not just what to do, but why it matters.",
    cardDesc: "Clear, step-by-step learning from fundamentals to real-world application.",
  },
  {
    n: "02",
    icon: Puzzle,
    accent: "amber",
    title: "Real World Application",
    short: "Real-World Application",
    desc: "Our training is grounded in real consulting scenarios. You will work through practical examples such as analysing business problems, defining requirements, improving processes, and supporting project delivery.",
    cardDesc: "Work on practical scenarios and real business challenges.",
  },
  {
    n: "03",
    icon: BarChart3,
    accent: "primary",
    title: "Practical Skills that Reflect Industry Needs",
    short: "Build Practical Skills",
    desc: "We focus on skills that are directly relevant in today's work environment — business analysis, requirements gathering, project delivery, process improvement, and stakeholder engagement.",
    cardDesc: "Develop in-demand skills that are relevant in today's workplace.",
  },
  {
    n: "04",
    icon: Users,
    accent: "amber",
    title: "Guided Learning and Support",
    short: "Get Guided Support",
    desc: "You are not left to figure things out alone. Our programmes are designed to guide you through each stage, helping you build confidence and clarity as you progress.",
    cardDesc: "Get expert guidance and support at every step of your learning journey.",
  },
  {
    n: "05",
    icon: Target,
    accent: "primary",
    title: "Career and Professional Development",
    short: "Grow Professionally",
    desc: "Beyond technical skills, we support your overall growth through professional mentoring, CV and career positioning support, and insight into how to present your value in the market.",
    cardDesc: "Access mentoring, career guidance, and CV positioning support.",
  },
  {
    n: "06",
    icon: Rocket,
    accent: "amber",
    title: "Built for Immediate Impact",
    short: "Apply What You Learn",
    desc: "Everything you learn is designed to be applied. The goal is simple — to help you move from learning to doing, with clarity and confidence.",
    cardDesc: "Use your skills with confidence and create real impact.",
  },
];

const accentClasses = {
  primary: {
    bg: "bg-primary/15",
    border: "border-primary/30",
    text: "text-primary",
    ring: "bg-primary",
  },
  amber: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    ring: "bg-amber-500",
  },
};

const Services = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[hsl(163,40%,8%)]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/93 backdrop-blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,40%,8%)]/90 via-[hsl(163,40%,8%)]/60 to-[hsl(163,40%,8%)]/30" />
          <div className="absolute inset-0 grid-pattern opacity-15" />
        </div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/8 blur-[100px]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-amber-500/30 mb-5"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-amber-400 font-semibold tracking-[0.2em] uppercase text-xs">
                How It Works
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-3 text-shadow-lg"
            >
              Learn. Apply.
              <br />
              <span className="text-gradient-gold">Grow. Succeed.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-white/70 leading-relaxed mt-6 max-w-2xl"
            >
              At HTB Consult Academy, our training is built on real consulting experience and
              designed to give you practical skills you can apply immediately. We do not focus on
              theory alone — every programme reflects how work is done in real business
              environments.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Six steps grid */}
      <section className="py-16 lg:py-24 bg-[hsl(163,40%,8%)] relative">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => {
              const accent = accentClasses[step.accent as keyof typeof accentClasses];
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.n}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="relative"
                >
                  <div className="glass rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 p-6 h-full card-lift">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${accent.bg} ${accent.border} border flex items-center justify-center shrink-0`}
                      >
                        <Icon size={22} className={accent.text} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold tracking-widest ${accent.text} mb-1`}>
                          {step.n}
                        </p>
                        <h3 className="font-serif text-lg font-semibold text-white leading-snug">
                          {step.short}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{step.cardDesc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed sections */}
      <section className="py-16 lg:py-20 bg-[hsl(163,40%,6%)] relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-10">
          {steps.map((step, i) => {
            const accent = accentClasses[step.accent as keyof typeof accentClasses];
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 3}
                variants={fadeUp}
                className="flex gap-5 items-start"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${accent.bg} ${accent.border} border flex items-center justify-center shrink-0`}
                >
                  <Icon size={24} className={accent.text} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold tracking-widest ${accent.text} mb-1`}>
                    {step.n}
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-[hsl(163,40%,8%)]">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-serif font-bold text-white mb-4"
            >
              Ready to move from learning to doing?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 mb-8 leading-relaxed"
            >
              Explore our programmes and start building practical skills you can apply with
              clarity and confidence.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex justify-center gap-4 flex-wrap"
            >
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90">
                <Link to="/courses">
                  Explore Courses <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/5"
              >
                <Link to="/about">Learn About Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;

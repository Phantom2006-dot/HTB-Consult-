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
    nodeTitle: "Learn with Structure",
    nodeDesc: "Follow a clear path from basics to advanced skills.",
    desc: "Each programme follows a clear path, starting from core principles and building into practical application. You will understand not just what to do, but why it matters.",
    cardDesc: "Clear, step-by-step learning from fundamentals to real-world application.",
  },
  {
    n: "02",
    icon: Puzzle,
    accent: "amber",
    title: "Real World Application",
    short: "Real-World Application",
    nodeTitle: "Apply to Real Scenarios",
    nodeDesc: "Work on real business situations and case examples.",
    desc: "Our training is grounded in real consulting scenarios. You will work through practical examples such as analysing business problems, defining requirements, improving processes, and supporting project delivery.",
    cardDesc: "Work on practical scenarios and real business challenges.",
  },
  {
    n: "03",
    icon: BarChart3,
    accent: "primary",
    title: "Practical Skills that Reflect Industry Needs",
    short: "Build Practical Skills",
    nodeTitle: "Build Practical Skills",
    nodeDesc: "Gain skills you can use in real roles and projects.",
    desc: "We focus on skills that are directly relevant in today's work environment — business analysis, requirements gathering, project delivery, process improvement, and stakeholder engagement.",
    cardDesc: "Develop in-demand skills that are relevant in today's workplace.",
  },
  {
    n: "04",
    icon: Users,
    accent: "amber",
    title: "Guided Learning and Support",
    short: "Get Guided Support",
    nodeTitle: "Get Guided Support",
    nodeDesc: "Receive guidance and feedback throughout your learning.",
    desc: "You are not left to figure things out alone. Our programmes are designed to guide you through each stage, helping you build confidence and clarity as you progress.",
    cardDesc: "Get expert guidance and support at every step of your learning journey.",
  },
  {
    n: "05",
    icon: Target,
    accent: "primary",
    title: "Career and Professional Development",
    short: "Grow Professionally",
    nodeTitle: "Grow Professionally",
    nodeDesc: "Build your career with mentoring and CV support.",
    desc: "Beyond technical skills, we support your overall growth through professional mentoring, CV and career positioning support, and insight into how to present your value in the market.",
    cardDesc: "Access mentoring, career guidance, and CV positioning support.",
  },
  {
    n: "06",
    icon: Rocket,
    accent: "amber",
    title: "Built for Immediate Impact",
    short: "Apply What You Learn",
    nodeTitle: "Apply What You Learn",
    nodeDesc: "Put your skills into action and create real impact.",
    desc: "Everything you learn is designed to be applied. The goal is simple — to help you move from learning to doing, with clarity and confidence.",
    cardDesc: "Use your skills with confidence and create real impact.",
  },
];

const accentClasses = {
  primary: {
    bg: "bg-primary/15",
    border: "border-primary/30",
    text: "text-primary",
    solid: "bg-primary",
    nodeBg: "bg-primary",
  },
  amber: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    solid: "bg-amber-500",
    nodeBg: "bg-amber-500",
  },
};

// Hand-tuned positions for each satellite node so the layout matches
// the reference design and cards never overlap the central image.
// dot{X,Y} are percentages within the square diagram container.
// place dictates where the card sits relative to the dot.
type Place = "right" | "left" | "below-right" | "below-left" | "above";
// Dots are aligned on the dashed ring (radius 38% from centre).
// Each (x, y) satisfies (x-50)^2 + (y-50)^2 ≈ 38^2 so the dot sits on the ring.
const NODE_POSITIONS: { dotX: number; dotY: number; place: Place }[] = [
  { dotX: 50,   dotY: 12,   place: "above"      }, // 01 top         (θ=0°)
  { dotX: 82.9, dotY: 31,   place: "right"      }, // 02 upper-right (θ=60°)
  { dotX: 82.9, dotY: 69,   place: "right"      }, // 03 lower-right (θ=120°)
  { dotX: 63,   dotY: 85.7, place: "below-right"}, // 04 bottom-right(θ=160°)
  { dotX: 37,   dotY: 85.7, place: "below-left" }, // 05 bottom-left (θ=200°)
  { dotX: 14.3, dotY: 37,   place: "left"       }, // 06 upper-left  (θ=290°)
];

const Services = () => {
  return (
    <Layout>
      {/* Hero with circular how-it-works diagram */}
      <section className="relative overflow-hidden bg-[hsl(163,40%,7%)] py-16 lg:py-24">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/8 blur-[100px]" />
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)] gap-10 lg:gap-10 items-center">
            {/* Left: text + vertical cards */}
            <div>
              <motion.div initial="hidden" animate="visible">
                <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-5">
                  <span className="block w-10 h-[2px] bg-amber-500" />
                  <span className="text-amber-400 font-semibold tracking-[0.25em] uppercase text-xs">
                    How It Works
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.05] mb-3"
                >
                  Learn. Apply.
                  <br />
                  <span className="text-gradient-gold">Grow. Succeed.</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-base text-white/70 leading-relaxed max-w-md mt-5 mb-8"
                >
                  Our training is built on real consulting experience and designed to give you
                  practical skills you can apply immediately.
                </motion.p>

                <div className="space-y-3">
                  {steps.map((step, i) => {
                    const accent = accentClasses[step.accent as keyof typeof accentClasses];
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={`left-${step.n}`}
                        initial="hidden"
                        animate="visible"
                        custom={3 + i * 0.5}
                        variants={fadeUp}
                        className="glass border border-white/10 rounded-xl p-3.5 flex items-start gap-3.5 hover:border-white/20 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${accent.bg} ${accent.border} border flex items-center justify-center shrink-0`}
                        >
                          <Icon size={18} className={accent.text} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-sm leading-snug mb-0.5">
                            {step.short}
                          </h3>
                          <p className="text-xs text-white/55 leading-relaxed">{step.cardDesc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right: circular diagram (lg and up only) */}
            <div className="hidden lg:block">
              <CircleDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed sections */}
      <section className="py-16 lg:py-20 bg-[hsl(163,40%,5%)] relative">
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
      <section className="py-16 lg:py-24 bg-[hsl(163,40%,7%)]">
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

// ─────────────────────────────────────────────────────────────────────────────
// Circular diagram component
// ─────────────────────────────────────────────────────────────────────────────
const CircleDiagram = () => {
  // Container is square; the dashed circle radius is a fraction of its size.
  // Cards are positioned absolutely around the dashed circle.
  return (
    <div className="relative mx-auto w-[88%] max-w-[440px] aspect-square">
      {/* Dashed orbit ring (radius ≈ 38% of container) */}
      <div className="absolute inset-[12%] rounded-full border-2 border-dashed border-white/15" />

      {/* Center image */}
      <div className="absolute inset-[24%] rounded-full overflow-hidden border-4 border-white/10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)]">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop"
          alt="Workspace with laptop, books and coffee mug"
          className="w-full h-full object-cover"
        />
        {/* Soft inner vignette */}
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none" />
      </div>

      {/* 6 satellite nodes */}
      {steps.map((step, i) => {
        const pos = NODE_POSITIONS[i];
        const accent = accentClasses[step.accent as keyof typeof accentClasses];
        const Icon = step.icon;
        const rightAlign =
          pos.place === "left" || pos.place === "below-left";

        // Card position relative to dot
        let cardStyle: React.CSSProperties = {};
        switch (pos.place) {
          case "right":
            cardStyle = {
              left: "calc(100% + 14px)",
              top: "50%",
              transform: "translateY(-50%)",
            };
            break;
          case "left":
            cardStyle = {
              right: "calc(100% + 14px)",
              top: "50%",
              transform: "translateY(-50%)",
            };
            break;
          case "above":
            cardStyle = {
              left: "50%",
              bottom: "calc(100% + 14px)",
              transform: "translateX(-50%)",
            };
            break;
          case "below-right":
            cardStyle = {
              left: "50%",
              top: "calc(100% + 14px)",
            };
            break;
          case "below-left":
            cardStyle = {
              right: "50%",
              top: "calc(100% + 14px)",
            };
            break;
        }

        return (
          <motion.div
            key={`node-${step.n}`}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className="absolute"
            style={{
              left: `${pos.dotX}%`,
              top: `${pos.dotY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Card */}
            <div className="absolute" style={cardStyle}>
              <div className="w-[155px] sm:w-[170px] rounded-xl bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] border border-black/5 p-3">
                <p
                  className={`text-[11px] font-bold tracking-wider mb-1 ${accent.text} ${
                    rightAlign ? "text-right" : ""
                  }`}
                >
                  {step.n}
                </p>
                <h4
                  className={`text-[13px] font-bold text-[hsl(163,40%,12%)] leading-snug mb-1 ${
                    rightAlign ? "text-right" : ""
                  }`}
                >
                  {step.nodeTitle}
                </h4>
                <p
                  className={`text-[11px] text-slate-600 leading-snug ${
                    rightAlign ? "text-right" : ""
                  }`}
                >
                  {step.nodeDesc}
                </p>
              </div>
            </div>

            {/* Icon dot on ring */}
            <div
              className={`relative w-11 h-11 rounded-full ${accent.nodeBg} flex items-center justify-center shadow-lg ring-4 ring-[hsl(163,40%,7%)]`}
            >
              <Icon size={18} className="text-white" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Services;

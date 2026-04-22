import { motion } from "framer-motion";
import {
  Target,
  Users,
  BookOpen,
  Lightbulb,
  UserCheck,
  Building2,
  GraduationCap,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const stats = [
  { value: "500+", label: "Professionals Supported" },
  { value: "15+", label: "Years Experience" },
  { value: "98%", label: "Learner Satisfaction" },
  { value: "50+", label: "Organisations Served" },
];

const individuals = [
  "Build practical skills in business analysis and project delivery",
  "Gain real world understanding of how projects and organisations operate",
  "Improve career positioning through applied knowledge and guidance",
];

const organisations = [
  "Strengthen team capability and performance",
  "Support workforce development in key business areas",
  "Improve delivery through structured, skills based training",
];

const approach = [
  {
    icon: GraduationCap,
    title: "Practical Learning",
    desc: "Skills you can use in real roles and business environments.",
  },
  {
    icon: Target,
    title: "Structured Development",
    desc: "Clear learning paths from fundamentals to applied capability.",
  },
  {
    icon: Lightbulb,
    title: "Real World Insight",
    desc: "Training built from consulting experience, not theory alone.",
  },
  {
    icon: TrendingUp,
    title: "Business Focused Growth",
    desc: "Supporting both professional development and organisational performance.",
  },
];

const focusItems = [
  "Individuals build confidence and real capability",
  "Organisations develop stronger, more effective teams",
  "Professionals and businesses improve how they work and deliver results",
];

const About = () => {
  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, hsl(30, 100%, 46%) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-primary font-medium tracking-widest uppercase text-sm mb-2"
            >
              About Us
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4"
            >
              Practical Learning for Individuals and Organisations
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              HTB Consult Academy is a learning platform designed to equip both individual
              professionals and organisations with practical skills that can be applied in real
              business environments.
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-base text-muted-foreground leading-relaxed mt-3"
            >
              We focus on moving beyond theory, helping learners and teams build the confidence to
              solve problems, deliver projects, and contribute effectively in their roles.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-gradient-gold">{stat.value}</p>
                <p className="text-sm text-foreground/70 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="text-3xl font-serif font-bold text-foreground mb-6"
              >
                Who We Are
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-muted-foreground leading-relaxed mb-4"
              >
                HTB Consult Academy is built from real consulting experience. Our programmes
                reflect how work is actually done across business analysis, project delivery, and
                digital transformation.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-muted-foreground leading-relaxed"
              >
                This allows us to provide training that is grounded, relevant, and aligned with
                real industry expectations.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Briefcase, label: "Real Consulting Experience" },
                { icon: Lightbulb, label: "Grounded & Relevant" },
                { icon: UserCheck, label: "People Centred" },
                { icon: BookOpen, label: "Continuous Learning" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                >
                  <Card className="bg-card border-border text-center h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <item.icon className="text-primary mb-3" size={28} />
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-serif font-bold text-secondary-foreground"
            >
              What We Do
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-secondary-foreground/70 mt-3 max-w-2xl mx-auto"
            >
              We support both individuals and organisations through structured training and
              development.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="bg-card border-border h-full">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <Users className="text-primary" size={22} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      For Individuals
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {individuals.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="bg-card border-border h-full">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Building2 className="text-amber-400" size={22} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      For Organisations
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {organisations.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-serif font-bold text-foreground"
            >
              Our Approach
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-muted-foreground mt-3 max-w-2xl mx-auto"
            >
              Our approach is focused on clarity, structure, and real application.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Focus */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-serif font-bold text-secondary-foreground"
            >
              Our Focus
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-secondary-foreground/70 mt-3"
            >
              We are committed to helping:
            </motion.p>
          </motion.div>

          <div className="space-y-3">
            {focusItems.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-bold">{i + 1}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed pt-0.5">{item}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

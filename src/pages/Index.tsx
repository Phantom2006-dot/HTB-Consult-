import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Target, CheckCircle, Star, TrendingUp, Lightbulb, UserCheck, Briefcase, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const learningAreas = [
  {
    icon: BarChart3,
    title: "Business Analysis & Digital Transformation",
    description: "Learn how to analyse business problems, gather requirements, and support organisational change.",
    courses: [
      "Foundations of Business Analysis",
      "Requirements Engineering",
      "Process Mapping and BPMN",
      "Digital Transformation Strategy",
      "AI in Business Operations",
    ],
    link: "/courses",
  },
  {
    icon: Briefcase,
    title: "Project Delivery & Business Execution",
    description: "Develop the skills required to manage projects, coordinate stakeholders, and deliver business initiatives successfully.",
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
    courses: [
      "Communication and Professional Writing",
      "Time Management and Productivity",
      "Emotional Intelligence",
      "Negotiation and Critical Thinking",
      "Leadership and Influence",
    ],
    link: "/courses",
  },
];

const whyReasons = [
  { icon: Target, text: "Practical learning focused on real business environments" },
  { icon: Lightbulb, text: "Industry informed training from consulting experience" },
  { icon: UserCheck, text: "Structured programmes designed for professional growth" },
];

const testimonials = [
  { name: "Sarah K.", role: "Project Manager at Deloitte", text: "HTB Consult transformed my career. The training was practical, relevant, and immediately applicable." },
  { name: "James O.", role: "Business Analyst at HSBC", text: "The mentoring programme gave me the confidence and skills to transition into business analysis seamlessly." },
  { name: "Amara T.", role: "Senior Consultant", text: "Their CV review service helped me land three interviews within two weeks. Highly recommended!" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-green" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-24 lg:py-40">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold tracking-[0.25em] uppercase text-xs mb-6">
              HTB Consult Academy
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-foreground leading-[1.1] mb-8 tracking-tight">
              Practical Training for{" "}
              <span className="text-gradient-gold">Business, Transformation & Professional Growth</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-muted-foreground max-w-2xl mb-6 leading-[1.8] font-light">
              HTB Consult Academy is the learning platform of HTB Consult, created to equip professionals and organisations with practical skills in business analysis, project delivery, digital transformation, and professional development.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-base text-muted-foreground max-w-2xl mb-10 leading-[1.8] font-light">
              Our programmes combine structured learning with real world insight to help individuals build capability, deliver projects effectively, and grow professionally.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-base px-8">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={18} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 border-primary/30 hover:bg-primary/10">
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Learning Areas */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">What You'll Learn</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground">
              Our Learning Areas
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {learningAreas.map((area, i) => (
              <motion.div key={area.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Link to={area.link}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-gold group h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <area.icon className="text-primary" size={24} />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{area.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{area.description}</p>
                      <p className="text-xs font-medium text-primary mb-2">Courses include:</p>
                      <ul className="space-y-1.5">
                        {area.courses.map((course) => (
                          <li key={course} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle size={13} className="text-primary shrink-0 mt-0.5" />
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

      {/* Why HTB Consult Academy */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Why Choose Us</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Why HTB Consult Academy
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed mb-8">
                Our training is built from real consulting experience, designed to give you skills that are immediately applicable in business environments. Every programme is structured to support professional growth and deliver measurable results.
              </motion.p>
              <motion.div variants={fadeUp} custom={3}>
                <Button asChild className="bg-gradient-gold hover:opacity-90">
                  <Link to="/courses">Start Learning <ArrowRight className="ml-2" size={18} /></Link>
                </Button>
              </motion.div>
            </motion.div>
            <div className="space-y-4">
              {whyReasons.map((reason, i) => (
                <motion.div key={reason.text} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <reason.icon className="text-primary" size={20} />
                      </div>
                      <p className="text-foreground font-medium">{reason.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground">
              What Our Clients Say
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="text-primary fill-primary" size={16} />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Build the Skills That Drive Results
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto mb-8">
              Develop the knowledge and capabilities required to succeed in today's evolving business landscape. Start learning with HTB Consult Academy.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 text-base px-8">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2" size={18} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 border-primary/30 hover:bg-primary/10">
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

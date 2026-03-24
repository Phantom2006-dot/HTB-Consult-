import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, Calendar, ArrowRight, CheckCircle, TrendingUp, Target, Settings, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const consultingServices = [
  {
    icon: TrendingUp,
    title: "Strategic Growth & Sustainability",
    items: [
      "Market Opportunity Alignment — Positioning organisations to compete effectively by identifying emerging opportunities.",
      "Performance Monitoring — Tracking KPIs to measure progress and support continuous improvement.",
      "Financial & Operational Strategy — Developing structured strategies that support stability, scalability, and sustainable growth.",
    ],
  },
  {
    icon: FileText,
    title: "Bid Writing & Tender Support",
    items: [
      "Tailored Bid Strategies — Aligning submissions with client expectations and competitive positioning.",
      "Expert Proposal Development — Crafting persuasive proposals designed to maximise success.",
      "Regulatory and Tender Compliance — Ensuring every submission meets procurement requirements.",
      "Post-Bid Performance Review — Analysing outcomes to improve future submissions.",
    ],
  },
  {
    icon: Settings,
    title: "Business Process Optimisation",
    items: [
      "Workflow Analysis and Automation — Identifying inefficiencies and introducing streamlined processes.",
      "Operational Cost Optimisation — Improving resource utilisation for stronger returns.",
      "Technology and Systems Integration — Leveraging digital tools to improve efficiency and collaboration.",
      "Data Driven Process Improvement — Using structured analysis for informed decision making.",
    ],
  },
];

const trainingServices = [
  { icon: BookOpen, title: "Foundational Business Analysis Training", desc: "Equipping professionals with the core principles, tools, and techniques needed to analyse business needs, gather requirements, and support effective project delivery." },
  { icon: Target, title: "Project Management Foundations", desc: "Providing practical understanding of project planning, stakeholder coordination, and structured delivery approaches." },
  { icon: Users, title: "Professional Mentoring", desc: "Supporting individuals through guided mentoring focused on career development, industry insight, and practical professional growth." },
  { icon: FileText, title: "CV Review & Career Positioning", desc: "Helping professionals present their experience effectively through structured CV reviews and guidance aligned with industry expectations." },
];

const Services = () => {
  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Our Services</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Strategic Growth & Sustainability Solutions
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl">
              Beyond operational improvement, we help organisations scale through sustainable growth strategies that strengthen long-term performance and market competitiveness.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Consulting Services */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Consulting</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-serif font-bold text-foreground">Our Consulting Services</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {consultingServices.map((service, i) => (
              <motion.div key={service.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-4">{service.title}</h3>
                    <ul className="space-y-3">
                      {service.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training & Academy */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">HTB Consult Academy</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-serif font-bold text-secondary-foreground">Practical Training for Professional Growth</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-secondary-foreground/70 mt-3 max-w-2xl mx-auto">
              HTB Consult Academy equips professionals and organisations with practical skills in business analysis, project delivery, digital transformation, and professional development. Our programmes combine structured learning with real world insight.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {trainingServices.map((service, i) => (
              <motion.div key={service.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-secondary-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-secondary-foreground/60 leading-relaxed">{service.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5} className="text-center mt-10">
            <Button asChild className="bg-gradient-gold hover:opacity-90">
              <Link to="/courses">Explore Courses <ArrowRight className="ml-1" size={16} /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-serif font-bold text-foreground mb-4">
              Ready to Strengthen Your Organisation?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto mb-8">
              Get in touch to discuss how we can help your organisation grow, improve performance, and achieve sustainable success.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90">
                <Link to="/contact">Get in Touch <ArrowRight className="ml-2" size={18} /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
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

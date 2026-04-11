import { motion } from "framer-motion";
import { Target, Users, Award, BookOpen, CheckCircle, TrendingUp, Lightbulb, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const teamSpecialists = [
  { title: "Business Analysts and Strategists", desc: "Identifying opportunities and guiding organisations in making informed decisions." },
  { title: "Bid and Proposal Specialists", desc: "Developing compelling proposals that help organisations secure funding and high-value opportunities." },
  { title: "Process Improvement Specialists", desc: "Enhancing operational performance through workflow optimisation and effective process design." },
  { title: "Digital Transformation Practitioners", desc: "Supporting organisations in adopting technology and modern ways of working that enable sustainable growth." },
];

const stats = [
  { value: "500+", label: "Professionals Supported" },
  { value: "15+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Organisations Served" },
];

const About = () => {
  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">About Us</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Empowering Businesses with Strategic Solutions
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl">
              HTB Consult is a business consultancy focused on helping organisations grow, improve operational efficiency, and achieve long-term success.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="text-center">
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
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-serif font-bold text-foreground mb-6">Who We Are</motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground leading-relaxed mb-4">
                HTB Consult is a business consultancy focused on helping organisations grow, improve operational efficiency, and achieve long-term success. Through strategic advisory, practical implementation support, and professional capability development, we equip businesses and professionals with the insight, skills, and structured approaches needed to optimise processes, strengthen performance, and drive sustainable transformation.
              </motion.p>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed mb-4">
                Alongside our consulting services, we deliver practical training and professional development through HTB Consult Academy, equipping professionals and organisations with the skills required in business analysis, digital transformation, and organisational improvement.
              </motion.p>
              <motion.p variants={fadeUp} custom={3} className="text-muted-foreground leading-relaxed">
                Through a structured and data-driven approach, we help businesses strengthen performance, unlock opportunities, and achieve sustainable growth.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, label: "Data Driven Strategy" },
                { icon: Lightbulb, label: "Innovative Solutions" },
                { icon: UserCheck, label: "People Centred" },
                { icon: BookOpen, label: "Continuous Learning" },
              ].map((item, i) => (
                <motion.div key={item.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
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

      {/* Our Approach */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-serif font-bold text-secondary-foreground">Our Approach</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-secondary-foreground/70 mt-3 max-w-2xl mx-auto">
              We believe every business challenge presents an opportunity for growth. Our approach combines strategic insight, practical execution, and capability development.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Data Driven Strategy", desc: "Supporting organisations to make informed, evidence-based decisions that guide sustainable growth." },
              { icon: Lightbulb, title: "Innovative Problem Solving", desc: "Designing practical and scalable solutions that address operational challenges and improve efficiency." },
              { icon: UserCheck, title: "People Centred Development", desc: "Working closely with organisations while strengthening the skills and capabilities of professionals through training and knowledge development." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4} className="text-center text-secondary-foreground/70 mt-10 max-w-3xl mx-auto">
            By combining technology, industry insight, and professional capability development, we help organisations unlock potential, improve performance, and navigate competitive markets with confidence.
          </motion.p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Our Team</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-serif font-bold text-foreground">A Team of Experts Committed to Your Success</motion.h2>
          </motion.div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-10">
            At the core of HTB Consult is a team of experienced consultants, strategists, and industry professionals committed to delivering meaningful business outcomes. Our work combines strategic advisory, operational improvement, and capability development to help organisations strengthen performance and achieve sustainable growth.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamSpecialists.map((member, i) => (
              <motion.div key={member.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="text-primary" size={24} />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground mb-2">{member.title}</h3>
                    <p className="text-sm text-muted-foreground">{member.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5} className="text-center text-muted-foreground mt-10 max-w-3xl mx-auto">
            Alongside consulting, the team also contributes to training and professional development through HTB Consult Academy, helping professionals and organisations strengthen practical skills in business analysis, digital transformation, and strategic thinking.
          </motion.p>
        </div>
      </section>
    </Layout>
  );
};

export default About;

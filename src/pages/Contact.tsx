import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send, MessageSquare, Clock,
  Shield, Users, Zap, ArrowRight, CheckCircle, HelpCircle, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";

const faqs = [
  { q: "How are the training sessions delivered?", a: "Our training is delivered through a blend of live virtual sessions, in-person workshops, and self-paced online content. We adapt to your preferred learning style." },
  { q: "Do I receive a certificate after completing a course?", a: "Yes, upon successful completion of any course, you will receive an HTB Consults certificate of completion. For certification courses like PRINCE2 and PMP, we prepare you for the official exams." },
  { q: "Can training be customised for my organisation?", a: "Absolutely. We offer bespoke training programmes tailored to your organisation's specific needs, industry, and team skill levels." },
  { q: "What is the refund policy?", a: "We offer a full refund if you cancel 7 or more days before the course start date. Within 7 days, we offer a credit towards a future course." },
  { q: "How do I book a mentoring session?", a: "After signing up, you can browse available time slots on our calendar booking system and select a time that works for you." },
];

const subjects = [
  "Course Enquiry",
  "Mentoring Session",
  "Corporate Training",
  "CV Review",
  "Technical Support",
  "Other",
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    }, 1200);
  };

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[hsl(163,40%,6%)]">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-10" />

        {/* Glow orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] rounded-full opacity-8 blur-[100px]"
          style={{ background: "hsl(200,80%,40%)" }} />

        {/* Floating decorative icons */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none">
          <div className="relative w-72 h-72">
            {/* Central mail icon */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-24 h-24 rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm flex items-center justify-center shadow-[0_0_40px_rgba(234,119,0,0.2)]">
                <Mail size={40} className="text-primary" />
              </div>
            </motion.div>
            {/* Message bubble top-right */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-2 right-0"
            >
              <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare size={24} className="text-white/50" />
              </div>
            </motion.div>
            {/* Phone bottom-left */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-4 left-0"
            >
              <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <Phone size={20} className="text-white/50" />
              </div>
            </motion.div>
            {/* Shield top-left */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-6 left-4"
            >
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <Shield size={18} className="text-white/40" />
              </div>
            </motion.div>
            {/* Check bottom-right */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute bottom-8 right-4"
            >
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle size={18} className="text-primary/70" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.p
              variants={fadeUp} custom={0}
              className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-4"
            >
              We're here to help
            </motion.p>
            <motion.h1
              variants={fadeUp} custom={1}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight"
            >
              Have a Question?<br />
              <span className="text-gradient-gold">We're Here for You.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp} custom={2}
              className="text-base text-white/70 max-w-xl leading-relaxed mb-10"
            >
              Whether you need help choosing a course, accessing your account,
              or anything in between — our team is ready to assist you.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              variants={fadeUp} custom={3}
              className="flex flex-wrap sm:flex-nowrap gap-3"
            >
              {[
                { icon: Zap, label: "Fast Support", sub: "We respond within 24 hours" },
                { icon: Users, label: "Real People", sub: "Talk to our friendly support team" },
                { icon: Shield, label: "We Care", sub: "Your success is our priority" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex-1 min-w-[180px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <item.icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/50">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Form + Other ways to reach ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white relative overflow-hidden border-y border-slate-200">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.018) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 xl:gap-12">

            {/* Left — Contact Form */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm"
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-xl font-serif font-bold text-slate-900 mb-1">
                Get in Touch
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-sm text-slate-500 mb-6">
                Fill out the form and we'll get back to you as soon as possible.
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp} custom={2} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      className="bg-slate-50 border-slate-200 h-10 text-sm text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      maxLength={255}
                      className="bg-slate-50 border-slate-200 h-10 text-sm text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} custom={3}>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Subject <span className="text-primary">*</span>
                  </label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 h-10 text-sm text-slate-900">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={fadeUp} custom={4}>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Message <span className="text-primary">*</span>
                  </label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    maxLength={1000}
                    rows={5}
                    className="bg-slate-50 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </motion.div>

                <motion.div variants={fadeUp} custom={5} className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Shield size={12} className="text-primary shrink-0" />
                    Your information is safe with us. We respect your privacy.
                  </p>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="shrink-0 bg-gradient-gold hover:opacity-90 gap-2 px-6"
                  >
                    {sent ? (
                      <><CheckCircle size={15} /> Sent!</>
                    ) : sending ? (
                      <>Sending…</>
                    ) : (
                      <>Send Message <Send size={14} /></>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Other Ways to Reach Us */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <motion.h3 variants={fadeUp} custom={0} className="text-base font-serif font-bold text-slate-900 mb-4">
                  Other Ways to Reach Us
                </motion.h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: Mail,
                      label: "Email Support",
                      value: "training@htbconsults.com",
                      href: "mailto:training@htbconsults.com",
                      badge: "24/7",
                      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
                    },
                    {
                      icon: Phone,
                      label: "Phone",
                      value: "+44 7862 056300",
                      href: "tel:+447862056300",
                      badge: "Mon – Fri",
                      sub: "8:00 AM – 5:00 PM (GMT)",
                      badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
                    },
                    {
                      icon: MessageSquare,
                      label: "Live Chat",
                      value: "Chat with our support team",
                      badge: "Mon – Fri",
                      sub: "8:00 AM – 5:00 PM (GMT)",
                      badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
                    },
                    {
                      icon: MapPin,
                      label: "Our Office",
                      value: "London, United Kingdom",
                      badge: "Mon – Fri",
                      sub: "8:00 AM – 5:00 PM (GMT)",
                      badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      variants={fadeUp}
                      custom={i + 1}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary/40 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-xs text-slate-500 hover:text-primary transition-colors truncate block"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-500 truncate">{item.value}</p>
                        )}
                        {item.sub && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Before You Contact Us */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                custom={5}
                className="bg-primary/8 border border-primary/20 rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">Before You Contact Us</p>
                  <p className="text-xs text-slate-500 mb-3">
                    Try our Help Centre for quick answers to common questions.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                    asChild
                  >
                    <a href="/courses">
                      Browse Courses <ArrowRight size={12} />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA cards ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-white relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.018) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* FAQ card */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/6 transition-all duration-300 card-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 mb-1">Frequently Asked Questions</p>
                <p className="text-xs text-slate-500">
                  Find answers to the most common questions about courses, enrollment, payments, and more.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs border-slate-300 text-slate-600 hover:border-primary/40 hover:text-primary gap-1.5"
                onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View FAQs <ArrowRight size={12} />
              </Button>
            </motion.div>

            {/* Technical Support card */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/6 transition-all duration-300 card-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Settings size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 mb-1">Need Technical Assistance?</p>
                <p className="text-xs text-slate-500">
                  Having trouble accessing the platform or experiencing technical issues?
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs border-slate-300 text-slate-600 hover:border-primary/40 hover:text-primary gap-1.5"
                asChild
              >
                <a href="mailto:training@htbconsults.com">
                  Get Help <ArrowRight size={12} />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq-section" className="py-16 lg:py-24 bg-[hsl(163,36%,13%)]">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-10"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Got Questions?
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-serif font-bold text-foreground">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
              Find quick answers below. Still stuck? Send us a message and our team will help.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={3}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-xl px-5 bg-card"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Still need help CTA */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={4}
            className="mt-10 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">Still have questions? We'd love to hear from you.</p>
            <Button
              className="bg-gradient-gold hover:opacity-90 gap-2"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Mail size={15} /> Contact Our Team
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

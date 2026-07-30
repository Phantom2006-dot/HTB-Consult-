import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send, MessageSquare,
  Shield, Users, Zap, CheckCircle, User
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

const contactMethods = [
  {
    icon: Mail,
    label: "Email Support",
    value: "training@htbconsults.com",
    href: "mailto:training@htbconsults.com",
    badge: "24/7",
    sub: null,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+44 7862 056300",
    href: "tel:+447862056300",
    badge: "Mon – Fri",
    sub: "8:00 AM – 5:00 PM (GMT)",
  },
  {
    icon: MessageSquare,
    label: "Live Chat",
    value: "Chat with our support team",
    href: null,
    badge: "Mon – Fri",
    sub: "8:00 AM – 5:00 PM (GMT)",
  },
  {
    icon: MapPin,
    label: "Our Office",
    value: "London, United Kingdom",
    href: null,
    badge: "Mon – Fri",
    sub: "8:00 AM – 5:00 PM (GMT)",
  },
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
      {/* ── Main two-column section ──────────────────────────────────────────── */}
      <section
        className="relative bg-[hsl(163,40%,6%)]"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 600px 350px at 70% 0%, hsla(30,100%,50%,0.07) 0%, transparent 70%)",
            "radial-gradient(ellipse 350px 350px at 0% 60%, hsla(200,80%,40%,0.06) 0%, transparent 70%)",
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "auto, auto, 40px 40px, 40px 40px",
        }}
      >

        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-start">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <motion.div initial="hidden" animate="visible">

              {/* Hero copy */}
              <motion.p variants={fadeUp} custom={0}
                className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-4">
                We're here to help
              </motion.p>
              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl md:text-5xl font-serif font-bold text-white mb-5 leading-tight">
                Have a Question?<br />
                <span className="text-gradient-gold">We're Here for You.</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2}
                className="text-base text-white/60 max-w-lg leading-relaxed mb-10">
                Whether you need help choosing a course, accessing your account,
                or anything in between — our team is ready to assist you.
              </motion.p>

              {/* Feature pills */}
              <motion.div variants={fadeUp} custom={3}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                {[
                  { icon: Zap,    label: "Fast Support", sub: "We respond within 24 hours" },
                  { icon: Users,  label: "Real People",  sub: "Talk to our friendly support team" },
                  { icon: Shield, label: "We Care",      sub: "Your success is our priority" },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/50">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Professional Mentoring card */}
              <motion.div variants={fadeUp} custom={4}
                className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-10">
                <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">
                  Professional Mentoring
                </p>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={26} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white mb-1">
                      Advance Faster with Expert Mentoring
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Get one-to-one guidance from experienced professionals to accelerate
                      your learning, strengthen your practical skills and achieve your career goals.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5">
                  {["One-to-one sessions", "Industry practitioners", "Flexible online appointments"].map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                      <CheckCircle size={13} className="text-primary shrink-0" /> {f}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-gradient-gold hover:opacity-90 gap-2 text-sm px-5">
                    <User size={14} /> Book a Mentoring Session
                  </Button>
                  <Button variant="outline"
                    className="border-white/20 text-white bg-transparent hover:bg-white/8 gap-2 text-sm px-5">
                    <MessageSquare size={14} /> Contact Our Team
                  </Button>
                </div>
              </motion.div>

              {/* Other Ways to Reach Us */}
              <motion.div variants={fadeUp} custom={5}>
                <h3 className="text-sm font-semibold text-white/80 mb-4">Other Ways to Reach Us</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {contactMethods.map((item) => (
                    <div key={item.label}
                      className="flex flex-col gap-2 p-3 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                          <item.icon size={15} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-medium text-white/50">{item.badge}</span>
                      </div>
                      <p className="text-xs font-semibold text-white">{item.label}</p>
                      {item.href ? (
                        <a href={item.href}
                          className="text-[11px] text-white/50 hover:text-primary transition-colors leading-tight break-all">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[11px] text-white/50 leading-tight">{item.value}</p>
                      )}
                      {item.sub && (
                        <p className="text-[10px] text-white/35">{item.sub}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN — Get in Touch form ────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:sticky lg:top-24"
            >
              <div className="rounded-2xl border border-white/10 bg-[hsl(163,35%,9%)] p-6 shadow-xl">
                <h2 className="text-xl font-serif font-bold text-white mb-1">Get in Touch</h2>
                <p className="text-sm text-white/50 mb-6">
                  Fill out the form and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      className="bg-white/5 border-white/10 h-10 text-sm text-white placeholder:text-white/30 focus:border-primary/50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      maxLength={255}
                      className="bg-white/5 border-white/10 h-10 text-sm text-white placeholder:text-white/30 focus:border-primary/50"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                      Subject <span className="text-primary">*</span>
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(v) => setFormData({ ...formData, subject: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm text-white data-[placeholder]:text-white/30 focus:border-primary/50">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(163,35%,9%)] border-white/10">
                        {subjects.map((s) => (
                          <SelectItem key={s} value={s} className="text-white/80 focus:bg-primary/20 focus:text-white">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                      Message <span className="text-primary">*</span>
                    </label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={1000}
                      rows={5}
                      className="bg-white/5 border-white/10 text-sm text-white placeholder:text-white/30 focus:border-primary/50 resize-none"
                    />
                  </div>

                  {/* Privacy note */}
                  <p className="text-xs text-white/35 flex items-center gap-1.5">
                    <Shield size={11} className="text-primary/60 shrink-0" />
                    Your information is safe with us. We respect your privacy.
                  </p>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-gold hover:opacity-90 gap-2 h-11 text-sm font-semibold"
                  >
                    {sent ? (
                      <><CheckCircle size={15} /> Sent!</>
                    ) : sending ? (
                      <>Sending…</>
                    ) : (
                      <><Send size={14} /> Send Message</>
                    )}
                  </Button>
                </form>
              </div>
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
            <motion.p variants={fadeUp} custom={0}
              className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Got Questions?
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl font-serif font-bold text-foreground">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeUp} custom={2}
              className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
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

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    // Simulated send
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 80%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Get In Touch</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Contact Us
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl">
              Have a question or ready to start your training journey? We'd love to hear from you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-serif font-bold text-foreground mb-6">Send Us a Message</motion.h2>
              <motion.form variants={fadeUp} custom={1} onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                  <Input
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
                  <Textarea
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    maxLength={1000}
                    rows={5}
                    className="bg-secondary border-border"
                  />
                </div>
                <Button type="submit" disabled={sending} className="bg-gradient-gold hover:opacity-90 w-full">
                  {sending ? "Sending..." : <>Send Message <Send className="ml-2" size={16} /></>}
                </Button>
              </motion.form>
            </motion.div>

            {/* Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
              <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-serif font-bold text-foreground mb-6">Contact Information</motion.h2>
              {[
                { icon: Mail, label: "Email", value: "info@htbconsults.com" },
                { icon: Phone, label: "Phone", value: "+44 (0) 123 456 7890" },
                { icon: MapPin, label: "Address", value: "London, United Kingdom" },
              ].map((item, i) => (
                <motion.div key={item.label} variants={fadeUp} custom={i + 1}>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-serif font-bold text-secondary-foreground">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="text-sm font-medium text-secondary-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-secondary-foreground/60">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

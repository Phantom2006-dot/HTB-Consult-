import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import htbLogo from "@/assets/htb-logo.png";

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/htb-consult-ltd/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1GkHenN83W/?mibextid=wwXIfr",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/highticketboss?igsh=MTNmNTIxZmR2Y2ZrNQ%3D%3D",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311C2.567 19.483 2.293 18.216 2.231 16.85 2.173 15.584 2.161 15.204 2.161 12s.012-3.584.07-4.85C2.293 5.784 2.567 4.517 3.542 3.542 4.517 2.567 5.784 2.293 7.15 2.231 8.416 2.173 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038C23.986 15.668 24 15.259 24 12c0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Why HTB Academy", path: "/about" },
  { label: "Learning Pathways", path: "/services" },
  { label: "Courses", path: "/courses" },
  { label: "About HTB Academy", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const popularPathways = [
  "BA Foundation Bootcamp",
  "Practical BA Application & Simulation",
  "Banking BA",
  "Insurance BA",
  "Healthcare BA",
  "Warehouse & Logistics BA",
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden" style={{ background: "hsl(var(--footer-bg))" }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-60" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-5 blur-[80px]"
        style={{ background: "hsl(var(--primary))" }} />

      {/* Glow divider line */}
      <div className="glow-line" />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div>
            <Link to="/" className="inline-block mb-5">
              <img src={htbLogo} alt="HTB Consult Academy" className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Practical learning. Real projects.<br />
              Industry mentorship. Build the BA<br />
              career you want.
            </p>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/45 hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path + link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/50 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px transition-all duration-300 overflow-hidden"
                      style={{ background: "hsl(var(--primary))" }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Pathways */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">Popular Pathways</h4>
            <ul className="space-y-2.5">
              {popularPathways.map((name) => (
                <li key={name}>
                  <Link
                    to="/courses"
                    className="text-sm text-white/50 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px transition-all duration-300 overflow-hidden"
                      style={{ background: "hsl(var(--primary))" }} />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/30 transition-colors">
                  <Mail size={13} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/35 mb-0.5">Email</p>
                  <a href="mailto:academy@htbconsults.com" className="text-sm text-white/55 hover:text-primary transition-colors">
                    academy@htbconsults.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/30 transition-colors">
                  <Phone size={13} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/35 mb-0.5">Phone</p>
                  <a href="tel:+27100203066" className="text-sm text-white/55 hover:text-primary transition-colors">
                    +27 10 020 3066
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/30 transition-colors">
                  <MapPin size={13} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/35 mb-0.5">Office</p>
                  <p className="text-sm text-white/55">South Africa</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} HTB Consult Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy Policy</Link>
            <span className="text-white/15">|</span>
            <Link to="/terms" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

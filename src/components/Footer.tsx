import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import htbLogo from "@/assets/htb-logo.png";

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
    color: "hover:text-blue-400 hover:border-blue-400/50 hover:shadow-[0_0_20px_-3px_rgba(96,165,250,0.4)]",
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.732-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "hover:text-white hover:border-white/50 hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.2)]",
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311C2.567 19.483 2.293 18.216 2.231 16.85 2.173 15.584 2.161 15.204 2.161 12s.012-3.584.07-4.85C2.293 5.784 2.567 4.517 3.542 3.542 4.517 2.567 5.784 2.293 7.15 2.231 8.416 2.173 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038C23.986 15.668 24 15.259 24 12c0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    color: "hover:text-pink-400 hover:border-pink-400/50 hover:shadow-[0_0_20px_-3px_rgba(244,114,182,0.4)]",
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    color: "hover:text-blue-400 hover:border-blue-400/50 hover:shadow-[0_0_20px_-3px_rgba(96,165,250,0.4)]",
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-[hsl(163,36%,10%)] overflow-hidden">
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(163,36%,10%)]/50 to-[hsl(163,36%,8%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-primary/4 blur-[80px]" />

      {/* Glow divider line */}
      <div className="glow-line" />

      {/* Logo Section */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-14 pb-8 flex justify-center">
        <Link to="/">
          <img src={htbLogo} alt="HTB HighTicketBoss" className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <div className="relative z-10 border-t border-white/5" />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Who We Are */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Who We Are</h4>
            <p className="text-white/45 text-sm leading-relaxed mb-7">
              HTB Consult is a business consultancy focused on helping organisations grow, improve operational efficiency, and achieve long-term success through strategic advisory, practical implementation support, and professional capability development.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 transition-all duration-300 ${s.color}`}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "How It Works", path: "/services" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-white/45 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300 overflow-hidden" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-3">
              {[
                { label: "Contact Us", path: "/contact" },
                { label: "FAQ", path: "/faq" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-white/45 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300 overflow-hidden" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/45 group">
                <div className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                  <Phone size={14} className="text-primary" />
                </div>
                +44 7862056300
              </li>
              <li className="flex items-center gap-3 text-sm text-white/45 group">
                <div className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                  <Mail size={14} className="text-primary" />
                </div>
                info@htbconsults.com
              </li>
              <li className="flex items-center gap-3 text-sm text-white/45 group">
                <div className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                  <MapPin size={14} className="text-primary" />
                </div>
                London, United Kingdom
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} HTB Consult Ltd. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/25">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import htbLogo from "@/assets/htb-logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* Logo Section */}
      <div className="container mx-auto px-4 lg:px-8 pt-12 pb-8 flex justify-center">
        <Link to="/">
          <img src={htbLogo} alt="HTB HighTicketBoss" className="h-16 w-auto" />
        </Link>
      </div>

      <div className="border-t border-border" />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Who We Are */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">Who We Are</h4>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              HTB Consult is a business consultancy focused on helping organisations grow, improve operational efficiency, and achieve long-term success through strategic advisory, practical implementation support, and professional capability development.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Services", path: "/services" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">Help</h4>
            <ul className="space-y-3">
              {[
                { label: "Contact Us", path: "/contact" },
                { label: "FAQ", path: "/faq" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary shrink-0" />
                +44 7862056300
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary shrink-0" />
                info@htbconsults.com
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                London, United Kingdom
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HTB Consult Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

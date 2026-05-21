import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import htbLogo from "@/assets/htb-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Why HTB Academy", path: "/about" },
  { label: "Learning Pathways", path: "/services" },
  { label: "Courses", path: "/courses" },
  { label: "About HTB Academy", path: "/about#about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const isHome = location.pathname === "/";
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path.split("#")[0]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome || isOpen
          ? "bg-background/97 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={htbLogo} alt="HTB Consult Academy" className="h-12 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(link.path)
                    ? "text-primary"
                    : !isHome
                    ? "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
                {/* Active underline */}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" asChild size="sm" className="text-sm">
                  <Link to="/dashboard" className="flex items-center gap-1.5">
                    <GraduationCap size={15} /> Dashboard
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="text-sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className={`text-sm font-medium ${
                    !isHome ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
                  }`}
                >
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-gold hover:opacity-90 font-semibold px-5 text-sm shadow-md btn-shimmer"
                >
                  <Link to="/auth?tab=signup">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHome || isOpen ? "text-foreground" : "text-white"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="flex flex-col gap-1 py-4 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path + link.label}
                    to={link.path}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "text-primary bg-primary/8"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-3 mt-1 border-t border-border">
                  {user ? (
                    <>
                      <Button variant="ghost" asChild className="flex-1 text-sm">
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      <Button onClick={handleSignOut} variant="outline" className="flex-1 text-sm">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="flex-1 text-sm">
                        <Link to="/auth">Log In</Link>
                      </Button>
                      <Button asChild className="flex-1 text-sm bg-gradient-gold hover:opacity-90 font-semibold">
                        <Link to="/auth?tab=signup">Register</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

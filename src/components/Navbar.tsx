import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  /*
   * Colour logic:
   * – Home page at the very top  → transparent over dark hero, white text
   * – Home page scrolled         → solid dark bg (hsl(var(--background))), white text
   * – Any other page at top      → solid dark bg, white text (hero is always dark)
   * – Any other page scrolled    → solid dark bg, white text
   *
   * We NEVER use semi-transparent bg (the bleed through white sections kills contrast).
   */
  const atTop = !scrolled && !isOpen;
  const transparentBar = isHome && atTop;

  const navBg = transparentBar
    ? "bg-transparent border-b border-transparent"
    : "bg-[hsl(var(--background))] border-b border-white/10 shadow-md";

  const linkBase = "relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200";
  const linkInactive = "text-white/75 hover:text-white hover:bg-white/10";
  const linkActive   = "text-primary";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={htbLogo} alt="HTB Consult Academy" className="h-12 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`${linkBase} ${isActive(link.path) ? linkActive : linkInactive}`}
              >
                {link.label}
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
                <Button variant="ghost" asChild size="sm"
                  className="text-sm text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Link to="/dashboard" className="flex items-center gap-1.5">
                    <GraduationCap size={15} /> Dashboard
                  </Link>
                </Button>
                <Button onClick={handleSignOut} size="sm"
                  className="text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm"
                  className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button asChild size="sm"
                  className="bg-gradient-gold hover:opacity-90 font-semibold px-5 text-sm shadow-md btn-shimmer"
                >
                  <Link to="/auth?tab=signup">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors text-white"
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
              className="lg:hidden overflow-hidden border-t border-white/10 bg-[hsl(var(--background))]"
            >
              <div className="flex flex-col gap-1 py-4 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path + link.label}
                    to={link.path}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "text-primary bg-primary/10"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-3 mt-1 border-t border-white/10">
                  {user ? (
                    <>
                      <Button variant="ghost" asChild className="flex-1 text-sm text-white hover:bg-white/10">
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      <Button onClick={handleSignOut} className="flex-1 text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="flex-1 text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20">
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

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import htbLogo from "@/assets/htb-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={htbLogo} alt="HTB HighTicketBoss" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-gold hover:opacity-90">
                  <Link to="/auth?tab=signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                {user ? (
                  <>
                    <Button variant="ghost" asChild className="flex-1">
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button onClick={handleSignOut} variant="outline" className="flex-1">Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="flex-1">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild className="flex-1 bg-gradient-gold hover:opacity-90">
                      <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

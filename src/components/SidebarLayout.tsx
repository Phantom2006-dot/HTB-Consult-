import { ReactNode, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Compass, BookOpen, Bookmark, Users, LogOut, GraduationCap,
  Search, Bell, Mail, MessageSquare, Menu, User, Settings, Shield, Briefcase, Newspaper
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMentor } from "@/hooks/use-mentor-access";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackButton from "@/components/BackButton";
import ScrollToTop from "@/components/ScrollToTop";
import KeyboardShortcutHint from "@/components/KeyboardShortcutHint";

const sidebarLinks = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: GraduationCap, label: "My Learning", path: "/my-learning" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: Users, label: "Mentors", path: "/mentors" },
  { icon: Newspaper, label: "Blog", path: "/blog" },
];

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: isMentor } = useIsMentor();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[72px] bg-background border-r border-border flex flex-col items-center py-5 gap-0 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="mb-8 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <GraduationCap size={22} className="text-primary-foreground" />
        </Link>

        <nav className="flex flex-col items-center gap-0 flex-1 w-full">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 py-3 w-full transition-colors ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[9px] font-medium leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="flex flex-col items-center gap-0 mt-auto w-full">
            {isMentor && (
              <>
                <Link
                  to="/mentor-dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 w-full transition-colors ${
                    location.pathname === "/mentor-dashboard" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Briefcase size={22} strokeWidth={location.pathname === "/mentor-dashboard" ? 2.5 : 1.5} />
                  <span className="text-[9px] font-medium leading-tight">Mentor</span>
                </Link>
                <Link
                  to="/mentor/articles"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 w-full transition-colors ${
                    location.pathname.startsWith("/mentor/articles") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Newspaper size={22} strokeWidth={location.pathname.startsWith("/mentor/articles") ? 2.5 : 1.5} />
                  <span className="text-[9px] font-medium leading-tight">Articles</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 py-3 w-full transition-colors ${
                  location.pathname.startsWith("/admin") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Shield size={22} strokeWidth={location.pathname.startsWith("/admin") ? 2.5 : 1.5} />
                <span className="text-[9px] font-medium leading-tight">Admin</span>
              </Link>
            )}
            <button onClick={handleSignOut} className="flex flex-col items-center justify-center gap-1 py-3 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
              <LogOut size={22} strokeWidth={1.5} />
              <span className="text-[9px] font-medium leading-tight">Sign out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div ref={mainRef} className="flex-1 min-h-screen overflow-y-auto flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <BackButton />
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <form
                className="relative w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (globalSearch.trim()) {
                    navigate(`/explore?q=${encodeURIComponent(globalSearch.trim())}`);
                    setGlobalSearch("");
                  }
                }}
              >
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search courses or mentors..."
                  className="w-full pl-11 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-secondary-foreground placeholder:text-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/notifications" className="text-muted-foreground hover:text-foreground transition-colors">
                <Bell size={20} />
              </Link>
              <Link to="/emails" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={20} />
              </Link>
              <Link to="/messages" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare size={20} />
              </Link>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold ml-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        : avatarInitial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User size={14} /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings size={14} /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut size={14} /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <ScrollToTop scrollRef={mainRef as React.RefObject<HTMLElement>} />
        <KeyboardShortcutHint />
      </div>
    </div>
  );
};

export default SidebarLayout;

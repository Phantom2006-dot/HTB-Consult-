import { ReactNode, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Compass, BookOpen, Bookmark, Users, LogOut,
  GraduationCap, Search, Bell, Mail, MessageSquare, Menu, User,
  Settings, Shield, Briefcase, Newspaper, CalendarDays, X,
  BarChart3, HelpCircle, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMentor } from "@/hooks/use-mentor-access";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ScrollToTop from "@/components/ScrollToTop";
import KeyboardShortcutHint from "@/components/KeyboardShortcutHint";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import htbLogo from "@/assets/htb-logo.png";

const NAV_LINKS = [
  { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
  { icon: BookOpen,        label: "My Courses",      path: "/my-learning" },
  { icon: Compass,         label: "Explore",         path: "/explore" },
  { icon: GraduationCap,   label: "Courses",         path: "/courses" },
  { icon: Users,           label: "Mentors",         path: "/mentors" },
  { icon: CalendarDays,    label: "Sessions",        path: "/sessions" },
  { icon: Bookmark,        label: "Saved",           path: "/saved" },
  { icon: Newspaper,       label: "Blog",            path: "/blog" },
  { icon: BarChart3,       label: "Progress",        path: "/my-learning?tab=progress" },
  { icon: MessageSquare,   label: "Messages",        path: "/messages" },
  { icon: Settings,        label: "Settings",        path: "/settings" },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, path, isActive, badge, onClick }: NavItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all group relative ${
      isActive
        ? "bg-primary/15 text-primary border border-primary/20"
        : "text-white/55 hover:text-white hover:bg-white/6"
    }`}
  >
    <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
    <span className="truncate">{label}</span>
    {badge != null && badge > 0 && (
      <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
    {isActive && <ChevronRight size={13} className="ml-auto shrink-0 text-primary/60" />}
  </Link>
);

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: isMentor } = useIsMentor();
  const { data: unread } = useUnreadCounts();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const userRole = isMentor ? "Mentor" : isAdmin ? "Admin" : "Student";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (path: string) =>
    path.includes("?")
      ? location.pathname === path.split("?")[0] && location.search.includes(path.split("?")[1])
      : location.pathname === path;

  return (
    <div className="min-h-screen flex bg-background">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] flex flex-col transition-transform duration-300 lg:translate-x-0 border-r border-border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
              <img src={htbLogo} alt="HTB Academy" className="h-8 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1.5 font-medium">
            Mindset Before Skillset
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 scrollbar-none">
          <p className="px-6 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
            Main Menu
          </p>
          {NAV_LINKS.map((link) => (
            <NavItem
              key={link.path}
              {...link}
              isActive={isActive(link.path)}
              badge={link.path === "/messages" ? unread?.messages : link.path === "/emails" ? unread?.emails : undefined}
              onClick={() => setSidebarOpen(false)}
            />
          ))}

          {isMentor && (
            <>
              <p className="px-6 pb-2 pt-4 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Mentor
              </p>
              <NavItem icon={Briefcase} label="Mentor Dashboard" path="/mentor-dashboard" isActive={isActive("/mentor-dashboard")} onClick={() => setSidebarOpen(false)} />
              <NavItem icon={Newspaper} label="My Articles" path="/mentor/articles" isActive={location.pathname.startsWith("/mentor/articles")} onClick={() => setSidebarOpen(false)} />
            </>
          )}

          {isAdmin && (
            <>
              <p className="px-6 pb-2 pt-4 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Admin
              </p>
              <NavItem icon={Shield} label="Admin Panel" path="/admin" isActive={location.pathname.startsWith("/admin")} onClick={() => setSidebarOpen(false)} />
            </>
          )}
        </nav>

        {/* Help + Logout */}
        <div className="border-t border-border/40 p-4 space-y-1">
          <div className="rounded-xl bg-primary/8 border border-primary/15 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <HelpCircle size={14} className="text-primary" />
              <span className="text-xs font-semibold text-white">Need Help?</span>
            </div>
            <p className="text-[11px] text-white/40 leading-snug mb-2">
              Visit our support centre for guides and best practices.
            </p>
            <Link to="/contact" className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1">
              Visit Help Center <ChevronRight size={11} />
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 mx-0 w-full rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Footer brand */}
        <div className="px-5 pb-4 border-t border-border/30">
          <div className="flex items-center gap-2 py-3">
            <img src={htbLogo} alt="HTB Academy" className="h-5 w-auto opacity-30" />
          </div>
          <p className="text-[10px] text-white/20">© 2025 HTB Consult Academy. All rights reserved.</p>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div ref={mainRef} className="flex-1 min-h-screen overflow-y-auto flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-6 h-[64px] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-foreground hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            {/* Search */}
            <form
              className="hidden md:flex relative"
              onSubmit={(e) => {
                e.preventDefault();
                if (globalSearch.trim()) {
                  navigate(`/explore?q=${encodeURIComponent(globalSearch.trim())}`);
                  setGlobalSearch("");
                }
              }}
            >
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search courses, mentors..."
                className="w-64 pl-9 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              <Bell size={18} />
              {(unread?.notifications ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
              )}
            </Link>
            <Link to="/emails" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              <Mail size={18} />
              {(unread?.emails ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
              )}
            </Link>
            <Link to="/messages" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              <MessageSquare size={18} />
              {(unread?.messages ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
              )}
            </Link>

            <div className="w-px h-6 bg-border mx-1" />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground">{userRole}</p>
                    </div>
                    <ChevronRight size={13} className="hidden lg:block text-muted-foreground group-hover:text-foreground rotate-90 transition-transform" />
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
        </header>

        <main className="flex-1">{children}</main>
        <ScrollToTop scrollRef={mainRef as React.RefObject<HTMLElement>} />
        <KeyboardShortcutHint />
        <WhatsAppButton />
      </div>
    </div>
  );
};

export default SidebarLayout;

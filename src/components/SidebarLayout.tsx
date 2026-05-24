import { ReactNode, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, GraduationCap, Route, Video,
  ClipboardList, FolderOpen, Users, TrendingUp, Award,
  Globe, HelpCircle, Compass, Bookmark, MessageSquare,
  Settings, Shield, Briefcase, Newspaper, LogOut,
  Search, Bell, Mail, Menu, X, Sun, Moon,
  ChevronDown, ChevronRight, User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMentor } from "@/hooks/use-mentor-access";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import htbLogo from "@/assets/htb-logo.png";

/* ── Nav config ──────────────────────────────────────────────────────────── */
const PRIMARY_NAV = [
  { icon: LayoutDashboard, label: "Dashboard",         path: "/dashboard" },
  { icon: BookOpen,        label: "My Learning",       path: "/my-learning" },
  { icon: GraduationCap,   label: "Courses",           path: "/courses" },
  { icon: Route,           label: "Learning Pathways", path: "/services" },
  { icon: Video,           label: "Live Sessions",     path: "/sessions" },
  { icon: ClipboardList,   label: "Assignments",       path: "/my-learning" },
  { icon: FolderOpen,      label: "Resources",         path: "/blog" },
  { icon: Users,           label: "Mentorship",        path: "/mentors" },
  { icon: TrendingUp,      label: "Progress",          path: "/my-learning" },
  { icon: Award,           label: "Certificates",      path: "/my-learning" },
  { icon: Globe,           label: "Community",         path: "/blog" },
  { icon: HelpCircle,      label: "Support",           path: "/contact" },
];

const MORE_NAV = [
  { icon: Compass,      label: "Explore",  path: "/explore" },
  { icon: Bookmark,     label: "Saved",    path: "/saved" },
  { icon: MessageSquare,label: "Messages", path: "/messages", badge: true },
  { icon: Settings,     label: "Settings", path: "/settings" },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
  isDark: boolean;
}

const NavItem = ({ icon: Icon, label, path, isActive, badge, onClick, isDark }: NavItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all group relative ${
      isActive
        ? "bg-primary/15 text-primary"
        : "text-white/50 hover:text-white/85 hover:bg-white/6"
    }`}
  >
    <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
    <span className="truncate">{label}</span>
    {badge != null && (badge as number) > 0 && (
      <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 shrink-0">
        {(badge as number) > 9 ? "9+" : badge}
      </span>
    )}
    {isActive && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l-full bg-primary" />
    )}
  </Link>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { mode, toggleMode, isDark } = useTheme();
  const { data: isAdmin } = useIsAdmin();
  const { data: isMentor } = useIsMentor();
  const { data: unread } = useUnreadCounts();

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const userRole = isMentor ? "Mentor" : isAdmin ? "Admin" : "Learner";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (path: string) =>
    path.includes("?")
      ? location.pathname === path.split("?")[0] && location.search.includes(path.split("?")[1])
      : location.pathname === path;

  /* Only the first matching nav item for the current path gets highlighted */
  const primaryMatch = PRIMARY_NAV.find(n => n.path === location.pathname);

  return (
    <div
      data-mode={mode}
      className="flex h-screen overflow-hidden bg-background"
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-[220px] flex flex-col
          border-r border-white/8 transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/8">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
              <img src={htbLogo} alt="HTB Academy" className="h-7 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/40 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
          <p className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1.5 font-medium">
            Mindset Before Skillset
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 scrollbar-none">
          <p className="px-5 pb-1.5 pt-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">
            Main Menu
          </p>

          {PRIMARY_NAV.map((link) => (
            <NavItem
              key={`${link.path}-${link.label}`}
              {...link}
              isActive={isActive(link.path) && link.label === (primaryMatch?.label ?? link.label)}
              onClick={() => setSidebarOpen(false)}
              isDark={isDark}
            />
          ))}

          {/* More section */}
          <p className="px-5 pb-1.5 pt-3 text-[9px] font-bold text-white/20 uppercase tracking-widest">
            More
          </p>
          {MORE_NAV.map((link) => (
            <NavItem
              key={link.path}
              {...link}
              isActive={isActive(link.path)}
              badge={link.badge ? (unread?.messages ?? 0) : undefined}
              onClick={() => setSidebarOpen(false)}
              isDark={isDark}
            />
          ))}

          {/* Mentor section */}
          {isMentor && (
            <>
              <p className="px-5 pb-1.5 pt-3 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                Mentor
              </p>
              <NavItem icon={Briefcase} label="Mentor Dashboard" path="/mentor-dashboard"
                isActive={isActive("/mentor-dashboard")} onClick={() => setSidebarOpen(false)} isDark={isDark} />
              <NavItem icon={Newspaper} label="My Articles" path="/mentor/articles"
                isActive={location.pathname.startsWith("/mentor/articles")} onClick={() => setSidebarOpen(false)} isDark={isDark} />
            </>
          )}

          {/* Admin section */}
          {isAdmin && (
            <>
              <p className="px-5 pb-1.5 pt-3 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                Admin
              </p>
              <NavItem icon={Shield} label="Admin Panel" path="/admin"
                isActive={location.pathname.startsWith("/admin")} onClick={() => setSidebarOpen(false)} isDark={isDark} />
            </>
          )}
        </nav>

        {/* Bottom: Help + Sign out */}
        <div className="border-t border-white/8 p-3 space-y-1">
          <div className="rounded-xl bg-primary/8 border border-primary/15 p-3 mb-2">
            <p className="text-xs font-semibold text-white mb-0.5">Need Help?</p>
            <p className="text-[10px] text-white/40 leading-snug mb-1.5">
              Visit our support centre for guides.
            </p>
            <Link to="/contact" className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1">
              Help Center <ChevronRight size={10} />
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MAIN AREA                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 shrink-0 bg-card border-b border-border flex items-center px-4 gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-foreground/60 hover:text-foreground transition-colors p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <form
            className="flex-1 max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (globalSearch.trim()) {
                navigate(`/explore?q=${encodeURIComponent(globalSearch.trim())}`);
                setGlobalSearch("");
              }
            }}
          >
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
              <Search size={13} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search courses, modules, resources..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell size={17} />
              {(unread?.notifications ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-card" />
              )}
            </Link>

            {/* Emails */}
            <Link to="/emails" className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:block">
              <Mail size={17} />
              {(unread?.emails ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-card" />
              )}
            </Link>

            {/* Messages */}
            <Link to="/messages" className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:block">
              <MessageSquare size={17} />
              {(unread?.messages ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-card" />
              )}
            </Link>

            <div className="w-px h-5 bg-border mx-1" />

            {/* User dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight max-w-[80px] truncate">{displayName.split(" ")[0]}</p>
                      <p className="text-[9px] text-muted-foreground capitalize">{userRole}</p>
                    </div>
                    <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User size={13} /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings size={13} /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive flex items-center gap-2 cursor-pointer">
                    <LogOut size={13} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main scrollable content */}
        <main ref={mainRef} className="flex-1 overflow-auto bg-background text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;

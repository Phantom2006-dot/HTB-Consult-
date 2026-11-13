import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, FolderOpen,
  ChevronLeft, Shield, UserCog, CalendarDays, Menu, X, Newspaper, FileText, Award, CreditCard, ClipboardList
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMobile } from "@/hooks/use-mobile";

const adminLinks = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: FileText, label: "Resources", path: "/admin/resources" },
  { icon: Users, label: "Mentors", path: "/admin/mentors" },
  { icon: UserCog, label: "Users", path: "/admin/users" },
  { icon: CalendarDays, label: "Enrollments", path: "/admin/enrollments" },
  { icon: Award, label: "Certificates", path: "/admin/certificates" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: ClipboardList, label: "Cybersecurity Interests", path: "/admin/cybersecurity-interests" },
  { icon: Newspaper, label: "Articles", path: "/admin/articles" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield size={48} className="mx-auto text-destructive" />
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You don't have admin privileges.</p>
          <Link to="/dashboard" className="text-primary hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={14} /> Back to Platform
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">HTB Admin</p>
            <p className="text-[10px] text-muted-foreground">Management Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {adminLinks.map((link) => {
          const isActive = location.pathname === link.path ||
            (link.path !== "/admin" && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <link.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground">Signed in as</p>
        <p className="text-xs text-foreground truncate">{user.email}</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - desktop static, mobile slide-in */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col shrink-0 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Mobile close button */}
        <button className="lg:hidden absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu size={22} />
          </button>
          <p className="text-sm font-bold text-foreground">HTB Admin</p>
        </header>
        <main className="p-4 lg:p-8 max-w-6xl flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

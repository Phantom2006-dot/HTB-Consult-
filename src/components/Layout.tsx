import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SidebarLayout from "./SidebarLayout";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <SidebarLayout>
        <div className="flex flex-col min-h-[calc(100vh-65px)]">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </SidebarLayout>
    );
  }

  return <PublicLayout>{children}</PublicLayout>;
};

export default Layout;

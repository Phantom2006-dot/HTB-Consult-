import { ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-[calc(100vh-65px)]">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </SidebarLayout>
  );
};

export default Layout;

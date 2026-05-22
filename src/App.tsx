import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePageTracking } from "@/hooks/use-page-tracking";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Services from "./pages/Services";
import About from "./pages/About";
import AboutHTB from "./pages/AboutHTB";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Emails from "./pages/Emails";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import CourseDetail from "./pages/CourseDetail";
import MentorProfile from "./pages/MentorProfile";
import MentorDashboard from "./pages/MentorDashboard";
import MyLearning from "./pages/MyLearning";
import Onboarding from "./pages/Onboarding";
import Mentors from "./pages/Mentors";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleEditor from "./pages/admin/AdminArticleEditor";
import AdminCourseResources from "./pages/admin/AdminCourseResources";
import AdminMentorDetail from "./pages/admin/AdminMentorDetail";
import Blog from "./pages/Blog";
import ArticleReader from "./pages/ArticleReader";
import MentorArticles from "./pages/MentorArticles";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

function AppRoutes() {
  usePageTracking();
  return (
    <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/about-htb" element={<AboutHTB />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/courses/:courseId/resources" element={<AdminCourseResources />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/mentors" element={<AdminMentors />} />
            <Route path="/admin/mentors/:id" element={<AdminMentorDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/articles/:id" element={<AdminArticleEditor />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<ArticleReader />} />
            <Route path="/mentor/articles" element={<MentorArticles />} />
            <Route path="/mentor/articles/:id" element={<AdminArticleEditor />} />
            <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

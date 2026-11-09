import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { usePageTracking } from "@/hooks/use-page-tracking";
import SeoHead from "@/components/SeoHead";

const Index = lazy(() => import("./pages/Index"));
const Courses = lazy(() => import("./pages/Courses"));
const Explore = lazy(() => import("./pages/Explore"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const AboutHTB = lazy(() => import("./pages/AboutHTB"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Emails = lazy(() => import("./pages/Emails"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Saved = lazy(() => import("./pages/Saved"));
const Settings = lazy(() => import("./pages/Settings"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const MyLearning = lazy(() => import("./pages/MyLearning"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Mentors = lazy(() => import("./pages/Mentors"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminMentors = lazy(() => import("./pages/admin/AdminMentors"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminArticleEditor = lazy(() => import("./pages/admin/AdminArticleEditor"));
const AdminCourseResources = lazy(() => import("./pages/admin/AdminCourseResources"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources"));
const AdminCertificates = lazy(() => import("./pages/admin/AdminCertificates"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminMentorDetail = lazy(() => import("./pages/admin/AdminMentorDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const ArticleReader = lazy(() => import("./pages/ArticleReader"));
const MentorArticles = lazy(() => import("./pages/MentorArticles"));
const Sessions = lazy(() => import("./pages/Sessions"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Cybersecurity = lazy(() => import("./pages/Cybersecurity"));

const queryClient = new QueryClient();

function AppRoutes() {
  usePageTracking();
  return (
    <>
      <SeoHead />
      <Suspense fallback={<div role="status" aria-live="polite" className="p-8 text-center text-sm text-muted-foreground">Loading Academy page…</div>}>
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
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/courses/:courseId/resources" element={<AdminCourseResources />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/mentors" element={<AdminMentors />} />
          <Route path="/admin/mentors/:id" element={<AdminMentorDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/articles/:id" element={<AdminArticleEditor />} />
          <Route path="/mentor/articles" element={<MentorArticles />} />
          <Route path="/mentor/articles/:id" element={<AdminArticleEditor />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<ArticleReader />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/cybersecurity" element={<Cybersecurity />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

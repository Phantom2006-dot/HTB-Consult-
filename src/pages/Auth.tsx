import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import htbLogo from "@/assets/htb-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : searchParams.get("tab") === "forgot" ? "forgot" : "login";
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [loginMode, setLoginMode] = useState<"student" | "mentor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate(loginMode === "mentor" ? "/mentor-dashboard" : "/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirm) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (signupData.password !== signupData.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (signupData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: { full_name: signupData.name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a confirmation link to verify your account." });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset link sent", description: "Check your email for the password reset link." });
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-green" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />

      <motion.div initial="hidden" animate="visible" className="relative z-10 w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={htbLogo} alt="HTB HighTicketBoss" className="h-12 w-auto" />
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} custom={1}>
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              {tab !== "forgot" && (
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setTab("login")}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      tab === "login" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setTab("signup")}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      tab === "signup" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {tab === "forgot" && (
                <button onClick={() => setTab("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back to Login
                </button>
              )}

              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                  <p className="text-sm text-muted-foreground mb-4">Sign in to access your account.</p>

                  {/* Student / Mentor toggle */}
                  <div className="flex rounded-lg bg-muted p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setLoginMode("student")}
                      className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                        loginMode === "student"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMode("mentor")}
                      className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                        loginMode === "mentor"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Mentor / Admin
                    </button>
                  </div>

                  {loginMode === "mentor" && (
                    <p className="text-xs text-primary bg-primary/10 rounded-md px-3 py-2">
                      Mentor accounts have access to both the Mentor Dashboard and Admin Panel.
                    </p>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input type="email" placeholder="your@email.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="bg-secondary border-border" maxLength={255} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="bg-secondary border-border pr-10" maxLength={128} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={() => setTab("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-gold hover:opacity-90">
                    {loading ? "Signing in..." : loginMode === "mentor" ? "Sign In as Mentor" : "Sign In"}
                  </Button>
                </form>
              )}

              {tab === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Create Account</h2>
                  <p className="text-sm text-muted-foreground mb-4">Join HTB Consults and start your learning journey.</p>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                    <Input placeholder="Your full name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} className="bg-secondary border-border" maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input type="email" placeholder="your@email.com" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} className="bg-secondary border-border" maxLength={255} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} className="bg-secondary border-border pr-10" maxLength={128} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                    <Input type="password" placeholder="Confirm your password" value={signupData.confirm} onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })} className="bg-secondary border-border" maxLength={128} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-gold hover:opacity-90">
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              )}

              {tab === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-4">Enter your email and we'll send you a reset link.</p>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input type="email" placeholder="your@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="bg-secondary border-border" maxLength={255} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-gold hover:opacity-90">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.p variants={fadeUp} custom={2} className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary transition-colors">← Back to Home</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;

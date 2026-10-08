import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, ArrowLeft, Mail, RefreshCw,
  BookOpen, Users, Target, TrendingUp, CheckCircle2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import htbLogo from "@/assets/htb-logo.webp";
import { useAuth, setToken } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const features = [
  { icon: BookOpen,   text: "Practical & Hands-on Learning",       sub: "Real projects, case studies and simulations." },
  { icon: Users,      text: "Industry Expert Mentorship",          sub: "Learn from experienced Business Analysts." },
  { icon: Target,     text: "Structured Learning Pathways",        sub: "Foundation to industry specialisation." },
  { icon: TrendingUp, text: "Career Growth Focused",               sub: "Build skills and confidence to get hired." },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, setUser } = useAuth();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : searchParams.get("tab") === "forgot" ? "forgot" : "login";
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [loginMode, setLoginMode] = useState<"student" | "mentor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signupRole, setSignupRole] = useState<"student" | "mentor">("student");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setUnverifiedEmail("");
    try {
      const result = await api.post<{ token: string; user: any }>("/api/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });
      setToken(result.token);
      setUser(result.user);
      toast({ title: "Welcome back!" });
      navigate(loginMode === "mentor" ? "/mentor-dashboard" : "/dashboard");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("verify your email")) {
        setUnverifiedEmail(loginData.email);
      } else {
        toast({ title: "Login failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
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
    try {
      await api.post<{ requiresVerification: boolean; message: string }>("/api/auth/register", {
        email: signupData.email,
        password: signupData.password,
        full_name: signupData.name,
        role: signupRole,
      });
      setVerificationEmail(signupData.email);
      setVerificationSent(true);
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col relative overflow-hidden"
        style={{ background: "hsl(var(--hero-gradient-from))" }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-56 h-56 rounded-full bg-primary/6 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12 shrink-0">
            <img src={htbLogo} alt="HTB Consult Academy" className="h-14 w-auto" />
          </Link>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary/80 uppercase tracking-widest font-medium">Join HTB Academy</span>
            </div>
            <h1 className="text-3xl xl:text-[2.5rem] font-serif font-bold text-white leading-[1.12] mb-4 tracking-tight">
              Start Your Journey to Becoming an{" "}
              <span className="text-gradient-gold">Industry-Ready Business Analyst</span>
            </h1>
            <p className="text-sm text-white/55 leading-relaxed mb-10 max-w-sm">
              Create your account to access world-class BA training, practical simulations and expert mentorship.
            </p>

            {/* Feature list */}
            <div className="space-y-5 mb-10">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.text}</p>
                      <p className="text-xs text-white/45 mt-0.5">{f.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Testimonial */}
            <div className="glass rounded-xl p-5 border border-white/8">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.376 2.452a1 1 0 00-.363 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.957 2.872c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.363-1.118L2.052 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69L9.049 2.927z" /></svg>
                ))}
              </div>
              <p className="text-sm text-white/70 italic leading-relaxed mb-3">
                "HTB Academy gave me the practical skills and confidence I needed to transition into a BA role."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">A</div>
                <div>
                  <p className="text-xs font-semibold text-white">Aisha M.</p>
                  <p className="text-[11px] text-white/40">Junior Business Analyst</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back link */}
          <Link to="/" className="mt-8 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors shrink-0">
            <ArrowLeft size={13} /> Back to Home
          </Link>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden px-4 py-10 lg:py-0">
        {/* Subtle pattern on white/dark sections — matches homepage */}
        <div className="absolute inset-0 grid-pattern opacity-[0.06] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <Link to="/">
            <img src={htbLogo} alt="HTB Consult Academy" className="h-10 w-auto mb-2" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-[440px]"
        >
          {/* Card */}
          <motion.div
            variants={fadeUp} custom={0}
            className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Tab bar — only for login/signup */}
            {tab !== "forgot" && (
              <div className="flex border-b border-border">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 text-sm font-semibold py-4 transition-all border-b-2 -mb-px ${
                    tab === "login"
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setTab("signup")}
                  className={`flex-1 text-sm font-semibold py-4 transition-all border-b-2 -mb-px ${
                    tab === "signup"
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="p-7 lg:p-8">

              {/* ── FORGOT PASSWORD ── */}
              {tab === "forgot" && (
                <>
                  <button
                    onClick={() => setTab("login")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft size={15} /> Back to Login
                  </button>

                  {forgotSent ? (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center py-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="text-primary" size={28} />
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                      <p className="text-sm text-muted-foreground mb-2">
                        If <strong className="text-foreground">{forgotEmail}</strong> is registered, a reset link has been sent.
                      </p>
                      <p className="text-xs text-muted-foreground mb-6">The link expires in 1 hour. Check your spam folder.</p>
                      <button type="button" onClick={() => { setForgotSent(false); setTab("login"); }} className="text-sm text-primary hover:underline font-medium">
                        Back to Login
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleForgot} className="space-y-5">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Reset Password</h2>
                        <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                        <Input
                          type="email" placeholder="your@email.com"
                          value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                          className="bg-muted border-border h-11" maxLength={255} autoFocus
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer">
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  )}
                </>
              )}

              {/* ── LOGIN ── */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="mb-5">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground">Sign in to continue your learning journey.</p>
                  </div>

                  {unverifiedEmail && (
                    <div className="bg-primary/10 border border-primary/25 rounded-xl px-4 py-3 text-sm">
                      <p className="text-foreground font-semibold mb-1">Email not verified</p>
                      <p className="text-muted-foreground text-xs mb-2">
                        Please verify <strong>{unverifiedEmail}</strong> before logging in.
                      </p>
                      <Link to="/verify-email" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                        <RefreshCw size={11} /> Resend verification email
                      </Link>
                    </div>
                  )}

                  {/* Student / Mentor toggle */}
                  <div className="flex rounded-xl bg-muted p-1 gap-1">
                    {(["student", "mentor"] as const).map((m) => (
                      <button
                        key={m} type="button" onClick={() => setLoginMode(m)}
                        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all capitalize ${
                          loginMode === m
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m === "mentor" ? "Mentor / Admin" : "Student"}
                      </button>
                    ))}
                  </div>

                  {loginMode === "mentor" && (
                    <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 border border-primary/15">
                      Mentor accounts have access to both the Mentor Dashboard and Admin Panel.
                    </p>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                    <Input
                      type="email" placeholder="your@email.com"
                      value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="bg-muted border-border h-11" maxLength={255}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <button type="button" onClick={() => setTab("forgot")} className="text-xs text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="bg-muted border-border h-11 pr-11" maxLength={128}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer mt-2">
                    {loading ? "Signing in..." : loginMode === "mentor" ? "Sign In as Mentor" : "Sign In"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-1">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setTab("signup")} className="text-primary font-semibold hover:underline">
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* ── SIGN UP — verification sent ── */}
              {tab === "signup" && verificationSent && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                    <Mail className="text-primary" size={28} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    We've sent a verification link to <strong className="text-foreground">{verificationEmail}</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Click the link to activate your account. It expires in 24 hours. Check your spam folder if needed.
                  </p>
                  <button type="button" onClick={() => { setVerificationSent(false); setTab("login"); }}
                    className="text-sm text-primary hover:underline font-medium">
                    Back to Login
                  </button>
                </motion.div>
              )}

              {/* ── SIGN UP — form ── */}
              {tab === "signup" && !verificationSent && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="mb-5">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Create Your Account</h2>
                    <p className="text-sm text-muted-foreground">Join HTB Consults and start your learning journey today.</p>
                  </div>

                  {/* Role selector */}
                  <div className="flex rounded-xl bg-muted p-1 gap-1">
                    {(["student", "mentor"] as const).map((r) => (
                      <button
                        key={r} type="button" onClick={() => setSignupRole(r)}
                        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all capitalize ${
                          signupRole === r
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {signupRole === "mentor" && (
                    <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 border border-primary/15">
                      You'll be registered as a mentor. Your profile will need admin approval before students can book you.
                    </p>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <Input
                      placeholder="Your full name"
                      value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="bg-muted border-border h-11" maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                    <Input
                      type="email" placeholder="your@email.com"
                      value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="bg-muted border-border h-11" maxLength={255}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                        value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="bg-muted border-border h-11 pr-11" maxLength={128}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                    <Input
                      type="password" placeholder="Confirm your password"
                      value={signupData.confirm} onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })}
                      className="bg-muted border-border h-11" maxLength={128}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer mt-2">
                    {loading ? "Creating account..." : signupRole === "mentor" ? "Register as Mentor" : "Create Account"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-primary font-semibold hover:underline">
                      Log in
                    </button>
                  </p>
                </form>
              )}

            </div>
          </motion.div>

          {/* Mobile back link */}
          <p className="lg:hidden text-center mt-5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors flex items-center justify-center gap-1">
              <ArrowLeft size={13} /> Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

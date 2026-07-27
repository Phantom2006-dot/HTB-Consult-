import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import htbLogo from "@/assets/htb-logo.png";
import { api } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: any) {
      const msg: string = err.message || "Something went wrong";
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        setTokenError(true);
      } else {
        toast({ title: "Reset failed", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-green" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />

      <motion.div initial="hidden" animate="visible" className="relative z-10 w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={htbLogo} alt="HTB HighTicketBoss" className="h-16 w-auto" />
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} custom={1}>
          <Card className="bg-card border-border">
            <CardContent className="p-8">

              {tokenError && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="text-destructive" size={32} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Link Invalid or Expired</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    This password reset link is invalid or has expired. Please request a new one — links expire after 1 hour.
                  </p>
                  <Button asChild className="w-full bg-gradient-gold hover:opacity-90">
                    <Link to="/auth?tab=forgot">Request a New Link</Link>
                  </Button>
                </div>
              )}

              {done && !tokenError && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-primary" size={32} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Password Updated</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your password has been changed successfully. You can now sign in with your new password.
                  </p>
                  <Button asChild className="w-full bg-gradient-gold hover:opacity-90" onClick={() => navigate("/auth")}>
                    <Link to="/auth">Go to Login</Link>
                  </Button>
                </div>
              )}

              {!done && !tokenError && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Set New Password</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a strong password for your HTB Consult Academy account.
                  </p>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
                        maxLength={128}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                      maxLength={128}
                    />
                  </div>

                  {password && confirm && password !== confirm && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-gradient-gold hover:opacity-90">
                    {loading ? "Updating password..." : "Update Password"}
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

export default ResetPassword;

import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import { api } from "@/lib/api";
import { useAuth, setToken } from "@/contexts/AuthContext";
import htbLogo from "@/assets/htb-logo.png";

type Status = "verifying" | "success" | "error" | "expired" | "resend";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "resend");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.get<{ message: string; token?: string; user?: any }>(`/api/auth/verify-email?token=${token}`)
      .then((result) => {
        setMessage(result.message);
        if (result.token && result.user) {
          setToken(result.token);
          setUser(result.user);
          setStatus("success");
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setStatus("success");
        }
      })
      .catch((err: any) => {
        setMessage(err.message || "Verification failed.");
        if (err.message?.toLowerCase().includes("expired")) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await api.post("/api/auth/resend-verification", { email: resendEmail });
      setResendSent(true);
    } catch (err: any) {
      setMessage(err.message || "Failed to resend email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
          <Link to="/">
            <img src={htbLogo} alt="HTB Consult Academy" className="h-10 w-auto mx-auto mb-6" />
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={1}
          className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg"
        >
          {status === "verifying" && (
            <>
              <Loader2 className="mx-auto mb-4 text-primary animate-spin" size={48} />
              <h1 className="text-xl font-serif font-normal text-foreground mb-2">Verifying your email…</h1>
              <p className="text-sm text-muted-foreground">Just a moment please.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto mb-4 text-primary" size={48} />
              <h1 className="text-xl font-serif font-normal text-foreground mb-2">Email Verified!</h1>
              <p className="text-sm text-muted-foreground mb-6">{message || "Your account is now active. Redirecting you to your dashboard…"}</p>
              <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold w-full">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}

          {(status === "error" || status === "expired") && (
            <>
              <XCircle className="mx-auto mb-4 text-destructive" size={48} />
              <h1 className="text-xl font-serif font-normal text-foreground mb-2">
                {status === "expired" ? "Link Expired" : "Verification Failed"}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={() => setStatus("resend")}
              >
                <RefreshCw size={15} className="mr-2" /> Request a new link
              </Button>
              <Button asChild variant="ghost" className="w-full text-muted-foreground">
                <Link to="/auth">Back to Login</Link>
              </Button>
            </>
          )}

          {status === "resend" && (
            <>
              {resendSent ? (
                <>
                  <Mail className="mx-auto mb-4 text-primary" size={48} />
                  <h1 className="text-xl font-serif font-normal text-foreground mb-2">Check your inbox</h1>
                  <p className="text-sm text-muted-foreground mb-6">
                    We've sent a new verification link to <strong className="text-foreground">{resendEmail}</strong>. It expires in 24 hours.
                  </p>
                  <Button asChild variant="ghost" className="w-full text-muted-foreground">
                    <Link to="/auth">Back to Login</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Mail className="mx-auto mb-4 text-primary" size={48} />
                  <h1 className="text-xl font-serif font-normal text-foreground mb-2">Resend Verification Email</h1>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your email address and we'll send you a new verification link.
                  </p>
                  {message && (
                    <p className="text-sm text-destructive mb-4">{message}</p>
                  )}
                  <form onSubmit={handleResend} className="space-y-3 text-left">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                    >
                      {resendLoading ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
                      Send Verification Link
                    </Button>
                  </form>
                  <Button asChild variant="ghost" className="w-full mt-3 text-muted-foreground">
                    <Link to="/auth">Back to Login</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const session_id = searchParams.get("session_id");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!session_id) { setStatus("error"); setErrorMsg("No session ID provided."); return; }

    api.post<{ success: boolean; course_id: string }>(
      "/api/payments/verify-session",
      { session_id }
    )
      .then(data => {
        setCourseId(data.course_id);
        setStatus("success");
      })
      .catch(err => {
        setErrorMsg(err.message || "Payment verification failed.");
        setStatus("error");
      });
  }, [authLoading, user, session_id, navigate]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-md p-8 text-center space-y-5">

          {status === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
              <p className="font-semibold text-foreground text-lg">Confirming your payment…</p>
              <p className="text-sm text-muted-foreground">Please wait, this only takes a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-foreground text-xl">Payment Successful! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're now enrolled. A notification has been sent to you.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {courseId && (
                  <Button
                    className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                    onClick={() => navigate(`/course/${courseId}`)}
                  >
                    Start Learning →
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/my-learning")}>
                  Go to My Learning
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center mx-auto">
                <XCircle size={28} className="text-destructive" />
              </div>
              <div>
                <p className="font-bold text-foreground text-xl">Something went wrong</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                If you were charged, please{" "}
                <Link to="/contact" className="text-primary underline">contact support</Link>{" "}
                with your Stripe receipt and we'll sort it out.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/courses")}>
                Back to Courses
              </Button>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;

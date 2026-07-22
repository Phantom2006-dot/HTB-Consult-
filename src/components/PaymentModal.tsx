import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Shield, Loader2, AlertCircle, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: {
    id: string;
    title: string;
    price: number;
    thumbnail_url?: string;
    category?: string;
  };
}

const PaymentModal = ({ open, onClose, course }: PaymentModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"confirm" | "redirecting" | "error">("confirm");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) { setStep("confirm"); setErrorMsg(""); }
  }, [open]);

  const handlePay = async () => {
    if (!user) return;
    setStep("redirecting");
    setErrorMsg("");

    try {
      const { url } = await api.post<{ url: string; session_id: string }>(
        "/api/payments/create-checkout-session",
        { course_id: course.id }
      );
      if (url) {
        window.location.href = url;
      } else {
        setErrorMsg("No checkout URL returned from the server. Please try again.");
        setStep("error");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Failed to start checkout. Please try again.";
      setErrorMsg(msg);
      setStep("error");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => step !== "redirecting" && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <CreditCard size={16} className="text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">Complete Enrollment</span>
                </div>
                {step !== "redirecting" && (
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors border border-border"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-5">

                {/* Confirm step */}
                {(step === "confirm" || step === "error") && (
                  <div className="space-y-5">

                    {/* Course info */}
                    <div className="flex gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt="" className="w-14 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-12 rounded-lg bg-primary/10 shrink-0 flex items-center justify-center">
                          <CreditCard size={18} className="text-primary/40" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                        <p className="text-sm font-semibold text-foreground leading-snug truncate">{course.title}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Course fee</span>
                        <span className="text-xl font-bold text-primary">£{course.price.toLocaleString()} GBP</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        You'll be redirected to Stripe's secure checkout to complete payment.
                      </p>
                    </div>

                    {/* Error */}
                    {step === "error" && errorMsg && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/25">
                        <AlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
                      </div>
                    )}

                    <Button
                      onClick={handlePay}
                      className="w-full bg-gradient-gold hover:opacity-90 font-semibold text-base py-5 btn-shimmer gap-2"
                      size="lg"
                    >
                      <CreditCard size={16} />
                      Pay £{course.price.toLocaleString()} — Checkout with Stripe
                      <ExternalLink size={14} className="ml-1 opacity-70" />
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Shield size={11} />
                      <span>Secured by Stripe · 256-bit SSL encryption</span>
                    </div>
                  </div>
                )}

                {/* Redirecting */}
                {step === "redirecting" && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Loader2 size={28} className="text-primary animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Redirecting to Stripe…</p>
                      <p className="text-sm text-muted-foreground mt-1">Please do not close this window</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

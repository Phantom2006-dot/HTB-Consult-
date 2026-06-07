import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Shield, CheckCircle2, Loader2,
  Globe, ChevronDown, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

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

const CURRENCIES = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
];

// Approximate exchange rates from GBP (updated periodically)
const GBP_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  NGN: 2050,
  ZAR: 23.8,
  KES: 163,
  GHS: 19.5,
};

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => { openIframe: () => void };
    };
  }
}

const PaymentModal = ({ open, onClose, onSuccess, course }: PaymentModalProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState<"select" | "processing" | "success" | "error">("select");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Convert price from GBP to selected currency
  const convertedPrice = Math.round(course.price * GBP_RATES[currency.code]);

  // Load Paystack inline script
  useEffect(() => {
    if (!open) return;
    if (document.getElementById("paystack-script")) { setScriptLoaded(true); return; }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setErrorMsg("Failed to load payment gateway. Please refresh and try again.");
    document.body.appendChild(script);
  }, [open]);

  // Reset state on open
  useEffect(() => {
    if (open) { setStep("select"); setErrorMsg(""); }
  }, [open]);

  const handlePay = async () => {
    if (!user || !scriptLoaded) return;
    setStep("processing");
    setErrorMsg("");

    try {
      // Create payment record and get a unique reference
      const { reference } = await api.post<{ reference: string; payment_id: string }>(
        "/api/payments/initiate",
        { course_id: course.id, amount: convertedPrice, currency: currency.code }
      );

      // Paystack amount must be in the smallest currency unit (kobo, cents, pesewas…)
      const paystackAmount = convertedPrice * 100;

      // Launch Paystack popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: paystackAmount,
        currency: currency.code,
        ref: reference,
        metadata: {
          course_id: course.id,
          user_id: user.id,
          custom_fields: [
            {
              display_name: "Course",
              variable_name: "course_title",
              value: course.title,
            },
          ],
        },
        callback: async (response: { reference: string }) => {
          setStep("processing");
          try {
            await api.post("/api/payments/verify", { reference: response.reference });
            qc.invalidateQueries({ queryKey: ["enrollments"] });
            qc.invalidateQueries({ queryKey: ["my-certificates"] });
            setStep("success");
          } catch (err: any) {
            setErrorMsg(err.message || "Payment verification failed. Please contact support.");
            setStep("error");
          }
        },
        onClose: () => {
          // Only revert to "select" if we haven't already moved to success/error
          setStep(s => s === "processing" ? "select" : s);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start payment. Please try again.");
      setStep("error");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => step !== "processing" && onClose()}
          />

          {/* Modal */}
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
                {step !== "processing" && (
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors border border-border hover:border-foreground/20"
                    title="Close"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-5">

                {/* ── Select currency + confirm ── */}
                {(step === "select" || step === "error") && (
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

                    {/* Currency selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <Globe size={12} /> Pay in your currency
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setCurrencyOpen(v => !v)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-background border border-border hover:border-primary/40 transition-colors text-sm"
                        >
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <span className="text-lg">{currency.symbol}</span>
                            {currency.name} ({currency.code})
                          </span>
                          <ChevronDown size={15} className={`text-muted-foreground transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {currencyOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                            >
                              {CURRENCIES.map((c) => (
                                <button
                                  key={c.code}
                                  onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors
                                    ${c.code === currency.code ? "bg-primary/8 text-primary font-medium" : "text-foreground"}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base w-5">{c.symbol}</span>
                                    {c.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{c.code}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Amount summary */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Course fee</span>
                        <span className="font-medium text-foreground">£{course.price.toLocaleString()} GBP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">You pay ({currency.code})</span>
                        <span className="text-xl font-bold text-primary">{currency.symbol}{convertedPrice.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Approximate rate. Final amount confirmed at checkout.</p>
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
                      disabled={!scriptLoaded}
                      className="w-full bg-gradient-gold hover:opacity-90 font-semibold text-base py-5 btn-shimmer gap-2"
                      size="lg"
                    >
                      {!scriptLoaded ? (
                        <><Loader2 size={16} className="animate-spin" /> Loading payment…</>
                      ) : (
                        <><CreditCard size={16} /> Pay {currency.symbol}{convertedPrice.toLocaleString()} {currency.code}</>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Shield size={11} />
                      <span>Secured by Paystack · 256-bit SSL encryption</span>
                    </div>
                  </div>
                )}

                {/* ── Processing ── */}
                {step === "processing" && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Loader2 size={28} className="text-primary animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Processing your payment…</p>
                      <p className="text-sm text-muted-foreground mt-1">Please do not close this window</p>
                    </div>
                  </div>
                )}

                {/* ── Success ── */}
                {step === "success" && (
                  <div className="py-6 text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Payment Successful! 🎉</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You're now enrolled in <strong>{course.title}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">A confirmation notification has been sent to you.</p>
                    </div>
                    <Button
                      className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                      onClick={() => { onSuccess(); onClose(); }}
                    >
                      Start Learning →
                    </Button>
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

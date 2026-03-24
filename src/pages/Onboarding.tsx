import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Briefcase, BarChart3, Users, Rocket, ChevronRight,
  ChevronLeft, CheckCircle2, Target, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const roles = [
  { icon: Briefcase, label: "Project Manager", desc: "Lead and deliver projects on time and budget" },
  { icon: BarChart3, label: "Business Analyst", desc: "Bridge the gap between IT and business" },
  { icon: Users, label: "Scrum Master", desc: "Facilitate agile teams and processes" },
  { icon: Rocket, label: "Career Changer", desc: "Transitioning into PM or BA roles" },
];

const interests = [
  "PRINCE2", "PMP", "Agile & Scrum", "Stakeholder Management",
  "Risk Management", "Business Case Writing", "Requirements Engineering",
  "Career Coaching", "Templates & Tools", "Networking",
];

const goals = [
  { icon: Target, label: "Get certified", desc: "Earn a professional certification" },
  { icon: BookOpen, label: "Learn new skills", desc: "Expand my knowledge and capabilities" },
  { icon: Briefcase, label: "Land a new role", desc: "Prepare for job interviews and applications" },
  { icon: GraduationCap, label: "Advance my career", desc: "Move to the next level in my field" },
];

const steps = ["Role", "Interests", "Goals"];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const canNext = step === 0 ? !!selectedRole : step === 1 ? selectedInterests.length > 0 : !!selectedGoal;

  const handleFinish = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Role */}
          {step === 0 && (
            <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Welcome! What describes you best?</h1>
                <p className="text-sm text-muted-foreground">This helps us personalise your experience</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((r) => (
                  <Card
                    key={r.label}
                    onClick={() => setSelectedRole(r.label)}
                    className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      selectedRole === r.label ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedRole === r.label ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <r.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Interests */}
          {step === 1 && (
            <motion.div key="interests" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-1">What are you interested in?</h1>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {interests.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                      selectedInterests.includes(i)
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Goals */}
          {step === 2 && (
            <motion.div key="goals" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-1">What's your main goal?</h1>
                <p className="text-sm text-muted-foreground">We'll tailor your recommendations</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((g) => (
                  <Card
                    key={g.label}
                    onClick={() => setSelectedGoal(g.label)}
                    className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      selectedGoal === g.label ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedGoal === g.label ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <g.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{g.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="gap-1"
          >
            <ChevronLeft size={14} /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="gap-1">
              Next <ChevronRight size={14} />
            </Button>
          ) : (
            <Button size="sm" disabled={!canNext} onClick={handleFinish} className="gap-1">
              Get Started <Rocket size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

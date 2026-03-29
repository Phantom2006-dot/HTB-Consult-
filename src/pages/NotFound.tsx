import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-green opacity-60 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "url('/images/HTB-abstract.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-lg"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20">
          <BookOpen size={36} className="text-primary" />
        </motion.div>

        <motion.p variants={fadeUp} custom={1} className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-4 flex items-center justify-center gap-3">
          <span className="w-6 h-px bg-primary inline-block" />
          Page Not Found
          <span className="w-6 h-px bg-primary inline-block" />
        </motion.p>

        <motion.h1 variants={fadeUp} custom={2} className="text-7xl md:text-8xl font-serif font-bold text-foreground mb-4 leading-none">
          4<em className="text-gradient-gold not-italic">0</em>4
        </motion.h1>

        <motion.p variants={fadeUp} custom={3} className="text-white/60 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Head back to continue your learning journey.
        </motion.p>

        <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-3 flex-wrap">
          <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 font-semibold px-7 h-11 shadow-orange gap-2">
            <Link to="/">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 px-7 h-11">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;

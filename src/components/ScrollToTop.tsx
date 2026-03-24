import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  scrollRef?: React.RefObject<HTMLElement>;
}

const ScrollToTop = ({ scrollRef }: ScrollToTopProps) => {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef?.current || document.documentElement;
    const scrollTop = scrollRef?.current ? el.scrollTop : window.scrollY;
    setVisible(scrollTop > 300);
  }, [scrollRef]);

  useEffect(() => {
    const target = scrollRef?.current || window;
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [scrollRef, handleScroll]);

  const scrollToTop = () => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;

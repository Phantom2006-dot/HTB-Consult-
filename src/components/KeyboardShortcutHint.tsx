import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

const KeyboardShortcutHint = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("kb-hint-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("kb-hint-dismissed", "1");
  };

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={dismiss}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          <Keyboard size={14} className="text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono font-semibold">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono font-semibold">←</kbd> to go back
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutHint;

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isBlue = theme === "blue";

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-md text-sm font-semibold transition-all duration-500 cursor-pointer"
      style={{
        background: isBlue
          ? "linear-gradient(135deg, #1a3a6e 0%, #0d2255 100%)"
          : "linear-gradient(135deg, #12302a 0%, #0a1f1a 100%)",
        borderColor: isBlue ? "rgba(59,130,246,0.35)" : "rgba(234,119,0,0.35)",
        boxShadow: isBlue
          ? "0 8px 32px -4px rgba(26,86,219,0.45), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 8px 32px -4px rgba(234,119,0,0.35), 0 2px 8px rgba(0,0,0,0.3)",
        color: isBlue ? "#93c5fd" : "#fbbf24",
      }}
      aria-label="Toggle colour theme"
    >
      <AnimatePresence mode="wait">
        {isBlue ? (
          <motion.span
            key="blue-icon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            <span>Green Theme</span>
          </motion.span>
        ) : (
          <motion.span
            key="green-icon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <span>Blue Theme</span>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Animated pip */}
      <motion.span
        layout
        className="w-2 h-2 rounded-full ml-1"
        style={{ background: isBlue ? "#3b82f6" : "#f59e0b" }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      />
    </motion.button>
  );
};

export default ThemeToggle;

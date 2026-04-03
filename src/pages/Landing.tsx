import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CORRECT_PASSWORD = "06041996";

const consoleLogs = [
  { delay: 500, text: "[INFO] Syncing with Dublin server... OK", color: "text-dublin-green" },
  { delay: 1500, text: "[INFO] Calculating gym gains... +100%", color: "text-bangalore-gold" },
  { delay: 2500, text: "[INFO] Initializing Bangalore 2026 Protocol...", color: "text-dracula-cyan" },
  { delay: 3500, text: "[WARN] Tiramisu levels critically high ☕", color: "text-bangalore-gold" },
  { delay: 4500, text: "[INFO] Loading best friend module... 💚", color: "text-dublin-green" },
  { delay: 5500, text: "[INFO] Age.increment() → 30 🎂 The big three-oh!", color: "text-dracula-pink" },
  { delay: 6500, text: "[INFO] Karaoke mode: ALWAYS_ON 🎤", color: "text-dracula-purple" },
];

const Landing = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTyping) return;
    const timers = consoleLogs.map((log, i) =>
      setTimeout(() => setVisibleLogs(i + 1), log.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      navigate("/dashboard");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!isTyping && val.length > 0) setIsTyping(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Terminal Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 bg-card rounded-2xl border border-border overflow-hidden glow-green"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-dracula-selection border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-2 text-xs text-muted-foreground">birthday_auth.sh — bash</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-dracula-comment text-sm">
              # Happy Birthday Authentication System v2.0
            </div>
            <div className="text-dracula-comment text-sm">
              # Please enter your birthday (DDMMYYYY) to continue
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dublin-green">guest@birthday</span>
                <span className="text-foreground">:</span>
                <span className="text-dracula-cyan">~</span>
                <span className="text-foreground">$</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-bangalore-gold text-sm">password:</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-sm tracking-widest"
                  placeholder="••••••••"
                  autoFocus
                  maxLength={8}
                />
                <span className="cursor-blink text-primary">▋</span>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                $ sudo authenticate --birthday
              </motion.button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-dracula-red text-sm mt-2"
                >
                  [ERROR] Authentication failed. Are you really the birthday boy? 🤔
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Console Logs Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-dracula-selection border-b border-border">
            <span className="text-xs text-muted-foreground">console.log — output</span>
          </div>

          <div className="p-6 space-y-3 min-h-[200px]">
            {!isTyping && (
              <div className="text-muted-foreground text-sm animate-pulse-glow">
                {">"} Waiting for input...
              </div>
            )}

            <AnimatePresence>
              {consoleLogs.slice(0, visibleLogs).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-sm ${log.color}`}
                >
                  {log.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;

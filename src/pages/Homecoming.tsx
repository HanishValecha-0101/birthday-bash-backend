import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import AppLayout from "@/components/AppLayout";

const Homecoming = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [planeFlying, setPlaneFlying] = useState(false);

  const handleConfirm = () => {
    setPlaneFlying(true);
    setTimeout(() => {
      setConfirmed(true);
      // Massive confetti
      const duration = 4000;
      const end = Date.now() + duration;
      const emojis = ["⚽", "🏋️", "🍰", "💚", "✈️", "🎂"];

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.7 },
          colors: ["#50FA7B", "#FFB86C", "#FF79C6", "#BD93F9"],
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.7 },
          colors: ["#50FA7B", "#FFB86C", "#FF79C6", "#BD93F9"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }, 4000);
  };

  const progress = 80; // 80% loaded

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-dracula-pink">deploy</span>{" "}
            <span className="text-dublin-green">homecoming</span>{" "}
            <span className="text-foreground">--env production</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">// The Homecoming Deployment</p>
        </motion.div>

        {/* Boarding Pass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border-2 border-dashed border-bangalore-gold overflow-hidden glow-gold"
        >
          {/* Header */}
          <div className="bg-dracula-selection px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-muted-foreground">BOARDING PASS</div>
                <div className="text-lg font-bold text-foreground">FRIENDSHIP AIRLINES</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">CLASS</div>
                <div className="text-sm font-bold text-bangalore-gold">BESTIE FIRST</div>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl">🇮🇪</div>
                <div className="text-sm font-bold text-dublin-green mt-1">DUB</div>
                <div className="text-xs text-muted-foreground">Dublin, Ireland</div>
              </div>

              {/* Flight path */}
              <div className="flex-1 relative h-12">
                <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-muted-foreground/30" />
                {planeFlying && (
                  <motion.div
                    className="absolute text-2xl"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                    initial={{ left: "0%" }}
                    animate={{ left: "85%" }}
                    transition={{ duration: 3.5, ease: "easeInOut" }}
                  >
                    ✈️
                  </motion.div>
                )}
                {!planeFlying && (
                  <div className="absolute text-2xl" style={{ left: "5%", top: "50%", transform: "translateY(-50%)" }}>
                    ✈️
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl">🇮🇳</div>
                <div className="text-sm font-bold text-bangalore-gold mt-1">BLR</div>
                <div className="text-xs text-muted-foreground">Bangalore, India</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-foreground font-bold">RE-CONNECTING...</span>
                <span className="text-muted-foreground">{confirmed ? "100%" : `${progress}%`}</span>
              </div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(135,95%,65%), hsl(31,100%,71%))" }}
                  initial={{ width: "0%" }}
                  animate={{ width: confirmed ? "100%" : `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                [{"█".repeat(Math.floor((confirmed ? 100 : progress) / 10))}{"░".repeat(10 - Math.floor((confirmed ? 100 : progress) / 10))}]
              </div>
            </div>

            {/* Message */}
            <div className="bg-dracula-selection rounded-xl p-4 border border-border mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Family in India <span className="text-bangalore-gold font-bold">misses you deeply</span> and is waiting to see you again.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                I'm waiting at the gate holding a sign that says:
              </p>
              <code className="text-sm text-dracula-pink font-bold block mt-1">
                $ git merge family_friends --force
              </code>
            </div>

            {/* Confirm Button */}
            {!confirmed ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={planeFlying}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-sm glow-green hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {planeFlying ? "✈️ In flight..." : "✅ Confirm Arrival"}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2"
              >
                <div className="text-4xl">🎉</div>
                <h3 className="text-lg font-bold text-dublin-green">Deployment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Welcome home! The build is live. 💚
                </p>
                <code className="text-xs text-dracula-pink block">
                  [SUCCESS] family_friends merged into bangalore/main
                </code>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Homecoming;

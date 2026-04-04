import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type Zone = "top-left" | "top-right" | "center" | "bottom-left" | "bottom-right";
type Phase = "rules" | "aiming" | "shooting" | "goal" | "saved" | "result";

const ZONES: { id: Zone; label: string; x: number; y: number; points: number }[] = [
  { id: "top-left", label: "Top Left", x: 25, y: 12, points: 3 },
  { id: "top-right", label: "Top Right", x: 75, y: 12, points: 3 },
  { id: "center", label: "Center", x: 50, y: 18, points: 1 },
  { id: "bottom-left", label: "Bottom Left", x: 28, y: 28, points: 2 },
  { id: "bottom-right", label: "Bottom Right", x: 72, y: 28, points: 2 },
];

const RULES = [
  "⚽ You get 3 shots — make them count!",
  "🎯 Tap a zone in the goal to aim your shot",
  "🧤 The goalkeeper will dive toward your shot",
  "⭐ Corner shots score 3 points, bottom 2, center 1",
  "🏆 Try to outsmart the keeper!",
];

const FootballGame = () => {
  const [phase, setPhase] = useState<Phase>("rules");
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(3);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 82 });
  const [keeperPos, setKeeperPos] = useState({ x: 50, y: 18 });
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const shootingRef = useRef(false);

  const spawnConfetti = (cx: number, cy: number) => {
    const emojis = ["⚽", "🎉", "✨", "🥅", "🔥"];
    const newC = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 30,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setConfetti((c) => [...c, ...newC]);
    setTimeout(() => setConfetti((c) => c.filter((cc) => !newC.find((n) => n.id === cc.id))), 1200);
  };

  const shoot = useCallback((zone: Zone) => {
    if (shootingRef.current || shotsLeft <= 0) return;
    shootingRef.current = true;
    setSelectedZone(zone);
    setPhase("shooting");

    const target = ZONES.find((z) => z.id === zone)!;

    // Keeper AI: 60% chance to predict the correct side, random within
    const keeperGuessCorrect = Math.random() < 0.6;
    const isLeft = target.x < 50;
    let keeperTargetX: number;

    if (keeperGuessCorrect) {
      keeperTargetX = isLeft ? 25 + Math.random() * 15 : 60 + Math.random() * 15;
    } else {
      keeperTargetX = isLeft ? 60 + Math.random() * 15 : 25 + Math.random() * 15;
    }
    if (zone === "center") keeperTargetX = 45 + Math.random() * 10;

    setKeeperPos({ x: keeperTargetX, y: target.y });
    setBallPos({ x: target.x, y: target.y });

    setTimeout(() => {
      const saved = Math.abs(target.x - keeperTargetX) < 12;
      setShotsTaken((p) => p + 1);
      setShotsLeft((p) => p - 1);

      if (saved) {
        setPhase("saved");
      } else {
        setScore((p) => p + target.points);
        spawnConfetti(target.x, target.y);
        setPhase("goal");
      }
      shootingRef.current = false;
    }, 700);
  }, [shotsLeft]);

  const nextShot = () => {
    if (shotsLeft <= 0) {
      setPhase("result");
      return;
    }
    setBallPos({ x: 50, y: 82 });
    setKeeperPos({ x: 50, y: 18 });
    setSelectedZone(null);
    setPhase("aiming");
  };

  const restart = () => {
    setScore(0);
    setShotsLeft(3);
    setShotsTaken(0);
    setBallPos({ x: 50, y: 82 });
    setKeeperPos({ x: 50, y: 18 });
    setSelectedZone(null);
    setPhase("aiming");
  };

  return (
    <GameFrame title="⚽ Football Challenge" subtitle="3 shots — aim for the corners!" badge="skill">
      {phase === "rules" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="font-semibold text-foreground text-sm mb-3">📋 Football Challenge Rules</p>
            <ul className="space-y-2">
              {RULES.map((rule, i) => (
                <li key={i} className="text-xs text-muted-foreground">{rule}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground text-center">
              <span className="text-foreground font-bold">Scoring:</span> Top corners = 3pts • Bottom sides = 2pts • Center = 1pt
            </p>
          </div>
          <button onClick={restart} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            Start Match ⚽
          </button>
        </motion.div>
      )}

      {phase !== "rules" && phase !== "result" && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score: <span className="text-primary font-bold">{score}</span></span>
            <span>Shots left: <span className="text-foreground font-bold">{shotsLeft}</span></span>
            <span>Taken: {shotsTaken}/3</span>
          </div>

          <div
            className="relative h-[300px] rounded-2xl border border-border overflow-hidden select-none"
            style={{ background: "linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(135 40% 25% / 0.4) 100%)" }}
          >
            {/* Goal frame */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[70%] h-[35%] border-2 border-foreground/40 rounded-t-lg">
              {/* Goal zones - clickable */}
              {phase === "aiming" && ZONES.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => shoot(zone.id)}
                  className="absolute w-[36%] h-[45%] rounded-lg border border-dashed border-foreground/20 hover:border-primary hover:bg-primary/10 cursor-pointer transition-all flex items-center justify-center"
                  style={{
                    left: zone.id.includes("left") ? "2%" : zone.id.includes("right") ? "62%" : "32%",
                    top: zone.id.includes("top") || zone.id === "center" ? "5%" : "52%",
                  }}
                >
                  <span className="text-[10px] text-foreground/40 font-bold">{zone.points}pt</span>
                </div>
              ))}
            </div>

            {/* Keeper */}
            <motion.div
              className="absolute text-3xl"
              animate={{ left: `${keeperPos.x}%`, top: `${keeperPos.y}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              🧤
            </motion.div>

            {/* Ball */}
            <motion.div
              className="absolute text-3xl"
              animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              ⚽
            </motion.div>

            {/* Confetti */}
            <AnimatePresence>
              {confetti.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, y: -40, scale: 0.3 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute text-lg pointer-events-none" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                  {c.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {phase === "aiming" && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
                Click a zone in the goal to shoot
              </div>
            )}
          </div>

          <AnimatePresence>
            {(phase === "goal" || phase === "saved") && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-2">
                <div className="text-3xl">{phase === "goal" ? "🎉" : "😤"}</div>
                <p className="font-bold text-foreground">
                  {phase === "goal"
                    ? `GOAL! +${ZONES.find((z) => z.id === selectedZone)?.points || 0} points`
                    : "Saved by the keeper!"}
                </p>
                <button onClick={nextShot} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  {shotsLeft > 0 ? "Next Shot" : "See Results"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phase === "result" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <div className="text-5xl">{score >= 7 ? "🏆" : score >= 4 ? "⚽" : "😅"}</div>
          <h3 className="text-xl font-bold text-foreground">
            {score >= 7 ? "Hat-trick Hero!" : score >= 4 ? "Solid Performance!" : "Better luck next time!"}
          </h3>
          <p className="text-2xl font-bold text-primary">{score} / 9 points</p>
          <p className="text-xs text-muted-foreground">
            {shotsTaken - Math.floor(score > 0 ? 1 : 0)} saved • {score >= 7 ? "You're unstoppable!" : "Try hitting the corners!"}
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={restart} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Play Again
            </button>
            <button onClick={() => setPhase("rules")} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              Rules
            </button>
          </div>
        </motion.div>
      )}
    </GameFrame>
  );
};

export default FootballGame;

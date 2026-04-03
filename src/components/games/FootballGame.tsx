import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

const LEVELS = [
  { name: "Level 1 — Standard Penalty", wallSpeed: 0, wallEnabled: false, curveChallenge: false },
  { name: "Level 2 — Moving Wall", wallSpeed: 2, wallEnabled: true, curveChallenge: false },
  { name: "Level 3 — Curved Shot", wallSpeed: 2.5, wallEnabled: true, curveChallenge: true },
];

const FootballGame = () => {
  const [phase, setPhase] = useState<"menu" | "aiming" | "shooting" | "goal" | "saved" | "result">("menu");
  const [level, setLevel] = useState(0);
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 85 });
  const [ballTarget, setBallTarget] = useState({ x: 50, y: 15 });
  const [keeperX, setKeeperX] = useState(50);
  const [wallX, setWallX] = useState(50);
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const lvl = LEVELS[level];

  useEffect(() => {
    if (phase !== "aiming") return;
    let t = 0;
    const loop = () => {
      t += 0.03;
      setKeeperX(50 + Math.sin(t * 1.5) * 20);
      if (lvl.wallEnabled) setWallX(50 + Math.sin(t * lvl.wallSpeed) * 30);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, lvl]);

  const spawnConfetti = (cx: number, cy: number) => {
    const emojis = birthdayMode ? ["🎂", "🎉", "🎊", "🎈", "🍰"] : ["⚽", "🎉", "✨"];
    const newC = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setConfetti((c) => [...c, ...newC]);
    setTimeout(() => setConfetti((c) => c.filter((cc) => !newC.find((n) => n.id === cc.id))), 1200);
  };

  const shoot = useCallback(() => {
    if (phase !== "aiming" || !fieldRef.current) return;

    setPhase("shooting");
    setAttempts((a) => a + 1);

    const target = ballTarget;
    const keeperReach = 12;
    const isBlocked = lvl.wallEnabled && Math.abs(target.x - wallX) < 15 && target.y > 40 && target.y < 60;
    const isSaved = Math.abs(target.x - keeperX) < keeperReach && !isBlocked;

    setTimeout(() => {
      setBallPos({ x: target.x, y: target.y });
    }, 100);

    setTimeout(() => {
      if (isBlocked || isSaved) {
        setPhase("saved");
      } else {
        const newGoals = goals + 1;
        setGoals(newGoals);
        if (newGoals >= 3 && !birthdayMode) setBirthdayMode(true);
        spawnConfetti(target.x, target.y);
        setPhase("goal");
      }
    }, 600);
  }, [phase, ballTarget, keeperX, wallX, goals, birthdayMode, lvl]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !fieldRef.current || !dragStart.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const targetX = Math.max(10, Math.min(90, ((2 * dragStart.current.x - endX) / rect.width) * 100));
    const targetY = Math.max(5, Math.min(35, ((2 * dragStart.current.y - endY) / rect.height) * 100));
    setBallTarget({ x: targetX, y: targetY });
    dragStart.current = null;
    setTimeout(shoot, 50);
  };

  const nextShot = () => {
    setBallPos({ x: 50, y: 85 });
    setBallTarget({ x: 50, y: 15 });
    setPhase("aiming");
  };

  const startGame = (lvlIdx: number) => {
    setLevel(lvlIdx);
    setGoals(0);
    setAttempts(0);
    setBirthdayMode(false);
    setBallPos({ x: 50, y: 85 });
    setPhase("aiming");
  };

  const accuracy = attempts > 0 ? Math.round((goals / attempts) * 100) : 0;

  return (
    <GameFrame title={birthdayMode ? "🎂 Birthday Ball Mode!" : "⚽ Trick Shot Football"} subtitle="Swipe to shoot — aim for the corners!" badge="skill">
      {phase === "menu" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-xs text-muted-foreground">Drag & release to shoot. Score 3 goals to unlock Birthday Ball Mode! 🎂</p>
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => startGame(i)} className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
              <span className="font-bold text-foreground">{l.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {l.wallEnabled ? "Moving wall • " : ""}{l.curveChallenge ? "Curve shots • " : ""}Goalkeeper active
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {phase !== "menu" && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goals: <span className="text-primary font-bold">{goals}</span></span>
            <span>Attempts: {attempts}</span>
            <span>Accuracy: {accuracy}%</span>
          </div>
          <div
            ref={fieldRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative h-[320px] rounded-2xl border border-border overflow-hidden cursor-crosshair select-none"
            style={{ background: "linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(135 40% 25% / 0.4) 100%)" }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-12 border-2 border-foreground/40 rounded-t-lg" />

            <motion.div
              className="absolute top-8 text-3xl"
              style={{ left: `${keeperX}%`, transform: "translateX(-50%)" }}
            >
              🧤
            </motion.div>

            {lvl.wallEnabled && (
              <motion.div
                className="absolute text-xl"
                style={{ left: `${wallX}%`, top: "50%", transform: "translateX(-50%)" }}
              >
                🧱🧱
              </motion.div>
            )}

            <motion.div
              className="absolute text-3xl"
              animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {birthdayMode ? "🎂" : "⚽"}
            </motion.div>

            <AnimatePresence>
              {confetti.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, y: -40, scale: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute text-lg pointer-events-none"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                >
                  {c.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {phase === "aiming" && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
                drag & release to shoot
              </div>
            )}
          </div>

          <AnimatePresence>
            {(phase === "goal" || phase === "saved") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-2"
              >
                <div className="text-3xl">{phase === "goal" ? "🎉" : "😤"}</div>
                <p className="font-bold text-foreground">{phase === "goal" ? "GOAL!" : "Saved!"}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={nextShot} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                    Next Shot
                  </button>
                  <button onClick={() => setPhase("menu")} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">
                    End Game
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </GameFrame>
  );
};

export default FootballGame;

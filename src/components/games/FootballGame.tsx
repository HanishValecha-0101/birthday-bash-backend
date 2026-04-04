import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

const LEVELS = [
  { name: "Level 1 — Standard Penalty", wallSpeed: 0, wallEnabled: false, spinnerEnabled: false, windEnabled: false, keeperSpeed: 1.5 },
  { name: "Level 2 — Moving Wall", wallSpeed: 2, wallEnabled: true, spinnerEnabled: false, windEnabled: false, keeperSpeed: 2 },
  { name: "Level 3 — Spinner + Wind", wallSpeed: 2.5, wallEnabled: true, spinnerEnabled: true, windEnabled: true, keeperSpeed: 2.5 },
];

const RULES = [
  "⚽ Drag from the ball and release to shoot",
  "🧤 The goalkeeper moves — aim for the corners",
  "🧱 Level 2+ adds a moving wall obstacle",
  "🌀 Level 3 adds a spinning blocker & wind drift",
  "🎂 Score 3 goals to unlock Birthday Ball Mode!",
  "🎯 Accuracy matters — track your stats",
];

const FootballGame = () => {
  const [phase, setPhase] = useState<"menu" | "rules" | "aiming" | "shooting" | "goal" | "saved" | "result">("menu");
  const [level, setLevel] = useState(0);
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 85 });
  const [ballTarget, setBallTarget] = useState({ x: 50, y: 15 });
  const [keeperX, setKeeperX] = useState(50);
  const [wallX, setWallX] = useState(50);
  const [spinnerAngle, setSpinnerAngle] = useState(0);
  const [windOffset, setWindOffset] = useState(0);
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [powerMeter, setPowerMeter] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const powerRef = useRef<number>(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const lvl = LEVELS[level];

  useEffect(() => {
    if (phase !== "aiming") return;
    let t = 0;
    const loop = () => {
      t += 0.03;
      setKeeperX(50 + Math.sin(t * lvl.keeperSpeed) * 22);
      if (lvl.wallEnabled) setWallX(50 + Math.sin(t * lvl.wallSpeed) * 30);
      if (lvl.spinnerEnabled) setSpinnerAngle(t * 60);
      if (lvl.windEnabled) setWindOffset(Math.sin(t * 0.5) * 8);

      if (isCharging) {
        powerRef.current = Math.min(100, powerRef.current + 2);
        setPowerMeter(powerRef.current);
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, lvl, isCharging]);

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

    let target = { ...ballTarget };
    // Apply wind
    if (lvl.windEnabled) {
      target.x = Math.max(5, Math.min(95, target.x + windOffset));
    }

    const keeperReach = 12;
    const isBlockedByWall = lvl.wallEnabled && Math.abs(target.x - wallX) < 14 && target.y > 40 && target.y < 60;
    const isBlockedBySpinner = lvl.spinnerEnabled && Math.abs(target.x - 50) < 18 && target.y > 30 && target.y < 50;
    const isSaved = Math.abs(target.x - keeperX) < keeperReach;

    setTimeout(() => setBallPos({ x: target.x, y: target.y }), 100);

    setTimeout(() => {
      if (isBlockedByWall || isBlockedBySpinner || isSaved) {
        setPhase("saved");
      } else {
        const newGoals = goals + 1;
        setGoals(newGoals);
        if (newGoals >= 3 && !birthdayMode) setBirthdayMode(true);
        spawnConfetti(target.x, target.y);
        setPhase("goal");
      }
    }, 600);
  }, [phase, ballTarget, keeperX, wallX, goals, birthdayMode, lvl, windOffset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsCharging(true);
    powerRef.current = 0;
    setPowerMeter(0);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !fieldRef.current || !dragStart.current) return;
    setIsCharging(false);
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
    setPowerMeter(0);
    setPhase("aiming");
  };

  const startGame = (lvlIdx: number) => {
    setLevel(lvlIdx);
    setGoals(0);
    setAttempts(0);
    setBirthdayMode(false);
    setBallPos({ x: 50, y: 85 });
    setPowerMeter(0);
    setPhase("rules");
  };

  const accuracy = attempts > 0 ? Math.round((goals / attempts) * 100) : 0;

  return (
    <GameFrame title={birthdayMode ? "🎂 Birthday Ball Mode!" : "⚽ Trick Shot Football"} subtitle="Drag to aim, release to shoot — beat the keeper!" badge="skill">
      {phase === "menu" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-xs text-muted-foreground">Choose your difficulty — each level adds new obstacles!</p>
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => startGame(i)} className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
              <span className="font-bold text-foreground">{l.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {l.wallEnabled ? "Moving wall • " : ""}{l.spinnerEnabled ? "Spinner • " : ""}{l.windEnabled ? "Wind • " : ""}Goalkeeper
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {phase === "rules" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="font-semibold text-foreground text-sm mb-3">📋 How to Play</p>
            <ul className="space-y-2">
              {RULES.map((rule, i) => (
                <li key={i} className="text-xs text-muted-foreground">{rule}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Playing: <span className="text-foreground font-bold">{LEVELS[level].name}</span></p>
          </div>
          <button onClick={() => { setBallPos({ x: 50, y: 85 }); setPhase("aiming"); }} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            Start Match ⚽
          </button>
        </motion.div>
      )}

      {phase !== "menu" && phase !== "rules" && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goals: <span className="text-primary font-bold">{goals}</span></span>
            <span>Attempts: {attempts}</span>
            <span>Accuracy: {accuracy}%</span>
          </div>

          {/* Power meter */}
          {phase === "aiming" && (
            <div className="h-2 rounded-full bg-muted/60 overflow-hidden border border-border">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-destructive" style={{ width: `${powerMeter}%` }} />
            </div>
          )}

          {/* Wind indicator */}
          {lvl.windEnabled && phase === "aiming" && (
            <div className="text-center text-xs text-muted-foreground">
              💨 Wind: {windOffset > 0 ? "→" : "←"} {Math.abs(Math.round(windOffset))}
            </div>
          )}

          <div
            ref={fieldRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative h-[320px] rounded-2xl border border-border overflow-hidden cursor-crosshair select-none"
            style={{ background: "linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(135 40% 25% / 0.4) 100%)" }}
          >
            {/* Goal */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-12 border-2 border-foreground/40 rounded-t-lg" />

            {/* Keeper */}
            <motion.div className="absolute top-8 text-3xl" style={{ left: `${keeperX}%`, transform: "translateX(-50%)" }}>🧤</motion.div>

            {/* Wall */}
            {lvl.wallEnabled && (
              <motion.div className="absolute text-xl" style={{ left: `${wallX}%`, top: "50%", transform: "translateX(-50%)" }}>🧱🧱</motion.div>
            )}

            {/* Spinner */}
            {lvl.spinnerEnabled && (
              <motion.div
                className="absolute text-xl"
                style={{ left: "50%", top: "38%", transform: `translate(-50%, -50%) rotate(${spinnerAngle}deg)` }}
              >
                🌀
              </motion.div>
            )}

            {/* Ball */}
            <motion.div
              className="absolute text-3xl"
              animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {birthdayMode ? "🎂" : "⚽"}
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
                hold & drag to aim • release to shoot
              </div>
            )}
          </div>

          <AnimatePresence>
            {(phase === "goal" || phase === "saved") && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-2">
                <div className="text-3xl">{phase === "goal" ? "🎉" : "😤"}</div>
                <p className="font-bold text-foreground">{phase === "goal" ? "GOAL!" : "Saved!"}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={nextShot} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Next Shot</button>
                  <button onClick={() => setPhase("menu")} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">End Game</button>
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

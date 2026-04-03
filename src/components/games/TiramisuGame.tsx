import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type Ingredient = { id: string; emoji: string; label: string; width: number; weight: number };

const INGREDIENTS: Ingredient[] = [
  { id: "ladyfinger", emoji: "🍪", label: "Ladyfingers", width: 70, weight: 1 },
  { id: "mascarpone", emoji: "🧀", label: "Mascarpone", width: 60, weight: 0.8 },
  { id: "cocoa", emoji: "🟤", label: "Cocoa Powder", width: 65, weight: 0.5 },
  { id: "espresso", emoji: "☕", label: "Espresso", width: 50, weight: 0.6 },
];

type StackItem = { ingredient: Ingredient; x: number; y: number; id: number };

const LEVELS = [
  { name: "Level 1 — Basic Stack", platformSpeed: 0, targetHeight: 5 },
  { name: "Level 2 — Moving Table", platformSpeed: 1.5, targetHeight: 7 },
  { name: "Level 3 — Birthday Tower", platformSpeed: 2.5, targetHeight: 10 },
];

const TiramisuGame = () => {
  const [phase, setPhase] = useState<"menu" | "playing" | "collapsed" | "win">("menu");
  const [level, setLevel] = useState(0);
  const [stack, setStack] = useState<StackItem[]>([]);
  const [score, setScore] = useState(0);
  const [dropX, setDropX] = useState(50);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>(INGREDIENTS[0]);
  const [platformOffset, setPlatformOffset] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const idCounter = useRef(0);

  const lvl = LEVELS[level];

  const spawnParticles = (x: number, y: number, emoji: string) => {
    const newP = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 20,
      emoji,
    }));
    setParticles((p) => [...p, ...newP]);
    setTimeout(() => setParticles((p) => p.filter((pp) => !newP.find((n) => n.id === pp.id))), 800);
  };

  const dropIngredient = useCallback(() => {
    if (phase !== "playing") return;

    const stackHeight = stack.length;
    const y = 280 - stackHeight * 28;

    if (stackHeight > 0) {
      const lastItem = stack[stackHeight - 1];
      const offset = Math.abs(dropX - lastItem.x);
      if (offset > 35) {
        setPhase("collapsed");
        spawnParticles(dropX, y, "💥");
        return;
      }
      const balanceBonus = Math.max(0, 20 - offset);
      setScore((s) => s + 10 + Math.round(balanceBonus));
    } else {
      setScore((s) => s + 10);
    }

    const newItem: StackItem = {
      ingredient: currentIngredient,
      x: dropX,
      y,
      id: idCounter.current++,
    };
    const newStack = [...stack, newItem];
    setStack(newStack);
    setCurrentIngredient(INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)]);
    spawnParticles(dropX, y, currentIngredient.emoji);

    if (newStack.length >= lvl.targetHeight) {
      setPhase("win");
    }
  }, [phase, stack, dropX, currentIngredient, lvl.targetHeight]);

  useEffect(() => {
    if (phase !== "playing" || lvl.platformSpeed === 0) return;
    let t = 0;
    const loop = () => {
      t += 0.02;
      setPlatformOffset(Math.sin(t * lvl.platformSpeed) * 25);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, lvl.platformSpeed]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (phase !== "playing" || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setDropX(Math.max(10, Math.min(90, pct)));
  };

  const startGame = (lvlIdx: number) => {
    setLevel(lvlIdx);
    setStack([]);
    setScore(0);
    setDropX(50);
    setPlatformOffset(0);
    setCurrentIngredient(INGREDIENTS[0]);
    setPhase("playing");
  };

  return (
    <GameFrame title="🍰 Tiramisu Physics Lab" subtitle="Stack ingredients to build the tallest birthday tiramisu!" badge="physics">
      {phase === "menu" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-xs text-muted-foreground">Choose a level — tap/click to drop ingredients, keep the stack balanced!</p>
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => startGame(i)} className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
              <span className="font-bold text-foreground">{l.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">Stack {l.targetHeight} layers{l.platformSpeed > 0 ? " • moving platform" : ""}</span>
            </button>
          ))}
        </motion.div>
      )}

      {phase === "playing" && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score: <span className="text-primary font-bold">{score}</span></span>
            <span>Layers: {stack.length}/{lvl.targetHeight}</span>
          </div>
          <div
            ref={gameRef}
            onPointerMove={handlePointerMove}
            onClick={dropIngredient}
            className="relative h-[320px] rounded-2xl border border-border bg-gradient-to-b from-background/80 to-muted/40 overflow-hidden cursor-crosshair select-none"
          >
            {/* Drop indicator */}
            <motion.div
              className="absolute top-2 text-2xl"
              style={{ left: `${dropX}%`, transform: "translateX(-50%)" }}
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {currentIngredient.emoji}
            </motion.div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-full border-l border-dashed border-muted-foreground/20" />

            {/* Platform */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-8 bg-secondary/30 border-t-2 border-secondary rounded-t-lg"
              style={{ transform: `translateX(${platformOffset}px)` }}
            />

            {/* Stack */}
            <AnimatePresence>
              {stack.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute text-2xl"
                  style={{
                    left: `${item.x + platformOffset * 0.3}%`,
                    bottom: `${320 - item.y}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {item.ingredient.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Particles */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 0.3, y: -30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute text-sm pointer-events-none"
                  style={{ left: `${p.x}%`, top: `${p.y}px` }}
                >
                  {p.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50">
              tap to drop • move to aim
            </div>
          </div>
        </div>
      )}

      {(phase === "collapsed" || phase === "win") && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
          <div className="text-5xl">{phase === "win" ? "🎂" : "💥"}</div>
          <h3 className="text-xl font-bold text-foreground">
            {phase === "win" ? "Birthday Tiramisu Complete!" : "Tower Collapsed!"}
          </h3>
          <p className="text-sm text-muted-foreground">Score: <span className="text-primary font-bold">{score}</span></p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => startGame(level)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Try Again
            </button>
            <button onClick={() => setPhase("menu")} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">
              Back to Menu
            </button>
          </div>
        </motion.div>
      )}
    </GameFrame>
  );
};

export default TiramisuGame;

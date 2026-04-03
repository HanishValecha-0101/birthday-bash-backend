import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";
import GameFrame from "./GameFrame";

type Ingredient = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

const ingredients: Ingredient[] = [
  { id: "espresso", emoji: "☕", label: "Espresso Shot", color: "bg-amber-900/30 border-amber-700/40" },
  { id: "ladyfinger", emoji: "🍪", label: "Ladyfingers", color: "bg-yellow-800/20 border-yellow-600/40" },
  { id: "mascarpone", emoji: "🧀", label: "Mascarpone", color: "bg-orange-100/20 border-orange-200/40" },
  { id: "egg", emoji: "🥚", label: "Egg Yolks", color: "bg-yellow-400/15 border-yellow-400/40" },
  { id: "sugar", emoji: "🍬", label: "Sugar", color: "bg-pink-200/15 border-pink-300/40" },
  { id: "cocoa", emoji: "🟤", label: "Cocoa Powder", color: "bg-amber-800/25 border-amber-700/40" },
  { id: "marsala", emoji: "🍷", label: "Marsala Wine", color: "bg-red-900/20 border-red-800/40" },
  { id: "vanilla", emoji: "🌿", label: "Vanilla Extract", color: "bg-green-800/15 border-green-700/40" },
];

type FallingItem = {
  id: string;
  ingredient: Ingredient;
  x: number; // 0-100 percentage
  y: number;
  speed: number;
  caught: boolean;
  missed: boolean;
};

type CaughtLayer = {
  ingredient: Ingredient;
  precision: number; // 0-100 how centered the catch was
};

const CATCH_ZONE_Y = 78;
const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 1200; // ms

const getVerdict = (score: number, caught: number, total: number) => {
  const ratio = total > 0 ? caught / total : 0;
  if (score >= 800 && ratio >= 0.8)
    return { title: "🏆 Master Pasticciere", note: "Nonna would be proud. That's a Michelin-star tiramisu.", tone: "text-primary" };
  if (score >= 500 && ratio >= 0.6)
    return { title: "✨ Café Owner Energy", note: "Solid technique, great instincts. Your tiramisu has character.", tone: "text-secondary" };
  if (score >= 250)
    return { title: "😅 Ambitious Home Cook", note: "Some ingredients hit the floor, but the spirit was there.", tone: "text-accent" };
  return { title: "🚨 Kitchen Disaster", note: "The smoke alarm went off and the mascarpone is on the ceiling.", tone: "text-destructive" };
};

const TiramisuBuilder = () => {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [caughtLayers, setCaughtLayers] = useState<CaughtLayer[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const [missedCount, setMissedCount] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const gameTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const itemsRef = useRef<FallingItem[]>([]);

  const endGame = useCallback(() => {
    setPhase("result");
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(gameTimerRef.current);
  }, []);

  const spawnItem = useCallback(() => {
    const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    const item: FallingItem = {
      id: `${Date.now()}-${Math.random()}`,
      ingredient,
      x: 10 + Math.random() * 80,
      y: -10,
      speed: 18 + Math.random() * 14, // units per second
      caught: false,
      missed: false,
    };
    itemsRef.current = [...itemsRef.current, item];
    setFallingItems([...itemsRef.current]);
    setTotalSpawned((p) => p + 1);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    let changed = false;
    const updated = itemsRef.current.map((item) => {
      if (item.caught || item.missed) return item;
      const newY = item.y + item.speed * delta;
      if (newY > 100) {
        changed = true;
        setMissedCount((p) => p + 1);
        setCombo(0);
        return { ...item, y: 100, missed: true };
      }
      if (Math.abs(newY - item.y) > 0.1) changed = true;
      return { ...item, y: newY };
    }).filter((item) => !(item.missed && item.y >= 100));

    if (changed) {
      itemsRef.current = updated;
      setFallingItems([...updated]);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startGame = () => {
    setPhase("playing");
    setFallingItems([]);
    setCaughtLayers([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setTotalSpawned(0);
    setMissedCount(0);
    itemsRef.current = [];
    lastTimeRef.current = 0;

    spawnTimerRef.current = window.setInterval(spawnItem, SPAWN_INTERVAL);
    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    animFrameRef.current = requestAnimationFrame(gameLoop);
    // spawn first immediately
    spawnItem();
  };

  useEffect(() => {
    if (timeLeft === 0 && phase === "playing") {
      endGame();
    }
  }, [timeLeft, phase, endGame]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(spawnTimerRef.current);
      clearInterval(gameTimerRef.current);
    };
  }, []);

  const catchItem = (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item || item.caught || item.missed) return;

    // Precision based on how close to catch zone
    const distance = Math.abs(item.y - CATCH_ZONE_Y);
    const precision = Math.max(0, Math.round(100 - distance * 3));
    const newCombo = combo + 1;
    const points = Math.round((precision + newCombo * 15) * (1 + precision / 100));

    itemsRef.current = itemsRef.current.map((i) =>
      i.id === itemId ? { ...i, caught: true } : i
    );
    setFallingItems([...itemsRef.current]);

    setCaughtLayers((prev) => [...prev, { ingredient: item.ingredient, precision }].slice(-12));
    setScore((p) => p + points);
    setCombo(newCombo);
    setMaxCombo((p) => Math.max(p, newCombo));

    // Remove after animation
    setTimeout(() => {
      itemsRef.current = itemsRef.current.filter((i) => i.id !== itemId);
      setFallingItems([...itemsRef.current]);
    }, 400);
  };

  const caught = caughtLayers.length;
  const verdict = getVerdict(score, caught, totalSpawned);

  return (
    <GameFrame
      title="🍰 Tiramisu Builder"
      subtitle="Catch falling ingredients to build the perfect tiramisu — timing and reflexes matter!"
      badge="solo · 30s"
    >
      <div className="space-y-4">
        {phase === "intro" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">How to play:</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>☕ Ingredients fall from the top — tap them to catch</li>
                <li>🎯 Catch near the golden zone for max points</li>
                <li>🔥 Build combos for multiplied scores</li>
                <li>⏱️ You have 30 seconds — go!</li>
              </ul>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ingredients.slice(0, 8).map((ing) => (
                <div key={ing.id} className={`rounded-xl border p-2 text-center ${ing.color}`}>
                  <div className="text-xl">{ing.emoji}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{ing.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={startGame}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Start Cooking 🔥
            </button>
          </motion.div>
        )}

        {phase === "playing" && (
          <div className="space-y-3">
            {/* HUD */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Time</div>
                <div className={`mt-1 text-lg font-bold ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>{timeLeft}s</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Score</div>
                <div className="mt-1 text-lg font-bold text-primary">{score}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Combo</div>
                <div className="mt-1 text-lg font-bold text-secondary">x{combo}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Caught</div>
                <div className="mt-1 text-lg font-bold text-accent">{caught}</div>
              </div>
            </div>

            {/* Game area */}
            <div
              ref={gameAreaRef}
              className="relative h-[320px] overflow-hidden rounded-[1.4rem] border border-border bg-gradient-to-b from-background/80 via-muted/30 to-muted/60"
              style={{ touchAction: "none" }}
            >
              {/* Catch zone indicator */}
              <div
                className="absolute inset-x-4 h-12 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
                style={{ top: `${CATCH_ZONE_Y - 4}%` }}
              >
                <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-primary/50">
                  catch zone
                </div>
              </div>

              {/* Bowl at bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="h-16 w-28 rounded-b-[3rem] rounded-t-lg border-2 border-secondary/40 bg-secondary/10 backdrop-blur-sm" />
                  <div className="absolute -top-1 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full border border-secondary/30 bg-secondary/20" />
                  {/* Layers in bowl */}
                  <div className="absolute bottom-1 left-1/2 flex w-24 -translate-x-1/2 flex-col-reverse gap-[2px]">
                    {caughtLayers.slice(-6).map((layer, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`h-2 rounded-full ${layer.precision > 70 ? "bg-primary/50" : layer.precision > 40 ? "bg-secondary/50" : "bg-accent/50"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Falling items */}
              <AnimatePresence>
                {fallingItems.filter((i) => !i.missed).map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={item.caught ? { scale: 1.5, opacity: 0, y: 20 } : { scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: item.caught ? 0.3 : 0.1 }}
                    onClick={() => catchItem(item.id)}
                    className="absolute z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-card/90 shadow-lg backdrop-blur-sm transition-transform active:scale-90"
                    style={{
                      left: `calc(${item.x}% - 24px)`,
                      top: `calc(${item.y}% - 24px)`,
                    }}
                  >
                    <span className="text-2xl">{item.ingredient.emoji}</span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Combo flash */}
              {combo >= 3 && (
                <motion.div
                  key={combo}
                  initial={{ opacity: 1, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-primary"
                >
                  🔥 x{combo}
                </motion.div>
              )}
            </div>

            {/* Progress */}
            <Progress value={((GAME_DURATION - timeLeft) / GAME_DURATION) * 100} className="h-1.5 bg-muted/70" />
          </div>
        )}

        {phase === "result" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl"
            >
              🍰
            </motion.div>
            <div>
              <h3 className={`text-2xl font-bold ${verdict.tone}`}>{verdict.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{verdict.note}</p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Score</div>
                <div className="mt-1 text-lg font-bold text-primary">{score}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Caught</div>
                <div className="mt-1 text-lg font-bold text-secondary">{caught}/{totalSpawned}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Best Combo</div>
                <div className="mt-1 text-lg font-bold text-accent">x{maxCombo}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Missed</div>
                <div className="mt-1 text-lg font-bold text-destructive">{missedCount}</div>
              </div>
            </div>

            {/* Bowl summary */}
            <div className="rounded-[1.4rem] border border-border bg-muted/35 p-4">
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Your Tiramisu</p>
              <div className="mx-auto flex max-w-[200px] flex-col-reverse gap-1 rounded-b-[3rem] rounded-t-xl border-2 border-secondary/30 bg-secondary/5 p-3 pb-4">
                {caughtLayers.length === 0 ? (
                  <div className="py-6 text-xs text-muted-foreground">Empty bowl 😬</div>
                ) : (
                  caughtLayers.map((layer, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs ${layer.ingredient.color}`}
                    >
                      <span>{layer.ingredient.emoji}</span>
                      <span className="text-foreground/70">{layer.ingredient.label}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setPhase("intro")}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Cook Again 🔥
            </button>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
};

export default TiramisuBuilder;

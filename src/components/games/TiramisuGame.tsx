import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type Ingredient = { id: string; emoji: string; label: string; color: string };

const RECIPE_ORDER: Ingredient[] = [
  { id: "espresso", emoji: "☕", label: "Espresso", color: "bg-amber-900/30 border-amber-700/40" },
  { id: "ladyfinger", emoji: "🍪", label: "Ladyfingers", color: "bg-yellow-800/20 border-yellow-600/40" },
  { id: "mascarpone", emoji: "🧀", label: "Mascarpone", color: "bg-orange-100/20 border-orange-200/40" },
  { id: "egg", emoji: "🥚", label: "Egg Yolks", color: "bg-yellow-400/15 border-yellow-400/40" },
  { id: "sugar", emoji: "🍬", label: "Sugar", color: "bg-pink-200/15 border-pink-300/40" },
  { id: "cocoa", emoji: "🟤", label: "Cocoa Powder", color: "bg-amber-800/25 border-amber-700/40" },
  { id: "marsala", emoji: "🍷", label: "Marsala Wine", color: "bg-red-900/20 border-red-800/40" },
  { id: "vanilla", emoji: "🌿", label: "Vanilla", color: "bg-green-800/15 border-green-700/40" },
];

type Phase = "intro" | "prep" | "build" | "speed" | "result";

type FallingItem = {
  id: string;
  ingredient: Ingredient;
  x: number;
  y: number;
  speed: number;
  caught: boolean;
  missed: boolean;
};

const CATCH_ZONE_Y = 78;

const TiramisuGame = () => {
  const [phase, setPhase] = useState<Phase>("intro");

  // Prep phase state
  const [prepOrder, setPrepOrder] = useState<Ingredient[]>([]);
  const [shuffledIngredients, setShuffledIngredients] = useState<Ingredient[]>([]);
  const [prepCorrect, setPrepCorrect] = useState(0);
  const [prepMistakes, setPrepMistakes] = useState(0);
  const [prepFlash, setPrepFlash] = useState<string | null>(null);

  // Build phase state
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [buildScore, setBuildScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [buildTimeLeft, setBuildTimeLeft] = useState(25);

  // Speed phase state
  const [speedTargets, setSpeedTargets] = useState<{ id: string; emoji: string; x: number; y: number; hit: boolean }[]>([]);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(15);

  // Total scores
  const [tasteScore, setTasteScore] = useState(0);
  const [presentationScore, setPresentationScore] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const animRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const itemsRef = useRef<FallingItem[]>([]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // === PREP PHASE ===
  const startPrep = () => {
    const shuffled = [...RECIPE_ORDER].sort(() => Math.random() - 0.5);
    setShuffledIngredients(shuffled);
    setPrepOrder([]);
    setPrepCorrect(0);
    setPrepMistakes(0);
    setPhase("prep");
  };

  const handlePrepTap = (ingredient: Ingredient) => {
    const expectedIndex = prepOrder.length;
    if (ingredient.id === RECIPE_ORDER[expectedIndex].id) {
      const newOrder = [...prepOrder, ingredient];
      setPrepOrder(newOrder);
      setPrepCorrect((c) => c + 1);
      setPrepFlash("✅");
      setTimeout(() => setPrepFlash(null), 400);
      if (newOrder.length === RECIPE_ORDER.length) {
        const taste = Math.max(0, 100 - prepMistakes * 12);
        setTasteScore(taste);
        setTimeout(() => startBuild(), 800);
      }
    } else {
      setPrepMistakes((m) => m + 1);
      setPrepFlash("❌");
      setTimeout(() => setPrepFlash(null), 400);
    }
  };

  // === BUILD PHASE ===
  const spawnBuildItem = useCallback(() => {
    const ingredient = RECIPE_ORDER[Math.floor(Math.random() * RECIPE_ORDER.length)];
    const item: FallingItem = {
      id: `${Date.now()}-${Math.random()}`,
      ingredient,
      x: 10 + Math.random() * 80,
      y: -10,
      speed: 20 + Math.random() * 15,
      caught: false,
      missed: false,
    };
    itemsRef.current = [...itemsRef.current, item];
    setFallingItems([...itemsRef.current]);
  }, []);

  const buildGameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const updated = itemsRef.current
      .map((item) => {
        if (item.caught || item.missed) return item;
        const newY = item.y + item.speed * delta;
        if (newY > 100) {
          setCombo(0);
          return { ...item, y: 100, missed: true };
        }
        return { ...item, y: newY };
      })
      .filter((item) => !(item.missed && item.y >= 100));

    itemsRef.current = updated;
    setFallingItems([...updated]);
    animRef.current = requestAnimationFrame(buildGameLoop);
  }, []);

  const startBuild = () => {
    setFallingItems([]);
    setCaughtCount(0);
    setBuildScore(0);
    setCombo(0);
    setBuildTimeLeft(25);
    itemsRef.current = [];
    lastTimeRef.current = 0;
    setPhase("build");

    spawnRef.current = window.setInterval(spawnBuildItem, 1100);
    timerRef.current = window.setInterval(() => {
      setBuildTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    animRef.current = requestAnimationFrame(buildGameLoop);
    spawnBuildItem();
  };

  useEffect(() => {
    if (buildTimeLeft === 0 && phase === "build") {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnRef.current);
      clearInterval(timerRef.current);
      setPresentationScore(Math.min(100, Math.round(buildScore / 3)));
      setTimeout(() => startSpeed(), 500);
    }
  }, [buildTimeLeft, phase]);

  const catchBuildItem = (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item || item.caught || item.missed) return;
    const distance = Math.abs(item.y - CATCH_ZONE_Y);
    const precision = Math.max(0, Math.round(100 - distance * 3));
    const newCombo = combo + 1;
    const points = Math.round((precision + newCombo * 10) * (1 + precision / 100));

    itemsRef.current = itemsRef.current.map((i) => (i.id === itemId ? { ...i, caught: true } : i));
    setFallingItems([...itemsRef.current]);
    setCaughtCount((c) => c + 1);
    setBuildScore((s) => s + points);
    setCombo(newCombo);

    setTimeout(() => {
      itemsRef.current = itemsRef.current.filter((i) => i.id !== itemId);
      setFallingItems([...itemsRef.current]);
    }, 300);
  };

  // === SPEED PHASE ===
  const startSpeed = () => {
    setSpeedScore(0);
    setSpeedTimeLeft(15);
    setPhase("speed");
    spawnSpeedTargets();

    timerRef.current = window.setInterval(() => {
      setSpeedTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
  };

  const spawnSpeedTargets = () => {
    const targets = Array.from({ length: 6 }, (_, i) => ({
      id: `speed-${Date.now()}-${i}`,
      emoji: RECIPE_ORDER[i % RECIPE_ORDER.length].emoji,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      hit: false,
    }));
    setSpeedTargets(targets);
  };

  useEffect(() => {
    if (speedTimeLeft === 0 && phase === "speed") {
      clearInterval(timerRef.current);
      setSpeedBonus(speedScore * 5);
      setPhase("result");
    }
  }, [speedTimeLeft, phase, speedScore]);

  const hitSpeedTarget = (id: string) => {
    setSpeedTargets((prev) => prev.map((t) => (t.id === id ? { ...t, hit: true } : t)));
    setSpeedScore((s) => s + 1);
    // Respawn after hit
    setTimeout(() => {
      setSpeedTargets((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                id: `speed-${Date.now()}-${Math.random()}`,
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 70,
                hit: false,
              }
            : t
        )
      );
    }, 200);
  };

  const totalScore = tasteScore + presentationScore + speedBonus;
  const getVerdict = () => {
    if (totalScore >= 250) return { title: "🏆 Master Pasticciere", note: "Nonna would be proud. Michelin-star tiramisu.", tone: "text-primary" };
    if (totalScore >= 150) return { title: "✨ Café Owner Energy", note: "Solid technique, great instincts.", tone: "text-secondary" };
    if (totalScore >= 80) return { title: "😅 Ambitious Home Cook", note: "Some mess, but the spirit was there.", tone: "text-accent" };
    return { title: "🚨 Kitchen Disaster", note: "The smoke alarm went off.", tone: "text-destructive" };
  };

  return (
    <GameFrame title="🍰 Tiramisu Kitchen" subtitle="Cook the perfect tiramisu — prep, build, and speed decorate!" badge="3 rounds">
      <div className="space-y-4">
        {phase === "intro" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">🧑‍🍳 How to play:</p>
              <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                <li><span className="text-primary font-bold">Round 1 — Prep:</span> Tap ingredients in the correct recipe order</li>
                <li><span className="text-secondary font-bold">Round 2 — Build:</span> Catch falling ingredients in the bowl (25s)</li>
                <li><span className="text-accent font-bold">Round 3 — Speed:</span> Tap to decorate as fast as possible (15s)</li>
              </ul>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {RECIPE_ORDER.map((ing) => (
                <div key={ing.id} className={`rounded-xl border p-2 text-center ${ing.color}`}>
                  <div className="text-xl">{ing.emoji}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{ing.label}</div>
                </div>
              ))}
            </div>
            <button onClick={startPrep} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              Start Cooking 🔥
            </button>
          </motion.div>
        )}

        {phase === "prep" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Round 1 — Prep</p>
              <p className="text-sm text-foreground mt-1">Tap ingredients in the correct order!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Progress: {prepOrder.length}/{RECIPE_ORDER.length} • Mistakes: {prepMistakes}
              </p>
            </div>

            {/* Order so far */}
            <div className="flex gap-1 justify-center min-h-[40px] flex-wrap">
              {prepOrder.map((ing, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">
                  {ing.emoji}
                </motion.div>
              ))}
              {prepFlash && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1.3 }} className="text-2xl">
                  {prepFlash}
                </motion.div>
              )}
            </div>

            {/* Ingredient grid */}
            <div className="grid grid-cols-4 gap-2">
              {shuffledIngredients.map((ing) => {
                const alreadyPicked = prepOrder.some((p) => p.id === ing.id);
                return (
                  <motion.button
                    key={ing.id}
                    whileTap={{ scale: 0.9 }}
                    disabled={alreadyPicked}
                    onClick={() => handlePrepTap(ing)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      alreadyPicked
                        ? "opacity-30 cursor-not-allowed border-border"
                        : `${ing.color} cursor-pointer hover:scale-105`
                    }`}
                  >
                    <div className="text-2xl">{ing.emoji}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{ing.label}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint */}
            <p className="text-[10px] text-center text-muted-foreground/60">
              Hint: Espresso → Ladyfingers → Mascarpone → Egg → Sugar → Cocoa → Marsala → Vanilla
            </p>
          </motion.div>
        )}

        {phase === "build" && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Round 2 — Build</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Time</div>
                <div className={`mt-1 text-lg font-bold ${buildTimeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>{buildTimeLeft}s</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Score</div>
                <div className="mt-1 text-lg font-bold text-primary">{buildScore}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Combo</div>
                <div className="mt-1 text-lg font-bold text-secondary">x{combo}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-2">
                <div className="text-muted-foreground">Caught</div>
                <div className="mt-1 text-lg font-bold text-accent">{caughtCount}</div>
              </div>
            </div>

            <div
              className="relative h-[300px] overflow-hidden rounded-[1.4rem] border border-border bg-gradient-to-b from-background/80 via-muted/30 to-muted/60"
              style={{ touchAction: "none" }}
            >
              <div className="absolute inset-x-4 h-10 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5" style={{ top: `${CATCH_ZONE_Y - 4}%` }}>
                <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-primary/50">catch zone</div>
              </div>

              <AnimatePresence>
                {fallingItems.filter((i) => !i.missed).map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={item.caught ? { scale: 1.5, opacity: 0, y: 20 } : { scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => catchBuildItem(item.id)}
                    className="absolute z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-card/90 shadow-lg backdrop-blur-sm active:scale-90"
                    style={{ left: `calc(${item.x}% - 22px)`, top: `calc(${item.y}% - 22px)` }}
                  >
                    <span className="text-xl">{item.ingredient.emoji}</span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {combo >= 3 && (
                <motion.div key={combo} initial={{ opacity: 1, scale: 0.8 }} animate={{ opacity: 0, scale: 1.5 }} transition={{ duration: 0.6 }} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-primary">
                  🔥 x{combo}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {phase === "speed" && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Round 3 — Speed Decorate</p>
              <p className="text-sm text-foreground mt-1">Tap the ingredients as fast as you can!</p>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Time: <span className={`font-bold ${speedTimeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>{speedTimeLeft}s</span></span>
              <span>Taps: <span className="text-primary font-bold">{speedScore}</span></span>
            </div>

            <div className="relative h-[300px] overflow-hidden rounded-[1.4rem] border border-border bg-gradient-to-b from-background/80 to-muted/40" style={{ touchAction: "none" }}>
              {speedTargets.map((target) => (
                <motion.button
                  key={target.id}
                  initial={{ scale: 0 }}
                  animate={target.hit ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => hitSpeedTarget(target.id)}
                  className="absolute flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-lg active:bg-primary/30"
                  style={{ left: `calc(${target.x}% - 24px)`, top: `calc(${target.y}% - 24px)` }}
                >
                  <span className="text-xl">{target.emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-6xl">🍰</motion.div>
            {(() => {
              const verdict = getVerdict();
              return (
                <div>
                  <h3 className={`text-2xl font-bold ${verdict.tone}`}>{verdict.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{verdict.note}</p>
                </div>
              );
            })()}

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Taste</div>
                <div className="mt-1 text-lg font-bold text-primary">{tasteScore}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Presentation</div>
                <div className="mt-1 text-lg font-bold text-secondary">{presentationScore}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Speed Bonus</div>
                <div className="mt-1 text-lg font-bold text-accent">{speedBonus}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Total</div>
                <div className="mt-1 text-lg font-bold text-foreground">{totalScore}</div>
              </div>
            </div>

            <button onClick={() => setPhase("intro")} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              Cook Again 🔥
            </button>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
};

export default TiramisuGame;

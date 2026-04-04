import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

/*
 * Arrow Puzzle — Tap-Away Style
 * Grid filled with arrows pointing in different directions.
 * Tap an arrow whose path ahead is clear (no arrows blocking) to remove it.
 * Clear the entire grid to win. Tapping a blocked arrow costs a life.
 */

type Direction = "up" | "down" | "left" | "right";

interface ArrowCell {
  id: number;
  direction: Direction;
  row: number;
  col: number;
  removed: boolean;
}

interface Level {
  name: string;
  gridSize: number;
  lives: number;
  seed: number;
}

interface Position {
  row: number;
  col: number;
}

const LEVELS: Level[] = [
  { name: "Level 1 — Gentle Start", gridSize: 3, lives: 5, seed: 42 },
  { name: "Level 2 — Warming Up", gridSize: 4, lives: 5, seed: 77 },
  { name: "Level 3 — Getting Tricky", gridSize: 4, lives: 4, seed: 123 },
  { name: "Level 4 — Sharp Mind", gridSize: 5, lives: 4, seed: 256 },
  { name: "Level 5 — Arrow Master", gridSize: 5, lives: 3, seed: 999 },
  { name: "Level 6 — Flow State", gridSize: 6, lives: 4, seed: 314 },
  { name: "Level 7 — Deep Focus", gridSize: 6, lives: 3, seed: 512 },
  { name: "Level 8 — Zen Master", gridSize: 7, lives: 3, seed: 777 },
];

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];
const ARROW_ROTATIONS: Record<Direction, string> = { up: "rotate(-90deg)", right: "rotate(0deg)", down: "rotate(90deg)", left: "rotate(180deg)" };

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getClearDirections(position: Position, activePositions: Position[]): Direction[] {
  const { row, col } = position;

  return DIRECTIONS.filter((direction) => {
    switch (direction) {
      case "up":
        return !activePositions.some((cell) => cell.col === col && cell.row < row);
      case "down":
        return !activePositions.some((cell) => cell.col === col && cell.row > row);
      case "left":
        return !activePositions.some((cell) => cell.row === row && cell.col < col);
      case "right":
        return !activePositions.some((cell) => cell.row === row && cell.col > col);
      default:
        return false;
    }
  });
}

function generateGrid(size: number, seed: number): ArrowCell[] {
  const rng = seededRandom(seed);
  const remainingPositions: Position[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      remainingPositions.push({ row: r, col: c });
    }
  }

  const generated: ArrowCell[] = [];

  while (remainingPositions.length > 0) {
    const candidates = remainingPositions
      .map((position) => ({ position, clearDirections: getClearDirections(position, remainingPositions) }))
      .filter((entry) => entry.clearDirections.length > 0);

    const chosenCandidate = candidates[Math.floor(rng() * candidates.length)];
    const chosenDirection = chosenCandidate.clearDirections[Math.floor(rng() * chosenCandidate.clearDirections.length)];

    generated.push({
      id: chosenCandidate.position.row * size + chosenCandidate.position.col,
      direction: chosenDirection,
      row: chosenCandidate.position.row,
      col: chosenCandidate.position.col,
      removed: false,
    });

    const removalIndex = remainingPositions.findIndex(
      (position) => position.row === chosenCandidate.position.row && position.col === chosenCandidate.position.col,
    );

    remainingPositions.splice(removalIndex, 1);
  }

  return generated.sort((a, b) => a.row - b.row || a.col - b.col);
}

function isPathClear(cell: ArrowCell, allCells: ArrowCell[]): boolean {
  const { direction, row, col } = cell;
  const activeCells = allCells.filter((c) => !c.removed && c.id !== cell.id);

  switch (direction) {
    case "up":
      return !activeCells.some((c) => c.col === col && c.row < row);
    case "down":
      return !activeCells.some((c) => c.col === col && c.row > row);
    case "left":
      return !activeCells.some((c) => c.row === row && c.col < col);
    case "right":
      return !activeCells.some((c) => c.row === row && c.col > col);
    default:
      return false;
  }
}

const ArrowPuzzle = () => {
  const [levelIdx, setLevelIdx] = useState<number | null>(null);
  const [cells, setCells] = useState<ArrowCell[]>([]);
  const [lives, setLives] = useState(0);
  const [maxLives, setMaxLives] = useState(0);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [boardSeed, setBoardSeed] = useState(0);

  const remaining = cells.filter((c) => !c.removed).length;
  const solved = remaining === 0 && levelIdx !== null && !gameOver;

  const gridSize = levelIdx !== null ? LEVELS[levelIdx].gridSize : 0;

  const hintCellId = useMemo(() => {
    if (!showHint) return null;
    const active = cells.filter((c) => !c.removed);
    const clearCell = active.find((c) => isPathClear(c, cells));
    return clearCell?.id ?? null;
  }, [showHint, cells]);

  const initLevel = useCallback((idx: number, seedOffset?: number) => {
    const lvl = LEVELS[idx];
    const nextSeed = seedOffset ?? Date.now();
    setBoardSeed(nextSeed);
    setCells(generateGrid(lvl.gridSize, lvl.seed + nextSeed));
    setLives(lvl.lives);
    setMaxLives(lvl.lives);
    setLevelIdx(idx);
    setShakeId(null);
    setShowHint(false);
    setGameOver(false);
  }, []);

  const handleTap = (cell: ArrowCell) => {
    if (cell.removed || solved || gameOver) return;

    if (isPathClear(cell, cells)) {
      setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, removed: true } : c)));
      setShowHint(false);
    } else {
      setShakeId(cell.id);
      setTimeout(() => setShakeId(null), 500);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameOver(true);
    }
  };

  const cellSize = gridSize <= 4 ? 64 : gridSize <= 5 ? 54 : gridSize <= 6 ? 46 : 40;

  const dirColor: Record<Direction, string> = {
    up: "text-primary",
    down: "text-secondary",
    left: "text-accent",
    right: "text-foreground",
  };

  return (
    <GameFrame title="🧩 Arrow Puzzle" subtitle="Tap arrows to clear the grid. Find free paths!" badge="logic">
      {levelIdx === null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">📋 How to Play</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>🎯 <strong>Goal:</strong> Clear all arrows from the grid</li>
              <li>👆 <strong>Tap</strong> an arrow whose path ahead is clear (no arrows blocking it)</li>
              <li>❌ Tapping a <strong>blocked</strong> arrow costs a life</li>
              <li>💡 Use <strong>Hint</strong> to highlight a safe arrow</li>
              <li>🧠 Plan the order — think before you tap!</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((lvl, i) => (
              <button key={i} onClick={() => initLevel(i)} className="rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
                <span className="font-bold text-foreground">{lvl.name}</span>
                <span className="block text-xs text-muted-foreground mt-1">{lvl.gridSize}×{lvl.gridSize} • {lvl.lives} lives</span>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{LEVELS[levelIdx].name}</span>
            <div className="flex items-center gap-3">
              <span>Remaining: <strong className="text-foreground">{remaining}</strong></span>
              <span>Lives: <strong className={lives <= 1 ? "text-destructive" : "text-foreground"}>{"❤️".repeat(lives)}{"🖤".repeat(maxLives - lives)}</strong></span>
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
              }}
            >
              {cells.map((cell) => {
                const isHinted = hintCellId === cell.id;
                const isClear = !cell.removed && isPathClear(cell, cells, gridSize);
                return (
                  <AnimatePresence key={cell.id}>
                    {!cell.removed ? (
                      <motion.button
                        layout
                        initial={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        animate={
                          cell.removed
                            ? { scale: 0, opacity: 0, rotate: 180 }
                            : shakeId === cell.id
                              ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
                              : { scale: 1, opacity: 1, x: 0, rotate: 0 }
                        }
                        onClick={() => handleTap(cell)}
                        className={`rounded-xl border-2 flex items-center justify-center transition-all duration-200 select-none ${
                          isHinted
                            ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                            : cell.removed
                              ? "pointer-events-none border-border/30 bg-muted/10 opacity-0"
                              : "border-border bg-card hover:bg-muted/60"
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                        title={isClear ? "Path is clear — tap to remove!" : "Path is blocked"}
                        disabled={cell.removed}
                      >
                        <span
                          className={`text-2xl font-bold ${dirColor[cell.direction]} transition-transform`}
                          style={{ transform: ARROW_ROTATIONS[cell.direction], display: "inline-block" }}
                        >
                          ➤
                        </span>
                      </motion.button>
                  </AnimatePresence>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                <div className="text-5xl">🎉</div>
                <p className="text-lg font-bold text-primary">Grid Cleared!</p>
                <p className="text-xs text-muted-foreground">Finished with {lives}/{maxLives} lives remaining</p>
              </motion.div>
            )}
            {gameOver && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                <div className="text-5xl">💔</div>
                <p className="text-lg font-bold text-destructive">Out of Lives!</p>
                <p className="text-xs text-muted-foreground">{remaining} arrows remaining — try again!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setShowHint(!showHint)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              💡 {showHint ? "Hide Hint" : "Hint"}
            </button>
              <button onClick={() => initLevel(levelIdx, Date.now() + boardSeed + 1)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              🔄 Restart
            </button>
            <button onClick={() => setLevelIdx(null)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              ← Levels
            </button>
            {solved && levelIdx < LEVELS.length - 1 && (
              <button onClick={() => initLevel(levelIdx + 1)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                Next Level →
              </button>
            )}
              {gameOver && (
               <button onClick={() => initLevel(levelIdx, Date.now() + boardSeed + 1)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </GameFrame>
  );
};

export default ArrowPuzzle;

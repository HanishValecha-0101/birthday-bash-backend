import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameFrame from "./GameFrame";

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
const ARROW_ROTATIONS: Record<Direction, string> = {
  up: "rotate(-90deg)",
  right: "rotate(0deg)",
  down: "rotate(90deg)",
  left: "rotate(180deg)",
};

const DIRECTION_COLORS: Record<Direction, string> = {
  up: "text-primary",
  down: "text-secondary",
  left: "text-accent",
  right: "text-muted-foreground",
};

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getClearDirections(position: Position, activePositions: Position[]): Direction[] {
  return DIRECTIONS.filter((direction) => {
    switch (direction) {
      case "up":
        return !activePositions.some((cell) => cell.col === position.col && cell.row < position.row);
      case "down":
        return !activePositions.some((cell) => cell.col === position.col && cell.row > position.row);
      case "left":
        return !activePositions.some((cell) => cell.row === position.row && cell.col < position.col);
      case "right":
        return !activePositions.some((cell) => cell.row === position.row && cell.col > position.col);
      default:
        return false;
    }
  });
}

function generateSolvableGrid(size: number, seed: number): ArrowCell[] {
  const random = seededRandom(seed);
  const remaining: Position[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      remaining.push({ row, col });
    }
  }

  const orderedCells: ArrowCell[] = [];

  while (remaining.length > 0) {
    const candidates = remaining
      .map((position) => ({ position, exits: getClearDirections(position, remaining) }))
      .filter((candidate) => candidate.exits.length > 0);

    const chosen = candidates[Math.floor(random() * candidates.length)];
    const direction = chosen.exits[Math.floor(random() * chosen.exits.length)];

    orderedCells.push({
      id: chosen.position.row * size + chosen.position.col,
      row: chosen.position.row,
      col: chosen.position.col,
      direction,
      removed: false,
    });

    const nextRemaining = remaining.findIndex(
      (position) => position.row === chosen.position.row && position.col === chosen.position.col,
    );

    remaining.splice(nextRemaining, 1);
  }

  return orderedCells.sort((a, b) => a.row - b.row || a.col - b.col);
}

function isPathClear(cell: ArrowCell, cells: ArrowCell[]) {
  const activeCells = cells.filter((entry) => !entry.removed && entry.id !== cell.id);

  switch (cell.direction) {
    case "up":
      return !activeCells.some((entry) => entry.col === cell.col && entry.row < cell.row);
    case "down":
      return !activeCells.some((entry) => entry.col === cell.col && entry.row > cell.row);
    case "left":
      return !activeCells.some((entry) => entry.row === cell.row && entry.col < cell.col);
    case "right":
      return !activeCells.some((entry) => entry.row === cell.row && entry.col > cell.col);
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

  const remaining = cells.filter((cell) => !cell.removed).length;
  const solved = levelIdx !== null && remaining === 0 && !gameOver;
  const gridSize = levelIdx !== null ? LEVELS[levelIdx].gridSize : 0;
  const cellSize = gridSize <= 4 ? 64 : gridSize <= 5 ? 54 : gridSize <= 6 ? 46 : 40;

  const hintCellId = useMemo(() => {
    if (!showHint) return null;

    return cells.find((cell) => !cell.removed && isPathClear(cell, cells))?.id ?? null;
  }, [cells, showHint]);

  const initLevel = useCallback((idx: number, freshSeed = Date.now()) => {
    const level = LEVELS[idx];

    setBoardSeed(freshSeed);
    setCells(generateSolvableGrid(level.gridSize, level.seed + freshSeed));
    setLives(level.lives);
    setMaxLives(level.lives);
    setLevelIdx(idx);
    setShakeId(null);
    setShowHint(false);
    setGameOver(false);
  }, []);

  const restartLevel = () => {
    if (levelIdx === null) return;
    initLevel(levelIdx, Date.now() + boardSeed + 1);
  };

  const handleTap = (cell: ArrowCell) => {
    if (cell.removed || solved || gameOver) return;

    if (isPathClear(cell, cells)) {
      setCells((current) => current.map((entry) => (entry.id === cell.id ? { ...entry, removed: true } : entry)));
      setShowHint(false);
      return;
    }

    setShakeId(cell.id);
    window.setTimeout(() => setShakeId(null), 350);

    setLives((current) => {
      const nextLives = current - 1;

      if (nextLives <= 0) {
        setGameOver(true);
      }

      return nextLives;
    });
  };

  return (
    <GameFrame title="🧩 Arrow Puzzle" subtitle="Tap arrows with a free path and clear the whole board." badge="logic">
      {levelIdx === null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="space-y-2 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">📋 How to Play</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>🎯 Clear the grid by tapping arrows with an open path.</li>
              <li>👆 If another arrow blocks the way, that tap costs one life.</li>
              <li>💡 Use Hint when you want one safe move highlighted.</li>
              <li>🔄 Restart always gives you a fresh solvable board.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((level, index) => (
              <button
                key={level.name}
                onClick={() => initLevel(index)}
                className="rounded-xl border border-border bg-muted/40 p-3 text-left text-sm transition-colors hover:bg-muted/70"
              >
                <span className="font-bold text-foreground">{level.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {level.gridSize}×{level.gridSize} • {level.lives} lives
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{LEVELS[levelIdx].name}</span>
            <div className="flex items-center gap-3">
              <span>
                Remaining: <strong className="text-foreground">{remaining}</strong>
              </span>
              <span>
                Lives: <strong className={lives <= 1 ? "text-destructive" : "text-foreground"}>{"❤️".repeat(lives)}{"🖤".repeat(maxLives - lives)}</strong>
              </span>
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
                const isClear = !cell.removed && isPathClear(cell, cells);

                return (
                  <motion.button
                    key={cell.id}
                    layout
                    initial={false}
                    animate={
                      cell.removed
                        ? { scale: 0.25, opacity: 0 }
                        : shakeId === cell.id
                          ? { x: [0, -6, 6, -4, 4, 0] }
                          : { scale: 1, opacity: 1, x: 0 }
                    }
                    transition={{ duration: 0.25 }}
                    onClick={() => handleTap(cell)}
                    disabled={cell.removed}
                    title={isClear ? "Path is clear — tap to remove" : "This arrow is blocked"}
                    className={`flex items-center justify-center rounded-xl border-2 transition-all duration-200 select-none ${
                      isHinted
                        ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                        : cell.removed
                          ? "pointer-events-none border-border/30 bg-muted/10"
                          : "border-border bg-card hover:bg-muted/60"
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {!cell.removed ? (
                      <span
                        className={`text-2xl font-bold ${DIRECTION_COLORS[cell.direction]}`}
                        style={{ transform: ARROW_ROTATIONS[cell.direction], display: "inline-block" }}
                      >
                        ➤
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {solved ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2 text-center">
                <div className="text-5xl">🎉</div>
                <p className="text-lg font-bold text-primary">Grid Cleared!</p>
                <p className="text-xs text-muted-foreground">Finished with {lives}/{maxLives} lives remaining</p>
              </motion.div>
            ) : null}

            {gameOver ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2 text-center">
                <div className="text-5xl">💔</div>
                <p className="text-lg font-bold text-destructive">Out of Lives!</p>
                <p className="text-xs text-muted-foreground">{remaining} arrows remaining — try a fresh layout.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setShowHint((current) => !current)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              💡 {showHint ? "Hide Hint" : "Hint"}
            </button>
            <button onClick={restartLevel} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              🔄 Restart
            </button>
            <button onClick={() => setLevelIdx(null)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              ← Levels
            </button>
            {solved && levelIdx < LEVELS.length - 1 ? (
              <button onClick={() => initLevel(levelIdx + 1)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                Next Level →
              </button>
            ) : null}
            {gameOver ? (
              <button onClick={restartLevel} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                Try Again
              </button>
            ) : null}
          </div>
        </div>
      )}
    </GameFrame>
  );
};

export default ArrowPuzzle;
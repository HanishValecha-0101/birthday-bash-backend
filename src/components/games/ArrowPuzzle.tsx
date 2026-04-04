import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

/*
 * Arrow Puzzle — A logic puzzle game where you place arrows on a grid
 * to create a path from Start to Goal. Obstacles block your way.
 * 5 levels of increasing difficulty.
 */

type Direction = "up" | "down" | "left" | "right" | null;
type CellType = "empty" | "wall" | "start" | "end";

interface Cell {
  type: CellType;
  arrow: Direction;
}

interface Level {
  name: string;
  hint: string;
  size: number;
  grid: CellType[][];
  start: [number, number];
  end: [number, number];
}

const LEVELS: Level[] = [
  {
    name: "Level 1 — Warm Up",
    hint: "Just go right and down!",
    size: 4,
    grid: [
      ["start", "empty", "empty", "empty"],
      ["empty", "empty", "wall", "empty"],
      ["empty", "empty", "empty", "empty"],
      ["empty", "wall", "empty", "end"],
    ],
    start: [0, 0],
    end: [3, 3],
  },
  {
    name: "Level 2 — Zigzag",
    hint: "You'll need to change direction twice.",
    size: 5,
    grid: [
      ["start", "empty", "wall", "empty", "empty"],
      ["wall", "empty", "wall", "empty", "wall"],
      ["empty", "empty", "empty", "empty", "empty"],
      ["empty", "wall", "wall", "empty", "wall"],
      ["empty", "empty", "empty", "empty", "end"],
    ],
    start: [0, 0],
    end: [4, 4],
  },
  {
    name: "Level 3 — Labyrinth",
    hint: "There's only one valid route — find it.",
    size: 5,
    grid: [
      ["start", "empty", "wall", "empty", "empty"],
      ["empty", "wall", "empty", "empty", "wall"],
      ["empty", "empty", "empty", "wall", "empty"],
      ["wall", "wall", "empty", "empty", "empty"],
      ["empty", "empty", "wall", "empty", "end"],
    ],
    start: [0, 0],
    end: [4, 4],
  },
  {
    name: "Level 4 — Spiral",
    hint: "Think outside-in.",
    size: 6,
    grid: [
      ["start", "empty", "empty", "empty", "empty", "empty"],
      ["wall", "wall", "wall", "wall", "empty", "empty"],
      ["empty", "empty", "empty", "wall", "empty", "wall"],
      ["empty", "wall", "empty", "empty", "empty", "wall"],
      ["empty", "wall", "wall", "wall", "empty", "empty"],
      ["empty", "empty", "empty", "empty", "wall", "end"],
    ],
    start: [0, 0],
    end: [5, 5],
  },
  {
    name: "Level 5 — Mastermind",
    hint: "Every arrow counts. No room for error.",
    size: 7,
    grid: [
      ["empty", "empty", "wall", "empty", "empty", "empty", "empty"],
      ["start", "empty", "wall", "empty", "wall", "empty", "wall"],
      ["wall", "empty", "empty", "empty", "wall", "empty", "empty"],
      ["empty", "empty", "wall", "empty", "empty", "empty", "wall"],
      ["empty", "wall", "empty", "empty", "wall", "empty", "empty"],
      ["empty", "empty", "empty", "wall", "empty", "empty", "wall"],
      ["wall", "empty", "wall", "empty", "empty", "empty", "end"],
    ],
    start: [1, 0],
    end: [6, 6],
  },
];

const ARROW_ICONS: Record<string, string> = { up: "↑", down: "↓", left: "←", right: "→" };
const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

const ArrowPuzzle = () => {
  const [levelIdx, setLevelIdx] = useState<number | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solved, setSolved] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [simulating, setSimulating] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const initLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx];
    const g: Cell[][] = lvl.grid.map((row) => row.map((type) => ({ type, arrow: null })));
    setGrid(g);
    setLevelIdx(idx);
    setSolved(false);
    setPath([]);
    setSimulating(false);
    setMoves(0);
    setShowHint(false);
  }, []);

  const cycleArrow = (r: number, c: number) => {
    if (simulating || solved) return;
    const cell = grid[r][c];
    if (cell.type !== "empty") return;
    const currentIdx = cell.arrow ? DIRECTIONS.indexOf(cell.arrow) : -1;
    const nextIdx = currentIdx + 1;
    const nextArrow = nextIdx >= DIRECTIONS.length ? null : DIRECTIONS[nextIdx];
    setGrid((prev) => {
      const copy = prev.map((row) => row.map((c) => ({ ...c })));
      copy[r][c].arrow = nextArrow;
      return copy;
    });
    setMoves((m) => m + 1);
  };

  const simulate = useCallback(() => {
    if (levelIdx === null) return;
    const lvl = LEVELS[levelIdx];
    setSimulating(true);
    const visited = new Set<string>();
    const trail: [number, number][] = [];
    let [r, c] = lvl.start;
    trail.push([r, c]);

    const maxSteps = lvl.size * lvl.size * 2;
    let success = false;

    for (let step = 0; step < maxSteps; step++) {
      const key = `${r},${c}`;
      if (visited.has(key)) break;
      visited.add(key);
      if (r === lvl.end[0] && c === lvl.end[1]) { success = true; break; }

      const cell = grid[r][c];
      let dir = cell.arrow;
      if (cell.type === "start" && !dir) dir = "right";
      if (!dir) break;

      const moves: Record<string, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
      const [dr, dc] = moves[dir];
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= lvl.size || nc < 0 || nc >= lvl.size) break;
      if (grid[nr][nc].type === "wall") break;

      r = nr; c = nc;
      trail.push([r, c]);
    }

    setPath(trail);
    if (success) setSolved(true);
    setTimeout(() => setSimulating(false), 500);
  }, [grid, levelIdx]);

  const reset = () => { if (levelIdx !== null) initLevel(levelIdx); };

  const cellSize = levelIdx !== null && LEVELS[levelIdx].size > 5 ? 44 : 52;

  return (
    <GameFrame title="🧩 Arrow Puzzle" subtitle="Place arrows to guide the path from Start to Goal!" badge="logic">
      {levelIdx === null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">📋 How to Play</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>🟢 Guide the path from <strong>Start</strong> to <strong>Goal</strong></li>
              <li>🖱️ Click empty cells to place direction arrows (↑→↓←)</li>
              <li>🧱 Dark cells are walls — you can't pass through</li>
              <li>▶️ Press <strong>"Simulate"</strong> to test your path</li>
              <li>🔄 Click an arrow again to cycle or remove it</li>
            </ul>
          </div>
          {LEVELS.map((lvl, i) => (
            <button key={i} onClick={() => initLevel(i)} className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
              <span className="font-bold text-foreground">{lvl.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">{lvl.size}×{lvl.size} grid • {lvl.hint}</span>
            </button>
          ))}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{LEVELS[levelIdx].name}</span>
            <span>Moves: {moves}</span>
          </div>

          <div className="flex justify-center">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${LEVELS[levelIdx].size}, 1fr)`, width: `${LEVELS[levelIdx].size * (cellSize + 4)}px` }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isOnPath = path.some(([pr, pc]) => pr === r && pc === c);
                  const isStart = cell.type === "start";
                  const isEnd = cell.type === "end";
                  const isWall = cell.type === "wall";
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onClick={() => cycleArrow(r, c)}
                      whileTap={cell.type === "empty" ? { scale: 0.9 } : undefined}
                      className={`rounded-lg border flex items-center justify-center text-lg cursor-pointer select-none transition-all duration-200 ${
                        isStart
                          ? "border-primary bg-primary/20"
                          : isEnd
                          ? "border-secondary bg-secondary/20"
                          : isWall
                          ? "border-border bg-muted/80 cursor-not-allowed"
                          : isOnPath && solved
                          ? "border-primary bg-primary/25 shadow-sm"
                          : isOnPath
                          ? "border-destructive bg-destructive/15"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                      style={{ width: cellSize, height: cellSize }}
                    >
                      {isStart ? <span className="text-base font-bold text-primary">S</span>
                        : isEnd ? <span className="text-base font-bold text-secondary">G</span>
                        : isWall ? <span className="text-sm">🧱</span>
                        : cell.arrow ? <span className="text-xl font-bold text-foreground">{ARROW_ICONS[cell.arrow]}</span>
                        : <span className="text-xs text-muted-foreground/30">·</span>
                      }
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <p className="text-lg font-bold text-primary">Puzzle Solved!</p>
                <p className="text-xs text-muted-foreground">Completed in {moves} moves</p>
              </motion.div>
            )}
            {path.length > 0 && !solved && !simulating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="text-xs text-destructive">Path didn't reach the goal — try adjusting your arrows!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={simulate} disabled={simulating} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
              ▶ Simulate
            </button>
            <button onClick={reset} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              🔄 Reset
            </button>
            <button onClick={() => setShowHint(!showHint)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              💡 Hint
            </button>
            <button onClick={() => setLevelIdx(null)} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              ← Levels
            </button>
            {solved && levelIdx < LEVELS.length - 1 && (
              <button onClick={() => initLevel(levelIdx + 1)} className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground">
                Next Level →
              </button>
            )}
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center text-xs text-muted-foreground bg-muted/40 rounded-xl p-2 border border-border">
                💡 {LEVELS[levelIdx].hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </GameFrame>
  );
};

export default ArrowPuzzle;

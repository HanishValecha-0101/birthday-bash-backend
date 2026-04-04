import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type Direction = "up" | "down" | "left" | "right" | null;
type CellType = "empty" | "mountain" | "ocean" | "cloud" | "start" | "end";

interface Cell {
  type: CellType;
  arrow: Direction;
}

interface Level {
  name: string;
  size: number;
  grid: CellType[][];
  start: [number, number];
  end: [number, number];
}

const LEVELS: Level[] = [
  {
    name: "Level 1 — First Steps",
    size: 4,
    grid: [
      ["start", "empty", "empty", "empty"],
      ["empty", "empty", "mountain", "empty"],
      ["empty", "empty", "empty", "empty"],
      ["empty", "empty", "empty", "end"],
    ],
    start: [0, 0],
    end: [3, 3],
  },
  {
    name: "Level 2 — Ocean Crossing",
    size: 5,
    grid: [
      ["start", "empty", "ocean", "empty", "empty"],
      ["empty", "empty", "ocean", "empty", "empty"],
      ["empty", "empty", "empty", "empty", "mountain"],
      ["cloud", "empty", "empty", "empty", "empty"],
      ["empty", "empty", "mountain", "empty", "end"],
    ],
    start: [0, 0],
    end: [4, 4],
  },
  {
    name: "Level 3 — Mountain Pass",
    size: 5,
    grid: [
      ["start", "empty", "mountain", "empty", "empty"],
      ["empty", "mountain", "empty", "empty", "cloud"],
      ["empty", "empty", "empty", "mountain", "empty"],
      ["ocean", "ocean", "empty", "empty", "empty"],
      ["empty", "empty", "empty", "empty", "end"],
    ],
    start: [0, 0],
    end: [4, 4],
  },
  {
    name: "Level 4 — Narrow Strait",
    size: 6,
    grid: [
      ["start", "empty", "ocean", "ocean", "empty", "empty"],
      ["empty", "empty", "empty", "ocean", "empty", "mountain"],
      ["mountain", "empty", "empty", "empty", "empty", "empty"],
      ["empty", "cloud", "mountain", "empty", "cloud", "empty"],
      ["empty", "empty", "empty", "empty", "empty", "empty"],
      ["ocean", "empty", "mountain", "empty", "empty", "end"],
    ],
    start: [0, 0],
    end: [5, 5],
  },
  {
    name: "Level 5 — Homecoming",
    size: 6,
    grid: [
      ["empty", "empty", "mountain", "ocean", "empty", "empty"],
      ["start", "empty", "empty", "ocean", "empty", "cloud"],
      ["mountain", "empty", "empty", "empty", "empty", "empty"],
      ["empty", "cloud", "ocean", "mountain", "empty", "empty"],
      ["empty", "empty", "empty", "empty", "cloud", "empty"],
      ["empty", "mountain", "empty", "empty", "empty", "end"],
    ],
    start: [1, 0],
    end: [5, 5],
  },
];

const ARROW_ICONS: Record<string, string> = { up: "↑", down: "↓", left: "←", right: "→" };
const CELL_ICONS: Record<CellType, string> = { empty: "", mountain: "⛰️", ocean: "🌊", cloud: "☁️", start: "🇮🇪", end: "🇮🇳" };
const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

const ArrowPuzzle = () => {
  const [levelIdx, setLevelIdx] = useState<number | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solved, setSolved] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [simulating, setSimulating] = useState(false);

  const initLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx];
    const g: Cell[][] = lvl.grid.map((row) => row.map((type) => ({ type, arrow: null })));
    setGrid(g);
    setLevelIdx(idx);
    setSolved(false);
    setPath([]);
    setSimulating(false);
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
      if (cell.type === "start" && !dir) {
        // Auto-move right from start if no arrow
        dir = "right";
      }
      if (!dir) break;

      const moves: Record<string, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
      const [dr, dc] = moves[dir];
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= lvl.size || nc < 0 || nc >= lvl.size) break;
      const nextCell = grid[nr][nc];
      if (nextCell.type === "mountain" || nextCell.type === "ocean" || nextCell.type === "cloud") break;

      r = nr;
      c = nc;
      trail.push([r, c]);
    }

    setPath(trail);
    if (success) setSolved(true);
    setTimeout(() => setSimulating(false), 500);
  }, [grid, levelIdx]);

  const reset = () => {
    if (levelIdx !== null) initLevel(levelIdx);
  };

  return (
    <GameFrame title="✈️ Dublin → India" subtitle="Place arrows to guide the traveler home!" badge="puzzle">
      {levelIdx === null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">📋 How to Play</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>🇮🇪 Guide the traveler from Dublin to India 🇮🇳</li>
              <li>🖱️ Click empty cells to place direction arrows</li>
              <li>⛰️ Avoid mountains, oceans, and clouds</li>
              <li>▶️ Press "Go" to simulate the journey</li>
              <li>🔄 Click an arrow cell again to cycle directions</li>
            </ul>
          </div>
          {LEVELS.map((lvl, i) => (
            <button key={i} onClick={() => initLevel(i)} className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left text-sm hover:bg-muted/70 transition-colors">
              <span className="font-bold text-foreground">{lvl.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">{lvl.size}×{lvl.size} grid</span>
            </button>
          ))}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="text-center text-xs text-muted-foreground">
            {LEVELS[levelIdx].name} • Click cells to place arrows
          </div>

          <div className="flex justify-center">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${LEVELS[levelIdx].size}, 1fr)`, width: `${LEVELS[levelIdx].size * 56}px` }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isOnPath = path.some(([pr, pc]) => pr === r && pc === c);
                  const isObstacle = cell.type === "mountain" || cell.type === "ocean" || cell.type === "cloud";
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onClick={() => cycleArrow(r, c)}
                      whileTap={cell.type === "empty" ? { scale: 0.9 } : undefined}
                      className={`w-[52px] h-[52px] rounded-xl border flex items-center justify-center text-lg cursor-pointer select-none transition-colors ${
                        isOnPath && solved
                          ? "border-primary bg-primary/20"
                          : isOnPath
                          ? "border-secondary bg-secondary/20"
                          : isObstacle
                          ? "border-border bg-muted/60 cursor-not-allowed"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      {cell.type !== "empty"
                        ? <span className="text-xl">{CELL_ICONS[cell.type]}</span>
                        : cell.arrow
                        ? <span className="text-xl font-bold text-foreground">{ARROW_ICONS[cell.arrow]}</span>
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
                <p className="text-lg font-bold text-dublin-green">Welcome Home!</p>
                <p className="text-xs text-muted-foreground">The traveler made it from Dublin to India! 💚</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-2">
            <button onClick={simulate} disabled={simulating} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
              ▶ Go!
            </button>
            <button onClick={reset} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground">
              🔄 Reset
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

          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>⛰️ Mountain</span>
            <span>🌊 Ocean</span>
            <span>☁️ Cloud</span>
          </div>
        </div>
      )}
    </GameFrame>
  );
};

export default ArrowPuzzle;

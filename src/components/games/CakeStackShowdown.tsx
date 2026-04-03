import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";

import GameFrame from "./GameFrame";

type Player = {
  id: number;
  name: string;
  score: number;
  drops: number[];
};

const totalRounds = 9;
const targetCenter = 50;
const movementDuration = 1800;

const createPlayer = (id: number, name = `Player ${id}`): Player => ({
  id,
  name,
  score: 0,
  drops: [],
});

const CakeStackShowdown = () => {
  const [players, setPlayers] = useState<Player[]>([createPlayer(1), createPlayer(2)]);
  const [phase, setPhase] = useState<"setup" | "playing" | "result">("setup");
  const [turn, setTurn] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(0);
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(null);

  const normalizedPlayers = useMemo(
    () => players.map((player, index) => ({ ...player, name: player.name.trim() || `Player ${index + 1}` })),
    [players],
  );

  const activePlayerIndex = turn % normalizedPlayers.length;
  const activePlayer = normalizedPlayers[activePlayerIndex];
  const progress = Math.round((turn / totalRounds) * 100);
  const leaderboard = [...normalizedPlayers].sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (phase !== "playing" || turnStartedAt === null) return;

    let frame = 0;
    const animate = () => {
      const elapsed = performance.now() - turnStartedAt;
      const position = ((Math.sin((elapsed / movementDuration) * Math.PI * 2) + 1) / 2) * 100;
      setMarkerPosition(position);
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, turnStartedAt]);

  const updatePlayerName = (id: number, name: string) => {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const addPlayer = () => {
    if (players.length >= 4) return;
    setPlayers((current) => [...current, createPlayer(current.length + 1)]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 2) return;
    setPlayers((current) => current.filter((player) => player.id !== id));
  };

  const startGame = () => {
    setPlayers(normalizedPlayers.map((player, index) => createPlayer(index + 1, player.name)));
    setTurn(0);
    setMarkerPosition(0);
    setTurnStartedAt(performance.now());
    setPhase("playing");
  };

  const dropLayer = () => {
    if (phase !== "playing") return;

    const precision = Math.max(0, Math.round(100 - Math.abs(markerPosition - targetCenter) * 2));

    const updatedPlayers = normalizedPlayers.map((player, index) =>
      index === activePlayerIndex
        ? { ...player, score: player.score + precision, drops: [...player.drops, precision] }
        : player,
    );

    setPlayers(updatedPlayers);

    if (turn + 1 >= totalRounds) {
      setPhase("result");
      setTurn((current) => current + 1);
      return;
    }

    setTurn((current) => current + 1);
    setTurnStartedAt(performance.now());
  };

  const reset = () => {
    setPlayers(normalizedPlayers.map((player, index) => createPlayer(index + 1, player.name)));
    setTurn(0);
    setMarkerPosition(0);
    setTurnStartedAt(null);
    setPhase("setup");
  };

  return (
    <GameFrame
      title="🎂 Cake Stack Showdown"
      subtitle="A local multiplayer timing game — pass the phone, drop your layer, and build the cleanest birthday cake."
      badge="multi-player"
    >
      <div className="space-y-5">
        {phase === "setup" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Everyone gets turns. Tap when the moving cream layer hits the center zone for the cleanest stack.
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className="flex gap-2">
                  <input
                    value={player.name}
                    onChange={(event) => updatePlayerName(player.id, event.target.value)}
                    className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    placeholder={`Player ${index + 1}`}
                  />
                  <button
                    onClick={() => removePlayer(player.id)}
                    disabled={players.length <= 2}
                    className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={addPlayer}
                disabled={players.length >= 4}
                className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                Add player
              </button>
              <button onClick={startGame} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                Start showdown
              </button>
            </div>
          </div>
        ) : null}

        {phase === "playing" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Round {turn + 1}/{totalRounds}</span>
              <span>
                Now stacking: <span className="text-secondary">{activePlayer?.name}</span>
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-muted/70" />

            <div className="rounded-[1.6rem] border border-border bg-muted/45 p-4">
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Hit the center glaze zone</span>
                <span>Closer = more points</span>
              </div>

              <div className="relative h-20 rounded-2xl border border-border bg-background/40">
                <div className="absolute inset-y-3 left-1/2 w-16 -translate-x-1/2 rounded-xl border border-primary/40 bg-primary/15" />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-secondary/40 bg-secondary/20 text-center text-2xl leading-9"
                  style={{ left: `calc(${markerPosition}% - 20px)` }}
                >
                  🍰
                </motion.div>
              </div>

              <button onClick={dropLayer} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                Drop the layer
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {normalizedPlayers.map((player) => (
                <div key={player.id} className="rounded-[1.4rem] border border-border bg-muted/35 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{player.name}</span>
                    <span className="text-secondary">{player.score}</span>
                  </div>

                  <div className="mt-3 flex h-28 items-end justify-center rounded-2xl border border-border/70 bg-background/35 p-2">
                    <div className="relative flex w-24 flex-col items-center justify-end gap-1">
                      {player.drops.map((drop, index) => {
                        const offset = Math.round((50 - drop / 2) / 3);
                        return (
                          <div
                            key={`${player.id}-${index}-${drop}`}
                            className="h-4 rounded-full border border-secondary/40 bg-secondary/20"
                            style={{ width: `${44 + drop * 0.22}px`, transform: `translateX(${offset}px)` }}
                          />
                        );
                      })}
                      <div className="h-3 w-28 rounded-full border border-border bg-muted/70" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🏁</div>
            <div>
              <h3 className="text-xl font-bold text-primary">{leaderboard[0]?.name} built the best cake</h3>
              <p className="mt-2 text-sm text-muted-foreground">Closest stacks win. Messy layers are still funny though.</p>
            </div>

            <div className="space-y-3 text-left">
              {leaderboard.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                  <span className="text-foreground">#{index + 1} {player.name}</span>
                  <span className="font-bold text-secondary">{player.score} pts</span>
                </div>
              ))}
            </div>

            <button onClick={reset} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              Play again
            </button>
          </div>
        ) : null}
      </div>
    </GameFrame>
  );
};

export default CakeStackShowdown;
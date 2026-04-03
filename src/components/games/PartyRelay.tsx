import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import GameFrame from "./GameFrame";

type Player = {
  id: number;
  name: string;
  score: number;
};

type Challenge = {
  title: string;
  prompt: string;
  mode: string;
  icon: string;
};

const challengeDeck: Challenge[] = [
  {
    title: "Serenade Sprint",
    prompt: "Sing one line for the birthday boy like you are closing a sold-out stadium show.",
    mode: "sing",
    icon: "🎤",
  },
  {
    title: "Photo Chaos",
    prompt: "Take a fast group selfie with the most dramatic serious faces possible.",
    mode: "photo",
    icon: "📸",
  },
  {
    title: "Memory Flash",
    prompt: "Tell a mini story about him in exactly five words. No more, no less.",
    mode: "story",
    icon: "🧠",
  },
  {
    title: "Dessert Pitch",
    prompt: "Sell your dream tiramisu in ten seconds like it is a luxury launch.",
    mode: "pitch",
    icon: "🍰",
  },
  {
    title: "Emoji Roast",
    prompt: "Describe the birthday boy using only sounds and emoji names. No normal words.",
    mode: "chaos",
    icon: "😂",
  },
  {
    title: "Pose Battle",
    prompt: "Strike a freeze-frame pose that screams birthday poster cover art.",
    mode: "pose",
    icon: "🕺",
  },
  {
    title: "Guess the Mood",
    prompt: "Hum a song mood and let the room guess the vibe in under eight seconds.",
    mode: "guess",
    icon: "🎶",
  },
  {
    title: "Compliment Relay",
    prompt: "Drop the nicest over-the-top compliment you can without repeating anyone else.",
    mode: "social",
    icon: "💚",
  },
  {
    title: "Camera Director",
    prompt: "Direct a two-person birthday portrait in under fifteen seconds.",
    mode: "director",
    icon: "🎬",
  },
];

const shuffleChallenges = () => {
  return [...challengeDeck]
    .map((challenge) => ({ challenge, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ challenge }) => challenge);
};

const createPlayer = (id: number, name = `Player ${id}`): Player => ({ id, name, score: 0 });

const PartyRelay = ({ className }: { className?: string }) => {
  const [players, setPlayers] = useState<Player[]>([createPlayer(1), createPlayer(2)]);
  const [phase, setPhase] = useState<"setup" | "playing" | "result">("setup");
  const [deck, setDeck] = useState<Challenge[]>(() => shuffleChallenges().slice(0, 8));
  const [turnIndex, setTurnIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);

  const normalizedPlayers = useMemo(
    () => players.map((player, index) => ({ ...player, name: player.name.trim() || `Player ${index + 1}` })),
    [players],
  );

  const activePlayerIndex = turnIndex % normalizedPlayers.length;
  const activePlayer = normalizedPlayers[activePlayerIndex];
  const activeChallenge = deck[roundIndex];
  const progress = Math.round((roundIndex / deck.length) * 100);
  const sortedPlayers = [...normalizedPlayers].sort((a, b) => b.score - a.score);

  const updatePlayerName = (id: number, name: string) => {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const addPlayer = () => {
    if (players.length >= 6) return;
    setPlayers((current) => [...current, createPlayer(current.length + 1)]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 2) return;
    setPlayers((current) => current.filter((player) => player.id !== id));
  };

  const startGame = () => {
    setPlayers(normalizedPlayers);
    setDeck(shuffleChallenges().slice(0, 8));
    setTurnIndex(0);
    setRoundIndex(0);
    setPhase("playing");
  };

  const scoreTurn = (points: number) => {
    const updatedPlayers = normalizedPlayers.map((player, index) =>
      index === activePlayerIndex ? { ...player, score: player.score + points } : player,
    );

    setPlayers(updatedPlayers);

    if (roundIndex === deck.length - 1) {
      setPhase("result");
      return;
    }

    setRoundIndex((current) => current + 1);
    setTurnIndex((current) => current + 1);
  };

  const reset = () => {
    setPlayers(normalizedPlayers.map((player, index) => createPlayer(index + 1, player.name)));
    setDeck(shuffleChallenges().slice(0, 8));
    setTurnIndex(0);
    setRoundIndex(0);
    setPhase("setup");
  };

  return (
    <GameFrame
      title="🎉 Party Relay"
      subtitle="A local multiplayer birthday showdown with singing, photo, pose, and chaos rounds."
      badge="multi-player"
      className={className}
    >
      <div className="space-y-5">
        {phase === "setup" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              Pass the phone, rotate turns, and let the room vote the score after every challenge.
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
                disabled={players.length >= 6}
                className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                Add player
              </button>
              <button
                onClick={startGame}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Start relay
              </button>
            </div>
          </div>
        ) : null}

        {phase === "playing" && activeChallenge ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Round {roundIndex + 1}/{deck.length}</span>
              <span>Now playing: <span className="text-secondary">{activePlayer.name}</span></span>
            </div>
            <Progress value={progress} className="h-2 bg-muted/70" />

            <motion.div
              key={`${activePlayer.id}-${roundIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.6rem] border border-border bg-muted/55 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{activeChallenge.mode}</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{activeChallenge.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeChallenge.prompt}</p>
                </div>
                <div className="text-4xl">{activeChallenge.icon}</div>
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Nailed it", points: 3, tone: "bg-primary text-primary-foreground" },
                { label: "Pretty good", points: 2, tone: "bg-secondary text-secondary-foreground" },
                { label: "Pure chaos", points: 1, tone: "bg-accent text-accent-foreground" },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => scoreTurn(option.points)}
                  className={cn("rounded-xl px-4 py-3 text-sm font-bold", option.tone)}
                >
                  {option.label} +{option.points}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {sortedPlayers.map((player) => (
                <div key={player.id} className="rounded-2xl border border-border bg-muted/40 p-3 text-sm">
                  <div className="text-muted-foreground">{player.name}</div>
                  <div className="mt-1 text-xl font-bold text-foreground">{player.score}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🏁</div>
            <div>
              <h3 className="text-xl font-bold text-primary">{sortedPlayers[0]?.name} wins the relay</h3>
              <p className="mt-2 text-sm text-muted-foreground">The room has spoken. Birthday bragging rights assigned.</p>
            </div>

            <div className="space-y-3 text-left">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                  <span className="text-foreground">#{index + 1} {player.name}</span>
                  <span className="font-bold text-secondary">{player.score} pts</span>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Reset relay
            </button>
          </div>
        ) : null}
      </div>
    </GameFrame>
  );
};

export default PartyRelay;
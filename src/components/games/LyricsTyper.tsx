import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";

import GameFrame from "./GameFrame";

type Round = {
  id: number;
  title: string;
  cue: string;
  lyric: string;
  vibe: string;
};

const rounds: Round[] = [
  {
    id: 1,
    title: "Soundcheck",
    cue: "Warm up the room before the birthday chorus drops.",
    lyric: "light the candles let the whole room sing tonight",
    vibe: "warm-up",
  },
  {
    id: 2,
    title: "Main Chorus",
    cue: "Keep the combo alive when the crowd gets loud.",
    lyric: "birthday king in the spotlight stealing every frame",
    vibe: "chorus",
  },
  {
    id: 3,
    title: "Bridge",
    cue: "Make it sweeter, smoother, and slightly dramatic.",
    lyric: "tiramisu dreams and camera flashes all around",
    vibe: "bridge",
  },
  {
    id: 4,
    title: "Finale",
    cue: "Last round. Go full main-character energy.",
    lyric: "one more song one more laugh one more memory tonight",
    vibe: "finale",
  },
];

const getRoundAccuracy = (typed: string, target: string) => {
  const correct = target.split("").filter((char, index) => typed[index] === char).length;
  return Math.round((correct / target.length) * 100);
};

const getPerformanceVerdict = (score: number, accuracy: number, maxCombo: number) => {
  if (score >= 620 && accuracy >= 95 && maxCombo >= 4) {
    return {
      title: "🎤 Stadium Headliner",
      note: "You owned the mic, the room, and probably the afterparty too.",
      tone: "text-primary",
    };
  }

  if (score >= 480 && accuracy >= 88) {
    return {
      title: "✨ Chorus Royalty",
      note: "Strong vocals, sharp fingers, zero stage fear.",
      tone: "text-secondary",
    };
  }

  if (score >= 320) {
    return {
      title: "🎶 Reliable Backup Star",
      note: "You kept the party alive even when the beat got messy.",
      tone: "text-accent",
    };
  }

  return {
    title: "🪩 Crowd Hype Intern",
    note: "Chaotic, lovable, and definitely invited back for round two.",
    tone: "text-dracula-pink",
  };
};

const LyricsTyper = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [completedAccuracies, setCompletedAccuracies] = useState<number[]>([]);

  const currentRound = rounds[roundIndex];
  const currentAccuracy = getRoundAccuracy(typed, currentRound.lyric);
  const crowdMeter = Math.min(100, 24 + completedAccuracies.length * 18 + combo * 12 + Math.round(currentAccuracy / 4));

  const averageAccuracy = useMemo(() => {
    if (completedAccuracies.length === 0) return 0;
    return Math.round(completedAccuracies.reduce((sum, value) => sum + value, 0) / completedAccuracies.length);
  }, [completedAccuracies]);

  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
    }
  }, [phase, roundIndex]);

  const reset = () => {
    setPhase("intro");
    setRoundIndex(0);
    setTyped("");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCompletedAccuracies([]);
  };

  const handleTyping = (value: string) => {
    if (phase !== "playing") return;

    const expectedCharacter = currentRound.lyric[value.length - 1];
    const typedCharacter = value[value.length - 1];

    setTyped(value);

    if (value.length > typed.length && typedCharacter !== expectedCharacter) {
      setCombo(0);
    }

    if (value === currentRound.lyric) {
      const roundAccuracy = getRoundAccuracy(value, currentRound.lyric);
      const nextCombo = combo + 1;
      const gainedScore = 90 + roundAccuracy * 2 + nextCombo * 18;

      setScore((previous) => previous + gainedScore);
      setCombo(nextCombo);
      setMaxCombo((previous) => Math.max(previous, nextCombo));
      setCompletedAccuracies((previous) => [...previous, roundAccuracy]);

      if (roundIndex === rounds.length - 1) {
        setTimeout(() => {
          setPhase("result");
          setTyped("");
        }, 400);
        return;
      }

      setTimeout(() => {
        setRoundIndex((previous) => previous + 1);
        setTyped("");
      }, 400);
    }
  };

  const performance = getPerformanceVerdict(score, averageAccuracy, maxCombo);

  return (
    <GameFrame
      title="🎤 Lyrics Typer"
      subtitle="A proper birthday performance mode with rounds, combo pressure, and a final stage verdict."
      badge="solo"
    >
      <div className="space-y-5" onClick={() => inputRef.current?.focus()}>
        {phase === "intro" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="text-foreground">4 rounds • live combo meter • final performance rank</p>
              <p className="mt-2 text-xs">Click start, keep typing exactly, and don’t lose the crowd.</p>
            </div>

            <button
              onClick={() => setPhase("playing")}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Start the set
            </button>
          </div>
        ) : null}

        {phase === "playing" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Round</div>
                <div className="mt-1 text-lg font-bold text-foreground">{roundIndex + 1}/4</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Combo</div>
                <div className="mt-1 text-lg font-bold text-secondary">x{combo}</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Score</div>
                <div className="mt-1 text-lg font-bold text-primary">{score}</div>
              </div>
            </div>

            <div className="space-y-2 rounded-[1.4rem] border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>{currentRound.title}</span>
                <span className="text-accent">{currentRound.vibe}</span>
              </div>
              <p className="text-xs text-muted-foreground">{currentRound.cue}</p>
              <p className="mt-3 break-words font-mono text-base leading-relaxed text-foreground">
                {currentRound.lyric.split("").map((character, index) => {
                  let className = "text-muted-foreground/45";

                  if (index < typed.length) {
                    className = typed[index] === character ? "text-primary" : "text-destructive underline";
                  } else if (index === typed.length) {
                    className = "cursor-blink border-b border-secondary text-foreground";
                  }

                  return (
                    <span key={`${currentRound.id}-${index}`} className={className}>
                      {character === " " ? "\u00A0" : character}
                    </span>
                  );
                })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Crowd meter</span>
                <span>{crowdMeter}%</span>
              </div>
              <Progress value={crowdMeter} className="h-2 bg-muted/70" />
            </div>

            <input
              ref={inputRef}
              value={typed}
              onChange={(event) => handleTyping(event.target.value)}
              placeholder="Type the lyric exactly..."
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Live accuracy</span>
              <span className="text-secondary">{currentAccuracy}%</span>
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <div className="text-5xl">🪩</div>
            <div>
              <h3 className={`text-xl font-bold ${performance.tone}`}>{performance.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{performance.note}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Final score</div>
                <div className="mt-1 text-lg font-bold text-primary">{score}</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Accuracy</div>
                <div className="mt-1 text-lg font-bold text-secondary">{averageAccuracy}%</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="text-muted-foreground">Best combo</div>
                <div className="mt-1 text-lg font-bold text-accent">x{maxCombo}</div>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Run it back
            </button>
          </motion.div>
        ) : null}
      </div>
    </GameFrame>
  );
};

export default LyricsTyper;
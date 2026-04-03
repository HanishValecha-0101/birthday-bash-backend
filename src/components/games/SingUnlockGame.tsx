import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

const SingUnlockGame = () => {
  const [phase, setPhase] = useState<"idle" | "listening" | "unlocked">("idle");
  const [volume, setVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);

  const spawnConfetti = () => {
    const emojis = ["🎉", "🎂", "🎊", "🎈", "✨", "💖", "🥳", "🍰"];
    const newC = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setConfetti(newC);
    setTimeout(() => setConfetti([]), 3000);
  };

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  const startListening = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      progressRef.current = 0;
      setProgress(0);
      setPhase("listening");

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(100, (avg / 128) * 100);
        setVolume(normalized);

        if (normalized > 30) {
          progressRef.current = Math.min(100, progressRef.current + normalized * 0.015);
        } else {
          progressRef.current = Math.max(0, progressRef.current - 0.3);
        }
        setProgress(progressRef.current);

        if (progressRef.current >= 100) {
          stopListening();
          setPhase("unlocked");
          spawnConfetti();
          return;
        }

        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Microphone access denied. Please allow mic access to play this game.");
    }
  };

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const reset = () => {
    stopListening();
    setPhase("idle");
    setVolume(0);
    setProgress(0);
    setConfetti([]);
  };

  const meterBars = 20;

  return (
    <GameFrame title="🎤 Sing To Unlock" subtitle="Sing Happy Birthday loudly to unlock the surprise!" badge="mic">
      {phase === "idle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center py-4">
          <div className="text-5xl">🎤</div>
          <p className="text-sm text-muted-foreground">
            Sing or speak loudly into your microphone to fill the meter and unlock a hidden birthday surprise!
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button onClick={startListening} className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            Start Singing 🎶
          </button>
        </motion.div>
      )}

      {phase === "listening" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">🎵 "Happy Birthday to you..." 🎵</p>
            <p className="text-xs text-muted-foreground">Keep singing! Fill the meter!</p>
          </div>

          {/* Volume meter */}
          <div className="flex items-end justify-center gap-1 h-32">
            {Array.from({ length: meterBars }, (_, i) => {
              const barHeight = ((i + 1) / meterBars) * 100;
              const isActive = volume > (i / meterBars) * 100;
              const hue = 135 + (i / meterBars) * 190;
              return (
                <motion.div
                  key={i}
                  className="w-3 rounded-t-sm"
                  animate={{
                    height: isActive ? `${barHeight}%` : "4px",
                    opacity: isActive ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.05 }}
                  style={{
                    backgroundColor: isActive ? `hsl(${hue}, 80%, 60%)` : "hsl(var(--muted))",
                  }}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-4 rounded-full bg-muted/60 overflow-hidden border border-border">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))`,
                }}
              />
            </div>
          </div>

          <button onClick={reset} className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            Stop
          </button>
        </div>
      )}

      {phase === "unlocked" && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative text-center space-y-4 py-6">
          <AnimatePresence>
            {confetti.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{ opacity: 0, y: -60, scale: 0.5 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="absolute text-xl pointer-events-none"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                {c.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-bold text-foreground">Surprise Unlocked!</h3>
          <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-2">
            <p className="text-dracula-pink font-bold text-lg">Happy 30th Birthday! 🎂</p>
            <p className="text-sm text-muted-foreground">
              console.log("You're not just a year older, you're a version upgrade! 🚀")
            </p>
            <p className="text-xs text-dracula-cyan mt-2">
              // Here's to 30 more years of code, goals, and tiramisu! 💚
            </p>
          </div>
          <button onClick={reset} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">
            Play Again
          </button>
        </motion.div>
      )}
    </GameFrame>
  );
};

export default SingUnlockGame;

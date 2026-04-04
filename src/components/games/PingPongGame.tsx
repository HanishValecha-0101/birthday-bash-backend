import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

const PADDLE_H = 80;
const PADDLE_W = 12;
const BALL_R = 8;
const CANVAS_W = 600;
const CANVAS_H = 360;
const WIN_SCORE = 7;
const INITIAL_SPEED = 4;

const PingPongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const [scores, setScores] = useState([0, 0]);
  const [winner, setWinner] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [finalSpeed, setFinalSpeed] = useState(INITIAL_SPEED);

  const stateRef = useRef({
    p1Y: CANVAS_H / 2 - PADDLE_H / 2,
    p2Y: CANVAS_H / 2 - PADDLE_H / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H / 2,
    ballVX: INITIAL_SPEED,
    ballVY: INITIAL_SPEED * 0.6,
    speed: INITIAL_SPEED,
    scores: [0, 0],
  });

  const resetBall = useCallback(() => {
    const s = stateRef.current;
    s.ballX = CANVAS_W / 2;
    s.ballY = CANVAS_H / 2;
    s.speed = Math.min(s.speed + 0.3, 12);
    const dir = Math.random() > 0.5 ? 1 : -1;
    s.ballVX = s.speed * dir;
    s.ballVY = (Math.random() - 0.5) * s.speed;
  }, []);

  const startGame = useCallback(() => {
    setStarted(true);
    setScores([0, 0]);
    setWinner(null);
    setPaused(false);
    setFinalSpeed(INITIAL_SPEED);
    const s = stateRef.current;
    s.p1Y = CANVAS_H / 2 - PADDLE_H / 2;
    s.p2Y = CANVAS_H / 2 - PADDLE_H / 2;
    s.speed = INITIAL_SPEED;
    s.scores = [0, 0];
    resetBall();
  }, [resetBall]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Touch controls for mobile
  const touchStartY = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (touchStartY.current === null) return;
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff < -5) { keysRef.current.add("w"); keysRef.current.delete("s"); }
      else if (diff > 5) { keysRef.current.add("s"); keysRef.current.delete("w"); }
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = () => { keysRef.current.delete("w"); keysRef.current.delete("s"); touchStartY.current = null; };
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => { canvas.removeEventListener("touchstart", onTouchStart); canvas.removeEventListener("touchmove", onTouchMove); canvas.removeEventListener("touchend", onTouchEnd); };
  }, [started]);

  // Game loop
  useEffect(() => {
    if (!started || winner || paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      const s = stateRef.current;
      const keys = keysRef.current;
      const paddleSpeed = 5;

      // P1 (W/S or touch)
      if (keys.has("w") && s.p1Y > 0) s.p1Y -= paddleSpeed;
      if (keys.has("s") && s.p1Y < CANVAS_H - PADDLE_H) s.p1Y += paddleSpeed;

      // AI opponent
      const center = s.p2Y + PADDLE_H / 2;
      const diff = s.ballY - center;
      const aiSpeed = Math.min(paddleSpeed * 0.7, Math.abs(diff));
      if (diff > 2) s.p2Y += aiSpeed;
      if (diff < -2) s.p2Y -= aiSpeed;
      s.p2Y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, s.p2Y));

      // Ball
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      if (s.ballY <= BALL_R || s.ballY >= CANVAS_H - BALL_R) s.ballVY *= -1;

      // Left paddle
      if (s.ballX - BALL_R <= PADDLE_W + 8 && s.ballY >= s.p1Y && s.ballY <= s.p1Y + PADDLE_H && s.ballVX < 0) {
        s.ballVX = Math.abs(s.ballVX) * 1.05;
        s.ballVY = ((s.ballY - s.p1Y) / PADDLE_H - 0.5) * s.speed * 1.5;
      }

      // Right paddle
      if (s.ballX + BALL_R >= CANVAS_W - PADDLE_W - 8 && s.ballY >= s.p2Y && s.ballY <= s.p2Y + PADDLE_H && s.ballVX > 0) {
        s.ballVX = -Math.abs(s.ballVX) * 1.05;
        s.ballVY = ((s.ballY - s.p2Y) / PADDLE_H - 0.5) * s.speed * 1.5;
      }

      // Scoring
      if (s.ballX < 0) {
        s.scores[1]++;
        setScores([...s.scores]);
        if (s.scores[1] >= WIN_SCORE) { setFinalSpeed(Math.round(s.speed * 10) / 10); setWinner("🤖 Robot Wins!"); return; }
        resetBall();
      }
      if (s.ballX > CANVAS_W) {
        s.scores[0]++;
        setScores([...s.scores]);
        if (s.scores[0] >= WIN_SCORE) { setFinalSpeed(Math.round(s.speed * 10) / 10); setWinner("🏆 You Win!"); return; }
        resetBall();
      }

      // Draw
      ctx.fillStyle = "hsl(231 15% 18%)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = "hsl(232 14% 31%)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_W / 2, 0);
      ctx.lineTo(CANVAS_W / 2, CANVAS_H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = "hsl(135 95% 65%)";
      ctx.fillRect(8, s.p1Y, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "hsl(0 100% 67%)";
      ctx.fillRect(CANVAS_W - PADDLE_W - 8, s.p2Y, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillStyle = "hsl(60 30% 96%)";
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      // Scores
      ctx.fillStyle = "hsl(225 27% 51%)";
      ctx.font = "bold 32px 'Fira Code', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(s.scores[0]), CANVAS_W / 2 - 50, 40);
      ctx.fillText(String(s.scores[1]), CANVAS_W / 2 + 50, 40);

      // Speed indicator
      ctx.fillStyle = "hsl(225 27% 41%)";
      ctx.font = "11px 'Fira Code', monospace";
      ctx.fillText(`Speed: ${s.speed.toFixed(1)}x`, CANVAS_W / 2, CANVAS_H - 12);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started, winner, paused, resetBall]);

  return (
    <GameFrame title="🏓 Ping Pong" subtitle="First to 7 wins! You vs AI." badge="arcade">
      {!started ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">📋 How to Play</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>🏓 First to {WIN_SCORE} points wins</li>
              <li>⌨️ Use <strong>W / S</strong> keys to move your paddle</li>
              <li>📱 On mobile, <strong>swipe up/down</strong> on the canvas</li>
              <li>⚡ Ball speed increases after each point</li>
              <li>🎯 Hit the ball at paddle edges for sharp angles</li>
            </ul>
          </div>
          <button onClick={startGame} className="w-full rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground">
            🤖 Play vs AI
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-primary font-bold">You: {scores[0]}</span>
            <span>vs 🤖 • First to {WIN_SCORE}</span>
            <span className="text-destructive font-bold">AI: {scores[1]}</span>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-2xl border border-border w-full max-w-[600px]"
              style={{ imageRendering: "pixelated", touchAction: "none" }}
            />
          </div>

          <AnimatePresence>
            {winner && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
                <div className="text-3xl">{winner}</div>
                <p className="text-sm text-muted-foreground">Final: {scores[0]} – {scores[1]}</p>
                <p className="text-xs text-muted-foreground">Max ball speed reached: <strong className="text-foreground">{finalSpeed}x</strong></p>
                <div className="flex gap-2 justify-center">
                  <button onClick={startGame} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Rematch</button>
                  <button onClick={() => setStarted(false)} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">Menu</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!winner && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPaused(!paused)} className="rounded-xl border border-border bg-muted px-4 py-2 text-xs text-foreground">
                {paused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button onClick={() => setStarted(false)} className="rounded-xl border border-border bg-muted px-4 py-2 text-xs text-foreground">
                ← Menu
              </button>
            </div>
          )}

          {!winner && (
            <div className="text-center text-[10px] text-muted-foreground/60">
              W/S keys or swipe on canvas
            </div>
          )}
        </div>
      )}
    </GameFrame>
  );
};

export default PingPongGame;

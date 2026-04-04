import { useState, useRef } from "react";
import { motion } from "framer-motion";
import GameFrame from "./GameFrame";

const SEGMENTS = [
  { label: "🎁 Gift this person", tip: "Time to shop! 🛍️", color: "hsl(var(--primary))" },
  { label: "💸 Pay for dinner", tip: "Treat the birthday boy! 🍽️", color: "hsl(var(--secondary))" },
  { label: "🎤 Sing a song", tip: "Pick a banger and perform! 🎶", color: "hsl(var(--accent))" },
  { label: "💃 Do a dance", tip: "Show off your moves! 🕺", color: "hsl(var(--primary) / 0.7)" },
  { label: "🍰 Buy cake", tip: "Get the sweetest one! 🎂", color: "hsl(var(--secondary) / 0.7)" },
  { label: "📸 Selfie & upload", tip: "Take a selfie and upload it to the Photo Booth! 📷", color: "hsl(var(--accent) / 0.7)" },
  { label: "🤗 Give a hug", tip: "Warm hug incoming! 🫂", color: "hsl(var(--primary) / 0.5)" },
  { label: "💬 Wish & message", tip: "Wish the birthday boy and add a memorable message on the Wishes page! ✍️", color: "hsl(var(--secondary) / 0.5)" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

const SpinTheWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultIdx, setResultIdx] = useState<number | null>(null);

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    setResultIdx(null);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // Pointer is at top (12 o'clock = -90°). After rotation the segment
      // under the pointer is determined by working out which slice the
      // "virtual pointer angle" falls into.
      const effectiveAngle = ((360 - (totalRotation % 360)) % 360);
      const segmentIndex = Math.floor(effectiveAngle / SEGMENT_ANGLE) % SEGMENTS.length;

      setResultIdx(segmentIndex);
      setSpinning(false);
    }, 4000);
  };

  const wheelSize = 280;
  const radius = wheelSize / 2;
  const centerX = radius;
  const centerY = radius;

  const getSegmentPath = (index: number) => {
    const startAngle = (index * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const midAngle = ((index + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const textRadius = radius * 0.62;

    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      angle: (index + 0.5) * SEGMENT_ANGLE,
    };
  };

  return (
    <GameFrame title="🎡 Spin the Wheel" subtitle="Spin and see what fate decides for the birthday party!" badge="party">
      <div className="flex flex-col items-center space-y-5">
        {/* Pointer */}
        <div className="relative">
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0.85, 0.35, 1.02] }}
            style={{ width: wheelSize, height: wheelSize }}
          >
            <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
              {SEGMENTS.map((segment, i) => (
                <g key={i}>
                  <path d={getSegmentPath(i)} fill={segment.color} stroke="hsl(var(--border))" strokeWidth="1.5" />
                  <text
                    x={getTextPosition(i).x}
                    y={getTextPosition(i).y}
                    fill="hsl(var(--foreground))"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${getTextPosition(i).angle}, ${getTextPosition(i).x}, ${getTextPosition(i).y})`}
                  >
                    {segment.label.split(" ").slice(1).join(" ")}
                  </text>
                  <text
                    x={getTextPosition(i).x}
                    y={getTextPosition(i).y - 12}
                    fontSize="16"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${getTextPosition(i).angle}, ${getTextPosition(i).x}, ${getTextPosition(i).y - 12})`}
                  >
                    {segment.label.split(" ")[0]}
                  </text>
                </g>
              ))}
              <circle cx={centerX} cy={centerY} r="18" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
              <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fontSize="14">
                🎂
              </text>
            </svg>
          </motion.div>
        </div>

        {/* Spin Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          disabled={spinning}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {spinning ? "Spinning..." : "🎡 Spin!"}
        </motion.button>

        {resultIdx !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-2 rounded-2xl border border-primary/30 bg-primary/10 px-6 py-4 text-center"
          >
            <p className="text-2xl">{SEGMENTS[resultIdx].label.split(" ")[0]}</p>
            <p className="text-sm font-bold text-foreground">{SEGMENTS[resultIdx].label}</p>
            <p className="text-xs text-muted-foreground">{SEGMENTS[resultIdx].tip}</p>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
};

export default SpinTheWheel;
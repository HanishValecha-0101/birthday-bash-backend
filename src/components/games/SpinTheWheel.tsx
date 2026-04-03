import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type WheelSlice = {
  label: string;
  color: string;
  category: "truth" | "dare" | "drink" | "roast" | "story" | "wildcard";
  prompt: string;
};

const slices: WheelSlice[] = [
  { label: "🍷 Drink", color: "bg-red-900/60", category: "drink", prompt: "" },
  { label: "🔥 Truth", color: "bg-primary/40", category: "truth", prompt: "" },
  { label: "💀 Dare", color: "bg-accent/40", category: "dare", prompt: "" },
  { label: "😂 Roast", color: "bg-secondary/40", category: "roast", prompt: "" },
  { label: "📖 Story", color: "bg-green-800/40", category: "story", prompt: "" },
  { label: "🎲 Wild", color: "bg-pink-700/40", category: "wildcard", prompt: "" },
];

const prompts: Record<string, string[]> = {
  truth: [
    "What's the most embarrassing thing you've done after midnight?",
    "What's a secret skill nobody here knows about?",
    "What's the worst date you've ever been on?",
    "If you could relive one night from your 20s, which one?",
    "What's the most expensive impulse buy you've made?",
    "What's a lie you told that somehow worked out perfectly?",
    "What's your most controversial food opinion?",
    "Which person in this room would survive longest in a zombie apocalypse?",
    "What's something you pretend to like but actually hate?",
    "What's the most trouble you've gotten into with the birthday boy?",
  ],
  dare: [
    "Do your best impression of the birthday boy for 15 seconds.",
    "Let the group post a story on your Instagram right now.",
    "Call the last person in your contacts and sing happy birthday.",
    "Speak in an accent of the group's choice for the next 3 rounds.",
    "Show the group your most recent Google search.",
    "Do 10 push-ups while the group roasts you.",
    "Send 'I miss you' to the 5th contact in your phone.",
    "Let someone go through your camera roll for 30 seconds.",
    "Dance with no music for 20 seconds. Commit fully.",
    "Recreate a childhood photo of the birthday boy right now.",
  ],
  drink: [
    "Everyone who's older than 28 drinks.",
    "The person with the most embarrassing lock screen drinks.",
    "Everyone who has lied about being 'on the way' today drinks.",
    "Birthday boy picks someone. They drink.",
    "Last person to raise their hand drinks twice.",
    "Everyone who has ghosted someone drinks.",
    "If you've ever cried at a movie, take a sip.",
    "Everyone whose phone is below 30% drinks.",
    "Drink if you've ever been kicked out of a bar.",
    "The tallest and shortest person both drink.",
  ],
  roast: [
    "Roast the birthday boy's fashion sense in 10 seconds.",
    "Describe the birthday boy's dating life as a movie genre.",
    "What would the birthday boy's Yelp review say? 1-5 stars.",
    "If the birthday boy was a cocktail, what would it be called?",
    "Sum up the birthday boy in one brutally honest emoji.",
    "What job would the birthday boy be terrible at?",
    "Describe the birthday boy's energy using only food metaphors.",
    "Rate the birthday boy's texting speed. Be honest.",
  ],
  story: [
    "Tell the funniest story involving the birthday boy in 30 seconds.",
    "What's your earliest memory of the birthday boy?",
    "Describe a trip or night out with the birthday boy — the uncensored version.",
    "What's something the birthday boy said that lives in your head rent-free?",
    "Tell a story where the birthday boy was completely wrong but doubled down.",
    "What was your first impression of the birthday boy? Be brutally honest.",
    "What's the most chaotic plan the birthday boy ever came up with?",
  ],
  wildcard: [
    "Everyone in the room shares one word to describe the birthday boy. GO!",
    "Group vote: who here is most likely to get arrested abroad?",
    "Swap phones with someone for the next round.",
    "The birthday boy assigns someone their punishment: truth, dare, or drink.",
    "Rock paper scissors with the person to your left. Loser drinks.",
    "Everyone writes a birthday prediction on their phone. Read them aloud.",
    "The oldest person in the room tells a story. The youngest acts it out.",
  ],
};

const getRandomPrompt = (category: string): string => {
  const pool = prompts[category] || prompts.wildcard;
  return pool[Math.floor(Math.random() * pool.length)];
};

const SpinTheWheel = () => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ slice: WheelSlice; prompt: string } | null>(null);
  const [history, setHistory] = useState<{ slice: WheelSlice; prompt: string }[]>([]);
  const spinCount = useRef(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.random() * 3;
    const sliceAngle = 360 / slices.length;
    const landingIndex = Math.floor(Math.random() * slices.length);
    const targetAngle = rotation + extraSpins * 360 + landingIndex * sliceAngle + Math.random() * sliceAngle * 0.6;

    setRotation(targetAngle);

    setTimeout(() => {
      const slice = slices[landingIndex];
      const prompt = getRandomPrompt(slice.category);
      const entry = { slice, prompt };
      setResult(entry);
      setHistory((prev) => [entry, ...prev].slice(0, 10));
      setSpinning(false);
      spinCount.current += 1;
    }, 3200);
  };

  return (
    <GameFrame
      title="🎡 Spin the Wheel"
      subtitle="Truth, dare, drink, roast — let the wheel decide. No chickening out at 30."
      badge="multi-player"
    >
      <div className="space-y-4">
        {/* Wheel */}
        <div className="relative mx-auto h-64 w-64">
          {/* Pointer */}
          <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 text-2xl">▼</div>

          {/* Wheel circle */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.2, 0.8, 0.3, 1] }}
            className="relative h-full w-full rounded-full border-4 border-border bg-card shadow-2xl"
          >
            {slices.map((slice, i) => {
              const angle = (i * 360) / slices.length;
              return (
                <div
                  key={slice.category}
                  className="absolute left-1/2 top-0 h-1/2 w-1/2 origin-bottom-left"
                  style={{ transform: `rotate(${angle}deg) skewY(-${90 - 360 / slices.length}deg)` }}
                >
                  <div className={`absolute inset-0 ${slice.color} rounded-tl-full border-l border-t border-border/30`} />
                </div>
              );
            })}
            {/* Slice labels */}
            {slices.map((slice, i) => {
              const angle = (i * 360) / slices.length + 360 / slices.length / 2;
              const rad = (angle * Math.PI) / 180;
              const r = 38;
              return (
                <div
                  key={`label-${slice.category}`}
                  className="absolute text-xs font-bold text-foreground"
                  style={{
                    left: `${50 + r * Math.sin(rad)}%`,
                    top: `${50 - r * Math.cos(rad)}%`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                >
                  {slice.label}
                </div>
              );
            })}
            {/* Center */}
            <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-background text-lg font-bold text-foreground shadow-md">
              🎂
            </div>
          </motion.div>
        </div>

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {spinning ? "Spinning..." : spinCount.current === 0 ? "Spin the Wheel 🎡" : "Spin Again"}
        </button>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={`${spinCount.current}`}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[1.4rem] border border-border bg-muted/50 p-5 text-center"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{result.slice.label}</div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">{result.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Previous spins</p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto">
              {history.slice(1).map((h, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span className="mr-2">{h.slice.label}</span>
                  {h.prompt.slice(0, 60)}…
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  );
};

export default SpinTheWheel;

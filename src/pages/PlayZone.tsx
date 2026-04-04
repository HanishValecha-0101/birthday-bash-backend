import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import TiramisuGame from "@/components/games/TiramisuGame";
import FootballGame from "@/components/games/FootballGame";
import SingUnlockGame from "@/components/games/SingUnlockGame";

type GameId = "tiramisu" | "football" | "sing" | null;

const games = [
  {
    id: "tiramisu" as const,
    icon: "🍰",
    title: "Tiramisu Kitchen",
    description: "Prep ingredients, catch falling layers, and speed-decorate the perfect birthday tiramisu!",
    tags: ["cooking", "3 rounds", "scoring"],
  },
  {
    id: "football" as const,
    icon: "⚽",
    title: "Trick Shot Football",
    description: "Drag to aim, release to shoot — dodge walls, spinners, and wind to beat the keeper!",
    tags: ["skill", "obstacles", "birthday mode"],
  },
  {
    id: "sing" as const,
    icon: "🎤",
    title: "Karaoke Challenge",
    description: "Pick a song, sing along with the lyrics, and get scored on your performance!",
    tags: ["microphone", "5 songs", "accuracy"],
  },
];

const PlayZone = () => {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            <span className="text-dracula-pink">party</span>{" "}
            <span className="text-primary">playZone</span>
            <span className="text-foreground">()</span>
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Three interactive birthday games — cook tiramisu, score trick shots, or sing your heart out!
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6 md:grid-cols-3">
              {games.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group"
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="p-6 text-center space-y-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                    <h3 className="text-lg font-bold text-foreground">{game.title}</h3>
                    <p className="text-xs text-muted-foreground">{game.description}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {game.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <button className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
                      Play Game
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setActiveGame(null)} className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Games
              </button>
              {activeGame === "tiramisu" && <TiramisuGame />}
              {activeGame === "football" && <FootballGame />}
              {activeGame === "sing" && <SingUnlockGame />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default PlayZone;

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameFrame from "./GameFrame";

type Statement = {
  text: string;
  spicy: number; // 1-3
};

const statements: Statement[] = [
  { text: "Never have I ever been kicked out of a bar", spicy: 1 },
  { text: "Never have I ever texted an ex at 2am", spicy: 2 },
  { text: "Never have I ever pretended to be busy to avoid plans", spicy: 1 },
  { text: "Never have I ever lied about my age to get into somewhere", spicy: 1 },
  { text: "Never have I ever stolen a street sign", spicy: 2 },
  { text: "Never have I ever left a restaurant without paying by accident", spicy: 1 },
  { text: "Never have I ever cried at a wedding", spicy: 1 },
  { text: "Never have I ever faked being sick to skip work", spicy: 1 },
  { text: "Never have I ever stalked someone's entire Instagram at 3am", spicy: 2 },
  { text: "Never have I ever said 'I love you' to the wrong person", spicy: 3 },
  { text: "Never have I ever eaten food off the floor", spicy: 1 },
  { text: "Never have I ever had a tattoo I regret", spicy: 2 },
  { text: "Never have I ever been on a dating app while on a date", spicy: 3 },
  { text: "Never have I ever lied on my resume", spicy: 2 },
  { text: "Never have I ever broken something at someone's house and not told them", spicy: 2 },
  { text: "Never have I ever been caught singing in the car at full volume", spicy: 1 },
  { text: "Never have I ever slept through something important", spicy: 1 },
  { text: "Never have I ever accidentally called my teacher 'mom'", spicy: 1 },
  { text: "Never have I ever gone skinny dipping", spicy: 2 },
  { text: "Never have I ever had a conversation with a pet like it was a person", spicy: 1 },
  { text: "Never have I ever pretended to know a song everyone else knew", spicy: 1 },
  { text: "Never have I ever snooped through someone's phone", spicy: 3 },
  { text: "Never have I ever re-gifted a present", spicy: 2 },
  { text: "Never have I ever laughed so hard I cried in public", spicy: 1 },
  { text: "Never have I ever taken a shot I instantly regretted", spicy: 2 },
  { text: "Never have I ever used the birthday boy's Netflix without asking", spicy: 1 },
  { text: "Never have I ever blamed a fart on someone else", spicy: 2 },
  { text: "Never have I ever had an embarrassing autocorrect sent to the wrong person", spicy: 2 },
  { text: "Never have I ever ugly cried over a fictional character", spicy: 1 },
  { text: "Never have I ever woken up in a completely different location than where I fell asleep", spicy: 3 },
];

type Player = { id: number; name: string; sips: number };

const NeverHaveIEver = () => {
  const [phase, setPhase] = useState<"setup" | "playing" | "result">("setup");
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Player 1", sips: 0 },
    { id: 2, name: "Player 2", sips: 0 },
  ]);
  const [deck, setDeck] = useState<Statement[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);

  const currentCard = deck[cardIndex];
  const isFinished = cardIndex >= deck.length;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.sips - a.sips),
    [players]
  );

  const updateName = (id: number, name: string) => {
    setPlayers((p) => p.map((pl) => (pl.id === id ? { ...pl, name } : pl)));
  };

  const addPlayer = () => {
    if (players.length >= 8) return;
    setPlayers((p) => [...p, { id: p.length + 1, name: `Player ${p.length + 1}`, sips: 0 }]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 2) return;
    setPlayers((p) => p.filter((pl) => pl.id !== id));
  };

  const startGame = () => {
    const shuffled = [...statements]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
    setDeck(shuffled);
    setCardIndex(0);
    setSelectedPlayers(new Set());
    setRevealed(false);
    setPlayers((p) => p.map((pl) => ({ ...pl, name: pl.name.trim() || `Player ${pl.id}`, sips: 0 })));
    setPhase("playing");
  };

  const togglePlayer = (id: number) => {
    if (revealed) return;
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reveal = () => {
    setRevealed(true);
    // Add sips
    setPlayers((p) =>
      p.map((pl) =>
        selectedPlayers.has(pl.id) ? { ...pl, sips: pl.sips + currentCard.spicy } : pl
      )
    );
  };

  const nextCard = () => {
    if (cardIndex + 1 >= deck.length) {
      setPhase("result");
      return;
    }
    setCardIndex((p) => p + 1);
    setSelectedPlayers(new Set());
    setRevealed(false);
  };

  const spicyLabel = (level: number) =>
    level === 3 ? "🔥🔥🔥" : level === 2 ? "🔥🔥" : "🔥";

  return (
    <GameFrame
      title="🙈 Never Have I Ever"
      subtitle="The classic party game — digitized, spicier, and with a sip counter. No lying."
      badge="2-8 players"
    >
      <div className="space-y-4">
        {phase === "setup" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              Add everyone playing. Tap who's guilty each round. Spicier cards = more sips. 12 rounds total.
            </div>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={p.id} className="flex gap-2">
                  <input
                    value={p.name}
                    onChange={(e) => updateName(p.id, e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    placeholder={`Player ${i + 1}`}
                  />
                  <button
                    onClick={() => removePlayer(p.id)}
                    disabled={players.length <= 2}
                    className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={addPlayer}
                disabled={players.length >= 8}
                className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                Add Player
              </button>
              <button
                onClick={startGame}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {phase === "playing" && currentCard && !isFinished && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Card {cardIndex + 1}/{deck.length}</span>
              <span>{spicyLabel(currentCard.spicy)} +{currentCard.spicy} sip{currentCard.spicy > 1 ? "s" : ""}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="rounded-[1.6rem] border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 text-center shadow-lg"
              >
                <p className="text-lg font-bold leading-relaxed text-foreground">
                  {currentCard.text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                {revealed ? "Guilty parties:" : "Who's done it? Tap to select:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                  const isSelected = selectedPlayers.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p.id)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-primary/20 text-primary scale-105"
                          : "border-border bg-muted/40 text-muted-foreground"
                      } ${revealed ? "pointer-events-none" : "cursor-pointer"}`}
                    >
                      {p.name} {isSelected && "🍹"}
                    </button>
                  );
                })}
              </div>
            </div>

            {!revealed ? (
              <button
                onClick={reveal}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground"
              >
                Lock In & Reveal
              </button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {selectedPlayers.size === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Nobody? Sure... 👀</p>
                )}
                <button
                  onClick={nextCard}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                >
                  {cardIndex + 1 >= deck.length ? "See Results" : "Next Card →"}
                </button>
              </motion.div>
            )}

            {/* Mini scoreboard */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {players.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-2 text-center text-xs">
                  <div className="text-muted-foreground truncate">{p.name}</div>
                  <div className="mt-1 text-lg font-bold text-secondary">{p.sips} 🍹</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <div className="text-5xl">🏆</div>
            <div>
              <h3 className="text-xl font-bold text-primary">
                {sortedPlayers[0]?.name} is the most guilty
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {sortedPlayers[0]?.sips} total sips. The evidence doesn't lie.
              </p>
            </div>

            <div className="space-y-2 text-left">
              {sortedPlayers.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
                >
                  <span className="text-foreground">
                    {i === 0 ? "👑" : `#${i + 1}`} {p.name}
                  </span>
                  <span className="font-bold text-secondary">{p.sips} sips</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setPhase("setup"); setCardIndex(0); }}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
};

export default NeverHaveIEver;

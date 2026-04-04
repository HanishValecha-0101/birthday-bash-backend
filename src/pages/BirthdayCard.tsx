import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";

const Highlight = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`${color} font-bold`}>{children}</span>
);

const BirthdayCard = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* File header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-dracula-selection border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground ml-2">README.md — preview</span>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            {/* Title */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                # Happy Birthday, <Highlight color="text-dublin-green">Best Friend</Highlight>! 🎂
              </h1>
              <div className="flex gap-3 mt-3">
                <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full">v26.0.0</span>
                <span className="bg-secondary/20 text-secondary text-xs px-3 py-1 rounded-full">stable</span>
                <span className="bg-accent/20 text-accent text-xs px-3 py-1 rounded-full">💚 loved</span>
              </div>
            </motion.div>

            <hr className="border-border" />

            {/* Letter Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 text-sm leading-relaxed"
            >
              <p className="text-foreground">
                ## Dear <Highlight color="text-dublin-green">bestie</Highlight>,
              </p>

              <p className="text-muted-foreground">
                If our friendship was a codebase, it would have zero bugs, 100% test coverage, and the most elegant
                architecture anyone has ever seen. You're the kind of friend who makes{" "}
                <Highlight color="text-dracula-cyan">life.debug()</Highlight> actually work.
              </p>

              <div className="bg-dracula-selection rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">// fun fact</div>
                <code className="text-sm text-dublin-green">
                  const ourFriendship = new Bond({"{"}
                  <br />
                  &nbsp;&nbsp;strength: Infinity,
                  <br />
                  &nbsp;&nbsp;tiramisuShared: "countless",
                  <br />
                  &nbsp;&nbsp;insideJokes: Number.MAX_SAFE_INTEGER,
                  <br />
                  &nbsp;&nbsp;distance: "just a flight away"
                  <br />
                  {"}"});
                </code>
              </div>

              <p className="text-muted-foreground">
                Dublin might have your <Highlight color="text-dublin-green">present</Highlight>, but india has your{" "}
                <Highlight color="text-bangalore-gold">heart</Highlight>
              </p>

              <p className="text-muted-foreground">
                This year, I wish you more PRs merged, more personal records broken at the gym, more winning goals, and
                more slices of tiramisu than your metabolism can handle. You deserve every{" "}
                <Highlight color="text-dracula-purple">pixel</Highlight> of happiness that life can render.
              </p>

              <p className="text-muted-foreground">
                Here's to another year of being the most <Highlight color="text-dracula-pink">bestie</Highlight>-worthy
                human being I know. The world is a better runtime because you're in it. 💚
              </p>

              <div className="mt-6 space-y-1">
                <p className="text-foreground font-bold">
                  With all the love a <span className="text-dracula-purple">function</span> can{" "}
                  <span className="text-dublin-green">return</span>,
                </p>
                <p className="text-bangalore-gold font-bold">Your Partner In Crime ❤️</p>
              </div>

              <div className="bg-dracula-selection rounded-xl p-4 border border-border mt-4">
                <code className="text-xs text-muted-foreground">
                  git log --oneline --author="bestfriend"
                  <br />
                  <span className="text-dublin-green">a1b2c3d</span> Added unconditional love module
                  <br />
                  <span className="text-dublin-green">e4f5g6h</span> Fixed broken hearts with friendship.patch
                  <br />
                  <span className="text-dublin-green">i7j8k9l</span> Deployed happiness to production 🚀
                </code>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default BirthdayCard;

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Wish {
  id: string;
  name: string;
  message: string;
  emoji: string;
  user_id: string | null;
  created_at: string | null;
}

const emojis = ["💚", "🎂", "🍰", "⚽", "💪", "🎉", "🤗", "✨", "🎸", "🎤"];

const Wishes = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💚");
  const [submitted, setSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchWishes = useCallback(async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setWishes(data as Wish[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !user) return;

    const { data, error } = await supabase
      .from("wishes")
      .insert({
        name: name.trim(),
        message: message.trim(),
        emoji: selectedEmoji,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setWishes((prev) => [data as Wish, ...prev]);
      setName("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleDeleteWish = async (wishId: string) => {
    if (!window.confirm("Delete this wish?")) return;
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    if (!error) setWishes((prev) => prev.filter((w) => w.id !== wishId));
  };

  const handleClearWishes = async () => {
    if (!window.confirm("Are you sure you want to clear ALL wishes? This cannot be undone.")) return;
    const { error } = await supabase.from("wishes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) setWishes([]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      alert("Camera access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-dracula-pink">interface</span>{" "}
            <span className="text-dublin-green">BirthdayWishes</span>{" "}
            <span className="text-foreground">{"{"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            // Leave a wish — he'll read every single one 💚
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="px-3 py-2 bg-dracula-selection rounded-xl border-b border-border">
                <span className="text-xs text-muted-foreground">new_wish.ts</span>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  <span className="text-dracula-purple">const</span> name =
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='"Your Name"'
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  <span className="text-dracula-purple">const</span> wish =
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='"Happy Birthday! You are..."'
                  rows={4}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">
                  <span className="text-dracula-purple">const</span> emoji =
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setSelectedEmoji(e)}
                      className={`text-xl p-1.5 rounded-lg transition-all ${
                        selectedEmoji === e
                          ? "bg-primary/20 scale-110 ring-1 ring-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm">
                git commit -m "birthday wish" && git push
              </motion.button>

              <AnimatePresence>
                {submitted && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-dublin-green text-center">
                    ✅ Wish deployed! He'll love it 💚
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs text-muted-foreground">🎤 Record a video wish (stays in your browser)</p>
                {!videoURL ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
                      isRecording
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {isRecording ? "⏹️ Stop Recording" : "📹 Record Video Wish"}
                  </motion.button>
                ) : (
                  <div className="space-y-2">
                    <video src={videoURL} controls className="w-full rounded-xl" />
                    <button type="button" onClick={() => setVideoURL(null)} className="text-xs text-muted-foreground hover:text-foreground">
                      🗑️ Discard & record again
                    </button>
                  </div>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-3 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-foreground">
                // wishes.log ({wishes.length} entries)
              </h2>
              {isAdmin && wishes.length > 0 && (
                <button onClick={handleClearWishes} className="text-xs text-destructive hover:text-destructive/80 transition-colors">
                  🗑️ Clear All Wishes (Admin)
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading wishes...</p>
              </div>
            ) : wishes.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-muted-foreground">
                  No wishes yet. Be the <span className="text-dublin-green">first</span> to push!
                </p>
              </div>
            ) : null}

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              <AnimatePresence>
                {wishes.map((wish, i) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{wish.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-dublin-green truncate">{wish.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground">{timeAgo(wish.created_at)}</span>
                            {(user?.id === wish.user_id || isAdmin) && (
                              <button
                                onClick={() => handleDeleteWish(wish.id)}
                                className={`text-destructive hover:text-destructive/80 transition-all text-xs ${isAdmin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                title={isAdmin ? "Delete wish (Admin)" : "Delete wish"}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{wish.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="text-muted-foreground text-lg">{"}"}</div>
      </div>
    </AppLayout>
  );
};

export default Wishes;

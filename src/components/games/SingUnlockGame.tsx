import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFrame from "./GameFrame";

type Song = {
  id: string;
  title: string;
  artist: string;
  emoji: string;
  lyrics: string[];
};

const SONGS: Song[] = [
  {
    id: "birthday",
    title: "Happy Birthday",
    artist: "Traditional",
    emoji: "🎂",
    lyrics: [
      "Happy birthday to you",
      "Happy birthday to you",
      "Happy birthday dear friend",
      "Happy birthday to you",
      "How old are you now",
      "How old are you now",
      "How old are you now-ow",
      "How old are you now",
    ],
  },
  {
    id: "shape",
    title: "Shape of You",
    artist: "Ed Sheeran",
    emoji: "💃",
    lyrics: [
      "I'm in love with the shape of you",
      "We push and pull like a magnet do",
      "Although my heart is falling too",
      "I'm in love with your body",
      "Last night you were in my room",
      "And now my bedsheets smell like you",
      "Every day discovering something brand new",
      "I'm in love with the shape of you",
    ],
  },
  {
    id: "believer",
    title: "Believer",
    artist: "Imagine Dragons",
    emoji: "🔥",
    lyrics: [
      "First things first",
      "I'ma say all the words inside my head",
      "I'm fired up and tired of",
      "The way that things have been",
      "Second thing second",
      "Don't you tell me what you think that I could be",
      "I'm the one at the sail",
      "I'm the master of my sea",
    ],
  },
  {
    id: "perfect",
    title: "Perfect",
    artist: "Ed Sheeran",
    emoji: "💖",
    lyrics: [
      "I found a love for me",
      "Darling just dive right in and follow my lead",
      "Well I found a girl beautiful and sweet",
      "Oh I never knew you were the someone",
      "Waiting for me",
      "Cause we were just kids when we fell in love",
      "Not knowing what it was",
      "I will not give you up this time",
    ],
  },
  {
    id: "counting",
    title: "Counting Stars",
    artist: "OneRepublic",
    emoji: "⭐",
    lyrics: [
      "Lately I been I been losing sleep",
      "Dreaming about the things that we could be",
      "But baby I been I been praying hard",
      "Said no more counting dollars",
      "We'll be counting stars",
      "I see this life like a swinging vine",
      "Swing my heart across the line",
      "In my face is flashing signs",
    ],
  },
];

const SingUnlockGame = () => {
  const [phase, setPhase] = useState<"select" | "singing" | "result">("select");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [volume, setVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lineProgress, setLineProgress] = useState<number[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const lineProgressRef = useRef<number[]>([]);
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startSinging = async (song: Song) => {
    setError(null);
    setSelectedSong(song);
    setCurrentLineIndex(0);
    setRecognizedWords([]);
    lineProgressRef.current = new Array(song.lyrics.length).fill(0);
    setLineProgress([...lineProgressRef.current]);
    progressRef.current = 0;
    setProgress(0);
    setVolume(0);

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

      // Try Web Speech API for word detection
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event: any) => {
          const results = Array.from(event.results);
          const words: string[] = [];
          results.forEach((result: any) => {
            if (result[0]?.transcript) {
              words.push(...result[0].transcript.toLowerCase().split(/\s+/));
            }
          });
          setRecognizedWords(words);
        };
        recognition.onerror = () => {}; // Silently handle errors
        try { recognition.start(); } catch {}
        recognitionRef.current = recognition;
      }

      setPhase("singing");

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const totalLines = song.lyrics.length;

      const loop = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(100, (avg / 128) * 100);
        setVolume(normalized);

        if (normalized > 25) {
          progressRef.current = Math.min(100, progressRef.current + normalized * 0.012);
          const lineIdx = Math.min(totalLines - 1, Math.floor((progressRef.current / 100) * totalLines));
          setCurrentLineIndex(lineIdx);
          lineProgressRef.current[lineIdx] = Math.min(100, (lineProgressRef.current[lineIdx] || 0) + normalized * 0.08);
          setLineProgress([...lineProgressRef.current]);
        } else {
          progressRef.current = Math.max(0, progressRef.current - 0.15);
        }
        setProgress(progressRef.current);

        if (progressRef.current >= 100) {
          const avgLineProgress = lineProgressRef.current.reduce((a, b) => a + b, 0) / totalLines;
          setAccuracy(Math.min(100, Math.round(avgLineProgress)));
          stopListening();
          setPhase("result");
          return;
        }

        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Microphone access denied. Please allow mic access.");
    }
  };

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const reset = () => {
    stopListening();
    setPhase("select");
    setVolume(0);
    setProgress(0);
    setSelectedSong(null);
    setRecognizedWords([]);
  };

  const getVerdict = () => {
    if (accuracy >= 80) return { title: "🎤 Rockstar!", note: "You nailed it! Concert-ready performance.", tone: "text-primary" };
    if (accuracy >= 50) return { title: "🎵 Shower Singer", note: "Not bad! Your neighbors might enjoy it.", tone: "text-secondary" };
    if (accuracy >= 25) return { title: "😅 Enthusiastic", note: "The spirit was there, the pitch... less so.", tone: "text-accent" };
    return { title: "🔇 Lip Syncer", note: "Were you even singing? Try louder!", tone: "text-destructive" };
  };

  const meterBars = 20;

  return (
    <GameFrame title="🎤 Karaoke Challenge" subtitle="Pick a song, sing along, and prove your skills!" badge="mic · lyrics">
      {phase === "select" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
            <p className="font-semibold text-foreground">🎵 How to play:</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>🎤 Choose a song and sing along with the lyrics</li>
              <li>📊 Your volume fills the progress meter</li>
              <li>🗣️ Word recognition detects what you sing (Chrome)</li>
              <li>🎯 Fill the meter to 100% to complete the song</li>
            </ul>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="space-y-2">
            {SONGS.map((song) => (
              <button
                key={song.id}
                onClick={() => startSinging(song)}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 text-left hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{song.emoji}</span>
                  <div>
                    <span className="font-bold text-foreground text-sm">{song.title}</span>
                    <span className="block text-xs text-muted-foreground">{song.artist}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === "singing" && selectedSong && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{selectedSong.emoji} {selectedSong.title}</p>
            <p className="text-xs text-muted-foreground">{selectedSong.artist}</p>
          </div>

          {/* Lyrics display */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2 max-h-[180px] overflow-y-auto">
            {selectedSong.lyrics.map((line, i) => {
              const isActive = i === currentLineIndex;
              const isPast = i < currentLineIndex;
              const lineP = lineProgress[i] || 0;
              return (
                <motion.div
                  key={i}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/20 text-primary font-bold border border-primary/30"
                      : isPast
                      ? "text-muted-foreground/60 line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{line}</span>
                    {(isActive || isPast) && lineP > 0 && (
                      <span className="text-[10px] text-primary/70">{Math.round(lineP)}%</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recognized words */}
          {recognizedWords.length > 0 && (
            <div className="text-[10px] text-muted-foreground/50 text-center truncate px-2">
              Heard: {recognizedWords.slice(-8).join(" ")}
            </div>
          )}

          {/* Volume meter */}
          <div className="flex items-end justify-center gap-1 h-24">
            {Array.from({ length: meterBars }, (_, i) => {
              const barHeight = ((i + 1) / meterBars) * 100;
              const isActive = volume > (i / meterBars) * 100;
              const hue = 135 + (i / meterBars) * 190;
              return (
                <motion.div
                  key={i}
                  className="w-2.5 rounded-t-sm"
                  animate={{ height: isActive ? `${barHeight}%` : "4px", opacity: isActive ? 1 : 0.3 }}
                  transition={{ duration: 0.05 }}
                  style={{ backgroundColor: isActive ? `hsl(${hue}, 80%, 60%)` : "hsl(var(--muted))" }}
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
            <div className="h-3 rounded-full bg-muted/60 overflow-hidden border border-border">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))" }}
              />
            </div>
          </div>

          <button onClick={reset} className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            Stop
          </button>
        </div>
      )}

      {phase === "result" && selectedSong && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
          {(() => {
            const verdict = getVerdict();
            return (
              <>
                <div className="text-5xl">{selectedSong.emoji}</div>
                <h3 className={`text-xl font-bold ${verdict.tone}`}>{verdict.title}</h3>
                <p className="text-sm text-muted-foreground">{verdict.note}</p>
              </>
            );
          })()}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <div className="text-xs text-muted-foreground">Song</div>
              <div className="mt-1 text-sm font-bold text-foreground">{selectedSong.title}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="mt-1 text-lg font-bold text-primary">{accuracy}%</div>
            </div>
          </div>

          {/* Per-line breakdown */}
          <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Line Breakdown</p>
            {selectedSong.lyrics.map((line, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="flex-1 truncate text-muted-foreground">{line}</div>
                <div className="w-16 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${lineProgress[i] || 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => startSinging(selectedSong)} className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Sing Again
            </button>
            <button onClick={reset} className="flex-1 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground">
              Pick Another
            </button>
          </div>
        </motion.div>
      )}
    </GameFrame>
  );
};

export default SingUnlockGame;

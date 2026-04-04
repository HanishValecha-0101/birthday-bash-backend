import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";

interface PhotoItem {
  id: number;
  src: string;
  caption: string;
  category: string;
  color: string;
}

const photos: PhotoItem[] = [
  { id: 1, src: "/gallery/photo1.jpeg", caption: "Bros before bugs 🤜🤛", category: "friends", color: "text-dublin-green" },
  { id: 2, src: "/gallery/photo2.jpeg", caption: "Squad goals in Bangalore ☀️", category: "friends", color: "text-bangalore-gold" },
  { id: 3, src: "/gallery/photo3.jpeg", caption: "Family vibes, warm hearts 💖", category: "family", color: "text-dracula-pink" },
  { id: 4, src: "/gallery/photo4.jpeg", caption: "Qutub Minar nights 🌙", category: "travel", color: "text-dracula-purple" },
  { id: 5, src: "/gallery/photo5.jpeg", caption: "Dublin drip, no cap 🧢", category: "life", color: "text-dublin-green" },
  { id: 6, src: "/gallery/photo6.jpeg", caption: "Three musketeers at Qutub 🤘", category: "friends", color: "text-bangalore-gold" },
  { id: 7, src: "/gallery/photo7.jpeg", caption: "Café vibes & good food ☕", category: "life", color: "text-dracula-cyan" },
  { id: 8, src: "/gallery/photo8.jpeg", caption: "The whole gang together 🥂", category: "friends", color: "text-dracula-pink" },
  { id: 9, src: "/gallery/photo9.jpeg", caption: "Date night done right 💚", category: "life", color: "text-dublin-green" },
  { id: 10, src: "/gallery/photo10.jpeg", caption: "Football never stops ⚽", category: "football", color: "text-bangalore-gold" },
  { id: 11, src: "/gallery/photo11.jpeg", caption: "Good times, great people 🎉", category: "friends", color: "text-dublin-green" },
  { id: 12, src: "/gallery/photo12.jpeg", caption: "Making memories everywhere 📍", category: "travel", color: "text-dracula-cyan" },
  { id: 13, src: "/gallery/photo13.jpeg", caption: "Living the best life 🌟", category: "life", color: "text-dracula-purple" },
  { id: 14, src: "/gallery/photo14.jpeg", caption: "Adventures await 🚀", category: "travel", color: "text-bangalore-gold" },
  { id: 15, src: "/gallery/photo15.jpeg", caption: "Cheers to us! 🥂", category: "friends", color: "text-dracula-pink" },
];

const featuredPhotos = [
  { id: 100, src: "/gallery/featured-family.jpeg", caption: "Family — the strongest bond 💚", color: "text-dublin-green" },
];

interface BoothPhoto {
  id: string;
  image_url: string;
  created_at: string | null;
}

const Gallery = () => {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string; color: string } | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [boothPhotos, setBoothPhotos] = useState<BoothPhoto[]>([]);

  const fetchBoothPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBoothPhotos(data);
  }, []);

  useEffect(() => {
    fetchBoothPhotos();
  }, [fetchBoothPhotos]);

  const categories = ["all", ...Array.from(new Set(photos.map((p) => p.category)))];
  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-dracula-pink">import</span>{" "}
            <span className="text-dublin-green">memories</span>{" "}
            <span className="text-dracula-pink">from</span>{" "}
            <span className="text-bangalore-gold">'./gallery/*'</span>;
          </h1>
          <p className="text-muted-foreground text-sm mt-1">// Click any photo to view full size</p>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === cat
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => setLightbox({ src: photo.src, caption: photo.caption, color: photo.color })}
              className="break-inside-avoid bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group"
            >
              <div className="px-4 py-2 bg-dracula-selection border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground ml-1">{photo.category}/{photo.id}.jpg</span>
              </div>
              <div className="relative overflow-hidden">
                <img src={photo.src} alt={photo.caption} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <code className={`text-sm ${photo.color} font-bold`}>{photo.caption}</code>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Birthday Photos */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">
            <span className="text-dracula-pink">const</span>{" "}
            <span className="text-dublin-green">featured</span>{" "}
            <span className="text-foreground">= [</span>
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {featuredPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setLightbox({ src: photo.src, caption: photo.caption, color: photo.color })}
                className="break-inside-avoid bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group"
              >
                <div className="px-4 py-2 bg-dracula-selection border-b border-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground ml-1">featured/{photo.id}.jpg</span>
                </div>
                <div className="relative overflow-hidden">
                  <img src={photo.src} alt={photo.caption} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <code className={`text-sm ${photo.color} font-bold`}>{photo.caption}</code>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-lg">];</p>
        </div>

        {/* Booth Captures from Supabase */}
        {boothPhotos.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border">
            <h2 className="text-lg font-bold text-foreground">📸 Booth Captures</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {boothPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-border overflow-hidden bg-card cursor-pointer"
                  onClick={() => setLightbox({ src: photo.image_url, caption: `Booth capture #${i + 1}`, color: "text-dracula-cyan" })}
                >
                  <img src={photo.image_url} alt={`Booth capture ${i + 1}`} className="w-full aspect-square object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
              onClick={() => setLightbox(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-card"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={lightbox.src} alt={lightbox.caption} className="w-full max-h-[70vh] object-contain bg-muted" />
                <div className="p-4 flex items-center justify-between">
                  <code className={`text-sm ${lightbox.color} font-bold`}>{lightbox.caption}</code>
                  <button onClick={() => setLightbox(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Gallery;

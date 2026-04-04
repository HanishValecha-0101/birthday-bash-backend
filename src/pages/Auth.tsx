import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 bg-dracula-selection border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground ml-2">auth.tsx</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-foreground">🎂</h1>
              <h2 className="text-lg font-bold text-foreground">
                <span className="text-dracula-pink">{isLogin ? "login" : "signUp"}</span>
                <span className="text-foreground">()</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {isLogin ? "// Welcome back to the party" : "// Join the birthday celebration"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  <span className="text-dracula-purple">const</span> email =
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='"you@example.com"'
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  <span className="text-dracula-purple">const</span> password =
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='"••••••••"'
                  minLength={6}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary"
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                {submitting ? "..." : isLogin ? "git pull --login" : "git push --signup"}
              </motion.button>
            </form>

            <div className="text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/50">
          made with 💚 by <span className="text-foreground/40">bhavi</span> & <span className="text-foreground/40">hanish</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

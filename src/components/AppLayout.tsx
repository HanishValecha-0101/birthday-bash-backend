import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/dashboard", label: "src/dashboard", icon: "📊", file: "main.tsx" },
  { path: "/gallery", label: "src/memories", icon: "📸", file: "assets/" },
  { path: "/play", label: "src/sandbox", icon: "🎮", file: "games/" },
  { path: "/photobooth", label: "src/photobooth", icon: "📷", file: "camera.tsx" },
  { path: "/dublin-guide", label: "src/dublin-food", icon: "🍽️", file: "guide.tsx" },
  { path: "/wishes", label: "src/wishes", icon: "💬", file: "wishes.ts" },
  { path: "/card", label: "README.md", icon: "💌", file: "README.md" },
  { path: "/homecoming", label: "src/homecoming", icon: "✈️", file: "deploy.sh" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "w-full" : "w-60"} bg-card border-r border-border h-full flex flex-col`}>
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-dublin-green text-sm font-bold">🎂 birthday-app</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">branch: main • v26.0.0</div>
      </div>

      <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">
        Explorer
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? "bg-dracula-selection text-dublin-green"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-2 border-t border-border">
        <div className="text-[10px] text-muted-foreground truncate">
          👤 {user.email}
        </div>
      </div>

      <div className="px-2 py-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="px-4 py-3 border-t border-border text-[10px] text-muted-foreground">
        <span className="text-dublin-green">●</span> connected • Dublin → Bangalore
      </div>
      <div className="px-4 pb-3 text-[10px] text-muted-foreground/60 text-center">
        made with 💚 by <span className="text-foreground/50">bhavi</span> & <span className="text-foreground/50">hanish</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <div className="fixed top-0 left-0 h-screen">
          <Sidebar />
        </div>
        <div className="w-60" />
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-dublin-green text-sm font-bold">🎂 birthday-app</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-64 h-full"
            >
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-h-screen md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

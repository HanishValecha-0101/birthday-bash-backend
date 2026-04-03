import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "w-full" : "w-60"} bg-card border-r border-border h-full flex flex-col`}>
      {/* Project header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-dublin-green text-sm font-bold">🎂 birthday-app</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">branch: main • v26.0.0</div>
      </div>

      {/* Explorer label */}
      <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">
        Explorer
      </div>

      {/* File tree */}
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

      {/* Logout */}
      <div className="px-2 py-2">
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 border-t border-border text-[10px] text-muted-foreground">
        <span className="text-dublin-green">●</span> connected • Dublin → Bangalore
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <div className="fixed top-0 left-0 h-screen">
          <Sidebar />
        </div>
        <div className="w-60" />
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-dublin-green text-sm font-bold">🎂 birthday-app</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
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

      {/* Main content */}
      <main className="flex-1 min-h-screen md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

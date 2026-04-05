import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import AppLayout from "@/components/AppLayout";

const ProgressRing = ({ label, value, max, color, emoji }: { label: string; value: number; max: number; color: string; emoji: string }) => {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {emoji}
        </div>
      </div>
      <div className="text-center">
        <div className="text-foreground text-sm font-bold">{value}/{max}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </motion.div>
  );
};

const BIRTHDAY_TIME_ZONE = "Europe/Dublin";

const getTimeZoneParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const offsetLabel = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = offsetLabel.match(/GMT(?:(\+|-)(\d{1,2})(?::(\d{2}))?)?/);

  if (!match || !match[1] || !match[2]) {
    return 0;
  }

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);

  return sign * (hours * 60 + minutes) * 60 * 1000;
};

const createDateInTimeZone = (year: number, monthIndex: number, day: number, timeZone: string) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));
  const initialOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const adjustedDate = new Date(utcGuess.getTime() - initialOffset);
  const adjustedOffset = getTimeZoneOffsetMs(adjustedDate, timeZone);

  return new Date(utcGuess.getTime() - adjustedOffset);
};

const getNextBirthday = () => {
  const now = new Date();
  const { year, month, day } = getTimeZoneParts(now, BIRTHDAY_TIME_ZONE);

  if (month === 4 && day === 6) {
    return {
      target: createDateInTimeZone(year, 3, 6, BIRTHDAY_TIME_ZONE),
      arrived: true,
    };
  }

  const targetYear = month > 4 || (month === 4 && day > 6) ? year + 1 : year;

  return {
    target: createDateInTimeZone(targetYear, 3, 6, BIRTHDAY_TIME_ZONE),
    arrived: false,
  };
};

const getCountdown = () => {
  const { target, arrived } = getNextBirthday();

  if (arrived) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true };
  }

  const difference = Math.max(target.getTime() - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    arrived: false,
  };
};

const Dashboard = () => {
  const [hugMode, setHugMode] = useState(false);
  const [showHug, setShowHug] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown);

  const birthdayTarget = useMemo(() => getNextBirthday().target, [countdown.arrived]);
  const birthdayTargetLabel = useMemo(
    () => birthdayTarget.toLocaleDateString("en-IE", { timeZone: BIRTHDAY_TIME_ZONE }),
    [birthdayTarget],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const toggleHug = () => {
    const next = !hugMode;
    setHugMode(next);
    if (next) {
      document.documentElement.classList.add("hug-mode");
      setShowHug(true);
      setTimeout(() => setShowHug(false), 3000);
    } else {
      document.documentElement.classList.remove("hug-mode");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            <span className="text-dracula-pink">class</span>{" "}
            <span className="text-dublin-green">BirthdayBoy</span>{" "}
            <span className="text-foreground">{"{"}</span>
          </h1>
          <p className="text-muted-foreground text-sm pl-4">
            // Performance Dashboard — Main Branch
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[1.8rem] border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Birthday countdown</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {countdown.arrived ? "🎉 The Day Has Arrived!" : "Next April 6 lands in"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {countdown.arrived
                  ? "Happy Birthday! Time to celebrate with photos, food, and games! 🎂"
                  : `Target locked for ${birthdayTargetLabel} in Dublin time — launch the day with photos, food, and games.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/photobooth" className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                Open Photo Booth
              </Link>
              <Link to="/dublin-guide" className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                Open Dublin Guide
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {countdown.arrived ? (
              <div className="col-span-full rounded-2xl border border-primary bg-primary/10 p-6 text-center">
                <div className="text-4xl mb-2">🎂🎉🥳</div>
                <div className="text-lg font-bold text-foreground">It's Birthday Time!</div>
                <div className="mt-1 text-xs text-muted-foreground">Go celebrate!</div>
              </div>
            ) : (
              [{label: "Days", value: countdown.days}, {label: "Hours", value: countdown.hours}, {label: "Minutes", value: countdown.minutes}, {label: "Seconds", value: countdown.seconds}].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-muted/35 p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Performance Rings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8"
        >
          <h2 className="text-sm text-muted-foreground mb-6">
            <span className="text-dracula-purple">const</span> stats = getPerformanceMetrics();
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <ProgressRing label="Code Pushed" value={847} max={1000} color="hsl(var(--primary))" emoji="💻" />
            <ProgressRing label="Weights Lifted" value={720} max={1000} color="hsl(var(--secondary))" emoji="💪" />
            <ProgressRing label="Tiramisu Consumed" value={999} max={1000} color="hsl(var(--accent))" emoji="🍰" />
          </div>
        </motion.div>

        {/* Mood Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">mood.toggle()</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {hugMode ? "Click the button to turn off hug mode" : "Feeling stressed? Activate virtual hug mode 🤗"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={toggleHug}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  hugMode
                    ? "text-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={hugMode ? { backgroundColor: "#5B3A4A", boxShadow: "0 0 20px rgba(91, 58, 74, 0.4)" } : undefined}
              >
                {hugMode ? "🤗 HUG MODE ON — Click to Disable" : "🫂 Need a Hug?"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Virtual Hug Popup */}
        <AnimatePresence>
          {showHug && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              onClick={() => setShowHug(false)}
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-card rounded-3xl border border-border p-8 md:p-12 text-center max-w-md mx-4"
                style={{ boxShadow: "0 0 40px rgba(140, 100, 160, 0.3)" }}
              >
                <div className="text-6xl mb-4">🤗</div>
                <h2 className="text-2xl font-bold text-accent mb-2">Virtual Hug Sent!</h2>
                <p className="text-muted-foreground text-sm">
                  console.log("You're doing amazing! 💚")
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  // Click anywhere to close
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-muted-foreground text-lg">{"}"}</div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

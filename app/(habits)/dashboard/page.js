"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { getToken } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";

const requestNotificationPermission = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: "BFWTJZgGq4Gxx184sVFUoUDv2DIG8GM8HkvZSkzew7Nn-BJ18ypB9Ov4x_Ioeecv7UjAB1XXO9MTgYeUY_rIGvg",
    });

    console.log("TOKEN:", token);

    await fetch("/api/save-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

  } catch (err) {
    console.error("FCM error:", err);
  }
};

export default function DashboardPage() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingIds, setPendingIds] = useState([])

  const sentRemindersRef = useRef(new Set())

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
  const setupForegroundPush = async () => {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);

      // 🔥 THIS MAKES POPUP SHOW WHEN APP IS OPEN
      new Notification(payload.notification.title, {
        body: payload.notification.body,
      });
    });
  };

  setupForegroundPush();
}, []);

useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }
}, []);

useEffect(() => {
  const checkReminders = () => {
    if (!("Notification" in window)) return
    if (Notification.permission !== "granted") return
    if (!Array.isArray(habits)) return

  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)
  const currentDay = now.toISOString().split("T")[0]

  habits.forEach((habit) => {
    const reminders = Array.isArray(habit.reminders) ? habit.reminders : []

    reminders.forEach((reminder) => {
      if (!reminder.isActive) return

const reminderTime = String(reminder.time).slice(0, 5)
console.log("Reminder time:", reminderTime, "Current time:", currentTime)

if (reminderTime !== currentTime) return
console.log("MATCH FOUND", habit.title)

      const key = `${habit.id}-${reminder.id}-${currentDay}-${currentTime}`;

      if (sentRemindersRef.current.has(key)) return;

navigator.serviceWorker?.ready.then((registration) => {
  registration.showNotification("Habit Reminder", {
    body: `Time to do: ${habit.title}`,
  });
});

      sentRemindersRef.current.add(key);
    });
  });
}

  checkReminders()
  const interval = setInterval(checkReminders, 10000)

  return () => clearInterval(interval)
}, [habits])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const habitsRes = await fetch("/api/habits", { cache: "no-store" })

      const contentType = habitsRes.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await habitsRes.text()
        console.error("Non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      if (!habitsRes.ok) {
        const errData = await habitsRes.json()
        throw new Error(errData.error || "Failed to fetch habits")
      }

      const habitsData = await habitsRes.json()
      const habitsArray = Array.isArray(habitsData?.habits)
  ? habitsData.habits
  : []
      setHabits(habitsArray)

      try {
        const logsRes = await fetch("/api/habits/logs/today", { cache: "no-store" })

        if (logsRes.ok) {
          const logsData = await logsRes.json()
          const logsArray = Array.isArray(logsData) ? logsData : logsData.logs || []
          setLogs(logsArray.map((log) => log.habitId))
        } else {
          setLogs([])
        }
      } catch (logErr) {
        console.error("Logs fetch error:", logErr)
        setLogs([])
      }
    } catch (err) {
      console.error("Dashboard error:", err)
      setError(err.message || "Failed to load dashboard")
      setHabits([])
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (habitId) => {
    if (logs.includes(habitId) || pendingIds.includes(habitId)) return

    setError(null)
    setPendingIds((prev) => [...prev, habitId])
    setLogs((prev) => [...prev, habitId])

    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || "Failed to log habit")
      }
    } catch (err) {
      console.error("Toggle error:", err)
      setLogs((prev) => prev.filter((id) => id !== habitId))
      setError(err.message || "Failed to log habit")
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== habitId))
    }
  }

  const completedToday = logs.length
  const totalHabits = habits.length
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  const categories = useMemo(() => {
    return habits.length > 0
      ? [...new Set(habits.map((h) => h.category).filter(Boolean))]
      : []
  }, [habits])

  const bestStreak = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, Number(h.currentStreak || 0)), 0)
  }, [habits])

  const STATS = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c47ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: "Total Habits",
      value: totalHabits,
      accent: "#6c47ff",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00cc88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      label: "Done Today",
      value: `${completedToday}/${totalHabits}`,
      accent: "#00cc88",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      label: "Completion",
      value: `${completionRate}%`,
      accent: "#00d4ff",
    },
    {
      icon: <span style={{ fontSize: 18 }}>🔥</span>,
      label: "Best Streak",
      value: bestStreak,
      accent: "#ff6b35",
    },
  ]

  const TIPS = [
    "Stack new habits onto existing routines — it makes new habits easier to remember.",
    "A habit that takes under 2 minutes is easier to start and easier to repeat.",
    "Missing once can happen. Missing twice is what you should avoid.",
    "Keep your habit cue obvious so your brain remembers it faster.",
    "Small daily wins beat rare big efforts when building habits.",
    "Make the habit easy first. You can make it bigger later.",
    "Consistency matters more than intensity in the early stage.",
  ]

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const dayNumber = Math.floor(startOfToday.getTime() / 86400000)
  const dailyTip = TIPS[dayNumber % TIPS.length]

  if (error && loading === false && habits.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Error loading dashboard</h2>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

        .dash {
          max-width: 1080px;
          width: 100%;
          color: var(--text, #111827);
        }

        .inline-error {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.18);
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
          font-size: 13px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }

        .stat-card {
          background: var(--card, #ffffff);
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          border-radius: 16px;
          padding: 18px 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-glow);
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
        }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-line);
        }

        .stat-icon {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--text, #111827);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        @media (max-width: 480px) {
          .stat-value { font-size: 22px; }
          .stat-card { padding: 14px 16px; }
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text, #111827);
        }
        .section-sub {
          font-size: 12px;
          color: var(--text-muted, #6b7280);
          margin-top: 3px;
        }

        .habits-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .habit-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--card, #ffffff);
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          border-radius: 14px;
          padding: 14px 18px;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .habit-row:hover {
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }
        .habit-row.done {
          border-color: rgba(0,204,136,0.25);
          background: linear-gradient(180deg, rgba(0,204,136,0.05), rgba(0,204,136,0.03));
        }
        .habit-row.pending {
          opacity: 0.82;
        }

        .habit-check {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          border-radius: 50%;
          border: 2px solid var(--card-border, rgba(0,0,0,0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 11px;
          color: #fff;
          background: transparent;
        }
        .habit-row.done .habit-check {
          background: #00cc88;
          border-color: #00cc88;
          box-shadow: 0 0 0 4px rgba(0,204,136,0.08);
        }

        .habit-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .habit-info {
          flex: 1;
          min-width: 0;
        }
        .habit-name {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text, #111827);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .habit-row.done .habit-name {
          text-decoration: line-through;
          opacity: 0.55;
        }
        .habit-meta {
          font-size: 11px;
          color: var(--text-muted, #6b7280);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .habit-streak {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #ea580c;
          font-weight: 700;
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 999px;
        }

        .empty-state {
          text-align: center;
          padding: 50px 20px;
          background: var(--card, #ffffff);
          border: 1px dashed var(--card-border, rgba(0,0,0,0.08));
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text, #111827);
          margin-bottom: 6px;
        }
        .empty-sub {
          font-size: 13px;
          color: var(--text-muted, #6b7280);
          margin-bottom: 20px;
        }

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--badge-bg, rgba(99,102,241,0.08));
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 13px;
          color: var(--badge-text, #4f46e5);
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .add-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.12);
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 640px) {
          .bottom-grid { grid-template-columns: 1fr; }
        }

        .panel {
          background: var(--card, #ffffff);
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text, #111827);
          margin-bottom: 14px;
        }

        .category-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.08));
          font-size: 13px;
          gap: 12px;
        }
        .category-item:last-child {
          border-bottom: none;
        }
        .cat-name {
          color: var(--text-sub, #4b5563);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cat-count {
          background: var(--badge-bg, rgba(99,102,241,0.08));
          color: var(--badge-text, #4f46e5);
          border-radius: 999px;
          padding: 3px 9px;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .tip-box {
          background: linear-gradient(135deg, rgba(108,71,255,0.08), rgba(0,212,255,0.04));
          border: 1px solid rgba(108,71,255,0.15);
          border-radius: 12px;
          padding: 16px;
          font-size: 13px;
          color: var(--text-sub, #4b5563);
          line-height: 1.7;
        }
        .tip-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: var(--badge-text, #4f46e5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .sub-note {
          margin-top: 10px;
          font-size: 11px;
          color: var(--text-muted, #6b7280);
          line-height: 1.6;
        }

        .shimmer {
          background: var(--card, #ffffff);
          border-radius: 12px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* light mode improvements */
        @media (prefers-color-scheme: light) {
          .stat-card,
          .habit-row,
          .panel,
          .empty-state {
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
          }

          .habit-row.done {
            background: linear-gradient(180deg, rgba(16,185,129,0.07), rgba(16,185,129,0.03));
          }

          .tip-box {
            background: linear-gradient(135deg, rgba(99,102,241,0.09), rgba(14,165,233,0.05));
          }
        }
      `}</style>

      <div className="dash">
        {error && <div className="inline-error">{error}</div>}

        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="stat-card"
              style={{ "--accent-line": s.accent, "--accent-glow": `${s.accent}44` }}
            >
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{loading ? "—" : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="section-header">
          <div>
            <div className="section-title">Today&aspo;s Habits</div>
            <div className="section-sub">
              {totalHabits === 0
                ? "No habits yet"
                : completedToday === totalHabits
                ? "🎉 All done! Incredible work."
                : `${totalHabits - completedToday} habit${totalHabits - completedToday !== 1 ? "s" : ""} remaining`}
            </div>
          </div>
          <Link href="/habits/new" className="add-btn">
            + New Habit
          </Link>
        </div>

        <div className="habits-grid">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 68 }} />
            ))
          ) : habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <div className="empty-title">No habits yet</div>
              <div className="empty-sub">Create your first habit and start building momentum</div>
              <Link href="/habits/new" className="add-btn">
                + Create your first habit
              </Link>
            </div>
          ) : (
            (Array.isArray(habits) ? habits : []).map((habit) => {
              const done = logs.includes(habit.id)
              const pending = pendingIds.includes(habit.id)

              return (
                <div
                  key={habit.id}
                  className={`habit-row ${done ? "done" : ""} ${pending ? "pending" : ""}`}
                  onClick={() => !done && !pending && toggleHabit(habit.id)}
                >
                  <div className="habit-check">
                    {pending ? "…" : done ? "✓" : ""}
                  </div>

                  <div className="habit-icon-wrap" style={{ background: `${habit.color}18` }}>
                    {habit.icon}
                  </div>

                  <div className="habit-info">
                    <div className="habit-name">{habit.title}</div>
                    <div className="habit-meta">
                      <span>{habit.category}</span>
                      <span>·</span>
                      <span>{habit.frequency}</span>
                      {habit.reminders?.[0] && (
  <>
    <span>·</span>
    <span>reminder {habit.reminders[0].time}</span>
  </>
)}
                      {pending && (
                        <>
                          <span>·</span>
                          <span>saving...</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="habit-streak">🔥 {habit.currentStreak || 0}</div>
                </div>
              )
            })
          )}
        </div>

        <div className="bottom-grid">
          <div className="panel">
            <div className="panel-title">Categories</div>
            {categories.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
                No categories yet
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat} className="category-item">
                  <span className="cat-name">{cat}</span>
                  <span className="cat-count">
                    {habits.filter((h) => h.category === cat).length}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <div className="panel-title">Daily Tip</div>
            <div className="tip-box">
              <div className="tip-label">💡 Habit Science</div>
              {dailyTip}
            </div>
            <div className="sub-note">
              Tip changes automatically each day.
            </div>
          </div>
        </div>
      </div>
      
    </>
  )
}
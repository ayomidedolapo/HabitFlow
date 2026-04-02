"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const FILTERS = ["All", "Daily", "Weekly", "Health", "Fitness", "Study", "Work", "Personal", "Mindfulness"]

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchHabits()
    setTimeout(() => setMounted(true), 50)
  }, [])

 const fetchHabits = async () => {
  try {
    const res = await fetch("/api/habits")
    const data = await res.json()
    // API returns { habits: [...] }, so extract the array  
    setHabits(data.habits || [])
  } catch (e) { 
    console.error(e)
    setHabits([])
  }
  finally { setLoading(false) }
}

  const deleteHabit = async (id) => {
    setDeleting(id)
    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" })
      setHabits(p => p.filter(h => h.id !== id))
    } catch (e) { console.error(e) }
    finally { setDeleting(null); setConfirmDelete(null) }
  }

const archiveHabit = async (habit) => {
  try {
    const newValue = !habit.isArchived

    await fetch(`/api/habits/${habit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: newValue }),
    })

    // update UI instead of removing
    setHabits(p =>
      p.map(h =>
        h.id === habit.id
          ? { ...h, isArchived: newValue }
          : h
      )
    )
  } catch (e) {
    console.error(e)
  }
}

  const filtered = habits.filter(h => {
    const matchFilter = filter === "All" ||
      h.frequency === filter.toLowerCase() ||
      h.category === filter
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalLogs = habits.reduce((s, h) => s + (h._count?.logs || 0), 0)
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + (h._count?.logs || 0), 0) / habits.length)
    : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

        .hp { font-family: 'Outfit', sans-serif; max-width: 900px; }

        /* ── Page enter ── */
        .hp-body {
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .hp-body.in { opacity: 1; transform: none; }

        /* ── Header ── */
        .hp-hdr { margin-bottom: 28px; }
        .hp-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 4vw, 42px);
          color: var(--ct); letter-spacing: -0.025em;
          line-height: 1.1; margin-bottom: 4px;
        }
        .hp-title em { font-style: italic; color: #6366f1; }
        .hp-sub { font-size: 13.5px; color: var(--cm); font-weight: 300; }

        /* ── Summary strip ── */
        .summary-strip {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 28px;
        }
        @media (max-width: 480px) { .summary-strip { grid-template-columns: 1fr 1fr; } }

        .summary-tile {
          padding: 16px 18px; border-radius: 14px;
          border: 1px solid var(--cb); background: var(--cc);
          transition: transform 0.18s, border-color 0.18s;
          position: relative; overflow: hidden;
        }
        .summary-tile:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.3); }
        .summary-tile::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--tile-accent, #6366f1);
        }
        .summary-val {
          font-family: 'Instrument Serif', serif;
          font-size: 30px; color: var(--ct);
          letter-spacing: -0.04em; line-height: 1;
          margin-bottom: 4px;
        }
        .summary-label {
          font-size: 11px; color: var(--cm);
          text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500;
        }

        /* ── Toolbar ── */
        .toolbar {
          display: flex; gap: 10px; margin-bottom: 18px;
          flex-wrap: wrap; align-items: center;
        }

        /* search */
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: var(--cm);
          pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 10px 14px 10px 36px;
          background: var(--ib); border: 1.5px solid var(--cb);
          border-radius: 11px; font-size: 13.5px; color: var(--ct);
          font-family: 'Outfit', sans-serif; outline: none;
          transition: all 0.15s;
        }
        .search-input::placeholder { color: var(--cm); opacity: 0.6; }
        .search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.09); background: var(--cc); }

        /* new habit btn */
        .new-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #6366f1; color: #fff; border: none;
          border-radius: 11px; padding: 10px 18px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.2s; text-decoration: none; white-space: nowrap;
        }
        .new-btn:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.3); }

        /* ── Filter pills ── */
        .filter-row {
          display: flex; gap: 6px; margin-bottom: 22px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .filter-row::-webkit-scrollbar { display: none; }
        .filter-pill {
          padding: 6px 14px; border-radius: 99px;
          border: 1.5px solid var(--cb); background: transparent;
          font-size: 12.5px; color: var(--cm); font-weight: 500;
          cursor: pointer; white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          transition: all 0.15s; flex-shrink: 0;
        }
        .filter-pill:hover { border-color: rgba(99,102,241,0.4); color: var(--ct); }
        .filter-pill.active {
          background: #6366f1; border-color: #6366f1;
          color: #fff;
        }

        /* ── Habit cards ── */
        .habits-list { display: flex; flex-direction: column; gap: 10px; }

        .habit-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-radius: 15px;
          border: 1px solid var(--cb); background: var(--cc);
          transition: all 0.2s; position: relative;
          overflow: hidden;
        }
        .habit-card::before {
          content: ''; position: absolute;
          left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--habit-color, #6366f1);
          opacity: 0; transition: opacity 0.2s;
        }
        .habit-card:hover { border-color: rgba(99,102,241,0.25); transform: translateX(3px); }
        .habit-card:hover::before { opacity: 1; }

        .habit-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0; transition: transform 0.2s;
        }
        .habit-card:hover .habit-icon { transform: scale(1.05); }

        .habit-info { flex: 1; min-width: 0; }
        .habit-name {
          font-size: 15px; font-weight: 600; color: var(--ct);
          margin-bottom: 4px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
          font-family: 'Instrument Serif', serif;
          letter-spacing: -0.01em;
        }
        .habit-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .habit-tag {
          padding: 2px 9px; border-radius: 99px;
          font-size: 11px; font-weight: 500;
          background: var(--ib); color: var(--cm);
          border: 1px solid var(--cb);
        }
        .habit-tag.freq {
          background: rgba(99,102,241,0.08);
          color: #6366f1; border-color: rgba(99,102,241,0.2);
        }

        .habit-stats {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 4px; flex-shrink: 0;
        }
        .habit-streak {
          font-family: 'Instrument Serif', serif;
          font-size: 18px; color: var(--ct); letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 4px;
        }
        .habit-streak-label { font-size: 10px; color: var(--cm); text-transform: uppercase; letter-spacing: 0.06em; }

        /* actions */
        .habit-actions {
          display: flex; gap: 6px; flex-shrink: 0;
          opacity: 0; transition: opacity 0.2s;
        }
        .habit-card:hover .habit-actions { opacity: 1; }
        @media (max-width: 640px) { .habit-actions { opacity: 1; } }

        .action-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--cb); background: var(--ib);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; color: var(--cm);
        }
        .action-btn:hover { background: var(--cc); color: var(--ct); border-color: rgba(99,102,241,0.3); }
        .action-btn.danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.25); }

        /* ── Empty state ── */
        .empty {
          border-radius: 18px; overflow: hidden;
          border: 1px solid var(--cb); margin-top: 8px;
        }
        .empty-img { width: 100%; height: 200px; object-fit: cover; opacity: 0.6; display: block; }
        .empty-body { padding: 28px; text-align: center; background: var(--cc); }
        .empty-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px; color: var(--ct); margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .empty-sub { font-size: 13px; color: var(--cm); margin-bottom: 20px; line-height: 1.6; }

        /* ── Delete confirm modal ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: var(--cc); border: 1px solid var(--cb);
          border-radius: 20px; padding: 28px; max-width: 380px; width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }

        .modal-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(239,68,68,0.1); color: #ef4444;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .modal-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px; color: var(--ct); margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .modal-sub { font-size: 13px; color: var(--cm); line-height: 1.6; margin-bottom: 22px; }
        .modal-actions { display: flex; gap: 8px; }
        .modal-cancel {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 1px solid var(--cb); background: transparent;
          color: var(--cm); font-size: 14px; font-weight: 500;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.15s;
        }
        .modal-cancel:hover { background: var(--ib); color: var(--ct); }
        .modal-delete {
          flex: 1; padding: 12px; border-radius: 10px;
          border: none; background: #ef4444; color: #fff;
          font-size: 14px; font-weight: 600;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.15s;
        }
        .modal-delete:hover { background: #dc2626; box-shadow: 0 4px 14px rgba(239,68,68,0.3); }
        .modal-delete:disabled { opacity: 0.6; cursor: not-allowed; }

        /* shimmer */
        .shimmer { border-radius: 15px; background: var(--cb); animation: sh 1.4s ease-in-out infinite; }
        @keyframes sh { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
      `}</style>

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <div className="modal-title">Delete this habit?</div>
            <div className="modal-sub">
              <strong style={{ color: "var(--ct)" }}>"{confirmDelete.title}"</strong> and all its logs will be permanently deleted. This cannot be undone.
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmDelete(null)}>Keep it</button>
              <button
                className="modal-delete"
                disabled={deleting === confirmDelete.id}
                onClick={() => deleteHabit(confirmDelete.id)}
              >
                {deleting === confirmDelete.id ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hp">
        <div className={`hp-body ${mounted ? "in" : ""}`}>

          {/* Header */}
          <div className="hp-hdr">
            <div className="hp-title">My <em>habits</em></div>
            <div className="hp-sub">
              {habits.length === 0 ? "You haven't created any habits yet." : `${habits.length} habit${habits.length !== 1 ? "s" : ""} in your collection`}
            </div>
          </div>

          {/* Summary strip */}
          {!loading && habits.length > 0 && (
            <div className="summary-strip">
              {[
                { val: habits.length, label: "Total habits", accent: "#6366f1" },
                { val: totalLogs, label: "Total check-ins", accent: "#10b981" },
                { val: `${avgStreak}d`, label: "Avg. streak", accent: "#f97316" },
              ].map((s, i) => (
                <div key={i} className="summary-tile" style={{ "--tile-accent": s.accent }}>
                  <div className="summary-val">{s.val}</div>
                  <div className="summary-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="search-input"
                type="text"
                placeholder="Search habits…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href="/habits/new" className="new-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New habit
            </Link>
          </div>

          {/* Filter pills */}
          <div className="filter-row">
            {FILTERS.map(f => (
              <button key={f} className={`filter-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {/* Habits */}
          {loading ? (
            <div className="habits-list">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 78 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <img
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop"
                alt=""
                className="empty-img"
              />
              <div className="empty-body">
                <div className="empty-title">
                  {habits.length === 0 ? "No habits yet" : "Nothing matches"}
                </div>
                <div className="empty-sub">
                  {habits.length === 0
                    ? "Start building your routine — create your first habit and watch the streaks grow."
                    : "Try a different search or filter to find what you're looking for."}
                </div>
                {habits.length === 0 && (
                  <Link href="/habits/new" className="new-btn" style={{ margin: "0 auto" }}>
                    + Create first habit
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="habits-list">
              {filtered.map((h, i) => (
                <div
                  key={h.id}
                  className="habit-card"
                  style={{
                    "--habit-color": h.color,
                    animationDelay: `${i * 0.04}s`,
                    opacity: 1,
                  }}
                >
                  <div className="habit-icon" style={{ background: `${h.color}15` }}>
                    {h.icon}
                  </div>
                  <div className="habit-info">
                    <div className="habit-name">{h.title}</div>
                    <div className="habit-tags">
                      <span className="habit-tag">{h.category}</span>
                      <span className="habit-tag freq">{h.frequency}</span>
                      {h.description && (
                        <span className="habit-tag" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="habit-stats">
                    <div className="habit-streak">
                      🔥 {h._count?.logs || 0}
                    </div>
                    <div className="habit-streak-label">check-ins</div>
                  </div>

                  <div className="habit-actions">
                    <button
                      className="action-btn"
                      title="Edit"
                      onClick={() => router.push(`/habits/${h.id}/edit`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn"
                      title="Archive"
                      onClick={() => archiveHabit(h)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn danger"
                      title="Delete"
                      onClick={() => setConfirmDelete(h)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
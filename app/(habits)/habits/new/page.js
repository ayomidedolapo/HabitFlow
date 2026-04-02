"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const CATEGORIES = ["Health","Fitness","Study","Work","Personal","Finance","Social","Creative","Mindfulness","Other"]
const COLORS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#84cc16", name: "Lime" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#0ea5e9", name: "Sky" },
]
const ICONS = ["⭐","🔥","💪","📚","🧘","🏃","💧","🥗","😴","💻","🎯","✍️","🎨","🎵","🌿","💰","🤝","🧠","❤️","🌅","🏋️","🚴","🌙","☀️","🦋","🌊","🏔️","🍎","🧩","🎪"]

const UNSPLASH = {
  Health:      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop",
  Fitness:     "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&auto=format&fit=crop",
  Study:       "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&auto=format&fit=crop",
  Work:        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop",
  Personal:    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop",
  Finance:     "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop",
  Social:      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop",
  Creative:    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80&auto=format&fit=crop",
  Mindfulness: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800&q=80&auto=format&fit=crop",
  Other:       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
}

export default function NewHabitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1) // 1=basics, 2=style
  const [form, setForm] = useState({
    title: "", description: "",
    category: "Health", frequency: "daily",
    color: "#6366f1", icon: "⭐",

    reminderEnabled: false,
reminderTime: "",
reminderMethod: "push",
  })

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Give your habit a name first"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const bgImage = UNSPLASH[form.category]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

        .nhp { font-family: 'Outfit', sans-serif; max-width: 1100px; }

        /* ── Page enter animation ── */
        .nhp-inner {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 24px;
          align-items: start;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .nhp-inner.in { opacity: 1; transform: none; }
        @media (max-width: 900px) {
          .nhp-inner { grid-template-columns: 1fr; }
        }

        /* ── Back / header ── */
        .nhp-back {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; color: var(--cm); text-decoration: none;
          margin-bottom: 20px; transition: color 0.15s;
          font-weight: 400;
        }
        .nhp-back:hover { color: #6366f1; }

        .nhp-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 4vw, 48px);
          color: var(--ct); line-height: 1.1;
          letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .nhp-heading em { font-style: italic; color: #6366f1; }
        .nhp-sub { font-size: 14px; color: var(--cm); margin-bottom: 32px; font-weight: 300; }

        /* ── Step tabs ── */
        .step-tabs { display: flex; gap: 0; margin-bottom: 28px; background: var(--ib); border-radius: 12px; padding: 4px; border: 1px solid var(--cb); }
        .step-tab {
          flex: 1; padding: 9px 16px; border-radius: 9px;
          border: none; background: transparent; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 13px;
          font-weight: 500; color: var(--cm); transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .step-tab.active { background: var(--cc); color: var(--ct); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .step-num {
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(99,102,241,0.12); color: #6366f1;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .step-tab.active .step-num { background: #6366f1; color: #fff; }

        /* ── Form sections ── */
        .form-section { display: flex; flex-direction: column; gap: 18px; }

        /* ── Floating label field ── */
        .fl-field { position: relative; }
        .fl-input, .fl-textarea, .fl-select {
          width: 100%; padding: 20px 16px 8px;
          background: var(--ib); border: 1.5px solid var(--cb);
          border-radius: 12px; font-size: 15px; color: var(--ct);
          font-family: 'Outfit', sans-serif; font-weight: 400;
          outline: none; transition: all 0.2s; resize: none;
          appearance: none;
        }
        .fl-textarea { padding-top: 22px; min-height: 90px; }
        .fl-input:focus, .fl-textarea:focus, .fl-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
          background: var(--cc);
        }
        .fl-label {
          position: absolute; left: 16px; top: 14px;
          font-size: 13px; color: var(--cm); font-weight: 500;
          transition: all 0.18s; pointer-events: none;
          text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px;
        }
        .fl-input:focus ~ .fl-label,
        .fl-input:not(:placeholder-shown) ~ .fl-label,
        .fl-textarea:focus ~ .fl-label,
        .fl-textarea:not(:placeholder-shown) ~ .fl-label { top: 7px; font-size: 9px; color: #6366f1; }

        /* select arrow */
        .fl-select-wrap { position: relative; }
        .fl-select-wrap::after {
          content: '';
          position: absolute; right: 16px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--cm);
          pointer-events: none;
        }
        .fl-select { cursor: pointer; }
        .fl-select-label {
          position: absolute; left: 16px; top: 7px;
          font-size: 9px; color: #6366f1; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em;
          pointer-events: none;
        }

        /* ── Frequency pills ── */
        .freq-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .freq-pill {
          padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid var(--cb); background: var(--ib);
          cursor: pointer; text-align: center; transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
        }
        .freq-pill:hover { border-color: rgba(99,102,241,0.4); }
        .freq-pill.active { border-color: #6366f1; background: rgba(99,102,241,0.07); }
        .freq-pill-label { font-size: 14px; font-weight: 500; color: var(--ct); margin-bottom: 2px; text-transform: capitalize; }
        .freq-pill.active .freq-pill-label { color: #6366f1; }
        .freq-pill-sub { font-size: 11px; color: var(--cm); }

        /* ── Color grid ── */
        .color-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        @media (max-width: 480px) { .color-grid { grid-template-columns: repeat(6, 1fr); } }
        .color-tile {
          aspect-ratio: 1; border-radius: 10px; cursor: pointer;
          position: relative; transition: transform 0.15s;
          border: 2px solid transparent;
        }
        .color-tile:hover { transform: scale(1.08); }
        .color-tile.active {
          border-color: white;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.4);
          transform: scale(1.05);
        }
        .color-tile.active::after {
          content: '✓'; position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        /* ── Icon grid ── */
        .icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
        .icon-tile {
          aspect-ratio: 1; border-radius: 11px; cursor: pointer;
          background: var(--ib); border: 1.5px solid transparent;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; transition: all 0.15s;
        }
        .icon-tile:hover { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); transform: scale(1.1); }
        .icon-tile.active { border-color: #6366f1; background: rgba(99,102,241,0.1); transform: scale(1.05); }

        /* ── Section label ── */
        .sec-label {
          font-size: 10.5px; font-weight: 600; color: var(--cm);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
        }

        /* ── Error ── */
        .err {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-radius: 11px;
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18);
          font-size: 13px; color: #ef4444;
        }

        /* ── Actions ── */
        .actions { display: flex; gap: 10px; margin-top: 4px; }
        .btn-primary {
          flex: 1; background: #6366f1; color: #fff; border: none;
          border-radius: 12px; padding: 15px 24px;
          font-size: 15px; font-weight: 600;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.01em;
        }
        .btn-primary:hover:not(:disabled) { background: #4f46e5; box-shadow: 0 6px 20px rgba(99,102,241,0.35); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-ghost {
          padding: 15px 20px; border-radius: 12px;
          border: 1.5px solid var(--cb); background: transparent;
          color: var(--cm); font-size: 15px; font-weight: 500;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.15s; text-decoration: none;
          display: inline-flex; align-items: center; white-space: nowrap;
        }
        .btn-ghost:hover { background: var(--ib); color: var(--ct); }

        /* ── Right panel — live preview ── */
        .preview-panel { position: sticky; top: 100px; }

        .preview-hero {
          border-radius: 20px; overflow: hidden;
          height: 220px; position: relative;
          margin-bottom: 16px; transition: all 0.4s ease;
        }
        .preview-hero-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.4s ease;
        }
        .preview-hero-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%);
          transition: background 0.4s;
        }
        .preview-hero-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 22px;
        }
        .preview-cat-badge {
          display: inline-block; padding: 3px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #fff; margin-bottom: 8px;
          transition: background 0.3s;
        }
        .preview-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px; color: #fff; line-height: 1.2;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          min-height: 26px;
        }
        .preview-title-placeholder { opacity: 0.4; font-style: italic; }

        /* preview card */
        .preview-card {
          background: var(--cc); border: 1px solid var(--cb);
          border-radius: 16px; padding: 20px;
        }
        .preview-card-title {
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--cm); font-weight: 600;
          margin-bottom: 16px;
        }
        .preview-habit-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 11px;
          border: 1px solid var(--cb); margin-bottom: 10px;
          transition: all 0.2s;
        }
        .preview-habit-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0; transition: all 0.2s;
        }
        .preview-habit-info { flex: 1; min-width: 0; }
        .preview-habit-name {
          font-size: 14px; font-weight: 500; color: var(--ct);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: all 0.2s;
        }
        .preview-habit-meta { font-size: 11px; color: var(--cm); margin-top: 2px; }
        .preview-streak { font-size: 12px; color: #f97316; font-weight: 500; }

        .preview-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
        .preview-stat {
          padding: 10px 12px; border-radius: 9px;
          background: var(--ib); border: 1px solid var(--cb);
          text-align: center;
        }
        .preview-stat-val { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--ct); }
        .preview-stat-label { font-size: 10px; color: var(--cm); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

        @media (max-width: 900px) {
          .preview-panel { position: static; }
          .preview-hero { height: 180px; }
        }
      `}</style>

      <div className="nhp">
        <Link href="/dashboard" className="nhp-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </Link>

        <div className={`nhp-inner ${mounted ? "in" : ""}`}>

          {/* ── Left: Form ── */}
          <div>
            <h1 className="nhp-heading">Build a new <em>habit</em></h1>
            <p className="nhp-sub">Every great routine starts with a single intentional choice.</p>

            {/* Step tabs */}
            <div className="step-tabs">
              {[
                { n: 1, label: "Basics" },
                { n: 2, label: "Style" },
              ].map(s => (
                <button key={s.n} className={`step-tab ${step === s.n ? "active" : ""}`} onClick={() => setStep(s.n)}>
                  <span className="step-num">{s.n}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step 1 — Basics */}
            {step === 1 && (
              <div className="form-section">
                {/* Title */}
                <div className="fl-field">
                  <input
                    className="fl-input"
                    type="text"
                    placeholder=" "
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    maxLength={60}
                    autoFocus
                  />
                  <label className="fl-label">Habit title *</label>
                </div>

                {/* Description */}
                <div className="fl-field">
                  <textarea
                    className="fl-textarea"
                    placeholder=" "
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    maxLength={200}
                  />
                  <label className="fl-label">Why does this matter to you? (optional)</label>
                </div>

                {/* Category */}
                <div>
                  <div className="sec-label">Category</div>
                  <div className="fl-select-wrap">
                 <select
  className="fl-input fl-select"
  value={form.category}
  onChange={e => set("category", e.target.value)}
  style={{ paddingTop: 14, paddingBottom: 14 }}
>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <span className="fl-select-label">Category</span>
                  </div>
                </div>

 <div className="reminder-section">
  <style>{`
    .reminder-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Toggle Switch - Modern */
    .reminder-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--cb);
      background: var(--cc);
      transition: all 0.2s ease;
    }

    .reminder-toggle:hover {
      border-color: rgba(99,102,241,0.3);
      background: rgba(99,102,241,0.02);
    }

    .reminder-toggle input[type="checkbox"] {
      appearance: none;
      width: 44px;
      height: 24px;
      background: var(--cb);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .reminder-toggle input[type="checkbox"]::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .reminder-toggle input[type="checkbox"]:checked {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }

    .reminder-toggle input[type="checkbox"]:checked::after {
      left: 22px;
    }

    .reminder-label {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .reminder-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--ct);
    }

    .reminder-hint {
      font-size: 12px;
      color: var(--cm);
    }

    /* Expanded Options */
    .reminder-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 16px;
      background: rgba(99,102,241,0.03);
      border: 1px solid rgba(99,102,241,0.1);
      border-radius: 12px;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .reminder-options {
        grid-template-columns: 1fr;
      }
    }

    /* Time Input */
    .time-input-wrapper {
      position: relative;
    }

    .time-input-wrapper::before {
      content: '🕐';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      pointer-events: none;
    }

    .reminder-time {
      width: 100%;
      padding: 10px 12px 10px 36px;
      font-size: 14px;
      font-weight: 500;
      color: var(--ct);
      background: var(--cc);
      border: 1px solid var(--cb);
      border-radius: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reminder-time:hover {
      border-color: rgba(99,102,241,0.4);
    }

    .reminder-time:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }

    /* Method Select */
    .method-select-wrapper {
      position: relative;
    }

    .method-select-wrapper::before {
      content: '📡';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      pointer-events: none;
    }

    .reminder-method {
      width: 100%;
      padding: 10px 36px 10px 36px;
      font-size: 14px;
      font-weight: 500;
      color: var(--ct);
      background: var(--cc);
      border: 1px solid var(--cb);
      border-radius: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      appearance: none;
      transition: all 0.2s ease;
    }

    .method-select-wrapper::after {
      content: '▼';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: var(--cm);
      pointer-events: none;
    }

    .reminder-method:hover {
      border-color: rgba(99,102,241,0.4);
    }

    .reminder-method:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }

    /* Option labels */
    .option-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--cm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
      display: block;
    }
  `}</style>

  {/* Toggle */}
  <label className="reminder-toggle">
    <input
      type="checkbox"
      checked={form.reminderEnabled}
      onChange={(e) => set("reminderEnabled", e.target.checked)}
    />
    <div className="reminder-label">
      <span className="reminder-title">Enable Reminder</span>
      <span className="reminder-hint">Get notified to stay on track</span>
    </div>
  </label>

  {/* Expanded Options */}
  {form.reminderEnabled && (
    <div className="reminder-options">
      <div>
        <span className="option-label">Time</span>
        <div className="time-input-wrapper">
          <input
            type="time"
            value={form.reminderTime}
            onChange={(e) => set("reminderTime", e.target.value)}
            className="reminder-time"
          />
        </div>
      </div>

      <div>
        <span className="option-label">Method</span>
        <div className="method-select-wrapper">
          <select
            value={form.reminderMethod}
            onChange={(e) => set("reminderMethod", e.target.value)}
            className="reminder-method"
          >
            <option value="push">📱 Push Notification</option>
            <option value="email">✉️ Email</option>
          </select>
        </div>
      </div>
    </div>
  )}
</div>

                {/* Frequency */}
                <div>
                  <div className="sec-label">How often?</div>
                  <div className="freq-group">
                    <div className={`freq-pill ${form.frequency === "daily" ? "active" : ""}`} onClick={() => set("frequency", "daily")}>
                      <div className="freq-pill-label">Daily</div>
                      <div className="freq-pill-sub">Every single day</div>
                    </div>
                    <div className={`freq-pill ${form.frequency === "weekly" ? "active" : ""}`} onClick={() => set("frequency", "weekly")}>
                      <div className="freq-pill-label">Weekly</div>
                      <div className="freq-pill-sub">A few times a week</div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="err">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="actions">
                  <Link href="/dashboard" className="btn-ghost">Cancel</Link>
                  <button className="btn-primary" onClick={() => setStep(2)}>
                    Next — Choose style →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Style */}
            {step === 2 && (
              <div className="form-section">
                {/* Color */}
                <div>
                  <div className="sec-label">Accent color</div>
                  <div className="color-grid">
                    {COLORS.map(c => (
                      <div
                        key={c.hex}
                        className={`color-tile ${form.color === c.hex ? "active" : ""}`}
                        style={{ background: c.hex }}
                        onClick={() => set("color", c.hex)}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <div className="sec-label">Pick an icon</div>
                  <div className="icon-grid">
                    {ICONS.map(ic => (
                      <div
                        key={ic}
                        className={`icon-tile ${form.icon === ic ? "active" : ""}`}
                        onClick={() => set("icon", ic)}
                      >
                        {ic}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="err">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="actions">
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" disabled={loading} onClick={handleSubmit}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Creating…
                        </span>
                      : "Create habit ✦"
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="preview-panel">

            {/* Hero image — changes with category */}
            <div className="preview-hero">
              <img
                src={bgImage}
                alt={form.category}
                className="preview-hero-img"
              />
              <div className="preview-hero-scrim" style={{ background: `linear-gradient(160deg, ${form.color}22 0%, rgba(0,0,0,0.78) 100%)` }} />
              <div className="preview-hero-content">
                <div className="preview-cat-badge" style={{ background: form.color }}>
                  {form.category}
                </div>
                <div className={`preview-title ${!form.title ? "preview-title-placeholder" : ""}`}>
                  {form.title || "Your habit name…"}
                </div>
              </div>
            </div>

            {/* Habit card preview */}
            <div className="preview-card">
              <div className="preview-card-title">Live preview</div>

              <div className="preview-habit-row" style={{ borderColor: `${form.color}30` }}>
                <div className="preview-habit-icon" style={{ background: `${form.color}18` }}>
                  {form.icon}
                </div>
                <div className="preview-habit-info">
                  <div className="preview-habit-name">
                    {form.title || <span style={{ opacity: 0.3, fontStyle: "italic" }}>Habit name…</span>}
                  </div>
                  <div className="preview-habit-meta">{form.category} · {form.frequency}</div>
                </div>
                <div className="preview-streak">🔥 0</div>
              </div>

              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="preview-stat-val" style={{ color: form.color }}>0</div>
                  <div className="preview-stat-label">Streak</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-val" style={{ color: form.color }}>0%</div>
                  <div className="preview-stat-label">Completion</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
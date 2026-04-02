// app/habits/[id]/edit/page.js
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const CATEGORIES = [
  { value: "Health", icon: "💪", color: "#22c55e" },
  { value: "Productivity", icon: "⚡", color: "#6366f1" },
  { value: "Mindfulness", icon: "🧘", color: "#f59e0b" },
  { value: "Learning", icon: "📚", color: "#ec4899" },
  { value: "Finance", icon: "💰", color: "#10b981" },
  { value: "Social", icon: "👥", color: "#3b82f6" },
  { value: "Creativity", icon: "🎨", color: "#8b5cf6" },
  { value: "General", icon: "⭐", color: "#6b7280" }
]

const FREQUENCIES = [
  { value: "daily", label: "Daily", icon: "📅" },
  { value: "weekly", label: "Weekly", icon: "📆" },
  { value: "weekdays", label: "Weekdays", icon: "💼" },
  { value: "weekends", label: "Weekends", icon: "🌴" }
]

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#f59e0b", "#10b981", "#22c55e",
  "#06b6d4", "#3b82f6", "#6b7280", "#0f0f14"
]

const REMINDER_METHODS = [
  { value: "push", label: "Push Notification", icon: "📱" },
  { value: "email", label: "Email", icon: "✉️" }
]

export default function EditHabitPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    frequency: "daily",
    color: "#6366f1",
    targetDays: 21,
    isArchived: false,
    reminderEnabled: false,
    reminderTime: "09:00",
    reminderMethod: "push"
  })

  // Fetch habit data
  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const res = await fetch(`/api/habits/${id}`)
        if (!res.ok) throw new Error("Failed to fetch habit")
        const data = await res.json()
        
        const habit = data.habit
        const reminder = habit.reminders?.[0]
        
        setForm({
          title: habit.title || "",
          description: habit.description || "",
          category: habit.category || "General",
          frequency: habit.frequency || "daily",
          color: habit.color || "#6366f1",
          targetDays: habit.targetDays || 21,
          isArchived: habit.isArchived || false,
          reminderEnabled: reminder?.isActive || false,
          reminderTime: reminder?.time || "09:00",
          reminderMethod: reminder?.method || "push"
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHabit()
  }, [id])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/habits/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update habit")
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this habit?")) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/habits/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isArchived: true })
      })
      
      if (!res.ok) throw new Error("Failed to archive")
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading habit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .edit-page {
          font-family: 'Inter', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 24px;
          color: var(--text);
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          text-decoration: none;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Form Card */
        .form-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }

        /* Form Groups */
        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .form-hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
        }

        /* Inputs */
        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        /* Category Grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .category-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .category-option {
          position: relative;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .category-option:hover {
          border-color: rgba(99, 102, 241, 0.3);
        }

        .category-option.selected {
          border-color: var(--accent);
          background: rgba(99, 102, 241, 0.05);
        }

        .category-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .category-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        /* Frequency Options */
        .frequency-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .frequency-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .frequency-option {
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .frequency-option:hover {
          border-color: rgba(99, 102, 241, 0.3);
        }

        .frequency-option.selected {
          border-color: var(--accent);
          background: rgba(99, 102, 241, 0.05);
        }

        .frequency-icon {
          font-size: 24px;
          margin-bottom: 6px;
        }

        .frequency-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        /* Color Picker */
        .color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .color-option {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          border: 3px solid transparent;
          position: relative;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: var(--text);
          box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--accent);
        }

        .color-option.selected::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        /* Target Days Slider */
        .target-slider {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .target-input {
          width: 80px;
          text-align: center;
          font-size: 18px;
          font-weight: 700;
        }

        .slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: var(--surface);
          appearance: none;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
        }

        /* Toggle Switch */
        .toggle-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-wrapper:hover {
          border-color: rgba(99, 102, 241, 0.3);
        }

        .toggle-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .toggle-info p {
          font-size: 13px;
          color: var(--muted);
        }

        .toggle-switch {
          width: 52px;
          height: 28px;
          background: var(--border);
          border-radius: 14px;
          position: relative;
          transition: all 0.3s;
        }

        .toggle-switch.active {
          background: var(--accent);
        }

        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-switch.active .toggle-knob {
          left: 26px;
        }

        /* Reminder Options */
        .reminder-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
          padding: 20px;
          background: rgba(99, 102, 241, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 12px;
        }

        @media (max-width: 480px) {
          .reminder-options { grid-template-columns: 1fr; }
        }

        .reminder-option label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .time-input-wrapper {
          position: relative;
        }

        .time-input-wrapper::before {
          content: '🕐';
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .time-input {
          padding-left: 40px;
        }

        /* Action Buttons */
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-save {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          color: white;
          font-size: 16px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: var(--text);
          font-size: 15px;
          font-weight: 600;
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--surface);
          border-color: var(--accent);
          color: var(--accent);
        }

        .btn-danger {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #ef4444;
          font-size: 15px;
          font-weight: 600;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Messages */
        .error-message {
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-message {
          padding: 16px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 12px;
          color: #22c55e;
          font-size: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: var(--muted);
          font-size: 14px;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: var(--border);
          margin: 32px 0;
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <Link href="/dashboard" className="back-btn">←</Link>
        <div>
          <h1 className="page-title">Edit Habit</h1>
          <p className="page-subtitle">Make changes to your habit</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>✓</span>
          Habit updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-card">
          <div className="section-title">Basic Information</div>
          
          <div className="form-group">
            <label className="form-label">Habit Name</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Morning Meditation"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Why is this habit important to you?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className={`category-option ${form.category === cat.value ? 'selected' : ''}`}
                  onClick={() => handleChange("category", cat.value)}
                >
                  <div className="category-icon">{cat.icon}</div>
                  <div className="category-name">{cat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="form-card">
          <div className="section-title">Settings</div>

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <div className="frequency-grid">
              {FREQUENCIES.map((freq) => (
                <div
                  key={freq.value}
                  className={`frequency-option ${form.frequency === freq.value ? 'selected' : ''}`}
                  onClick={() => handleChange("frequency", freq.value)}
                >
                  <div className="frequency-icon">{freq.icon}</div>
                  <div className="frequency-label">{freq.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-grid">
              {COLORS.map((color) => (
                <div
                  key={color}
                  className={`color-option ${form.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange("color", color)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Days</label>
            <div className="target-slider">
              <input
                type="range"
                min="7"
                max="90"
                value={form.targetDays}
                onChange={(e) => handleChange("targetDays", parseInt(e.target.value))}
                className="slider"
              />
              <input
                type="number"
                min="7"
                max="90"
                value={form.targetDays}
                onChange={(e) => handleChange("targetDays", parseInt(e.target.value) || 21)}
                className="form-input target-input"
              />
            </div>
            <p className="form-hint">Build consistency by maintaining your streak for {form.targetDays} days</p>
          </div>
        </div>

        {/* Reminders */}
        <div className="form-card">
          <div className="section-title">Reminders</div>
          
          <div 
            className="toggle-wrapper"
            onClick={() => handleChange("reminderEnabled", !form.reminderEnabled)}
          >
            <div className="toggle-info">
              <h4>Enable Reminders</h4>
              <p>Get notified to stay on track</p>
            </div>
            <div className={`toggle-switch ${form.reminderEnabled ? 'active' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>

          {form.reminderEnabled && (
            <div className="reminder-options">
              <div className="reminder-option">
                <label>Time</label>
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={form.reminderTime}
                    onChange={(e) => handleChange("reminderTime", e.target.value)}
                    className="form-input time-input"
                  />
                </div>
              </div>
              <div className="reminder-option">
                <label>Method</label>
                <select
                  value={form.reminderMethod}
                  onChange={(e) => handleChange("reminderMethod", e.target.value)}
                  className="form-select"
                >
                  {REMINDER_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="actions">
          <button 
            type="submit" 
            className="btn-save"
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>

          <div className="divider" />

          <button 
            type="button"
            className="btn-secondary"
            onClick={handleArchive}
            disabled={saving}
          >
            📦 Archive Habit
          </button>

          <button 
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={saving}
          >
            🗑️ Delete Habit
          </button>
        </div>
      </form>
    </div>
  )
}
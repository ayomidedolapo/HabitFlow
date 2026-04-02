"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [strength, setStrength] = useState(0)

  useEffect(() => setMounted(true), [])

  const checkStrength = (val) => {
    let s = 0
    if (val.length >= 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    setStrength(s)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) return setError("Passwords do not match")
    if (form.password.length < 8) return setError("Password must be at least 8 characters")
    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
    } else {
      router.push("/login?registered=true")
    }
  }

  const strengthColors = ["#ff4444", "#ff8800", "#ffcc00", "#00cc88"]
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          background: #080810;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; animation: drift 12s ease-in-out infinite alternate; }
        .orb-1 { width: 500px; height: 500px; background: #00d4ff; top: -150px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: #6c47ff; bottom: -100px; left: 50px; animation-delay: -6s; }
        @keyframes drift { 0% { transform: translate(0,0); } 100% { transform: translate(30px, 25px); } }

        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .right-panel {
          width: 500px; min-height: 100vh;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          padding: 60px 50px;
          position: relative; z-index: 1;
        }

        .form-container {
          width: 100%;
          opacity: 0; transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-container.visible { opacity: 1; transform: translateY(0); }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.3);
          text-decoration: none; margin-bottom: 32px;
          transition: color 0.2s;
        }
        .back-link:hover { color: rgba(255,255,255,0.6); }

        .form-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .form-subtitle { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 36px; }

        .field { margin-bottom: 18px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px 16px;
          font-size: 15px; color: #fff; font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s;
        }
        .field input::placeholder { color: rgba(255,255,255,0.18); }
        .field input:focus { border-color: rgba(108,71,255,0.6); background: rgba(108,71,255,0.08); box-shadow: 0 0 0 3px rgba(108,71,255,0.12); }

        .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
        .strength-seg { height: 3px; flex: 1; border-radius: 2px; background: rgba(255,255,255,0.08); transition: background 0.3s; }

        .strength-label { font-size: 11px; margin-top: 5px; }

        .error-box { background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #ff8080; margin-bottom: 18px; }

        .submit-btn {
          width: 100%; background: linear-gradient(135deg, #6c47ff, #00d4ff);
          border: none; border-radius: 12px; padding: 15px;
          font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif;
          color: #fff; cursor: pointer; margin-top: 8px;
          transition: all 0.2s; letter-spacing: 0.02em;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(108,71,255,0.35); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .left-panel {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 80px;
          position: relative; z-index: 1;
        }

        .features-list { list-style: none; display: flex; flex-direction: column; gap: 24px; margin-top: 48px; }
        .feature-item { display: flex; align-items: flex-start; gap: 16px; }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .feature-desc { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.5; }

        .footer-text { text-align: center; font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 24px; }
        .footer-text a { color: #a78bfa; text-decoration: none; font-weight: 500; }
        .footer-text a:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; border: none; }
        }
      `}</style>

      <div className="auth-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-overlay" />

        {/* Form Panel */}
        <div className="right-panel">
          <div className={`form-container ${mounted ? "visible" : ""}`}>
            <Link href="/login" className="back-link">← Back to sign in</Link>
            <h2 className="form-title">Create account</h2>
            <p className="form-subtitle">Join thousands building better habits</p>

            {error && <div className="error-box">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name</label>
                <input type="text" required placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email address</label>
                <input type="email" required placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); checkStrength(e.target.value) }} />
                {form.password && (
                  <>
                    <div className="strength-bar">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="strength-seg"
                          style={{ background: i < strength ? strengthColors[strength - 1] : undefined }} />
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strengthColors[strength - 1] }}>
                      {strengthLabels[strength - 1]}
                    </div>
                  </>
                )}
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input type="password" required placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating account..." : "Get started →"}
              </button>
            </form>

            <p className="footer-text">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Feature Panel */}
        <div className="left-panel">
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#a78bfa", letterSpacing: "0.1em", marginBottom: "16px" }}>WHY HABITFLOW?</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Everything you need<br />
              <span style={{ background: "linear-gradient(135deg, #6c47ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>to stay consistent.</span>
            </h2>
          </div>
          <ul className="features-list">
            {[
              { icon: "🔥", title: "Streak Tracking", desc: "Never break the chain. Visual streaks keep you accountable every single day." },
              { icon: "📊", title: "Progress Analytics", desc: "Beautiful charts and heatmaps show you exactly how far you've come." },
              { icon: "🔔", title: "Smart Reminders", desc: "Timely nudges that help you remember without feeling overwhelmed." },
              { icon: "🎯", title: "Goal Setting", desc: "Set targets, track milestones, and celebrate every win along the way." },
            ].map((f, i) => (
              <li key={i} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
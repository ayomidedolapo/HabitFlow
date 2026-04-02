"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

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

        /* Animated background orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 600px; height: 600px; background: #6c47ff; top: -200px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 400px; height: 400px; background: #00d4ff; bottom: -100px; right: 100px; animation-delay: -4s; }
        .orb-3 { width: 300px; height: 300px; background: #ff6b6b; top: 40%; left: 40%; animation-delay: -8s; }

        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.08); }
        }

        /* Grid overlay */
        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Left panel */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          position: relative;
          z-index: 1;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(108,71,255,0.15);
          border: 1px solid rgba(108,71,255,0.3);
          border-radius: 100px;
          padding: 8px 16px;
          margin-bottom: 48px;
          width: fit-content;
        }
        .brand-dot {
          width: 8px; height: 8px;
          background: #6c47ff;
          border-radius: 50%;
          box-shadow: 0 0 8px #6c47ff;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .brand-badge span { font-family: 'Syne', sans-serif; font-size: 13px; color: #a78bfa; letter-spacing: 0.05em; }

        .hero-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 5vw, 72px);
          font-weight: 800;
          line-height: 1.05;
          color: #ffffff;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
        }
        .hero-heading .accent {
          background: linear-gradient(135deg, #6c47ff, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 17px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 56px;
          font-weight: 300;
        }

        .stats-row {
          display: flex;
          gap: 40px;
        }
        .stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }
        .stat-label { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* Right panel */
        .right-panel {
          width: 480px;
          min-height: 100vh;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 50px;
          position: relative;
          z-index: 1;
        }

        .form-container {
          width: 100%;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .form-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 40px;
        }

        .field { margin-bottom: 20px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(108,71,255,0.6);
          background: rgba(108,71,255,0.08);
          box-shadow: 0 0 0 3px rgba(108,71,255,0.12);
        }

        .error-box {
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #ff8080;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #6c47ff, #8b5cf6);
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          color: #fff;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.02em;
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(108,71,255,0.4);
        }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span { font-size: 12px; color: rgba(255,255,255,0.25); }

        .footer-text {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
          margin-top: 28px;
        }
        .footer-text a {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
        }
        .footer-text a:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; border: none; }
        }
      `}</style>

      <div className="auth-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        {/* Left Panel */}
        <div className="left-panel">
          <div className="brand-badge">
            <div className="brand-dot" />
            <span>HABITFLOW</span>
          </div>
          <h1 className="hero-heading">
            Build habits<br />
            that <span className="accent">actually</span><br />
            stick.
          </h1>
          <p className="hero-sub">
            Track your daily rituals, visualize your streaks,
            and become the person you want to be — one day at a time.
          </p>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-num">21+</span>
              <span className="stat-label">Days to form a habit</span>
            </div>
            <div className="stat">
              <span className="stat-num">3×</span>
              <span className="stat-label">Better with tracking</span>
            </div>
            <div className="stat">
              <span className="stat-num">∞</span>
              <span className="stat-label">Potential unlocked</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className={`form-container ${mounted ? "visible" : ""}`}>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to continue your streak</p>

            {error && <div className="error-box">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span>NEW HERE?</span>
              <div className="divider-line" />
            </div>

            <p className="footer-text">
              Don&apos;t have an account?{" "}
              <Link href="/register">Create one for free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
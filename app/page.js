// app/page.js or pages/index.js
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// Dropdown component - MUST be outside HomePage
function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: align === "right" ? 0 : "auto",
          left: align === "left" ? 0 : "auto",
          minWidth: "200px",
          background: "white",
          border: "1px solid #e4e4e7",
          borderRadius: "12px",
          padding: "8px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "dropdownIn 0.2s ease"
        }}>
          {children}
        </div>
      )}
      
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// Main page component
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .landing {
          font-family: 'Inter', sans-serif;
          color: #0f0f14;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 24px;
          transition: all 0.3s ease;
          background: transparent;
        }

        .nav.scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: #0f0f14;
          text-decoration: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #52525b;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-link:hover { color: #6366f1; }

        .nav-cta {
          padding: 10px 20px;
          background: #0f0f14;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .mobile-menu-btn:hover { background: rgba(0,0,0,0.05); }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
        }

        /* Mobile dropdown menu items */
        .mobile-menu-item {
          display: block;
          padding: 12px 16px;
          color: #0f0f14;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .mobile-menu-item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: #6366f1;
        }

        .mobile-cta {
          display: block;
          margin-top: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-align: center;
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          position: relative;
          background: radial-gradient(ellipse at top, #f5f3ff 0%, #ffffff 50%, #eff6ff 100%);
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(2deg); }
        }

        .hero-inner {
          max-width: 900px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease;
        }

        .hero-title {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease 0.1s both;
        }

        .hero-title span {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(16px, 3vw, 20px);
          color: #52525b;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 40px;
          animation: fadeInUp 0.6s ease 0.2s both;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 48px;
          animation: fadeInUp 0.6s ease 0.3s both;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 16px 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }

        .btn-secondary {
          padding: 16px 32px;
          background: white;
          color: #0f0f14;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          border: 1px solid #e4e4e7;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          border-color: #6366f1;
          color: #6366f1;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          animation: fadeInUp 0.6s ease 0.4s both;
          flex-wrap: wrap;
        }

        .hero-stat { text-align: center; }

        .hero-stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #0f0f14;
          line-height: 1;
        }

        .hero-stat-label {
          font-size: 13px;
          color: #71717a;
          margin-top: 4px;
          font-weight: 500;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Features Section */
        .features {
          padding: 100px 24px;
          background: #fafafa;
        }

        .features-inner { max-width: 1200px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 64px; }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          color: #0f0f14;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 18px;
          color: #52525b;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 968px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          padding: 32px;
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .feature-title { font-size: 18px; font-weight: 700; color: #0f0f14; margin-bottom: 8px; }
        .feature-text { font-size: 14px; color: #52525b; line-height: 1.6; }

        /* How It Works */
        .how-it-works { padding: 100px 24px; background: white; }
        .how-inner { max-width: 1000px; margin: 0 auto; }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 48px;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          padding: 32px;
          background: #fafafa;
          border-radius: 16px;
          border: 1px solid #e4e4e7;
          transition: all 0.3s;
        }

        .step:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: #f5f3ff;
        }

        @media (max-width: 640px) { .step { flex-direction: column; text-align: center; } }

        .step-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-content h3 { font-size: 20px; font-weight: 700; color: #0f0f14; margin-bottom: 8px; }
        .step-content p { font-size: 15px; color: #52525b; line-height: 1.6; }

        /* CTA Section */
        .cta-section {
          padding: 100px 24px;
          background: linear-gradient(135deg, #0f0f14 0%, #1f1f28 100%);
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        }

        .cta-inner { max-width: 700px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }

        .cta-title {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .cta-subtitle { font-size: 18px; color: #a1a1aa; margin-bottom: 32px; }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: white;
          color: #0f0f14;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2); }

        /* Footer */
        .footer {
          padding: 48px 24px;
          background: #fafafa;
          border-top: 1px solid #e4e4e7;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }

        .footer-left { display: flex; align-items: center; gap: 24px; }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          color: #0f0f14;
          text-decoration: none;
        }

        .footer-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .footer-copy { font-size: 14px; color: #71717a; }

        .footer-links { display: flex; gap: 24px; }

        .footer-link {
          font-size: 14px;
          color: #52525b;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-link:hover { color: #6366f1; }

        @media (max-width: 640px) {
          .footer-inner { flex-direction: column; text-align: center; }
          .footer-left { flex-direction: column; }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🌱</div>
            HabitFlow
          </Link>
          
          {/* Desktop nav */}
          <div className="nav-links">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How it works</Link>
            <Link href="/login" className="nav-link">Sign in</Link>
            <Link href="/register" className="nav-cta">Get started</Link>
          </div>

          {/* Mobile dropdown menu */}
          <Dropdown 
            trigger={<button className="mobile-menu-btn">☰</button>}
            align="right"
          >
            <Link href="#features" className="mobile-menu-item" onClick={() => setOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="mobile-menu-item" onClick={() => setOpen(false)}>How it works</Link>
            <Link href="/login" className="mobile-menu-item" onClick={() => setOpen(false)}>Sign in</Link>
            <Link href="/register" className="mobile-cta" onClick={() => setOpen(false)}>Get started</Link>
          </Dropdown>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span>✨</span>
            New: AI-powered habit insights
          </div>
          <h1 className="hero-title">
            Build better habits,<br />
            <span>one day at a time</span>
          </h1>
          <p className="hero-subtitle">
            The simple, beautiful habit tracker that helps you stay consistent, 
            celebrate progress, and become the person you want to be.
          </p>
          <div className="hero-ctas">
            <Link href="/register" className="btn-primary">
              Start tracking free →
            </Link>
            <Link href="#how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10k+</div>
              <div className="hero-stat-label">Active users</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">500k+</div>
              <div className="hero-stat-label">Habits tracked</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">98%</div>
              <div className="hero-stat-label">Success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-inner">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything you need to succeed</h2>
            <p className="section-subtitle">
              Simple yet powerful tools designed to make habit building enjoyable and effective.
            </p>
          </div>
          <div className="features-grid">
            {[
              { icon: "🎯", title: "Smart Tracking", text: "Track any habit with customizable frequencies, reminders, and streak counters." },
              { icon: "📊", title: "Visual Progress", text: "Beautiful charts and insights that show your growth over time." },
              { icon: "🔔", title: "Smart Reminders", text: "Get notified at the right time with push, email, or SMS reminders." },
              { icon: "🏆", title: "Streak Rewards", text: "Build momentum with streaks that motivate you to keep going." },
              { icon: "📱", title: "Works Everywhere", text: "Access your habits on any device, synced in real-time." },
              { icon: "🔒", title: "Privacy First", text: "Your data is encrypted and yours alone. We never sell your information." }
            ].map((feature, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-inner">
          <div className="section-header">
            <div className="section-label">How it works</div>
            <h2 className="section-title">Start building habits in 3 steps</h2>
          </div>
          <div className="steps">
            {[
              { num: "1", title: "Create your habit", text: "Choose a habit you want to build, set your target frequency, and pick a color that inspires you." },
              { num: "2", title: "Track daily", text: "Check off your habits as you complete them. Takes less than 10 seconds a day." },
              { num: "3", title: "Watch yourself grow", text: "See your streaks build, celebrate milestones, and become the person you want to be." }
            ].map((step, i) => (
              <div className="step" key={i}>
                <div className="step-number">{step.num}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to transform your life?</h2>
          <p className="cta-subtitle">
            Join thousands of people building better habits every day. 
            It&apos;s free to get started.
          </p>
          <Link href="/register" className="cta-btn">
            Start your journey today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <Link href="/" className="footer-logo">
              <div className="footer-icon">🌱</div>
              HabitFlow
            </Link>
            <span className="footer-copy">© 2025 HabitFlow. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <Link href="/terms" className="footer-link">Terms</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
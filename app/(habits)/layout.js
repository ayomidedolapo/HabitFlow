"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

const TOAST_TIPS = [
  { icon: "🔥", title: "Stay consistent!", body: "Even 5 minutes counts. Show up every day." },
  { icon: "🌱", title: "Start tiny", body: "A habit under 2 minutes is almost impossible to skip." },
  { icon: "⚡", title: "Never miss twice", body: "Missing once is an accident. Missing twice is a pattern." },
  { icon: "🎯", title: "Habit stacking", body: "Attach new habits to ones you already do automatically." },
  { icon: "💤", title: "Rest is progress", body: "Recovery is part of every sustainable habit system." },
  { icon: "📈", title: "Track everything", body: "What gets measured gets managed. Keep logging!" },
]

const NAV = [
  {
    href: "/dashboard", label: "Overview",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    href: "/habits", label: "Habits",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
  },
  {
    href: "/stats", label: "Analytics",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  },
  {
    href: "/settings", label: "Settings",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
  },
]

const GrowthIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/>
    <path d="M12 12C9 10 6 7 7 4c2 1 4 4 5 8z" fill="rgba(255,255,255,0.35)" stroke="none"/>
    <path d="M12 12C15 9 18 6 17 3c-2 1.5-4.5 4-5 9z" fill="rgba(255,255,255,0.35)" stroke="none"/>
  </svg>
)

function SidebarContent({ session, pathname, dark }) {
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px 24px", borderBottom:"1px solid var(--cb)", marginBottom:20 }}>
        <div style={{ width:32, height:32, flexShrink:0, background:"#6366f1", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <GrowthIcon />
        </div>
        <span style={{ fontFamily:"'Fraunces', serif", fontSize:17, fontWeight:600, color:"var(--ct)", letterSpacing:"-0.02em" }}>
          HabitFlow
        </span>
      </div>

      <nav style={{ flex:1, padding:"0 10px", display:"flex", flexDirection:"column", gap:2, minWidth:0 }}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px", borderRadius:9,
              color: pathname === item.href ? (dark ? "#a5b4fc" : "#4f46e5") : "var(--cm)",
              background: pathname === item.href ? (dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.09)") : "transparent",
              fontSize:13.5, fontWeight: pathname === item.href ? 500 : 400,
              transition:"all 0.15s", textDecoration:"none",
              minWidth:0,
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding:"16px 10px 0", borderTop:"1px solid var(--cb)", marginTop:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", marginBottom:2, minWidth:0 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:500, color:"var(--ct)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {session?.user?.name || "User"}
            </div>
            <div style={{ fontSize:11, color:"var(--cm)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {session?.user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, color: dark ? "rgba(248,113,113,0.7)" : "rgba(220,38,38,0.75)", fontSize:13, cursor:"pointer", border:"none", background:"none", fontFamily:"inherit", width:"100%", transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </>
  )
}

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [dark, setDark] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const showToast = useCallback(() => {
    const tip = TOAST_TIPS[Math.floor(Math.random() * TOAST_TIPS.length)]
    setToast(tip)
    setToastVisible(true)

    const hideTimer = setTimeout(() => setToastVisible(false), 4000)
    const clearTimer = setTimeout(() => setToast(null), 4600)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      showToast()
    }, 3500)

    const i = setInterval(() => {
      showToast()
    }, 20000)

    return () => {
      clearTimeout(t)
      clearInterval(i)
    }
  }, [showToast])

  if (status === "loading") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:28, height:28, border:"2px solid var(--cb)", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const sidebarBg = dark ? "#111116" : "#ffffff"
  const topbarBg = dark ? "rgba(12,12,15,0.92)" : "rgba(247,247,249,0.92)"
  const overlayBg = dark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)"
  const toastBg = dark ? "#1a1a24" : "#ffffff"
  const toastBdr = dark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: var(--bg); }
        a { text-decoration: none; }

        .shell {
          --ct: ${dark ? "#f0f0f4" : "#0f0f14"};
          --cm: ${dark ? "rgba(240,240,244,0.38)" : "rgba(15,15,20,0.42)"};
          --cs: ${dark ? "rgba(240,240,244,0.62)" : "rgba(15,15,20,0.65)"};
          --cb: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"};
          --cc: ${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};
          --ib: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
          --iborder: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"};
          --bg: ${dark ? "#0c0c0f" : "#f7f7f9"};
          --text: ${dark ? "#f0f0f4" : "#0f0f14"};
          --text-muted: ${dark ? "rgba(240,240,244,0.38)" : "rgba(15,15,20,0.42)"};
          --text-sub: ${dark ? "rgba(240,240,244,0.62)" : "rgba(15,15,20,0.65)"};
          --card: ${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};
          --card-border: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"};
          --badge-bg: ${dark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"};
          --badge-text: ${dark ? "#a5b4fc" : "#4f46e5"};
          --accent-glow: rgba(99,102,241,0.3);
          --accent-soft: ${dark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)"};

          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--ct);
          overflow-x: hidden;
        }

        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: ${sidebarBg};
          border-right: 1px solid var(--cb);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transition: background 0.3s;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
        }

        .mob-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 60;
          background: ${overlayBg};
          backdrop-filter: blur(4px);
        }

        .mob-overlay.open { display: block; }

        .drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 70;
          width: 240px;
          background: ${sidebarBg};
          border-right: 1px solid var(--cb);
          display: none;
          flex-direction: column;
          padding: 24px 0;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }

        @media (max-width: 768px) {
          .drawer { display: flex; }
        }

        .drawer.open { transform: translateX(0); }

        .main {
          flex: 1;
          min-width: 0;
          width: 100%;
          margin-left: 220px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
        }

        @media (max-width: 768px) {
          .main { margin-left: 0; }
        }

        .topbar {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          border-bottom: 1px solid var(--cb);
          background: ${topbarBg};
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 40;
          gap: 12px;
          transition: background 0.3s;
        }

        @media (max-width: 480px) {
          .topbar { padding: 0 16px; }
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .hamburger {
          display: none;
          width: 34px;
          height: 34px;
          background: var(--cc);
          border: 1px solid var(--cb);
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--cm);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        @media (max-width: 768px) {
          .hamburger { display: flex; }
        }

        .hamburger:hover {
          color: var(--ct);
          border-color: #6366f1;
        }

        .topbar-greeting {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--ct);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .tb-btn {
          width: 34px;
          height: 34px;
          background: var(--cc);
          border: 1px solid var(--cb);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--cm);
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .tb-btn:hover {
          color: var(--ct);
          border-color: #6366f1;
        }

        .new-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #6366f1;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
        }

        .new-btn:hover {
          background: #4f46e5;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }

        @media (max-width: 400px) {
          .new-btn-label { display: none; }
        }

        .page {
          flex: 1;
          width: 100%;
          min-width: 0;
          overflow-x: hidden;
          padding: 32px 28px;
        }

        @media (max-width: 768px) {
          .page { padding: 24px 16px; }
        }

        @media (max-width: 480px) {
          .page { padding: 20px 14px; }
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: ${toastBg};
          border: 1px solid ${toastBdr};
          border-radius: 14px;
          padding: 14px 16px;
          width: min(320px, calc(100vw - 40px));
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transform: translateX(calc(100% + 28px));
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease;
          overflow: hidden;
        }

        .toast.show {
          transform: translateX(0);
          opacity: 1;
        }

        .toast-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .toast-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--ct); margin-bottom: 3px; }
        .toast-body { font-size: 12px; color: var(--cm); line-height: 1.5; }

        .toast-close {
          margin-left: auto;
          cursor: pointer;
          color: var(--cm);
          font-size: 14px;
          padding: 0 0 0 8px;
          flex-shrink: 0;
          background: none;
          border: none;
          line-height: 1;
          transition: color 0.15s;
        }

        .toast-close:hover { color: var(--ct); }

        .toast-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: #6366f1;
          border-radius: 0 0 0 14px;
          animation: shrink 4s linear forwards;
        }

        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--cb); border-radius: 99px; }
      `}</style>

      {toast && (
        <div className={`toast ${toastVisible ? "show" : ""}`}>
          <span className="toast-icon">{toast.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-body">{toast.body}</div>
          </div>
          <button className="toast-close" onClick={() => setToastVisible(false)}>✕</button>
          {toastVisible && <div className="toast-bar" key={toast.title} />}
        </div>
      )}

      <div className="shell">
        <aside className="sidebar">
          <SidebarContent session={session} pathname={pathname} dark={dark} />
        </aside>

        <div className={`mob-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />

        <aside className={`drawer ${mobileOpen ? "open" : ""}`}>
          <SidebarContent session={session} pathname={pathname} dark={dark} />
        </aside>

        <div className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setMobileOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              <span className="topbar-greeting">
                {new Date().getHours() < 12
                  ? "Good morning"
                  : new Date().getHours() < 17
                  ? "Good afternoon"
                  : "Good evening"}, {session?.user?.name?.split(" ")[0] || "there"} 👋
              </span>
            </div>

            <div className="topbar-right">
              <button className="tb-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
                {dark
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </button>

              <Link href="/habits/new" className="new-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="new-btn-label">New Habit</span>
              </Link>
            </div>
          </header>

          <div className="page">{children}</div>
        </div>
      </div>
    </>
  )
}
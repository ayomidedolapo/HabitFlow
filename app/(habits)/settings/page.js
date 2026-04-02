"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

const TABS = [
  {
    id: "profile", label: "Profile",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  {
    id: "password", label: "Password",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  },
  {
    id: "danger", label: "Danger Zone",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  },
]

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [tab, setTab] = useState("profile")
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)

  // Profile form
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  // Password form
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Password strength
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user")
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        setUser(data)
        setProfile({ name: data.name || "", email: data.email || "" })
      } catch { }
    } catch (e) { console.error(e) }
  }

  const checkStrength = (val) => {
    let s = 0
    if (val.length >= 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    setStrength(s)
  }

  const saveProfile = async () => {
    if (!profile.name || !profile.email) {
      setProfileMsg({ type: "error", text: "Name and email are required" })
      return
    }
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error })
      } else {
        setUser(data)
        await update({ name: data.name, email: data.email })
        setProfileMsg({ type: "success", text: "Profile updated successfully!" })
      }
    } catch {
      setProfileMsg({ type: "error", text: "Something went wrong." })
    } finally {
      setProfileLoading(false)
    }
  }

  const savePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "All fields are required" })
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" })
      return
    }
    if (passwords.newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters" })
      return
    }
    setPasswordLoading(true)
    setPasswordMsg(null)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error })
      } else {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" })
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setStrength(0)
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Something went wrong." })
    } finally {
      setPasswordLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    setDeleteLoading(true)
    try {
      await fetch("/api/user", { method: "DELETE" })
      signOut({ callbackUrl: "/login" })
    } catch {
      setDeleteLoading(false)
    }
  }

  const strengthColors = ["#ef4444", "#f97316", "#f59e0b", "#10b981"]
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        .sp { font-family: 'Plus Jakarta Sans', sans-serif; max-width: 760px; }

        /* ── Page enter ── */
        .sp-body {
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .sp-body.in { opacity: 1; transform: none; }

        /* ── Header ── */
        .sp-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 3.5vw, 38px);
          color: var(--ct); letter-spacing: -0.025em;
          line-height: 1.1; margin-bottom: 4px;
        }
        .sp-title em { font-style: italic; color: #6366f1; }
        .sp-sub { font-size: 13.5px; color: var(--cm); font-weight: 300; margin-bottom: 28px; }

        /* ── Profile hero ── */
        .profile-hero {
          display: flex; align-items: center; gap: 20px;
          padding: 24px; border-radius: 16px;
          background: var(--cc); border: 1px solid var(--cb);
          margin-bottom: 24px;
          position: relative; overflow: hidden;
        }
        .profile-hero::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366f1, #a78bfa, #06b6d4);
        }
        .profile-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: 22px;
          font-weight: 600; color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .profile-info { flex: 1; min-width: 0; }
        .profile-name {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 600; color: var(--ct);
          letter-spacing: -0.02em; margin-bottom: 3px;
        }
        .profile-email { font-size: 13px; color: var(--cm); margin-bottom: 8px; }
        .profile-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(99,102,241,0.09); color: #6366f1;
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 99px; padding: 3px 10px;
          font-size: 11px; font-weight: 600;
        }
        @media (max-width: 480px) {
          .profile-hero { flex-direction: column; text-align: center; }
          .profile-badge { margin: 0 auto; }
        }

        /* ── Tabs ── */
        .tabs {
          display: flex; gap: 2px; margin-bottom: 24px;
          background: var(--ib); border-radius: 12px;
          padding: 4px; border: 1px solid var(--cb);
        }
        .tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 7px; padding: 9px 14px; border-radius: 9px;
          border: none; background: transparent; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 500; color: var(--cm);
          transition: all 0.2s; white-space: nowrap;
        }
        .tab-btn:hover { color: var(--ct); }
        .tab-btn.active {
          background: var(--cc); color: var(--ct);
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .tab-btn.active svg { color: #6366f1; }
        .tab-btn.danger-tab.active { color: #ef4444; }
        .tab-btn.danger-tab.active svg { color: #ef4444; }
        @media (max-width: 500px) { .tab-btn span { display: none; } }

        /* ── Section card ── */
        .s-card {
          background: var(--cc); border: 1px solid var(--cb);
          border-radius: 16px; padding: 28px;
          display: flex; flex-direction: column; gap: 20px;
          animation: fadeUp 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (max-width: 480px) { .s-card { padding: 20px 16px; } }

        .s-card-title {
          font-family: 'Fraunces', serif;
          font-size: 18px; font-weight: 600; color: var(--ct);
          letter-spacing: -0.02em; padding-bottom: 16px;
          border-bottom: 1px solid var(--cb);
        }

        /* ── Field ── */
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 11px; font-weight: 600; color: var(--cm);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .field-input {
          width: 100%; padding: 12px 14px;
          background: var(--ib); border: 1.5px solid var(--cb);
          border-radius: 11px; font-size: 14px; color: var(--ct);
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: all 0.18s;
        }
        .field-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.09); background: var(--cc); }
        .field-input::placeholder { color: var(--cm); opacity: 0.5; }

        /* password wrap */
        .pw-wrap { position: relative; }
        .pw-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--cm); transition: color 0.15s; padding: 2px;
        }
        .pw-toggle:hover { color: var(--ct); }

        /* strength bar */
        .strength-row { display: flex; gap: 4px; margin-top: 6px; }
        .strength-seg { height: 3px; flex: 1; border-radius: 99px; background: var(--cb); transition: background 0.3s; }
        .strength-label { font-size: 11px; margin-top: 4px; font-weight: 500; }

        /* ── Message ── */
        .msg {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
        }
        .msg.success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); color: #10b981; }
        .msg.error { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); color: #ef4444; }

        /* ── Buttons ── */
        .btn-primary {
          background: #6366f1; color: #fff; border: none;
          border-radius: 11px; padding: 13px 24px;
          font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
          align-self: flex-start;
        }
        .btn-primary:hover:not(:disabled) { background: #4f46e5; box-shadow: 0 4px 16px rgba(99,102,241,0.3); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* ── Danger zone ── */
        .danger-card {
          background: rgba(239,68,68,0.04);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 14px; padding: 22px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .danger-title {
          font-family: 'Fraunces', serif;
          font-size: 16px; font-weight: 600; color: #ef4444;
          letter-spacing: -0.01em;
          display: flex; align-items: center; gap: 8px;
        }
        .danger-sub { font-size: 13px; color: var(--cm); line-height: 1.6; }
        .danger-input {
          width: 100%; padding: 11px 14px;
          background: var(--ib); border: 1.5px solid rgba(239,68,68,0.2);
          border-radius: 10px; font-size: 13.5px; color: var(--ct);
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: all 0.18s;
          font-family: monospace;
        }
        .danger-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }
        .danger-input::placeholder { color: var(--cm); opacity: 0.5; font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-danger {
          background: #ef4444; color: #fff; border: none;
          border-radius: 10px; padding: 12px 20px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 7px;
          align-self: flex-start;
        }
        .btn-danger:hover:not(:disabled) { background: #dc2626; box-shadow: 0 4px 14px rgba(239,68,68,0.3); }
        .btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Two col grid ── */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 540px) { .two-col { grid-template-columns: 1fr; } }

        /* ── Info row ── */
        .info-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid var(--cb);
          font-size: 13.5px;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: var(--cm); font-weight: 400; }
        .info-val { color: var(--ct); font-weight: 500; }

        /* shimmer */
        .shimmer { border-radius: 12px; background: var(--cb); animation: sh 1.4s ease-in-out infinite; }
        @keyframes sh { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
      `}</style>

      <div className="sp">
        <div className={`sp-body ${mounted ? "in" : ""}`}>

          {/* Header */}
          <h1 className="sp-title">Account <em>settings</em></h1>
          <p className="sp-sub">Manage your profile, security and preferences.</p>

          {/* Profile hero */}
          {user ? (
            <div className="profile-hero">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-info">
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
                <div className="profile-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                  </svg>
                  Member since {memberSince}
                </div>
              </div>
            </div>
          ) : (
            <div className="shimmer" style={{ height: 112, marginBottom: 24 }} />
          )}

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${tab === t.id ? "active" : ""} ${t.id === "danger" ? "danger-tab" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <div className="s-card">
              <div className="s-card-title">Profile information</div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">Full name</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Your full name"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Email address</label>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="your@email.com"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Account info */}
              <div style={{ background: "var(--ib)", borderRadius: 12, padding: "4px 16px", border: "1px solid var(--cb)" }}>
                <div className="info-row">
                  <span className="info-label">Account ID</span>
                  <span className="info-val" style={{ fontFamily: "monospace", fontSize: 12 }}>{user?.id?.slice(0, 16)}…</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member since</span>
                  <span className="info-val">{memberSince}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Account status</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontSize: 13, fontWeight: 500 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    Active
                  </span>
                </div>
              </div>

              {profileMsg && (
                <div className={`msg ${profileMsg.type}`}>
                  {profileMsg.type === "success"
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  }
                  {profileMsg.text}
                </div>
              )}

              <button className="btn-primary" onClick={saveProfile} disabled={profileLoading}>
                {profileLoading
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…</>
                  : <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Save changes
                  </>
                }
              </button>
            </div>
          )}

          {/* ── Password tab ── */}
          {tab === "password" && (
            <div className="s-card">
              <div className="s-card-title">Change password</div>

              <div className="field">
                <label className="field-label">Current password</label>
                <div className="pw-wrap">
                  <input
                    className="field-input"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Your current password"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                    style={{ paddingRight: 44 }}
                  />
                  <button className="pw-toggle" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}>
                    {showPasswords.current
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field-label">New password</label>
                <div className="pw-wrap">
                  <input
                    className="field-input"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={passwords.newPassword}
                    onChange={e => { setPasswords(p => ({ ...p, newPassword: e.target.value })); checkStrength(e.target.value) }}
                    style={{ paddingRight: 44 }}
                  />
                  <button className="pw-toggle" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}>
                    {showPasswords.new
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {passwords.newPassword && (
                  <>
                    <div className="strength-row">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="strength-seg" style={{ background: i < strength ? strengthColors[strength - 1] : undefined }} />
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strengthColors[strength - 1] }}>
                      {strengthLabels[strength - 1]}
                    </div>
                  </>
                )}
              </div>

              <div className="field">
                <label className="field-label">Confirm new password</label>
                <div className="pw-wrap">
                  <input
                    className="field-input"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                    style={{ paddingRight: 44 }}
                  />
                  <button className="pw-toggle" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}>
                    {showPasswords.confirm
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Passwords don't match</div>
                )}
              </div>

              {passwordMsg && (
                <div className={`msg ${passwordMsg.type}`}>
                  {passwordMsg.type === "success"
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  }
                  {passwordMsg.text}
                </div>
              )}

              <button className="btn-primary" onClick={savePassword} disabled={passwordLoading}>
                {passwordLoading
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Updating…</>
                  : <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Update password
                  </>
                }
              </button>
            </div>
          )}

          {/* ── Danger tab ── */}
          {tab === "danger" && (
            <div className="s-card">
              <div className="s-card-title">Danger zone</div>

              <div className="danger-card">
                <div className="danger-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Delete account
                </div>
                <div className="danger-sub">
                  This will permanently delete your account, all your habits, logs, streaks and data. This action <strong style={{ color: "var(--ct)" }}>cannot be undone</strong>.
                </div>
                <div style={{ fontSize: 12, color: "var(--cm)", fontWeight: 500 }}>
                  Type <code style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "1px 6px", borderRadius: 4 }}>DELETE</code> to confirm
                </div>
                <input
                  className="danger-input"
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                />
                <button
                  className="btn-danger"
                  disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  onClick={deleteAccount}
                >
                  {deleteLoading
                    ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Deleting…</>
                    : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Delete my account</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
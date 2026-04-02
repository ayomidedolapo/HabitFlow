// app/stats/page.js or pages/stats.js
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data - replace with your API calls
  const habitData = {
    totalHabits: 8,
    activeStreaks: 3,
    longestStreak: 24,
    completionRate: 78,
    weeklyData: [65, 80, 75, 90, 85, 70, 88],
    monthlyData: [72, 68, 75, 80, 85, 78, 82, 88, 75, 80, 85, 90],
    categoryBreakdown: [
      { name: "Health", count: 3, color: "#22c55e", percentage: 40 },
      { name: "Productivity", count: 2, color: "#6366f1", percentage: 30 },
      { name: "Mindfulness", count: 2, color: "#f59e0b", percentage: 20 },
      { name: "Learning", count: 1, color: "#ec4899", percentage: 10 }
    ],
    heatmapData: generateHeatmapData(),
    topStreaks: [
      { name: "Morning Meditation", streak: 24, icon: "🧘" },
      { name: "Read 30 mins", streak: 18, icon: "📚" },
      { name: "Drink Water", streak: 15, icon: "💧" }
    ],
    recentMilestones: [
      { habit: "Exercise", milestone: "7 day streak", date: "2 days ago", icon: "🏃" },
      { habit: "Journal", milestone: "30 entries", date: "5 days ago", icon: "📝" }
    ]
  }

  function generateHeatmapData() {
    const days = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0
      days.push({
        date: date.toISOString().split('T')[0],
        intensity,
        day: date.getDay()
      })
    }
    return days
  }

  const getIntensityColor = (intensity) => {
    const colors = [
      "rgba(99, 102, 241, 0.05)",
      "rgba(99, 102, 241, 0.2)",
      "rgba(99, 102, 241, 0.4)",
      "rgba(99, 102, 241, 0.7)",
      "rgba(99, 102, 241, 1)"
    ]
    return colors[intensity] || colors[0]
  }

  const chartData = timeRange === "week" ? habitData.weeklyData : habitData.monthlyData
  const chartLabels = timeRange === "week" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const maxValue = Math.max(...chartData)

  return (
    <div className="stats-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .stats-page {
          font-family: 'Inter', sans-serif;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
          padding: 24px;
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .stats-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .stats-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .time-selector {
          display: flex;
          gap: 8px;
          background: var(--surface);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid var(--border);
        }

        .time-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-btn.active {
          background: var(--accent);
          color: white;
        }

        /* Overview Cards */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        @media (max-width: 968px) {
          .overview-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .overview-grid { grid-template-columns: 1fr; }
        }

        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .stat-card:nth-child(2) .stat-icon { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.15); }
        .stat-card:nth-child(3) .stat-icon { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.15); }
        .stat-card:nth-child(4) .stat-icon { background: rgba(236, 72, 153, 0.1); border-color: rgba(236, 72, 153, 0.15); }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-change.positive { color: #22c55e; }
        .stat-change.negative { color: #ef4444; }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 968px) {
          .main-grid { grid-template-columns: 1fr; }
        }

        /* Chart Card */
        .chart-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        .card-subtitle {
          font-size: 13px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Bar Chart */
        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          height: 200px;
          padding-bottom: 32px;
          position: relative;
        }

        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar {
          width: 100%;
          max-width: 40px;
          background: linear-gradient(180deg, var(--accent), #8b5cf6);
          border-radius: 6px 6px 0 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          opacity: ${mounted ? 1 : 0};
          transform: scaleY(${mounted ? 1 : 0});
          transform-origin: bottom;
        }

        .bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.05);
        }

        .bar-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
        }

        .bar-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .bar:hover .bar-value {
          opacity: 1;
        }

        /* Heatmap */
        .heatmap-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .heatmap {
          display: grid;
          grid-template-columns: repeat(53, 1fr);
          gap: 3px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        @media (max-width: 768px) {
          .heatmap { grid-template-columns: repeat(26, 1fr); }
        }

        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: 2px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .heatmap-cell:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 2px var(--accent);
          z-index: 10;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 12px;
          color: var(--muted);
        }

        .legend-cells {
          display: flex;
          gap: 3px;
        }

        .legend-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        /* Side Cards */
        .side-cards {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .side-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .streak-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .streak-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .streak-item:hover {
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateX(4px);
        }

        .streak-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .streak-info {
          flex: 1;
        }

        .streak-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .streak-count {
          font-size: 12px;
          color: var(--muted);
        }

        .streak-badge {
          padding: 6px 12px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
        }

        /* Category Breakdown */
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .category-info {
          flex: 1;
        }

        .category-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }

        .category-bar {
          height: 6px;
          background: var(--surface);
          border-radius: 3px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        /* Milestones */
        .milestone-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 12px;
        }

        .milestone-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: white;
          border: 1px solid var(--border);
        }

        .milestone-content h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 2px;
        }

        .milestone-content p {
          font-size: 12px;
          color: var(--muted);
        }

        /* Bottom Grid */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .bottom-grid { grid-template-columns: 1fr; }
        }

        /* Insights Card */
        .insights-card {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          border-radius: 16px;
          padding: 24px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .insights-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .insights-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          position: relative;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 8px;
          backdrop-filter: blur(10px);
        }

        .insight-icon {
          font-size: 20px;
        }

        .insight-text {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.95;
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card, .chart-card, .side-card, .heatmap-card {
          animation: slideIn 0.5s ease forwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.15s; }
        .stat-card:nth-child(3) { animation-delay: 0.2s; }
        .stat-card:nth-child(4) { animation-delay: 0.25s; }
      `}</style>

      <div className="stats-container">
        {/* Header */}
        <div className="stats-header">
          <div>
            <h1 className="stats-title">Analytics</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
              Track your progress and build better habits
            </p>
          </div>
          <div className="time-selector">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{habitData.completionRate}%</div>
            <div className="stat-change positive">
              ↑ 12% from last {timeRange}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">Active Streaks</div>
            <div className="stat-value">{habitData.activeStreaks}</div>
            <div className="stat-change positive">
              ↑ 2 new this week
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-label">Longest Streak</div>
            <div className="stat-value">{habitData.longestStreak}</div>
            <div className="stat-change positive">
              Personal best!
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-label">Total Completions</div>
            <div className="stat-value">342</div>
            <div className="stat-change positive">
              ↑ 28 this week
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="heatmap-card">
          <div className="card-header">
            <div>
              <div className="card-title">Activity Heatmap</div>
              <div className="card-subtitle">365 days of habit building</div>
            </div>
          </div>
          <div className="heatmap">
            {habitData.heatmapData.map((day, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{
                  backgroundColor: getIntensityColor(day.intensity),
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.3s ease ${i * 0.001}s`
                }}
                title={`${day.date}: ${day.intensity} activities`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-cells">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="legend-cell"
                  style={{ backgroundColor: getIntensityColor(i) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Chart */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <div className="card-title">Completion Trend</div>
                <div className="card-subtitle">Daily habit completion rate</div>
              </div>
            </div>
            <div className="bar-chart">
              {chartData.map((value, i) => (
                <div key={i} className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      height: `${(value / maxValue) * 100}%`,
                      transitionDelay: `${i * 0.05}s`
                    }}
                  >
                    <div className="bar-value">{value}%</div>
                  </div>
                  <div className="bar-label">{chartLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Cards */}
          <div className="side-cards">
            {/* Top Streaks */}
            <div className="side-card">
              <div className="card-header">
                <div className="card-title">🔥 Top Streaks</div>
              </div>
              <div className="streak-list">
                {habitData.topStreaks.map((streak, i) => (
                  <div key={i} className="streak-item">
                    <div className="streak-icon">{streak.icon}</div>
                    <div className="streak-info">
                      <div className="streak-name">{streak.name}</div>
                      <div className="streak-count">{streak.streak} days</div>
                    </div>
                    <div className="streak-badge">{streak.streak}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="side-card">
              <div className="card-header">
                <div className="card-title">📂 Categories</div>
              </div>
              <div className="category-list">
                {habitData.categoryBreakdown.map((cat, i) => (
                  <div key={i} className="category-item">
                    <div
                      className="category-dot"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="category-info">
                      <div className="category-name">
                        <span>{cat.name}</span>
                        <span>{cat.count} habits</span>
                      </div>
                      <div className="category-bar">
                        <div
                          className="category-fill"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="bottom-grid">
          {/* Recent Milestones */}
          <div className="side-card">
            <div className="card-header">
              <div className="card-title">🎉 Recent Milestones</div>
            </div>
            <div className="milestone-list">
              {habitData.recentMilestones.map((milestone, i) => (
                <div key={i} className="milestone-item">
                  <div className="milestone-icon">{milestone.icon}</div>
                  <div className="milestone-content">
                    <h4>{milestone.habit} — {milestone.milestone}</h4>
                    <p>{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="insights-card">
            <div className="insights-title">💡 Smart Insights</div>
            <div className="insight-item">
              <span className="insight-icon">🌅</span>
              <p className="insight-text">
                You&apso;re most productive on Tuesday mornings. Consider scheduling your hardest habits then.
              </p>
            </div>
            <div className="insight-item">
              <span className="insight-icon">⚡</span>
              <p className="insight-text">
                Your meditation habit has improved sleep quality by 23% based on your check-in patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
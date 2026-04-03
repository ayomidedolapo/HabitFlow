// app/stats/page.js
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    setMounted(true)
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/stats?range=${timeRange}`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Generate heatmap from daily data
  const generateHeatmapData = (dailyData) => {
    if (!dailyData) return []
    
    return dailyData.map(day => ({
      date: day.date,
      intensity: day.rate === 0 ? 0 : 
                 day.rate < 25 ? 1 : 
                 day.rate < 50 ? 2 : 
                 day.rate < 75 ? 3 : 4
    }))
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

  const getChangeIndicator = (value) => {
    if (value > 0) return { icon: "↑", class: "positive", text: `+${value}%` }
    if (value < 0) return { icon: "↓", class: "negative", text: `${value}%` }
    return { icon: "→", class: "neutral", text: "0%" }
  }

  const heatmapData = data ? generateHeatmapData(data.dailyData) : []
  const chartData = data?.dailyData || []
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.rate)) : 100

  // Format date for chart labels
  const formatLabel = (dateStr) => {
    const date = new Date(dateStr)
    if (timeRange === "7") return date.toLocaleDateString('en-US', { weekday: 'short' })
    if (timeRange === "30") return date.getDate()
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  if (loading && !data) {
    return (
      <div className="stats-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stats-page">
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchStats} className="retry-btn">Try again</button>
        </div>
      </div>
    )
  }

  const overview = data?.overview || {}
  const change = getChangeIndicator(overview.weeklyGrowth || 0)

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

        /* Loading & Error States */
        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          color: var(--muted);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .error-state span { font-size: 48px; }
        .error-state p { color: var(--text); font-size: 16px; }

        .retry-btn {
          padding: 12px 24px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
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

        .stat-card:hover::before { opacity: 1; }

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
        .stat-change.neutral { color: var(--muted); }

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
          gap: 8px;
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
          min-width: 0;
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
          min-height: 4px;
        }

        .bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.05);
        }

        .bar-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .bar-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 700;
          color: var(--text);
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .bar:hover .bar-value { opacity: 1; }

        /* Empty State */
        .empty-chart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--muted);
          font-size: 14px;
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
          grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
          gap: 3px;
          max-height: 120px;
          overflow: hidden;
        }

        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: 2px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .heatmap-cell:hover {
          transform: scale(1.3);
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
          background: ${props => props.color}15;
          border: 1px solid ${props => props.color}30;
        }

        .streak-info {
          flex: 1;
          min-width: 0;
        }

        .streak-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          flex-shrink: 0;
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 32px;
          color: var(--muted);
          font-size: 14px;
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

        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }
      `}</style>

      <div className="stats-container">
        {/* Header */}
        <div className="stats-header">
          <div>
            <h1 className="stats-title">Analytics</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
              {overview.totalCompletions ? `${overview.totalCompletions} completions in the last ${timeRange} days` : 'Track your progress and build better habits'}
            </p>
          </div>
          <div className="time-selector">
            {[
              { value: "7", label: "Week" },
              { value: "30", label: "Month" },
              { value: "90", label: "Quarter" }
            ].map((range) => (
              <button
                key={range.value}
                className={`time-btn ${timeRange === range.value ? 'active' : ''}`}
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{overview.overallCompletionRate || 0}%</div>
            <div className={`stat-change ${change.class}`}>
              {change.icon} {change.text} from last period
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">Active Habits</div>
            <div className="stat-value">{overview.activeHabits || 0}</div>
            <div className="stat-change positive">
              of {overview.totalHabits || 0} total
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-label">Best Streak</div>
            <div className="stat-value">{overview.bestStreak || 0}</div>
            <div className="stat-change positive">
              Current: {overview.currentStreak || 0} days
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-label">Total Completions</div>
            <div className="stat-value">{overview.totalCompletions || 0}</div>
            <div className="stat-change positive">
              Keep it up!
            </div>
          </div>
        </div>

        {/* Heatmap */}
        {heatmapData.length > 0 && (
          <div className="heatmap-card">
            <div className="card-header">
              <div>
                <div className="card-title">Activity Heatmap</div>
                <div className="card-subtitle">Last {timeRange} days of habit building</div>
              </div>
            </div>
            <div className="heatmap">
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: getIntensityColor(day.intensity),
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 0.3s ease ${i * 0.002}s`
                  }}
                  title={`${day.date}: ${day.intensity > 0 ? (day.intensity * 25) + '%' : 'No'} completion`}
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
        )}

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
            {chartData.length > 0 ? (
              <div className="bar-chart">
                {chartData.map((day, i) => (
                  <div key={i} className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        height: `${maxValue > 0 ? (day.rate / maxValue) * 100 : 0}%`,
                        transitionDelay: `${i * 0.02}s`
                      }}
                    >
                      <div className="bar-value">{day.rate}%</div>
                    </div>
                    <div className="bar-label">{formatLabel(day.date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-chart">No data available for this period</div>
            )}
          </div>

          {/* Side Cards */}
          <div className="side-cards">
            {/* Top Streaks */}
            <div className="side-card">
              <div className="card-header">
                <div className="card-title">🔥 Top Streaks</div>
              </div>
              {data?.streakData?.length > 0 ? (
                <div className="streak-list">
                  {data.streakData.slice(0, 5).map((streak, i) => (
                    <div key={i} className="streak-item">
                      <div 
                        className="streak-icon" 
                        style={{ 
                          background: `${streak.color}15`,
                          borderColor: `${streak.color}30`
                        }}
                      >
                        🔥
                      </div>
                      <div className="streak-info">
                        <div className="streak-name">{streak.title}</div>
                        <div className="streak-count">{streak.totalCompletions} total completions</div>
                      </div>
                      <div className="streak-badge">{streak.streak}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No active streaks yet. Start tracking!</div>
              )}
            </div>

            {/* Categories */}
            <div className="side-card">
              <div className="card-header">
                <div className="card-title">📂 Categories</div>
              </div>
              {data?.categoryStats?.length > 0 ? (
                <div className="category-list">
                  {data.categoryStats.map((cat, i) => (
                    <div key={i} className="category-item">
                      <div
                        className="category-dot"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
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
                              width: `${Math.max((cat.completions / (overview.totalCompletions || 1)) * 100, 5)}%`,
                              backgroundColor: cat.color || '#6366f1'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No categories yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="bottom-grid">
          {/* Habits List */}
          <div className="side-card">
            <div className="card-header">
              <div className="card-title">📋 Your Habits</div>
            </div>
            {data?.habits?.length > 0 ? (
              <div className="streak-list">
                {data.habits.map((habit, i) => (
                  <Link 
                    href={`/habits/${habit.id}/edit`} 
                    key={i} 
                    className="streak-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div 
                      className="streak-icon"
                      style={{ 
                        background: `${habit.color}15`,
                        borderColor: `${habit.color}30`
                      }}
                    >
                      ✓
                    </div>
                    <div className="streak-info">
                      <div className="streak-name">{habit.title}</div>
                      <div className="streak-count">{habit.completions} completions</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">No habits yet. Create your first one!</div>
            )}
          </div>

          {/* AI Insights */}
          <div className="insights-card">
            <div className="insights-title">💡 Smart Insights</div>
            <div className="insight-item">
              <span className="insight-icon">🌅</span>
              <p className="insight-text">
                {overview.overallCompletionRate > 70 
                  ? "You're crushing it! Your completion rate is above average." 
                  : "Start small. Even 1% improvement daily compounds to 37x yearly growth."}
              </p>
            </div>
            <div className="insight-item">
              <span className="insight-icon">⚡</span>
              <p className="insight-text">
                {overview.bestStreak > 7 
                  ? `Your ${overview.bestStreak}-day streak shows you can build lasting habits!`
                  : "Consistency is key. Try not to miss twice in a row."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
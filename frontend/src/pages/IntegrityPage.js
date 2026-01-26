import React, { useState, useEffect } from 'react';
import './IntegrityPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function IntegrityPage() {
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [domainFilter, setDomainFilter] = useState('all');
  // const [agentType, setAgentType] = useState('platform');
  // const [agentId, setAgentId] = useState('codec');
  // const [vertical, setVertical] = useState('codec');
  const agentType = 'platform';
  const agentId = 'codec';
  const vertical = 'codec';

  const domains = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'ai', label: 'AI/ML', icon: '🤖' },
    { id: 'iot', label: 'IoT', icon: '🏠' },
    { id: 'infra', label: 'Infrastructure', icon: '☁️' },
    { id: 'commerce', label: 'Commerce', icon: '📦' },
  ];

  useEffect(() => {
    fetchIntegrity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIntegrity = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_URL}/api/v1/promise/integrity/${agentType}/${agentId}?vertical=${vertical}&refresh=${refresh}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load integrity score');
      }

      setIntegrity(data.integrity);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.95) return '#FFD700'; // Gold
    if (score >= 0.85) return '#4CAF50'; // Green
    if (score >= 0.70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getScoreBadge = (score) => {
    if (score >= 0.95) return 'Excellent';
    if (score >= 0.85) return 'Good';
    if (score >= 0.70) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = (trend) => {
    if (!trend || trend === 0) return '→';
    if (trend > 0) return '↑';
    return '↓';
  };

  const getTrendColor = (trend) => {
    if (!trend || trend === 0) return '#999';
    if (trend > 0) return '#4CAF50';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="integrity-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading integrity score...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="integrity-page">
        <div className="error-box">
          <h3>Error Loading Integrity</h3>
          <p>{error}</p>
          <button onClick={() => fetchIntegrity(true)}>Retry</button>
        </div>
      </div>
    );
  }

  if (!integrity) {
    return (
      <div className="integrity-page">
        <div className="empty-state">
          <p>No integrity data available</p>
        </div>
      </div>
    );
  }

  const scorePercentage = (integrity.overall_score * 100).toFixed(1);

  return (
    <div className="integrity-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <h1>Integrity Score</h1>
          <button
            className="refresh-button"
            onClick={() => fetchIntegrity(true)}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
        <p className="agent-info">
          {integrity.agent.type}:{integrity.agent.id}
          {integrity.vertical && <span className="vertical-badge">{integrity.vertical}</span>}
        </p>

        {/* Domain Filter */}
        <div className="domain-filter">
          {domains.map((domain) => (
            <button
              key={domain.id}
              className={`domain-filter-btn ${domainFilter === domain.id ? 'active' : ''}`}
              onClick={() => setDomainFilter(domain.id)}
            >
              <span className="domain-icon">{domain.icon}</span>
              <span className="domain-label">{domain.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Score Card */}
      <div className="score-card">
        <div className="score-circle" style={{ borderColor: getScoreColor(integrity.overall_score) }}>
          <div className="score-value">{scorePercentage}%</div>
          <div
            className="score-badge"
            style={{ backgroundColor: getScoreColor(integrity.overall_score) }}
          >
            {getScoreBadge(integrity.overall_score)}
          </div>
        </div>

        <div className="score-details">
          <div className="score-stat">
            <span className="stat-label">Total Promises</span>
            <span className="stat-value">{integrity.total_promises}</span>
          </div>
          <div className="score-stat">
            <span className="stat-label">Kept</span>
            <span className="stat-value kept">{integrity.kept_count}</span>
          </div>
          <div className="score-stat">
            <span className="stat-label">Broken</span>
            <span className="stat-value broken">{integrity.broken_count}</span>
          </div>
          <div className="score-stat">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{integrity.pending_count}</span>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="trends-section">
        <h2>Trends</h2>
        <div className="trends-grid">
          <div className="trend-card">
            <div className="trend-label">30 Day Trend</div>
            <div
              className="trend-value"
              style={{ color: getTrendColor(integrity.trend_30d) }}
            >
              {getTrendIcon(integrity.trend_30d)}{' '}
              {integrity.trend_30d !== null
                ? (integrity.trend_30d * 100).toFixed(1) + '%'
                : 'N/A'}
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-label">90 Day Trend</div>
            <div
              className="trend-value"
              style={{ color: getTrendColor(integrity.trend_90d) }}
            >
              {getTrendIcon(integrity.trend_90d)}{' '}
              {integrity.trend_90d !== null
                ? (integrity.trend_90d * 100).toFixed(1) + '%'
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="metrics-section">
        <h2>Advanced Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Trust Capital</div>
            <div className="metric-value">{integrity.trust_capital.toFixed(2)}</div>
            <div className="metric-note">Weighted by stakes</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Recovery Rate</div>
            <div className="metric-value">
              {(integrity.recovery_rate * 100).toFixed(1)}%
            </div>
            <div className="metric-note">When broken, how often recovered</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="page-footer">
        <p className="computed-at">
          Last computed: {new Date(integrity.computed_at).toLocaleString()}
        </p>
        <p className="explainer">
          Your integrity score reflects your promise-keeping history. Higher scores indicate
          better reliability and trustworthiness.
        </p>
      </div>
    </div>
  );
}

export default IntegrityPage;

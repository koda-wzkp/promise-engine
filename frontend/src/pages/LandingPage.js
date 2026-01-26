import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import CloudBackground from '../components/CloudBackground';
import Scanlines from '../components/Scanlines';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState('ai');

  const handleBetaSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/v1/beta/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to sign up');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useCases = {
    ai: {
      title: 'AI/ML AUDITING',
      icon: '🤖',
      description: 'Wrap any model in verifiable promises',
      points: [
        'Track hallucinations, policy violations, drift',
        'Compliance for EU AI Act, SOC2, ISO 42001',
        'Prove your AI does what you claim',
        'Generate training signal from failures',
      ],
    },
    iot: {
      title: 'IoT & SMART HOME',
      icon: '🏠',
      description: 'Monitor every device\'s promises',
      points: [
        '"Did my lock actually lock at 11pm?"',
        'Home Assistant integration',
        'Building management at scale',
        'Track device reliability over time',
      ],
    },
    infra: {
      title: 'INFRASTRUCTURE & SLAs',
      icon: '☁️',
      description: 'Verify uptime, latency, performance claims',
      points: [
        'Audit SLAs automatically',
        'Alert before breaches become incidents',
        '99.9% uptime, proven',
        'Track vendor accountability',
      ],
    },
    supply: {
      title: 'SUPPLY CHAIN & COMMERCE',
      icon: '📦',
      description: 'Track fulfillment promises',
      points: [
        'Verify delivery timelines',
        'Audit sustainability claims',
        'CODEC: Coffee subscriptions (our first vertical)',
        'End-to-end shipment tracking',
      ],
    },
    land: {
      title: 'LAND STEWARDSHIP',
      icon: '🌱',
      description: 'Promises TO the land (coming soon)',
      points: [
        'promise.land: Track restoration commitments',
        'Verify regeneration claims',
        'Route reparations directly',
        'Indigenous data sovereignty',
      ],
    },
  };

  return (
    <div className="landing-page">
      <CloudBackground />
      <Scanlines />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">Universal Auditing Infrastructure</div>
        <h1 className="hero-title">
          <span className="title-line">Audit Everything</span>
          <span className="title-line">That Makes Promises</span>
        </h1>
        <p className="hero-subtitle">Trust, but verify. Automatically.</p>
        <p className="hero-description">
          AI models. Smart devices. Cloud infrastructure. Supply chains. Everything makes promises.
          Nothing proves it keeps them. <strong>We fix that.</strong>
        </p>

        <div className="hero-actions">
          <Link to="/integrity" className="cta-button primary">
            View Demo
          </Link>
          <a href="#beta-signup" className="cta-button secondary">
            Start Auditing
          </a>
        </div>
      </div>

      {/* Problem Section */}
      <div className="problem-section">
        <h2>You Can't Audit What You Can't Measure</h2>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon">🤖</div>
            <p>AI models promise not to hallucinate.</p>
            <p className="problem-question">Do they?</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">🏠</div>
            <p>Smart locks promise to secure your home.</p>
            <p className="problem-question">Do they?</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">☁️</div>
            <p>Cloud services promise 99.9% uptime.</p>
            <p className="problem-question">Do they?</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">📦</div>
            <p>Supply chains promise on-time delivery.</p>
            <p className="problem-question">Do they?</p>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="solution-section">
        <h2>The Accountability Layer</h2>
        <p className="solution-intro">
          Promise Engine turns implicit promises into verifiable commitments. Every claim becomes
          auditable. Every failure becomes a training signal.
        </p>

        <div className="solution-steps">
          <div className="solution-step">
            <div className="step-number">1</div>
            <h3>DEFINE</h3>
            <p>Promise schemas for your domain</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="solution-step">
            <div className="step-number">2</div>
            <h3>MONITOR</h3>
            <p>Every event flows through Promise Engine</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="solution-step">
            <div className="step-number">3</div>
            <h3>VERIFY</h3>
            <p>Automatic verification against schema</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="solution-step">
            <div className="step-number">4</div>
            <h3>IMPROVE</h3>
            <p>Integrity scores, training signal</p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="use-cases-section">
        <h2>Built for Every Domain</h2>
        <div className="use-case-tabs">
          {Object.entries(useCases).map(([key, useCase]) => (
            <button
              key={key}
              className={`use-case-tab ${activeUseCase === key ? 'active' : ''}`}
              onClick={() => setActiveUseCase(key)}
            >
              <span className="tab-icon">{useCase.icon}</span>
              <span className="tab-label">{useCase.title}</span>
            </button>
          ))}
        </div>

        <div className="use-case-content">
          <div className="use-case-header">
            <span className="use-case-icon">{useCases[activeUseCase].icon}</span>
            <div>
              <h3>{useCases[activeUseCase].title}</h3>
              <p>{useCases[activeUseCase].description}</p>
            </div>
          </div>
          <ul className="use-case-points">
            {useCases[activeUseCase].points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">1M+</div>
          <div className="stat-label">Promises Monitored</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">10k+</div>
          <div className="stat-label">Verification Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">98.5%</div>
          <div className="stat-label">Avg Integrity Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Domains Supported</div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section" id="pricing">
        <h2>Pricing</h2>
        <p className="pricing-intro">Start free. Scale as you grow. Enterprise when you're serious.</p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-tier">STARTER</div>
            <div className="pricing-price">Free</div>
            <ul className="pricing-features">
              <li>✓ 10k events/month</li>
              <li>✓ 5 promise schemas</li>
              <li>✓ Basic dashboard</li>
              <li>✓ Community support</li>
              <li>✓ API access</li>
            </ul>
            <a href="#beta-signup" className="pricing-cta secondary">
              Start Here
            </a>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">MOST POPULAR</div>
            <div className="pricing-tier">SCALE</div>
            <div className="pricing-price">
              $500<span>/month</span>
            </div>
            <ul className="pricing-features">
              <li>✓ 500k events/month</li>
              <li>✓ Unlimited schemas</li>
              <li>✓ Custom verification logic</li>
              <li>✓ Slack/webhook alerts</li>
              <li>✓ Email support</li>
              <li>✓ Training data access</li>
            </ul>
            <a href="#beta-signup" className="pricing-cta primary">
              For Growing Teams
            </a>
          </div>

          <div className="pricing-card">
            <div className="pricing-tier">ENTERPRISE</div>
            <div className="pricing-price">Custom</div>
            <ul className="pricing-features">
              <li>✓ Unlimited events</li>
              <li>✓ On-prem deployment</li>
              <li>✓ Compliance reports</li>
              <li>✓ Dedicated support</li>
              <li>✓ SLA guarantees</li>
              <li>✓ White-glove onboarding</li>
            </ul>
            <a href="mailto:sales@pleco.dev" className="pricing-cta secondary">
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Beta Section */}
      <div className="beta-section" id="beta-signup">
        <h2>Join the Beta</h2>
        <p>
          Be among the first to audit AI, IoT, and infrastructure with Promise Engine.
        </p>

        {!submitted ? (
          <form className="beta-form" onSubmit={handleBetaSignup}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="beta-input"
            />
            <button type="submit" disabled={loading} className="beta-submit">
              {loading ? 'Submitting...' : 'Get Early Access'}
            </button>
          </form>
        ) : (
          <div className="beta-success">
            <p>✓ Thanks! We'll notify you when beta opens.</p>
          </div>
        )}

        {error && <div className="beta-error">{error}</div>}
      </div>

      <footer className="landing-footer">
        <p className="footer-tagline">
          "The world runs on promises. We make them auditable."
        </p>
        <div className="footer-links">
          <Link to="/integrity">Demo Dashboard</Link>
          <a href="https://github.com/koda-wzkp/promise-engine" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://discord.gg/pleco" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          <a href="https://twitter.com/pleco_dev" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
        </div>
        <p className="footer-credit">
          Built by <a href="https://pleco.dev" target="_blank" rel="noopener noreferrer">Pleco</a>.
          Powered by <a href="https://en.wikipedia.org/wiki/Promise_theory" target="_blank" rel="noopener noreferrer">Promise Theory</a>.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;

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
      problem: [
        '47% of enterprises made major decisions on hallucinated content (Deloitte 2024)',
        'Legal AI tools hallucinate 17-34% of the time (2025 peer review)',
        'Workers spend 4.3 hours/week fact-checking AI (Microsoft 2025)',
      ],
      solution: [
        'Track hallucinations, policy violations, drift',
        'Compliance for EU AI Act, SOC2, ISO 42001',
        'Generate training signal from failures',
      ],
    },
    iot: {
      title: 'IoT & SMART HOME',
      icon: '🏠',
      description: 'Monitor every device\'s promises',
      problem: [
        'Smart devices promise security they can\'t guarantee',
        'Firmware updates silently change behavior',
        'No independent verification of device claims',
      ],
      solution: [
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
      problem: [
        '99.9% uptime still means 8.7 hours down per year',
        'SLA credits compensate <1% of actual business losses',
        'October 2025 AWS outage: 7+ hours, healthcare systems offline',
        'Downtime costs $9,000/minute for large enterprises',
      ],
      solution: [
        'Independent SLA verification (not vendor-calculated)',
        'Real-time breach detection, not monthly reports',
        'Track the gap between promised and delivered',
      ],
    },
    supply: {
      title: 'SUPPLY CHAIN & COMMERCE',
      icon: '📦',
      description: 'Track fulfillment promises',
      problem: [
        'Expected OTD: 93.5%. Actual same-day: 80%. 1-2 day: 76%.',
        'Only 6% of companies have full supply chain visibility',
        '8% of annual revenue lost to supply chain disruptions (2024)',
      ],
      solution: [
        'Verify delivery timelines against commitments',
        'Audit sustainability claims',
        'End-to-end shipment tracking',
        'CODEC: Coffee subscriptions (our first vertical)',
      ],
    },
    land: {
      title: 'LAND STEWARDSHIP',
      icon: '🌱',
      description: 'Promises TO the land (coming soon)',
      problem: [
        'promise.land: Track restoration commitments',
        'Verify regeneration claims',
        'Route reparations directly',
      ],
      solution: [
        'Indigenous data sovereignty',
        'Carbon credit verification',
        'Land back accountability',
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
            View Live Demo
          </Link>
          <a href="#beta-signup" className="cta-button secondary">
            Start Free Trial
          </a>
        </div>
        <p className="hero-demo-note">
          Live demo showing CODEC coffee subscription validation. Espresso roast + French press grind = broken promise caught automatically.
        </p>
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

          <div className="use-case-section">
            <h4>The Problem:</h4>
            <ul className="use-case-points problem">
              {useCases[activeUseCase].problem.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="use-case-section">
            <h4>Promise Engine:</h4>
            <ul className="use-case-points solution">
              {useCases[activeUseCase].solution.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Industry Stats Section - The Accountability Gap */}
      <div className="stats-section">
        <h2 className="stats-title">The Accountability Gap</h2>
        <p className="stats-subtitle">Nobody verifies these promises. Until now.</p>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">17-34%</div>
            <div className="stat-label">AI hallucination rate (legal domain)</div>
            <div className="stat-source">Peer-reviewed study, 2025</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">47%</div>
            <div className="stat-label">Enterprise users who made decisions on hallucinated content</div>
            <div className="stat-source">Deloitte, 2024</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">4.3 hrs</div>
            <div className="stat-label">Hours/week workers spend fact-checking AI</div>
            <div className="stat-source">Microsoft, 2025</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$9,000</div>
            <div className="stat-label">Cost per minute of enterprise downtime</div>
            <div className="stat-source">Forbes, 2025</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">&lt;1%</div>
            <div className="stat-label">Cloud SLA credits that cover actual losses</div>
            <div className="stat-source">Uptime Institute, 2022</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">6%</div>
            <div className="stat-label">Supply chains with full end-to-end visibility</div>
            <div className="stat-source">GEODIS Survey</div>
          </div>
        </div>
      </div>

      {/* Why Promise Theory Section */}
      <div className="promise-theory-section">
        <h2>Why Promise Theory in 2026?</h2>
        <div className="theory-intro">
          <p className="theory-lead">
            Promise Theory was proposed by physicist Mark Burgess in 2004 while building CFEngine,
            configuration management software now running in the largest datacenters globally.
          </p>
        </div>

        <div className="theory-grid">
          <div className="theory-card">
            <h3>🧠 AI Systems Can't Be Commanded</h3>
            <p>
              LLMs generate probabilistic outputs, not guaranteed truth. You can't force them not to hallucinate.
              But you <em>can</em> verify whether they kept their implicit promises (accuracy, consistency, policy compliance).
            </p>
          </div>

          <div className="theory-card">
            <h3>🌐 Distributed Systems Are Autonomous</h3>
            <p>
              Your cloud provider, your IoT devices, your supply chain partners are all autonomous agents.
              SLAs are promises, not guarantees. The question isn't "did they promise?" but "did they keep it?"
            </p>
          </div>

          <div className="theory-card">
            <h3>⚖️ Regulatory Shift</h3>
            <p>
              The EU AI Act (enforcement begins August 2026) requires post-market monitoring, audit trails,
              and continuous compliance verification. Penalties up to €35M or 7% global revenue.
            </p>
          </div>
        </div>

        <div className="theory-adoption">
          <h3>Industry Adoption</h3>
          <ul>
            <li><strong>CFEngine:</strong> 2,700+ companies using promise-based configuration</li>
            <li><strong>Cisco ACI:</strong> Network infrastructure built on promise semantics</li>
            <li><strong>Kubernetes:</strong> Promise-compatible desired-state architecture</li>
            <li><strong>Microservices/SOA:</strong> Promise-oriented service design (Amazon, Netflix)</li>
          </ul>
        </div>

        <blockquote className="theory-quote">
          "Promises are more mathematically primitive than obligations. An agent cannot be forced to keep a promise—it can only declare its intent. This makes promises a more honest model of how distributed systems actually behave."
          <cite>— Mark Burgess, Promise Theory originator</cite>
        </blockquote>
      </div>

      {/* Value Proposition - Intelligent Auditing */}
      <div className="value-prop-section">
        <h2>Don't Audit Everything. Audit What Matters.</h2>
        <div className="value-prop-content">
          <div className="value-prop-card before">
            <h3>❌ Traditional Approach</h3>
            <ul>
              <li>Quarterly audits "just in case"</li>
              <li>$200K-$800K per comprehensive audit</li>
              <li>3-6 month lag time to results</li>
              <li>Most findings: "everything looks fine"</li>
              <li>Real issues discovered too late</li>
            </ul>
            <p className="value-prop-cost">Cost: <strong>$800K-$3.2M/year</strong></p>
          </div>

          <div className="value-prop-arrow">→</div>

          <div className="value-prop-card after">
            <h3>✅ Promise Engine Approach</h3>
            <ul>
              <li>Continuous monitoring 24/7/365</li>
              <li>Real-time anomaly detection</li>
              <li>Automatic verification of every event</li>
              <li>Deep audit <em>only when issues detected</em></li>
              <li>Evidence-ready audit trails</li>
            </ul>
            <p className="value-prop-cost">Cost: <strong>$149-$499/month + targeted deep audits</strong></p>
          </div>
        </div>

        <div className="value-prop-roi">
          <p>
            <strong>ROI Example:</strong> If Promise Engine prevents just <em>one</em> unnecessary $200K audit
            per year, it pays for itself <strong>400× over</strong>. When it does detect an issue requiring
            deep forensics, you have evidence-ready data to make that $200K audit laser-focused.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section" id="pricing">
        <h2>Pricing</h2>
        <p className="pricing-intro">14-Day Free Trial. No credit card required.</p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-tier">SOLO</div>
            <div className="pricing-price">
              $49<span>/month</span>
            </div>
            <p className="pricing-description">For indie hackers and small projects</p>
            <ul className="pricing-features">
              <li>✓ 100k events/month</li>
              <li>✓ 5 promise schemas</li>
              <li>✓ Basic dashboard</li>
              <li>✓ Email alerts</li>
            </ul>
            <a href="#beta-signup" className="pricing-cta secondary">
              Start Free Trial
            </a>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">MOST POPULAR</div>
            <div className="pricing-tier">TEAM</div>
            <div className="pricing-price">
              $149<span>/month</span>
            </div>
            <p className="pricing-description">For startups and growing teams</p>
            <ul className="pricing-features">
              <li>✓ 1M events/month</li>
              <li>✓ 25 promise schemas</li>
              <li>✓ Custom verification logic</li>
              <li>✓ Slack/webhook alerts</li>
              <li>✓ API access</li>
              <li>✓ Priority email support</li>
            </ul>
            <a href="#beta-signup" className="pricing-cta primary">
              Start Free Trial
            </a>
          </div>

          <div className="pricing-card">
            <div className="pricing-tier">SCALE</div>
            <div className="pricing-price">
              $499<span>/month</span>
            </div>
            <p className="pricing-description">For serious infrastructure</p>
            <ul className="pricing-features">
              <li>✓ 5M events/month</li>
              <li>✓ Unlimited schemas</li>
              <li>✓ Training data export</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Multiple environments</li>
              <li>✓ Dedicated support</li>
            </ul>
            <a href="#beta-signup" className="pricing-cta secondary">
              Start Free Trial
            </a>
          </div>

          <div className="pricing-card">
            <div className="pricing-tier">ENTERPRISE</div>
            <div className="pricing-price">Custom</div>
            <p className="pricing-description">Intelligent audit triage at scale</p>
            <ul className="pricing-features">
              <li>✓ Unlimited events</li>
              <li>✓ On-prem deployment option</li>
              <li>✓ Compliance reports (SOC2, EU AI Act)</li>
              <li>✓ SLA guarantee</li>
              <li>✓ Custom integrations</li>
              <li>✓ Evidence-ready audit trails</li>
              <li>✓ Deep audit coordination when issues detected</li>
            </ul>
            <a href="mailto:sales@pleco.dev" className="pricing-cta secondary">
              Contact Sales
            </a>
          </div>
        </div>

        <div className="pricing-cta-section">
          <a href="#beta-signup" className="pricing-main-cta">
            Start your 14-day free trial →
          </a>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="testimonial-section">
        <p className="testimonial-tagline">Trusted by teams shipping AI responsibly</p>
        <div className="testimonial-placeholder">
          <p className="testimonial-note">(Customer logos and testimonials coming soon)</p>
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

        <div className="footer-theory">
          <h3>Built on Promise Theory</h3>
          <p>
            Promise Theory (Burgess, 2004) models systems as autonomous agents that declare intentions
            rather than accepting commands. This framework—proven in CFEngine, adopted by Cisco and
            Kubernetes—provides the foundation for Promise Engine's verification architecture.
          </p>
          <p>
            Unlike monitoring tools that check if things are "up," Promise Engine checks if things
            are <em>keeping their promises</em>.
          </p>
          <a href="https://en.wikipedia.org/wiki/Promise_theory" target="_blank" rel="noopener noreferrer" className="footer-learn-more">
            Learn more about Promise Theory →
          </a>
        </div>

        <div className="footer-links">
          <Link to="/integrity">Demo Dashboard</Link>
          <a href="#docs">Docs</a>
          <a href="https://github.com/koda-wzkp/promise-engine" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://discord.gg/pleco" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          <a href="https://twitter.com/pleco_dev" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a href="mailto:hello@pleco.dev">Contact</a>
        </div>
        <p className="footer-credit">
          Built by <a href="https://pleco.dev" target="_blank" rel="noopener noreferrer">Pleco</a>
        </p>
        <p className="footer-location">Portland, OR 🌲</p>
      </footer>
    </div>
  );
}

export default LandingPage;

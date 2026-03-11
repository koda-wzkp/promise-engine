import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudBackground from '../components/CloudBackground';
import Scanlines from '../components/Scanlines';
import { api } from '../utils/api';
import './LandingPage.css';

const USE_CASES = [
  {
    id: 'civic',
    icon: '\u2696\uFE0F',
    label: 'Civic / Legislation',
    title: 'Hold institutions accountable',
    description: 'Decompose legislation into a network of specific promises. Track who promised what to whom, and whether those promises are being kept.',
    points: [
      'Map every commitment in a bill to a structured promise',
      'Track progress against statutory deadlines',
      'Surface off-track promise chains and accountability gaps',
      'Give citizens tools to verify institutional claims',
    ],
  },
  {
    id: 'ai',
    icon: '\uD83E\uDD16',
    label: 'AI / ML',
    title: 'Audit autonomous systems',
    description: 'Every AI model makes implicit promises about accuracy, safety, and alignment. Promise Engine makes those promises explicit and auditable.',
    points: [
      'Hallucination rate tracking against declared thresholds',
      'Policy adherence verification',
      'Drift detection with integrity scoring',
      'Continuous compliance reporting',
    ],
  },
  {
    id: 'infra',
    icon: '\u2601\uFE0F',
    label: 'Infrastructure',
    title: 'SLA verification at scale',
    description: 'Cloud services, APIs, and infrastructure all make uptime and latency promises. We verify them continuously.',
    points: [
      'Uptime SLA verification against commitments',
      'Latency promise tracking',
      'Incident impact on promise integrity',
      'Multi-provider promise comparison',
    ],
  },
  {
    id: 'supply',
    icon: '\uD83D\uDCE6',
    label: 'Supply Chain',
    title: 'Trust through transparency',
    description: 'Every link in a supply chain is a promise. From origin to delivery, verify that commitments are kept.',
    points: [
      'Provenance verification',
      'Quality commitment tracking',
      'Delivery promise auditing',
      'Ethical sourcing validation',
    ],
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeUseCase, setActiveUseCase] = useState('civic');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.beta.signup(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentUseCase = USE_CASES.find((uc) => uc.id === activeUseCase);

  return (
    <div className="landing-page">
      <CloudBackground />
      <Scanlines />

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-badge">Universal Auditing Infrastructure</div>
        <h1 className="hero-title">
          <span className="title-line">Promise Engine</span>
        </h1>
        <p className="hero-subtitle">The world runs on promises. We make them auditable.</p>
        <p className="hero-description">
          Governments pass laws. Utilities pledge clean energy. AI models claim accuracy.
          <strong> Promise Engine</strong> decomposes these commitments into structured promise
          networks — then tracks whether they're actually being kept.
        </p>
        <div className="hero-actions">
          <button className="cta-button primary" onClick={() => navigate('/hb2021')}>
            See the Live Demo
          </button>
          <button className="cta-button secondary" onClick={() => {
            document.querySelector('.beta-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Join the Beta
          </button>
        </div>
        <p className="hero-demo-note">
          Live now: tracking 20 promises in Oregon's clean electricity law
        </p>
      </section>

      {/* ── LIVE DEMO FEATURE ── */}
      <section className="problem-section">
        <h2>See It In Action</h2>
        <div className="problem-grid">
          <div className="problem-card" onClick={() => navigate('/hb2021')} style={{ cursor: 'pointer' }}>
            <div className="problem-icon">\u2696\uFE0F</div>
            <p className="problem-question">Oregon HB 2021</p>
            <p>
              Is Oregon's 100% clean electricity law working? We mapped all 20 promises,
              11 agents, and 6 domains. PacifiCorp is off track. The equity promises have
              no verification mechanism. The oversight system caught the problem.
            </p>
            <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#87CEEB' }}>
              Explore the dashboard &rarr;
            </p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">\uD83D\uDD0D</div>
            <p className="problem-question">Who promised what?</p>
            <p>
              Legislation, corporate pledges, and AI systems all make commitments. But promises
              get buried in dense text, split across agencies, and lost in complexity.
              Promise Engine makes them legible.
            </p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">\uD83D\uDCC9</div>
            <p className="problem-question">Are they keeping them?</p>
            <p>
              Continuous verification against structured schemas. Integrity scoring that builds
              trust capital over time — or erodes it when promises fall behind. No more "trust us."
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="solution-section">
        <h2>How It Works</h2>
        <p className="solution-intro">
          Promise Engine applies Promise Theory — developed by Mark Burgess in 2004 — to
          decompose any system of commitments into auditable promise networks.
        </p>
        <div className="solution-steps">
          <div className="solution-step">
            <div className="step-number">1</div>
            <h3>Map</h3>
            <p>Identify every agent, promise, and dependency in a system</p>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="solution-step">
            <div className="step-number">2</div>
            <h3>Schema</h3>
            <p>Define verification criteria with JSON Schema validation</p>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="solution-step">
            <div className="step-number">3</div>
            <h3>Verify</h3>
            <p>Continuously check promises against real-world data</p>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="solution-step">
            <div className="step-number">4</div>
            <h3>Score</h3>
            <p>Build integrity profiles with trust capital over time</p>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="use-cases-section">
        <h2>Promise Networks Everywhere</h2>
        <div className="use-case-tabs">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              className={`use-case-tab ${activeUseCase === uc.id ? 'active' : ''}`}
              onClick={() => setActiveUseCase(uc.id)}
            >
              <span className="tab-icon">{uc.icon}</span>
              <span className="tab-label">{uc.label}</span>
            </button>
          ))}
        </div>
        {currentUseCase && (
          <div className="use-case-content">
            <div className="use-case-header">
              <span className="use-case-icon">{currentUseCase.icon}</span>
              <div>
                <h3>{currentUseCase.title}</h3>
                <p>{currentUseCase.description}</p>
              </div>
            </div>
            <div className="use-case-section">
              <h4>What We Track</h4>
              <ul className="use-case-points">
                {currentUseCase.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            {currentUseCase.id === 'civic' && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="cta-button primary" onClick={() => navigate('/hb2021')}>
                  See the HB 2021 Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <h2 className="stats-title">HB 2021 by the Numbers</h2>
        <p className="stats-subtitle">Oregon's 100% clean electricity law, decomposed</p>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">20</div>
            <div className="stat-label">Specific promises mapped</div>
            <div className="stat-source">Across emissions, planning, equity, affordability, and tribal rights</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">11</div>
            <div className="stat-label">Agents tracked</div>
            <div className="stat-source">Utilities, regulators, communities, and oversight bodies</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">4</div>
            <div className="stat-label">Promises off track</div>
            <div className="stat-source">PacifiCorp's entire emissions chain is off track</div>
          </div>
        </div>
      </section>

      {/* ── PROMISE THEORY ── */}
      <section className="promise-theory-section">
        <h2>Built on Promise Theory</h2>
        <div className="theory-intro">
          <p className="theory-lead">
            Promise Theory, developed by Mark Burgess in 2004, models the world as a network
            of autonomous agents making voluntary commitments. It's the foundation of
            CFEngine, and now it's the foundation of institutional accountability.
          </p>
        </div>
        <div className="theory-grid">
          <div className="theory-card">
            <h3>Agents</h3>
            <p>
              Autonomous entities that make promises. A utility company, a government agency,
              an AI model, an IoT device — <em>anything that can make a commitment</em>.
            </p>
          </div>
          <div className="theory-card">
            <h3>Promises</h3>
            <p>
              Voluntary commitments from one agent to another. Not imposed obligations —
              <em>declared intentions</em>. A promise is only meaningful if it can be verified.
            </p>
          </div>
          <div className="theory-card">
            <h3>Verification</h3>
            <p>
              The receiver of a promise determines whether it's been kept. Trust isn't
              declared — <em>it's computed from observed behavior over time</em>.
            </p>
          </div>
        </div>
        <blockquote className="theory-quote">
          "A promise is a declaration of intent whose purpose is to increase
          the confidence of the recipient."
          <cite>— Mark Burgess, Promise Theory: Principles and Applications (2004)</cite>
        </blockquote>
      </section>

      {/* ── VALUE PROPOSITION ── */}
      <section className="value-prop-section">
        <h2>Before & After Promise Engine</h2>
        <div className="value-prop-content">
          <div className="value-prop-card before">
            <h3>Without Promise Engine</h3>
            <ul>
              <li>Promises buried in 50-page bills and corporate filings</li>
              <li>No structured way to track who owes what to whom</li>
              <li>Accountability requires hiring lawyers and reading regulatory orders</li>
              <li>Off-track promises discovered years too late</li>
              <li>Equity commitments with no verification mechanism</li>
            </ul>
          </div>
          <div className="value-prop-arrow">&rarr;</div>
          <div className="value-prop-card after">
            <h3>With Promise Engine</h3>
            <ul>
              <li>Every promise mapped, scored, and continuously verified</li>
              <li>Structured promise networks with clear agent relationships</li>
              <li>Public dashboards anyone can understand</li>
              <li>Real-time alerts when promises degrade</li>
              <li>Accountability gaps surfaced automatically</li>
            </ul>
          </div>
        </div>
        <div className="value-prop-roi">
          <p>
            <strong>PacifiCorp's off-track promise chain</strong> — canceled renewables, rejected
            Clean Energy Plan, coal-to-gas conversions — was surfaced by mapping 20 statutory
            promises into a verifiable network. <em>The data was always public. The structure
            wasn't.</em>
          </p>
        </div>
      </section>

      {/* ── BETA SIGNUP ── */}
      <section className="beta-section">
        <h2>Join the Beta</h2>
        <p>
          Promise Engine is live with its first civic pilot. We're opening access to teams
          building accountability into their systems.
        </p>
        {success ? (
          <div className="beta-success">
            Thanks! We'll notify you when beta opens.
          </div>
        ) : (
          <>
            <form className="beta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="beta-input"
                disabled={loading}
              />
              <button type="submit" className="beta-submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Beta'}
              </button>
            </form>
            {error && <div className="beta-error">{error}</div>}
          </>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <p className="footer-tagline">The world runs on promises. We make them auditable.</p>
        <div className="footer-theory">
          <h3>Why Promise Theory?</h3>
          <p>
            Traditional compliance is top-down: impose rules, check boxes, hope for the best.
            Promise Theory inverts this. Every agent <em>voluntarily declares</em> what it will
            do — and trust is computed from whether it actually does it.
          </p>
          <p>
            This isn't theoretical. CFEngine used Promise Theory to manage millions of servers.
            Promise Engine applies the same framework to institutions, legislation, and
            autonomous systems.
          </p>
        </div>
        <div className="footer-links">
          <a href="/hb2021">HB 2021 Dashboard</a>
          <a href="/login">Sign In</a>
          <a href="/register">Register</a>
        </div>
        <p className="footer-credit">
          Built by <a href="https://pleco.dev">Pleco</a> &middot; Portland, OR
        </p>
        <p className="footer-location">
          Based on Promise Theory (Burgess, 2004) &middot; Not affiliated with any government agency or utility
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

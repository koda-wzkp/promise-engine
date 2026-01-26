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

  return (
    <div className="landing-page">
      <CloudBackground />
      <Scanlines />

      <div className="hero-section">
        <h1 className="hero-title">
          <span className="title-line">Promise Engine</span>
        </h1>
        <p className="hero-subtitle">
          Training AI through promise-keeping verification
        </p>
        <p className="hero-description">
          Like AlphaZero learned chess through self-play, Promise Engine learns integrity through
          automatic verification. Every promise kept or broken generates labeled training data.
        </p>

        <div className="hero-actions">
          <Link to="/integrity" className="cta-button primary">
            View Demo Dashboard
          </Link>
          <Link to="/promises" className="cta-button secondary">
            Browse Promise History
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">✓</div>
          <h3>Automatic Verification</h3>
          <p>
            Rule-based verification generates training signals without human annotation. Every kept
            or broken promise becomes labeled data.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Integrity Scores</h3>
          <p>
            Portable trust metrics computed from promise-keeping history. Your integrity score is
            YOUR asset, not extracted by platforms.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔌</div>
          <h3>API-First</h3>
          <p>
            RESTful API for verification, logging, and scoring. Any system can verify promises over
            HTTP and contribute to the training corpus.
          </p>
        </div>
      </div>

      <div className="beta-section">
        <h2>Join the Beta</h2>
        <p>
          Be among the first to integrate Promise-Oriented Development into your platform.
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
              {loading ? 'Submitting...' : 'Sign Up'}
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
        <p>
          Built with <a href="https://claude.com/claude-code" target="_blank" rel="noopener noreferrer">Claude Code</a>
        </p>
        <p>
          <Link to="/integrity">Integrity Dashboard</Link> ·{' '}
          <Link to="/promises">Promise History</Link>
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;

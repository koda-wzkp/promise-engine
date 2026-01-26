import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudBackground from '../components/CloudBackground';
import Scanlines from '../components/Scanlines';
import { api } from '../utils/api';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="landing-page">
      <CloudBackground />
      <Scanlines />

      <div className="landing-content">
        <header className="landing-header">
          <h1 className="landing-title">Promise Engine</h1>
          <p className="landing-tagline">
            A platform for transparent creative collaboration
          </p>
        </header>

        <main className="landing-main">
          {success ? (
            <div className="success-message">
              <p>Thanks! We'll notify you when beta opens.</p>
            </div>
          ) : (
            <form className="beta-signup-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="email-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Beta'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          )}
        </main>

        <footer className="landing-footer">
          <p>Built with promise theory</p>
          <div className="auth-links">
            <button onClick={() => navigate('/login')}>Sign In</button>
            <span>·</span>
            <button onClick={() => navigate('/register')}>Register</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

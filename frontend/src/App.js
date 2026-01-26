import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import IntegrityPage from './pages/IntegrityPage';
import PromisesPage from './pages/PromisesPage';

function App() {
  // Auth state (for future use)
  // const [token, setToken] = useState(localStorage.getItem('token'));
  // const [user, setUser] = useState(
  //   JSON.parse(localStorage.getItem('user') || 'null')
  // );

  const handleLogin = (authData) => {
    // setToken(authData.token);
    // setUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  // const handleLogout = () => {
  //   setToken(null);
  //   setUser(null);
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  // };

  return (
    <div className="App">
      {/* Navigation - Show on dashboard pages */}
      {(window.location.pathname.startsWith('/integrity') ||
        window.location.pathname.startsWith('/promises')) && (
        <nav className="app-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Promise Engine
            </Link>
            <div className="nav-links">
              <Link
                to="/integrity"
                className={
                  window.location.pathname === '/integrity'
                    ? 'nav-link active'
                    : 'nav-link'
                }
              >
                Integrity
              </Link>
              <Link
                to="/promises"
                className={
                  window.location.pathname === '/promises'
                    ? 'nav-link active'
                    : 'nav-link'
                }
              >
                Promises
              </Link>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        {/* Dashboard routes (accessible without auth for demo) */}
        <Route path="/integrity" element={<IntegrityPage />} />
        <Route path="/promises" element={<PromisesPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

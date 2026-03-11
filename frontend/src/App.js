import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import IntegrityPage from './pages/IntegrityPage';
import PromisesPage from './pages/PromisesPage';
import LivingRoomWines from './pages/LivingRoomWines';
import HB2021Dashboard from './pages/HB2021Dashboard';

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
        window.location.pathname.startsWith('/promises') ||
        window.location.pathname.startsWith('/hb2021')) && (
        <nav className="app-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <span className="logo-main">Promise Engine</span>
              <span className="logo-subtitle">Universal Auditing</span>
            </Link>
            <div className="nav-links">
              <Link
                to="/hb2021"
                className={
                  window.location.pathname === '/hb2021'
                    ? 'nav-link active'
                    : 'nav-link'
                }
              >
                HB 2021
              </Link>
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

        {/* CODEC Demos */}
        <Route path="/demo/livingroom-wines" element={<LivingRoomWines />} />

        {/* HB 2021 Civic Pilot */}
        <Route path="/hb2021" element={<HB2021Dashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

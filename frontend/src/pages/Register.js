import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
      <h1>Register</h1>
      <p>Coming soon...</p>
      <Link to="/" style={{ color: '#333', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Back to Home
      </Link>
    </div>
  );
}

export default Register;

import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function LoginPage() {
  const { doLogin } = useData();
  const [id, setId]       = useState('');
  const [pass, setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (doLogin(id, pass)) {
      setError(false);
    } else {
      setError(true);
      setPass('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-screen">
      <div className="login-wrap">
        <div className="login-header">
          <h1>Sign In</h1>
          <div className="sub">Login to Dashboard Panel</div>
        </div>
        <div className="login-divider" />

        <div className="lfield">
          <label>USERNAME / EMAIL ID</label>
          <input
            type="text"
            placeholder="Enter your ID"
            autoComplete="username"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('login-pass-input').focus(); }}
            className={error ? 'error' : ''}
          />
        </div>

        <div className="lfield">
          <label>PASSWORD</label>
          <div className="pass-wrap">
            <input
              id="login-pass-input"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={handleKeyDown}
              className={error ? 'error' : ''}
            />
            <button className="pass-eye" onClick={() => setShowPass((v) => !v)}>👁</button>
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          🔒 Sign In Securely &nbsp;›
        </button>

        {error && (
          <div className="login-err">⚠ Invalid credentials. Please check and try again.</div>
        )}
      </div>
    </div>
  );
}

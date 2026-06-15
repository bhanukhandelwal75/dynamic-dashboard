// import { useState } from 'react';
// import { useData } from '../context/DataContext';

// export default function LoginPage() {
//   const { doLogin } = useData();
//   const [id, setId]       = useState('');
//   const [pass, setPass]   = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError] = useState(false);

//   const handleLogin = () => {
//     if (doLogin(id, pass)) {
//       setError(false);
//     } else {
//       setError(true);
//       setPass('');
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') handleLogin();
//   };

//   return (
//     <div className="login-screen">
//       <div className="login-wrap">
//         <div className="login-header">
//           <h1>Sign In</h1>
//           <div className="sub">Login to Dashboard Panel</div>
//         </div>
//         <div className="login-divider" />

//         <div className="lfield">
//           <label>USERNAME / EMAIL ID</label>
//           <input
//             type="text"
//             placeholder="Enter your ID"
//             autoComplete="username"
//             value={id}
//             onChange={(e) => setId(e.target.value)}
//             onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('login-pass-input').focus(); }}
//             className={error ? 'error' : ''}
//           />
//         </div>

//         <div className="lfield">
//           <label>PASSWORD</label>
//           <div className="pass-wrap">
//             <input
//               id="login-pass-input"
//               type={showPass ? 'text' : 'password'}
//               placeholder="Enter Password"
//               autoComplete="current-password"
//               value={pass}
//               onChange={(e) => setPass(e.target.value)}
//               onKeyDown={handleKeyDown}
//               className={error ? 'error' : ''}
//             />
//             <button className="pass-eye" onClick={() => setShowPass((v) => !v)}>👁</button>
//           </div>
//         </div>

//         <button className="login-btn" onClick={handleLogin}>
//           🔒 Sign In Securely &nbsp;›
//         </button>

//         {error && (
//           <div className="login-err">⚠ Invalid credentials. Please check and try again.</div>
//         )}
//       </div>
//     </div>
//   );
// }






// import { useState } from 'react';
// import { useData } from '../context/DataContext';

// export default function LoginPage() {
//   const { doLogin } = useData();
//   const [id, setId] = useState('');
//   const [pass, setPass] = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError] = useState(false);

//   const handleLogin = () => {
//     // Basic validation to trigger the "Email is Compulsory" text
//     if (!id.trim()) {
//       setError(true);
//       return;
//     }

//     if (doLogin(id, pass)) {
//       setError(false);
//     } else {
//       setError(true);
//       setPass('');
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') handleLogin();
//   };

//   return (
//     <div className="login-screen">
//       <div className="login-logo">
//         <img src="/paytm-icon.png" alt="Paytm"/>
//       </div>
//       <div className="login-card">
        
//         <div className="login-header">
//           <h1>Sign In</h1>
//           <div className="sub-text">Login to Dashboard Panel</div>
//         </div>

//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Enter Email"
//             autoComplete="username"
//             value={id}
//             onChange={(e) => { setId(e.target.value); setError(false); }}
//             onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('login-pass-input').focus(); }}
//             className={error ? 'input-error' : ''}
//           />
//           {error && <div className="error-text">Email is Compulsory.</div>}
//         </div>

//         <div className="input-group">
//           <div className="pass-wrap">
//             <input
//               id="login-pass-input"
//               type={showPass ? 'text' : 'password'}
//               placeholder="Enter Password"
//               autoComplete="current-password"
//               value={pass}
//               onChange={(e) => setPass(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button 
//               className="pass-eye" 
//               onClick={() => setShowPass((v) => !v)}
//               title={showPass ? "Hide Password" : "Show Password"}
//             >
//               <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
//                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="action-row">
//           <button className="sign-in-btn" onClick={handleLogin}>
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}>
//                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
//             </svg>
//             Sign In Securely 
//             <span style={{marginLeft: '4px'}}>›</span>
//           </button>
//         </div>

//         <div className="login-footer">
//           By signing in, you agree to our <span className="link-text">privacy policy</span> and <span className="link-text">terms of use</span>.
//         </div>
//       </div>
//     </div>
//   );s
// } 







// import { useState } from 'react';
// import { useData } from '../context/DataContext';

// export default function LoginPage() {
//   const { doLogin, verifyOTP } = useData();

//   // Step 1 state
//   const [id,       setId]       = useState('');
//   const [pass,     setPass]     = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const [error,    setError]    = useState('');
//   const [loading,  setLoading]  = useState(false);

//   // Step 2 (OTP) state
//   const [otpStep,    setOtpStep]    = useState(false);
//   const [otp,        setOtp]        = useState('');
//   const [otpError,   setOtpError]   = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpEmail,   setOtpEmail]   = useState('');
//   const [otpUserId,  setOtpUserId]  = useState('');
//   const [otpUser,    setOtpUser]    = useState(null);
//   const [resendMsg,  setResendMsg]  = useState('');
//   const [countdown,  setCountdown]  = useState(0);

//   // Countdown timer for resend
//   const startCountdown = () => {
//     setCountdown(30);
//     const interval = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) { clearInterval(interval); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // Step 1 — Password check + send OTP
//   const handleLogin = async () => {
//     if (!id.trim()) { setError('Email is required.'); return; }
//     if (!pass.trim()) { setError('Password is required.'); return; }
//     setLoading(true);
//     setError('');
//     const result = await doLogin(id, pass);
//     setLoading(false);
//     if (!result.success) {
//       setError(result.error || 'Invalid credentials');
//       setPass('');
//       return;
//     }
//     // Success — go to OTP step
//     setOtpEmail(result.email);
//     setOtpUserId(result.userId);
//     setOtpUser(result.user);
//     setOtpStep(true);
//     startCountdown();
//   };

//   // Step 2 — Verify OTP
//   const handleVerifyOTP = async () => {
//     if (otp.trim().length !== 6) { setOtpError('Please enter the 6-digit OTP.'); return; }
//     setOtpLoading(true);
//     setOtpError('');
//     const result = await verifyOTP(otpEmail, otp, otpUserId, otpUser);
//     setOtpLoading(false);
//     if (!result.success) {
//       setOtpError(result.error || 'Invalid OTP');
//       setOtp('');
//     }
//   };

//   // Resend OTP
//   const handleResend = async () => {
//     if (countdown > 0) return;
//     setResendMsg('');
//     setOtpError('');
//     try {
//       const res = await fetch('http://localhost:3001/api/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: otpEmail }),
//       });
//       const data = await res.json();
//       if (data.success) { setResendMsg('OTP resent successfully!'); startCountdown(); }
//       else setOtpError(data.error || 'Failed to resend OTP');
//     } catch { setOtpError('Server error. Is proxy server running?'); }
//   };

//   // ── OTP Screen ──────────────────────────────────────────────────
//   if (otpStep) {
//     return (
//       <div className="login-screen">
//         <div className="login-logo">
//           <img src="/paytm-icon.png" alt="Paytm" />
//         </div>
//         <div className="login-card">
//           <div className="login-header">
//             <h1>OTP Verification</h1>
//             <div className="sub-text">Enter the code sent to your email</div>
//           </div>

//           {/* Email hint */}
//           <div style={{
//             background: 'var(--blue-light)', borderRadius: 8,
//             padding: '10px 14px', marginBottom: 20, fontSize: 13,
//             color: 'var(--blue)', fontWeight: 500,
//           }}>
//             📧 OTP sent to <strong>{otpEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</strong>
//           </div>

//           {/* OTP input */}
//           <div className="input-group">
//             <input
//               type="text"
//               placeholder="Enter 6-digit OTP"
//               maxLength={6}
//               value={otp}
//               onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
//               onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOTP(); }}
//               style={{ letterSpacing: 8, fontSize: 20, fontWeight: 700, textAlign: 'center' }}
//               className={otpError ? 'input-error' : ''}
//               autoFocus
//             />
//             {otpError && <div className="error-text">{otpError}</div>}
//             {resendMsg && <div style={{ color: 'var(--green)', fontSize: 12, marginTop: 6 }}>{resendMsg}</div>}
//           </div>

//           {/* Verify button */}
//           <div className="action-row">
//             <button
//               className="sign-in-btn"
//               onClick={handleVerifyOTP}
//               disabled={otpLoading}
//               style={{ opacity: otpLoading ? 0.7 : 1 }}
//             >
//               {otpLoading ? 'Verifying...' : 'Verify OTP ›'}
//             </button>
//           </div>

//           {/* Resend + Back */}
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
//             <button
//               onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); setPass(''); }}
//               style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text3)', fontFamily: 'Inter' }}
//             >
//               ← Back to login
//             </button>
//             <button
//               onClick={handleResend}
//               disabled={countdown > 0}
//               style={{
//                 background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
//                 fontSize: 13, color: countdown > 0 ? 'var(--text3)' : 'var(--blue)',
//                 fontFamily: 'Inter', fontWeight: 600,
//               }}
//             >
//               {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
//             </button>
//           </div>

//           {/* OTP expiry note */}
//           <div className="login-footer" style={{ marginTop: 16 }}>
//             OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Login Screen ────────────────────────────────────────────────
//   return (
//     <div className="login-screen">
//       <div className="login-logo">
//         <img src="/paytm-icon.png" alt="Paytm" />
//       </div>
//       <div className="login-card">
//         <div className="login-header">
//           <h1>Sign In</h1>
//           <div className="sub-text">Login to Dashboard Panel</div>
//         </div>

//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Enter Email / Username"
//             autoComplete="username"
//             value={id}
//             onChange={(e) => { setId(e.target.value); setError(''); }}
//             onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('login-pass-input').focus(); }}
//             className={error ? 'input-error' : ''}
//           />
//           {error && <div className="error-text">{error}</div>}
//         </div>

//         <div className="input-group">
//           <div className="pass-wrap">
//             <input
//               id="login-pass-input"
//               type={showPass ? 'text' : 'password'}
//               placeholder="Enter Password"
//               autoComplete="current-password"
//               value={pass}
//               onChange={(e) => setPass(e.target.value)}
//               onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
//             />
//             <button
//               className="pass-eye"
//               onClick={() => setShowPass(v => !v)}
//               title={showPass ? 'Hide Password' : 'Show Password'}
//             >
//               <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
//                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="action-row">
//           <button
//             className="sign-in-btn"
//             onClick={handleLogin}
//             disabled={loading}
//             style={{ opacity: loading ? 0.7 : 1 }}
//           >
//             {loading ? (
//               'Sending OTP...'
//             ) : (
//               <>
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
//                   <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
//                 </svg>
//                 Sign In Securely ›
//               </>
//             )}
//           </button>
//         </div>

//         <div className="login-footer">
//           By signing in, you agree to our{' '}
//           <span className="link-text">privacy policy</span> and{' '}
//           <span className="link-text">terms of use</span>.
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function LoginPage() {
  const { doLogin, verifyOTP } = useData();

  // Step 1 state
  const [id,       setId]       = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Step 2 (OTP) state
  const [otpStep,    setOtpStep]    = useState(false);
  const [otp,        setOtp]        = useState('');
  const [otpError,   setOtpError]   = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpEmail,   setOtpEmail]   = useState('');
  const [otpUserId,  setOtpUserId]  = useState('');
  const [otpUser,    setOtpUser]    = useState(null);
  const [resendMsg,  setResendMsg]  = useState('');
  const [countdown,  setCountdown]  = useState(0);

  // Countdown timer for resend
  const startCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1 — Password check + send OTP
  const handleLogin = async () => {
    const trimmedId = id.trim();
    const trimmedPass = pass.trim();

    if (!trimmedId) { setError('Email or Username is required.'); return; }
    if (!trimmedPass) { setError('Password is required.'); return; }
    
    setLoading(true);
    setError('');
    
    // Call doLogin from DataContext
    const result = await doLogin(trimmedId, trimmedPass);
    
    setLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setPass('');
      return;
    }

    if (result.requiresOTP) {
      setOtpEmail(result.email);
      setOtpUserId(result.userId || trimmedId.toLowerCase());
      setOtpUser(result.user);
      setOtpStep(true);
      startCountdown();
    } else {
      // Agar admin hai (requiresOTP: false), toh context ne user set kar diya hai
      // React automatically aapko dashboard par le jayega
      console.log("Admin logged in directly!");
    }
    // Success — prepare for OTP Step
    setOtpEmail(result.email);
    setOtpUserId(result.userId || trimmedId.toLowerCase());
    setOtpUser(result.user);
    setOtpStep(true);
    startCountdown();
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async () => {
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length !== 6) { 
      setOtpError('Please enter the 6-digit OTP.'); 
      return; 
    }
    
    setOtpLoading(true);
    setOtpError('');
    
    // Call verifyOTP from DataContext
    const result = await verifyOTP(otpEmail, trimmedOtp, otpUser);
    
    setOtpLoading(false);
    
    if (result.success) {
        // ✅ 2. AGAR OTP SAHI HAI, TAB LOG BHEJEIN (Python Backend - 5050 par)
        fetch('http://localhost:5050/api/log-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: otpEmail }), 
        })
        .then(() => console.log("Login Logged Successfully"))
        .catch(err => console.error("Logging failed", err));

        // Note: verifyOTP success hone par React context automatically user set kar dega
        // aur aap dashboard par chale jayenge.
    } else {
        setOtpError(result.error || 'Invalid OTP');
        setOtp('');
    }
  };

  // Resend OTP logic
  const handleResend = async () => {
    if (countdown > 0) return;
    setResendMsg('');
    setOtpError('');
    try {
      const res = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (data.success) { 
        setResendMsg('OTP resent successfully!'); 
        startCountdown(); 
      } else {
        setOtpError(data.error || 'Failed to resend OTP');
      }
    } catch { 
      setOtpError('Server error. Is proxy server running?'); 
    }
  };

  // ── OTP Screen ──────────────────────────────────────────────────
  if (otpStep) {
    return (
      <div className="login-screen">
        <div className="login-logo">
           {/* Assuming logo path is correct, or use text if image missing */}
           <h2 style={{color: '#00baf2', fontWeight: 800, fontSize: 32}}>pay<span style={{color: '#002e6e'}}>tm</span></h2>
        </div>
        <div className="login-card">
          <div className="login-header">
            <h1>OTP Verification</h1>
            <div className="sub-text">Enter the code sent to your email</div>
          </div>

          <div style={{
            background: '#f0faff', borderRadius: 8,
            padding: '10px 14px', marginBottom: 20, fontSize: 13,
            color: '#00baf2', fontWeight: 500, border: '1px solid #e0f2ff'
          }}>
            📧 OTP sent to <strong>{otpEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</strong>
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOTP(); }}
              style={{ letterSpacing: 10, fontSize: 24, fontWeight: 700, textAlign: 'center', border: otpError ? '1px solid red' : '1px solid #ddd' }}
              autoFocus
            />
            {otpError && <div style={{color: 'red', fontSize: 12, marginTop: 4}}>{otpError}</div>}
            {resendMsg && <div style={{ color: 'green', fontSize: 12, marginTop: 6 }}>{resendMsg}</div>}
          </div>

          <div className="action-row">
            <button
              className="sign-in-btn"
              onClick={handleVerifyOTP}
              disabled={otpLoading}
              style={{ 
                width: '100%', padding: '12px', backgroundColor: '#00baf2', color: 'white', 
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                opacity: otpLoading ? 0.7 : 1 
              }}
            >
              {otpLoading ? 'Verifying...' : 'Verify OTP ›'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button
              onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); setPass(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666' }}
            >
              ← Back to login
            </button>
            <button
              onClick={handleResend}
              disabled={countdown > 0}
              style={{
                background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                fontSize: 13, color: countdown > 0 ? '#999' : '#00baf2',
                fontWeight: 600,
              }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login Screen ────────────────────────────────────────────────
  return (
    <div className="login-screen">
      <div className="login-logo">
         <h2 style={{color: '#00baf2', fontWeight: 800, fontSize: 32}}>pay<span style={{color: '#002e6e'}}>tm</span></h2>
      </div>
      <div className="login-card">
        <div className="login-header">
          <h1>Sign In</h1>
          <div className="sub-text">Login to Dashboard Panel</div>
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Email / Username"
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '4px', border: error ? '1px solid red' : '1px solid #ddd', boxSizing: 'border-box' }}
            value={id}
            onChange={(e) => { setId(e.target.value); setError(''); }}
          />
          {error && <div style={{color: 'red', fontSize: 12, marginBottom: 10}}>{error}</div>}
        </div>

        <div className="input-group">
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Enter Password"
              style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="action-row">
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              width: '100%', padding: '12px', backgroundColor: '#00baf2', color: 'white', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In Securely ›'}
          </button>
        </div>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          By signing in, you agree to our <span style={{color: '#00baf2'}}>privacy policy</span> and <span style={{color: '#00baf2'}}>terms of use</span>.
        </div>
      </div>
    </div>
  );
}
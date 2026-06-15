// import { useState, useRef, useEffect } from 'react';
// import * as XLSX from 'xlsx';

// const SERVER = 'http://localhost:3001';

// export default function JocataExtractor() {
//   const [caseIdsRaw,  setCaseIdsRaw]  = useState('');
//   const [startDate,   setStartDate]   = useState('01-Apr-2026');
//   const [endDate,     setEndDate]     = useState('30-Apr-2026');
//   const [cookie,      setCookie]      = useState('');
//   const [csrfToken,   setCsrfToken]   = useState('');
//   const [jobId,       setJobId]       = useState(null);
//   const [status,      setStatus]      = useState('idle'); // idle | running | done | error
//   const [logs,        setLogs]        = useState([]);
//   const [progress,    setProgress]    = useState({ done: 0, total: 0, pct: 0, eta: '' });
//   const [results,     setResults]     = useState([]); // parsed CSV rows
//   const [error,       setError]       = useState('');
//   const pollRef  = useRef(null);
//   const logEndRef = useRef(null);

//   // Auto-scroll logs
//   useEffect(() => {
//     if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
//   }, [logs]);

//   // Poll job status
//   useEffect(() => {
//     if (!jobId || status !== 'running') return;
//     pollRef.current = setInterval(async () => {
//       try {
//         const res  = await fetch(`${SERVER}/api/python/status/${jobId}`);
//         const data = await res.json();

//         // Parse progress lines
//         const progressLines = data.logs.filter(l => l.startsWith('PROGRESS:'));
//         if (progressLines.length) {
//           const last  = progressLines[progressLines.length - 1];
//           const parts = last.split(':');
//           setProgress({ done: +parts[1], total: +parts[2], pct: parseFloat(parts[3]), eta: parts[4] || '' });
//         }

//         setLogs(data.logs.filter(l => !l.startsWith('PROGRESS:') && !l.startsWith('DONE:')));

//         if (data.status === 'done') {
//           clearInterval(pollRef.current);
//           setStatus('done');
//           parseCSVResult(data.result);
//         } else if (data.status === 'error') {
//           clearInterval(pollRef.current);
//           setStatus('error');
//           setError(data.error || 'Unknown error');
//         }
//       } catch (e) {
//         console.error('Poll error:', e);
//       }
//     }, 1500);

//     return () => clearInterval(pollRef.current);
//   }, [jobId, status]);

//   const parseCSVResult = (csvText) => {
//     if (!csvText) return;
//     const lines = csvText.trim().split('\n');
//     const headers = lines[0].split(',');
//     const rows = lines.slice(1).map(line => {
//       const vals = line.split(',');
//       return headers.reduce((obj, h, i) => { obj[h.trim()] = (vals[i] || '').trim(); return obj; }, {});
//     });
//     setResults(rows);
//   };

//   const handleStart = async () => {
//     const caseIds = caseIdsRaw.split('\n').map(s => s.trim()).filter(Boolean);
//     if (!caseIds.length)  { setError('Please enter at least one Case ID.'); return; }
//     if (!cookie.trim())   { setError('Cookie is required.'); return; }
//     if (!csrfToken.trim()) { setError('CSRF Token is required.'); return; }

//     setError('');
//     setLogs([]);
//     setResults([]);
//     setProgress({ done: 0, total: caseIds.length, pct: 0, eta: '' });
//     setStatus('running');

//     try {
//       const res  = await fetch(`${SERVER}/api/python/start`, {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify({ caseIds, startDate, endDate, cookie, csrfToken }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setJobId(data.jobId);
//       } else {
//         setStatus('error');
//         setError(data.error || 'Failed to start job');
//       }
//     } catch {
//       setStatus('error');
//       setError('Cannot reach server. Is proxy_server.cjs running?');
//     }
//   };

//   const handleReset = () => {
//     clearInterval(pollRef.current);
//     setJobId(null); setStatus('idle'); setLogs([]);
//     setResults([]); setProgress({ done: 0, total: 0, pct: 0, eta: '' }); setError('');
//   };

//   // ── Export to Excel ────────────────────────────────────────────────────────
//   const exportExcel = () => {
//     if (!results.length) return;
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(results);

//     // Column widths
//     ws['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 25 }, { wch: 20 }];

//     // Header styling
//     const range = XLSX.utils.decode_range(ws['!ref']);
//     for (let C = range.s.c; C <= range.e.c; C++) {
//       const ref = XLSX.utils.encode_cell({ r: 0, c: C });
//       if (!ws[ref]) continue;
//       ws[ref].s = {
//         fill: { fgColor: { rgb: '1A73E8' } },
//         font: { bold: true, color: { rgb: 'FFFFFF' } },
//         alignment: { horizontal: 'center', vertical: 'center' },
//         border: {
//           top: { style: 'thin', color: { rgb: '000000' } },
//           bottom: { style: 'thin', color: { rgb: '000000' } },
//           left: { style: 'thin', color: { rgb: '000000' } },
//           right: { style: 'thin', color: { rgb: '000000' } },
//         },
//       };
//     }

//     XLSX.utils.book_append_sheet(wb, ws, 'Jocata Extract');
//     XLSX.writeFile(wb, `Jocata_Extract_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   // ── Styles ─────────────────────────────────────────────────────────────────
//   const inputStyle = {
//     width: '100%', background: 'var(--surface2)', border: '1.5px solid var(--border)',
//     borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 12,
//     fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box',
//   };
//   const labelStyle = {
//     fontSize: 11, fontWeight: 700, color: 'var(--text3)',
//     textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'block',
//   };

//   return (
//     <div className="page" id="export-jocata">
//       <div className="topbar">
//         <div>
//           <h1>Jocata Case Extractor</h1>
//           <p>Extract Rules, MID & Turnover from Jocata STAR for multiple Case IDs</p>
//         </div>
//       </div>

//       {status === 'idle' && (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

//           {/* Left — Case IDs + Dates */}
//           <div className="card" style={{ padding: 20 }}>
//             <div className="card-title" style={{ marginBottom: 16 }}>Case Configuration</div>

//             <div style={{ marginBottom: 14 }}>
//               <label style={labelStyle}>Case IDs (one per line)</label>
//               <textarea
//                 rows={8}
//                 value={caseIdsRaw}
//                 onChange={e => setCaseIdsRaw(e.target.value)}
//                 placeholder={"CASE001\nCASE002\nCASE003"}
//                 style={{ ...inputStyle, resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
//               />
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//               <div>
//                 <label style={labelStyle}>Start Date</label>
//                 <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)}
//                   placeholder="01-Apr-2026" style={inputStyle} />
//               </div>
//               <div>
//                 <label style={labelStyle}>End Date</label>
//                 <input type="text" value={endDate} onChange={e => setEndDate(e.target.value)}
//                   placeholder="30-Apr-2026" style={inputStyle} />
//               </div>
//             </div>
//           </div>

//           {/* Right — Auth Tokens */}
//           <div className="card" style={{ padding: 20 }}>
//             <div className="card-title" style={{ marginBottom: 4 }}>Authentication Tokens</div>
//             <div className="card-sub" style={{ marginBottom: 16 }}>
//               Copy from browser DevTools → Network → Any Jocata request → Headers
//             </div>

//             <div style={{ marginBottom: 14 }}>
//               <label style={labelStyle}>Cookie String</label>
//               <textarea
//                 rows={5}
//                 value={cookie}
//                 onChange={e => setCookie(e.target.value)}
//                 placeholder="JSESSIONID=...; AWSALBAPP-0=..."
//                 style={{ ...inputStyle, resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
//               />
//             </div>

//             <div>
//               <label style={labelStyle}>X-CSRF-Token</label>
//               <input
//                 type="text"
//                 value={csrfToken}
//                 onChange={e => setCsrfToken(e.target.value)}
//                 placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
//                 style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
//               />
//             </div>

//             {/* Token helper */}
//             <div style={{
//               marginTop: 14, background: 'var(--amber-light)', borderRadius: 8,
//               padding: '10px 14px', fontSize: 11, color: '#92400e',
//               borderLeft: '3px solid var(--amber)',
//             }}>
//               <strong>How to get tokens:</strong><br />
//               1. Login to aml.paytm.in<br />
//               2. Open DevTools (F12) → Network tab<br />
//               3. Click any request → Headers → Copy Cookie & x-csrf-token
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div style={{
//           background: 'var(--red-light)', border: '1px solid var(--red)',
//           borderRadius: 8, padding: '10px 16px', marginBottom: 14,
//           fontSize: 12, color: 'var(--red)', fontWeight: 600,
//         }}>
//           ⚠ {error}
//         </div>
//       )}

//       {/* Start / Reset buttons */}
//       {status === 'idle' && (
//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
//           <button
//             onClick={handleStart}
//             style={{
//               background: 'var(--blue)', color: '#fff', border: 'none',
//               borderRadius: 9, padding: '12px 40px', fontSize: 14,
//               fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter',
//             }}
//           >
//             🚀 Start Extraction
//           </button>
//         </div>
//       )}

//       {/* Running / Progress */}
//       {status === 'running' && (
//         <div className="card" style={{ padding: 20, marginBottom: 16 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//             <div className="card-title">Extraction in Progress</div>
//             <span style={{ fontSize: 12, color: 'var(--text3)' }}>
//               {progress.done}/{progress.total} cases · ETA {progress.eta}
//             </span>
//           </div>

//           {/* Progress bar */}
//           <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 14 }}>
//             <div style={{
//               width: `${progress.pct}%`, height: '100%',
//               background: 'var(--blue)', borderRadius: 6,
//               transition: 'width 0.4s ease',
//             }} />
//           </div>
//           <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>
//             {progress.pct.toFixed(1)}% complete
//           </div>

//           {/* Live log console */}
//           <div style={{
//             background: '#0d1b2a', borderRadius: 10, overflow: 'hidden',
//             border: '1px solid #1a2e45',
//           }}>
//             <div style={{
//               background: '#1a2e45', padding: '8px 14px', fontSize: 10,
//               color: '#8896ab', fontWeight: 700, letterSpacing: '0.05em',
//               textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6,
//             }}>
//               <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f9d58', display: 'inline-block' }} />
//               Live Output
//             </div>
//             <div style={{ padding: 14, height: 200, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
//               {logs.map((l, i) => (
//                 <div key={i} style={{ color: l.includes('ERROR') || l.includes('⚠') ? '#ff6b6b' : l.includes('SUCCESS') || l.includes('found') ? '#51cf66' : '#a8d8ea', marginBottom: 2 }}>
//                   {l}
//                 </div>
//               ))}
//               <div ref={logEndRef} />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Results */}
//       {status === 'done' && results.length > 0 && (
//         <div>
//           {/* Summary KPIs */}
//           <div className="kpi-grid k3" style={{ marginBottom: 16 }}>
//             <div className="kpi blue-v">
//               <div className="kpi-top-bar" />
//               <div className="kpi-label">Total Cases</div>
//               <div className="kpi-val">{results.length}</div>
//               <div className="kpi-sub">Processed successfully</div>
//             </div>
//             <div className="kpi green-v">
//               <div className="kpi-top-bar" />
//               <div className="kpi-label">MIDs Found</div>
//               <div className="kpi-val">{results.filter(r => r['Top MID'] && r['Top MID'] !== 'Not Found / Error' && r['Top MID'] !== 'No MID found').length}</div>
//               <div className="kpi-sub">Successfully extracted</div>
//             </div>
//             <div className="kpi amber-v">
//               <div className="kpi-top-bar" />
//               <div className="kpi-label">Total Turnover</div>
//               <div className="kpi-val">
//                 ₹{results.reduce((s, r) => s + (parseFloat(r['Turnover (INR)']) || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
//               </div>
//               <div className="kpi-sub">Combined INR value</div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
//             <p style={{ fontSize: 13, color: 'var(--text2)' }}>
//               ✅ Extraction complete — {results.length} cases processed.
//             </p>
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button
//                 onClick={handleReset}
//                 style={{ padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter' }}
//               >
//                 🔄 New Extraction
//               </button>
//               <button
//                 onClick={exportExcel}
//                 style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', fontFamily: 'Inter' }}
//               >
//                 ⬇ Download Excel
//               </button>
//             </div>
//           </div>

//           {/* Results table */}
//           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
//             <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
//               <div className="card-title">Extraction Results</div>
//               <div className="card-sub">Case ID · Rules · Top MID · Turnover</div>
//             </div>
//             <div className="tbl-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Case ID</th>
//                     <th>Rules / Alerts</th>
//                     <th>Top MID</th>
//                     <th>Turnover (INR)</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {results.map((row, i) => {
//                     const hasError = !row['Top MID'] || row['Top MID'].includes('Error') || row['Top MID'].includes('Not Found') || row['Top MID'] === 'No MID found';
//                     return (
//                       <tr key={i}>
//                         <td className="mono" style={{ color: 'var(--blue)', fontWeight: 600 }}>
//                           {row['Case ID']}
//                         </td>
//                         <td style={{ fontSize: 11, maxWidth: 280, whiteSpace: 'normal', lineHeight: 1.5 }}>
//                           {row['Rules/Alerts'] || '—'}
//                         </td>
//                         <td className="mono" style={{ fontWeight: 600 }}>
//                           {row['Top MID'] || '—'}
//                         </td>
//                         <td className="mono" style={{ color: 'var(--green)', fontWeight: 600 }}>
//                           {parseFloat(row['Turnover (INR)']) ? `₹${parseFloat(row['Turnover (INR)']).toLocaleString('en-IN')}` : '—'}
//                         </td>
//                         <td>
//                           <span style={{
//                             display: 'inline-block', padding: '2px 8px', borderRadius: 20,
//                             fontSize: 10, fontWeight: 700,
//                             background: hasError ? 'var(--red-light)' : 'var(--green-light)',
//                             color: hasError ? 'var(--red)' : 'var(--green)',
//                           }}>
//                             {hasError ? '✗ Error' : '✓ Done'}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error state */}
//       {status === 'error' && (
//         <div className="card" style={{ padding: 32, textAlign: 'center' }}>
//           <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
//           <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Extraction Failed</div>
//           <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{error}</div>
//           <button
//             onClick={handleReset}
//             style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}
//           >
//             Try Again
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }












import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './JocataExtractor.css'; // Ensure this file exists in the same folder

const SERVER = 'http://localhost:3001';

export default function MerchantAnalyzer() {
  const [caseIdsRaw, setCaseIdsRaw] = useState('');
  const [startDate, setStartDate] = useState('2026-04-01'); // ISO format for Calendar
  const [endDate, setEndDate] = useState('2026-04-30');   // ISO format for Calendar
  const [cookie, setCookie] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0, pct: 0, eta: '' });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  
  const pollRef = useRef(null);
  const logEndRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper: Format ISO date (2026-04-01) to Jocata format (01-Apr-2026)
  const formatDateForBackend = (dateStr) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Status Polling Logic
  useEffect(() => {
    if (!jobId || status !== 'running') return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER}/api/python/status/${jobId}`);
        const data = await res.json();

        // Handle Progress Updates
        const progressLines = data.logs.filter(l => l.startsWith('PROGRESS:'));
        if (progressLines.length) {
          const last = progressLines[progressLines.length - 1];
          const parts = last.split(':');
          setProgress({ done: +parts[1], total: +parts[2], pct: parseFloat(parts[3]), eta: parts[4] || '' });
        }

        setLogs(data.logs.filter(l => !l.startsWith('PROGRESS:') && !l.startsWith('DONE:')));

        if (data.status === 'done') {
          clearInterval(pollRef.current);
          setStatus('done');
          parseCSVResult(data.result);
        } else if (data.status === 'error') {
          clearInterval(pollRef.current);
          setStatus('error');
          setError(data.error || 'Automation Script Error');
        }
      } catch (e) {
        console.error('Polling failed:', e);
      }
    }, 1500);

    return () => clearInterval(pollRef.current);
  }, [jobId, status]);

  const parseCSVResult = (csvText) => {
    if (!csvText) return;
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',');
      return headers.reduce((obj, h, i) => { obj[h.trim()] = (vals[i] || '').trim(); return obj; }, {});
    });
    setResults(rows);
  };

  const handleStart = async () => {
    const caseIds = caseIdsRaw.split('\n').map(s => s.trim()).filter(Boolean);
    if (!caseIds.length) { setError('Please enter at least one Case ID.'); return; }
    if (!cookie.trim()) { setError('Cookie is required.'); return; }
    if (!csrfToken.trim()) { setError('CSRF Token is required.'); return; }

    setError('');
    setLogs([]);
    setResults([]);
    setProgress({ done: 0, total: caseIds.length, pct: 0, eta: '' });
    setStatus('running');

    try {
      const res = await fetch(`${SERVER}/api/python/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseIds, 
          startDate: formatDateForBackend(startDate), 
          endDate: formatDateForBackend(endDate), 
          cookie, 
          csrfToken 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJobId(data.jobId);
      } else {
        setStatus('error');
        setError(data.error || 'Failed to initialize automation');
      }
    } catch {
      setStatus('error');
      setError('Cannot reach server. Ensure proxy_server.cjs is running on port 3001.');
    }
  };

  const handleReset = () => {
    clearInterval(pollRef.current);
    setJobId(null); setStatus('idle'); setLogs([]);
    setResults([]); setProgress({ done: 0, total: 0, pct: 0, eta: '' }); setError('');
  };

  const exportExcel = () => {
    if (!results.length) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Jocata Extract');
    XLSX.writeFile(wb, `Jocata_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-max-width">
        <header className="analyzer-header">
          <div className="analyzer-title">
            <h1>Merchant Analysis Intelligence</h1>
            <p>Automated Case Extraction via Jocata STAR</p>
          </div>
          {status === 'done' && (
            <button onClick={exportExcel} className="btn-success">Download Excel</button>
          )}
        </header>

        {status === 'idle' && (
          <div className="analyzer-grid">
            <div className="card">
              <h3 className="card-title">Case Configuration</h3>
              <div className="input-stack">
                <label>Case IDs (One per line)</label>
                <textarea
                  rows={8}
                  className="input-field mono"
                  value={caseIdsRaw}
                  onChange={e => setCaseIdsRaw(e.target.value)}
                  placeholder="260421681..."
                />
              </div>
              <div className="date-grid">
                <div className="input-stack">
                  <label>Start Date</label>
                  <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="input-stack">
                  <label>End Date</label>
                  <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Authentication Tokens</h3>
              <div className="input-stack">
                <label>Cookie String</label>
                <textarea
                  rows={5}
                  className="input-field mono text-xs"
                  value={cookie}
                  onChange={e => setCookie(e.target.value)}
                  placeholder="JSESSIONID=..."
                />
              </div>
              <div className="input-stack">
                <label>X-CSRF-Token</label>
                <input className="input-field mono" value={csrfToken} onChange={e => setCsrfToken(e.target.value)} />
              </div>
              <div className="info-box">
                <strong>Pro Tip:</strong> Copy values from Network tab in DevTools (F12) while logged into aml.paytm.in.
              </div>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="btn-row">
            <button onClick={handleStart} className="btn-primary">🚀 Start Extraction</button>
          </div>
        )}

        {status === 'running' && (
          <div className="card">
            <div className="progress-header">
              <h3>Processing {progress.done} / {progress.total}</h3>
              <span>{progress.pct.toFixed(0)}% Complete</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="console-box">
              <div className="console-header">Live Execution Monitor</div>
              <div className="console-body">
                {logs.map((l, i) => <div key={i} className="log-line">{l}</div>)}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="results-card">
            <div className="table-header-row">
              <h3>Extraction Successful</h3>
              <button onClick={handleReset} className="btn-outline">New Extraction</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Rules / Alerts</th>
                    <th>Top MID</th>
                    <th>Turnover</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      <td className="font-bold text-blue-600">{row['Case ID']}</td>
                      <td className="text-xs max-w-xs">{row['Rules/Alerts']}</td>
                      <td className="mono">{row['Top MID']}</td>
                      <td className="mono font-bold text-green-600">₹{parseFloat(row['Turnover (INR)']).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && <div className="error-alert">⚠ {error}</div>}
      </div>
    </div>
  );
}
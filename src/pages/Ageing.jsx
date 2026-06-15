// import { useEffect, useRef, useState } from 'react';
// import { Chart } from 'chart.js/auto';
// import { useData } from '../context/DataContext';
// import ChartCard from '../components/ChartCard';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';

// function destroyChart(ref) {
//   if (ref.current) { ref.current.destroy(); ref.current = null; }
// }

// const BASE_OPTS = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: { legend: { display: false } },
//   scales: {
//     x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
//     y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
//   },
// };

// export default function Ageing() {
//   const { filteredData, rawData, CM } = useData();
//   const d = filteredData.length ? filteredData : rawData;

//   const refBuckets = useRef(null); const canvasBuckets = useRef(null);
//   const refTAT     = useRef(null); const canvasTAT     = useRef(null);

//   const [summaryHTML, setSummaryHTML] = useState('');
//   const [tatRows,     setTatRows]     = useState([]);
//   const [tatBadge,    setTatBadge]    = useState('—');

//   useEffect(() => {
//     if (!d.length) return;

//     const openCases = d.filter((r) => r._open && r._ageing !== null);

//     // ── Ageing buckets ────────────────────────────────
//     const buckets = { '0-10': 0, '11-15': 0, '16-25': 0, '26-30': 0, '30+': 0 };
//     openCases.forEach((r) => {
//       const a = r._ageing;
//       if (a <= 10) buckets['0-10']++;
//       else if (a <= 15) buckets['11-15']++;
//       else if (a <= 25) buckets['16-25']++;
//       else if (a <= 30) buckets['26-30']++;
//       else buckets['30+']++;
//     });

//     // ── Monthly ageing summary ────────────────────────
//     const byMonth = {};
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM); if (!mk) return;
//       const lv = r._level; if (lv === 'OTHER') return;
//       if (!byMonth[mk]) byMonth[mk] = {};
//       if (!byMonth[mk][lv]) byMonth[mk][lv] = { assigned: 0, open: 0, completed: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
//       byMonth[mk][lv].assigned++;
//       if (r._open) {
//         byMonth[mk][lv].open++;
//         if (r._ageing !== null) {
//           const a = r._ageing;
//           if      (a <= 10) byMonth[mk][lv].b0++;
//           else if (a <= 15) byMonth[mk][lv].b11++;
//           else if (a <= 25) byMonth[mk][lv].b16++;
//           else if (a <= 30) byMonth[mk][lv].b26++;
//           else               byMonth[mk][lv].b30++;
//         }
//       }
//       if (r._closed) byMonth[mk][lv].completed++;
//     });

//     // Build summary table HTML (using dangerouslySetInnerHTML for the complex rowspan table)
//     const months = Object.keys(byMonth).sort();
//     let html = `<div class="card"><div class="card-hdr"><div><div class="card-title">Weekly Summary — Ageing by Month &amp; Level</div><div class="card-sub">Assigned · Open · Completed · Ageing Buckets</div></div></div>
//       <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
//         <th>Month</th><th>Level</th><th>Assigned</th><th>Open</th><th>Completed</th>
//         <th style="background:#e8f5e9">0-10 days</th><th style="background:#fff3e0">11-15 days</th>
//         <th style="background:#fce4ec">16-25 days</th><th style="background:#ffebee">26-30 days</th>
//         <th style="background:#ffebee">30+ days</th>
//       </tr></thead><tbody>`;

//     months.forEach((mk) => {
//       const lvls = ['L1', 'L2', 'L3'];
//       const validLvls = lvls.filter((l) => byMonth[mk][l]);
//       validLvls.forEach((lv, li) => {
//         const x = byMonth[mk][lv];
//         const pillClass = lv === 'L1' ? 'pill-blue' : lv === 'L2' ? 'pill-amber' : 'pill-purple';
//         html += `<tr>
//           ${li === 0 ? `<td style="font-weight:700;vertical-align:top" rowspan="${validLvls.length}">${mk}</td>` : ''}
//           <td><span class="pill ${pillClass}">${lv}</span></td>
//           <td class="mono">${x.assigned}</td>
//           <td class="mono" style="color:#d93025;font-weight:600">${x.open}</td>
//           <td class="mono" style="color:#0f9d58">${x.completed}</td>
//           <td class="mono" style="background:#f1f8e9">${x.b0}</td>
//           <td class="mono" style="background:#fff8e1">${x.b11}</td>
//           <td class="mono" style="background:#fce4ec;${x.b16 > 0 ? 'color:#d93025;font-weight:600' : ''}">${x.b16}</td>
//           <td class="mono" style="background:#ffebee;${x.b26 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b26}</td>
//           <td class="mono" style="background:#ffebee;${x.b30 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b30}</td>
//         </tr>`;
//       });
//     });
//     html += `</tbody></table></div></div>`;
//     setSummaryHTML(html);

//     // ── Bucket Chart ──────────────────────────────────
//     destroyChart(refBuckets);
//     refBuckets.current = new Chart(canvasBuckets.current, {
//       type: 'bar',
//       data: {
//         labels: Object.keys(buckets),
//         datasets: [{ label: 'Open Cases', data: Object.values(buckets), backgroundColor: ['rgba(15,157,88,0.7)', 'rgba(245,158,11,0.65)', 'rgba(217,48,37,0.55)', 'rgba(217,48,37,0.75)', 'rgba(183,28,28,0.8)'], borderRadius: 6 }],
//       },
//       options: BASE_OPTS,
//     });

//     // ── TAT breach per analyst ────────────────────────
//     if (CM.user) {
//       const breach = {};
//       openCases.forEach((r) => {
//         const u = r[CM.user] || 'Unknown';
//         if (!breach[u]) breach[u] = { total: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
//         breach[u].total++;
//         const a = r._ageing;
//         if      (a <= 10) breach[u].b0++;
//         else if (a <= 15) breach[u].b11++;
//         else if (a <= 25) breach[u].b16++;
//         else if (a <= 30) breach[u].b26++;
//         else               breach[u].b30++;
//       });
//       const breachArr = Object.entries(breach)
//         .map(([u, x]) => ({ u, ...x, breachCount: x.b11 + x.b16 + x.b26 + x.b30 }))
//         .filter((x) => x.breachCount > 0)
//         .sort((a, b) => b.breachCount - a.breachCount);

//       setTatBadge(breachArr.reduce((s, x) => s + x.breachCount, 0) + ' breach cases');
//       setTatRows(breachArr);

//       destroyChart(refTAT);
//       refTAT.current = new Chart(canvasTAT.current, {
//         type: 'bar',
//         data: { labels: breachArr.map((x) => x.u), datasets: [{ label: 'Breach Cases (>10d)', data: breachArr.map((x) => x.breachCount), backgroundColor: 'rgba(217,48,37,0.7)', borderRadius: 5 }] },
//         options: { ...BASE_OPTS, indexAxis: 'y' },
//       });
//     }

//     return () => { destroyChart(refBuckets); destroyChart(refTAT); };
//   }, [d, CM]);

//   const hasData = rawData.length > 0;

//   const breachPctPill = (pct) => {
//     const v = parseFloat(pct);
//     return isNaN(v)
//       ? <span className="pill pill-gray">{pct}</span>
//       : v > 50 ? <span className="pill pill-red">{pct}</span>
//       : v > 20 ? <span className="pill pill-amber">{pct}</span>
//       : <span className="pill pill-green">{pct}</span>;
//   };

//   return (
//     <div className="page" id="export-ageing">
//       <div className="topbar">
//         <div><h1>Ageing Analysis</h1><p>Open case ageing buckets &amp; TAT breach analysis</p></div>
//         <div className="topbar-right">
//           <ExportButton
//             targetId="export-ageing"
//             pageTitle="Ageing Analysis"
//             subTitle={hasData ? `${d.length.toLocaleString()} cases loaded` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>

//       {!hasData && <div className="empty-state" style={{ marginTop: 60 }}><div className="ei">⏱</div><p>Upload a CDR file to view ageing analysis</p></div>}

//       {hasData && (
//         <>
//           <div className="sec-label">Open Cases Ageing Summary (Weekly Summary View)</div>
//           <div style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: summaryHTML }} />

//           <div className="chart-row r2">
//             <ChartCard title="Open Ageing Distribution" sub="0-10 · 11-15 · 16-25 · 26-30 · 30+ days" height="h240">
//               <canvas ref={canvasBuckets} />
//             </ChartCard>
//             <ChartCard title="TAT Breach Analysts (Ageing > 10 days)" sub="Analysts with open cases breaching 10-day TAT" badge={tatBadge} badgeClass="badge-red" height="h240">
//               <canvas ref={canvasTAT} />
//             </ChartCard>
//           </div>

//           <div className="sec-label">TAT Breach Detail</div>
//           <div className="card" style={{ marginBottom: 14 }}>
//             <div className="card-hdr">
//               <div>
//                 <div className="card-title">Analysts with TAT Breach (Open Cases &gt; 10 days)</div>
//                 <div className="card-sub">Sorted by breach count descending</div>
//               </div>
//             </div>
//             <div className="tbl-wrap ageing-table">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Analyst</th><th>Total Open</th><th>0-10 days</th>
//                     <th>11-15 days</th><th>16-25 days</th><th>26-30 days</th>
//                     <th>30+ days</th><th>TAT Breach Count</th><th>Breach %</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tatRows.map((x) => {
//                     const pct = x.total > 0 ? ((x.breachCount / x.total) * 100).toFixed(1) + '%' : '—';
//                     return (
//                       <tr key={x.u} className={x.breachCount > 5 ? 'tat-breach' : ''}>
//                         <td style={{ fontWeight: 600 }}>{x.u}</td>
//                         <td className="mono">{x.total}</td>
//                         <td className="mono" style={{ color: '#0f9d58' }}>{x.b0}</td>
//                         <td className="mono" style={{ color: '#f59e0b', fontWeight: 600 }}>{x.b11}</td>
//                         <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b16}</td>
//                         <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b26}</td>
//                         <td className="mono" style={{ color: '#b71c1c', fontWeight: 800 }}>{x.b30}</td>
//                         <td className="mono" style={{ color: x.breachCount > 0 ? '#d93025' : '#0f9d58', fontWeight: 700 }}>{x.breachCount}</td>
//                         <td>{breachPctPill(pct)}</td>
//                       </tr>
//                     );
//                   })}
//                   {tatRows.length === 0 && (
//                     <tr><td colSpan={9} className="empty-state"><div className="ei">✅</div><p>No TAT breaches found</p></td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }










// import { useEffect, useRef, useState } from 'react';
// import { Chart } from 'chart.js/auto';
// import { useData } from '../context/DataContext';
// import ChartCard from '../components/ChartCard';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';
 
// function destroyChart(ref) {
//   if (ref.current) { ref.current.destroy(); ref.current = null; }
// }
 
// // "2026-03" → "March 2026"
// const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
//   return mk;
// }
 
// const BASE_OPTS = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: { legend: { display: false } },
//   scales: {
//     x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
//     y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
//   },
// };
 
// export default function Ageing() {
//   const { filteredData, rawData, CM } = useData();
//   const d = filteredData.length ? filteredData : rawData;
 
//   const refBuckets = useRef(null); const canvasBuckets = useRef(null);
 
//   const [summaryHTML, setSummaryHTML] = useState('');
//   const [tatRows,     setTatRows]     = useState([]);
 
//   useEffect(() => {
//     if (!d.length) return;
 
//     const openCases = d.filter((r) => r._open && r._ageing !== null);
 
//     // ── Ageing buckets ────────────────────────────────
//     const buckets = { '0-10': 0, '11-15': 0, '16-25': 0, '26-30': 0, '30+': 0 };
//     openCases.forEach((r) => {
//       const a = r._ageing;
//       if      (a <= 10) buckets['0-10']++;
//       else if (a <= 15) buckets['11-15']++;
//       else if (a <= 25) buckets['16-25']++;
//       else if (a <= 30) buckets['26-30']++;
//       else               buckets['30+']++;
//     });
 
//     // ── Monthly ageing summary ────────────────────────
//     const byMonth = {};
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM); if (!mk) return;
//       const lv = r._level; if (lv === 'OTHER') return;
//       if (!byMonth[mk]) byMonth[mk] = {};
//       if (!byMonth[mk][lv]) byMonth[mk][lv] = { assigned: 0, open: 0, completed: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
//       byMonth[mk][lv].assigned++;
//       if (r._open) {
//         byMonth[mk][lv].open++;
//         if (r._ageing !== null) {
//           const a = r._ageing;
//           if      (a <= 10) byMonth[mk][lv].b0++;
//           else if (a <= 15) byMonth[mk][lv].b11++;
//           else if (a <= 25) byMonth[mk][lv].b16++;
//           else if (a <= 30) byMonth[mk][lv].b26++;
//           else               byMonth[mk][lv].b30++;
//         }
//       }
//       if (r._closed) byMonth[mk][lv].completed++;
//     });
 
//     // Build summary table HTML
//     const months = Object.keys(byMonth).sort();
//     let html = `<div class="card"><div class="card-hdr"><div><div class="card-title">Summary — Ageing by Month &amp; Level</div><div class="card-sub">Assigned · Open · Completed · Ageing Buckets · All months compared</div></div></div>
//       <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
//         <th>Month</th><th>Level</th><th>Assigned</th><th>Open</th><th>Completed</th>
//         <th style="background:#e8f5e9">0-10 days</th><th style="background:#fff3e0">11-15 days</th>
//         <th style="background:#fce4ec">16-25 days</th><th style="background:#ffebee">26-30 days</th>
//         <th style="background:#ffebee">30+ days</th>
//       </tr></thead><tbody>`;
 
//     months.forEach((mk) => {
//       const lvls      = ['L1', 'L2', 'L3'];
//       const validLvls = lvls.filter((l) => byMonth[mk][l]);
//       const displayMk = fmtMonth(mk);
//       validLvls.forEach((lv, li) => {
//         const x         = byMonth[mk][lv];
//         const pillClass = lv === 'L1' ? 'pill-blue' : lv === 'L2' ? 'pill-amber' : 'pill-purple';
//         html += `<tr>
//           ${li === 0 ? `<td style="font-weight:700;vertical-align:top" rowspan="${validLvls.length}">${displayMk}</td>` : ''}
//           <td><span class="pill ${pillClass}">${lv}</span></td>
//           <td class="mono">${x.assigned}</td>
//           <td class="mono" style="color:#d93025;font-weight:600">${x.open}</td>
//           <td class="mono" style="color:#0f9d58">${x.completed}</td>
//           <td class="mono" style="background:#f1f8e9">${x.b0}</td>
//           <td class="mono" style="background:#fff8e1">${x.b11}</td>
//           <td class="mono" style="background:#fce4ec;${x.b16 > 0 ? 'color:#d93025;font-weight:600' : ''}">${x.b16}</td>
//           <td class="mono" style="background:#ffebee;${x.b26 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b26}</td>
//           <td class="mono" style="background:#ffebee;${x.b30 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b30}</td>
//         </tr>`;
//       });
//     });
//     html += `</tbody></table></div></div>`;
//     setSummaryHTML(html);
 
//     // ── Bucket Chart ──────────────────────────────────
//     destroyChart(refBuckets);
//     refBuckets.current = new Chart(canvasBuckets.current, {
//       type: 'bar',
//       data: {
//         labels: Object.keys(buckets),
//         datasets: [{
//           label: 'Open Cases',
//           data: Object.values(buckets),
//           backgroundColor: [
//             'rgba(15,157,88,0.7)',
//             'rgba(245,158,11,0.65)',
//             'rgba(217,48,37,0.55)',
//             'rgba(217,48,37,0.75)',
//             'rgba(183,28,28,0.8)',
//           ],
//           borderRadius: 6,
//         }],
//       },
//       options: BASE_OPTS,
//     });
 
//     // ── Analyst ageing table (all analysts with open cases) ──────────────
//     if (CM.user) {
//       const analystMap = {};
//       openCases.forEach((r) => {
//         const u = r[CM.user] || 'Unknown';
//         if (!analystMap[u]) analystMap[u] = { total: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0, breachCount: 0 };
//         analystMap[u].total++;
//         const a = r._ageing;
//         if      (a <= 10) analystMap[u].b0++;
//         else if (a <= 15) { analystMap[u].b11++; analystMap[u].breachCount++; }
//         else if (a <= 25) { analystMap[u].b16++; analystMap[u].breachCount++; }
//         else if (a <= 30) { analystMap[u].b26++; analystMap[u].breachCount++; }
//         else               { analystMap[u].b30++; analystMap[u].breachCount++; }
//       });
//       const rows = Object.entries(analystMap)
//         .map(([u, x]) => ({ u, ...x }))
//         .sort((a, b) => b.total - a.total);
//       setTatRows(rows);
//     }
 
//     return () => { destroyChart(refBuckets); };
//   }, [d, CM]);
 
//   const hasData = rawData.length > 0;
 
//   return (
//     <div className="page" id="export-ageing">
//       <div className="topbar">
//         <div>
//           <h1>Ageing Analysis</h1>
//           <p>Open case ageing buckets &amp; deadline breach analysis</p>
//         </div>
//         <div className="topbar-right">
//           <ExportButton
//             targetId="export-ageing"
//             pageTitle="Ageing Analysis"
//             subTitle={hasData ? `${d.length.toLocaleString()} cases loaded` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>
 
//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">⏱</div>
//           <p>Upload a CDR file to view ageing analysis</p>
//         </div>
//       )}
 
//       {hasData && (
//         <>
//           <div className="sec-label">Ageing Summary (All Months Comparison)</div>
//           <div style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: summaryHTML }} />
 
//           {/* Buckets chart — full width */}
//           <div className="chart-row">
//             <ChartCard
//               title="Open Ageing Distribution"
//               sub="0-10 · 11-15 · 16-25 · 26-30 · 30+ days"
//               height="h260"
//             >
//               <canvas ref={canvasBuckets} />
//             </ChartCard>
//           </div>
 
//           {/* ── Analyst Ageing Table ─────────────────────── */}
//           <div className="sec-label">Analyst Ageing Detail</div>
//           <div className="card" style={{ marginBottom: 14 }}>
//             <div className="card-hdr">
//               <div>
//                 <div className="card-title">Analysts with Ageing of cases</div>
//                 <div className="card-sub">
//                   Open cases sorted by analyst · Ageing buckets breakdown
//                 </div>
//               </div>
//             </div>
//             <div className="tbl-wrap ageing-table">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Analyst</th>
//                     <th>Total Open</th>
//                     <th>0-10 days</th>
//                     <th>11-15 days</th>
//                     <th>16-25 days</th>
//                     <th>26-30 days</th>
//                     <th>30+ days</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tatRows.map((x) => (
//                     <tr key={x.u} className={x.breachCount > 5 ? 'tat-breach' : ''}>
//                       <td style={{ fontWeight: 600 }}>{x.u}</td>
//                       <td className="mono">{x.total}</td>
//                       <td className="mono" style={{ color: '#0f9d58' }}>{x.b0}</td>
//                       <td className="mono" style={{ color: '#f59e0b', fontWeight: 600 }}>{x.b11}</td>
//                       <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b16}</td>
//                       <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b26}</td>
//                       <td className="mono" style={{ color: '#b71c1c', fontWeight: 800 }}>{x.b30}</td>
//                     </tr>
//                   ))}
//                   {tatRows.length === 0 && (
//                     <tr>
//                       <td colSpan={7} className="empty-state">
//                         <div className="ei">✅</div>
//                         <p>No open cases with ageing data found</p>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }







import { useEffect, useRef, useState, useMemo } from 'react';
import { Chart } from 'chart.js/auto';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';
import ChartCard from '../components/ChartCard';
import ExportButton from '../components/ExportButton';
import { getMonthKey } from '../utils/dataUtils';
 
function destroyChart(ref) {
  if (ref.current) { ref.current.destroy(); ref.current = null; }
}
 
// ─── Month helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
 
function fmtMonth(mk) {
  if (!mk) return mk;
  const m = mk.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
  return mk;
}
 
function fmtMonthShort(mk) {
  if (!mk) return mk;
  const m = mk.match(/^(\d{4})-(\d{2})$/);
  if (m) return MONTH_NAMES[parseInt(m[2], 10) - 1] || mk;
  return mk;
}
 
// ─── Analysts to EXCLUDE from the ageing table ───────────────────────────────
const EXCLUDED_ANALYSTS = ['sandeep.kumar', 'neetu1.singh', 'neetu.singh'];
 
function isExcluded(name) {
  if (!name) return false;
  const n = name.toLowerCase().trim();
  return EXCLUDED_ANALYSTS.some((ex) => n === ex || n.includes(ex) || ex.includes(n));
}
 
// ─── Bar chart colors per month (up to 6 months) ─────────────────────────────
const MONTH_COLORS = [
  'rgba(26,115,232,0.75)',
  'rgba(245,158,11,0.75)',
  'rgba(15,157,88,0.75)',
  'rgba(124,58,237,0.75)',
  'rgba(217,48,37,0.75)',
  'rgba(8,145,178,0.75)',
];
 
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
  },
};
 
export default function Ageing() {
  const { filteredData, rawData, CM } = useData();
  const d = filteredData.length ? filteredData : rawData;
 
  const refBuckets = useRef(null);
  const canvasBuckets = useRef(null);
 
  const [summaryHTML,     setSummaryHTML]     = useState('');
  const [allMonthKeys,    setAllMonthKeys]    = useState([]);   // all months in data
  const [selectedMonth,   setSelectedMonth]   = useState('all'); // filter for analyst table
  const [tatRows,         setTatRows]         = useState([]);    // all months combined
  const [tatRowsByMonth,  setTatRowsByMonth]  = useState({});    // keyed by monthKey
 
  useEffect(() => {
    if (!d.length) return;
 
    // ── Detect all distinct months ────────────────────────────────────────
    const monthSet = new Set();
    d.forEach((r) => {
      const mk = getMonthKey(r, CM);
      if (mk) monthSet.add(mk);
    });
    const months = [...monthSet].sort().reverse();
    setAllMonthKeys(months);
 
    // ── Monthly ageing summary table ──────────────────────────────────────
    const byMonth = {};
    d.forEach((r) => {
      const mk = getMonthKey(r, CM); if (!mk) return;
      const lv = r._level; if (lv === 'OTHER') return;
      if (!byMonth[mk]) byMonth[mk] = {};
      if (!byMonth[mk][lv]) byMonth[mk][lv] = { assigned: 0, open: 0, completed: 0, b0: 0, b3: 0, b11: 0, b16: 0, b30: 0 };
      byMonth[mk][lv].assigned++;
      if (r._open) {
        byMonth[mk][lv].open++;
        if (r._ageing !== null) {
          const a = r._ageing;
          if      (a <= 2)  byMonth[mk][lv].b0++;
          else if (a <= 10) byMonth[mk][lv].b3++;
          else if (a <= 15) byMonth[mk][lv].b11++;
          else if (a <= 30) byMonth[mk][lv].b16++;
          else               byMonth[mk][lv].b30++;
        }
      }
      if (r._closed) byMonth[mk][lv].completed++;
    });
 
    // Build summary table — newest month first (reverse sort)
    const sortedMonths = [...months];
    let html = `<div class="card"><div class="card-hdr"><div>
      <div class="card-title">Summary — Ageing by Month &amp; Level</div>
      <div class="card-sub">Assigned · Open · Completed · Open Ageing Buckets · All months compared</div>
    </div></div>
    <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
      <th>Month</th><th>Work Flow</th><th>Assigned</th><th>Open</th><th>Completed</th>
      <th style="background:#e8f5e9">00-10 days</th>
      <th style="background:#fff3e0">11-15 days</th>
      <th style="background:#fce4ec">16-30 days</th>
      <th style="background:#ffebee">Over 30 days</th>
    </tr></thead><tbody>`;
 
    sortedMonths.forEach((mk) => {
      const lvls      = ['L1', 'L2', 'L3'];
      const validLvls = lvls.filter((l) => byMonth[mk] && byMonth[mk][l]);
      const displayMk = fmtMonth(mk);
      validLvls.forEach((lv, li) => {
        const x         = byMonth[mk][lv];
        const pillClass = lv === 'L1' ? 'pill-blue' : lv === 'L2' ? 'pill-amber' : 'pill-purple';
        html += `<tr>
          ${li === 0 ? `<td style="font-weight:700;vertical-align:middle;white-space:nowrap" rowspan="${validLvls.length}">${displayMk}</td>` : ''}
          <td><span class="pill ${pillClass}">${lv}</span></td>
          <td class="mono">${x.assigned}</td>
          <td class="mono" style="color:#d93025;font-weight:600">${x.open}</td>
          <td class="mono" style="color:#0f9d58">${x.completed}</td>
          <td class="mono" style="background:#f1f8e9">${x.b3}</td>
          <td class="mono" style="background:#fff8e1;${x.b11 > 0 ? 'color:#b45309;font-weight:600' : ''}">${x.b11}</td>
          <td class="mono" style="background:#fce4ec;${x.b16 > 0 ? 'color:#d93025;font-weight:700' : ''}">${x.b16}</td>
          <td class="mono" style="background:#ffebee;${x.b30 > 0 ? 'color:#b71c1c;font-weight:800' : ''}">${x.b30}</td>
        </tr>`;
      });
    });
    html += `</tbody></table></div></div>`;
    setSummaryHTML(html);
 
    // ── Bucket chart ──────────────────────────────────────────────────────
    // If 1 month: single-colour bars. If 2+ months: grouped bars per month.
    destroyChart(refBuckets);
    const bucketLabels = ['0-10', '11-15', '16-25', '26-30', '30+'];
 
    if (months.length === 1) {
      // Single month — simple coloured bars
      const openCases = d.filter((r) => r._open && r._ageing !== null);
      const bkts = { '0-10': 0, '11-15': 0, '16-25': 0, '26-30': 0, '30+': 0 };
      openCases.forEach((r) => {
        const a = r._ageing;
        if      (a <= 10) bkts['0-10']++;
        else if (a <= 15) bkts['11-15']++;
        else if (a <= 25) bkts['16-25']++;
        else if (a <= 30) bkts['26-30']++;
        else               bkts['30+']++;
      });
      refBuckets.current = new Chart(canvasBuckets.current, {
        type: 'bar',
        data: {
          labels: bucketLabels,
          datasets: [{
            label: `${fmtMonthShort(months[0])} Open Cases`,
            data: Object.values(bkts),
            backgroundColor: ['rgba(15,157,88,0.7)','rgba(245,158,11,0.65)','rgba(217,48,37,0.55)','rgba(217,48,37,0.75)','rgba(183,28,28,0.8)'],
            borderRadius: 6,
          }],
        },
        options: BASE_OPTS,
      });
    } else {
      // Multiple months — grouped bars, one dataset per month
      // Compute buckets per month
      const bktsByMonth = {};
      months.forEach((mk) => {
        bktsByMonth[mk] = { '0-10': 0, '11-15': 0, '16-25': 0, '26-30': 0, '30+': 0 };
      });
      d.filter((r) => r._open && r._ageing !== null).forEach((r) => {
        const mk = getMonthKey(r, CM); if (!mk || !bktsByMonth[mk]) return;
        const a = r._ageing;
        if      (a <= 10) bktsByMonth[mk]['0-10']++;
        else if (a <= 15) bktsByMonth[mk]['11-15']++;
        else if (a <= 25) bktsByMonth[mk]['16-25']++;
        else if (a <= 30) bktsByMonth[mk]['26-30']++;
        else               bktsByMonth[mk]['30+']++;
      });
 
      refBuckets.current = new Chart(canvasBuckets.current, {
        type: 'bar',
        data: {
          labels: bucketLabels,
          datasets: [...months].map((mk, i) => ({
            label: fmtMonthShort(mk),
            data: Object.values(bktsByMonth[mk]),
            backgroundColor: MONTH_COLORS[i % MONTH_COLORS.length],
            borderRadius: 5,
          })),
        },
        options: {
          ...BASE_OPTS,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 },
            },
          },
        },
      });
    }
 
    // ── Analyst ageing data per month ─────────────────────────────────────
    const buildAnalystRows = (rows) => {
      if (!CM.user) return [];
      const analystMap = {};
      rows.filter((r) => r._open && r._ageing !== null).forEach((r) => {
        const u = r[CM.user] || 'Unknown';
        if (isExcluded(u)) return; // skip excluded analysts
        if (!analystMap[u]) analystMap[u] = { total: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
        analystMap[u].total++;
        const a = r._ageing;
        if      (a <= 10) analystMap[u].b0++;
        else if (a <= 15) analystMap[u].b11++;
        else if (a <= 25) analystMap[u].b16++;
        else if (a <= 30) analystMap[u].b26++;
        else               analystMap[u].b30++;
      });
      return Object.entries(analystMap)
        .map(([u, x]) => ({ u, ...x }))
        .sort((a, b) => b.total - a.total);
    };
 
    // All-months combined
    setTatRows(buildAnalystRows(d));
 
    // Per-month
    const perMonth = {};
    months.forEach((mk) => {
      const monthRows = d.filter((r) => getMonthKey(r, CM) === mk);
      perMonth[mk] = buildAnalystRows(monthRows);
    });
    setTatRowsByMonth(perMonth);
 
    return () => { destroyChart(refBuckets); };
  }, [d, CM]);
 
  const hasData = rawData.length > 0;
 
  // Rows to display in table based on selected month filter
  const displayRows = useMemo(() => {
    if (selectedMonth === 'all') return tatRows;
    return tatRowsByMonth[selectedMonth] || [];
  }, [selectedMonth, tatRows, tatRowsByMonth]);
 
  return (
    <div className="page" id="export-ageing">
      <div className="topbar">
        <div>
          <h1>Ageing Analysis</h1>
          <p>Open case ageing buckets &amp; analyst ageing breakdown</p>
        </div>
        <div className="topbar-right">
          <ExportButton
            targetId="export-ageing"
            pageTitle="Ageing Analysis"
            subTitle={hasData ? `${d.length.toLocaleString()} cases loaded` : ''}
            disabled={!hasData}
          />
        </div>
      </div>
 
      {!hasData && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="ei">⏱</div>
          <p>Upload a CDR file to view ageing analysis</p>
        </div>
      )}
 
      {hasData && (
        <>
          {/* ── Summary table ───────────────────────────────────────────── */}
          <div className="sec-label">Ageing Summary (All Months Comparison)</div>
          <div style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: summaryHTML }} />
 
          {/* ── Bucket chart ─────────────────────────────────────────────── */}
          <div className="chart-row" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="card-hdr">
                <div>
                  <div className="card-title">Open Ageing Distribution</div>
                  <div className="card-sub">
                    {allMonthKeys.length >= 2
                      ? `Grouped by month — ${allMonthKeys.map(fmtMonthShort).join(' vs ')}`
                      : '0-10 · 11-15 · 16-25 · 26-30 · 30+ days'}
                  </div>
                </div>
              </div>
              <div style={{ height: 260, position: 'relative' }}>
                <canvas ref={canvasBuckets} />
              </div>
            </div>
          </div>
 
          {/* ── Analyst Ageing Table with month filter ───────────────────── */}
          <div className="sec-label">Analyst Ageing Detail</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-hdr">
              <div>
                <div className="card-title">Analysts with Ageing of cases</div>
                <div className="card-sub">Open cases by analyst · Ageing buckets breakdown</div>
              </div>
              {/* Month filter dropdown */}
              {allMonthKeys.length >= 2 && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    background: '#fff',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 12,
                    color: 'var(--text)',
                    fontFamily: "'Inter',sans-serif",
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: 150,
                    fontWeight: 600,
                  }}
                >
                  <option value="all">All Months Combined</option>
                  {/* Newest first in dropdown */}
                  {[...allMonthKeys].reverse().map((mk) => (
                    <option key={mk} value={mk}>{fmtMonth(mk)}</option>
                  ))}
                </select>
              )}
            </div>
 
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ background: '#fff8f0' }}>Analyst</th>
                    <th style={{ background: '#fff8f0' }}>Total Open</th>
                    <th style={{ background: '#e8f5e9' }}>0-10 days</th>
                    <th style={{ background: '#fff8f0' }}>11-15 days</th>
                    <th style={{ background: '#fff8f0' }}>16-25 days</th>
                    <th style={{ background: '#fff8f0' }}>26-30 days</th>
                    <th style={{ background: '#fff8f0' }}>30+ days</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((x, i) => (
                    <tr
                      key={x.u}
                      style={{ background: i % 2 === 0 ? '#fff8f2' : '#fff3ea' }}
                    >
                      <td style={{ fontWeight: 600 }}>{x.u}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{x.total}</td>
                      <td className="mono" style={{ color: '#0f9d58', fontWeight: 600 }}>{x.b0}</td>
                      <td className="mono" style={{ color: '#b45309', fontWeight: 600 }}>{x.b11}</td>
                      <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b16}</td>
                      <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b26}</td>
                      <td className="mono" style={{ color: '#b71c1c', fontWeight: 800 }}>{x.b30}</td>
                    </tr>
                  ))}
                  {displayRows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#8896ab' }}>
                        No open cases found for this selection
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// import { useEffect, useRef, useState } from 'react';
// import { Chart } from 'chart.js/auto';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import ChartCard from '../components/ChartCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';

// // ─── Helper: format month key "2026-03" → "March 2026" ───────────────────────
// const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// function formatMonthKey(mk) {
//   if (!mk) return mk;
//   // Matches YYYY-MM
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) {
//     const monthIdx = parseInt(m[2], 10) - 1;
//     const year = m[1];
//     return `${MONTH_NAMES[monthIdx] || mk} ${year}`;
//   }
//   return mk;
// }

// function destroyChart(chartRef) {
//   if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
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

// // ─── Analyst → Level mapping (only these analysts count for productivity) ─────
// const ANALYST_LEVEL_MAP = {
//   // L1
//   'mohini.vishwakarma': 'L1',
//   'abhishek.dhanda':    'L1',
//   // L2
//   'm-nitin1.thakur':    'L2',
//   'manisha.gupta':      'L2',
//   // L3
//   'manish.kumar':       'L3',
//   'upasana':            'L3',
//   'm-vishwa.singh':     'L3',
//   'ruchi1.kumari':      'L3',
//   'manish':             'L3',
// };

// // Fuzzy match: check if any key is a substring of the analyst name (lowercase)
// function getAnalystLevel(name) {
//   if (!name) return null;
//   const n = name.toLowerCase().trim();
//   // direct match first
//   if (ANALYST_LEVEL_MAP[n]) return ANALYST_LEVEL_MAP[n];
//   // partial match
//   for (const [key, lv] of Object.entries(ANALYST_LEVEL_MAP)) {
//     if (n.includes(key) || key.includes(n)) return lv;
//   }
//   return null; // excluded (Unknown, sandeep.kumar, others)
// }

// export default function Dashboard({ onUploadClick }) {
//   const { filteredData, rawData, fileName, activeSheetName, CM } = useData();
//   const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);

//   // Chart refs — only keeping: CPA, OpenAnalyst, DeadlineMissed
//   const refCPA            = useRef(null); const canvasCPA            = useRef(null);
//   const refOpenAnalyst    = useRef(null); const canvasOpenAnalyst    = useRef(null);
//   const refDeadlineMissed = useRef(null); const canvasDeadlineMissed = useRef(null);

//   const [kpis,   setKpis]   = useState({});
//   const [badges, setBadges] = useState({});

//   useEffect(() => {
//     if (!d.length) return;

//     const total    = d.length;
//     const closed   = d.filter((r) => r._closed).length;
//     const open     = d.filter((r) => r._open).length;
//     const analysts = new Set(d.map((r) => CM.user ? r[CM.user] : '').filter(Boolean)).size;
//     const l1 = d.filter((r) => r._level === 'L1').length;
//     const l2 = d.filter((r) => r._level === 'L2').length;
//     const l3 = d.filter((r) => r._level === 'L3').length;

//     // % Cases at L2 = L2 / Total * 100
//     const l2Pct    = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//     // % Cases at L3 = L3 / Total * 100
//     const l3Pct    = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//     // % L2→L3 escalation = L3 / (L2+L3) * 100
//     const l2l3pct  = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';

//     const aged     = d.filter((r) => r._ageing !== null).map((r) => r._ageing);
//     const avgAge   = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) : '—';

//     // Avg L1 cases per analyst (only L1 level cases / total analysts)
//     const avgL1PerAnalyst = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';

//     setKpis({
//       total: total.toLocaleString(),
//       closed: closed.toLocaleString(),
//       closedPct: `${total > 0 ? ((closed / total) * 100).toFixed(1) : 0}% closure rate`,
//       open: open.toLocaleString(),
//       openPct: `${total > 0 ? ((open / total) * 100).toFixed(1) : 0}% open rate`,
//       analysts,
//       l2Pct,
//       l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//       l3Pct,
//       l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//       l2l3pct,
//       l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//       avgAge: avgAge === '—' ? '—' : avgAge + 'd',
//       l1: l1.toLocaleString(),
//       l1sub: `${total > 0 ? ((l1 / total) * 100).toFixed(1) : 0}% of total`,
//       l2: l2.toLocaleString(),
//       l2sub: `${total > 0 ? ((l2 / total) * 100).toFixed(1) : 0}% of total`,
//       l3: l3.toLocaleString(),
//       l3sub: `${total > 0 ? ((l3 / total) * 100).toFixed(1) : 0}% of total`,
//       avgL1PerAnalyst,
//     });

//     // ── Cases per Analyst ──────────────────────────────
//     destroyChart(refCPA);
//     if (CM.user) {
//       const cntU = {};
//       d.forEach((r) => { const u = r[CM.user] || 'Unknown'; cntU[u] = (cntU[u] || 0) + 1; });
//       const sorted = Object.entries(cntU).sort((a, b) => b[1] - a[1]).slice(0, 15);
//       const avg    = sorted.reduce((s, [, v]) => s + v, 0) / sorted.length;
//       setBadges((b) => ({ ...b, cpa: sorted.length + ' analysts' }));
//       refCPA.current = new Chart(canvasCPA.current, {
//         type: 'bar',
//         data: {
//           labels: sorted.map((s) => s[0]),
//           datasets: [{
//             label: 'Cases',
//             data: sorted.map((s) => s[1]),
//             backgroundColor: sorted.map((s) =>
//               s[1] >= avg * 1.2 ? 'rgba(15,157,88,0.7)' : s[1] < avg * 0.8 ? 'rgba(217,48,37,0.7)' : 'rgba(26,115,232,0.7)'
//             ),
//             borderRadius: 5,
//           }],
//         },
//         options: BASE_OPTS,
//       });
//     }

//     // ── Open Cases by Analyst — exclude Unknown ────────
//     destroyChart(refOpenAnalyst);
//     if (CM.user) {
//       const openRows = d.filter((r) => r._open);
//       const openCnt  = {};
//       openRows.forEach((r) => {
//         const u = r[CM.user] || '';
//         if (!u || u.toLowerCase() === 'unknown') return; // exclude Unknown
//         openCnt[u] = (openCnt[u] || 0) + 1;
//       });
//       const sortedOpen = Object.entries(openCnt).sort((a, b) => b[1] - a[1]).slice(0, 12);
//       setBadges((b) => ({ ...b, openMonth: openRows.filter(r => (r[CM.user]||'').toLowerCase() !== 'unknown').length + ' open cases' }));
//       refOpenAnalyst.current = new Chart(canvasOpenAnalyst.current, {
//         type: 'bar',
//         data: {
//           labels: sortedOpen.map((s) => s[0]),
//           datasets: [{ label: 'Open', data: sortedOpen.map((s) => s[1]), backgroundColor: 'rgba(217,48,37,0.6)', borderRadius: 5 }],
//         },
//         options: { ...BASE_OPTS, indexAxis: 'y' },
//       });
//     }

//     // ── Deadline Missed by Analyst ─────────────────────
//     // L1 → breach > 10 days, L2 → breach > 17 days, L3 → breach > 30 days
//     destroyChart(refDeadlineMissed);
//     if (CM.user) {
//       const TAT_LIMIT = { L1: 10, L2: 17, L3: 30 };
//       const dmCnt = {};
//       d.filter((r) => r._open && r._ageing !== null).forEach((r) => {
//         const u   = r[CM.user] || '';
//         if (!u || u.toLowerCase() === 'unknown') return;
//         const lim = TAT_LIMIT[r._level];
//         if (!lim) return; // skip OTHER
//         if (r._ageing > lim) {
//           dmCnt[u] = (dmCnt[u] || 0) + 1;
//         }
//       });
//       const sortedDM = Object.entries(dmCnt).sort((a, b) => b[1] - a[1]).slice(0, 15);
//       setBadges((b) => ({ ...b, dm: sortedDM.reduce((s, [, v]) => s + v, 0) + ' breaches' }));
//       refDeadlineMissed.current = new Chart(canvasDeadlineMissed.current, {
//         type: 'bar',
//         data: {
//           labels: sortedDM.map((s) => s[0]),
//           datasets: [{
//             label: 'Deadline Missed',
//             data: sortedDM.map((s) => s[1]),
//             backgroundColor: 'rgba(217,48,37,0.7)',
//             borderRadius: 5,
//           }],
//         },
//         options: { ...BASE_OPTS, indexAxis: 'y' },
//       });
//     }

//     return () => {
//       destroyChart(refCPA);
//       destroyChart(refOpenAnalyst);
//       destroyChart(refDeadlineMissed);
//     };
//   }, [d, CM]);

//   const dateBadge = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
//   const hasData   = rawData.length > 0;

//   return (
//     <div className="page" id="export-dashboard">
//       {/* Top bar */}
//       <div className="topbar">
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p>{hasData ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}` : 'Upload CDR Excel/CSV to begin analysis'}</p>
//         </div>
//         <div className="topbar-right">
//           <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
//             {hasData ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}` : '📂 Upload CDR File'}
//           </button>
//           <div className="date-badge">{dateBadge}</div>
//           <ExportButton
//             targetId="export-dashboard"
//             pageTitle="Executive Dashboard"
//             subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>

//       {/* Filters — month labels formatted to "March 2026" style inside FilterBar */}
//       {hasData && <FilterBar formatMonthLabel={formatMonthKey} />}

//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>Upload a CDR Excel or CSV file to begin analysis</p>
//         </div>
//       )}

//       {hasData && (
//         <>
//           {/* ── KPI Row 1: Overview ─────────────────────── */}
//           <div className="kpi-grid k4">
//             <KpiCard label="Total Cases"       value={kpis.total}    sub="All loaded records"         icon="📋" variant="blue-v" />
//             <KpiCard label="Closed Cases"      value={kpis.closed}   sub={kpis.closedPct}             icon="✅" variant="green-v" />
//             <KpiCard label="Open Cases"        value={kpis.open}     sub={kpis.openPct}               icon="🔓" variant="red-v" />
//             <KpiCard label="Active Analysts"   value={kpis.analysts} sub="Unique users"               icon="👥" variant="amber-v" />
//           </div>

//           {/* ── KPI Row 2: Level %s + Escalation + Ageing ─ */}
//           <div className="kpi-grid k4">
//             <KpiCard label="% Cases at L2"         value={kpis.l2Pct}          sub={kpis.l2PctSub}               icon="📶" variant="orange-v" />
//             <KpiCard label="% Cases at L3"         value={kpis.l3Pct}          sub={kpis.l3PctSub}               icon="🔺" variant="pink-v" />
//             <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct}        sub={kpis.l2l3sub}                icon="⚡" variant="purple-v" />
//             <KpiCard label="Avg Ageing (days)"     value={kpis.avgAge}          sub="Created → Last Action"      icon="⏱" variant="teal-v" />
//           </div>

//           {/* ── KPI Row 3: L1/L2/L3 counts + Avg L1/analyst ─ */}
//           <div className="kpi-grid k4">
//             <KpiCard label="L1 Cases"              value={kpis.l1}              sub={kpis.l1sub}   icon="🎯" variant="blue-v" />
//             <KpiCard label="L2 Cases"              value={kpis.l2}              sub={kpis.l2sub}   icon="📊" variant="amber-v" />
//             <KpiCard label="L3 Cases"              value={kpis.l3}              sub={kpis.l3sub}   icon="🔺" variant="purple-v" />
//             <KpiCard label="Avg L1 Cases/Analyst"  value={kpis.avgL1PerAnalyst} sub="L1 cases per analyst" icon="📅" variant="green-v" />
//           </div>

//           ── Charts: Cases per Analyst + Open by Analyst ─
//           <div className="sec-label">Case Overview</div>
//           <div className="chart-row r2">
//             <ChartCard
//               title="Cases per Analyst"
//               sub="Total workload by analyst"
//               badge={badges.cpa}
//               badgeClass="badge-green"
//               height="h260"
//             >
//               <canvas ref={canvasCPA} />
//             </ChartCard>
//             <ChartCard
//               title="Open Cases by Analyst"
//               sub="Who has open cases pending (Unknown excluded)"
//               badge={badges.openMonth}
//               badgeClass="badge-red"
//               height="h260"
//             >
//               <canvas ref={canvasOpenAnalyst} />
//             </ChartCard>
//           </div>

//           {/* ── Deadline Missed chart ───────────────────── */}
//           <div className="sec-label">Deadline Missed</div>
//           <div className="chart-row">
//             <ChartCard
//               title="Deadline Missed by Analyst"
//               sub="L1 > 10 days · L2 > 17 days · L3 > 30 days (open cases only, Unknown excluded)"
//               badge={badges.dm}
//               badgeClass="badge-red"
//               height="h280"
//             >
//               <canvas ref={canvasDeadlineMissed} />
//             </ChartCard>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }









// Best single code 

// import { useEffect, useState } from 'react';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
 
// // ─── Helper: format month key "2026-03" → "March 2026" ───────────────────────
// const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// function formatMonthKey(mk) {
//   if (!mk) return mk;
//   // Matches YYYY-MM
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) {
//     const monthIdx = parseInt(m[2], 10) - 1;
//     const year = m[1];
//     return `${MONTH_NAMES[monthIdx] || mk} ${year}`;
//   }
//   return mk;
// }
 
// // ─── Analyst → Level mapping (only these analysts count for productivity) ─────
// const ANALYST_LEVEL_MAP = {
//   // L1
//   'mohini.vishwakarma': 'L1',
//   'abhishek.dhanda':    'L1',
//   // L2
//   'm-nitin1.thakur':    'L2',
//   'manisha.gupta':      'L2',
//   // L3
//   'manish.kumar':       'L3',
//   'upasana':            'L3',
//   'm-vishwa.singh':     'L3',
//   'ruchi1.kumari':      'L3',
//   'manish':             'L3',
// };
 
// // Fuzzy match: check if any key is a substring of the analyst name (lowercase)
// function getAnalystLevel(name) {
//   if (!name) return null;
//   const n = name.toLowerCase().trim();
//   // direct match first
//   if (ANALYST_LEVEL_MAP[n]) return ANALYST_LEVEL_MAP[n];
//   // partial match
//   for (const [key, lv] of Object.entries(ANALYST_LEVEL_MAP)) {
//     if (n.includes(key) || key.includes(n)) return lv;
//   }
//   return null; // excluded (Unknown, sandeep.kumar, others)
// }
 







// export default function Dashboard({ onUploadClick }) {
//   const { filteredData, rawData, fileName, activeSheetName, CM } = useData();
//   const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);
 
//   const [kpis, setKpis] = useState({});
 
//   useEffect(() => {
//     if (!d.length) return;
 
//     const total    = d.length;
//     const closed   = d.filter((r) => r._closed).length;
//     const open     = d.filter((r) => r._open).length;
//     const analysts = new Set(d.map((r) => CM.user ? r[CM.user] : '').filter(Boolean)).size;
//     const l1 = d.filter((r) => r._level === 'L1').length;
//     const l2 = d.filter((r) => r._level === 'L2').length;
//     const l3 = d.filter((r) => r._level === 'L3').length;
 
//     // % Cases at L2 = L2 / Total * 100
//     const l2Pct    = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//     // % Cases at L3 = L3 / Total * 100
//     const l3Pct    = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//     // % L2→L3 escalation = L3 / (L2+L3) * 100
//     const l2l3pct  = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
 
//     const aged     = d.filter((r) => r._ageing !== null).map((r) => r._ageing);
//     const avgAge   = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) : '—';
 
//     // Avg L1 cases per analyst (only L1 level cases / total analysts)
//     const avgL1PerAnalyst = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
 
//     setKpis({
//       total: total.toLocaleString(),
//       closed: closed.toLocaleString(),
//       closedPct: `${total > 0 ? ((closed / total) * 100).toFixed(1) : 0}% closure rate`,
//       open: open.toLocaleString(),
//       openPct: `${total > 0 ? ((open / total) * 100).toFixed(1) : 0}% open rate`,
//       analysts,
//       l2Pct,
//       l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//       l3Pct,
//       l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//       l2l3pct,
//       l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//       avgAge: avgAge === '—' ? '—' : avgAge + 'd',
//       l1: l1.toLocaleString(),
//       l1sub: `${total > 0 ? ((l1 / total) * 100).toFixed(1) : 0}% of total`,
//       l2: l2.toLocaleString(),
//       l2sub: `${total > 0 ? ((l2 / total) * 100).toFixed(1) : 0}% of total`,
//       l3: l3.toLocaleString(),
//       l3sub: `${total > 0 ? ((l3 / total) * 100).toFixed(1) : 0}% of total`,
//       avgL1PerAnalyst,
//     });
 
 
//   }, [d, CM]);
 
//   const dateBadge = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
//   const hasData   = rawData.length > 0;
 
//   return (
//     <div className="page" id="export-dashboard">
//       {/* Top bar */}
//       <div className="topbar">
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p>{hasData ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}` : 'Upload CDR Excel/CSV to begin analysis'}</p>
//         </div>
//         <div className="topbar-right">
//           <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
//             {hasData ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}` : '📂 Upload CDR File'}
//           </button>
//           <div className="date-badge">{dateBadge}</div>
//           <ExportButton
//             targetId="export-dashboard"
//             pageTitle="Executive Dashboard"
//             subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>
 
//       {/* Filters — month labels formatted to "March 2026" style inside FilterBar */}
//       {hasData && <FilterBar formatMonthLabel={formatMonthKey} />}
 
//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>Upload a CDR Excel or CSV file to begin analysis</p>
//         </div>
//       )}
 
//       {hasData && (
//         <>
//           {/* ── KPI Row 1: Overview ─────────────────────── */}
//           <div className="kpi-grid k4">
//             <KpiCard label="Total Cases"       value={kpis.total}    sub="All loaded records"         icon="📋" variant="blue-v" />
//             <KpiCard label="Closed Cases"      value={kpis.closed}   sub={kpis.closedPct}             icon="✅" variant="green-v" />
//             <KpiCard label="Open Cases"        value={kpis.open}     sub={kpis.openPct}               icon="🔓" variant="red-v" />
//             <KpiCard label="Active Analysts"   value={kpis.analysts} sub="Unique users"               icon="👥" variant="amber-v" />
//           </div>
 
//           {/* ── KPI Row 2: Level %s + Escalation + Ageing ─ */}
//           <div className="kpi-grid k4">
//             <KpiCard label="% Cases at L2"         value={kpis.l2Pct}          sub={kpis.l2PctSub}               icon="📶" variant="orange-v" />
//             <KpiCard label="% Cases at L3"         value={kpis.l3Pct}          sub={kpis.l3PctSub}               icon="🔺" variant="pink-v" />
//             <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct}        sub={kpis.l2l3sub}                icon="⚡" variant="purple-v" />
//             <KpiCard label="Avg Ageing (days)"     value={kpis.avgAge}          sub="Created → Last Action"      icon="⏱" variant="teal-v" />
//           </div>
 
//           {/* ── KPI Row 3: L1/L2/L3 counts + Avg L1/analyst ─ */}
//           <div className="kpi-grid k4">
//             <KpiCard label="L1 Cases"              value={kpis.l1}              sub={kpis.l1sub}   icon="🎯" variant="blue-v" />
//             <KpiCard label="L2 Cases"              value={kpis.l2}              sub={kpis.l2sub}   icon="📊" variant="amber-v" />
//             <KpiCard label="L3 Cases"              value={kpis.l3}              sub={kpis.l3sub}   icon="🔺" variant="purple-v" />
//             <KpiCard label="Avg L1 Cases/Analyst"  value={kpis.avgL1PerAnalyst} sub="L1 cases per analyst" icon="📅" variant="green-v" />
//           </div>
 
 
//         </>
//       )}
//     </div>
//   );
// }
















// for both ppsl online offline 3 months previs=is all tabs

// import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import { Chart } from 'chart.js/auto';
// import * as XLSX from 'xlsx';
// import KpiCard from '../components/KpiCard';
// import ExportButton from '../components/ExportButton';
 
// // ─── Month helpers ────────────────────────────────────────────────────────────
// const MONTH_NAMES = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];
 
// /** "2026-03" → "March 2026" */
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
//   return mk;
// }
 
// /** "2026-03" → "March" (short) */
// function fmtMonthShort(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return MONTH_NAMES[parseInt(m[2], 10) - 1] || mk;
//   return mk;
// }
 
// // ─── Column detection ─────────────────────────────────────────────────────────
// function detectCM(headers) {
//   const find = (...kws) =>
//     headers.find((h) =>
//       kws.some((k) =>
//         h.toLowerCase().replace(/[\s_]/g, '').includes(k.toLowerCase().replace(/[\s_]/g, ''))
//       )
//     );
//   return {
//     user:        find('user_name','username','analyst','user'),
//     level:       find('investigation_level','investigationlevel','level','inv_level'),
//     status:      find('disposition_status','disposition_statu','dispositionstatus','status','disposition'),
//     custType:    find('customer_type','custtype','clienttype'),
//     custName:    find('customer_name','custname','clientname'),
//     custId:      find('customer_id','custid','clientid'),
//     createdDate: find('created_date','createdate','creationdate','createdat','opendate'),
//     lastAction:  find('last_action_date','lastactiondate','lastaction','updateddate','closeddate'),
//     comments:    find('comments','comment','remarks','notes'),
//     caseId:      find('case_id','caseid','casenumber','ticketid','id'),
//     month:       find('month1','month','reportingmonth','period'),
//     str:         find('raise_str','raisedstr','strcase','str'),
//   };
// }
 
// // ─── Date parser ──────────────────────────────────────────────────────────────
// function pDate(val) {
//   if (!val || val === '') return null;
//   if (val instanceof Date) return isNaN(val) ? null : val;
//   if (/^\d{13,}$/.test(val)) { const d = new Date(parseInt(val)); return isNaN(d) ? null : d; }
//   if (/^\d{5,6}$/.test(val)) {
//     const d = new Date((parseInt(val) - 25569) * 86400 * 1000);
//     return isNaN(d) ? null : d;
//   }
//   let m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
//   if (m) {
//     const yr = m[3].length === 2 ? '20' + m[3] : m[3];
//     const d  = new Date(`${yr}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
//     if (!isNaN(d)) return d;
//   }
//   m = val.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
//   if (m) { const d = new Date(`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`); if (!isNaN(d)) return d; }
//   const d = new Date(val);
//   return isNaN(d) ? null : d;
// }
 
// // ─── Row enrichment ───────────────────────────────────────────────────────────
// function enrichRow(r, cm) {
//   const created = cm.createdDate ? pDate(r[cm.createdDate]) : null;
//   const lastAct = cm.lastAction  ? pDate(r[cm.lastAction])  : null;
//   let ageing = null;
//   if (created && lastAct) { ageing = Math.round((lastAct - created) / 86400000); if (ageing < 0) ageing = 0; }
//   const lvlRaw    = (r[cm.level]  || '').toUpperCase();
//   const lvl       = lvlRaw.includes('L3') ? 'L3' : lvlRaw.includes('L2') ? 'L2' : lvlRaw.includes('L1') ? 'L1' : 'OTHER';
//   const statusRaw = (r[cm.status] || '').toLowerCase();
//   const isClosed  = statusRaw.includes('close') || statusRaw.includes('complet');
//   const isOpen    = statusRaw.includes('open') || (!isClosed && statusRaw !== '');
//   const strVal    = cm.str ? (r[cm.str] || '').toLowerCase() : '';
//   const isSTR     = strVal.includes('str') || strVal === 'yes' || statusRaw.includes('str') || statusRaw.includes('raise str');
//   return { ...r, _created: created, _lastAct: lastAct, _ageing: ageing, _level: lvl, _closed: isClosed, _open: isOpen, _str: isSTR };
// }
 
// // ─── Month key from row ───────────────────────────────────────────────────────
// function getRowMonthKey(r, cm) {
//   if (cm.month && r[cm.month]) return String(r[cm.month]).trim();
//   if (r._created) return r._created.toISOString().slice(0, 7);
//   if (r._lastAct) return r._lastAct.toISOString().slice(0, 7);
//   return null;
// }
 
// // ─── CSV line splitter ────────────────────────────────────────────────────────
// function splitCSV(line) {
//   const result = []; let curr = '', inQ = false;
//   for (const c of line) {
//     if (c === '"') inQ = !inQ;
//     else if (c === ',' && !inQ) { result.push(curr); curr = ''; }
//     else curr += c;
//   }
//   result.push(curr);
//   return result;
// }
 
// // ─── File parser ──────────────────────────────────────────────────────────────
// function parseFile(file) {
//   return new Promise((resolve, reject) => {
//     const n = file.name.toLowerCase();
//     if (n.endsWith('.csv')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const lines   = e.target.result.trim().split('\n').filter((l) => l.trim());
//           const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
//           const cm      = detectCM(headers);
//           const rows    = lines.slice(1)
//             .map((l) => { const vals = splitCSV(l); return headers.reduce((o, h, i) => { o[h] = (vals[i] || '').replace(/"/g, '').trim(); return o; }, {}); })
//             .filter((r) => Object.values(r).some((v) => v));
//           resolve({ rows: rows.map((r) => enrichRow(r, cm)), cm, fileName: file.name });
//         } catch (err) { reject(err); }
//       };
//       reader.onerror = reject;
//       reader.readAsText(file);
//     } else if (n.endsWith('.xls') || n.endsWith('.xlsx')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const wb      = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
//           const sn      = wb.SheetNames[0];
//           const json    = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '' });
//           if (!json || json.length < 2) { reject(new Error('Sheet is empty')); return; }
//           const headers = json[0].map((h) => String(h || '').trim()).filter(Boolean);
//           const cm      = detectCM(headers);
//           const rows    = json.slice(1)
//             .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
//             .map((r) => headers.reduce((o, h, i) => { o[h] = String(r[i] == null ? '' : r[i]).trim(); return o; }, {}));
//           resolve({ rows: rows.map((r) => enrichRow(r, cm)), cm, fileName: file.name });
//         } catch (err) { reject(err); }
//       };
//       reader.onerror = reject;
//       reader.readAsArrayBuffer(file);
//     } else {
//       reject(new Error('Unsupported file type. Use CSV, XLS or XLSX.'));
//     }
//   });
// }
 
// // ─── KPI computation for a set of rows ───────────────────────────────────────
// function computeKPIs(rows, cm) {
//   if (!rows || !rows.length) return null;
//   const total    = rows.length;
//   const closed   = rows.filter((r) => r._closed).length;
//   const open     = rows.filter((r) => r._open).length;
//   const str      = rows.filter((r) => r._str).length;
//   const analysts = new Set(rows.map((r) => cm.user ? r[cm.user] : '').filter(Boolean)).size;
//   const l1 = rows.filter((r) => r._level === 'L1').length;
//   const l2 = rows.filter((r) => r._level === 'L2').length;
//   const l3 = rows.filter((r) => r._level === 'L3').length;
//   const l2Pct   = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//   const l3Pct   = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//   const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
//   const aged    = rows.filter((r) => r._ageing !== null).map((r) => r._ageing);
//   const avgAge  = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) + 'd' : '—';
//   const avgL1   = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
//   return {
//     total: total.toLocaleString(),
//     closed: closed.toLocaleString(), closedPct: `${((closed / total) * 100).toFixed(1)}% closure rate`,
//     open:   open.toLocaleString(),   openPct:   `${((open   / total) * 100).toFixed(1)}% open rate`,
//     str:    str.toLocaleString(),    strPct:    `${((str    / total) * 100).toFixed(1)}% of total cases`,
//     analysts,
//     l2Pct, l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l3Pct, l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l2l3pct, l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//     avgAge,
//     l1: l1.toLocaleString(), l1sub: `${((l1 / total) * 100).toFixed(1)}% of total`,
//     l2: l2.toLocaleString(), l2sub: `${((l2 / total) * 100).toFixed(1)}% of total`,
//     l3: l3.toLocaleString(), l3sub: `${((l3 / total) * 100).toFixed(1)}% of total`,
//     avgL1,
//     // raw numbers for comparison chart
//     _total: total, _closed: closed, _open: open, _l1: l1, _l2: l2, _l3: l3,
//   };
// }
 
// // ─── KPI card section (12 cards, 3 rows of 4) ─────────────────────────────────
// function KPISection({ kpis }) {
//   if (!kpis) return null;
//   return (
//     <>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="Total Cases"      value={kpis.total}    sub="All loaded records"         icon="📋" variant="blue-v" />
//         <KpiCard label="Closed Cases"     value={kpis.closed}   sub={kpis.closedPct}             icon="✅" variant="green-v" />
//         <KpiCard label="Open Cases"       value={kpis.open}     sub={kpis.openPct}               icon="🔓" variant="red-v" />
//         <KpiCard label="Active Analysts"  value={kpis.analysts} sub="Unique users"               icon="👥" variant="amber-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="% Cases at L2"         value={kpis.l2Pct}   sub={kpis.l2PctSub}          icon="📶" variant="orange-v" />
//         <KpiCard label="% Cases at L3"         value={kpis.l3Pct}   sub={kpis.l3PctSub}          icon="🔺" variant="pink-v" />
//         <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct} sub={kpis.l2l3sub}           icon="⚡" variant="purple-v" />
//         <KpiCard label="Avg Ageing (days)"      value={kpis.avgAge}  sub="Created → Last Action"  icon="⏱" variant="teal-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 20 }}>
//         <KpiCard label="L1 Cases"        value={kpis.l1}  sub={kpis.l1sub}   icon="🎯" variant="blue-v" />
//         <KpiCard label="L2 Cases"        value={kpis.l2}  sub={kpis.l2sub}   icon="📊" variant="amber-v" />
//         <KpiCard label="L3 Cases"        value={kpis.l3}  sub={kpis.l3sub}   icon="🔺" variant="purple-v" />
//         <KpiCard label="Total STR Cases" value={kpis.str} sub={kpis.strPct}  icon="🚨" variant="red-v" />
//       </div>
//     </>
//   );
// }
 
// // ─── Month block header ───────────────────────────────────────────────────────
// function MonthHeader({ monthKey, isLatest, sources }) {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 4 }}>
//       <div style={{
//         background: isLatest ? '#1a73e8' : '#f0f2f5',
//         color: isLatest ? '#fff' : '#4a5568',
//         borderRadius: 10, padding: '5px 16px',
//         fontSize: 14, fontWeight: 800, flexShrink: 0,
//         letterSpacing: '-0.01em',
//       }}>
//         {fmtMonth(monthKey)}
//       </div>
//       {isLatest && (
//         <span style={{
//           background: '#e6f4ea', color: '#0f9d58',
//           fontSize: 10, fontWeight: 700, padding: '2px 8px',
//           borderRadius: 20, border: '1px solid #34a853',
//         }}>
//           CURRENT MONTH
//         </span>
//       )}
//       <div style={{ fontSize: 11, color: '#8896ab', flexShrink: 0 }}>
//         {sources.join(' · ')}
//       </div>
//       <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
//     </div>
//   );
// }
 
// // ─── Upload button ────────────────────────────────────────────────────────────
// function UploadBtn({ loaded, color, label, shortName, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       title={loaded ? shortName : label}
//       style={{
//         display: 'flex', alignItems: 'center', gap: 6,
//         background: loaded ? '#0f9d58' : color,
//         border: 'none', borderRadius: 8, padding: '8px 14px',
//         cursor: 'pointer', fontSize: 11, color: '#fff', fontWeight: 600,
//         fontFamily: "'Inter',sans-serif", transition: 'all 0.2s',
//         whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 200,
//         overflow: 'hidden', textOverflow: 'ellipsis',
//       }}
//     >
//       {loaded ? `✅ ${shortName}` : `📂 ${label}`}
//     </button>
//   );
// }
 
// // ─── Comparison chart ─────────────────────────────────────────────────────────
// function ComparisonChart({ monthBlocks }) {
//   const canvasRef = useRef(null);
//   const chartRef  = useRef(null);
 
//   useEffect(() => {
//     if (!canvasRef.current || monthBlocks.length < 2) return;
//     if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
 
//     const labels  = monthBlocks.map((b) => fmtMonthShort(b.monthKey));
//     const totals  = monthBlocks.map((b) => b.kpis._total);
//     const closed  = monthBlocks.map((b) => b.kpis._closed);
//     const open    = monthBlocks.map((b) => b.kpis._open);
 
//     chartRef.current = new Chart(canvasRef.current, {
//       type: 'bar',
//       data: {
//         labels,
//         datasets: [
//           { label: 'Total',  data: totals, backgroundColor: 'rgba(26,115,232,0.7)',  borderRadius: 5, stack: 'no' },
//           { label: 'Closed', data: closed, backgroundColor: 'rgba(15,157,88,0.7)',   borderRadius: 5, stack: 'no' },
//           { label: 'Open',   data: open,   backgroundColor: 'rgba(217,48,37,0.65)',  borderRadius: 5, stack: 'no' },
//         ],
//       },
//       options: {
//         responsive: true, maintainAspectRatio: false,
//         plugins: {
//           legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 14 } },
//         },
//         scales: {
//           x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 11 } } },
//           y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 11 } } },
//         },
//       },
//     });
//     return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
//   }, [monthBlocks]);
 
//   if (monthBlocks.length < 2) return null;
 
//   return (
//     <div className="card" style={{ marginTop: 8, marginBottom: 20 }}>
//       <div className="card-hdr">
//         <div>
//           <div className="card-title">Month-on-Month Comparison</div>
//           <div className="card-sub">Total · Closed · Open cases across all months</div>
//         </div>
//       </div>
//       <div style={{ height: 280, position: 'relative' }}>
//         <canvas ref={canvasRef} />
//       </div>
//     </div>
//   );
// }
 
// // ─── Business section (Online or Offline) ────────────────────────────────────
// // Shows month blocks in reverse-chronological order (latest first)
// function BusinessSection({ label, icon, color, bgColor, slots, monthBlocks }) {
//   const hasAny = slots.some((s) => s.data !== null);
//   if (!hasAny) return null;
 
//   return (
//     <div style={{ marginBottom: 12 }}>
//       {/* Business type header */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
//         <div style={{
//           background: bgColor, color, borderRadius: 10, padding: '6px 16px',
//           fontSize: 13, fontWeight: 700, flexShrink: 0,
//         }}>
//           {icon} {label}
//         </div>
//         <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
//       </div>
 
//       {/* Month blocks — latest first */}
//       {monthBlocks.map((block, idx) => (
//         <div key={block.monthKey}>
//           <MonthHeader
//             monthKey={block.monthKey}
//             isLatest={idx === 0}
//             sources={block.sources}
//           />
//           <KPISection kpis={block.kpis} />
//         </div>
//       ))}
 
//       {/* Comparison chart — only if 2+ months */}
//       {monthBlocks.length >= 2 && (
//         <>
//           <div className="sec-label">Month-on-Month Comparison</div>
//           <ComparisonChart monthBlocks={monthBlocks} />
//         </>
//       )}
//     </div>
//   );
// }
 
// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN DASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════════
 
// // Slot configs: { id, label, slotLabel }
// const ONLINE_SLOTS  = [
//   { id: 'onCurr', label: 'Current Month Online',           slotLabel: 'Current Month' },
//   { id: 'onPrev', label: 'Previous Month Online',          slotLabel: 'Prev Month'    },
//   { id: 'onPrev2',label: '2 Months Previous Online',       slotLabel: '2 Months Ago'  },
// ];
// const OFFLINE_SLOTS = [
//   { id: 'offCurr', label: 'Current Month Offline',         slotLabel: 'Current Month' },
//   { id: 'offPrev', label: 'Previous Month Offline',        slotLabel: 'Prev Month'    },
//   { id: 'offPrev2',label: '2 Months Previous Offline',     slotLabel: '2 Months Ago'  },
// ];
 
// /**
//  * Given an array of slot data objects ({rows, cm, fileName}|null),
//  * merge all rows, detect distinct month keys, then return month blocks
//  * sorted newest-first, each with their KPIs.
//  */
// function buildMonthBlocks(slotDataArr, slotConfigs) {
//   // Pool all rows with their source label
//   const allRows = [];
//   slotDataArr.forEach((data, idx) => {
//     if (!data) return;
//     data.rows.forEach((r) => {
//       const mk = getRowMonthKey(r, data.cm);
//       allRows.push({ ...r, _mk: mk, _cm: data.cm, _source: slotConfigs[idx].slotLabel, _fileName: data.fileName });
//     });
//   });
 
//   if (!allRows.length) return [];
 
//   // Group by month key
//   const byMonth = {};
//   allRows.forEach((r) => {
//     const mk = r._mk || 'Unknown';
//     if (!byMonth[mk]) byMonth[mk] = { rows: [], sources: new Set(), cm: r._cm };
//     byMonth[mk].rows.push(r);
//     byMonth[mk].sources.add(r._fileName);
//   });
 
//   // Sort month keys newest first
//   const sortedKeys = Object.keys(byMonth)
//     .filter((k) => k !== 'Unknown')
//     .sort()
//     .reverse();
 
//   if (byMonth['Unknown']) sortedKeys.push('Unknown');
 
//   return sortedKeys.map((mk) => ({
//     monthKey: mk,
//     kpis: computeKPIs(byMonth[mk].rows, byMonth[mk].cm),
//     sources: [...byMonth[mk].sources],
//   }));
// }
 
// export default function Dashboard() {
//   // 6 slots total: 3 online + 3 offline
//   const [slots, setSlots] = useState({
//     onCurr: null, onPrev: null, onPrev2: null,
//     offCurr: null, offPrev: null, offPrev2: null,
//   });
 
//   // Hidden file input refs
//   const inputRefs = {
//     onCurr:  useRef(null),
//     onPrev:  useRef(null),
//     onPrev2: useRef(null),
//     offCurr: useRef(null),
//     offPrev: useRef(null),
//     offPrev2:useRef(null),
//   };
 
//   const handleFile = useCallback((file, slotId) => {
//     if (!file) return;
//     parseFile(file)
//       .then((data) => setSlots((prev) => ({ ...prev, [slotId]: data })))
//       .catch((err) => alert('Error reading file: ' + err.message));
//   }, []);
 
//   const shortName = (name) => !name ? '' : name.length > 16 ? name.slice(0, 14) + '…' : name;
 
//   // Build month blocks for online and offline independently
//   const onlineMonthBlocks  = useMemo(() => buildMonthBlocks(
//     ONLINE_SLOTS.map((s)  => slots[s.id]),
//     ONLINE_SLOTS
//   ), [slots.onCurr, slots.onPrev, slots.onPrev2]);
 
//   const offlineMonthBlocks = useMemo(() => buildMonthBlocks(
//     OFFLINE_SLOTS.map((s) => slots[s.id]),
//     OFFLINE_SLOTS
//   ), [slots.offCurr, slots.offPrev, slots.offPrev2]);
 
//   const hasOnline  = onlineMonthBlocks.length  > 0;
//   const hasOffline = offlineMonthBlocks.length > 0;
//   const hasAny     = hasOnline || hasOffline;
 
//   const dateBadge = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
 
//   // Upload button group renderer
//   const UploadGroup = ({ slotConfigs, colorBase }) => (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
//       {slotConfigs.map((cfg, i) => {
//         const data      = slots[cfg.id];
//         const colors    = [colorBase, colorBase + 'cc', colorBase + '99'];
//         const hexColors = colorBase === 'online'
//           ? ['#1a73e8', '#1a60c0', '#1a4e98']
//           : ['#7c3aed', '#6528d4', '#5020bb'];
//         return (
//           <div key={cfg.id}>
//             <input
//               ref={inputRefs[cfg.id]}
//               type="file"
//               accept=".csv,.xls,.xlsx"
//               style={{ display: 'none' }}
//               onChange={(e) => { handleFile(e.target.files[0], cfg.id); e.target.value = ''; }}
//             />
//             <UploadBtn
//               loaded={!!data}
//               color={hexColors[i]}
//               label={cfg.label}
//               shortName={shortName(data?.fileName || '')}
//               onClick={() => inputRefs[cfg.id].current?.click()}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
 
//   return (
//     <div className="page" id="export-dashboard">
 
//       {/* ── Top bar ──────────────────────────────────────────────────────── */}
//       <div className="topbar" style={{ alignItems: 'flex-start' }}>
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
//             {hasAny
//               ? [
//                   hasOnline  && `🌐 Online: ${onlineMonthBlocks.reduce((s, b) => s + b.kpis._total, 0).toLocaleString()} cases`,
//                   hasOffline && `🏪 Offline: ${offlineMonthBlocks.reduce((s, b) => s + b.kpis._total, 0).toLocaleString()} cases`,
//                 ].filter(Boolean).join(' · ')
//               : 'Upload files using the buttons on the right to begin'}
//           </p>
//         </div>
 
//         <div className="topbar-right" style={{ alignItems: 'flex-start', gap: 14 }}>
//           {/* Online upload group */}
//           <div>
//             <div style={{ fontSize: 10, color: '#8896ab', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
//               🌐 Online Business
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
//               {ONLINE_SLOTS.map((cfg, i) => {
//                 const data = slots[cfg.id];
//                 const hexColors = ['#1a73e8', '#1557b0', '#0d3f80'];
//                 return (
//                   <div key={cfg.id}>
//                     <input
//                       ref={inputRefs[cfg.id]}
//                       type="file"
//                       accept=".csv,.xls,.xlsx"
//                       style={{ display: 'none' }}
//                       onChange={(e) => { handleFile(e.target.files[0], cfg.id); e.target.value = ''; }}
//                     />
//                     <UploadBtn
//                       loaded={!!data}
//                       color={hexColors[i]}
//                       label={cfg.label}
//                       shortName={shortName(data?.fileName || '')}
//                       onClick={() => inputRefs[cfg.id].current?.click()}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
 
//           {/* Offline upload group */}
//           <div>
//             <div style={{ fontSize: 10, color: '#8896ab', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
//               🏪 Offline Business
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
//               {OFFLINE_SLOTS.map((cfg, i) => {
//                 const data = slots[cfg.id];
//                 const hexColors = ['#7c3aed', '#6025cc', '#4a18a8'];
//                 return (
//                   <div key={cfg.id}>
//                     <input
//                       ref={inputRefs[cfg.id]}
//                       type="file"
//                       accept=".csv,.xls,.xlsx"
//                       style={{ display: 'none' }}
//                       onChange={(e) => { handleFile(e.target.files[0], cfg.id); e.target.value = ''; }}
//                     />
//                     <UploadBtn
//                       loaded={!!data}
//                       color={hexColors[i]}
//                       label={cfg.label}
//                       shortName={shortName(data?.fileName || '')}
//                       onClick={() => inputRefs[cfg.id].current?.click()}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
 
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 18 }}>
//             <div className="date-badge">{dateBadge}</div>
//             <ExportButton
//               targetId="export-dashboard"
//               pageTitle="Executive Dashboard"
//               subTitle="Monthly Business Report"
//               disabled={!hasAny}
//             />
//           </div>
//         </div>
//       </div>
 
//       {/* ── Empty state ──────────────────────────────────────────────────── */}
//       {!hasAny && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>
//             Upload files using the <strong style={{ color: '#1a73e8' }}>Online Business</strong> or{' '}
//             <strong style={{ color: '#7c3aed' }}>Offline Business</strong> buttons above.<br />
//             You can upload up to 3 months for each — current, previous, and 2 months ago.
//           </p>
//         </div>
//       )}
 
//       {/* ════════════════════════════════════════════════════════════════════
//            ONLINE BUSINESS — month blocks newest first
//       ═════════════════════════════════════════════════════════════════════ */}
//       {hasOnline && (
//         <BusinessSection
//           label="Online Business"
//           icon="🌐"
//           color="#1a73e8"
//           bgColor="#e8f0fe"
//           slots={ONLINE_SLOTS.map((s) => slots[s.id])}
//           monthBlocks={onlineMonthBlocks}
//         />
//       )}
 
//       {/* ════════════════════════════════════════════════════════════════════
//            OFFLINE BUSINESS — month blocks newest first
//       ═════════════════════════════════════════════════════════════════════ */}
//       {hasOffline && (
//         <div style={{ marginTop: hasOnline ? 16 : 0 }}>
//           <BusinessSection
//             label="Offline Business"
//             icon="🏪"
//             color="#7c3aed"
//             bgColor="#ede9fe"
//             slots={OFFLINE_SLOTS.map((s) => slots[s.id])}
//             monthBlocks={offlineMonthBlocks}
//           />
//         </div>
//       )}
 
//     </div>
//   );
// }
















// import { useEffect, useState, useMemo, useRef } from 'react';
// import { Chart } from 'chart.js/auto';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';
 
// // ─── Month helpers ────────────────────────────────────────────────────────────
// const MONTH_NAMES = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];
 
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
//   return mk;
// }
 
// function fmtMonthShort(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return MONTH_NAMES[parseInt(m[2], 10) - 1] || mk;
//   return mk;
// }
 
// // Format filter dropdown label: "2026-03" → "March"
// function fmtMonthLabel(mk) {
//   return fmtMonthShort(mk) || mk;
// }
 
// // ─── KPI computation ──────────────────────────────────────────────────────────
// function computeKPIs(rows, cm) {
//   if (!rows || !rows.length) return null;
//   const total    = rows.length;
//   const closed   = rows.filter((r) => r._closed).length;
//   const open     = rows.filter((r) => r._open).length;
//   const str      = rows.filter((r) => r._str).length;
//   const analysts = new Set(rows.map((r) => cm?.user ? r[cm.user] : '').filter(Boolean)).size;
//   const l1 = rows.filter((r) => r._level === 'L1').length;
//   const l2 = rows.filter((r) => r._level === 'L2').length;
//   const l3 = rows.filter((r) => r._level === 'L3').length;
//   const l2Pct   = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//   const l3Pct   = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//   const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
//   const aged    = rows.filter((r) => r._ageing !== null).map((r) => r._ageing);
//   const avgAge  = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) + 'd' : '—';
//   const avgL1   = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
//   return {
//     total: total.toLocaleString(),
//     closed: closed.toLocaleString(), closedPct: `${((closed / total) * 100).toFixed(1)}% closure rate`,
//     open:   open.toLocaleString(),   openPct:   `${((open   / total) * 100).toFixed(1)}% open rate`,
//     str:    str.toLocaleString(),    strPct:    `${((str    / total) * 100).toFixed(1)}% of total cases`,
//     analysts,
//     l2Pct, l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l3Pct, l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l2l3pct, l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//     avgAge,
//     l1: l1.toLocaleString(), l1sub: `${((l1 / total) * 100).toFixed(1)}% of total`,
//     l2: l2.toLocaleString(), l2sub: `${((l2 / total) * 100).toFixed(1)}% of total`,
//     l3: l3.toLocaleString(), l3sub: `${((l3 / total) * 100).toFixed(1)}% of total`,
//     avgL1,
//     _total: total, _closed: closed, _open: open, _l1: l1, _l2: l2, _l3: l3,
//   };
// }
 
// // ─── 12 KPI cards ─────────────────────────────────────────────────────────────
// function KPISection({ kpis }) {
//   if (!kpis) return null;
//   return (
//     <>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="Total Cases"      value={kpis.total}    sub="All loaded records"        icon="📋" variant="blue-v" />
//         <KpiCard label="Closed Cases"     value={kpis.closed}   sub={kpis.closedPct}            icon="✅" variant="green-v" />
//         <KpiCard label="Open Cases"       value={kpis.open}     sub={kpis.openPct}              icon="🔓" variant="red-v" />
//         <KpiCard label="Active Analysts"  value={kpis.analysts} sub="Unique users"              icon="👥" variant="amber-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="% Cases at L2"         value={kpis.l2Pct}   sub={kpis.l2PctSub}         icon="📶" variant="orange-v" />
//         <KpiCard label="% Cases at L3"         value={kpis.l3Pct}   sub={kpis.l3PctSub}         icon="🔺" variant="pink-v" />
//         <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct} sub={kpis.l2l3sub}          icon="⚡" variant="purple-v" />
//         <KpiCard label="Avg Ageing (days)"      value={kpis.avgAge}  sub="Created → Last Action" icon="⏱" variant="teal-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 20 }}>
//         <KpiCard label="L1 Cases"        value={kpis.l1}  sub={kpis.l1sub}  icon="🎯" variant="blue-v" />
//         <KpiCard label="L2 Cases"        value={kpis.l2}  sub={kpis.l2sub}  icon="📊" variant="amber-v" />
//         <KpiCard label="L3 Cases"        value={kpis.l3}  sub={kpis.l3sub}  icon="🔺" variant="purple-v" />
//         <KpiCard label="Total STR Cases" value={kpis.str} sub={kpis.strPct} icon="🚨" variant="red-v" />
//       </div>
//     </>
//   );
// }
 
// // ─── Month block header ───────────────────────────────────────────────────────
// function MonthHeader({ monthKey, isLatest }) {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: isLatest ? 0 : 8 }}>
//       <div style={{
//         background: isLatest ? '#1a73e8' : '#4a5568',
//         color: '#fff',
//         borderRadius: 10,
//         padding: '6px 18px',
//         fontSize: 15,
//         fontWeight: 800,
//         flexShrink: 0,
//         letterSpacing: '-0.01em',
//       }}>
//         {fmtMonth(monthKey)}
//       </div>
//       {isLatest && (
//         <span style={{
//           background: '#e6f4ea', color: '#0f9d58',
//           fontSize: 10, fontWeight: 700, padding: '3px 10px',
//           borderRadius: 20, border: '1px solid #34a853', flexShrink: 0,
//         }}>
//           CURRENT MONTH
//         </span>
//       )}
//       <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
//     </div>
//   );
// }
 
// // ─── Comparison chart (only when 2+ months) ───────────────────────────────────
// function ComparisonChart({ monthBlocks }) {
//   const canvasRef = useRef(null);
//   const chartRef  = useRef(null);
 
//   useEffect(() => {
//     if (!canvasRef.current || monthBlocks.length < 2) return;
//     if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
 
//     // Show oldest → newest (left to right)
//     const ordered = [...monthBlocks].reverse();
//     const labels  = ordered.map((b) => fmtMonthShort(b.monthKey));
 
//     chartRef.current = new Chart(canvasRef.current, {
//       type: 'bar',
//       data: {
//         labels,
//         datasets: [
//           { label: 'Total',  data: ordered.map((b) => b.kpis._total),  backgroundColor: 'rgba(26,115,232,0.75)',  borderRadius: 5 },
//           { label: 'Closed', data: ordered.map((b) => b.kpis._closed), backgroundColor: 'rgba(15,157,88,0.75)',   borderRadius: 5 },
//           { label: 'Open',   data: ordered.map((b) => b.kpis._open),   backgroundColor: 'rgba(217,48,37,0.65)',   borderRadius: 5 },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: true,
//             position: 'top',
//             labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 14 },
//           },
//         },
//         scales: {
//           x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 12 } } },
//           y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 11 } } },
//         },
//       },
//     });
 
//     return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
//   }, [monthBlocks]);
 
//   if (monthBlocks.length < 2) return null;
 
//   return (
//     <div className="card" style={{ marginBottom: 20 }}>
//       <div className="card-hdr">
//         <div>
//           <div className="card-title">Month-on-Month Comparison</div>
//           <div className="card-sub">Total · Closed · Open cases — all months</div>
//         </div>
//       </div>
//       <div style={{ height: 280, position: 'relative' }}>
//         <canvas ref={canvasRef} />
//       </div>
//     </div>
//   );
// }
 
// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN DASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Dashboard({ onUploadClick }) {
//   const { filteredData, rawData, fileName, activeSheetName, CM } = useData();

//   const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);

//   // ── Split rows by month key ───────────────────────────────────────────────
//   const monthBlocks = useMemo(() => {
//     if (!d.length) return [];

//     const byMonth = {};
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM) || 'Unknown';
//       if (!byMonth[mk]) byMonth[mk] = [];
//       byMonth[mk].push(r);
//     });

//     const sortedKeys = Object.keys(byMonth)
//       .filter((k) => k !== 'Unknown')
//       .sort()
//       .reverse();

//     if (byMonth['Unknown']) sortedKeys.push('Unknown');

//     return sortedKeys.map((mk) => ({
//       monthKey: mk,
//       kpis: computeKPIs(byMonth[mk], CM),
//     }));
//   }, [d, CM]);

//   const dateBadge = new Date().toLocaleDateString('en-GB', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });

//   const hasData = rawData.length > 0;

//   // ─── Ageing Summary ───────────────────────────────────────────────────────
//   const [summaryHTML, setSummaryHTML] = useState('');

//   useEffect(() => {
//     if (!d.length) return;

//     const byMonth = {};

//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM);
//       if (!mk) return;

//       const lv = r._level;
//       if (lv === 'OTHER') return;

//       if (!byMonth[mk]) byMonth[mk] = {};
//       if (!byMonth[mk][lv]) {
//         byMonth[mk][lv] = {
//           assigned: 0,
//           open: 0,
//           completed: 0,
//           b0: 0,
//           b3: 0,
//           b11: 0,
//           b16: 0,
//           b30: 0,
//         };
//       }

//       byMonth[mk][lv].assigned++;

//       if (r._open) {
//         byMonth[mk][lv].open++;

//         if (r._ageing !== null) {
//           const a = r._ageing;

//           if (a <= 2) byMonth[mk][lv].b0++;
//           else if (a <= 10) byMonth[mk][lv].b3++;
//           else if (a <= 15) byMonth[mk][lv].b11++;
//           else if (a <= 30) byMonth[mk][lv].b16++;
//           else byMonth[mk][lv].b30++;
//         }
//       }

//       if (r._closed) byMonth[mk][lv].completed++;
//     });

//     const months = Object.keys(byMonth).sort().reverse();

//     let html = `<div class="card"><div class="card-hdr"><div>
//       <div class="card-title">Summary — Ageing by Month & Level</div>
//       <div class="card-sub">Assigned · Open · Completed · Open Ageing Buckets · All months compared</div>
//     </div></div>
//     <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
//       <th>Month</th><th>Work Flow</th><th>Assigned</th><th>Open</th><th>Completed</th>
//       <th style="background:#e8f5e9">00-10 days</th>
//       <th style="background:#fff3e0">11-15 days</th>
//       <th style="background:#fce4ec">16-30 days</th>
//       <th style="background:#ffebee">Over 30 days</th>
//     </tr></thead><tbody>`;

//     months.forEach((mk) => {
//       const lvls = ['L1', 'L2', 'L3'];

//       const validRows = lvls
//         .map((lv) => {
//           const x = byMonth[mk]?.[lv];
//           if (!x) return null;

//           if (
//             x.assigned === 0 &&
//             x.open === 0 &&
//             x.completed === 0 &&
//             x.b0 === 0 &&
//             x.b3 === 0 &&
//             x.b11 === 0 &&
//             x.b16 === 0 &&
//             x.b30 === 0
//           ) return null;

//           return { lv, x };
//         })
//         .filter(Boolean);

//       if (validRows.length === 0) return;

//       validRows.forEach(({ lv, x }, li) => {
//         html += `<tr>
//           ${li === 0 ? `<td rowspan="${validRows.length}">${fmtMonth(mk)}</td>` : ''}
//           <td>${lv}</td>
//           <td>${x.assigned}</td>
//           <td>${x.open}</td>
//           <td>${x.completed}</td>
//           <td>${x.b3}</td>
//           <td>${x.b11}</td>
//           <td>${x.b16}</td>
//           <td>${x.b30}</td>
//         </tr>`;
//       });
//     });

//     html += `</tbody></table></div></div>`;

//     setSummaryHTML(html);
//   }, [d, CM]);




 
//   return (
//     <div className="page" id="export-dashboard">
//       {/* ── Top bar ────────────────────────────────────────────────────────── */}
//       <div className="topbar">
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p>
//             {hasData
//               ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}`
//               : 'Upload CDR Excel/CSV to begin analysis'}
//           </p>
//         </div>
//         <div className="topbar-right">
//           <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
//             {hasData
//               ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}`
//               : '📂 Upload CDR File'}
//           </button>
//           <div className="date-badge">{dateBadge}</div>
//           <ExportButton
//             targetId="export-dashboard"
//             pageTitle="Executive Dashboard"
//             subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>
 
//       {/* ── Filter bar — month labels formatted ─────────────────────────────── */}
//       {hasData && <FilterBar formatMonthLabel={fmtMonthLabel} />}
 
//       {/* ── Empty state ─────────────────────────────────────────────────────── */}
//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>Upload a CDR Excel or CSV file to begin analysis</p>
//         </div>
//       )}
 
//       {/* ── Month blocks ────────────────────────────────────────────────────── */}
//       {hasData && monthBlocks.map((block, idx) => (
//         <div key={block.monthKey}>
//           <MonthHeader monthKey={block.monthKey} isLatest={idx === 0} />
//           <KPISection kpis={block.kpis} />
//         </div>
//       ))}
 
//       {/* ── Comparison chart — only when 2+ months ──────────────────────────── */}
//       {hasData && monthBlocks.length >= 2 && (
//         <>
//           <div className="sec-label">Month-on-Month Comparison</div>
//           <ComparisonChart monthBlocks={monthBlocks} />
//         </>
//       )}

//       {/* ── Ageing Summary Table (ADDED) ───────────────── */}
//       {hasData && (
//       <>
//         <div className="sec-label">Ageing Summary (All Months)</div>
//         <div
//           style={{ marginBottom: 20 }}
//           dangerouslySetInnerHTML={{ __html: summaryHTML }}
//         />
//       </>
//       )}

//     </div>
//   );
// }







// new unique code 
import { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import KpiCard from '../components/KpiCard';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { getMonthKey } from '../utils/dataUtils';
 
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
 
// Format filter dropdown label: "2026-03" → "March"
function fmtMonthLabel(mk) {
  return fmtMonthShort(mk) || mk;
}

// ─── KPI computation ──────────────────────────────────────────────────────────
function computeKPIs(rows, cm) {
  if (!rows || !rows.length) return null;
  const total    = rows.length;
  const closed   = rows.filter((r) => r._closed).length;
  const open     = rows.filter((r) => r._open).length;
  const str      = rows.filter((r) => r._str).length;
  const analysts = new Set(rows.map((r) => cm?.user ? r[cm.user] : '').filter(Boolean)).size;
  const l1 = rows.filter((r) => r._level === 'L1').length;
  const l2 = rows.filter((r) => r._level === 'L2').length;
  const l3 = rows.filter((r) => r._level === 'L3').length;
  const l2Pct   = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
  const l3Pct   = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
  const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
  const aged    = rows.filter((r) => r._ageing !== null).map((r) => r._ageing);
  const avgAge  = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) + 'd' : '—';
  const avgL1   = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
  return {
    total: total.toLocaleString(),
    closed: closed.toLocaleString(), closedPct: `${((closed / total) * 100).toFixed(1)}% closure rate`,
    open:   open.toLocaleString(),   openPct:   `${((open   / total) * 100).toFixed(1)}% open rate`,
    str:    str.toLocaleString(),    strPct:    `${((str    / total) * 100).toFixed(1)}% of total cases`,
    analysts,
    l2Pct, l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
    l3Pct, l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
    l2l3pct, l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
    avgAge,
    l1: l1.toLocaleString(), l1sub: `${((l1 / total) * 100).toFixed(1)}% of total`,
    l2: l2.toLocaleString(), l2sub: `${((l2 / total) * 100).toFixed(1)}% of total`,
    l3: l3.toLocaleString(), l3sub: `${((l3 / total) * 100).toFixed(1)}% of total`,
    avgL1,
    _total: total, _closed: closed, _open: open, _l1: l1, _l2: l2, _l3: l3,
  };
}
 
// ─── 12 KPI cards ─────────────────────────────────────────────────────────────
function KPISection({ kpis }) {
  if (!kpis) return null;
  return (
    <>
      <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
        <KpiCard label="Total Cases"      value={kpis.total}    sub="All loaded records"        icon="📋" variant="blue-v" />
        <KpiCard label="Closed Cases"     value={kpis.closed}   sub={kpis.closedPct}            icon="✅" variant="green-v" />
        <KpiCard label="Open Cases"       value={kpis.open}     sub={kpis.openPct}              icon="🔓" variant="red-v" />
        <KpiCard label="Active Analysts"  value={kpis.analysts} sub="Unique users"              icon="👥" variant="amber-v" />
      </div>
      <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
        <KpiCard label="% Cases at L2"         value={kpis.l2Pct}   sub={kpis.l2PctSub}         icon="📶" variant="orange-v" />
        <KpiCard label="% Cases at L3"         value={kpis.l3Pct}   sub={kpis.l3PctSub}         icon="🔺" variant="pink-v" />
        <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct} sub={kpis.l2l3sub}          icon="⚡" variant="purple-v" />
        <KpiCard label="Avg Ageing (days)"      value={kpis.avgAge}  sub="Created → Last Action" icon="⏱" variant="teal-v" />
      </div>
      <div className="kpi-grid k4" style={{ marginBottom: 20 }}>
        <KpiCard label="L1 Cases"        value={kpis.l1}  sub={kpis.l1sub}  icon="🎯" variant="blue-v" />
        <KpiCard label="L2 Cases"        value={kpis.l2}  sub={kpis.l2sub}  icon="📊" variant="amber-v" />
        <KpiCard label="L3 Cases"        value={kpis.l3}  sub={kpis.l3sub}  icon="🔺" variant="purple-v" />
        <KpiCard label="Total STR Cases" value={kpis.str} sub={kpis.strPct} icon="🚨" variant="red-v" />
      </div>
    </>
  );
}
 
// ─── Month block header ───────────────────────────────────────────────────────
function MonthHeader({ monthKey, isLatest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: isLatest ? 0 : 8 }}>
      <div style={{
        background: isLatest ? '#1a73e8' : '#4a5568',
        color: '#fff',
        borderRadius: 10,
        padding: '6px 18px',
        fontSize: 15,
        fontWeight: 800,
        flexShrink: 0,
        letterSpacing: '-0.01em',
      }}>
        {fmtMonth(monthKey)}
      </div>
      {isLatest && (
        <span style={{
          background: '#e6f4ea', color: '#0f9d58',
          fontSize: 10, fontWeight: 700, padding: '3px 10px',
          borderRadius: 20, border: '1px solid #34a853', flexShrink: 0,
        }}>
          CURRENT MONTH
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard({ onUploadClick }) {
  
  const { filteredData, rawData, fileName, activeSheetName, CM } = useData();

  const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);

  // ── Split rows by month key ───────────────────────────────────────────────
  const monthBlocks = useMemo(() => {
    if (!d.length) return [];

    const byMonth = {};
    d.forEach((r) => {
      const mk = getMonthKey(r, CM) || 'Unknown';
      if (!byMonth[mk]) byMonth[mk] = [];
      byMonth[mk].push(r);
    });

    const sortedKeys = Object.keys(byMonth)
      .filter((k) => k !== 'Unknown')
      .sort()
      .reverse();

    if (byMonth['Unknown']) sortedKeys.push('Unknown');

    return sortedKeys.map((mk) => ({
      monthKey: mk,
      kpis: computeKPIs(byMonth[mk], CM),
    }));
  }, [d, CM]);

  const dateBadge = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hasData = rawData.length > 0;

  // ─── Ageing Summary ───────────────────────────────────────────────────────
  const [summaryHTML, setSummaryHTML] = useState('');

  useEffect(() => {
    if (!d.length) return;

    const byMonth = {};

    d.forEach((r) => {
      const mk = getMonthKey(r, CM);
      if (!mk) return;

      const lv = r._level;
      if (lv === 'OTHER') return;

      if (!byMonth[mk]) byMonth[mk] = {};
      if (!byMonth[mk][lv]) {
        byMonth[mk][lv] = {
          assigned: 0,
          open: 0,
          completed: 0,
          b0: 0,
          b3: 0,
          b11: 0,
          b16: 0,
          b30: 0,
        };
      }

      byMonth[mk][lv].assigned++;

      if (r._open) {
        byMonth[mk][lv].open++;

        if (r._ageing !== null) {
          const a = r._ageing;

          if (a <= 2) byMonth[mk][lv].b0++;
          else if (a <= 10) byMonth[mk][lv].b3++;
          else if (a <= 15) byMonth[mk][lv].b11++;
          else if (a <= 30) byMonth[mk][lv].b16++;
          else byMonth[mk][lv].b30++;
        }
      }

      if (r._closed) byMonth[mk][lv].completed++;
    });

    const months = Object.keys(byMonth).sort().reverse();

    let html = `<div class="card"><div class="card-hdr"><div>
      <div class="card-title">Summary — Ageing by Month & Level</div>
      <div class="card-sub">Assigned · Open · Completed · Open Ageing Buckets · All months compared</div>
    </div></div>
    <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
      <th>Month</th><th>Work Flow</th><th>Assigned</th><th>Open</th><th>Completed</th>
      <th style="background:#e8f5e9">00-10 days</th>
      <th style="background:#fff3e0">11-15 days</th>
      <th style="background:#fce4ec">16-30 days</th>
      <th style="background:#ffebee">Over 30 days</th>
    </tr></thead><tbody>`;

    months.forEach((mk) => {
      const lvls = ['L1', 'L2', 'L3'];

      const validRows = lvls
        .map((lv) => {
          const x = byMonth[mk]?.[lv];
          if (!x) return null;

          if (
            x.assigned === 0 &&
            x.open === 0 &&
            x.completed === 0 &&
            x.b0 === 0 &&
            x.b3 === 0 &&
            x.b11 === 0 &&
            x.b16 === 0 &&
            x.b30 === 0
          ) return null;

          return { lv, x };
        })
        .filter(Boolean);

      if (validRows.length === 0) return;

      validRows.forEach(({ lv, x }, li) => {
        html += `<tr>
          ${li === 0 ? `<td rowspan="${validRows.length}">${fmtMonth(mk)}</td>` : ''}
          <td>${lv}</td>
          <td>${x.assigned}</td>
          <td>${x.open}</td>
          <td>${x.completed}</td>
          <td>${x.b3}</td>
          <td>${x.b11}</td>
          <td>${x.b16}</td>
          <td>${x.b30}</td>
        </tr>`;
      });
    });

    html += `</tbody></table></div></div>`;

    setSummaryHTML(html);
  }, [d, CM]);

  return (
    <div className="page" id="export-dashboard">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <h1>Executive Dashboard</h1>
          <p>
            {hasData
              ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}`
              : 'Upload CDR Excel/CSV to begin analysis'}
          </p>
        </div>
        <div className="topbar-right">
          <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
            {hasData
              ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}`
              : '📂 Upload CDR File'}
          </button>
          <div className="date-badge">{dateBadge}</div>
          <ExportButton
            targetId="export-dashboard"
            pageTitle="Executive Dashboard"
            subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
            disabled={!hasData}
          />
        </div>
      </div>
 
      {/* ── Filter bar — month labels formatted ─────────────────────────────── */}
      {hasData && <FilterBar formatMonthLabel={fmtMonthLabel} />}
     
 
      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!hasData && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="ei">📂</div>
          <p>Upload a CDR Excel or CSV file to begin analysis</p>
        </div>
      )}
 
      {/* ── Month blocks ────────────────────────────────────────────────────── */}
      {hasData && monthBlocks.map((block, idx) => (
        <div key={block.monthKey}>
          <MonthHeader monthKey={block.monthKey} isLatest={idx === 0} />
          <KPISection kpis={block.kpis} />
        </div>
      ))}

      {/* ── Ageing Summary Table ───────────────── */}
      {hasData && (
        <>
          <div className="sec-label">Ageing Summary (All Months)</div>
          <div
            style={{ marginBottom: 20 }}
            dangerouslySetInnerHTML={{ __html: summaryHTML }}
          />
        </>
      )}
    </div>
  );
}

















// import { useEffect, useState, useMemo } from 'react';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';
 
// // ─── Month helpers ────────────────────────────────────────────────────────────
// const MONTH_NAMES = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];
 
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
//   return mk;
// }
 
// function fmtMonthShort(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return MONTH_NAMES[parseInt(m[2], 10) - 1] || mk;
//   return mk;
// }
 
// function fmtMonthLabel(mk) {
//   return fmtMonthShort(mk) || mk;
// }
 
// // ─── Deduplicate rows by case_id ─────────────────────────────────────────────
// // A case travels L1 → L2 → L3, so the same case_id appears multiple times.
// // Strategy per case_id:
// //   _level   → keep the HIGHEST level row (L3 > L2 > L1)
// //   _closed  → true if ANY row for this case is closed
// //   _open    → true only if NOT closed
// //   _str     → true if ANY row is STR
// //   _ageing  → from the highest-level row
// //   user     → from the highest-level row
// function deduplicateByCaseId(rows, cm) {
//   const caseIdField = cm?.caseId || 'case_id';
//   const levelOrder  = { L1: 1, L2: 2, L3: 3 };
//   const map         = new Map(); // case_id → best row
 
//   rows.forEach((r) => {
//     const id = r[caseIdField];
//     // If no case_id on this row, keep it as-is (won't dedup)
//     if (id === null || id === undefined || id === '') {
//       // use row object itself as key so it's kept
//       map.set(r, r);
//       return;
//     }
 
//     const lvRank = levelOrder[r._level] ?? 0;
 
//     if (!map.has(id)) {
//       // Store a shallow copy so we can mutate safely
//       map.set(id, { ...r, _lvRank: lvRank });
//     } else {
//       const ex = map.get(id);
 
//       // Upgrade to higher level row
//       if (lvRank > ex._lvRank) {
//         const merged = { ...r, _lvRank: lvRank };
//         // Carry forward closed/str flags from earlier rows
//         merged._closed = merged._closed || ex._closed;
//         merged._str    = merged._str    || ex._str;
//         map.set(id, merged);
//       } else {
//         // Keep existing (higher/equal level) but merge flags
//         ex._closed = ex._closed || r._closed;
//         ex._str    = ex._str    || r._str;
//       }
//     }
//   });
 
//   // Fix _open: a case is open only if it is NOT closed
//   const result = Array.from(map.values());
//   result.forEach((r) => {
//     if (r._closed) r._open = false;
//   });
 
//   return result;
// }
 
// // ─── KPI computation (unique case_id) ────────────────────────────────────────
// function computeKPIs(rows, cm) {
//   if (!rows || !rows.length) return null;
 
//   // Deduplicate: one row per case_id
//   const unique = deduplicateByCaseId(rows, cm);
//   const total  = unique.length;
//   if (total === 0) return null;
 
//   const closed   = unique.filter((r) => r._closed).length;
//   const open     = unique.filter((r) => r._open).length;
//   const str      = unique.filter((r) => r._str).length;
 
//   // Analysts: count unique user values across unique cases
//   const analysts = new Set(
//     unique.map((r) => (cm?.user ? r[cm.user] : '')).filter(Boolean)
//   ).size;
 
//   // Level counts: each unique case counted at its HIGHEST level
//   const l1 = unique.filter((r) => r._level === 'L1').length;
//   const l2 = unique.filter((r) => r._level === 'L2').length;
//   const l3 = unique.filter((r) => r._level === 'L3').length;
 
//   const l2Pct   = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//   const l3Pct   = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//   const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
 
//   // Ageing from unique cases
//   const aged   = unique.filter((r) => r._ageing !== null && r._ageing !== undefined).map((r) => r._ageing);
//   const avgAge = aged.length
//     ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) + 'd'
//     : '—';
 
//   const avgL1 = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
 
//   return {
//     total:  total.toLocaleString(),
//     closed: closed.toLocaleString(), closedPct: `${((closed / total) * 100).toFixed(1)}% closure rate`,
//     open:   open.toLocaleString(),   openPct:   `${((open   / total) * 100).toFixed(1)}% open rate`,
//     str:    str.toLocaleString(),    strPct:    `${((str    / total) * 100).toFixed(1)}% of total cases`,
//     analysts,
//     l2Pct, l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l3Pct, l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l2l3pct, l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//     avgAge,
//     l1: l1.toLocaleString(), l1sub: `${((l1 / total) * 100).toFixed(1)}% of total`,
//     l2: l2.toLocaleString(), l2sub: `${((l2 / total) * 100).toFixed(1)}% of total`,
//     l3: l3.toLocaleString(), l3sub: `${((l3 / total) * 100).toFixed(1)}% of total`,
//     avgL1,
//     _total: total, _closed: closed, _open: open, _l1: l1, _l2: l2, _l3: l3,
//   };
// }
 
// // ─── KPI cards ────────────────────────────────────────────────────────────────
// function KPISection({ kpis }) {
//   if (!kpis) return null;
//   return (
//     <>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="Total Cases"      value={kpis.total}    sub="Unique Case IDs"           icon="📋" variant="blue-v" />
//         <KpiCard label="Closed Cases"     value={kpis.closed}   sub={kpis.closedPct}            icon="✅" variant="green-v" />
//         <KpiCard label="Open Cases"       value={kpis.open}     sub={kpis.openPct}              icon="🔓" variant="red-v" />
//         <KpiCard label="Active Analysts"  value={kpis.analysts} sub="Unique users"              icon="👥" variant="amber-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="% Cases at L2"         value={kpis.l2Pct}   sub={kpis.l2PctSub}         icon="📶" variant="orange-v" />
//         <KpiCard label="% Cases at L3"         value={kpis.l3Pct}   sub={kpis.l3PctSub}         icon="🔺" variant="pink-v" />
//         <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct} sub={kpis.l2l3sub}          icon="⚡" variant="purple-v" />
//         <KpiCard label="Avg Ageing (days)"      value={kpis.avgAge}  sub="Created → Last Action" icon="⏱" variant="teal-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 20 }}>
//         <KpiCard label="L1 Cases"        value={kpis.l1}  sub={kpis.l1sub}  icon="🎯" variant="blue-v" />
//         <KpiCard label="L2 Cases"        value={kpis.l2}  sub={kpis.l2sub}  icon="📊" variant="amber-v" />
//         <KpiCard label="L3 Cases"        value={kpis.l3}  sub={kpis.l3sub}  icon="🔺" variant="purple-v" />
//         <KpiCard label="Total STR Cases" value={kpis.str} sub={kpis.strPct} icon="🚨" variant="red-v" />
//       </div>
//     </>
//   );
// }
 
// // ─── Month block header ───────────────────────────────────────────────────────
// function MonthHeader({ monthKey, isLatest }) {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: isLatest ? 0 : 8 }}>
//       <div style={{
//         background: isLatest ? '#1a73e8' : '#4a5568',
//         color: '#fff',
//         borderRadius: 10,
//         padding: '6px 18px',
//         fontSize: 15,
//         fontWeight: 800,
//         flexShrink: 0,
//         letterSpacing: '-0.01em',
//       }}>
//         {fmtMonth(monthKey)}
//       </div>
//       {isLatest && (
//         <span style={{
//           background: '#e6f4ea', color: '#0f9d58',
//           fontSize: 10, fontWeight: 700, padding: '3px 10px',
//           borderRadius: 20, border: '1px solid #34a853', flexShrink: 0,
//         }}>
//           CURRENT MONTH
//         </span>
//       )}
//       <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
//     </div>
//   );
// }
 
// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN DASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Dashboard({ onUploadClick }) {
//   const { filteredData, rawData, fileName, activeSheetName, CM } = useData();
 
//   const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);
 
//   // ── Split rows by month key ───────────────────────────────────────────────
//   const monthBlocks = useMemo(() => {
//     if (!d.length) return [];
 
//     const byMonth = {};
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM) || 'Unknown';
//       if (!byMonth[mk]) byMonth[mk] = [];
//       byMonth[mk].push(r);
//     });
 
//     const sortedKeys = Object.keys(byMonth)
//       .filter((k) => k !== 'Unknown')
//       .sort()
//       .reverse();
 
//     if (byMonth['Unknown']) sortedKeys.push('Unknown');
 
//     return sortedKeys.map((mk) => ({
//       monthKey: mk,
//       kpis: computeKPIs(byMonth[mk], CM),
//     }));
//   }, [d, CM]);
 
//   const dateBadge = new Date().toLocaleDateString('en-GB', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });
 
//   const hasData = rawData.length > 0;
 
//   // ─── Ageing Summary (unique case_id per level per month) ──────────────────
//   const [summaryHTML, setSummaryHTML] = useState('');
 
//   useEffect(() => {
//     if (!d.length) return;
 
//     const caseIdField = CM?.caseId || 'case_id';
//     const levelOrder  = { L1: 1, L2: 2, L3: 3 };
 
//     // byMonth[mk][lv] → Map<case_id, bestRow>
//     const byMonth = {};
 
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM);
//       if (!mk) return;
 
//       const lv = r._level;
//       if (!lv || lv === 'OTHER') return;
 
//       const id     = r[caseIdField];
//       const mapKey = (id !== null && id !== undefined && id !== '') ? id : r;
 
//       if (!byMonth[mk])       byMonth[mk]     = {};
//       if (!byMonth[mk][lv])   byMonth[mk][lv] = new Map();
 
//       const lvMap  = byMonth[mk][lv];
//       const lvRank = levelOrder[lv] ?? 0;
 
//       if (!lvMap.has(mapKey)) {
//         lvMap.set(mapKey, { ...r, _lvRank: lvRank });
//       } else {
//         const ex = lvMap.get(mapKey);
//         // Merge: closed & str are sticky
//         if (r._closed) { ex._closed = true; ex._open = false; }
//         if (r._str)      ex._str    = true;
//         // Upgrade level if higher
//         if (lvRank > ex._lvRank) {
//           const merged = { ...r, _lvRank: lvRank };
//           merged._closed = merged._closed || ex._closed;
//           merged._str    = merged._str    || ex._str;
//           if (merged._closed) merged._open = false;
//           lvMap.set(mapKey, merged);
//         }
//       }
//     });
 
//     const months = Object.keys(byMonth).sort().reverse();
 
//     let html = `<div class="card"><div class="card-hdr"><div>
//       <div class="card-title">Summary — Ageing by Month & Level</div>
//       <div class="card-sub">Unique Case IDs · Assigned · Open · Completed · Open Ageing Buckets</div>
//     </div></div>
//     <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
//       <th>Month</th><th>Work Flow</th><th>Assigned</th><th>Open</th><th>Completed</th>
//       <th style="background:#e8f5e9">00-10 days</th>
//       <th style="background:#fff3e0">11-15 days</th>
//       <th style="background:#fce4ec">16-30 days</th>
//       <th style="background:#ffebee">Over 30 days</th>
//     </tr></thead><tbody>`;
 
//     months.forEach((mk) => {
//       const validRows = ['L1', 'L2', 'L3'].map((lv) => {
//         const lvMap = byMonth[mk]?.[lv];
//         if (!lvMap || lvMap.size === 0) return null;
 
//         const cases     = Array.from(lvMap.values());
//         const assigned  = cases.length;
//         const openCases = cases.filter((c) => c._open && !c._closed);
//         const openCount = openCases.length;
//         const completed = cases.filter((c) => c._closed).length;
 
//         if (assigned === 0) return null;
 
//         // Ageing buckets for OPEN cases only
//         let b3 = 0, b11 = 0, b16 = 0, b30 = 0;
//         openCases.forEach((c) => {
//           const a = c._ageing;
//           if (a === null || a === undefined) return;
//           if      (a <= 10) b3++;
//           else if (a <= 15) b11++;
//           else if (a <= 30) b16++;
//           else              b30++;
//         });
 
//         return { lv, assigned, openCount, completed, b3, b11, b16, b30 };
//       }).filter(Boolean);
 
//       if (validRows.length === 0) return;
 
//       validRows.forEach(({ lv, assigned, openCount, completed, b3, b11, b16, b30 }, li) => {
//         html += `<tr>
//           ${li === 0 ? `<td rowspan="${validRows.length}">${fmtMonth(mk)}</td>` : ''}
//           <td>${lv}</td>
//           <td>${assigned}</td>
//           <td>${openCount}</td>
//           <td>${completed}</td>
//           <td>${b3}</td>
//           <td>${b11}</td>
//           <td>${b16}</td>
//           <td>${b30}</td>
//         </tr>`;
//       });
//     });
 
//     html += `</tbody></table></div></div>`;
//     setSummaryHTML(html);
//   }, [d, CM]);
 
//   return (
//     <div className="page" id="export-dashboard">
//       {/* ── Top bar ────────────────────────────────────────────────────────── */}
//       <div className="topbar">
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p>
//             {hasData
//               ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}`
//               : 'Upload CDR Excel/CSV to begin analysis'}
//           </p>
//         </div>
//         <div className="topbar-right">
//           <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
//             {hasData
//               ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}`
//               : '📂 Upload CDR File'}
//           </button>
//           <div className="date-badge">{dateBadge}</div>
//           <ExportButton
//             targetId="export-dashboard"
//             pageTitle="Executive Dashboard"
//             subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>
 
//       {/* ── Filter bar ───────────────────────────────────────────────────────── */}
//       {hasData && <FilterBar formatMonthLabel={fmtMonthLabel} />}
 
//       {/* ── Empty state ──────────────────────────────────────────────────────── */}
//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>Upload a CDR Excel or CSV file to begin analysis</p>
//         </div>
//       )}
 
//       {/* ── Month blocks ─────────────────────────────────────────────────────── */}
//       {hasData && monthBlocks.map((block, idx) => (
//         <div key={block.monthKey}>
//           <MonthHeader monthKey={block.monthKey} isLatest={idx === 0} />
//           <KPISection kpis={block.kpis} />
//         </div>
//       ))}
 
//       {/* ── Ageing Summary Table ─────────────────────────────────────────────── */}
//       {hasData && (
//         <>
//           <div className="sec-label">Ageing Summary (All Months)</div>
//           <div
//             style={{ marginBottom: 20 }}
//             dangerouslySetInnerHTML={{ __html: summaryHTML }}
//           />
//         </>
//       )}
//     </div>
//   );
// }






// import { useEffect, useState, useMemo } from 'react';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';
 
// // ─── Month helpers ────────────────────────────────────────────────────────────
// const MONTH_NAMES = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];
 
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2], 10) - 1] || mk} ${m[1]}`;
//   return mk;
// }
 
// function fmtMonthShort(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return MONTH_NAMES[parseInt(m[2], 10) - 1] || mk;
//   return mk;
// }
 
// // Format filter dropdown label: "2026-03" → "March"
// function fmtMonthLabel(mk) {
//   return fmtMonthShort(mk) || mk;
// }




// // ─── KPI computation ──────────────────────────────────────────────────────────
// function computeKPIs(rows, cm) {
//   if (!rows || !rows.length) return null;
//   const total    = rows.length;
//   const closed   = rows.filter((r) => r._closed).length;
//   const open     = rows.filter((r) => r._open).length;
//   const str      = rows.filter((r) => r._str).length;
//   const analysts = new Set(rows.map((r) => cm?.user ? r[cm.user] : '').filter(Boolean)).size;
//   const l1 = rows.filter((r) => r._level === 'L1').length;
//   const l2 = rows.filter((r) => r._level === 'L2').length;
//   const l3 = rows.filter((r) => r._level === 'L3').length;
//   const l2Pct   = total > 0 ? ((l2 / total) * 100).toFixed(2) + '%' : '—';
//   const l3Pct   = total > 0 ? ((l3 / total) * 100).toFixed(2) + '%' : '—';
//   const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
//   const aged    = rows.filter((r) => r._ageing !== null).map((r) => r._ageing);
//   const avgAge  = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) + 'd' : '—';
//   const avgL1   = analysts > 0 ? (l1 / analysts).toFixed(1) : '—';
//   return {
//     total: total.toLocaleString(),
//     closed: closed.toLocaleString(), closedPct: `${((closed / total) * 100).toFixed(1)}% closure rate`,
//     open:   open.toLocaleString(),   openPct:   `${((open   / total) * 100).toFixed(1)}% open rate`,
//     str:    str.toLocaleString(),    strPct:    `${((str    / total) * 100).toFixed(1)}% of total cases`,
//     analysts,
//     l2Pct, l2PctSub: `L2: ${l2.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l3Pct, l3PctSub: `L3: ${l3.toLocaleString()} / Total: ${total.toLocaleString()}`,
//     l2l3pct, l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
//     avgAge,
//     l1: l1.toLocaleString(), l1sub: `${((l1 / total) * 100).toFixed(1)}% of total`,
//     l2: l2.toLocaleString(), l2sub: `${((l2 / total) * 100).toFixed(1)}% of total`,
//     l3: l3.toLocaleString(), l3sub: `${((l3 / total) * 100).toFixed(1)}% of total`,
//     avgL1,
//     _total: total, _closed: closed, _open: open, _l1: l1, _l2: l2, _l3: l3,
//   };
// }
 
// // ─── 12 KPI cards ─────────────────────────────────────────────────────────────
// function KPISection({ kpis }) {
//   if (!kpis) return null;
//   return (
//     <>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="Total Cases"      value={kpis.total}    sub="All loaded records"        icon="📋" variant="blue-v" />
//         <KpiCard label="Closed Cases"     value={kpis.closed}   sub={kpis.closedPct}            icon="✅" variant="green-v" />
//         <KpiCard label="Open Cases"       value={kpis.open}     sub={kpis.openPct}              icon="🔓" variant="red-v" />
//         <KpiCard label="Active Analysts"  value={kpis.analysts} sub="Unique users"              icon="👥" variant="amber-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//         <KpiCard label="% Cases at L2"         value={kpis.l2Pct}   sub={kpis.l2PctSub}         icon="📶" variant="orange-v" />
//         <KpiCard label="% Cases at L3"         value={kpis.l3Pct}   sub={kpis.l3PctSub}         icon="🔺" variant="pink-v" />
//         <KpiCard label="% L2 to L3 Escalation" value={kpis.l2l3pct} sub={kpis.l2l3sub}          icon="⚡" variant="purple-v" />
//         <KpiCard label="Avg Ageing (days)"      value={kpis.avgAge}  sub="Created → Last Action" icon="⏱" variant="teal-v" />
//       </div>
//       <div className="kpi-grid k4" style={{ marginBottom: 20 }}>
//         <KpiCard label="L1 Cases"        value={kpis.l1}  sub={kpis.l1sub}  icon="🎯" variant="blue-v" />
//         <KpiCard label="L2 Cases"        value={kpis.l2}  sub={kpis.l2sub}  icon="📊" variant="amber-v" />
//         <KpiCard label="L3 Cases"        value={kpis.l3}  sub={kpis.l3sub}  icon="🔺" variant="purple-v" />
//         <KpiCard label="Total STR Cases" value={kpis.str} sub={kpis.strPct} icon="🚨" variant="red-v" />
//       </div>
//     </>
//   );
// }
 
// // ─── Month block header ───────────────────────────────────────────────────────
// function MonthHeader({ monthKey, isLatest }) {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: isLatest ? 0 : 8 }}>
//       <div style={{
//         background: isLatest ? '#1a73e8' : '#4a5568',
//         color: '#fff',
//         borderRadius: 10,
//         padding: '6px 18px',
//         fontSize: 15,
//         fontWeight: 800,
//         flexShrink: 0,
//         letterSpacing: '-0.01em',
//       }}>
//         {fmtMonth(monthKey)}
//       </div>
//       {isLatest && (
//         <span style={{
//           background: '#e6f4ea', color: '#0f9d58',
//           fontSize: 10, fontWeight: 700, padding: '3px 10px',
//           borderRadius: 20, border: '1px solid #34a853', flexShrink: 0,
//         }}>
//           CURRENT MONTH
//         </span>
//       )}
//       <div style={{ flex: 1, height: 1, background: '#e4e7ed' }} />
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN DASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Dashboard({ onUploadClick }) {
//   const { filteredData, rawData, fileName, activeSheetName, CM } = useData();

//   const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);

//   // ── Split rows by month key ───────────────────────────────────────────────
//   const monthBlocks = useMemo(() => {
//     if (!d.length) return [];

//     const byMonth = {};
//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM) || 'Unknown';
//       if (!byMonth[mk]) byMonth[mk] = [];
//       byMonth[mk].push(r);
//     });

//     const sortedKeys = Object.keys(byMonth)
//       .filter((k) => k !== 'Unknown')
//       .sort()
//       .reverse();

//     if (byMonth['Unknown']) sortedKeys.push('Unknown');

//     return sortedKeys.map((mk) => ({
//       monthKey: mk,
//       kpis: computeKPIs(byMonth[mk], CM),
//     }));
//   }, [d, CM]);

//   const dateBadge = new Date().toLocaleDateString('en-GB', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });

//   const hasData = rawData.length > 0;

//   // ─── Ageing Summary ───────────────────────────────────────────────────────
//   const [summaryHTML, setSummaryHTML] = useState('');

//   useEffect(() => {
//     if (!d.length) return;

//     const byMonth = {};

//     d.forEach((r) => {
//       const mk = getMonthKey(r, CM);
//       if (!mk) return;

//       const lv = r._level;
//       if (lv === 'OTHER') return;

//       if (!byMonth[mk]) byMonth[mk] = {};
//       if (!byMonth[mk][lv]) {
//         byMonth[mk][lv] = {
//           assigned: 0,
//           open: 0,
//           completed: 0,
//           b0: 0,
//           b3: 0,
//           b11: 0,
//           b16: 0,
//           b30: 0,
//         };
//       }

//       byMonth[mk][lv].assigned++;

//       if (r._open) {
//         byMonth[mk][lv].open++;

//         if (r._ageing !== null) {
//           const a = r._ageing;

//           if (a <= 2) byMonth[mk][lv].b0++;
//           else if (a <= 10) byMonth[mk][lv].b3++;
//           else if (a <= 15) byMonth[mk][lv].b11++;
//           else if (a <= 30) byMonth[mk][lv].b16++;
//           else byMonth[mk][lv].b30++;
//         }
//       }

//       if (r._closed) byMonth[mk][lv].completed++;
//     });

//     const months = Object.keys(byMonth).sort().reverse();

//     let html = `<div class="card"><div class="card-hdr"><div>
//       <div class="card-title">Summary — Ageing by Month & Level</div>
//       <div class="card-sub">Assigned · Open · Completed · Open Ageing Buckets · All months compared</div>
//     </div></div>
//     <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
//       <th>Month</th><th>Work Flow</th><th>Assigned</th><th>Open</th><th>Completed</th>
//       <th style="background:#e8f5e9">00-10 days</th>
//       <th style="background:#fff3e0">11-15 days</th>
//       <th style="background:#fce4ec">16-30 days</th>
//       <th style="background:#ffebee">Over 30 days</th>
//     </tr></thead><tbody>`;

//     months.forEach((mk) => {
//       const lvls = ['L1', 'L2', 'L3'];

//       const validRows = lvls
//         .map((lv) => {
//           const x = byMonth[mk]?.[lv];
//           if (!x) return null;

//           if (
//             x.assigned === 0 &&
//             x.open === 0 &&
//             x.completed === 0 &&
//             x.b0 === 0 &&
//             x.b3 === 0 &&
//             x.b11 === 0 &&
//             x.b16 === 0 &&
//             x.b30 === 0
//           ) return null;

//           return { lv, x };
//         })
//         .filter(Boolean);

//       if (validRows.length === 0) return;

//       validRows.forEach(({ lv, x }, li) => {
//         html += `<tr>
//           ${li === 0 ? `<td rowspan="${validRows.length}">${fmtMonth(mk)}</td>` : ''}
//           <td>${lv}</td>
//           <td>${x.assigned}</td>
//           <td>${x.open}</td>
//           <td>${x.completed}</td>
//           <td>${x.b3}</td>
//           <td>${x.b11}</td>
//           <td>${x.b16}</td>
//           <td>${x.b30}</td>
//         </tr>`;
//       });
//     });

//     html += `</tbody></table></div></div>`;

//     setSummaryHTML(html);
//   }, [d, CM]);

//   return (
//     <div className="page" id="export-dashboard">
//       {/* ── Top bar ────────────────────────────────────────────────────────── */}
//       <div className="topbar">
//         <div>
//           <h1>Executive Dashboard</h1>
//           <p>
//             {hasData
//               ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}`
//               : 'Upload CDR Excel/CSV to begin analysis'}
//           </p>
//         </div>
//         <div className="topbar-right">
//           <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
//             {hasData
//               ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}`
//               : '📂 Upload CDR File'}
//           </button>
//           <div className="date-badge">{dateBadge}</div>
//           <ExportButton
//             targetId="export-dashboard"
//             pageTitle="Executive Dashboard"
//             subTitle={hasData ? `${rawData.length.toLocaleString()} cases · ${fileName}` : ''}
//             disabled={!hasData}
//           />
//         </div>
//       </div>
 
//       {/* ── Filter bar — month labels formatted ─────────────────────────────── */}
//       {hasData && <FilterBar formatMonthLabel={fmtMonthLabel} />}
 
//       {/* ── Empty state ─────────────────────────────────────────────────────── */}
//       {!hasData && (
//         <div className="empty-state" style={{ marginTop: 60 }}>
//           <div className="ei">📂</div>
//           <p>Upload a CDR Excel or CSV file to begin analysis</p>
//         </div>
//       )}
 
//       {/* ── Month blocks ────────────────────────────────────────────────────── */}
//       {hasData && monthBlocks.map((block, idx) => (
//         <div key={block.monthKey}>
//           <MonthHeader monthKey={block.monthKey} isLatest={idx === 0} />
//           <KPISection kpis={block.kpis} />
//         </div>
//       ))}

//       {/* ── Ageing Summary Table ───────────────── */}
//       {hasData && (
//         <>
//           <div className="sec-label">Ageing Summary (All Months)</div>
//           <div
//             style={{ marginBottom: 20 }}
//             dangerouslySetInnerHTML={{ __html: summaryHTML }}
//           />
//         </>
//       )}
//     </div>
//   );
// }

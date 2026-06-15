// final code --


import { useEffect, useRef, useState, useMemo } from 'react';
import { Chart } from 'chart.js/auto';
import { useData } from '../context/DataContext';
import KpiCard from '../components/KpiCard';
import FilterBar from '../components/FilterBar';
import ChartCard from '../components/ChartCard';
import ExportButton from '../components/ExportButton';
import { getMonthKey } from '../utils/dataUtils';

function destroyChart(chartRef) {
  if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
}

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
  },
};

export default function Productivity({ onUploadClick }) {
  const { filteredData, rawData, fileName, CM } = useData();
  const dRaw = filteredData.length ? filteredData : rawData;

  // ✅ MONTH FILTER STATE
  const [selectedMonth, setSelectedMonth] = useState('all');

  // ✅ GET ALL MONTHS
  const allMonths = useMemo(() => {
    const set = new Set();
    dRaw.forEach((r) => {
      const mk = getMonthKey(r, CM);
      if (mk) set.add(mk);
    });
    return Array.from(set).sort().reverse();
  }, [dRaw, CM]);

  // ✅ APPLY MONTH FILTER TO DATA
  const d = useMemo(() => {
    if (selectedMonth === 'all') return dRaw;
    return dRaw.filter((r) => getMonthKey(r, CM) === selectedMonth);
  }, [dRaw, selectedMonth, CM]);

  const refProd  = useRef(null); const canvasProd  = useRef(null);
  const refL1Age = useRef(null); const canvasL1Age = useRef(null);
  const refL2Age = useRef(null); const canvasL2Age = useRef(null);

  const [kpis, setKpis]   = useState({});
  const [badge, setBadge] = useState('—');
  const [scoreRows, setScoreRows] = useState([]);

  useEffect(() => {
    if (!d.length) return;

    // ── Closure rates ─────────────────────────────────
    const rates = {};
    ['L1', 'L2', 'L3'].forEach((lv) => {
      const lvData = d.filter((r) => r._level === lv);
      const cls = lvData.filter((r) => r._closed).length;
      rates[lv] = lvData.length > 0 ? ((cls / lvData.length) * 100).toFixed(1) + '%' : '—';
    });
    const overall = d.length > 0 ? ((d.filter((r) => r._closed).length / d.length) * 100).toFixed(1) + '%' : '—';

    const avgDays = {};
    ['L1', 'L2', 'L3'].forEach((lv) => {
      const cls = d.filter((r) => r._level === lv && r._closed && r._ageing !== null);
      avgDays[lv] = cls.length ? (cls.reduce((s, r) => s + r._ageing, 0) / cls.length).toFixed(1) + 'd' : '—';
    });

    setKpis({
      l1Close: rates.L1, l2Close: rates.L2, l3Close: rates.L3, overall,
      l1Avg: avgDays.L1, l2Avg: avgDays.L2, l3Avg: avgDays.L3,
    });

    // ── Chart ─────────────────────────────────
    destroyChart(refProd);

    const byMonth = {};
    d.forEach((r) => {
      if (!r._closed) return;
      const mk = getMonthKey(r, CM); if (!mk) return;
      if (!byMonth[mk]) byMonth[mk] = { L1: 0, L2: 0, L3: 0, analysts: new Set() };
      byMonth[mk][r._level]++;
      if (CM.user && r[CM.user]) byMonth[mk].analysts.add(r[CM.user]);
    });

    const months = Object.keys(byMonth).sort();
    setBadge(months.length + ' months');

    const avgProd = months.map((m) => {
      const a = byMonth[m].analysts.size;
      const t = byMonth[m].L1 + byMonth[m].L2 + byMonth[m].L3;
      return a > 0 ? (t / a).toFixed(2) : 0;
    });

    refProd.current = new Chart(canvasProd.current, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'L1 Closed', data: months.map((m) => byMonth[m].L1), backgroundColor: 'rgba(26,115,232,0.75)', stack: 's' },
          { label: 'L2 Closed', data: months.map((m) => byMonth[m].L2), backgroundColor: 'rgba(245,158,11,0.75)', stack: 's' },
          { label: 'L3 Closed', data: months.map((m) => byMonth[m].L3), backgroundColor: 'rgba(124,58,237,0.75)', stack: 's' },
          { label: 'Avg Productivity', data: avgProd, type: 'line', borderColor: '#d93025', yAxisID: 'yProd' },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { stacked: true }, x: { stacked: true }, yProd: { position: 'right' } },
      },
    });

    // ── Score Table ─────────────────────────────
    if (CM.user) {
      const EXCLUDED = ['neetu1.singh', 'sandeep.kumar'];

      const LEVEL_MAP = {
        'm-nitin1.thakur': 'L2',
        'm-vishwa.singh': 'L1',
        'manish.kumar': 'L3',
        'manisha.gupta': 'L2',
        'mohini.vishwakarma': 'L1',
        'ruchi1.kumari': 'L3',
        'upasana': 'L3',
        'ashish.jadaun':     'L1',  // apna level daalo
        'navneet.singh':     'L1',
        'vaibhav.bakshi':    'L1',
        'ankit1.deshmukh':   'L1',
        'bhanu.khandelwal':  'L1',
        'chirag1.kumar':     'L1',
        'm-shouvik.biswas':  'L1',
        'manas2.tiwari':     'L1',
        'ravendra.singh':    'L2',
        'rohan.dahiya':      'L1',
        'saurabh14.kumar':   'L2',
        'upasana1.verma':    'L3',
        'v.rani':            'L2',
        'manish39.kumar':    'L3',
  
      };

      const filtered = d.filter((r) => {
        const user = (r[CM.user] || '').toLowerCase().trim();
        if (!user || EXCLUDED.includes(user)) return false;
        const allowedLevel = LEVEL_MAP[user];
        return allowedLevel && r._level === allowedLevel;
      });

      const uniqueMap = new Map();
      filtered.forEach((r) => {
        const key = r[CM.user] + '_' + (r._caseId || r.case_id || r.id);
        if (!uniqueMap.has(key)) uniqueMap.set(key, r);
      });

      const uniqueRows = Array.from(uniqueMap.values());

      const users = [...new Set(uniqueRows.map((r) => r[CM.user]))];

      const rows = users.map((u) => {
        const ud = uniqueRows.filter((r) => r[CM.user] === u);
        return {
          u,
          total: ud.length,
          closed: ud.filter((r) => r._closed).length,
          open: ud.filter((r) => r._open).length,
          level: LEVEL_MAP[u.toLowerCase().trim()],
        };
      });

      rows.sort((a, b) => b.total - a.total);
      setScoreRows(rows);
    }

    return () => destroyChart(refProd);
  }, [d, CM]);

  const hasData = rawData.length > 0;

  return (
    <div className="page" id="export-productivity">
      
      
      <div className="topbar">
        <div>
          <h1>Productivity Analytics</h1>
          <p>Analyst-level performance & closure rates</p>
        </div>
      </div>
      {hasData && <FilterBar show={['month','user','level']} />}
      

      {hasData && (
        <>
          <div className="kpi-grid k4">
            <KpiCard label="L1 Closure Rate" value={kpis.l1Close} />
            <KpiCard label="L2 Closure Rate" value={kpis.l2Close} />
            <KpiCard label="L3 Closure Rate" value={kpis.l3Close} />
            <KpiCard label="Overall Closure" value={kpis.overall} />
          </div>

          <div style={{ height: 300 }}>
            <canvas ref={canvasProd} />
          </div>

          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Full Analyst Performance Table</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th><th>Analyst</th><th>Level</th><th>Total</th><th>Closed</th><th>Open</th>
                </tr>
              </thead>
              <tbody>
                {scoreRows.map((r, i) => (
                  <tr key={r.u}>
                    <td>{i + 1}</td>
                    <td>{r.u}</td>
                    <td>{r.level}</td>
                    <td>{r.total}</td>
                    <td>{r.closed}</td>
                    <td>{r.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}





// import { useEffect, useRef, useState, useMemo } from 'react';
// import { Chart } from 'chart.js/auto';
// import { useData } from '../context/DataContext';
// import KpiCard from '../components/KpiCard';
// import FilterBar from '../components/FilterBar';
// import ExportButton from '../components/ExportButton';
// import { getMonthKey } from '../utils/dataUtils';

// function destroyChart(chartRef) {
//   if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
// }

// // ─── Level & Analyst config ───────────────────────────────────────────────────
// const EXCLUDED   = ['neetu1.singh', 'sandeep.kumar'];
// const LEVEL_MAP  = {
//   'm-nitin1.thakur':    'L2',
//   'm-vishwa.singh':     'L1',
//   'manish.kumar':       'L3',
//   'manisha.gupta':      'L2',
//   'mohini.vishwakarma': 'L1',
//   'ruchi1.kumari':      'L3',
//   'upasana':            'L3',
//   'abhishek.dhanda':    'L1',
// };
// const L1_ANALYSTS = Object.entries(LEVEL_MAP).filter(([,v]) => v === 'L1').map(([k]) => k);
// const L2_ANALYSTS = Object.entries(LEVEL_MAP).filter(([,v]) => v === 'L2').map(([k]) => k);
// const L3_ANALYSTS = Object.entries(LEVEL_MAP).filter(([,v]) => v === 'L3').map(([k]) => k);

// // ─── Month helpers ────────────────────────────────────────────────────────────
// const MONTH_NAMES = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];
// function fmtMonth(mk) {
//   if (!mk) return mk;
//   const m = mk.match(/^(\d{4})-(\d{2})$/);
//   if (m) return `${MONTH_NAMES[parseInt(m[2],10)-1]||mk} ${m[1]}`;
//   return mk;
// }

// // ─── Case Journey Builder ─────────────────────────────────────────────────────
// // Groups all rows by case_id, builds per-case journey across L1→L2→L3
// function buildCaseJourneys(rows, CM) {
//   if (!CM.caseId || !CM.user) return {};
//   const journeys = {};
//   rows.forEach((r) => {
//     const cid  = r[CM.caseId];
//     const user = (r[CM.user] || '').toLowerCase().trim();
//     const lvl  = r._level;
//     if (!cid || !user || lvl === 'OTHER') return;
//     if (!journeys[cid]) journeys[cid] = { L1: null, L2: null, L3: null };
//     journeys[cid][lvl] = { user, closed: r._closed, str: r._str, open: r._open };
//   });
//   return journeys;
// }

// // ─── Analyst Journey Summary ──────────────────────────────────────────────────
// function buildAnalystSummary(journeys, level) {
//   const summary = {};

//   Object.values(journeys).forEach((j) => {
//     const entry = j[level];
//     if (!entry) return;
//     const u = entry.user;
//     if (EXCLUDED.includes(u)) return;
//     if (!summary[u]) summary[u] = {
//       user: u, level,
//       total: 0, closed: 0, open: 0, str: 0,
//       escalatedToNext: 0,
//       // for L1: how many went to L2, then L3, then closed/str at L3
//       nextLevelClosed: 0, nextLevelSTR: 0, nextLevelEscalated: 0,
//       // for L2: how many went to L3
//       l3Closed: 0, l3STR: 0,
//     };

//     const s = summary[u];
//     s.total++;
//     if (entry.closed) s.closed++;
//     if (entry.open)   s.open++;
//     if (entry.str)    s.str++;

//     if (level === 'L1') {
//       // Was this case escalated to L2?
//       if (j.L2) {
//         s.escalatedToNext++;
//         // Was it further escalated to L3?
//         if (j.L3) {
//           s.nextLevelEscalated++;
//           if (j.L3.closed) s.nextLevelClosed++;
//           if (j.L3.str)    s.nextLevelSTR++;
//         } else {
//           // Closed at L2
//           if (j.L2.closed) s.nextLevelClosed++;
//         }
//       }
//     }

//     if (level === 'L2') {
//       // Was this case escalated to L3?
//       if (j.L3) {
//         s.escalatedToNext++;
//         if (j.L3.closed) s.l3Closed++;
//         if (j.L3.str)    s.l3STR++;
//       }
//     }
//   });

//   return Object.values(summary).sort((a, b) => b.total - a.total);
// }

// // ─── Journey Card Component ───────────────────────────────────────────────────
// function JourneyCard({ analyst, level, journeys }) {
//   const data = useMemo(() => {
//     const filtered = {};
//     Object.entries(journeys).forEach(([cid, j]) => {
//       if (j[level]?.user === analyst) filtered[cid] = j;
//     });
//     return filtered;
//   }, [analyst, level, journeys]);

//   const total    = Object.keys(data).length;
//   const closed   = Object.values(data).filter(j => j[level]?.closed).length;
//   const str      = Object.values(data).filter(j => j[level]?.str).length;
//   const open     = Object.values(data).filter(j => j[level]?.open).length;

//   // Escalation stats
//   const escalToL2 = level === 'L1'
//     ? Object.values(data).filter(j => j.L2).length : null;
//   const escalToL3 = level === 'L2' || level === 'L1'
//     ? Object.values(data).filter(j => j.L3).length : null;
//   const l3Closed  = Object.values(data).filter(j => j.L3?.closed).length;
//   const l3STR     = Object.values(data).filter(j => j.L3?.str).length;
//   const l2Closed  = level === 'L1'
//     ? Object.values(data).filter(j => j.L2?.closed && !j.L3).length : null;

//   const pill = (txt, color) => (
//     <span style={{
//       background: color + '18', color, border: `1px solid ${color}40`,
//       borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
//       marginRight: 6, whiteSpace: 'nowrap',
//     }}>{txt}</span>
//   );

//   const levelColor = level === 'L1' ? '#1a73e8' : level === 'L2' ? '#f59e0b' : '#7c3aed';

//   return (
//     <div style={{
//       background: '#fff',
//       border: `1.5px solid ${levelColor}30`,
//       borderLeft: `4px solid ${levelColor}`,
//       borderRadius: 10,
//       padding: '14px 16px',
//       marginBottom: 10,
//     }}>
//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
//         <span style={{
//           background: levelColor, color: '#fff',
//           borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 800,
//         }}>{level}</span>
//         <span style={{ fontWeight: 700, fontSize: 13 }}>{analyst}</span>
//         <span style={{ color: '#8896ab', fontSize: 11 }}>· {total} total cases</span>
//       </div>

//       {/* Stats row */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: level !== 'L3' ? 10 : 0 }}>
//         {pill(`✅ ${closed} Closed`, '#0f9d58')}
//         {pill(`🔓 ${open} Open`, '#d93025')}
//         {str > 0 && pill(`🚨 ${str} STR`, '#dc2626')}
//         {level === 'L1' && escalToL2 !== null &&
//           pill(`⬆ ${escalToL2} → L2`, '#f59e0b')}
//         {level === 'L2' && escalToL3 !== null &&
//           pill(`⬆ ${escalToL3} → L3`, '#7c3aed')}
//       </div>

//       {/* Journey breakdown */}
//       {level === 'L1' && escalToL2 > 0 && (
//         <div style={{
//           background: '#f8faff', borderRadius: 8, padding: '8px 12px',
//           fontSize: 11, color: '#4a5568', borderLeft: '3px solid #f59e0b',
//         }}>
//           <span style={{ fontWeight: 700, color: '#f59e0b' }}>L2 Outcome: </span>
//           {l2Closed > 0 && <span style={{ marginRight: 8 }}>✅ {l2Closed} closed at L2</span>}
//           {escalToL3 > 0 && (
//             <>
//               <span style={{ marginRight: 8 }}>⬆ {escalToL3} further → L3</span>
//               {l3Closed > 0 && <span style={{ marginRight: 8, color: '#0f9d58' }}>✅ {l3Closed} closed at L3</span>}
//               {l3STR > 0   && <span style={{ color: '#dc2626' }}>🚨 {l3STR} STR at L3</span>}
//             </>
//           )}
//         </div>
//       )}

//       {level === 'L2' && escalToL3 > 0 && (
//         <div style={{
//           background: '#faf8ff', borderRadius: 8, padding: '8px 12px',
//           fontSize: 11, color: '#4a5568', borderLeft: '3px solid #7c3aed',
//         }}>
//           <span style={{ fontWeight: 700, color: '#7c3aed' }}>L3 Outcome: </span>
//           {l3Closed > 0 && <span style={{ marginRight: 8, color: '#0f9d58' }}>✅ {l3Closed} closed at L3</span>}
//           {l3STR > 0    && <span style={{ color: '#dc2626' }}>🚨 {l3STR} STR filed at L3</span>}
//         </div>
//       )}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Productivity({ onUploadClick }) {
//   const { filteredData, rawData, fileName, CM } = useData();
//   const d = filteredData.length ? filteredData : rawData;

//   const refProd   = useRef(null);
//   const canvasProd = useRef(null);

//   const [kpis,      setKpis]      = useState({});
//   const [scoreRows, setScoreRows] = useState([]);

//   // ── Build case journeys from filtered data ────────────────────────────────
//   const caseJourneys = useMemo(() => buildCaseJourneys(d, CM), [d, CM]);

//   // ── All unique analysts in filtered data ──────────────────────────────────
//   const allAnalysts = useMemo(() => {
//     if (!CM.user) return [];
//     return [...new Set(d.map(r => (r[CM.user]||'').toLowerCase().trim()).filter(Boolean))]
//       .filter(u => !EXCLUDED.includes(u) && LEVEL_MAP[u])
//       .sort();
//   }, [d, CM]);

//   // ── Selected analyst for journey card ─────────────────────────────────────
//   const [selectedAnalyst, setSelectedAnalyst] = useState('all');

//   // Analysts to show in journey section
//   const journeyAnalysts = useMemo(() => {
//     if (selectedAnalyst !== 'all') return [selectedAnalyst];
//     return allAnalysts;
//   }, [selectedAnalyst, allAnalysts]);

//   useEffect(() => {
//     if (!d.length) return;

//     // KPIs
//     const rates = {};
//     ['L1','L2','L3'].forEach((lv) => {
//       const lvData = d.filter(r => r._level === lv);
//       const cls    = lvData.filter(r => r._closed).length;
//       rates[lv]    = lvData.length > 0 ? ((cls/lvData.length)*100).toFixed(1)+'%' : '—';
//     });
//     const overall = d.length > 0
//       ? ((d.filter(r=>r._closed).length/d.length)*100).toFixed(1)+'%' : '—';

//     const avgDays = {};
//     ['L1','L2','L3'].forEach((lv) => {
//       const cls = d.filter(r => r._level===lv && r._closed && r._ageing!==null);
//       avgDays[lv] = cls.length
//         ? (cls.reduce((s,r)=>s+r._ageing,0)/cls.length).toFixed(1)+'d' : '—';
//     });
//     setKpis({ l1Close:rates.L1, l2Close:rates.L2, l3Close:rates.L3, overall,
//                l1Avg:avgDays.L1, l2Avg:avgDays.L2, l3Avg:avgDays.L3 });

//     // Chart
//     destroyChart(refProd);
//     const byMonth = {};
//     d.forEach((r) => {
//       if (!r._closed) return;
//       const mk = getMonthKey(r,CM); if (!mk) return;
//       if (!byMonth[mk]) byMonth[mk] = { L1:0, L2:0, L3:0, analysts: new Set() };
//       byMonth[mk][r._level]++;
//       if (CM.user && r[CM.user]) byMonth[mk].analysts.add(r[CM.user]);
//     });
//     const months = Object.keys(byMonth).sort();
//     const avgProd = months.map((m) => {
//       const a = byMonth[m].analysts.size;
//       const t = byMonth[m].L1 + byMonth[m].L2 + byMonth[m].L3;
//       return a > 0 ? (t/a).toFixed(2) : 0;
//     });
//     refProd.current = new Chart(canvasProd.current, {
//       type: 'bar',
//       data: {
//         labels: months,
//         datasets: [
//           { label:'L1 Closed', data:months.map(m=>byMonth[m].L1), backgroundColor:'rgba(26,115,232,0.75)', stack:'s' },
//           { label:'L2 Closed', data:months.map(m=>byMonth[m].L2), backgroundColor:'rgba(245,158,11,0.75)',  stack:'s' },
//           { label:'L3 Closed', data:months.map(m=>byMonth[m].L3), backgroundColor:'rgba(124,58,237,0.75)', stack:'s' },
//           { label:'Avg Productivity', data:avgProd, type:'line', borderColor:'#d93025', yAxisID:'yProd' },
//         ],
//       },
//       options: {
//         responsive: true,
//         plugins: { legend: { display:true, position:'top' } },
//         scales: { y:{ stacked:true }, x:{ stacked:true }, yProd:{ position:'right' } },
//       },
//     });

//     // Score table
//     if (CM.user) {
//       const filtered = d.filter((r) => {
//         const user = (r[CM.user]||'').toLowerCase().trim();
//         if (!user || EXCLUDED.includes(user)) return false;
//         return LEVEL_MAP[user] && r._level === LEVEL_MAP[user];
//       });
//       const uniqueMap = new Map();
//       filtered.forEach((r) => {
//         const key = r[CM.user]+'_'+(r[CM.caseId]||'');
//         if (!uniqueMap.has(key)) uniqueMap.set(key, r);
//       });
//       const uniqueRows = Array.from(uniqueMap.values());
//       const users = [...new Set(uniqueRows.map(r=>r[CM.user]))];
//       const rows = users.map((u) => {
//         const ud = uniqueRows.filter(r=>r[CM.user]===u);
//         return {
//           u, total:ud.length,
//           closed:ud.filter(r=>r._closed).length,
//           open:ud.filter(r=>r._open).length,
//           str:ud.filter(r=>r._str).length,
//           level:LEVEL_MAP[u.toLowerCase().trim()],
//         };
//       }).sort((a,b)=>b.total-a.total);
//       setScoreRows(rows);
//     }

//     return () => destroyChart(refProd);
//   }, [d, CM]);

//   const hasData = rawData.length > 0;

//   return (
//     <div className="page" id="export-productivity">
//       <div className="topbar">
//         <div>
//           <h1>Productivity Analytics</h1>
//           <p>Analyst-level performance &amp; closure rates</p>
//         </div>
//       </div>

//       {hasData && <FilterBar show={['month','user','level']} />}

//       {hasData && (
//         <>
//           {/* ── KPI Cards ──────────────────────────────────────── */}
//           <div className="kpi-grid k4" style={{ marginBottom: 12 }}>
//             <KpiCard label="L1 Closure Rate" value={kpis.l1Close} icon="🎯" variant="blue-v" />
//             <KpiCard label="L2 Closure Rate" value={kpis.l2Close} icon="📊" variant="amber-v" />
//             <KpiCard label="L3 Closure Rate" value={kpis.l3Close} icon="🔺" variant="purple-v" />
//             <KpiCard label="Overall Closure"  value={kpis.overall} icon="✅" variant="green-v" />
//           </div>

//           {/* ── Chart ─────────────────────────────────────────── */}
//           <div className="card" style={{ marginBottom: 16 }}>
//             <div className="card-hdr">
//               <div className="card-title">Monthly Closed Cases by Level</div>
//             </div>
//             <div style={{ height: 300 }}>
//               <canvas ref={canvasProd} />
//             </div>
//           </div>

//           {/* ── Full Analyst Performance Table ────────────────── */}
//           <div className="card" style={{ marginBottom: 20 }}>
//             <div className="card-hdr">
//               <div className="card-title">Full Analyst Performance Table</div>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>#</th><th>Analyst</th><th>Level</th>
//                   <th>Total</th><th>Closed</th><th>Open</th><th>STR</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {scoreRows.map((r, i) => (
//                   <tr key={r.u}>
//                     <td>{i+1}</td>
//                     <td style={{ fontWeight:600 }}>{r.u}</td>
//                     <td>
//                       <span className={`pill pill-${r.level==='L1'?'blue':r.level==='L2'?'amber':'purple'}`}>
//                         {r.level}
//                       </span>
//                     </td>
//                     <td>{r.total}</td>
//                     <td style={{ color:'#0f9d58', fontWeight:600 }}>{r.closed}</td>
//                     <td style={{ color:'#d93025', fontWeight:600 }}>{r.open}</td>
//                     <td style={{ color:'#dc2626', fontWeight:700 }}>{r.str||0}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* ── Case Journey Section ───────────────────────────── */}
//           <div className="sec-label">Case Journey — Analyst Escalation Summary</div>

//           {/* Analyst filter for journey */}
//           <div style={{ marginBottom: 14, display:'flex', alignItems:'center', gap:10 }}>
//             <span style={{ fontSize:12, color:'#8896ab', fontWeight:600 }}>View analyst:</span>
//             <select
//               value={selectedAnalyst}
//               onChange={e => setSelectedAnalyst(e.target.value)}
//               style={{
//                 background:'var(--surface2)', border:'1.5px solid var(--border)',
//                 borderRadius:8, padding:'6px 12px', fontSize:12,
//                 color:'var(--text)', fontFamily:"'Inter',sans-serif", outline:'none',
//                 minWidth:200, fontWeight:600,
//               }}
//             >
//               <option value="all">All Analysts</option>
//               {allAnalysts.map(u => (
//                 <option key={u} value={u}>
//                   {u} ({LEVEL_MAP[u]})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* L1 Analysts */}
//           {journeyAnalysts.filter(u => LEVEL_MAP[u]==='L1').length > 0 && (
//             <div style={{ marginBottom: 16 }}>
//               <div style={{
//                 fontSize:11, fontWeight:800, color:'#1a73e8',
//                 letterSpacing:'0.05em', marginBottom:8, textTransform:'uppercase',
//               }}>
//                 L1 Analysts
//               </div>
//               {journeyAnalysts
//                 .filter(u => LEVEL_MAP[u]==='L1')
//                 .map(u => (
//                   <JourneyCard
//                     key={u}
//                     analyst={u}
//                     level="L1"
//                     journeys={caseJourneys}
//                   />
//                 ))
//               }
//             </div>
//           )}

//           {/* L2 Analysts */}
//           {journeyAnalysts.filter(u => LEVEL_MAP[u]==='L2').length > 0 && (
//             <div style={{ marginBottom: 16 }}>
//               <div style={{
//                 fontSize:11, fontWeight:800, color:'#f59e0b',
//                 letterSpacing:'0.05em', marginBottom:8, textTransform:'uppercase',
//               }}>
//                 L2 Analysts
//               </div>
//               {journeyAnalysts
//                 .filter(u => LEVEL_MAP[u]==='L2')
//                 .map(u => (
//                   <JourneyCard
//                     key={u}
//                     analyst={u}
//                     level="L2"
//                     journeys={caseJourneys}
//                   />
//                 ))
//               }
//             </div>
//           )}

//           {/* L3 Analysts */}
//           {journeyAnalysts.filter(u => LEVEL_MAP[u]==='L3').length > 0 && (
//             <div style={{ marginBottom: 16 }}>
//               <div style={{
//                 fontSize:11, fontWeight:800, color:'#7c3aed',
//                 letterSpacing:'0.05em', marginBottom:8, textTransform:'uppercase',
//               }}>
//                 L3 Analysts
//               </div>
//               {journeyAnalysts
//                 .filter(u => LEVEL_MAP[u]==='L3')
//                 .map(u => (
//                   <JourneyCard
//                     key={u}
//                     analyst={u}
//                     level="L3"
//                     journeys={caseJourneys}
//                   />
//                 ))
//               }
//             </div>
//           )}

//           {Object.keys(caseJourneys).length === 0 && (
//             <div style={{ textAlign:'center', padding:32, color:'#8896ab' }}>
//               No case journey data found. Make sure case_id and user_name columns are present.
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }









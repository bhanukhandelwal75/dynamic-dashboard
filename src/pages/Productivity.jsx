import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useData } from '../context/DataContext';
import KpiCard from '../components/KpiCard';
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
  const d = filteredData.length ? filteredData : rawData;

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

    // ── Avg days to close per level ───────────────────
    const avgDays = {};
    ['L1', 'L2', 'L3'].forEach((lv, i) => {
      const cls = d.filter((r) => r._level === lv && r._closed && r._ageing !== null);
      avgDays[lv] = cls.length ? (cls.reduce((s, r) => s + r._ageing, 0) / cls.length).toFixed(1) + 'd' : '—';
    });

    setKpis({
      l1Close: rates.L1, l2Close: rates.L2, l3Close: rates.L3, overall,
      l1Avg: avgDays.L1, l2Avg: avgDays.L2, l3Avg: avgDays.L3,
    });

    // ── Prod Trend Chart ──────────────────────────────
    destroyChart(refProd);
    const byMonth = {};
    d.forEach((r) => {
      if (!r._closed) return;
      const mk = getMonthKey(r, CM); if (!mk) return;
      if (!byMonth[mk]) byMonth[mk] = { L1: 0, L2: 0, L3: 0, analysts: new Set() };
      byMonth[mk][r._level] = (byMonth[mk][r._level] || 0) + 1;
      if (CM.user && r[CM.user]) byMonth[mk].analysts.add(r[CM.user]);
    });
    const months = Object.keys(byMonth).sort();
    setBadge(months.length + ' months');
    const avgProd = months.map((m) => {
      const a = byMonth[m].analysts.size;
      const t = (byMonth[m].L1 || 0) + (byMonth[m].L2 || 0) + (byMonth[m].L3 || 0);
      return a > 0 ? (t / a).toFixed(2) : 0;
    });

    refProd.current = new Chart(canvasProd.current, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'L1 Closed', data: months.map((m) => byMonth[m].L1 || 0), backgroundColor: 'rgba(26,115,232,0.75)', borderRadius: 4, stack: 's' },
          { label: 'L2 Closed', data: months.map((m) => byMonth[m].L2 || 0), backgroundColor: 'rgba(245,158,11,0.75)', borderRadius: 4, stack: 's' },
          { label: 'L3 Closed', data: months.map((m) => byMonth[m].L3 || 0), backgroundColor: 'rgba(124,58,237,0.75)', borderRadius: 4, stack: 's' },
          { label: 'Avg Productivity', data: avgProd, type: 'line', borderColor: '#d93025', backgroundColor: 'transparent', pointBackgroundColor: '#d93025', tension: 0.35, yAxisID: 'yProd', pointRadius: 5, borderWidth: 2.5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 } } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } }, stacked: true },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } }, stacked: true, title: { display: true, text: 'Cases Closed', color: '#8896ab', font: { size: 10 } } },
          yProd: { position: 'right', grid: { display: false }, ticks: { color: '#d93025', font: { family: 'Inter', size: 10 } }, title: { display: true, text: 'Avg Prod (cases/analyst)', color: '#d93025', font: { size: 10 } } },
        },
      },
    });

    // ── Level Age Charts ──────────────────────────────
    const renderLevelAge = (ref, canvas, level) => {
      destroyChart(ref);
      if (!CM.user) return;
      const lvData = d.filter((r) => r._level === level && r._closed && r._ageing !== null);
      const byUser = {};
      lvData.forEach((r) => {
        const u = r[CM.user] || 'Unknown';
        if (!byUser[u]) byUser[u] = [];
        byUser[u].push(r._ageing);
      });
      const users = Object.keys(byUser).sort();
      const avgs  = users.map((u) => +(byUser[u].reduce((a, b) => a + b, 0) / byUser[u].length).toFixed(1));
      const overallAvg = avgs.reduce((a, b) => a + b, 0) / (avgs.length || 1);
      ref.current = new Chart(canvas.current, {
        type: 'bar',
        data: { labels: users, datasets: [{ label: `${level} Avg Days`, data: avgs, backgroundColor: avgs.map((v) => v > overallAvg * 1.3 ? 'rgba(217,48,37,0.7)' : v < overallAvg * 0.8 ? 'rgba(15,157,88,0.7)' : 'rgba(245,158,11,0.6)'), borderRadius: 5 }] },
        options: { ...BASE_OPTS, indexAxis: 'y' },
      });
    };
    renderLevelAge(refL1Age, canvasL1Age, 'L1');
    renderLevelAge(refL2Age, canvasL2Age, 'L2');

    // ── Score Table ───────────────────────────────────
    if (CM.user) {
      const users = [...new Set(d.map((r) => r[CM.user] || '').filter(Boolean))].sort();
      const rows = users.map((u) => {
        const ud     = d.filter((r) => r[CM.user] === u);
        const total  = ud.length;
        const closed = ud.filter((r) => r._closed).length;
        const open   = ud.filter((r) => r._open).length;
        const l1 = ud.filter((r) => r._level === 'L1').length;
        const l2 = ud.filter((r) => r._level === 'L2').length;
        const l3 = ud.filter((r) => r._level === 'L3').length;
        const aged   = ud.filter((r) => r._ageing !== null).map((r) => r._ageing);
        const avgAge = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) : '—';
        return { u, total, closed, open, l1, l2, l3, avgAge, _aged: aged.length ? aged.reduce((a, b) => a + b, 0) / aged.length : null };
      });
      const maxT = Math.max(...rows.map((r) => r.total), 1);
      rows.sort((a, b) => b.total - a.total);
      setScoreRows(rows.map((r) => ({ ...r, score: Math.round((r.total / maxT) * 100) })));
    }

    return () => {
      destroyChart(refProd); destroyChart(refL1Age); destroyChart(refL2Age);
    };
  }, [d, CM]);

  const hasData = rawData.length > 0;

  const scoreColor = (s) => s >= 75 ? '#0f9d58' : s >= 45 ? '#f59e0b' : '#d93025';
  const perfLabel  = (s) =>
    s >= 75 ? <span className="pill pill-green">⭐ Top Performer</span>
    : s >= 45 ? <span className="pill pill-amber">📊 Average</span>
    : <span className="pill pill-red">⚠ Needs Attention</span>;
  const ageStyle = (v) => v === null ? '' : v > 30 ? { color: '#d93025', fontWeight: 700 } : v > 14 ? { color: '#f59e0b', fontWeight: 600 } : { color: '#0f9d58', fontWeight: 600 };

  return (
    <div className="page" id="export-productivity">
      <div className="topbar">
        <div><h1>Productivity Analytics</h1><p>Analyst-level performance &amp; closure rates</p></div>
        <div className="topbar-right">
          <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
            {hasData ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}` : '📂 Upload CDR File'}
          </button>
          <ExportButton
            targetId="export-productivity"
            pageTitle="Productivity Analytics"
            subTitle={hasData ? `${d.length.toLocaleString()} cases · ${fileName}` : ''}
            disabled={!hasData}
          />
        </div>
      </div>

      {!hasData && <div className="empty-state" style={{ marginTop: 60 }}><div className="ei">📈</div><p>Upload a CDR file to view productivity analytics</p></div>}

      {hasData && (
        <>
          <div className="sec-label">Closure Rates</div>
          <div className="kpi-grid k4">
            <KpiCard label="L1 Closure Rate"  value={kpis.l1Close}  sub="Closed / Assigned L1" variant="blue-v" />
            <KpiCard label="L2 Closure Rate"  value={kpis.l2Close}  sub="Closed / Assigned L2" variant="amber-v" />
            <KpiCard label="L3 Closure Rate"  value={kpis.l3Close}  sub="Closed / Assigned L3" icon="🔺" variant="purple-v" />
            <KpiCard label="Overall Closure"  value={kpis.overall} sub="All levels combined"   variant="green-v" />
          </div>

          <div className="kpi-grid k3">
            <KpiCard label="Avg Days to Close (L1)" value={kpis.l1Avg} sub="Per analyst avg" variant="teal-v" />
            <KpiCard label="Avg Days to Close (L2)" value={kpis.l2Avg} sub="Per analyst avg" variant="amber-v" />
            <KpiCard label="Avg Days to Close (L3)" value={kpis.l3Avg} sub="Per analyst avg" variant="purple-v" />
          </div>

          <div className="sec-label">Cases Closed &amp; Avg Productivity by Month &amp; Level</div>
          <div className="chart-row" style={{ marginBottom: 14 }}>
            <ChartCard title="Monthly Cases Closed + Avg Productivity" sub="Bars = Cases closed by level · Line = Avg cases/analyst/month" badge={badge} badgeClass="badge-blue" height="h280">
              <canvas ref={canvasProd} />
            </ChartCard>
          </div>

          <div className="chart-row r2">
            <ChartCard title="L1 Avg Days to Close per Analyst" sub="Only closed L1 cases with dates" height="h240">
              <canvas ref={canvasL1Age} />
            </ChartCard>
            <ChartCard title="L2 Avg Days to Close per Analyst" sub="Only closed L2 cases with dates" height="h240">
              <canvas ref={canvasL2Age} />
            </ChartCard>
          </div>

          <div className="sec-label">Analyst Scoreboard</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-hdr">
              <div>
                <div className="card-title">Full Analyst Performance Table</div>
                <div className="card-sub">Green = top · Amber = avg · Red = needs attention</div>
              </div>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Analyst</th><th>Total</th><th>Closed</th><th>Open</th>
                    <th>L1</th><th>L2</th><th>L3</th><th>Avg Age (days)</th>
                    <th>Productivity Score</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreRows.map((r, i) => (
                    <tr key={r.u}>
                      <td className="mono" style={{ color: '#8896ab' }}>#{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.u}</td>
                      <td className="mono">{r.total.toLocaleString()}</td>
                      <td className="mono" style={{ color: '#0f9d58' }}>{r.closed.toLocaleString()}</td>
                      <td className="mono" style={{ color: '#d93025' }}>{r.open.toLocaleString()}</td>
                      <td className="mono">{r.l1}</td>
                      <td className="mono">{r.l2}</td>
                      <td className="mono">{r.l3}</td>
                      <td className="mono" style={ageStyle(r._aged)}>{r.avgAge === '—' ? '—' : r.avgAge + 'd'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="prog-bar">
                            <div className="prog-fill" style={{ width: r.score + '%', background: scoreColor(r.score) }} />
                          </div>
                          <span className="mono" style={{ color: scoreColor(r.score) }}>{r.score}</span>
                        </div>
                      </td>
                      <td>{perfLabel(r.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

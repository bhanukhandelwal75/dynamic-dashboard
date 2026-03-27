import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useData } from '../context/DataContext';
import ChartCard from '../components/ChartCard';
import ExportButton from '../components/ExportButton';
import { getMonthKey } from '../utils/dataUtils';

function destroyChart(ref) {
  if (ref.current) { ref.current.destroy(); ref.current = null; }
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

export default function Ageing() {
  const { filteredData, rawData, CM } = useData();
  const d = filteredData.length ? filteredData : rawData;

  const refBuckets = useRef(null); const canvasBuckets = useRef(null);
  const refTAT     = useRef(null); const canvasTAT     = useRef(null);

  const [summaryHTML, setSummaryHTML] = useState('');
  const [tatRows,     setTatRows]     = useState([]);
  const [tatBadge,    setTatBadge]    = useState('—');

  useEffect(() => {
    if (!d.length) return;

    const openCases = d.filter((r) => r._open && r._ageing !== null);

    // ── Ageing buckets ────────────────────────────────
    const buckets = { '0-10': 0, '11-15': 0, '16-25': 0, '26-30': 0, '30+': 0 };
    openCases.forEach((r) => {
      const a = r._ageing;
      if (a <= 10) buckets['0-10']++;
      else if (a <= 15) buckets['11-15']++;
      else if (a <= 25) buckets['16-25']++;
      else if (a <= 30) buckets['26-30']++;
      else buckets['30+']++;
    });

    // ── Monthly ageing summary ────────────────────────
    const byMonth = {};
    d.forEach((r) => {
      const mk = getMonthKey(r, CM); if (!mk) return;
      const lv = r._level; if (lv === 'OTHER') return;
      if (!byMonth[mk]) byMonth[mk] = {};
      if (!byMonth[mk][lv]) byMonth[mk][lv] = { assigned: 0, open: 0, completed: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
      byMonth[mk][lv].assigned++;
      if (r._open) {
        byMonth[mk][lv].open++;
        if (r._ageing !== null) {
          const a = r._ageing;
          if      (a <= 10) byMonth[mk][lv].b0++;
          else if (a <= 15) byMonth[mk][lv].b11++;
          else if (a <= 25) byMonth[mk][lv].b16++;
          else if (a <= 30) byMonth[mk][lv].b26++;
          else               byMonth[mk][lv].b30++;
        }
      }
      if (r._closed) byMonth[mk][lv].completed++;
    });

    // Build summary table HTML (using dangerouslySetInnerHTML for the complex rowspan table)
    const months = Object.keys(byMonth).sort();
    let html = `<div class="card"><div class="card-hdr"><div><div class="card-title">Weekly Summary — Ageing by Month &amp; Level</div><div class="card-sub">Assigned · Open · Completed · Ageing Buckets</div></div></div>
      <div class="tbl-wrap"><table class="ageing-table"><thead><tr>
        <th>Month</th><th>Level</th><th>Assigned</th><th>Open</th><th>Completed</th>
        <th style="background:#e8f5e9">0-10 days</th><th style="background:#fff3e0">11-15 days</th>
        <th style="background:#fce4ec">16-25 days</th><th style="background:#ffebee">26-30 days</th>
        <th style="background:#ffebee">30+ days</th>
      </tr></thead><tbody>`;

    months.forEach((mk) => {
      const lvls = ['L1', 'L2', 'L3'];
      const validLvls = lvls.filter((l) => byMonth[mk][l]);
      validLvls.forEach((lv, li) => {
        const x = byMonth[mk][lv];
        const pillClass = lv === 'L1' ? 'pill-blue' : lv === 'L2' ? 'pill-amber' : 'pill-purple';
        html += `<tr>
          ${li === 0 ? `<td style="font-weight:700;vertical-align:top" rowspan="${validLvls.length}">${mk}</td>` : ''}
          <td><span class="pill ${pillClass}">${lv}</span></td>
          <td class="mono">${x.assigned}</td>
          <td class="mono" style="color:#d93025;font-weight:600">${x.open}</td>
          <td class="mono" style="color:#0f9d58">${x.completed}</td>
          <td class="mono" style="background:#f1f8e9">${x.b0}</td>
          <td class="mono" style="background:#fff8e1">${x.b11}</td>
          <td class="mono" style="background:#fce4ec;${x.b16 > 0 ? 'color:#d93025;font-weight:600' : ''}">${x.b16}</td>
          <td class="mono" style="background:#ffebee;${x.b26 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b26}</td>
          <td class="mono" style="background:#ffebee;${x.b30 > 0 ? 'color:#b71c1c;font-weight:700' : ''}">${x.b30}</td>
        </tr>`;
      });
    });
    html += `</tbody></table></div></div>`;
    setSummaryHTML(html);

    // ── Bucket Chart ──────────────────────────────────
    destroyChart(refBuckets);
    refBuckets.current = new Chart(canvasBuckets.current, {
      type: 'bar',
      data: {
        labels: Object.keys(buckets),
        datasets: [{ label: 'Open Cases', data: Object.values(buckets), backgroundColor: ['rgba(15,157,88,0.7)', 'rgba(245,158,11,0.65)', 'rgba(217,48,37,0.55)', 'rgba(217,48,37,0.75)', 'rgba(183,28,28,0.8)'], borderRadius: 6 }],
      },
      options: BASE_OPTS,
    });

    // ── TAT breach per analyst ────────────────────────
    if (CM.user) {
      const breach = {};
      openCases.forEach((r) => {
        const u = r[CM.user] || 'Unknown';
        if (!breach[u]) breach[u] = { total: 0, b0: 0, b11: 0, b16: 0, b26: 0, b30: 0 };
        breach[u].total++;
        const a = r._ageing;
        if      (a <= 10) breach[u].b0++;
        else if (a <= 15) breach[u].b11++;
        else if (a <= 25) breach[u].b16++;
        else if (a <= 30) breach[u].b26++;
        else               breach[u].b30++;
      });
      const breachArr = Object.entries(breach)
        .map(([u, x]) => ({ u, ...x, breachCount: x.b11 + x.b16 + x.b26 + x.b30 }))
        .filter((x) => x.breachCount > 0)
        .sort((a, b) => b.breachCount - a.breachCount);

      setTatBadge(breachArr.reduce((s, x) => s + x.breachCount, 0) + ' breach cases');
      setTatRows(breachArr);

      destroyChart(refTAT);
      refTAT.current = new Chart(canvasTAT.current, {
        type: 'bar',
        data: { labels: breachArr.map((x) => x.u), datasets: [{ label: 'Breach Cases (>10d)', data: breachArr.map((x) => x.breachCount), backgroundColor: 'rgba(217,48,37,0.7)', borderRadius: 5 }] },
        options: { ...BASE_OPTS, indexAxis: 'y' },
      });
    }

    return () => { destroyChart(refBuckets); destroyChart(refTAT); };
  }, [d, CM]);

  const hasData = rawData.length > 0;

  const breachPctPill = (pct) => {
    const v = parseFloat(pct);
    return isNaN(v)
      ? <span className="pill pill-gray">{pct}</span>
      : v > 50 ? <span className="pill pill-red">{pct}</span>
      : v > 20 ? <span className="pill pill-amber">{pct}</span>
      : <span className="pill pill-green">{pct}</span>;
  };

  return (
    <div className="page" id="export-ageing">
      <div className="topbar">
        <div><h1>Ageing Analysis</h1><p>Open case ageing buckets &amp; TAT breach analysis</p></div>
        <div className="topbar-right">
          <ExportButton
            targetId="export-ageing"
            pageTitle="Ageing Analysis"
            subTitle={hasData ? `${d.length.toLocaleString()} cases loaded` : ''}
            disabled={!hasData}
          />
        </div>
      </div>

      {!hasData && <div className="empty-state" style={{ marginTop: 60 }}><div className="ei">⏱</div><p>Upload a CDR file to view ageing analysis</p></div>}

      {hasData && (
        <>
          <div className="sec-label">Open Cases Ageing Summary (Weekly Summary View)</div>
          <div style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: summaryHTML }} />

          <div className="chart-row r2">
            <ChartCard title="Open Ageing Distribution" sub="0-10 · 11-15 · 16-25 · 26-30 · 30+ days" height="h240">
              <canvas ref={canvasBuckets} />
            </ChartCard>
            <ChartCard title="TAT Breach Analysts (Ageing > 10 days)" sub="Analysts with open cases breaching 10-day TAT" badge={tatBadge} badgeClass="badge-red" height="h240">
              <canvas ref={canvasTAT} />
            </ChartCard>
          </div>

          <div className="sec-label">TAT Breach Detail</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-hdr">
              <div>
                <div className="card-title">Analysts with TAT Breach (Open Cases &gt; 10 days)</div>
                <div className="card-sub">Sorted by breach count descending</div>
              </div>
            </div>
            <div className="tbl-wrap ageing-table">
              <table>
                <thead>
                  <tr>
                    <th>Analyst</th><th>Total Open</th><th>0-10 days</th>
                    <th>11-15 days</th><th>16-25 days</th><th>26-30 days</th>
                    <th>30+ days</th><th>TAT Breach Count</th><th>Breach %</th>
                  </tr>
                </thead>
                <tbody>
                  {tatRows.map((x) => {
                    const pct = x.total > 0 ? ((x.breachCount / x.total) * 100).toFixed(1) + '%' : '—';
                    return (
                      <tr key={x.u} className={x.breachCount > 5 ? 'tat-breach' : ''}>
                        <td style={{ fontWeight: 600 }}>{x.u}</td>
                        <td className="mono">{x.total}</td>
                        <td className="mono" style={{ color: '#0f9d58' }}>{x.b0}</td>
                        <td className="mono" style={{ color: '#f59e0b', fontWeight: 600 }}>{x.b11}</td>
                        <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b16}</td>
                        <td className="mono" style={{ color: '#d93025', fontWeight: 700 }}>{x.b26}</td>
                        <td className="mono" style={{ color: '#b71c1c', fontWeight: 800 }}>{x.b30}</td>
                        <td className="mono" style={{ color: x.breachCount > 0 ? '#d93025' : '#0f9d58', fontWeight: 700 }}>{x.breachCount}</td>
                        <td>{breachPctPill(pct)}</td>
                      </tr>
                    );
                  })}
                  {tatRows.length === 0 && (
                    <tr><td colSpan={9} className="empty-state"><div className="ei">✅</div><p>No TAT breaches found</p></td></tr>
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

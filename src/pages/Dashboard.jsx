import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useData } from '../context/DataContext';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { getMonthKey } from '../utils/dataUtils';

// ─── Chart helpers ───────────────────────────────────
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } } },
  },
};

function destroyChart(chartRef) {
  if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
}

export default function Dashboard({ onUploadClick }) {
  const { filteredData, rawData, fileName, activeSheetName, CM } = useData();
  const d = filteredData.length ? filteredData : (rawData.length ? rawData : []);

  // Chart refs
  const refTrend       = useRef(null); const canvasTrend       = useRef(null);
  const refLevels      = useRef(null); const canvasLevels      = useRef(null);
  const refStatus      = useRef(null); const canvasStatus      = useRef(null);
  const refCPA         = useRef(null); const canvasCPA         = useRef(null);
  const refCustType    = useRef(null); const canvasCustType    = useRef(null);
  const refOpenMonth   = useRef(null); const canvasOpenMonth   = useRef(null);
  const refOpenAnalyst = useRef(null); const canvasOpenAnalyst = useRef(null);

  // KPI state
  const [kpis, setKpis] = useState({});
  const [badges, setBadges] = useState({});

  useEffect(() => {
    if (!d.length) return;

    const total    = d.length;
    const closed   = d.filter((r) => r._closed).length;
    const open     = d.filter((r) => r._open).length;
    const analysts = new Set(d.map((r) => CM.user ? r[CM.user] : '').filter(Boolean)).size;
    const l1 = d.filter((r) => r._level === 'L1').length;
    const l2 = d.filter((r) => r._level === 'L2').length;
    const l3 = d.filter((r) => r._level === 'L3').length;
    const l2l3pct = (l2 + l3) > 0 ? ((l3 / (l2 + l3)) * 100).toFixed(2) + '%' : '—';
    const aged = d.filter((r) => r._ageing !== null).map((r) => r._ageing);
    const avgAge = aged.length ? (aged.reduce((a, b) => a + b, 0) / aged.length).toFixed(1) : '—';

    setKpis({
      total: total.toLocaleString(),
      closed: closed.toLocaleString(),
      closedPct: `${total > 0 ? ((closed / total) * 100).toFixed(1) : 0}% closure rate`,
      open: open.toLocaleString(),
      openPct: `${total > 0 ? ((open / total) * 100).toFixed(1) : 0}% open rate`,
      analysts,
      l2l3pct,
      l2l3sub: `L3: ${l3} / (L2+L3): ${l2 + l3}`,
      avgAge: avgAge === '—' ? '—' : avgAge + 'd',
      l1: l1.toLocaleString(),
      l1sub: `${total > 0 ? ((l1 / total) * 100).toFixed(1) : 0}% of total`,
      l2: l2.toLocaleString(),
      l2sub: `${total > 0 ? ((l2 / total) * 100).toFixed(1) : 0}% of total`,
      l3: l3.toLocaleString(),
      l3sub: `${total > 0 ? ((l3 / total) * 100).toFixed(1) : 0}% of total`,
      avgCases: analysts > 0 ? (total / analysts).toFixed(1) : '—',
    });

    // ── Trend Chart ────────────────────────────────────
    destroyChart(refTrend);
    const byMonth = {};
    d.forEach((r) => {
      const mk = getMonthKey(r, CM); if (!mk) return;
      if (!byMonth[mk]) byMonth[mk] = { L1: 0, L2: 0, L3: 0, analysts: new Set() };
      byMonth[mk][r._level] = (byMonth[mk][r._level] || 0) + 1;
      if (CM.user && r[CM.user]) byMonth[mk].analysts.add(r[CM.user]);
    });
    const months = Object.keys(byMonth).sort();
    setBadges((b) => ({ ...b, trend: months.length + ' months' }));
    const avgProd = months.map((m) => {
      const a = byMonth[m].analysts.size;
      const t = (byMonth[m].L1 || 0) + (byMonth[m].L2 || 0) + (byMonth[m].L3 || 0);
      return a > 0 ? (t / a).toFixed(1) : 0;
    });
    refTrend.current = new Chart(canvasTrend.current, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'L1', data: months.map((m) => byMonth[m].L1 || 0), backgroundColor: 'rgba(26,115,232,0.7)', borderRadius: 4, stack: 's' },
          { label: 'L2', data: months.map((m) => byMonth[m].L2 || 0), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4, stack: 's' },
          { label: 'L3', data: months.map((m) => byMonth[m].L3 || 0), backgroundColor: 'rgba(124,58,237,0.7)', borderRadius: 4, stack: 's' },
          { label: 'Avg Prod', data: avgProd, type: 'line', borderColor: '#7c3aed', backgroundColor: 'transparent', pointBackgroundColor: '#7c3aed', tension: 0.4, yAxisID: 'yProd', pointRadius: 5, borderWidth: 2.5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 } } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } }, stacked: true },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8896ab', font: { family: 'Inter', size: 10 } }, stacked: true, title: { display: true, text: 'Cases Closed', color: '#8896ab', font: { size: 10 } } },
          yProd: { position: 'right', grid: { display: false }, ticks: { color: '#7c3aed', font: { family: 'Inter', size: 10 } }, title: { display: true, text: 'Avg Productivity', color: '#7c3aed', font: { size: 10 } } },
        },
      },
    });

    // ── Levels Doughnut ────────────────────────────────
    destroyChart(refLevels);
    const other = d.filter((r) => r._level === 'OTHER').length;
    refLevels.current = new Chart(canvasLevels.current, {
      type: 'doughnut',
      data: { labels: ['L1', 'L2', 'L3', ...(other > 0 ? ['Other'] : [])], datasets: [{ data: [l1, l2, l3, ...(other > 0 ? [other] : [])], backgroundColor: ['#1a73e8', '#f59e0b', '#7c3aed', '#8896ab'], borderWidth: 2, borderColor: '#fff', hoverOffset: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 } } } },
    });

    // ── Status Doughnut ────────────────────────────────
    destroyChart(refStatus);
    const cnt = {};
    d.forEach((r) => { const s = CM.status ? (r[CM.status] || 'Unknown') : 'Unknown'; cnt[s] = (cnt[s] || 0) + 1; });
    const sLabels = Object.keys(cnt).slice(0, 6);
    refStatus.current = new Chart(canvasStatus.current, {
      type: 'doughnut',
      data: { labels: sLabels, datasets: [{ data: sLabels.map((l) => cnt[l]), backgroundColor: ['#1a73e8', '#0f9d58', '#d93025', '#f59e0b', '#7c3aed', '#0891b2'].slice(0, sLabels.length), borderWidth: 2, borderColor: '#fff', hoverOffset: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 } } } },
    });

    // ── Cases per Analyst ──────────────────────────────
    destroyChart(refCPA);
    if (CM.user) {
      const cntU = {}; d.forEach((r) => { const u = r[CM.user] || 'Unknown'; cntU[u] = (cntU[u] || 0) + 1; });
      const sorted = Object.entries(cntU).sort((a, b) => b[1] - a[1]).slice(0, 15);
      const avg = sorted.reduce((s, [, v]) => s + v, 0) / sorted.length;
      setBadges((b) => ({ ...b, cpa: sorted.length + ' analysts' }));
      refCPA.current = new Chart(canvasCPA.current, {
        type: 'bar',
        data: { labels: sorted.map((s) => s[0]), datasets: [{ label: 'Cases', data: sorted.map((s) => s[1]), backgroundColor: sorted.map((s) => s[1] >= avg * 1.2 ? 'rgba(15,157,88,0.7)' : s[1] < avg * 0.8 ? 'rgba(217,48,37,0.7)' : 'rgba(26,115,232,0.7)'), borderRadius: 5 }] },
        options: BASE_OPTS,
      });
    }

    // ── Customer Type ──────────────────────────────────
    destroyChart(refCustType);
    if (CM.custType) {
      const ctCnt = {}; d.forEach((r) => { const v = r[CM.custType] || 'Unknown'; ctCnt[v] = (ctCnt[v] || 0) + 1; });
      const ctLabels = Object.keys(ctCnt).slice(0, 7);
      refCustType.current = new Chart(canvasCustType.current, {
        type: 'doughnut',
        data: { labels: ctLabels, datasets: [{ data: ctLabels.map((l) => ctCnt[l]), backgroundColor: ['#1a73e8', '#0f9d58', '#7c3aed', '#f59e0b', '#d93025', '#0891b2', '#ec4899'].slice(0, ctLabels.length), borderWidth: 2, borderColor: '#fff', hoverOffset: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10, padding: 10 } } } },
      });
    }

    // ── Open Cases by Month ────────────────────────────
    destroyChart(refOpenMonth);
    const openRows = d.filter((r) => r._open);
    const byMonthOpen = {};
    openRows.forEach((r) => { const mk = getMonthKey(r, CM); if (!mk) return; byMonthOpen[mk] = (byMonthOpen[mk] || 0) + 1; });
    const openMonths = Object.keys(byMonthOpen).sort();
    setBadges((b) => ({ ...b, openMonth: openRows.length + ' open cases' }));
    refOpenMonth.current = new Chart(canvasOpenMonth.current, {
      type: 'bar',
      data: { labels: openMonths, datasets: [{ label: 'Open Cases', data: openMonths.map((m) => byMonthOpen[m]), backgroundColor: 'rgba(217,48,37,0.65)', borderRadius: 5 }] },
      options: BASE_OPTS,
    });

    // ── Open Cases by Analyst ──────────────────────────
    destroyChart(refOpenAnalyst);
    if (CM.user) {
      const openCnt = {}; openRows.forEach((r) => { const u = r[CM.user] || 'Unknown'; openCnt[u] = (openCnt[u] || 0) + 1; });
      const sortedOpen = Object.entries(openCnt).sort((a, b) => b[1] - a[1]).slice(0, 12);
      refOpenAnalyst.current = new Chart(canvasOpenAnalyst.current, {
        type: 'bar',
        data: { labels: sortedOpen.map((s) => s[0]), datasets: [{ label: 'Open', data: sortedOpen.map((s) => s[1]), backgroundColor: 'rgba(217,48,37,0.6)', borderRadius: 5 }] },
        options: { ...BASE_OPTS, indexAxis: 'y' },
      });
    }

    return () => {
      destroyChart(refTrend); destroyChart(refLevels); destroyChart(refStatus);
      destroyChart(refCPA); destroyChart(refCustType);
      destroyChart(refOpenMonth); destroyChart(refOpenAnalyst);
    };
  }, [d, CM]);

  const dateBadge = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const hasData = rawData.length > 0;

  return (
    <div className="page" id="export-dashboard">
      {/* Top bar */}
      <div className="topbar">
        <div>
          <h1>Executive Dashboard</h1>
          <p>{hasData ? `${rawData.length.toLocaleString()} cases loaded · ${fileName}${activeSheetName ? ' · Sheet: ' + activeSheetName : ''}` : 'Upload CDR Excel/CSV to begin analysis'}</p>
        </div>
        <div className="topbar-right">
          <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
            {hasData ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}` : '📂 Upload CDR File'}
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

      {/* Filters */}
      {hasData && <FilterBar />}

      {!hasData && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="ei">📂</div>
          <p>Upload a CDR Excel or CSV file to begin analysis</p>
        </div>
      )}

      {hasData && (
        <>
          {/* KPI Row 1 */}
          <div className="kpi-grid k6">
            <KpiCard label="Total Cases"        value={kpis.total}    sub="All loaded records"         icon="📋" variant="blue-v" />
            <KpiCard label="Closed Cases"       value={kpis.closed}   sub={kpis.closedPct}             icon="✅" variant="green-v" />
            <KpiCard label="Open Cases"         value={kpis.open}     sub={kpis.openPct}               icon="🔓" variant="red-v" />
            <KpiCard label="Active Analysts"    value={kpis.analysts} sub="Unique users"               icon="👥" variant="amber-v" />
            <KpiCard label="% L2 to L3"         value={kpis.l2l3pct}  sub={kpis.l2l3sub}              icon="⚡" variant="purple-v" />
            <KpiCard label="Avg Ageing (days)"  value={kpis.avgAge}   sub="Created → Last Action"     icon="⏱" variant="teal-v" />
          </div>

          {/* KPI Row 2 */}
          <div className="kpi-grid k4">
            <KpiCard label="L1 Cases"           value={kpis.l1}       sub={kpis.l1sub}  icon="🎯" variant="blue-v" />
            <KpiCard label="L2 Cases"           value={kpis.l2}       sub={kpis.l2sub}  icon="📊" variant="amber-v" />
            <KpiCard label="L3 Cases"           value={kpis.l3}       sub={kpis.l3sub}  icon="🔺" variant="purple-v" />
            <KpiCard label="Avg Cases/Analyst"  value={kpis.avgCases} sub="Per analyst total" icon="📅" variant="green-v" />
          </div>

          {/* Charts Row 1 */}
          <div className="sec-label">Case Overview</div>
          <div className="chart-row r3">
            <ChartCard title="Cases Closed & Avg Productivity by Month" sub="L1 / L2 / L3 by Month + Avg Productivity line" badge={badges.trend} badgeClass="badge-blue" height="h240">
              <canvas ref={canvasTrend} />
            </ChartCard>
            <ChartCard title="L1 vs L2 vs L3" sub="Investigation level split" height="h240">
              <canvas ref={canvasLevels} />
            </ChartCard>
            <ChartCard title="Disposition Status" sub="Open vs Close" height="h240">
              <canvas ref={canvasStatus} />
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="chart-row r21">
            <ChartCard title="Cases per Analyst" sub="Total workload by analyst" badge={badges.cpa} badgeClass="badge-green" height="h220">
              <canvas ref={canvasCPA} />
            </ChartCard>
            <ChartCard title="Customer Type" sub="Case mix by segment" height="h220">
              <canvas ref={canvasCustType} />
            </ChartCard>
          </div>

          {/* Open Cases */}
          <div className="sec-label">Open Cases Analysis</div>
          <div className="chart-row r2">
            <ChartCard title="Open Cases by Month" sub="Month-wise open case trend" badge={badges.openMonth} badgeClass="badge-red" height="h200">
              <canvas ref={canvasOpenMonth} />
            </ChartCard>
            <ChartCard title="Open Cases by Analyst" sub="Who has open cases pending" height="h200">
              <canvas ref={canvasOpenAnalyst} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

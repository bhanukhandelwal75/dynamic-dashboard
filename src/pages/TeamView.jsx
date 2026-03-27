import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Pagination from '../components/Pagination';
import { getMonthKey } from '../utils/dataUtils';

const PAGE_SIZE = 15;

export default function TeamView({ onUploadClick }) {
  const { rawData, CM, fileName } = useData();
  const [search,   setSearch]  = useState('');
  const [page, setPage]        = useState(0);

  // ── Heatmap data ──────────────────────────────────
  const heatmapData = useMemo(() => {
    if (!CM.user || !rawData.length) return null;
    const users  = [...new Set(rawData.map((r) => r[CM.user]).filter(Boolean))].sort();
    const months = [...new Set(rawData.map((r) => getMonthKey(r, CM)).filter(Boolean))].sort();
    const matrix = {};
    rawData.forEach((r) => {
      const u = r[CM.user]; const m = getMonthKey(r, CM);
      if (u && m) { if (!matrix[u]) matrix[u] = {}; matrix[u][m] = (matrix[u][m] || 0) + 1; }
    });
    const allVals = users.flatMap((u) => months.map((m) => matrix[u]?.[m] || 0));
    const max = Math.max(...allVals, 1);
    return { users, months, matrix, max };
  }, [rawData, CM]);

  // ── Case table with search + pagination ───────────
  const filteredCases = useMemo(() => {
    if (!search.trim()) return rawData;
    const q = search.toLowerCase();
    return rawData.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [rawData, search]);

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);
  const safePage   = Math.min(page, Math.max(0, totalPages - 1));
  const pageSlice  = filteredCases.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const heatBg = (pct) => {
    if (pct > 0.8) return '#1a73e8';
    if (pct > 0.5) return '#4d90fe';
    if (pct > 0.2) return '#a8c7fa';
    if (pct > 0)   return '#d2e3fc';
    return '#f0f2f5';
  };
  const heatColor = (pct) => (pct > 0.5 ? '#fff' : pct > 0 ? '#1a1a2e' : '#ccc');

  const lvlPill = (l) => `pill-${l === 'L1' ? 'blue' : l === 'L2' ? 'amber' : 'purple'}`;
  const stPill  = (r) => r._closed ? 'pill-green' : r._open ? 'pill-red' : 'pill-gray';
  const ageStyle = (age) =>
    age === null ? {} : age > 30 ? { color: '#d93025', fontWeight: 700 } : age > 14 ? { color: '#f59e0b', fontWeight: 600 } : { color: '#0f9d58' };

  const hasData = rawData.length > 0;

  return (
    <div className="page">
      <div className="topbar">
        <div><h1>Team View</h1><p>Workload balance, heatmap &amp; case explorer</p></div>
        <div className="topbar-right">
          <button className={`upload-btn${hasData ? ' loaded' : ''}`} onClick={onUploadClick}>
            {hasData ? `✅ ${fileName.length > 22 ? fileName.slice(0, 20) + '…' : fileName}` : '📂 Upload CDR File'}
          </button>
        </div>
      </div>

      {!hasData && <div className="empty-state" style={{ marginTop: 60 }}><div className="ei">👥</div><p>Upload a CDR file to view team analytics</p></div>}

      {hasData && (
        <>
          {/* ── Heatmap ─────────────────────────────── */}
          <div className="sec-label">Workload Heatmap (Cases per Analyst per Month)</div>
          <div className="card" style={{ marginBottom: 16 }}>
            {!heatmapData ? (
              <div className="empty-state"><div className="ei">📊</div><p>Need user_name &amp; month columns</p></div>
            ) : (
              <div style={{ overflowX: 'auto', padding: 4 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `140px ${heatmapData.months.map(() => 'minmax(40px,1fr)').join(' ')}`,
                  gap: 3,
                  minWidth: 400,
                }}>
                  {/* Header row */}
                  <div />
                  {heatmapData.months.map((m) => (
                    <div key={m} style={{ fontSize: 9, color: '#8896ab', textAlign: 'center', padding: '3px 0', fontWeight: 700 }}>{m}</div>
                  ))}
                  {/* Data rows */}
                  {heatmapData.users.map((u) => (
                    <>
                      <div
                        key={u + '-label'}
                        title={u}
                        style={{ fontSize: 11, fontWeight: 600, padding: '6px 6px 6px 0', display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 135 }}
                      >
                        {u}
                      </div>
                      {heatmapData.months.map((m) => {
                        const v = heatmapData.matrix[u]?.[m] || 0;
                        const pct = v / heatmapData.max;
                        return (
                          <div
                            key={u + m}
                            className="hm-cell"
                            style={{ background: heatBg(pct), color: heatColor(pct) }}
                            title={`${u} · ${m}: ${v}`}
                          >
                            {v || ''}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Case Explorer ────────────────────────── */}
          <div className="sec-label">Case Explorer</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-hdr">
              <div>
                <div className="card-title">All Case Records</div>
                <div className="card-sub">Search and browse individual cases</div>
              </div>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search analyst, case ID, customer…"
                style={{
                  background: 'var(--surface2)', border: '1.5px solid var(--border)',
                  borderRadius: 8, padding: '7px 12px', color: 'var(--text)',
                  fontSize: 12, outline: 'none', width: 240, fontFamily: "'Inter',sans-serif",
                }}
              />
            </div>

            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th><th>Analyst</th><th>Level</th><th>Status</th>
                    <th>Customer Name</th><th>Customer Type</th>
                    <th>Created</th><th>Last Action</th><th>Ageing</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((r, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ color: '#1a73e8' }}>{CM.caseId ? r[CM.caseId] || '—' : '—'}</td>
                      <td style={{ fontWeight: 600 }}>{CM.user ? r[CM.user] || '—' : '—'}</td>
                      <td><span className={`pill ${lvlPill(r._level)}`}>{r._level}</span></td>
                      <td><span className={`pill ${stPill(r)}`}>{CM.status ? r[CM.status] || '—' : '—'}</span></td>
                      <td>{CM.custName ? r[CM.custName] || '—' : '—'}</td>
                      <td>{CM.custType ? r[CM.custType] || '—' : '—'}</td>
                      <td className="mono" style={{ color: '#8896ab' }}>{r._created ? r._created.toLocaleDateString('en-GB') : '—'}</td>
                      <td className="mono" style={{ color: '#8896ab' }}>{r._lastAct ? r._lastAct.toLocaleDateString('en-GB') : '—'}</td>
                      <td className="mono" style={ageStyle(r._ageing)}>{r._ageing === null ? '—' : r._ageing + 'd'}</td>
                    </tr>
                  ))}
                  {pageSlice.length === 0 && (
                    <tr><td colSpan={9} className="empty-state"><div className="ei">🔍</div><p>No records match your search</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalRecords={filteredCases.length}
              onPageChange={(p) => setPage(Math.max(0, p))}
              label={search ? '(filtered)' : ''}
            />
          </div>
        </>
      )}
    </div>
  );
}

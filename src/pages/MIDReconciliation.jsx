import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx-js-style';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MIDReconciliation() {
  const [bossFile,      setBossFile]      = useState(null);
  const [jocataFile,    setJocataFile]    = useState(null);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [results,       setResults]       = useState(null);
  const [activeTab,     setActiveTab]     = useState('Active');

  // ── File handlers ────────────────────────────────────────────────────────
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'boss')   setBossFile(file);
    if (type === 'jocata') setJocataFile(file);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    if (type === 'boss')   setBossFile(file);
    if (type === 'jocata') setJocataFile(file);
  };

  // ── Reconciliation logic ─────────────────────────────────────────────────
  const triggerReconciliation = () => {
    if (!bossFile || !jocataFile) return;
    setIsProcessing(true);
    setProcessStatus('Step 1/3: Reading Jocata Dump...');

    Papa.parse(jocataFile, {
      header: true,
      skipEmptyLines: true,
      complete: (jocataResults) => {
        const jocataSet = new Set();
        jocataResults.data.forEach(row => {
          if (row.account_number) jocataSet.add(String(row.account_number).trim());
        });

        setProcessStatus('Step 2/3: Reading BOSS Dump...');
        Papa.parse(bossFile, {
          header: true,
          skipEmptyLines: true,
          complete: (bossResults) => {
            setProcessStatus('Step 3/3: Reconciling Differences...');
            setTimeout(() => runReconciliation(bossResults.data, jocataSet), 50);
          },
        });
      },
    });
  };

  const runReconciliation = (bossData, jocataSet) => {
    const missing = [], active = [], inactive = [];
    const isV2 = bossData.length > 0 && ('entity_type' in bossData[0] || 'STATUS' in bossData[0]);

    bossData.forEach(row => {
      const mid = row.mid ? String(row.mid).trim() : '';
      if (!mid || jocataSet.has(mid)) return;

      let rawStatus = String(row.status || row.STATUS || '').trim().toUpperCase();
      let statusText = 'Unknown';
      if      (rawStatus === '9376503' || rawStatus === 'ACTIVE')   statusText = 'Active';
      else if (rawStatus === '9376504' || rawStatus === 'INACTIVE') statusText = 'Inactive';
      else if (rawStatus) statusText = rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase();

      const record = isV2
        ? { mid, entity_type: row.entity_type || '', merchant_name: row.merchant_name || '', created_date: row.created_date || '', STATUS: statusText }
        : { mid, kyb_id: row.kyb_id || '', category: row.category || '', sub_category: row.sub_category || '', merchant_name: row.merchant_name || '', 'onboarding date': row.created_date || '', status: statusText };

      missing.push(record);
      if (statusText === 'Active')   active.push(record);
      if (statusText === 'Inactive') inactive.push(record);
    });

    setResults({ missing, active, inactive, isV2 });
    setIsProcessing(false);
    setProcessStatus('');
  };

  // ── Excel export ─────────────────────────────────────────────────────────
  const applyStyles = (ws, isCountTab = false, isV2 = false) => {
    if (!ws || !ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    const border = {
      top:    { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left:   { style: 'thin', color: { rgb: '000000' } },
      right:  { style: 'thin', color: { rgb: '000000' } },
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };

        if (isCountTab) {
          if (R === 0) ws[ref].s = { font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '0c4a6e' } }, alignment: { horizontal: 'center', vertical: 'center' }, border };
          else if (R === 1) ws[ref].s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '0284c7' } }, alignment: { horizontal: 'center', vertical: 'center' }, border };
          else ws[ref].s = { border };
        } else {
          if (R === 0) ws[ref].s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '002060' } }, alignment: { horizontal: 'center', vertical: 'center' }, border };
          else ws[ref].s = { border };
        }
      }
    }

    if (!isCountTab) {
      ws['!cols'] = isV2
        ? [{ wch: 25 }, { wch: 25 }, { wch: 35 }, { wch: 20 }, { wch: 15 }]
        : [{ wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 35 }, { wch: 20 }, { wch: 15 }];
    } else {
      ws['!cols'] = [{ wch: 35 }, { wch: 15 }];
    }
  };

  const exportToExcel = () => {
    if (!results) return;
    const wb = XLSX.utils.book_new();

    const wsRecon = XLSX.utils.json_to_sheet(results.missing);
    applyStyles(wsRecon, false, results.isV2);
    XLSX.utils.book_append_sheet(wb, wsRecon, 'Reconciliation');

    const wsActive = XLSX.utils.json_to_sheet(results.active);
    applyStyles(wsActive, false, results.isV2);
    XLSX.utils.book_append_sheet(wb, wsActive, 'Active');

    const wsInactive = XLSX.utils.json_to_sheet(results.inactive);
    applyStyles(wsInactive, false, results.isV2);
    XLSX.utils.book_append_sheet(wb, wsInactive, 'Inactive');

    const countData = [
      ['Reconciliation Summary', ''],
      ['Particulars', 'Count'],
      ['MIDs missing in Jocata as of now.', results.missing.length],
      ['Inactive MIDs missing', results.inactive.length],
      ['Active MIDs missing', results.active.length],
    ];
    const wsCount = XLSX.utils.aoa_to_sheet(countData);
    wsCount['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    applyStyles(wsCount, true, results.isV2);
    XLSX.utils.book_append_sheet(wb, wsCount, 'Count');

    XLSX.writeFile(wb, 'Reconciliation_Report.xlsx', { compression: true });
  };

  const resetTool = () => {
    setBossFile(null);
    setJocataFile(null);
    setResults(null);
    setActiveTab('Active');
  };

  // ── Drop Zone Component ──────────────────────────────────────────────────
  const DropZone = ({ label, file, inputId, type }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, type)}
      onClick={() => document.getElementById(inputId).click()}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: 180,
        border: `2px dashed ${file ? 'var(--green)' : 'var(--border2)'}`,
        borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
        background: file ? 'var(--green-light)' : 'var(--surface2)',
        padding: 20,
      }}
    >
      <input id={inputId} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, type)} />
      <div style={{ color: file ? 'var(--green)' : 'var(--text3)', marginBottom: 10 }}>
        {file ? <FileIcon /> : <UploadIcon />}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: file ? 'var(--green)' : 'var(--text2)', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
        {file ? file.name : 'Click to upload or drag and drop (.csv)'}
      </p>
      {file && (
        <p style={{ fontSize: 10, color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      )}
    </div>
  );

  // ── Status pill ──────────────────────────────────────────────────────────
  const StatusPill = ({ status }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: status === 'Active' ? 'var(--green-light)' : 'var(--red-light)',
      color: status === 'Active' ? 'var(--green)' : 'var(--red)',
    }}>{status}</span>
  );

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="page" id="export-mid-recon">

      {/* Top bar */}
      <div className="topbar">
        <div>
          <h1>MID Reconciliation Tool</h1>
          <p>Cross-reference BOSS internal dumps against Jocata panel dumps</p>
        </div>
      </div>

      {/* Loading overlay */}
      {isProcessing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(13,27,42,0.75)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', marginBottom: 20,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            animation: 'spin 1s linear infinite',
          }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Processing Data</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{processStatus}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 10 }}>
            Large files may take a moment. Please do not close the tab.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Upload screen */}
      {!results ? (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            <DropZone label="BOSS Dump (CSV)" file={bossFile} inputId="boss-upload" type="boss" />
            <DropZone label="Jocata Dump (CSV)" file={jocataFile} inputId="jocata-upload" type="jocata" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={triggerReconciliation}
              disabled={!bossFile || !jocataFile}
              style={{
                padding: '11px 36px', borderRadius: 9, fontWeight: 700,
                fontSize: 14, border: 'none', cursor: (!bossFile || !jocataFile) ? 'not-allowed' : 'pointer',
                background: (!bossFile || !jocataFile) ? 'var(--border2)' : 'var(--blue)',
                color: '#fff', transition: 'all 0.2s', fontFamily: 'Inter',
              }}
            >
              Reconcile Data
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Summary KPI cards */}
          <div className="kpi-grid k3">
            <div className="kpi blue-v">
              <div className="kpi-top-bar" />
              <div className="kpi-label">Total Missing MIDs</div>
              <div className="kpi-val">{results.missing.length.toLocaleString()}</div>
              <div className="kpi-sub">MIDs missing in Jocata as of now</div>
            </div>
            <div className="kpi green-v">
              <div className="kpi-top-bar" />
              <div className="kpi-label">Active Missing</div>
              <div className="kpi-val">{results.active.length.toLocaleString()}</div>
              <div className="kpi-sub">Active status records</div>
            </div>
            <div className="kpi red-v">
              <div className="kpi-top-bar" />
              <div className="kpi-label">Inactive Missing</div>
              <div className="kpi-val">{results.inactive.length.toLocaleString()}</div>
              <div className="kpi-sub">Inactive status records</div>
            </div>
          </div>

          {/* Actions bar */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              Reconciliation complete. Download the formatted Excel report.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={resetTool}
                style={{ padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter' }}
              >
                Start Over
              </button>
              <button
                onClick={exportToExcel}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', fontFamily: 'Inter' }}
              >
                <DownloadIcon /> Export Excel Report
              </button>
            </div>
          </div>

          {/* Data table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface2)', padding: '0 16px' }}>
              {['Active', 'Inactive'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '14px 16px', fontSize: 13, fontWeight: 600,
                    fontFamily: 'Inter',
                    color: activeTab === tab ? (tab === 'Active' ? 'var(--green)' : 'var(--red)') : 'var(--text3)',
                    borderBottom: activeTab === tab ? `2px solid ${tab === 'Active' ? 'var(--green)' : 'var(--red)'}` : '2px solid transparent',
                  }}
                >
                  {tab} Missing ({(tab === 'Active' ? results.active : results.inactive).length.toLocaleString()})
                </button>
              ))}
            </div>

            <div style={{ padding: 16 }}>
              <div style={{
                fontSize: 11, color: 'var(--text3)', marginBottom: 12,
                background: 'var(--amber-light)', padding: '6px 12px',
                borderRadius: 6, border: '1px solid var(--border)', display: 'inline-block',
              }}>
                Showing top 500 records only. Export Excel to view all {(activeTab === 'Active' ? results.active : results.inactive).length} rows.
              </div>

              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>MID</th>
                      {results.isV2 ? (
                        <>
                          <th>Entity Type</th>
                          <th>Merchant Name</th>
                          <th>Created Date</th>
                          <th>Status</th>
                        </>
                      ) : (
                        <>
                          <th>KYB ID</th>
                          <th>Merchant Name</th>
                          <th>Category</th>
                          <th>Sub Category</th>
                          <th>Onboarding Date</th>
                          <th>Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'Active' ? results.active : results.inactive)
                      .slice(0, 500)
                      .map((row, idx) => (
                        <tr key={idx}>
                          <td className="mono" style={{ color: 'var(--blue)' }}>{row.mid}</td>
                          {results.isV2 ? (
                            <>
                              <td style={{ fontSize: 11 }}>{row.entity_type}</td>
                              <td style={{ fontWeight: 500 }}>{row.merchant_name}</td>
                              <td className="mono" style={{ color: 'var(--text3)' }}>{row.created_date}</td>
                              <td><StatusPill status={row.STATUS} /></td>
                            </>
                          ) : (
                            <>
                              <td className="mono" style={{ fontSize: 11 }}>{row.kyb_id}</td>
                              <td style={{ fontWeight: 500 }}>{row.merchant_name}</td>
                              <td>{row.category}</td>
                              <td>{row.sub_category}</td>
                              <td className="mono" style={{ color: 'var(--text3)' }}>{row['onboarding date']}</td>
                              <td><StatusPill status={row.status} /></td>
                            </>
                          )}
                        </tr>
                      ))}
                    {(activeTab === 'Active' ? results.active.length : results.inactive.length) === 0 && (
                      <tr>
                        <td colSpan={results.isV2 ? 5 : 7} className="empty-state">
                          <div className="ei">🎉</div>
                          <p>No missing {activeTab.toLowerCase()} MIDs found!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
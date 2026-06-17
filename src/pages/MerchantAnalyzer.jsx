import { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import './MerchantAnalyzer.css';
 
// ─── helpers ────────────────────────────────────────────────────────────────
function nk(k) { return k.trim().toLowerCase().replace(/[\s_\-\/]+/g, ''); }
 
function buildColMap(rows) {
  const cm = {};
  if (!rows.length) return cm;
  Object.keys(rows[0]).forEach((k) => { cm[nk(k)] = k; });
  return cm;
}
 
function col(cm, a) {
  const n = nk(a);
  if (cm[n]) return cm[n];
  const ks = Object.keys(cm);
  for (const k of ks) if (k.includes(n) || n.includes(k)) return cm[k];
  return null;
}
 
function gv(row, cm, a) {
  const c = col(cm, a);
  return c ? (row[c] !== undefined ? row[c] : '') : '';
}
 
function gDate(row, cm) {
  const v = gv(row, cm, 'transactiondate') || gv(row, cm, 'Transaction_Date');
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
 
function gHour(row, cm) { const d = gDate(row, cm); return d ? d.getHours() : -1; }
function isNightRow(row, cm) { const h = gHour(row, cm); return h >= 22 || h < 6; }
 
function gAmt(row, cm) {
  const n = parseFloat(String(gv(row, cm, 'amount') || '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}
 
function gSettled(row, cm) {
  const n = parseFloat(String((gv(row, cm, 'settledamount') || gv(row, cm, 'Settled_Amount') || '')).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}
 
function fmtN(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
 
function fmtD(row, cm) {
  const d = gDate(row, cm);
  if (!d) return String(gv(row, cm, 'transactiondate') || '');
  return d.toISOString().replace('T', ' ').substring(0, 19);
}
 
function fmtDateStr(s) {
  if (!s) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
function fmtSQLDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
function isAS(row, cm) {
  return String(gv(row, cm, 'transactiontype') || '').toUpperCase() === 'ACQUIRING'
      && String(gv(row, cm, 'status') || '').toUpperCase() === 'SUCCESS';
}
 
// ─── Tag components ───────────────────────────────────────────────────────────
const SqlTag    = () => <span className="ma-sql-tag">SQL</span>;
const AutoTag   = () => <span className="ma-auto-tag">EXCEL</span>;
const ManualTag = () => <span className="ma-manual-tag">MANUAL</span>;
 
// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className={`ma-stat-card${color ? ' ' + color : ''}`}>
      <div className="ma-sc-label">{label}</div>
      <div className="ma-sc-val">{value}</div>
      {sub && <div className="ma-sc-sub">{sub}</div>}
    </div>
  );
}
 
function SectionTitle({ children }) {
  return <div className="ma-section-title">{children}</div>;
}
 
// ─── Charts ───────────────────────────────────────────────────────────────────
function ModeChart({ modeMap }) {
  const ref = useRef(null);
  const ci  = useRef(null);
  useEffect(() => {
    if (!ref.current || !modeMap) return;
    if (ci.current) { ci.current.destroy(); ci.current = null; }
    const labels = Object.keys(modeMap);
    const data   = labels.map((k) => modeMap[k]);
    const colors = ['#2563eb','#f59e0b','#6b7280','#10b981','#8b5cf6','#ef4444','#0891b2'];
    ci.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'DM Mono', size: 11 }, boxWidth: 12 } } } },
    });
    return () => { if (ci.current) { ci.current.destroy(); ci.current = null; } };
  }, [modeMap]);
  return <div className="ma-chart-wrap"><canvas ref={ref} /></div>;
}
 
function MonthChart({ months, mmap }) {
  const ref = useRef(null);
  const ci  = useRef(null);
  useEffect(() => {
    if (!ref.current || !months?.length) return;
    if (ci.current) { ci.current.destroy(); ci.current = null; }
    ci.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{ label: 'Total Amount', data: months.map((m) => mmap[m].amount), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.06)', pointBackgroundColor: '#2563eb', tension: .4, fill: true, pointRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => '₹' + c.raw.toLocaleString('en-IN', { maximumFractionDigits: 2 }) } } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'DM Mono', size: 10 } } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'DM Mono', size: 10 }, callback: (v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString()) } },
        },
      },
    });
    return () => { if (ci.current) { ci.current.destroy(); ci.current = null; } };
  }, [months, mmap]);
  return <div className="ma-chart-wrap"><canvas ref={ref} /></div>;
}
 
// ─── Fetch banner ─────────────────────────────────────────────────────────────
function FetchBanner({ status, message }) {
  if (!status) return null;
  return (
    <div className={`ma-fetch-banner ma-fetch-${status}`}>
      {status === 'loading' && <div className="ma-fetch-spinner" />}
      <span>{message}</span>
    </div>
  );
}
 
// ─── Merchant Profile Panel (SQL data) ───────────────────────────────────────
function MerchantProfilePanel({ data }) {
  if (!data) return null;
  const fields = [
    ['MID',              data['MID']],
    ['Business Name',    data['Business Name']],
    ['Category',         data['Category']],
    ['Subcategory',      data['Subcategory']],
    ['Merchant Type',    data['Merchant Type']],
    ['Business Type',    data['Business Type']],
    ['Account Status',   data['Account Status']],
    ['Onboarding Date',  fmtSQLDate(data['Account Opening Date'] || data['Onboarding Date'])],
    ['GST',              data['GST']],
    ['PAN',              data['PAN'] || data['PAN Raw']],
    ['Risk Category',    data['Risk Category']],
    ['Payment Mode',     data['Payment Mode']],
    ['State',            data['State Name']],
    ['City',             data['City']],
    ['LEA Notice',       data['LEA Notice']],
    ['FIU Alert',        data['FIU Alert']],
    ['Previous STR',     data['Previous STR Filled']],
  ].filter(([, v]) => v);
 
  return (
    <div className="ma-panel" style={{ marginBottom: 20 }}>
      <div className="ma-panel-title">
        Profile from BOSS Panel / Superset
        <span className="ma-sql-tag" style={{ fontSize: 10 }}>SQL AUTO-FILLED</span>
      </div>
      <div className="ma-profile-grid">
        {fields.map(([label, value]) => (
          <div key={label} className="ma-profile-cell">
            <div className="ma-profile-label">{label}</div>
            <div className="ma-profile-value">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MerchantAnalyzer() {
 
  // ── file / mid state ───────────────────────────────────────────────────────
  const [allRows,   setAllRows]   = useState([]);
  const [colMap,    setColMap]    = useState({});
  const [fileName,  setFileName]  = useState('');
  const [parseInfo, setParseInfo] = useState(null);
  const [midList,   setMidList]   = useState([]);
  const [selMid,    setSelMid]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [loadMsg,   setLoadMsg]   = useState('Processing…');
  const [dash,      setDash]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
 
  // ── API config state ───────────────────────────────────────────────────────
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:5050');
  const [apiCookie, setApiCookie] = useState('');
  const [dbId,      setDbId]      = useState('3');
  const [dateFrom,  setDateFrom]  = useState('2025-12-01');
  const [dateTo,    setDateTo]    = useState('2026-03-15');
 
  // ── fetch banner ───────────────────────────────────────────────────────────
  const [fetchStatus,  setFetchStatus]  = useState('');   // '' | 'loading' | 'success' | 'error'
  const [fetchMessage, setFetchMessage] = useState('');
 
  // ── SQL profile data ───────────────────────────────────────────────────────
  const [sqlProfileData, setSqlProfileData] = useState(null);
 
  // ── filter states ──────────────────────────────────────────────────────────
  const [ccFilter,  setCcFilter]  = useState({ from:'', to:'', min:'', max:'' });
  const [ntFilter,  setNtFilter]  = useState({ mode:'', from:'', to:'', min:'', max:'' });
  const [allFilter, setAllFilter] = useState({ mode:'', from:'', to:'', min:'', max:'' });
 
  // ── sort states ────────────────────────────────────────────────────────────
  const [ccSort,  setCcSort]  = useState({ col:'date',   dir:-1 });
  const [ntSort,  setNtSort]  = useState({ col:'date',   dir:-1 });
  const [allSort, setAllSort] = useState({ col:'amount', dir:-1 });
  const [mSort,   setMSort]   = useState({ col:'total',  dir:-1 });
  const [rndSort, setRndSort] = useState({ col:'cnt',    dir:-1 });
 
  // ── insight generator state ────────────────────────────────────────────────
  const [igManual, setIgManual] = useState({
    mid:'', bname:'', status:'ACTIVE', onboard:'', cat:'', subcat:'',
    btype:'INDIVIDUAL', mtype:'', risk:'LOW', pmode:'UPI',
    signatory:'', dob:'', mobile:'', gstin:'', pan:'',
    lea:'NA', fiu:'NA', prevStr:'NO',
    addr:'', alert:'', bank:'', from:'', to:'',
    vpas:'', remarks:'', conclusion:'STR',
  });
  const [sqlFilled, setSqlFilled] = useState({});  // tracks which fields came from SQL
  const [igAuto,    setIgAuto]    = useState({});
  const [igOutput,  setIgOutput]  = useState('');
  const [copied,    setCopied]    = useState(false);
 
  const setIg = (k, v) => setIgManual((p) => ({ ...p, [k]: v }));
 
  // ── file load ──────────────────────────────────────────────────────────────
  const loadFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    setDash(null);
    setSqlProfileData(null);
    setSqlFilled({});
    setFetchStatus('');
    setLoading(true);
    setLoadMsg('Reading file…');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const cm   = buildColMap(rows);
        setColMap(cm);
        setAllRows(rows);
        const mc = col(cm, 'mid');
        const withMid = mc ? rows.filter((r) => String(r[mc] || '').trim()).length : 0;
        const seen = {}, mids = [];
        if (mc) rows.forEach((r) => { const v = String(r[mc] || '').trim(); if (v && !seen[v]) { seen[v] = true; mids.push(v); } });
        mids.sort();
        setMidList(mids);
        setSelMid(mids.length === 1 ? mids[0] : '');
        setParseInfo({ rows: rows.length, withMid, uniqMids: mids.length });
      } catch (err) { alert('Read error: ' + err.message); }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);
 
  const onDrop = (e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
 
  // ── fetch SQL profile from Python backend ──────────────────────────────────
  const fetchMIDProfile = async (mid) => {
    setFetchStatus('loading');
    setFetchMessage(`Grabbing session cookie & running SQL query for ${mid}…`);
    try {
      const resp = await fetch(`${apiUrl}/api/mid-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mid, cookie: apiCookie, db_id: parseInt(dbId), start_date: dateFrom, end_date: dateTo }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        setFetchStatus('error');
        setFetchMessage(`SQL fetch failed: ${json.error || resp.statusText} (dashboard still loaded from Excel)`);
        return null;
      }
      setFetchStatus('success');
      setFetchMessage('✓ Merchant profile fetched from Superset — fields auto-filled below');
      return json.data;
    } catch (e) {
      setFetchStatus('error');
      setFetchMessage(`Backend not reachable (${e.message}) — run backend_api.py. Dashboard loaded from Excel only.`);
      return null;
    }
  };
 
  // ── fill insight fields from SQL data ──────────────────────────────────────
  const fillSQLFields = (d) => {
    if (!d) return;
    const filled = {};
 
    const sv = (k, val) => {
      if (val) { setIg(k, String(val)); filled[k] = true; }
    };
 
    sv('mid',     d['MID']);
    sv('bname',   d['Business Name']);
    sv('cat',     d['Category']);
    sv('subcat',  d['Subcategory']);
    sv('mtype',   d['Merchant Type']);
    sv('gstin',   d['GST']);
    sv('pan',     d['PAN'] || d['PAN Raw']);
    sv('onboard', fmtSQLDate(d['Account Opening Date'] || d['Onboarding Date']));
 
    const addr = [d['Bus Address'], d['City'], d['Comm State'], d['State Name'], d['Zipcode']].filter(Boolean).join(', ');
    if (addr) { sv('addr', addr); }
 
    // Select fields
    const statusVal = String(d['Account Status'] || '').toUpperCase();
    if (statusVal) { setIg('status', statusVal); filled['status'] = true; }
 
    const riskVal = String(d['Risk Category'] || '').toUpperCase();
    if (riskVal) { setIg('risk', riskVal); filled['risk'] = true; }
 
    const pm = String(d['Payment Mode'] || '').toUpperCase().replace(' ', '_');
    if (pm === 'UPI') { setIg('pmode', 'UPI'); filled['pmode'] = true; }
    else if (pm === 'CREDIT_CARD' || pm === 'CREDIT CARD') { setIg('pmode', 'CREDIT_CARD'); filled['pmode'] = true; }
    else if (pm === 'DEBIT_CARD'  || pm === 'DEBIT CARD')  { setIg('pmode', 'DEBIT_CARD');  filled['pmode'] = true; }
    else if (pm === 'MULTIPLE')   { setIg('pmode', 'ALL');         filled['pmode'] = true; }
 
    const bt = String(d['Business Type'] || '').toUpperCase();
    if (bt) { setIg('btype', bt); filled['btype'] = true; }
 
    setSqlFilled(filled);
    setSqlProfileData(d);
  };
 
  // ── analyse ────────────────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!selMid || !allRows.length) return;
    setLoading(true);
    setLoadMsg('Analyzing Excel data…');
 
    // 1. Process Excel
    await new Promise((res) => setTimeout(res, 60));
    const mc   = col(colMap, 'mid');
    const rows = mc ? allRows.filter((r) => String(r[mc] || '').trim() === selMid) : allRows;
    const as   = rows.filter((r) => isAS(r, colMap));
 
    const tot  = as.reduce((s, r) => s + gAmt(r, colMap), 0);
    const totS = as.reduce((s, r) => s + gSettled(r, colMap), 0);
    const rnd  = as.filter((r) => { const a = gAmt(r, colMap); return a > 0 && Number.isInteger(a); });
    const night   = as.filter((r) => isNightRow(r, colMap));
    const na      = night.reduce((s, r) => s + gAmt(r, colMap), 0);
    const morning = as.filter((r) => { const h = gHour(r, colMap); return h >= 6 && h < 12; });
    const aft     = as.filter((r) => { const h = gHour(r, colMap); return h >= 12 && h < 22; });
 
    const mm = {};
    as.forEach((r) => { const m = String(gv(r, colMap, 'paymentmode') || 'UNKNOWN').toUpperCase(); mm[m] = (mm[m] || 0) + 1; });
 
    const mmap = {};
    as.forEach((r) => {
      const d = gDate(r, colMap); if (!d) return;
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!mmap[k]) mmap[k] = { count: 0, amount: 0 };
      mmap[k].count++; mmap[k].amount += gAmt(r, colMap);
    });
    const months = Object.keys(mmap).sort();
 
    const fail = rows.filter((r) => { const s = String(gv(r, colMap, 'status') || '').toUpperCase(); return s === 'FAILED' || s === 'FAILURE' || s === 'FAIL'; });
    const cc   = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'CREDIT_CARD');
 
    const roundMap = {};
    as.forEach((r) => { const a = gAmt(r, colMap); if (a > 0 && Number.isInteger(a)) roundMap[a] = (roundMap[a] || 0) + 1; });
    const roundArr = Object.keys(roundMap).map((k) => ({ amt: parseFloat(k), cnt: roundMap[k] })).sort((a, b) => b.cnt - a.cnt);
 
    const stxns = rows.filter((r) => gSettled(r, colMap) > 0);
    const uc = col(colMap, 'utrnumber') || col(colMap, 'utrno') || col(colMap, 'utr');
    const us = new Set();
    if (uc) stxns.forEach((r) => { if (r[uc]) us.add(String(r[uc]).trim()); });
 
    const upi = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'UPI');
    const cc2 = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'CREDIT_CARD');
    const dc  = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'DEBIT_CARD');
 
    // Excel auto-fill
    const amts    = as.map((r) => gAmt(r, colMap)).filter((a) => a > 0);
    const sortedM = months.slice().sort((a, b) => mmap[b].amount - mmap[a].amount);
    const peaks   = sortedM.slice(0, 3).map((m) => m + ' (₹' + (mmap[m].amount / 100000).toFixed(2) + ' L)');
    const topR    = roundArr.slice(0, 5).map((x) => x.cnt + ' credits of ₹' + x.amt.toLocaleString('en-IN') + ' each (₹' + fmtN(x.amt * x.cnt).replace('₹', '') + ')');
    const vpaCol  = col(colMap, 'customervpa') || col(colMap, 'Customer_VPA');
    const vpaMap  = {};
    if (vpaCol) as.forEach((r) => { const v = String(r[vpaCol] || '').trim(); if (v) vpaMap[v] = (vpaMap[v] || 0) + 1; });
    const topVPA = Object.keys(vpaMap).sort((a, b) => vpaMap[b] - vpaMap[a]).slice(0, 7);
 
    setIgAuto({
      totalcr:    (tot / 100000).toFixed(2) + ' L',
      txncount:   as.length,
      minpay:     amts.length ? Math.min(...amts).toLocaleString('en-IN') : '',
      maxpay:     amts.length ? Math.max(...amts).toLocaleString('en-IN') : '',
      nightcnt:   night.length,
      nightamt:   (na / 100000).toFixed(2) + ' L',
      roundcnt:   rnd.length,
      avgmonth:   months.length ? ((months.reduce((s, m) => s + mmap[m].amount, 0) / months.length) / 100000).toFixed(2) + ' L' : '',
      peakmonths: peaks.join(', '),
      roundvals:  topR.join('\n'),
      vpas:       topVPA.join(', '),
    });
 
    setDash({ as, tot, totS, rnd, night, na, morning, aft, mm, months, mmap, fail, cc, roundArr, stxns, utrCount: us.size, upi, cc2, dc });
    setLoading(false);
 
    // 2. Silently fetch SQL profile (non-blocking)
    const sqlData = await fetchMIDProfile(selMid);
    if (sqlData) fillSQLFields(sqlData);
  };
 
  // ── filters ────────────────────────────────────────────────────────────────
  const applyFilter = (rows, f, cm) => rows.filter((r) => {
    if (f.mode && String(gv(r, cm, 'paymentmode') || '').toUpperCase() !== f.mode) return false;
    const d = gDate(r, cm);
    if (f.from && d && d < new Date(f.from)) return false;
    if (f.to   && d && d > new Date(f.to + 'T23:59:59')) return false;
    const a = gAmt(r, cm);
    if (f.min && a < parseFloat(f.min)) return false;
    if (f.max && a > parseFloat(f.max)) return false;
    return true;
  });
 
  const sortRows = (rows, sortState, cm) => rows.slice().sort((a, b) => {
    if (sortState.col === 'date')    return ((gDate(a, cm) || new Date(0)) - (gDate(b, cm) || new Date(0))) * sortState.dir;
    if (sortState.col === 'amount')  return (gAmt(a, cm) - gAmt(b, cm)) * sortState.dir;
    if (sortState.col === 'settled') return (gSettled(a, cm) - gSettled(b, cm)) * sortState.dir;
    return String(gv(a, cm, sortState.col) || '').localeCompare(String(gv(b, cm, sortState.col) || '')) * sortState.dir;
  });
 
  const toggleSort = (setter, c) => setter((s) => ({ col: c, dir: s.col === c ? s.dir * -1 : -1 }));
  const arrow = (s, c) => <span className={'ma-sort-arrow' + (s.col === c ? ' active' : '')}>{s.col === c ? (s.dir === -1 ? '▼' : '▲') : '⇅'}</span>;
 
  // ── generate comment ───────────────────────────────────────────────────────
  const generateComment = () => {
    const ig = igManual;
    const ia = igAuto;
    const period        = ig.from && ig.to ? fmtDateStr(ig.from) + ' to ' + fmtDateStr(ig.to) : '[Review Period]';
    const roundSentence = ia.roundvals ? 'Many small and mid-value round-sum payments were recorded, including ' + ia.roundvals.split('\n').filter(Boolean).join(', ') + `. Such repetitive and uniform denominations are inconsistent with the transactional variability expected in a ${ig.subcat || '[Subcategory]'} business.` : '';
    const vpaSentence   = ig.vpas      ? 'Analysis showed multiple credits from concentrated customers using multiple VPAs: ' + ig.vpas + ' and many more.' : '';
    const peakSentence  = ia.peakmonths && ia.avgmonth ? `The average monthly transaction amount is Rs. ${ia.avgmonth}, with a significant spike observed in ${ia.peakmonths}, which is not aligned with the merchant's declared line of business.` : '';
    const nightSentence = ia.nightcnt  && ia.nightamt  ? `Furthermore, late night / odd hour transactions were observed — ${ia.nightcnt} credits totalling Rs. ${ia.nightamt} between 22:00–06:00 hrs, which depicts a suspicious pattern inconsistent with the line of business of the merchant.` : '';
    const conclusionText = ig.conclusion === 'STR'
      ? "Based on the review, the transaction activity is disproportionate to the declared business profile and suggests possible misuse of the merchant account for fund routing or third-party transactions. The transactions within the account appear to lack legitimate business justification, raising concerns about their true nature. Additionally, the merchant's settlement account is suspected of being used as a pass-through mechanism, enabling unknown parties to route funds of an undisclosed source. Hence, a STR is being filed."
      : ig.conclusion === 'MONITOR'
      ? 'Based on the review, while some patterns are noted, the activity does not conclusively indicate suspicious behaviour at this stage. The account will be kept under enhanced monitoring for any further irregular patterns.'
      : 'Based on the review, the transaction activity is consistent with the declared business profile and no suspicious patterns were observed. The case is being closed.';
 
    const comment =
`MID: ${ig.mid || '[MID]'}
Business Name: ${ig.bname || '[Business Name]'}
Account Status: ${ig.status}
Onboarding Date: ${ig.onboard || '[Date]'}
Category: ${ig.cat || '[Category]'}
Subcategory: ${ig.subcat || '[Subcategory]'}
Business Type: ${ig.btype}
Merchant Type: ${ig.mtype || '[Type]'}
GSTIN: ${ig.gstin || 'NA'}
Business PAN: ${ig.pan || '[PAN]'}
Payment Mode: ${ig.pmode}
Authorised Signatory: ${ig.signatory || '[Name]'}
DOB: ${ig.dob || '[DOB]'}
Mobile No: ${ig.mobile || '[Mobile]'}
Risk Category: ${ig.risk}
UPI LEA Notice: ${ig.lea}
FIU Alerts: ${ig.fiu}
Previous STR: ${ig.prevStr}
Address: ${ig.addr || '[Address]'}
Alert: ${ig.alert || '[Alert Type]'}
 
The settlement account is maintained with ${ig.bank || '[Bank Details]'}.
 
A review of the transactions for the period ${period} revealed total credits of Rs. ${ia.totalcr || '[Amount]'} across ${ia.txncount || '[Count]'} ${ig.pmode} transactions, with individual payment values ranging from Rs. ${ia.minpay || '[Min]'} to Rs. ${ia.maxpay || '[Max]'}. ${vpaSentence ? vpaSentence + ' ' : ''}${roundSentence ? roundSentence + ' ' : ''}${nightSentence ? nightSentence + ' ' : ''}${peakSentence ? peakSentence + ' ' : ''}
 
${ig.remarks ? ig.remarks + '\n\n' : ''}The transaction behaviour, marked by repetitive inflows, round-sum patterns, and inconsistent activity, lacks credible economic rationale and indicates probable use of the account for fund routing or layering activities.
 
${conclusionText}`;
 
    setIgOutput(comment);
  };
 
  // ── derived ────────────────────────────────────────────────────────────────
  const filteredCC  = dash ? sortRows(applyFilter(dash.cc, ccFilter, colMap), ccSort, colMap) : [];
  const filteredNt  = dash ? sortRows(applyFilter(dash.night, ntFilter, colMap), ntSort, colMap) : [];
  const filteredAll = dash ? sortRows(applyFilter(dash.as, allFilter, colMap), allSort, colMap) : [];
 
  const sortedMonths = dash ? [...dash.months].sort((a, b) => {
    if (mSort.col === 'month') return a.localeCompare(b) * mSort.dir;
    if (mSort.col === 'count') return (dash.mmap[a].count - dash.mmap[b].count) * mSort.dir;
    if (mSort.col === 'avg')   return ((dash.mmap[a].amount / dash.mmap[a].count) - (dash.mmap[b].amount / dash.mmap[b].count)) * mSort.dir;
    return (dash.mmap[a].amount - dash.mmap[b].amount) * mSort.dir;
  }) : [];
 
  const sortedRound = dash ? [...dash.roundArr].sort((a, b) => {
    if (rndSort.col === 'amt') return (a.amt - b.amt) * rndSort.dir;
    if (rndSort.col === 'val') return ((a.amt * a.cnt) - (b.amt * b.cnt)) * rndSort.dir;
    return (a.cnt - b.cnt) * rndSort.dir;
  }) : [];
 
  const allModes = dash ? [...new Set(dash.as.map((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase()).filter(Boolean))].sort() : [];
  const ntModes  = dash ? [...new Set(dash.night.map((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase()).filter(Boolean))].sort() : [];
 
  // helper: input className — yellow if SQL-filled
  const igCls = (k) => sqlFilled[k] ? 'ma-sql-filled' : '';
 
  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ma-root">
      {loading && (
        <div className="ma-overlay">
          <div className="ma-spinner" />
          <div className="ma-overlay-text">{loadMsg}</div>
        </div>
      )}
 
      {/* ── Upload zone ── */}
      <div className="ma-upload-section">
        <div
          className={`ma-upload-zone${dragging ? ' drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('ma-file-input').click()}
        >
          <input id="ma-file-input" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files[0]) loadFile(e.target.files[0]); }} />
          <div className="ma-up-icon">📊</div>
          <div className="ma-up-title">{fileName || 'Drop your Excel / CSV file here'}</div>
          <div className="ma-up-sub">Supports .xlsx · .xls · .csv — all columns auto-detected</div>
        </div>
 
        {parseInfo && (
          <>
            <div className="ma-parse-stats">
              <span>Rows parsed: <b>{parseInfo.rows.toLocaleString()}</b></span>
              <span>Rows with MID: <b>{parseInfo.withMid.toLocaleString()}</b></span>
              <span>Unique MIDs: <b>{parseInfo.uniqMids}</b></span>
            </div>
            <div className="ma-mid-bar">
              <select className="ma-mid-select" value={selMid} onChange={(e) => setSelMid(e.target.value)}>
                <option value="">— Select MID —</option>
                {midList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <button className="ma-analyze-btn" onClick={runAnalysis}>⚡ Analyze</button>
              {selMid && <span className="ma-mid-badge">MID: {selMid}</span>}
              <button className="ma-cfg-btn" onClick={() => setShowApiConfig((v) => !v)} title="API / Date settings">⚙ API Settings</button>
            </div>
 
            {/* ── API Config panel ── */}
            {showApiConfig && (
              <div className="ma-api-config">
                <div className="ma-cfg-field">
                  <label>Backend URL</label>
                  <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} style={{ width: 220 }} />
                </div>
                <div className="ma-cfg-field">
                  <label>Manual Cookie (optional)</label>
                  <input type="password" placeholder="Leave blank = auto-grab from Chrome" value={apiCookie} onChange={(e) => setApiCookie(e.target.value)} style={{ width: 280 }} />
                </div>
                <div className="ma-cfg-field">
                  <label>Trino DB ID</label>
                  <select value={dbId} onChange={(e) => setDbId(e.target.value)} style={{ width: 180 }}>
                    <option value="3">Hive Offline (ID 3)</option>
                    <option value="2">Hive (ID 2)</option>
                  </select>
                </div>
                <div className="ma-cfg-field">
                  <label>Query From</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="ma-cfg-field">
                  <label>Query To</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
            )}
 
            {/* ── Fetch status banner ── */}
            <FetchBanner status={fetchStatus} message={fetchMessage} />
          </>
        )}
      </div>
 
      {/* ── Dashboard ── */}
      {dash && (
        <div className="ma-dashboard">
 
          {/* ── Merchant Profile Panel (SQL) ── */}
          {sqlProfileData && (
            <>
              <SectionTitle>
                Merchant Profile{' '}
                <span className="ma-sql-tag" style={{ fontSize: 10, marginLeft: 8 }}>SQL AUTO-FILLED</span>
              </SectionTitle>
              <MerchantProfilePanel data={sqlProfileData} />
            </>
          )}
 
          {/* ── Insight Generator ── */}
          <SectionTitle>Insight &amp; Comment Generator</SectionTitle>
          <div className="ma-ig-wrap">
            <p className="ma-ig-note">
              Fields marked <SqlTag /> are filled automatically from Superset when you click Analyze.{' '}
              Fields marked <AutoTag /> come from your uploaded file.{' '}
              Fields marked <ManualTag /> need your input.
            </p>
 
            {/* Merchant Profile section */}
            <div className="ma-ig-section-head">Merchant Profile <SqlTag /></div>
            <div className="ma-ig-grid">
              {/* SQL text fields */}
              {[
                ['mid',     'MID',            true],
                ['bname',   'Business Name',   true],
                ['onboard', 'Onboarding Date', true],
                ['cat',     'Category',        true],
                ['subcat',  'Subcategory / MCC', true],
                ['mtype',   'Merchant Type',   true],
                ['gstin',   'GSTIN',           true],
                ['pan',     'Business PAN',    true],
              ].map(([k, lbl, isSQL]) => (
                <div className="ma-ig-field" key={k}>
                  <label>{lbl} {isSQL ? <SqlTag /> : <ManualTag />}</label>
                  <input className={igCls(k)} value={igManual[k] || ''} onChange={(e) => setIg(k, e.target.value)} placeholder={isSQL ? 'Auto-filled from SQL' : ''} />
                </div>
              ))}
 
              {/* SQL select fields */}
              {[
                ['status', 'Account Status',       ['ACTIVE','INACTIVE','SUSPENDED','BLOCKED']],
                ['btype',  'Business Type',         ['INDIVIDUAL','PROPRIETORSHIP','PARTNERSHIP','PRIVATE LIMITED','PUBLIC LIMITED','LLP','TRUST','NGO']],
                ['risk',   'Risk Category',         ['LOW','MEDIUM','HIGH']],
                ['pmode',  'Primary Payment Mode',  ['UPI','CREDIT_CARD','DEBIT_CARD','ALL']],
              ].map(([k, lbl, opts]) => (
                <div className="ma-ig-field" key={k}>
                  <label>{lbl} <SqlTag /></label>
                  <select className={igCls(k)} value={igManual[k]} onChange={(e) => setIg(k, e.target.value)}>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
 
              {/* Manual fields */}
              {[
                ['signatory', 'Authorised Signatory'],
                ['dob',       'DOB'],
                ['mobile',    'Mobile No'],
              ].map(([k, lbl]) => (
                <div className="ma-ig-field" key={k}>
                  <label>{lbl} <ManualTag /></label>
                  <input value={igManual[k] || ''} onChange={(e) => setIg(k, e.target.value)} />
                </div>
              ))}
 
              {/* Manual selects */}
              {[
                ['lea',     'UPI LEA Notice', ['NA','YES']],
                ['fiu',     'FIU Alerts',     ['NA','YES']],
                ['prevStr', 'Previous STR',   ['NO','YES']],
              ].map(([k, lbl, opts]) => (
                <div className="ma-ig-field" key={k}>
                  <label>{lbl} <ManualTag /></label>
                  <select value={igManual[k]} onChange={(e) => setIg(k, e.target.value)}>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
 
              {/* Full-width fields */}
              <div className="ma-ig-field ma-ig-full">
                <label>Address <SqlTag /></label>
                <input className={igCls('addr')} value={igManual.addr} onChange={(e) => setIg('addr', e.target.value)} placeholder="Auto-filled from SQL" />
              </div>
              <div className="ma-ig-field ma-ig-full">
                <label>Alert Type <ManualTag /></label>
                <input value={igManual.alert} onChange={(e) => setIg('alert', e.target.value)} placeholder="e.g. High value or volume of transactions in high risk MCC codes" />
              </div>
              <div className="ma-ig-field ma-ig-full">
                <label>Settlement Bank &amp; Account Details <ManualTag /></label>
                <input value={igManual.bank} onChange={(e) => setIg('bank', e.target.value)} placeholder="e.g. FINO PAYMENTS BANK, Account No. 20409298575, IFSC- FINO0009001" />
              </div>
            </div>
 
            {/* Review period */}
            <div className="ma-ig-section-head">Review Period <ManualTag /></div>
            <div className="ma-ig-grid">
              <div className="ma-ig-field"><label>From Date</label><input type="date" value={igManual.from} onChange={(e) => setIg('from', e.target.value)} /></div>
              <div className="ma-ig-field"><label>To Date</label><input type="date" value={igManual.to} onChange={(e) => setIg('to', e.target.value)} /></div>
            </div>
 
            {/* Transaction data (Excel) */}
            <div className="ma-ig-section-head">Transaction Data <AutoTag /></div>
            <div className="ma-ig-grid">
              {[
                ['totalcr',  'Total Credits (₹ Lakh)'],
                ['txncount', 'Total Transactions'],
                ['minpay',   'Min Single Payment (₹)'],
                ['maxpay',   'Max Single Payment (₹)'],
                ['nightcnt', 'Night Txn Count (10PM–6AM)'],
                ['nightamt', 'Night Txn Amount (₹ Lakh)'],
                ['roundcnt', 'Round Amount Txn Count'],
                ['avgmonth', 'Avg Monthly Amount (₹ Lakh)'],
              ].map(([k, lbl]) => (
                <div className="ma-ig-field" key={k}>
                  <label>{lbl}</label>
                  <input readOnly value={igAuto[k] || ''} className="ma-auto-input" />
                </div>
              ))}
              <div className="ma-ig-field ma-ig-full">
                <label>Peak Months (auto-detected)</label>
                <input readOnly value={igAuto.peakmonths || ''} className="ma-auto-input" />
              </div>
              <div className="ma-ig-field ma-ig-full">
                <label>Top Round-Sum Values</label>
                <textarea readOnly value={igAuto.roundvals || ''} className="ma-auto-input" rows={3} />
              </div>
              <div className="ma-ig-field ma-ig-full">
                <label>Suspicious VPAs (edit as needed)</label>
                <textarea value={igManual.vpas || igAuto.vpas || ''} onChange={(e) => setIg('vpas', e.target.value)} rows={2} />
              </div>
            </div>
 
            {/* Additional observations */}
            <div className="ma-ig-section-head">Additional Observations <ManualTag /></div>
            <div className="ma-ig-grid">
              <div className="ma-ig-field ma-ig-full">
                <label>Additional remarks / observations (optional)</label>
                <textarea value={igManual.remarks} onChange={(e) => setIg('remarks', e.target.value)} rows={3} />
              </div>
              <div className="ma-ig-field">
                <label>Conclusion</label>
                <select value={igManual.conclusion} onChange={(e) => setIg('conclusion', e.target.value)}>
                  <option value="STR">File STR</option>
                  <option value="MONITOR">Continue Monitoring</option>
                  <option value="CLOSE">Close — No Suspicious Activity</option>
                </select>
              </div>
            </div>
 
            <button className="ma-gen-btn" onClick={generateComment}>⚡ Generate Comment</button>
 
            {igOutput && (
              <div className="ma-output-wrap">
                <div className="ma-output-box">{igOutput}</div>
                <button className="ma-copy-btn" onClick={() => { navigator.clipboard.writeText(igOutput).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>
                  {copied ? '✓ Copied!' : '⎘ Copy to Clipboard'}
                </button>
              </div>
            )}
          </div>
 
          {/* ── Overview ── */}
          <SectionTitle>Overview — Acquiring Success Transactions</SectionTitle>
          <div className="ma-stat-grid">
            <StatCard label="Acquiring Success Txns" value={dash.as.length.toLocaleString()} color="highlight" />
            <StatCard label="Total Amount" value={fmtN(dash.tot)} color="highlight" />
            <StatCard label="Avg Amount" value={fmtN(dash.tot / (dash.as.length || 1))} />
            <StatCard label="Round Amounts" value={`${dash.rnd.length} (${dash.as.length ? ((dash.rnd.length / dash.as.length) * 100).toFixed(1) : 0}%)`} color="amber" />
          </div>
 
          <SectionTitle>Settled Amount (Debit)</SectionTitle>
          <div className="ma-stat-grid">
            <StatCard label="Total Settled Amount (Debit)" value={fmtN(dash.totS)} color="green" />
            <StatCard label="Settlement Txn Count" value={dash.stxns.length.toLocaleString()} color="green" />
            <StatCard label="Unique UTR Count" value={dash.utrCount.toLocaleString()} color="teal" />
          </div>
 
          <SectionTitle>Night Transactions (10 PM – 6 AM)</SectionTitle>
          <div className="ma-stat-grid">
            <StatCard label="Night (10 PM – 6 AM)" value={dash.night.length.toLocaleString()} sub={'Total Amount: ' + fmtN(dash.na)} color="night" />
            <StatCard label="Morning (6 AM – 12 PM)" value={dash.morning.length.toLocaleString()} />
            <StatCard label="Afternoon/Evening (12–10 PM)" value={dash.aft.length.toLocaleString()} />
          </div>
 
          <SectionTitle>Payment Mode Summary</SectionTitle>
          <div className="ma-three-col">
            {[
              { lbl: 'UPI Transactions', rows: dash.upi, cls: 'teal' },
              { lbl: 'Credit Card Transactions', rows: dash.cc2, cls: 'highlight' },
              { lbl: 'Debit Card Transactions', rows: dash.dc, cls: 'amber' },
            ].map(({ lbl, rows, cls }) => (
              <StatCard key={lbl} label={lbl} value={rows.length.toLocaleString()} sub={fmtN(rows.reduce((s, r) => s + gAmt(r, colMap), 0))} color={cls} />
            ))}
          </div>
 
          <SectionTitle>UPI &amp; Payment Mode Analysis</SectionTitle>
          <div className="ma-panel"><div className="ma-panel-title">Payment Mode Distribution</div><ModeChart modeMap={dash.mm} /></div>
 
          <SectionTitle>Monthly Trend (Acquiring Success)</SectionTitle>
          <div className="ma-panel"><div className="ma-panel-title">Month-wise Transaction Amount</div><MonthChart months={dash.months} mmap={dash.mmap} /></div>
          <div className="ma-panel" style={{ marginTop: 16 }}>
            <div className="ma-panel-title">Month-wise Summary <span className="ma-count-badge">{dash.months.length} months</span></div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr>{[['month','Month'],['total','Total Amount'],['count','Count'],['avg','Avg Amount']].map(([k,lbl]) => <th key={k} className="sortable" onClick={() => toggleSort(setMSort, k)}>{lbl} {arrow(mSort, k)}</th>)}</tr></thead>
                <tbody>{sortedMonths.map((m) => <tr key={m}><td style={{ fontWeight:500 }}>{m}</td><td>{fmtN(dash.mmap[m].amount)}</td><td>{dash.mmap[m].count.toLocaleString()}</td><td>{fmtN(dash.mmap[m].amount / (dash.mmap[m].count || 1))}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
 
          <SectionTitle>Failed Transactions</SectionTitle>
          <div className="ma-stat-grid">
            <StatCard label="Failed Transactions" value={dash.fail.length.toLocaleString()} color="red" />
            <StatCard label="Failed Amount" value={fmtN(dash.fail.reduce((s, r) => s + gAmt(r, colMap), 0))} color="red" />
          </div>
          <div className="ma-panel" style={{ marginTop: 16 }}>
            <div className="ma-panel-title">Failed Transaction List <span className="ma-count-badge">{dash.fail.length} rows</span></div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr><th>Date</th><th>Amount</th><th>Payment Mode</th><th>Status</th><th>Customer VPA</th></tr></thead>
                <tbody>{dash.fail.slice(0,200).map((r,i) => <tr key={i}><td>{fmtD(r,colMap)}</td><td>{fmtN(gAmt(r,colMap))}</td><td><span className="ma-badge ma-badge-mode">{gv(r,colMap,'paymentmode')||'—'}</span></td><td><span className="ma-badge ma-badge-fail">{gv(r,colMap,'status')||'—'}</span></td><td>{gv(r,colMap,'customervpa')||'—'}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="ma-note">Up to 200 rows.</p>
          </div>
 
          <SectionTitle>Credit Card Details</SectionTitle>
          <div className="ma-panel">
            <div className="ma-panel-title">Credit Card Transactions <span className="ma-count-badge">{filteredCC.length} shown / {dash.cc.length} total</span></div>
            <div className="ma-filter-bar">
              <label>From:</label><input type="date" value={ccFilter.from} onChange={(e) => setCcFilter((p) => ({ ...p, from: e.target.value }))} />
              <label>To:</label><input type="date" value={ccFilter.to} onChange={(e) => setCcFilter((p) => ({ ...p, to: e.target.value }))} />
              <label>Min ₹:</label><input type="number" style={{ width:90 }} value={ccFilter.min} onChange={(e) => setCcFilter((p) => ({ ...p, min: e.target.value }))} />
              <label>Max ₹:</label><input type="number" style={{ width:100 }} value={ccFilter.max} onChange={(e) => setCcFilter((p) => ({ ...p, max: e.target.value }))} />
              <button className="ma-filter-btn ma-reset" onClick={() => setCcFilter({ from:'',to:'',min:'',max:'' })}>Reset</button>
            </div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr>{[['date','Date'],['amount','Amount']].map(([k,lbl]) => <th key={k} className="sortable" onClick={() => toggleSort(setCcSort, k)}>{lbl} {arrow(ccSort, k)}</th>)}<th>Last-4</th><th>Issuing Bank</th><th>Customer</th></tr></thead>
                <tbody>{filteredCC.map((r,i) => { const l4=gv(r,colMap,'creditdebitcardlast4digits')||gv(r,colMap,'cardlast4')||'—'; return <tr key={i}><td>{fmtD(r,colMap)}</td><td>{fmtN(gAmt(r,colMap))}</td><td>{l4}</td><td>{gv(r,colMap,'issuingbank')||'—'}</td><td>{gv(r,colMap,'customername')||gv(r,colMap,'merchantname')||'—'}</td></tr>; })}</tbody>
              </table>
            </div>
          </div>
 
          <SectionTitle>Round Amount Analysis</SectionTitle>
          <div className="ma-panel">
            <div className="ma-panel-title">Top Round Amount Values <span className="ma-count-badge">{sortedRound.length} values</span></div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr>{[['amt','Amount'],['cnt','Count'],['val','Value (Amt×Count)']].map(([k,lbl]) => <th key={k} className="sortable" onClick={() => toggleSort(setRndSort, k)}>{lbl} {arrow(rndSort, k)}</th>)}</tr></thead>
                <tbody>{sortedRound.map((x,i) => <tr key={i}><td style={{ fontWeight:500 }}>{x.amt.toLocaleString('en-IN')}</td><td>{x.cnt}</td><td>{fmtN(x.amt*x.cnt)}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="ma-note">Counts only transactions where Amount is a round number.</p>
          </div>
 
          <SectionTitle>Time-Based Transaction Detail</SectionTitle>
          <div className="ma-panel">
            <div className="ma-panel-title">Night Transactions (10 PM – 6 AM) <span className="ma-count-badge">{filteredNt.length} shown / {dash.night.length} total</span></div>
            <div className="ma-filter-bar">
              <label>Mode:</label>
              <select value={ntFilter.mode} onChange={(e) => setNtFilter((p) => ({ ...p, mode: e.target.value }))}>
                <option value="">All</option>{ntModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <label>From:</label><input type="date" value={ntFilter.from} onChange={(e) => setNtFilter((p) => ({ ...p, from: e.target.value }))} />
              <label>To:</label><input type="date" value={ntFilter.to} onChange={(e) => setNtFilter((p) => ({ ...p, to: e.target.value }))} />
              <label>Min ₹:</label><input type="number" style={{ width:90 }} value={ntFilter.min} onChange={(e) => setNtFilter((p) => ({ ...p, min: e.target.value }))} />
              <button className="ma-filter-btn ma-reset" onClick={() => setNtFilter({ mode:'',from:'',to:'',min:'',max:'' })}>Reset</button>
            </div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr>{[['date','Date'],['amount','Amount']].map(([k,lbl]) => <th key={k} className="sortable" onClick={() => toggleSort(setNtSort, k)}>{lbl} {arrow(ntSort, k)}</th>)}<th>Payment Mode</th><th>Last-4</th><th>Customer VPA</th></tr></thead>
                <tbody>{filteredNt.map((r,i) => { const l4=gv(r,colMap,'creditdebitcardlast4digits')||gv(r,colMap,'cardlast4')||'—'; return <tr key={i}><td>{fmtD(r,colMap)}</td><td className="ma-night-amount">{fmtN(gAmt(r,colMap))}</td><td><span className="ma-badge ma-badge-mode">{gv(r,colMap,'paymentmode')||'—'}</span></td><td>{l4}</td><td>{gv(r,colMap,'customervpa')||'—'}</td></tr>; })}</tbody>
              </table>
            </div>
          </div>
 
          {[{ title:'Morning Transactions (6 AM – 12 PM)', rows:dash.morning }, { title:'Afternoon / Evening (12 PM – 10 PM)', rows:dash.aft }].map(({ title, rows }) => (
            <div className="ma-panel" style={{ marginTop:16 }} key={title}>
              <div className="ma-panel-title">{title} <span className="ma-count-badge">{rows.length} rows</span></div>
              <div className="ma-tbl-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Amount</th><th>Payment Mode</th><th>Last-4</th><th>Customer VPA</th></tr></thead>
                  <tbody>{rows.slice(0,200).map((r,i) => { const l4=gv(r,colMap,'creditdebitcardlast4digits')||gv(r,colMap,'cardlast4')||'—'; return <tr key={i}><td>{fmtD(r,colMap)}</td><td>{fmtN(gAmt(r,colMap))}</td><td><span className="ma-badge ma-badge-mode">{gv(r,colMap,'paymentmode')||'—'}</span></td><td>{l4}</td><td>{gv(r,colMap,'customervpa')||'—'}</td></tr>; })}</tbody>
                </table>
              </div>
            </div>
          ))}
 
          <SectionTitle>All Acquiring Success Transactions</SectionTitle>
          <div className="ma-panel">
            <div className="ma-panel-title">All Transactions <span className="ma-count-badge">{filteredAll.length} shown / {dash.as.length} total</span></div>
            <div className="ma-filter-bar">
              <label>Mode:</label>
              <select value={allFilter.mode} onChange={(e) => setAllFilter((p) => ({ ...p, mode: e.target.value }))}>
                <option value="">All</option>{allModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <label>From:</label><input type="date" value={allFilter.from} onChange={(e) => setAllFilter((p) => ({ ...p, from: e.target.value }))} />
              <label>To:</label><input type="date" value={allFilter.to} onChange={(e) => setAllFilter((p) => ({ ...p, to: e.target.value }))} />
              <label>Min ₹:</label><input type="number" style={{ width:90 }} value={allFilter.min} onChange={(e) => setAllFilter((p) => ({ ...p, min: e.target.value }))} />
              <label>Max ₹:</label><input type="number" style={{ width:100 }} value={allFilter.max} onChange={(e) => setAllFilter((p) => ({ ...p, max: e.target.value }))} />
              <button className="ma-filter-btn ma-reset" onClick={() => setAllFilter({ mode:'',from:'',to:'',min:'',max:'' })}>Reset</button>
            </div>
            <div className="ma-tbl-wrap">
              <table>
                <thead><tr>{[['date','Date'],['amount','Amount'],['settled','Settled Amt']].map(([k,lbl]) => <th key={k} className="sortable" onClick={() => toggleSort(setAllSort, k)}>{lbl} {arrow(allSort, k)}</th>)}<th>Payment Mode</th><th>Customer VPA</th><th>Last-4</th><th>Risk Category</th></tr></thead>
                <tbody>{filteredAll.map((r,i) => { const l4=gv(r,colMap,'creditdebitcardlast4digits')||gv(r,colMap,'cardlast4')||'—'; const s=gSettled(r,colMap); const risk=gv(r,colMap,'riskcategory')||gv(r,colMap,'Risk_category')||'—'; return <tr key={i}><td>{fmtD(r,colMap)}</td><td style={{ fontWeight:500 }}>{fmtN(gAmt(r,colMap))}</td><td>{s?fmtN(s):'—'}</td><td><span className="ma-badge ma-badge-mode">{gv(r,colMap,'paymentmode')||'—'}</span></td><td>{gv(r,colMap,'customervpa')||'—'}</td><td>{l4}</td><td>{risk!=='—'?<span className="ma-badge ma-badge-success">{risk}</span>:'—'}</td></tr>; })}</tbody>
              </table>
            </div>
            <p className="ma-note">Click column headers to sort.</p>
          </div>
 
        </div>
      )}
    </div>
  );
}


// function nk(k) { return k.trim().toLowerCase().replace(/[\s_\-\/]+/g, ''); }
 
// function buildColMap(rows) {
//   const cm = {};
//   if (!rows.length) return cm;
//   Object.keys(rows[0]).forEach((k) => { cm[nk(k)] = k; });
//   return cm;
// }
 
// function col(cm, a) {
//   const n = nk(a);
//   if (cm[n]) return cm[n];
//   const ks = Object.keys(cm);
//   for (const k of ks) if (k.includes(n) || n.includes(k)) return cm[k];
//   return null;
// }
 
// function gv(row, cm, a) {
//   const c = col(cm, a);
//   return c ? (row[c] !== undefined ? row[c] : '') : '';
// }
 
// function gDate(row, cm) {
//   const v = gv(row, cm, 'transactiondate') || gv(row, cm, 'Transaction_Date');
//   if (!v) return null;
//   if (v instanceof Date) return v;
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? null : d;
// }
 
// function gHour(row, cm) { const d = gDate(row, cm); return d ? d.getHours() : -1; }
// function isNightRow(row, cm) { const h = gHour(row, cm); return h >= 22 || h < 6; }
 
// function gAmt(row, cm) {
//   const n = parseFloat(String(gv(row, cm, 'amount') || '').replace(/,/g, ''));
//   return isNaN(n) ? 0 : n;
// }
 
// function gSettled(row, cm) {
//   const n = parseFloat(String((gv(row, cm, 'settledamount') || gv(row, cm, 'Settled_Amount') || '')).replace(/,/g, ''));
//   return isNaN(n) ? 0 : n;
// }
 
// function fmtN(n) {
//   if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
//   if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
//   return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
// }
 
// function fmtD(row, cm) {
//   const d = gDate(row, cm);
//   if (!d) return String(gv(row, cm, 'transactiondate') || '');
//   return d.toISOString().replace('T', ' ').substring(0, 19);
// }
 
// function fmtDateStr(s) {
//   if (!s) return s;
//   const d = new Date(s);
//   if (isNaN(d.getTime())) return s;
//   return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// }
 
// function isAS(row, cm) {
//   return String(gv(row, cm, 'transactiontype') || '').toUpperCase() === 'ACQUIRING'
//       && String(gv(row, cm, 'status') || '').toUpperCase() === 'SUCCESS';
// }
 
// // ─── sub-components ──────────────────────────────────────────────────────────
// function StatCard({ label, value, sub, color }) {
//   return (
//     <div className={`ma-stat-card${color ? ' ' + color : ''}`}>
//       <div className="ma-sc-label">{label}</div>
//       <div className="ma-sc-val">{value}</div>
//       {sub && <div className="ma-sc-sub">{sub}</div>}
//     </div>
//   );
// }
 
// function SectionTitle({ children }) {
//   return <div className="ma-section-title">{children}</div>;
// }
 
// // ─── Chart wrappers ───────────────────────────────────────────────────────────
// function ModeChart({ modeMap }) {
//   const ref = useRef(null);
//   const ci  = useRef(null);
 
//   useEffect(() => {
//     if (!ref.current || !modeMap) return;
//     if (ci.current) { ci.current.destroy(); ci.current = null; }
//     const labels = Object.keys(modeMap);
//     const data   = labels.map((k) => modeMap[k]);
//     const colors = ['#2563eb','#f59e0b','#6b7280','#10b981','#8b5cf6','#ef4444','#0891b2'];
//     ci.current = new Chart(ref.current, {
//       type: 'doughnut',
//       data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }] },
//       options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'DM Mono', size: 11 }, boxWidth: 12 } } } },
//     });
//     return () => { if (ci.current) { ci.current.destroy(); ci.current = null; } };
//   }, [modeMap]);
 
//   return <div className="ma-chart-wrap"><canvas ref={ref} /></div>;
// }
 
// function MonthChart({ months, mmap }) {
//   const ref = useRef(null);
//   const ci  = useRef(null);
 
//   useEffect(() => {
//     if (!ref.current || !months?.length) return;
//     if (ci.current) { ci.current.destroy(); ci.current = null; }
//     ci.current = new Chart(ref.current, {
//       type: 'line',
//       data: {
//         labels: months,
//         datasets: [{
//           label: 'Total Amount',
//           data: months.map((m) => mmap[m].amount),
//           borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.06)',
//           pointBackgroundColor: '#2563eb', tension: .4, fill: true, pointRadius: 4,
//         }],
//       },
//       options: {
//         responsive: true, maintainAspectRatio: false,
//         plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => '₹' + c.raw.toLocaleString('en-IN', { maximumFractionDigits: 2 }) } } },
//         scales: {
//           x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'DM Mono', size: 10 } } },
//           y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'DM Mono', size: 10 }, callback: (v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString()) } },
//         },
//       },
//     });
//     return () => { if (ci.current) { ci.current.destroy(); ci.current = null; } };
//   }, [months, mmap]);
 
//   return <div className="ma-chart-wrap"><canvas ref={ref} /></div>;
// }
 
// // ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// export default function MerchantAnalyzer() {
//   // ── state ──────────────────────────────────────────────────────────────────
//   const [allRows,  setAllRows]  = useState([]);
//   const [colMap,   setColMap]   = useState({});
//   const [fileName, setFileName] = useState('');
//   const [parseInfo, setParseInfo] = useState(null);   // { rows, withMid, uniqMids }
//   const [midList,  setMidList]  = useState([]);
//   const [selMid,   setSelMid]   = useState('');
//   const [loading,  setLoading]  = useState(false);
//   const [dash,     setDash]     = useState(null);     // analysed output object
//   const [dragging, setDragging] = useState(false);
 
//   // filter states
//   const [ccFilter,  setCcFilter]  = useState({ from:'', to:'', min:'', max:'' });
//   const [ntFilter,  setNtFilter]  = useState({ mode:'', from:'', to:'', min:'', max:'' });
//   const [allFilter, setAllFilter] = useState({ mode:'', from:'', to:'', min:'', max:'' });
 
//   // sort states
//   const [ccSort,    setCcSort]    = useState({ col:'date', dir:-1 });
//   const [ntSort,    setNtSort]    = useState({ col:'date', dir:-1 });
//   const [allSort,   setAllSort]   = useState({ col:'amount', dir:-1 });
//   const [mSort,     setMSort]     = useState({ col:'total', dir:-1 });
//   const [rndSort,   setRndSort]   = useState({ col:'cnt', dir:-1 });
 
//   // insight generator
//   const [igManual, setIgManual] = useState({
//     mid:'', bname:'', status:'ACTIVE', onboard:'', cat:'', subcat:'',
//     btype:'INDIVIDUAL', mtype:'', risk:'LOW', pmode:'UPI', signatory:'',
//     dob:'', mobile:'', gstin:'', pan:'', lea:'NA', fiu:'NA', prevStr:'NO',
//     addr:'', alert:'', bank:'', from:'', to:'', vpas:'', remarks:'', conclusion:'STR',
//   });
//   const [igAuto,   setIgAuto]   = useState({});
//   const [igOutput, setIgOutput] = useState('');
//   const [copied,   setCopied]   = useState(false);
 
//   // ── file load ──────────────────────────────────────────────────────────────
//   const loadFile = useCallback((file) => {
//     if (!file) return;
//     setFileName(file.name);
//     setDash(null);
//     setLoading(true);
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
//         const ws   = wb.Sheets[wb.SheetNames[0]];
//         const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
//         const cm   = buildColMap(rows);
//         setColMap(cm);
//         setAllRows(rows);
 
//         const mc = col(cm, 'mid');
//         const withMid = mc ? rows.filter((r) => String(r[mc] || '').trim()).length : 0;
//         const seen = {};
//         const mids = [];
//         if (mc) rows.forEach((r) => { const v = String(r[mc] || '').trim(); if (v && !seen[v]) { seen[v] = true; mids.push(v); } });
//         mids.sort();
//         setMidList(mids);
//         setSelMid(mids.length === 1 ? mids[0] : '');
//         setParseInfo({ rows: rows.length, withMid, uniqMids: mids.length });
//       } catch (err) {
//         alert('Read error: ' + err.message);
//       }
//       setLoading(false);
//     };
//     reader.readAsArrayBuffer(file);
//   }, []);
 
//   const onDrop = (e) => {
//     e.preventDefault(); setDragging(false);
//     if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
//   };
 
//   // ── analyse ────────────────────────────────────────────────────────────────
//   const runAnalysis = () => {
//     if (!selMid || !allRows.length) return;
//     setLoading(true);
//     setTimeout(() => {
//       const mc   = col(colMap, 'mid');
//       const rows = mc ? allRows.filter((r) => String(r[mc] || '').trim() === selMid) : allRows;
//       const as   = rows.filter((r) => isAS(r, colMap));
 
//       const tot  = as.reduce((s, r) => s + gAmt(r, colMap), 0);
//       const totS = as.reduce((s, r) => s + gSettled(r, colMap), 0);
//       const rnd  = as.filter((r) => { const a = gAmt(r, colMap); return a > 0 && Number.isInteger(a); });
//       const night= as.filter((r) => isNightRow(r, colMap));
//       const na   = night.reduce((s, r) => s + gAmt(r, colMap), 0);
//       const morning = as.filter((r) => { const h = gHour(r, colMap); return h >= 6 && h < 12; });
//       const aft     = as.filter((r) => { const h = gHour(r, colMap); return h >= 12 && h < 22; });
 
//       // modes
//       const mm = {};
//       as.forEach((r) => { const m = String(gv(r, colMap, 'paymentmode') || 'UNKNOWN').toUpperCase(); mm[m] = (mm[m] || 0) + 1; });
 
//       // month map
//       const mmap = {};
//       as.forEach((r) => {
//         const d = gDate(r, colMap); if (!d) return;
//         const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
//         if (!mmap[k]) mmap[k] = { count: 0, amount: 0 };
//         mmap[k].count++; mmap[k].amount += gAmt(r, colMap);
//       });
//       const months = Object.keys(mmap).sort();
 
//       // failed
//       const fail = rows.filter((r) => { const s = String(gv(r, colMap, 'status') || '').toUpperCase(); return s === 'FAILED' || s === 'FAILURE' || s === 'FAIL'; });
 
//       // CC
//       const cc = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'CREDIT_CARD');
 
//       // round amounts
//       const roundMap = {};
//       as.forEach((r) => { const a = gAmt(r, colMap); if (a > 0 && Number.isInteger(a)) roundMap[a] = (roundMap[a] || 0) + 1; });
//       const roundArr = Object.keys(roundMap).map((k) => ({ amt: parseFloat(k), cnt: roundMap[k] })).sort((a, b) => b.cnt - a.cnt);
 
//       // settled UTR
//       const stxns = rows.filter((r) => gSettled(r, colMap) > 0);
//       const uc = col(colMap, 'utrnumber') || col(colMap, 'utrno') || col(colMap, 'utr');
//       const us = new Set();
//       if (uc) stxns.forEach((r) => { if (r[uc]) us.add(String(r[uc]).trim()); });
 
//       // mode stats
//       const upi = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'UPI');
//       const cc2 = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'CREDIT_CARD');
//       const dc  = as.filter((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase() === 'DEBIT_CARD');
 
//       // auto-fill insight
//       const amts = as.map((r) => gAmt(r, colMap)).filter((a) => a > 0);
//       const sortedM = months.slice().sort((a, b) => mmap[b].amount - mmap[a].amount);
//       const peaks = sortedM.slice(0, 3).map((m) => m + ' (₹' + (mmap[m].amount / 100000).toFixed(2) + ' L)');
//       const topR  = roundArr.slice(0, 5).map((x) => x.cnt + ' credits of ₹' + x.amt.toLocaleString('en-IN') + ' each (₹' + fmtN(x.amt * x.cnt).replace('₹', '') + ')');
//       const vpaCol = col(colMap, 'customervpa') || col(colMap, 'Customer_VPA');
//       const vpaMap = {};
//       if (vpaCol) as.forEach((r) => { const v = String(r[vpaCol] || '').trim(); if (v) vpaMap[v] = (vpaMap[v] || 0) + 1; });
//       const topVPA = Object.keys(vpaMap).sort((a, b) => vpaMap[b] - vpaMap[a]).slice(0, 7);
 
//       setIgAuto({
//         totalcr: (tot / 100000).toFixed(2) + ' L',
//         txncount: as.length,
//         minpay: amts.length ? Math.min(...amts).toLocaleString('en-IN') : '',
//         maxpay: amts.length ? Math.max(...amts).toLocaleString('en-IN') : '',
//         nightcnt: night.length,
//         nightamt: (na / 100000).toFixed(2) + ' L',
//         roundcnt: rnd.length,
//         avgmonth: months.length ? ((months.reduce((s, m) => s + mmap[m].amount, 0) / months.length) / 100000).toFixed(2) + ' L' : '',
//         peakmonths: peaks.join(', '),
//         roundvals: topR.join('\n'),
//         vpas: topVPA.join(', '),
//       });
 
//       setDash({
//         as, tot, totS, rnd, night, na, morning, aft,
//         mm, months, mmap, fail, cc, roundArr,
//         stxns, utrCount: us.size,
//         upi, cc2, dc,
//       });
//       setLoading(false);
//     }, 60);
//   };
 
//   // ── filters ────────────────────────────────────────────────────────────────
//   const applyFilter = (rows, f, cm) => {
//     return rows.filter((r) => {
//       if (f.mode && String(gv(r, cm, 'paymentmode') || '').toUpperCase() !== f.mode) return false;
//       const d = gDate(r, cm);
//       if (f.from && d && d < new Date(f.from)) return false;
//       if (f.to   && d && d > new Date(f.to + 'T23:59:59')) return false;
//       const a = gAmt(r, cm);
//       if (f.min && a < parseFloat(f.min)) return false;
//       if (f.max && a > parseFloat(f.max)) return false;
//       return true;
//     });
//   };
 
//   // ── table renderers ────────────────────────────────────────────────────────
//   const sortRows = (rows, sortState, cm) => {
//     return rows.slice().sort((a, b) => {
//       if (sortState.col === 'date')   return ((gDate(a, cm) || new Date(0)) - (gDate(b, cm) || new Date(0))) * sortState.dir;
//       if (sortState.col === 'amount') return (gAmt(a, cm) - gAmt(b, cm)) * sortState.dir;
//       if (sortState.col === 'settled')return (gSettled(a, cm) - gSettled(b, cm)) * sortState.dir;
//       return String(gv(a, cm, sortState.col) || '').localeCompare(String(gv(b, cm, sortState.col) || '')) * sortState.dir;
//     });
//   };
 
//   const toggleSort = (setter, col) => setter((s) => ({ col, dir: s.col === col ? s.dir * -1 : -1 }));
//   const arrow = (s, c) => <span className={'ma-sort-arrow' + (s.col === c ? ' active' : '')}>{s.col === c ? (s.dir === -1 ? '▼' : '▲') : '⇅'}</span>;
 
//   // ── generate comment ───────────────────────────────────────────────────────
//   const generateComment = () => {
//     const ig = igManual;
//     const ia = igAuto;
//     const period = ig.from && ig.to ? fmtDateStr(ig.from) + ' to ' + fmtDateStr(ig.to) : '[Review Period]';
//     const roundSentence = ia.roundvals
//       ? 'Many small and mid-value round-sum payments were recorded, including ' + ia.roundvals.split('\n').filter(Boolean).join(', ') + `. Such repetitive and uniform denominations are inconsistent with the transactional variability expected in a ${ig.subcat || '[Subcategory]'} business.`
//       : '';
//     const vpaSentence  = ig.vpas ? 'Analysis showed multiple credits from concentrated customers using multiple VPAs: ' + ig.vpas + ' and many more.' : '';
//     const peakSentence = ia.peakmonths && ia.avgmonth ? `The average monthly transaction amount is Rs. ${ia.avgmonth}, with a significant spike observed in ${ia.peakmonths}, which is not aligned with the merchant's declared line of business.` : '';
//     const nightSentence= ia.nightcnt && ia.nightamt   ? `Furthermore, late night / odd hour transactions were observed — ${ia.nightcnt} credits totalling Rs. ${ia.nightamt} between 00:00–06:00 hrs, which depicts a suspicious pattern inconsistent with the line of business of the merchant.` : '';
//     const conclusionText = ig.conclusion === 'STR'
//       ? "Based on the review, the transaction activity is disproportionate to the declared business profile and suggests possible misuse of the merchant account for fund routing or third-party transactions. The transactions within the account appear to lack legitimate business justification, raising concerns about their true nature. Additionally, the merchant's settlement account is suspected of being used as a pass-through mechanism, enabling unknown parties to route funds of an undisclosed source. Hence, a STR is being filed."
//       : ig.conclusion === 'MONITOR'
//       ? 'Based on the review, while some patterns are noted, the activity does not conclusively indicate suspicious behaviour at this stage. The account will be kept under enhanced monitoring for any further irregular patterns.'
//       : 'Based on the review, the transaction activity is consistent with the declared business profile and no suspicious patterns were observed. The case is being closed.';
 
//     const comment =
// `MID: ${ig.mid || '[MID]'}
// Business Name: ${ig.bname || '[Business Name]'}
// Account Status: ${ig.status}
// Onboarding Date: ${ig.onboard || '[Date]'}
// Category: ${ig.cat || '[Category]'}
// Subcategory: ${ig.subcat || '[Subcategory]'}
// Business Type: ${ig.btype}
// Merchant Type: ${ig.mtype || '[Type]'}
// GSTIN: ${ig.gstin || 'NA'}
// Business PAN: ${ig.pan || '[PAN]'}
// Payment Mode: ${ig.pmode}
// Authorised Signatory: ${ig.signatory || '[Name]'}
// DOB: ${ig.dob || '[DOB]'}
// Mobile No: ${ig.mobile || '[Mobile]'}
// Risk Category: ${ig.risk}
// UPI LEA Notice: ${ig.lea}
// FIU Alerts: ${ig.fiu}
// Previous STR: ${ig.prevStr}
// Address: ${ig.addr || '[Address]'}
// Alert: ${ig.alert || '[Alert Type]'}
 
// The settlement account is maintained with ${ig.bank || '[Bank Details]'}.
 
// A review of the transactions for the period ${period} revealed total credits of Rs. ${ia.totalcr || '[Amount]'} across ${ia.txncount || '[Count]'} ${ig.pmode} transactions, with individual payment values ranging from Rs. ${ia.minpay || '[Min]'} to Rs. ${ia.maxpay || '[Max]'}. ${vpaSentence ? vpaSentence + ' ' : ''}${roundSentence ? roundSentence + ' ' : ''}${nightSentence ? nightSentence + ' ' : ''}${peakSentence ? peakSentence + ' ' : ''}
 
// ${ig.remarks ? ig.remarks + '\n\n' : ''}The transaction behaviour, marked by repetitive inflows, round-sum patterns, and inconsistent activity, lacks credible economic rationale and indicates probable use of the account for fund routing or layering activities.
 
// ${conclusionText}`;
 
//     setIgOutput(comment);
//   };
 
//   // ── derived tables ─────────────────────────────────────────────────────────
//   const filteredCC  = dash ? sortRows(applyFilter(dash.cc, ccFilter, colMap), ccSort, colMap) : [];
//   const filteredNt  = dash ? sortRows(applyFilter(dash.night, ntFilter, colMap), ntSort, colMap) : [];
//   const filteredAll = dash ? sortRows(applyFilter(dash.as, allFilter, colMap), allSort, colMap) : [];
 
//   const sortedMonths = dash ? [...dash.months].sort((a, b) => {
//     if (mSort.col === 'month')  return a.localeCompare(b) * mSort.dir;
//     if (mSort.col === 'count')  return (dash.mmap[a].count - dash.mmap[b].count) * mSort.dir;
//     if (mSort.col === 'avg')    return ((dash.mmap[a].amount / dash.mmap[a].count) - (dash.mmap[b].amount / dash.mmap[b].count)) * mSort.dir;
//     return (dash.mmap[a].amount - dash.mmap[b].amount) * mSort.dir;
//   }) : [];
 
//   const sortedRound = dash ? [...dash.roundArr].sort((a, b) => {
//     if (rndSort.col === 'amt') return (a.amt - b.amt) * rndSort.dir;
//     if (rndSort.col === 'val') return ((a.amt * a.cnt) - (b.amt * b.cnt)) * rndSort.dir;
//     return (a.cnt - b.cnt) * rndSort.dir;
//   }) : [];
 
//   // unique payment modes for filter dropdowns
//   const allModes = dash ? [...new Set(dash.as.map((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase()).filter(Boolean))].sort() : [];
//   const ntModes  = dash ? [...new Set(dash.night.map((r) => String(gv(r, colMap, 'paymentmode') || '').toUpperCase()).filter(Boolean))].sort() : [];
 
//   const setIg = (k, v) => setIgManual((p) => ({ ...p, [k]: v }));
 
//   // ── render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="ma-root">
//       {loading && (
//         <div className="ma-overlay">
//           <div className="ma-spinner" />
//           <div className="ma-overlay-text">Processing transactions…</div>
//         </div>
//       )}
 
//       {/* ── Upload zone ── */}
//       <div className="ma-upload-section">
//         <div
//           className={`ma-upload-zone${dragging ? ' drag' : ''}`}
//           onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//           onDragLeave={() => setDragging(false)}
//           onDrop={onDrop}
//           onClick={() => document.getElementById('ma-file-input').click()}
//         >
//           <input id="ma-file-input" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
//             onChange={(e) => { if (e.target.files[0]) loadFile(e.target.files[0]); }} />
//           <div className="ma-up-icon">📊</div>
//           <div className="ma-up-title">{fileName || 'Drop your Excel / CSV file here'}</div>
//           <div className="ma-up-sub">Supports .xlsx · .xls · .csv — all columns auto-detected</div>
//         </div>
 
//         {parseInfo && (
//           <>
//             <div className="ma-parse-stats">
//               <span>Rows parsed: <b>{parseInfo.rows.toLocaleString()}</b></span>
//               <span>Rows with MID: <b>{parseInfo.withMid.toLocaleString()}</b></span>
//               <span>Unique MIDs: <b>{parseInfo.uniqMids}</b></span>
//             </div>
//             <div className="ma-mid-bar">
//               <select className="ma-mid-select" value={selMid} onChange={(e) => setSelMid(e.target.value)}>
//                 <option value="">— Select MID —</option>
//                 {midList.map((m) => <option key={m} value={m}>{m}</option>)}
//               </select>
//               <button className="ma-analyze-btn" onClick={runAnalysis}>Analyze</button>
//               {selMid && <span className="ma-mid-badge">MID: {selMid}</span>}
//             </div>
//           </>
//         )}
//       </div>
 
//       {/* ── Dashboard ── */}
//       {dash && (
//         <div className="ma-dashboard">
 
//           {/* ── Insight Generator ── */}
//           <SectionTitle>Insight & Comment Generator</SectionTitle>
//           <div className="ma-ig-wrap">
//             <p className="ma-ig-note">Fields marked <span className="ma-auto-tag">AUTO</span> are filled from your Excel data. Fields marked <span className="ma-manual-tag">MANUAL</span> need to be filled from BOSS panel / case notes.</p>
 
//             <div className="ma-ig-section-head">Merchant Profile (from BOSS Panel)</div>
//             <div className="ma-ig-grid">
//               {[
//                 ['mid','MID','manual',null],['bname','Business Name','manual',null],
//                 ['onboard','Onboarding Date','manual',null],['cat','Category','manual',null],
//                 ['subcat','Subcategory / MCC','manual',null],['mtype','Merchant Type','manual',null],
//                 ['signatory','Authorised Signatory','manual',null],['dob','DOB','manual',null],
//                 ['mobile','Mobile No','manual',null],['gstin','GSTIN','manual',null],
//                 ['pan','Business PAN','manual',null],
//               ].map(([k, lbl]) => (
//                 <div className="ma-ig-field" key={k}>
//                   <label>{lbl} <span className="ma-manual-tag">MANUAL</span></label>
//                   <input value={igManual[k] || ''} onChange={(e) => setIg(k, e.target.value)} />
//                 </div>
//               ))}
//               {[
//                 ['status','Account Status',['ACTIVE','INACTIVE','SUSPENDED','BLOCKED']],
//                 ['btype','Business Type',['INDIVIDUAL','PROPRIETORSHIP','PARTNERSHIP','PRIVATE LIMITED','PUBLIC LIMITED','LLP','TRUST','NGO']],
//                 ['risk','Risk Category',['LOW','MEDIUM','HIGH']],
//                 ['pmode','Primary Payment Mode',['UPI','CREDIT_CARD','DEBIT_CARD','ALL']],
//                 ['lea','UPI LEA Notice',['NA','YES']],
//                 ['fiu','FIU Alerts',['NA','YES']],
//                 ['prevStr','Previous STR',['NO','YES']],
//                 ['conclusion','Conclusion',['STR','MONITOR','CLOSE']],
//               ].map(([k, lbl, opts]) => (
//                 <div className="ma-ig-field" key={k}>
//                   <label>{lbl} <span className="ma-manual-tag">MANUAL</span></label>
//                   <select value={igManual[k]} onChange={(e) => setIg(k, e.target.value)}>
//                     {opts.map((o) => <option key={o} value={o}>{o}</option>)}
//                   </select>
//                 </div>
//               ))}
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Address <span className="ma-manual-tag">MANUAL</span></label>
//                 <input value={igManual.addr} onChange={(e) => setIg('addr', e.target.value)} />
//               </div>
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Alert Type <span className="ma-manual-tag">MANUAL</span></label>
//                 <input value={igManual.alert} onChange={(e) => setIg('alert', e.target.value)} />
//               </div>
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Settlement Bank &amp; Account Details <span className="ma-manual-tag">MANUAL</span></label>
//                 <input value={igManual.bank} onChange={(e) => setIg('bank', e.target.value)} />
//               </div>
//             </div>
 
//             <div className="ma-ig-section-head">Review Period <span className="ma-manual-tag">MANUAL</span></div>
//             <div className="ma-ig-grid">
//               <div className="ma-ig-field"><label>From Date</label><input type="date" value={igManual.from} onChange={(e) => setIg('from', e.target.value)} /></div>
//               <div className="ma-ig-field"><label>To Date</label><input type="date" value={igManual.to} onChange={(e) => setIg('to', e.target.value)} /></div>
//             </div>
 
//             <div className="ma-ig-section-head">Transaction Data <span className="ma-auto-tag">AUTO from Excel</span></div>
//             <div className="ma-ig-grid">
//               {[
//                 ['totalcr','Total Credits (₹ Lakh)'],['txncount','Total Transactions'],
//                 ['minpay','Min Single Payment (₹)'],['maxpay','Max Single Payment (₹)'],
//                 ['nightcnt','Night Txn Count (10PM–6AM)'],['nightamt','Night Txn Amount (₹ Lakh)'],
//                 ['roundcnt','Round Amount Txn Count'],['avgmonth','Avg Monthly Amount (₹ Lakh)'],
//               ].map(([k, lbl]) => (
//                 <div className="ma-ig-field" key={k}>
//                   <label>{lbl}</label>
//                   <input readOnly value={igAuto[k] || ''} className="ma-auto-input" />
//                 </div>
//               ))}
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Peak Months (auto-detected)</label>
//                 <input readOnly value={igAuto.peakmonths || ''} className="ma-auto-input" />
//               </div>
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Top Round-Sum Values</label>
//                 <textarea readOnly value={igAuto.roundvals || ''} className="ma-auto-input" rows={3} />
//               </div>
//               <div className="ma-ig-field ma-ig-full">
//                 <label>Suspicious VPAs (edit as needed)</label>
//                 <textarea value={igManual.vpas || igAuto.vpas || ''} onChange={(e) => setIg('vpas', e.target.value)} rows={2} />
//               </div>
//             </div>
 
//             <div className="ma-ig-section-head">Additional Observations <span className="ma-manual-tag">MANUAL</span></div>
//             <div className="ma-ig-field ma-ig-full">
//               <label>Additional remarks / observations (optional)</label>
//               <textarea value={igManual.remarks} onChange={(e) => setIg('remarks', e.target.value)} rows={3} />
//             </div>
 
//             <button className="ma-gen-btn" onClick={generateComment}>⚡ Generate Comment</button>
 
//             {igOutput && (
//               <div className="ma-output-wrap">
//                 <div className="ma-output-box">{igOutput}</div>
//                 <button className="ma-copy-btn" onClick={() => { navigator.clipboard.writeText(igOutput).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>
//                   {copied ? '✓ Copied!' : '⎘ Copy to Clipboard'}
//                 </button>
//               </div>
//             )}
//           </div>
 
//           {/* ── Overview ── */}
//           <SectionTitle>Overview — Acquiring Success Transactions</SectionTitle>
//           <div className="ma-stat-grid">
//             <StatCard label="Acquiring Success Txns" value={dash.as.length.toLocaleString()} color="highlight" />
//             <StatCard label="Total Amount" value={fmtN(dash.tot)} color="highlight" />
//             <StatCard label="Avg Amount" value={fmtN(dash.tot / (dash.as.length || 1))} />
//             <StatCard label="Round Amounts" value={`${dash.rnd.length} (${dash.as.length ? ((dash.rnd.length / dash.as.length) * 100).toFixed(1) : 0}%)`} color="amber" />
//           </div>
 
//           <SectionTitle>Settled Amount (Debit)</SectionTitle>
//           <div className="ma-stat-grid">
//             <StatCard label="Total Settled Amount (Debit)" value={fmtN(dash.totS)} color="green" />
//             <StatCard label="Settlement Txn Count" value={dash.stxns.length.toLocaleString()} color="green" />
//             <StatCard label="Unique UTR Count" value={dash.utrCount.toLocaleString()} color="teal" />
//           </div>
 
//           <SectionTitle>Night Transactions (10 PM – 6 AM)</SectionTitle>
//           <div className="ma-stat-grid">
//             <StatCard label="Night (10 PM – 6 AM)" value={dash.night.length.toLocaleString()} sub={'Total Amount: ' + fmtN(dash.na)} color="night" />
//             <StatCard label="Morning (6 AM – 12 PM)" value={dash.morning.length.toLocaleString()} />
//             <StatCard label="Afternoon/Evening (12–10 PM)" value={dash.aft.length.toLocaleString()} />
//           </div>
 
//           <SectionTitle>Payment Mode Summary</SectionTitle>
//           <div className="ma-three-col">
//             {[
//               { lbl: 'UPI Transactions', rows: dash.upi, cls: 'teal' },
//               { lbl: 'Credit Card Transactions', rows: dash.cc2, cls: 'highlight' },
//               { lbl: 'Debit Card Transactions', rows: dash.dc, cls: 'amber' },
//             ].map(({ lbl, rows, cls }) => (
//               <StatCard key={lbl} label={lbl} value={rows.length.toLocaleString()} sub={fmtN(rows.reduce((s, r) => s + gAmt(r, colMap), 0))} color={cls} />
//             ))}
//           </div>
 
//           <SectionTitle>UPI & Payment Mode Analysis</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">Payment Mode Distribution</div>
//             <ModeChart modeMap={dash.mm} />
//           </div>
 
//           <SectionTitle>Monthly Trend (Acquiring Success)</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">Month-wise Transaction Amount</div>
//             <MonthChart months={dash.months} mmap={dash.mmap} />
//           </div>
//           <div className="ma-panel" style={{ marginTop: 16 }}>
//             <div className="ma-panel-title">Month-wise Summary <span className="ma-count-badge">{dash.months.length} months</span></div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr>
//                   {[['month','Month'],['total','Total Amount'],['count','Count'],['avg','Avg Amount']].map(([k, lbl]) => (
//                     <th key={k} className="sortable" onClick={() => toggleSort(setMSort, k)}>{lbl} {arrow(mSort, k)}</th>
//                   ))}
//                 </tr></thead>
//                 <tbody>
//                   {sortedMonths.map((m) => (
//                     <tr key={m}>
//                       <td style={{ fontWeight: 500 }}>{m}</td>
//                       <td>{fmtN(dash.mmap[m].amount)}</td>
//                       <td>{dash.mmap[m].count.toLocaleString()}</td>
//                       <td>{fmtN(dash.mmap[m].amount / (dash.mmap[m].count || 1))}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
 
//           {/* ── Failed ── */}
//           <SectionTitle>Failed Transactions</SectionTitle>
//           <div className="ma-stat-grid">
//             <StatCard label="Failed Transactions" value={dash.fail.length.toLocaleString()} color="red" />
//             <StatCard label="Failed Amount" value={fmtN(dash.fail.reduce((s, r) => s + gAmt(r, colMap), 0))} color="red" />
//           </div>
//           <div className="ma-panel" style={{ marginTop: 16 }}>
//             <div className="ma-panel-title">Failed Transaction List <span className="ma-count-badge">{dash.fail.length} rows</span></div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr><th>Date</th><th>Amount</th><th>Payment Mode</th><th>Status</th><th>Customer VPA</th></tr></thead>
//                 <tbody>
//                   {dash.fail.slice(0, 200).map((r, i) => (
//                     <tr key={i}>
//                       <td>{fmtD(r, colMap)}</td><td>{fmtN(gAmt(r, colMap))}</td>
//                       <td><span className="ma-badge ma-badge-mode">{gv(r, colMap, 'paymentmode') || '—'}</span></td>
//                       <td><span className="ma-badge ma-badge-fail">{gv(r, colMap, 'status') || '—'}</span></td>
//                       <td>{gv(r, colMap, 'customervpa') || '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <p className="ma-note">Up to 200 rows.</p>
//           </div>
 
//           {/* ── Credit Card ── */}
//           <SectionTitle>Credit Card Details</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">Credit Card Transactions <span className="ma-count-badge">{filteredCC.length} shown / {dash.cc.length} total</span></div>
//             <div className="ma-filter-bar">
//               <label>From:</label><input type="date" value={ccFilter.from} onChange={(e) => setCcFilter((p) => ({ ...p, from: e.target.value }))} />
//               <label>To:</label><input type="date" value={ccFilter.to} onChange={(e) => setCcFilter((p) => ({ ...p, to: e.target.value }))} />
//               <label>Min ₹:</label><input type="number" style={{ width: 90 }} value={ccFilter.min} onChange={(e) => setCcFilter((p) => ({ ...p, min: e.target.value }))} />
//               <label>Max ₹:</label><input type="number" style={{ width: 100 }} value={ccFilter.max} onChange={(e) => setCcFilter((p) => ({ ...p, max: e.target.value }))} />
//               <button className="ma-filter-btn ma-reset" onClick={() => setCcFilter({ from:'',to:'',min:'',max:'' })}>Reset</button>
//             </div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr>
//                   {[['date','Date'],['amount','Amount']].map(([k, lbl]) => (
//                     <th key={k} className="sortable" onClick={() => toggleSort(setCcSort, k)}>{lbl} {arrow(ccSort, k)}</th>
//                   ))}
//                   <th>Last-4</th><th>Issuing Bank</th><th>Customer</th>
//                 </tr></thead>
//                 <tbody>
//                   {filteredCC.map((r, i) => {
//                     const l4 = gv(r, colMap, 'creditdebitcardlast4digits') || gv(r, colMap, 'cardlast4') || '—';
//                     return (
//                       <tr key={i}>
//                         <td>{fmtD(r, colMap)}</td><td>{fmtN(gAmt(r, colMap))}</td>
//                         <td>{l4}</td><td>{gv(r, colMap, 'issuingbank') || '—'}</td>
//                         <td>{gv(r, colMap, 'customername') || gv(r, colMap, 'merchantname') || '—'}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
 
//           {/* ── Round Amount ── */}
//           <SectionTitle>Round Amount Analysis</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">Top Round Amount Values <span className="ma-count-badge">{sortedRound.length} values</span></div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr>
//                   {[['amt','Amount'],['cnt','Count'],['val','Value (Amt×Count)']].map(([k, lbl]) => (
//                     <th key={k} className="sortable" onClick={() => toggleSort(setRndSort, k)}>{lbl} {arrow(rndSort, k)}</th>
//                   ))}
//                 </tr></thead>
//                 <tbody>
//                   {sortedRound.map((x, i) => (
//                     <tr key={i}><td style={{ fontWeight: 500 }}>{x.amt.toLocaleString('en-IN')}</td><td>{x.cnt}</td><td>{fmtN(x.amt * x.cnt)}</td></tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
 
//           {/* ── Night table ── */}
//           <SectionTitle>Time-Based Transaction Detail</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">Night Transactions (10 PM – 6 AM) <span className="ma-count-badge">{filteredNt.length} shown / {dash.night.length} total</span></div>
//             <div className="ma-filter-bar">
//               <label>Mode:</label>
//               <select value={ntFilter.mode} onChange={(e) => setNtFilter((p) => ({ ...p, mode: e.target.value }))}>
//                 <option value="">All</option>
//                 {ntModes.map((m) => <option key={m} value={m}>{m}</option>)}
//               </select>
//               <label>From:</label><input type="date" value={ntFilter.from} onChange={(e) => setNtFilter((p) => ({ ...p, from: e.target.value }))} />
//               <label>To:</label><input type="date" value={ntFilter.to} onChange={(e) => setNtFilter((p) => ({ ...p, to: e.target.value }))} />
//               <label>Min ₹:</label><input type="number" style={{ width: 90 }} value={ntFilter.min} onChange={(e) => setNtFilter((p) => ({ ...p, min: e.target.value }))} />
//               <button className="ma-filter-btn ma-reset" onClick={() => setNtFilter({ mode:'',from:'',to:'',min:'',max:'' })}>Reset</button>
//             </div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr>
//                   {[['date','Date'],['amount','Amount']].map(([k,lbl]) => (
//                     <th key={k} className="sortable" onClick={() => toggleSort(setNtSort, k)}>{lbl} {arrow(ntSort, k)}</th>
//                   ))}
//                   <th>Payment Mode</th><th>Last-4</th><th>Customer VPA</th>
//                 </tr></thead>
//                 <tbody>
//                   {filteredNt.map((r, i) => {
//                     const l4 = gv(r, colMap, 'creditdebitcardlast4digits') || gv(r, colMap, 'cardlast4') || '—';
//                     return (
//                       <tr key={i}>
//                         <td>{fmtD(r, colMap)}</td>
//                         <td className="ma-night-amount">{fmtN(gAmt(r, colMap))}</td>
//                         <td><span className="ma-badge ma-badge-mode">{gv(r, colMap, 'paymentmode') || '—'}</span></td>
//                         <td>{l4}</td><td>{gv(r, colMap, 'customervpa') || '—'}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
 
//           {[
//             { title: 'Morning Transactions (6 AM – 12 PM)', rows: dash.morning },
//             { title: 'Afternoon / Evening (12 PM – 10 PM)', rows: dash.aft },
//           ].map(({ title, rows }) => (
//             <div className="ma-panel" style={{ marginTop: 16 }} key={title}>
//               <div className="ma-panel-title">{title} <span className="ma-count-badge">{rows.length} rows</span></div>
//               <div className="ma-tbl-wrap">
//                 <table>
//                   <thead><tr><th>Date</th><th>Amount</th><th>Payment Mode</th><th>Last-4</th><th>Customer VPA</th></tr></thead>
//                   <tbody>
//                     {rows.slice(0, 200).map((r, i) => {
//                       const l4 = gv(r, colMap, 'creditdebitcardlast4digits') || gv(r, colMap, 'cardlast4') || '—';
//                       return (
//                         <tr key={i}>
//                           <td>{fmtD(r, colMap)}</td><td>{fmtN(gAmt(r, colMap))}</td>
//                           <td><span className="ma-badge ma-badge-mode">{gv(r, colMap, 'paymentmode') || '—'}</span></td>
//                           <td>{l4}</td><td>{gv(r, colMap, 'customervpa') || '—'}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ))}
 
//           {/* ── All transactions ── */}
//           <SectionTitle>All Acquiring Success Transactions</SectionTitle>
//           <div className="ma-panel">
//             <div className="ma-panel-title">All Transactions <span className="ma-count-badge">{filteredAll.length} shown / {dash.as.length} total</span></div>
//             <div className="ma-filter-bar">
//               <label>Mode:</label>
//               <select value={allFilter.mode} onChange={(e) => setAllFilter((p) => ({ ...p, mode: e.target.value }))}>
//                 <option value="">All</option>
//                 {allModes.map((m) => <option key={m} value={m}>{m}</option>)}
//               </select>
//               <label>From:</label><input type="date" value={allFilter.from} onChange={(e) => setAllFilter((p) => ({ ...p, from: e.target.value }))} />
//               <label>To:</label><input type="date" value={allFilter.to} onChange={(e) => setAllFilter((p) => ({ ...p, to: e.target.value }))} />
//               <label>Min ₹:</label><input type="number" style={{ width: 90 }} value={allFilter.min} onChange={(e) => setAllFilter((p) => ({ ...p, min: e.target.value }))} />
//               <label>Max ₹:</label><input type="number" style={{ width: 100 }} value={allFilter.max} onChange={(e) => setAllFilter((p) => ({ ...p, max: e.target.value }))} />
//               <button className="ma-filter-btn ma-reset" onClick={() => setAllFilter({ mode:'',from:'',to:'',min:'',max:'' })}>Reset</button>
//             </div>
//             <div className="ma-tbl-wrap">
//               <table>
//                 <thead><tr>
//                   {[['date','Date'],['amount','Amount'],['settled','Settled Amt']].map(([k,lbl]) => (
//                     <th key={k} className="sortable" onClick={() => toggleSort(setAllSort, k)}>{lbl} {arrow(allSort, k)}</th>
//                   ))}
//                   <th>Payment Mode</th><th>Customer VPA</th><th>Last-4</th><th>Risk Category</th>
//                 </tr></thead>
//                 <tbody>
//                   {filteredAll.map((r, i) => {
//                     const l4  = gv(r, colMap, 'creditdebitcardlast4digits') || gv(r, colMap, 'cardlast4') || '—';
//                     const s   = gSettled(r, colMap);
//                     const risk= gv(r, colMap, 'riskcategory') || gv(r, colMap, 'Risk_category') || '—';
//                     return (
//                       <tr key={i}>
//                         <td>{fmtD(r, colMap)}</td>
//                         <td style={{ fontWeight: 500 }}>{fmtN(gAmt(r, colMap))}</td>
//                         <td>{s ? fmtN(s) : '—'}</td>
//                         <td><span className="ma-badge ma-badge-mode">{gv(r, colMap, 'paymentmode') || '—'}</span></td>
//                         <td>{gv(r, colMap, 'customervpa') || '—'}</td>
//                         <td>{l4}</td>
//                         <td>{risk !== '—' ? <span className="ma-badge ma-badge-success">{risk}</span> : '—'}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//             <p className="ma-note">Click column headers to sort. Large amount at odd hours + repeated last-4/VPA can be suspicious.</p>
//           </div>
 
//         </div>
//       )}
//     </div>
//   );
// }






// import React, { useState, useMemo, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
// import { Doughnut, Line } from 'react-chartjs-2';

// // Register ChartJS components
// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

// const MerchantAnalyzer = () => {
//   const [allRows, setAllRows] = useState([]);
//   const [selectedMid, setSelectedMid] = useState('');
//   const [analyzedData, setAnalyzedData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [manualFields, setManualFields] = useState({
//     mid: '', bname: '', status: 'ACTIVE', onboard: '', cat: '', subcat: '', 
//     btype: 'INDIVIDUAL', mtype: '', risk: 'LOW', pmode: 'UPI', signatory: '',
//     dob: '', mobile: '', gstin: 'NA', pan: '', lea: 'NA', fiu: 'NA', str: 'NO',
//     addr: '', alert: '', bank: '', from: '', to: '', remarks: '', conclusion: 'STR'
//   });
//   const [generatedComment, setGeneratedComment] = useState('');

//   // Helper: Normalize Column Names
//   const getVal = (row, key) => {
//     const normalizedKey = key.toLowerCase().replace(/[\s_\-/]+/g, '');
//     const actualKey = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_\-/]+/g, '') === normalizedKey);
//     return actualKey ? row[actualKey] : '';
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setIsLoading(true);
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const bstr = evt.target.result;
//       const wb = XLSX.read(bstr, { type: 'binary' });
//       const wsname = wb.SheetNames[0];
//       const ws = wb.Sheets[wsname];
//       const data = XLSX.utils.sheet_to_json(ws);
//       setAllRows(data);
//       setIsLoading(false);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const uniqueMids = useMemo(() => {
//     const mids = new Set();
//     allRows.forEach(r => {
//       const m = String(getVal(r, 'mid') || '').trim();
//       if (m) mids.add(m);
//     });
//     return Array.from(mids).sort();
//   }, [allRows]);

//   const runAnalysis = () => {
//     if (!selectedMid) return;
//     setIsLoading(true);
    
//     // Filter rows for MID and Success
//     const midRows = allRows.filter(r => String(getVal(r, 'mid')).trim() === selectedMid);
//     const successRows = midRows.filter(r => 
//       String(getVal(r, 'transactiontype')).toUpperCase() === 'ACQUIRING' && 
//       String(getVal(r, 'status')).toUpperCase() === 'SUCCESS'
//     );

//     // Calculate Metrics
//     const totalAmt = successRows.reduce((sum, r) => sum + parseFloat(String(getVal(r, 'amount')).replace(/,/g, '') || 0), 0);
//     const nightRows = successRows.filter(r => {
//         const d = new Date(getVal(r, 'transactiondate'));
//         const h = d.getHours();
//         return h >= 22 || h < 6;
//     });

//     setAnalyzedData({
//       successRows,
//       totalAmt,
//       nightCount: nightRows.length,
//       nightAmt: nightRows.reduce((sum, r) => sum + parseFloat(String(getVal(r, 'amount')).replace(/,/g, '') || 0), 0),
//     });
//     setIsLoading(false);
//   };

//   const generateComment = () => {
//     // Logic to combine manualFields + analyzedData into a string
//     const comment = `MID: ${manualFields.mid}\nBusiness: ${manualFields.bname}\nTotal Credits: ${(analyzedData?.totalAmt / 100000).toFixed(2)} L...`;
//     setGeneratedComment(comment);
//   };

//   return (
//     <div className="merchant-analyzer-page" style={{ padding: '20px', background: '#f5f4f0' }}>
//       {isLoading && <div className="loader">Processing...</div>}
      
//       <div className="upload-section" style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '2px dashed #ccc' }}>
//         <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
//         <p>Unique MIDs Found: {uniqueMids.length}</p>
        
//         {uniqueMids.length > 0 && (
//           <div style={{ marginTop: '15px' }}>
//             <select value={selectedMid} onChange={(e) => setSelectedMid(e.target.value)} style={{ padding: '10px', marginRight: '10px' }}>
//               <option value="">Select MID</option>
//               {uniqueMids.map(m => <option key={m} value={m}>{m}</option>)}
//             </select>
//             <button onClick={runAnalysis} className="btn-primary">Analyze</button>
//           </div>
//         )}
//       </div>

//       {analyzedData && (
//         <div className="dashboard-results" style={{ marginTop: '30px' }}>
//           <h2>Analysis for {selectedMid}</h2>
//           <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
//              <div className="card">Total Success: {analyzedData.successRows.length}</div>
//              <div className="card">Total Amount: ₹{(analyzedData.totalAmt / 100000).toFixed(2)} L</div>
//              <div className="card">Night Txns: {analyzedData.nightCount}</div>
//           </div>

//           <div className="insight-generator" style={{ marginTop: '40px', background: '#fff', padding: '20px' }}>
//             <h3>Comment Generator</h3>
//             <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//                 <input placeholder="Business Name" onChange={e => setManualFields({...manualFields, bname: e.target.value})} />
//                 <input placeholder="Onboarding Date" onChange={e => setManualFields({...manualFields, onboard: e.target.value})} />
//                 {/* Add other inputs similarly */}
//             </div>
//             <button onClick={generateComment} style={{ marginTop: '20px' }}>Generate STR Comment</button>
//             {generatedComment && (
//                 <textarea value={generatedComment} readOnly style={{ width: '100%', height: '200px', marginTop: '15px' }} />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


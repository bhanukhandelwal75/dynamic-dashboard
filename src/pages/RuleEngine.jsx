import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ─── helpers ─────────────────────────────────────────────────────────────────
const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtD(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d} ${MN[parseInt(m) - 1]} ${String(y).slice(2)}`;
}

function findCol(headers, candidates) {
  for (const c of candidates)
    for (const h of headers)
      if (h.trim() === c.trim()) return h;
  const cl = s => String(s || '').toLowerCase().replace(/[\s_\-]+/g, '');
  for (const c of candidates)
    for (const h of headers)
      if (cl(h) === cl(c)) return h;
  return null;
}

function parseFile(file, cb) {
  const r = new FileReader();
  r.onload = e => {
    const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '', header: 1 });
    if (!raw || raw.length < 2) { cb([], []); return; }
    let hIdx = 0;
    for (let i = 0; i < Math.min(5, raw.length); i++) {
      if (raw[i].some(c => String(c || '').trim())) { hIdx = i; break; }
    }
    const headers = raw[hIdx].map(h => String(h || '').trim());
    const rows = [];
    for (let i = hIdx + 1; i < raw.length; i++) {
      const row = {}; let hasData = false;
      raw[i].forEach((v, j) => {
        if (headers[j]) { row[headers[j]] = String(v || '').trim(); if (v !== '') hasData = true; }
      });
      if (hasData) rows.push(row);
    }
    cb(rows, headers);
  };
  r.readAsArrayBuffer(file);
}

// ─── Rule configs ─────────────────────────────────────────────────────────────
const JUC_MID = ['MID','mid','Mid','merchant_id','merchantid'];
const JUC_KYB = ['KYBID','kyb_id','KYB_ID','kybid','kyb','KYB','Kybid'];
const AMT_COMMON = ['total_gmv','totalgmv','gmv','GMV','total_amount','last_month_gmv','lastmonthgmv','total_gmv_last_week','totalgmvlastweek','SUM_AMT','sum_amt','sumamt'];
const MID_COMMON = ['mid','MID','Mid','merchant_id','merchantid'];

const ONLINE_RULES = {
  r1:  { label:'Same customer perform 3 or more Transaction on Same Merchant on the same day using UPI and Credit Card', freq:'Daily',   badge:'amber',   mid_cols:MID_COMMON, amt_cols:['total_card_txn_amount','total_txn_amount',...AMT_COMMON], amt_zero:false },
  r2:  { label:'Late Night or Odd Time High Value of Transaction',                                                        freq:'Daily',   badge:'red',     mid_cols:MID_COMMON, amt_cols:['night_gmv','nightgmv','night_amount',...AMT_COMMON], amt_zero:false },
  r3:  { label:'Late Night or Odd Time High Quantum of Transaction',                                                      freq:'Daily',   badge:'blue',    mid_cols:MID_COMMON, amt_cols:['night_gmv','nightgmv',...AMT_COMMON], amt_zero:false },
  r4:  { label:'Fraud',                                                                                                   freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['fraud_gmv','fraudgmv',...AMT_COMMON], amt_zero:false },
  r5:  { label:'High value transactions in accounts opened and closed in a short duration',                               freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r6:  { label:'High value or concentration of funds received from international payment mode',                           freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['international_gmv','internationalgmv','intl_gmv',...AMT_COMMON], amt_zero:false },
  r7:  { label:'High volume transactions in accounts opened and closed in a short duration',                              freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r8:  { label:'Merchant transactions with concentrated customers (9)',                                                   freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
  r9:  { label:'Merchant_Login_From_Foreign_Locations',                                                                  freq:'Monthly', badge:'green',   mid_cols:['merchantid','merchant_id',...MID_COMMON], amt_cols:AMT_COMMON, amt_zero:true },
  r10: { label:'Merchant_UMP_Login_70_percent_times_from_Foreign_Locations',                                             freq:'Monthly', badge:'green',   mid_cols:['merchantid','merchant_id',...MID_COMMON], amt_cols:AMT_COMMON, amt_zero:true },
  r11: { label:'Refund to a particular customer (8)',                                                                     freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['total_merchant_gmv','merchant_gmv',...AMT_COMMON], amt_zero:false },
  r12: { label:'Repeated_authorization failures at merchant (11)',                                                        freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r13: { label:'RFL_18 — Weekly Rule A',                                                                                 freq:'Weekly',  badge:'orange',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r14: { label:'RFL_18 — Weekly Rule B',                                                                                 freq:'Weekly',  badge:'orange',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r15: { label:'RFL_36 — Weekly Rule',                                                                                   freq:'Weekly',  badge:'orange',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r16: { label:'RFI_11 Account Activity not consistent with profile or line of business',                                freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['total_merchant_gmv',...AMT_COMMON], amt_zero:false },
  r17: { label:'RFI_18 High concentration and volume of payments of same value or multiples',                            freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r18: { label:'RFI_18 High concentration and volume of payments (Percentage deviation)',                                freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r19: { label:'RFI_30 High value or volume of transactions in high risk lines of business',                             freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r20: { label:'RFI_36 High volumes or value relating to merchants in high risk locations',                              freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r21: { label:'Sudden_increase',                                                                                        freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r22: { label:'Transactions from or to high risk countries being routed through PA or PG',                              freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['txn_amount','txnamount',...AMT_COMMON], amt_zero:false },
  r23: { label:'Unusual_refund pattern',                                                                                 freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:['total_merchant_gmv',...AMT_COMMON], amt_zero:false },
  r24: { label:'Wildlife Trafficking Rule',                                                                              freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  r25: { label:'Frequent_Changes_in_Merchant_Bank_Account_Number',                                                      freq:'Monthly', badge:'purple',  mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
};

const OFFLINE_RULES = {
  o1:  { label:'Sudden high value single transaction for a Merchant',                                                    mid_cols:MID_COMMON, amt_cols:['txn_amount','txnamount',...AMT_COMMON], amt_zero:false },
  o2:  { label:'Account Activity not consistent with profile or line of business',                                       mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o3:  { label:'Transaction patterns suggest loan or crowdfunding activities',                                           mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o4:  { label:'High Risk Instrument concentration',                                                                     mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o5:  { label:'High value or concentration from International payment instruments',                                     mid_cols:MID_COMMON, amt_cols:['international_gmv','intl_gmv','txn_amount',...AMT_COMMON], amt_zero:false },
  o6:  { label:'Offline 9 — Alerts raised by other agents / subsidiaries / authorities',                                 mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o7:  { label:'Complaint Received From LEA/Cyber Cell',                                                                 mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o8:  { label:'YBL New Manual Rule — Newly incorporated company with high value transactions',                          mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o9:  { label:'YBL New Manual Rule — Large value of transactions from a single customer (Monthly)',                     mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o10: { label:'YBL New Manual Rule — Large volume of transactions from a single customer (Monthly)',                    mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o11: { label:'High value transactions in accounts opened and closed in a short duration',                              mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o12: { label:'High volume transactions in accounts opened and closed in a short duration',                             mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o13: { label:'Transactions from or to high risk countries through PA or PG',                                           mid_cols:MID_COMMON, amt_cols:['txn_amount','txnamount','international_gmv',...AMT_COMMON], amt_zero:false },
  o14: { label:'Unusual refund patterns',                                                                                mid_cols:MID_COMMON, amt_cols:['total_merchant_gmv',...AMT_COMMON], amt_zero:false },
  o15: { label:'Offline 8 — Complaint from public with AML implications',                                               mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o16: { label:'HIGH FRAUD TO SALES RATIO',                                                                             mid_cols:MID_COMMON, amt_cols:['fraud_gmv','fraudgmv',...AMT_COMMON], amt_zero:false },
  o17: { label:'Sudden increase in value of cumulative transactions for a Merchant',                                     mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o18: { label:'Unusual refund by merchant to a particular customer',                                                    mid_cols:MID_COMMON, amt_cols:['total_merchant_gmv',...AMT_COMMON], amt_zero:false },
  o19: { label:'Merchant location access by foreign location and no login from India',                                   mid_cols:['merchantid','merchant_id',...MID_COMMON], amt_cols:AMT_COMMON, amt_zero:true },
  o20: { label:'Logins account access from foreign states or using VPNs',                                               mid_cols:['merchantid','merchant_id',...MID_COMMON], amt_cols:AMT_COMMON, amt_zero:true },
  o21: { label:'Repeated authorization failures at merchant',                                                            mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o22: { label:'High-amount transactions by merchants under wildlife-related categories',                                 mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o23: { label:'Frequent Changes in Merchant Bank Account Number',                                                      mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
  o24: { label:'Change in Merchant Business Address more than N times in a month',                                      mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
  o25: { label:'High value donations from abroad to charitable merchant / NPO',                                          mid_cols:MID_COMMON, amt_cols:['international_gmv',...AMT_COMMON], amt_zero:false },
  o26: { label:'RFI-51 — Funds from instruments where frauds have been reported',                                       mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o27: { label:'Offline-1 — Alerts relating to Third Party Settlements',                                                mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o28: { label:'Offline-19 — Multiple accounts by individual under various heads in single branch',                      mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o29: { label:'Offline-28 — Business registered office common with many other entities',                               mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
  o30: { label:'Offline-20 — Customer/merchant providing different details to avoid linkage',                            mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:true },
  o31: { label:'RFI 18 — High concentration and volume of payments of same value (Manual)',                              mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o32: { label:'High Value and Volume of transactions for a Merchant with KYB Issue',                                   mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o33: { label:'YBL New Manual Rule — High value in high risk lines of business MCC codes',                             mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
  o34: { label:'YBL New Manual Rule — Sudden activity in a dormant account',                                            mid_cols:MID_COMMON, amt_cols:AMT_COMMON, amt_zero:false },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function FreqBadge({ freq }) {
  const map = { Daily: 're-freq-d', Monthly: 're-freq-m', Weekly: 're-freq-w' };
  return <span className={`re-freq ${map[freq] || 're-freq-m'}`}>{freq}</span>;
}

function UploadZone({ label, sub, fileLabel, onChange }) {
  return (
    <div className="re-card">
      <div className="re-lbl">{label}</div>
      <label className="re-upload-zone">
        <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={onChange} />
        <div className="re-up-icon">📂</div>
        <div className="re-up-txt" dangerouslySetInnerHTML={{ __html: fileLabel || `Upload CSV or Excel file${sub ? '<br><small style="color:#bbb">' + sub + '</small>' : ''}` }} />
      </label>
    </div>
  );
}

function StatGrid({ tot, flg, mat, nky }) {
  return (
    <div className="re-sg">
      {[['Total Unique MIDs', tot], ['Output Records', flg], ['KYB ID Matched', mat], ['KYB Not Found', nky]].map(([l, v]) => (
        <div key={l} className="re-stat"><div className="re-sn">{v}</div><div className="re-sl">{l}</div></div>
      ))}
    </div>
  );
}

function ResultTable({ rows, badge, bodyId }) {
  if (!rows.length) return <div className="re-empty">No records found. Check debug info above.</div>;
  return (
    <div className="re-tbl-scr">
      <table className="re-table">
        <thead>
          <tr>
            <th>S. No</th><th>Customer ID</th><th>Account No.</th>
            <th>Rule Name</th><th>Period</th><th>Total Amount</th>
            <th>Event Score</th><th>Comments</th><th>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const noKyb = !row.customer_id;
            return (
              <tr key={row.sno} style={noKyb ? { background: '#fef2f2' } : {}}>
                <td style={{ color: '#aaa', fontSize: 12 }}>{row.sno}</td>
                <td>{noKyb
                  ? <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: 11 }}>⚠️ KYB Not Found</span>
                  : <span className="re-kok">{row.customer_id}</span>}
                </td>
                <td><span className="re-mono" style={noKyb ? { color: '#b91c1c', fontWeight: 700 } : {}}>{row.account_no}</span></td>
                <td><span className={`re-badge re-badge-${badge}`}>{row.rule_name}</span></td>
                <td><span className="re-per">{row.period}</span></td>
                <td><span className="re-amt">{row.total_amount === '0.00' ? '—' : '₹' + parseFloat(row.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                <td style={{ color: '#ccc' }}>—</td>
                <td style={{ color: '#ccc' }}>—</td>
                <td style={{ color: '#ccc' }}>—</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DebugPanel({ info }) {
  if (!info) return null;
  return (
    <div className="re-dbg">
      <div className="re-dbg-title">🔍 Debug Info</div>
      {info.map(([k, v, cls]) => (
        <div key={k} className="re-dbg-row">
          <span className="re-dbg-k">{k}</span>
          <span className={`re-dbg-v${cls ? ' ' + cls : ''}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Download CSV ─────────────────────────────────────────────────────────────
function downloadCsv(rows, ruleName) {
  const hdr = ['S. No','Customer ID','Account No.','Rule Name','Period','Total Amount','Event Score','Comments','Assignee'];
  const lines = [hdr.join(','), ...rows.map(r =>
    [r.sno, `"${r.customer_id || ''}"`, `"${r.account_no}"`, `"${r.rule_name}"`, `"${r.period}"`, r.total_amount, '', '', ''].join(',')
  )];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const d = new Date();
  const dt = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  a.download = `${ruleName.replace(/[^a-zA-Z0-9]/g,'_').slice(0,60)}_${dt}.csv`;
  a.click();
}

// ─── Process engine ───────────────────────────────────────────────────────────
function processRows(rows, headers, kybMap, rule, periodStr) {
  const midCol = findCol(headers, rule.mid_cols);
  if (!midCol) return { error: `MID column not found.\nExpected: ${rule.mid_cols.slice(0,3).join(', ')}\nFound: ${headers.join(', ')}` };

  let amtCol = '', amtForcedZero = false;
  if (!rule.amt_zero) {
    amtCol = findCol(headers, rule.amt_cols);
    if (!amtCol) amtForcedZero = true;
  }

  const midSet = new Set(); const midAmt = {};
  for (const r of rows) {
    const m = String(r[midCol] || '').trim(); if (!m) continue;
    midSet.add(m);
    if (!rule.amt_zero && amtCol && !amtForcedZero) {
      const a = parseFloat(String(r[amtCol] || '0').replace(/[,\s]/g, '')) || 0;
      midAmt[m] = (midAmt[m] || 0) + a;
    }
  }
  const allMids = [...midSet];
  const finalRows = allMids.map((mid, i) => ({
    sno: i + 1,
    customer_id: kybMap.get(mid) || '',
    account_no: mid,
    rule_name: rule.label,
    period: periodStr,
    total_amount: (rule.amt_zero || amtForcedZero) ? '0.00' : (midAmt[mid] || 0).toFixed(2),
  }));

  return { finalRows, midCol, amtCol, amtForcedZero, allMids };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONLINE SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function OnlineSection() {
  const [ruleKey, setRuleKey] = useState('');
  const [f1, setF1] = useState(null); const [h1, setH1] = useState([]);
  const [f2, setF2] = useState(null); const [h2, setH2] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [lbl1, setLbl1] = useState(null);
  const [lbl2, setLbl2] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError]   = useState('');
  const [debug, setDebug]   = useState(null);
  const [result, setResult] = useState(null);

  const rule = ONLINE_RULES[ruleKey];
  const canRun = !!(f1?.length && f2?.length && dateFrom && dateTo && ruleKey);

  const run = () => {
    setError(''); setProcessing(true);
    setTimeout(() => {
      const midCol2 = findCol(h2, JUC_MID);
      const kybCol2 = findCol(h2, JUC_KYB);
      if (!midCol2) { setError(`MID column not found in Jucata dump.\nFound: ${h2.join(', ')}`); setProcessing(false); return; }
      if (!kybCol2) { setError(`KYBID column not found in Jucata dump.\nFound: ${h2.join(', ')}`); setProcessing(false); return; }

      const kybMap = new Map();
      for (const r of f2) { const m = String(r[midCol2]||'').trim(); const k = String(r[kybCol2]||'').trim(); if(m) kybMap.set(m,k); }

      const periodStr = `${fmtD(dateFrom)} - ${fmtD(dateTo)}`;
      const res = processRows(f1, h1, kybMap, rule, periodStr);
      if (res.error) { setError(res.error); setProcessing(false); return; }

      const { finalRows, midCol, amtCol, amtForcedZero, allMids } = res;
      const matched = finalRows.filter(r => r.customer_id).length;
      const unmatched = finalRows.filter(r => !r.customer_id).map(r => r.account_no);

      setDebug([
        ['Sheet 1 — All columns', h1.join(' | ')],
        ['Sheet 1 — MID column used', midCol],
        ['Sheet 1 — Amount column used', rule.amt_zero ? 'N/A (zero)' : amtForcedZero ? 'Not found — set to 0' : amtCol],
        ['Sheet 1 — Total rows', f1.length + ' rows'],
        ['Sheet 1 — Unique MIDs found', allMids.length + ' unique MIDs', 'ok'],
        ['Sheet 1 — First 5 MIDs', allMids.slice(0,5).join('  |  ')],
        ['Sheet 2 — MID column used', midCol2],
        ['Sheet 2 — KYBID column used', kybCol2],
        ['Sheet 2 — Total entries', [...kybMap.keys()].length + ' entries'],
        ['KYB Match', `${matched}/${allMids.length} matched${unmatched.length ? ' — ' + unmatched.length + ' not found' : ''}${unmatched.length ? '\nUnmatched: ' + unmatched.join(', ') : ''}`, matched === allMids.length ? 'ok' : 'bad'],
      ]);
      setResult({ finalRows, matched, notFound: allMids.length - matched, total: allMids.length });
      setProcessing(false);
    }, 120);
  };

  return (
    <div>
      <div className="re-g2">
        {/* Rule selector */}
        <div className="re-card re-full">
          <div className="re-lbl">Choose the Rule</div>
          <select className="re-select" value={ruleKey} onChange={e => setRuleKey(e.target.value)}>
            <option value="">— Choose the Rule —</option>
            <optgroup label="── DAILY RULES ──">
              {['r1','r2','r3'].map(k => <option key={k} value={k}>{ONLINE_RULES[k].label}</option>)}
            </optgroup>
            <optgroup label="── MONTHLY RULES ──">
              {['r4','r5','r6','r7','r8','r9','r10','r11','r12','r16','r17','r18','r19','r20','r21','r22','r23','r24','r25'].map(k => <option key={k} value={k}>{ONLINE_RULES[k].label}</option>)}
            </optgroup>
            <optgroup label="── WEEKLY RULES ──">
              {['r13','r14','r15'].map(k => <option key={k} value={k}>{ONLINE_RULES[k].label}</option>)}
            </optgroup>
          </select>
          {rule && (
            <div className="re-hint">
              <FreqBadge freq={rule.freq} />
              &nbsp; <b>MID column:</b> {rule.mid_cols.slice(0,3).join(' / ')}
              &nbsp;|&nbsp; <b>Amount:</b> {rule.amt_zero ? 'Zero (not required)' : rule.amt_cols.slice(0,3).join(' / ')}
            </div>
          )}
        </div>

        {/* File uploads */}
        <UploadZone label="Sheet 1 — Transaction Data" fileLabel={lbl1}
          onChange={e => { const f=e.target.files[0]; if(!f) return; setLbl1(`✅ <b>${f.name}</b><br><small style="color:#888">${Math.round(f.size/1024)} KB</small>`); parseFile(f,(r,h)=>{setF1(r);setH1(h);}); }} />
        <UploadZone label="Sheet 2 — Jucata Dump" sub="Columns: MID, KYBID" fileLabel={lbl2}
          onChange={e => { const f=e.target.files[0]; if(!f) return; setLbl2(`✅ <b>${f.name}</b><br><small style="color:#888">${Math.round(f.size/1024)} KB</small>`); parseFile(f,(r,h)=>{setF2(r);setH2(h);}); }} />

        {/* Date range */}
        <div className="re-card re-full">
          <div className="re-lbl">Period (display only)</div>
          <div className="re-dr">
            <div><label className="re-date-lbl">From Date</label><input type="date" className="re-date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div><label className="re-date-lbl">To Date</label><input type="date" className="re-date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
          </div>
          {(dateFrom || dateTo) && <div className="re-pp">📅 {fmtD(dateFrom) || '?'} – {fmtD(dateTo) || '?'}</div>}
        </div>
      </div>

      <button className="re-run" disabled={!canRun || processing} onClick={run}>
        {processing ? '⏳  Processing...' : canRun ? '⚙️  Process & Generate Report' : '⚙️  Process & Generate Report'}
      </button>

      {error && <div className="re-err">⚠️ {error}</div>}
      <DebugPanel info={debug} />

      {result && (
        <div className="re-res">
          <StatGrid tot={result.total} flg={result.finalRows.length} mat={result.matched} nky={result.notFound} />
          <div className="re-tbl-box">
            <div className="re-tbl-top"><b>📋 Final Output</b><em>{result.finalRows.length} records</em></div>
            <ResultTable rows={result.finalRows} badge={rule?.badge || 'purple'} />
          </div>
          <button className="re-dl" onClick={() => downloadCsv(result.finalRows, rule?.label || 'report')}>
            ⬇ Download CSV
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function OfflineSection() {
  const [ruleKey, setRuleKey] = useState('');
  const [of1, setOf1] = useState(null); const [oh1, setOh1] = useState([]);
  const [of2, setOf2] = useState(null); const [oh2, setOh2] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [lbl1, setLbl1] = useState(null);
  const [lbl2, setLbl2] = useState(null);
  const [kybMode, setKybMode] = useState('upload'); // simplified: upload only (no local Trino in deployed version)
  const [processing, setProcessing] = useState(false);
  const [error, setError]   = useState('');
  const [debug, setDebug]   = useState(null);
  const [result, setResult] = useState(null);

  const rule = OFFLINE_RULES[ruleKey];
  const canRun = !!(of1?.length && of2?.length && dateFrom && dateTo && ruleKey);

  const run = () => {
    setError(''); setProcessing(true);
    setTimeout(() => {
      const midCol2 = findCol(oh2, JUC_MID);
      const kybCol2 = findCol(oh2, JUC_KYB);
      if (!midCol2 || !kybCol2) {
        setError(`MID/KYBID not found in Jucata dump.\nFound: ${oh2.join(', ')}`);
        setProcessing(false); return;
      }
      const kybMap = new Map();
      for (const r of of2) { const m = String(r[midCol2]||'').trim(); const k = String(r[kybCol2]||'').trim(); if(m) kybMap.set(m,k); }

      const periodStr = `${fmtD(dateFrom)} - ${fmtD(dateTo)}`;
      const res = processRows(of1, oh1, kybMap, rule, periodStr);
      if (res.error) { setError(res.error); setProcessing(false); return; }

      const { finalRows, midCol, amtCol, amtForcedZero, allMids } = res;
      const matched = finalRows.filter(r => r.customer_id).length;
      const unmatched = finalRows.filter(r => !r.customer_id).map(r => r.account_no);

      setDebug([
        ['Sheet 1 — All columns', oh1.join(' | ')],
        ['Sheet 1 — MID column used', midCol],
        ['Sheet 1 — Amount column used', rule.amt_zero ? 'N/A (zero)' : amtForcedZero ? 'Not found — set to 0' : amtCol],
        ['Sheet 1 — Total rows', of1.length + ' rows'],
        ['Sheet 1 — Unique MIDs found', allMids.length + ' unique MIDs', 'ok'],
        ['Sheet 1 — First 5 MIDs', allMids.slice(0,5).join('  |  ')],
        ['Sheet 2 — MID column', midCol2],
        ['Sheet 2 — KYBID column', kybCol2],
        ['Sheet 2 — Total entries', [...kybMap.keys()].length + ' entries'],
        ['KYB Match', `${matched}/${allMids.length} matched${unmatched.length ? ' — ' + unmatched.length + ' not found' : ''}${unmatched.length ? '\nUnmatched: ' + unmatched.join(', ') : ''}`, matched === allMids.length ? 'ok' : 'bad'],
      ]);
      setResult({ finalRows, matched, notFound: allMids.length - matched, total: allMids.length });
      if (amtForcedZero) setError(`ℹ️ Amount column not found — set to 0.\nExpected: ${rule.amt_cols.slice(0,5).join(', ')}\nFound: ${oh1.join(', ')}`);
      setProcessing(false);
    }, 120);
  };

  return (
    <div>
      <div className="re-g2">
        <div className="re-card re-full">
          <div className="re-lbl">Choose the Offline Rule</div>
          <select className="re-select" value={ruleKey} onChange={e => setRuleKey(e.target.value)}>
            <option value="">— Choose the Offline Rule —</option>
            {Object.entries(OFFLINE_RULES).map(([k, r]) => (
              <option key={k} value={k}>{r.label}</option>
            ))}
          </select>
          {rule && (
            <div className="re-hint">
              <span className="re-freq re-freq-m">Monthly</span>
              &nbsp; <b>MID column:</b> {rule.mid_cols.slice(0,3).join(' / ')}
              &nbsp;|&nbsp; <b>Amount:</b> {rule.amt_zero ? 'Zero (not required)' : rule.amt_cols.slice(0,3).join(' / ')}
            </div>
          )}
        </div>

        <UploadZone label="Sheet 1 — Transaction Data" fileLabel={lbl1}
          onChange={e => { const f=e.target.files[0]; if(!f) return; setLbl1(`✅ <b>${f.name}</b><br><small style="color:#888">${Math.round(f.size/1024)} KB</small>`); parseFile(f,(r,h)=>{setOf1(r);setOh1(h);}); }} />
        <UploadZone label="Sheet 2 — Jucata Dump" sub="Columns: MID, KYBID" fileLabel={lbl2}
          onChange={e => { const f=e.target.files[0]; if(!f) return; setLbl2(`✅ <b>${f.name}</b><br><small style="color:#888">${Math.round(f.size/1024)} KB</small>`); parseFile(f,(r,h)=>{setOf2(r);setOh2(h);}); }} />

        <div className="re-card re-full">
          <div className="re-lbl">Period (display only)</div>
          <div className="re-dr">
            <div><label className="re-date-lbl">From Date</label><input type="date" className="re-date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div><label className="re-date-lbl">To Date</label><input type="date" className="re-date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
          </div>
          {(dateFrom || dateTo) && <div className="re-pp">📅 {fmtD(dateFrom) || '?'} – {fmtD(dateTo) || '?'}</div>}
        </div>
      </div>

      <button className="re-run" disabled={!canRun || processing} onClick={run}>
        {processing ? '⏳  Processing...' : '⚙️  Process & Generate Offline Report'}
      </button>

      {error && <div className={`re-err${error.startsWith('ℹ️') ? ' re-err-info' : ''}`}>{error}</div>}
      <DebugPanel info={debug} />

      {result && (
        <div className="re-res">
          <StatGrid tot={result.total} flg={result.finalRows.length} mat={result.matched} nky={result.notFound} />
          <div className="re-tbl-box">
            <div className="re-tbl-top"><b>📋 Offline Final Output</b><em>{result.finalRows.length} records</em></div>
            <ResultTable rows={result.finalRows} badge="green" />
          </div>
          <button className="re-dl" onClick={() => downloadCsv(result.finalRows, rule?.label || 'offline_report')}>
            ⬇ Download CSV
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function RuleEngine() {
  const [mode, setMode] = useState('online');

  return (
    <div className="re-root">
      <div className="re-header">
        <div className="re-title-row">
          <div className="re-ico">⚡</div>
          <div>
            <h1 className="re-title">Transaction Rule Engine</h1>
            <p className="re-sub">Upload transaction data and Jucata dump, choose a rule, and download the report.</p>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="re-mode-toggle">
        <button className={`re-mode-btn${mode === 'online' ? ' active' : ''}`} onClick={() => setMode('online')}>🌐 Online Rules</button>
        <button className={`re-mode-btn${mode === 'offline' ? ' active' : ''}`} onClick={() => setMode('offline')}>📋 Offline Rules</button>
      </div>

      {mode === 'online'  && <OnlineSection />}
      {mode === 'offline' && <OfflineSection />}

      <style>{`
        .re-root { padding: 2rem 1.5rem;  margin: 0 auto; max-width: 1100px; }
        .re-header { margin-bottom: 1.5rem; }
        .re-title-row { display: flex; align-items: center; gap: 12px; }
        .re-ico { width: 40px; height: 40px; background: #111; color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .re-title { font-size: 22px; font-weight: 700; color: #111; margin: 0; }
        .re-sub { font-size: 13px; color: #777; margin: 4px 0 0; }

        .re-mode-toggle { display: flex; gap: 10px; margin-bottom: 20px; }
        .re-mode-btn { flex: 1; padding: 11px; border-radius: 10px; border: 1.5px solid #ddd; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; color: #555; transition: all .15s; }
        .re-mode-btn:hover { background: #f5f5f2; border-color: #bbb; }
        .re-mode-btn.active { background: #111; color: #fff; border-color: #111; }

        .re-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .re-full { grid-column: 1 / -1; }
        .re-card { background: #fff; border: 1px solid #e4e4e0; border-radius: 12px; padding: 1.2rem; }
        .re-lbl { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
        .re-select { width: 100%; font-size: 13px; padding: 8px 11px; border: 1px solid #ddd; border-radius: 8px; background: #fff; color: #1a1a1a; outline: none; }
        .re-select:focus { border-color: #111; }
        .re-hint { font-size: 12px; color: #444; background: #f8f8f6; border: 1px solid #e4e4e0; border-radius: 8px; padding: 9px 12px; margin-top: 9px; }

        .re-freq { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
        .re-freq-d { background: #dcfce7; color: #166534; }
        .re-freq-m { background: #dbeafe; color: #1e40af; }
        .re-freq-w { background: #fef9c3; color: #854d0e; }

        .re-upload-zone { border: 1.5px dashed #ccc; border-radius: 9px; padding: 18px 12px; text-align: center; cursor: pointer; display: block; transition: background .15s; }
        .re-upload-zone:hover { background: #f8f8f6; border-color: #aaa; }
        .re-up-icon { font-size: 22px; }
        .re-up-txt { font-size: 12px; color: #888; margin-top: 6px; line-height: 1.5; }

        .re-dr { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .re-date-lbl { font-size: 11px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; display: block; margin-bottom: 5px; }
        .re-date { width: 100%; font-size: 13px; padding: 8px 11px; border: 1px solid #ddd; border-radius: 8px; background: #fff; outline: none; }
        .re-pp { font-size: 13px; font-weight: 600; color: #444; padding: 7px 11px; background: #f8f8f6; border-radius: 8px; margin-top: 8px; }

        .re-run { width: 100%; padding: 13px; border-radius: 10px; border: none; background: #111; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 4px; transition: background .15s; }
        .re-run:hover:not(:disabled) { background: #2a2a2a; }
        .re-run:disabled { background: #ccc; cursor: not-allowed; color: #999; }

        .re-err { font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; margin-top: 12px; white-space: pre-line; }
        .re-err-info { color: #1e40af; background: #eff6ff; border-color: #93c5fd; }

        .re-dbg { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
        .re-dbg-title { color: #92400e; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .re-dbg-row { display: flex; gap: 8px; margin-bottom: 5px; align-items: flex-start; }
        .re-dbg-k { font-weight: 700; color: #555; min-width: 220px; font-size: 11px; padding-top: 2px; flex-shrink: 0; }
        .re-dbg-v { font-family: monospace; background: #fef3c7; padding: 3px 8px; border-radius: 4px; font-size: 11px; word-break: break-all; flex: 1; white-space: pre-wrap; }
        .re-dbg-v.ok { color: #166534; font-weight: 700; }
        .re-dbg-v.bad { color: #991b1b; font-weight: 700; }

        .re-res { margin-top: 20px; }
        .re-sg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
        .re-stat { background: #fff; border: 1px solid #e4e4e0; border-radius: 10px; padding: 14px 12px; text-align: center; }
        .re-sn { font-size: 26px; font-weight: 700; color: #111; }
        .re-sl { font-size: 11px; color: #999; margin-top: 3px; }

        .re-tbl-box { background: #fff; border: 1px solid #e4e4e0; border-radius: 12px; overflow: hidden; }
        .re-tbl-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fafaf8; border-bottom: 1px solid #e4e4e0; }
        .re-tbl-top b { font-size: 13px; font-weight: 700; color: #222; }
        .re-tbl-top em { font-size: 12px; color: #888; background: #efefeb; padding: 3px 10px; border-radius: 99px; font-style: normal; }
        .re-tbl-scr { overflow-x: auto; }
        .re-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .re-table th { padding: 10px 14px; text-align: left; font-weight: 700; font-size: 11px; color: #999; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid #e4e4e0; background: #fafaf8; white-space: nowrap; }
        .re-table td { padding: 10px 14px; border-bottom: 1px solid #f2f2ee; color: #1a1a1a; vertical-align: middle; }
        .re-table tr:last-child td { border-bottom: none; }
        .re-table tr:hover td { background: #fafaf8; }

        .re-badge { font-size: 10px; padding: 3px 9px; border-radius: 99px; font-weight: 700; display: inline-block; line-height: 1.4; }
        .re-badge-amber  { background: #fef9c3; color: #92400e; }
        .re-badge-red    { background: #fee2e2; color: #991b1b; }
        .re-badge-blue   { background: #dbeafe; color: #1e40af; }
        .re-badge-purple { background: #f3e8ff; color: #6b21a8; }
        .re-badge-green  { background: #dcfce7; color: #166534; }
        .re-badge-orange { background: #ffedd5; color: #9a3412; }

        .re-mono { font-size: 11px; font-family: 'Courier New', monospace; color: #333; }
        .re-kok  { color: #15803d; font-size: 11px; font-weight: 600; }
        .re-amt  { font-size: 12px; font-weight: 700; color: #111; }
        .re-per  { font-size: 11px; color: #555; white-space: nowrap; }
        .re-empty { text-align: center; color: #bbb; padding: 32px; font-size: 13px; }

        .re-dl { width: 100%; margin-top: 14px; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; border: 1.5px solid #111; background: #111; color: #fff; transition: all .15s; }
        .re-dl:hover { background: #2a2a2a; }

        @media (max-width: 640px) {
          .re-g2 { grid-template-columns: 1fr; }
          .re-sg { grid-template-columns: repeat(2, 1fr); }
          .re-dr { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
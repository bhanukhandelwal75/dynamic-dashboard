// ─────────────────────────────────────────────
// COLUMN DETECTION — CDR format aware
// ─────────────────────────────────────────────
export function detectCols(headers) {
  const find = (...kws) =>
    headers.find((h) =>
      kws.some((k) =>
        h.toLowerCase().replace(/[\s_]/g, '').includes(k.toLowerCase().replace(/[\s_]/g, ''))
      )
    );
  return {
    user:        find('user_name', 'username', 'analyst', 'user'),
    level:       find('investigation_level', 'investigationlevel', 'level', 'inv_level'),
    status:      find('disposition_status', 'disposition_statu', 'dispositionstatus', 'status', 'disposition'),
    subStatus:   find('case_sub_status', 'case_status', 'substatus', 'sub_status'),
    custType:    find('customer_type', 'custtype', 'clienttype'),
    custName:    find('customer_name', 'custname', 'clientname'),
    custId:      find('customer_id', 'custid', 'clientid'),
    createdDate: find('created_date', 'createdate', 'creationdate', 'createdat', 'opendate'),
    lastAction:  find('last_action_date', 'lastactiondate', 'lastaction', 'updateddate', 'closeddate'),
    comments:    find('comments', 'comment', 'remarks', 'notes'),
    caseId:      find('case_id', 'caseid', 'casenumber', 'ticketid', 'id'),
    month:       find('month1', 'month', 'reportingmonth', 'period'),
    actionType:  find('action_type', 'actiontype'),
    ageing:      find('ageing', 'aging'),
    l3User:      find('l3_user', 'l3user'),
    l2User:      find('l2_user', 'l2user'),
    l1User:      find('l1_user', 'l1user'),
  };
}

// ─────────────────────────────────────────────
// DATE PARSING
// ─────────────────────────────────────────────
export function pDate(val) {
  if (!val || val === '') return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  // Unix ms timestamp
  if (/^\d{13,}$/.test(val)) {
    const d = new Date(parseInt(val));
    return isNaN(d) ? null : d;
  }
  // Excel serial numbers (5-6 digits)
  if (/^\d{5,6}$/.test(val)) {
    const serial = parseInt(val);
    const d = new Date((serial - 25569) * 86400 * 1000);
    return isNaN(d) ? null : d;
  }
  // DD/MM/YYYY or DD-MM-YYYY
  let m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const yr = m[3].length === 2 ? '20' + m[3] : m[3];
    const d = new Date(`${yr}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
    if (!isNaN(d)) return d;
  }
  // YYYY-MM-DD
  m = val.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    const d = new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
    if (!isNaN(d)) return d;
  }
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

// ─────────────────────────────────────────────
// ROW ENRICHMENT
// ─────────────────────────────────────────────
export function enrichRow(r, CM) {
  const created = CM.createdDate ? pDate(r[CM.createdDate]) : null;
  const lastAct  = CM.lastAction  ? pDate(r[CM.lastAction])  : null;
  let ageing = null;
  if (created && lastAct) {
    ageing = Math.round((lastAct - created) / 86400000);
    if (ageing < 0) ageing = 0;
  }
  const lvlRaw = (r[CM.level] || '').toUpperCase();
  const lvl = lvlRaw.includes('L3') ? 'L3'
    : lvlRaw.includes('L2') ? 'L2'
    : lvlRaw.includes('L1') ? 'L1'
    : 'OTHER';
  const statusRaw = (r[CM.status] || '').toLowerCase();
  const isClosed = statusRaw.includes('close') || statusRaw.includes('complet');
  const isOpen   = statusRaw.includes('open') || (!isClosed && statusRaw !== '');
  return { ...r, _created: created, _lastAct: lastAct, _ageing: ageing, _level: lvl, _closed: isClosed, _open: isOpen };
}

// ─────────────────────────────────────────────
// CSV LINE SPLITTER
// ─────────────────────────────────────────────
export function splitCSVLine(line) {
  const result = [];
  let curr = '';
  let inQ = false;
  for (let c of line) {
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) { result.push(curr); curr = ''; }
    else curr += c;
  }
  result.push(curr);
  return result;
}

// ─────────────────────────────────────────────
// GET MONTH KEY FROM ROW
// ─────────────────────────────────────────────
export function getMonthKey(r, CM) {
  if (CM.month && r[CM.month]) return r[CM.month];
  if (r._created) return r._created.toISOString().slice(0, 7);
  if (r._lastAct) return r._lastAct.toISOString().slice(0, 7);
  return null;
}

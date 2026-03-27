import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { detectCols, enrichRow, splitCSVLine } from '../utils/dataUtils';

const DataContext = createContext(null);

// Hardcoded credentials (same as index1.html)
const USERS = {
  admin: { password: 'admin123', name: 'Admin User',    role: 'Administrator' },
  alice: { password: 'pass456',  name: 'Alice Johnson', role: 'Sr. Analyst' },
  bob:   { password: 'pass789',  name: 'Bob Smith',     role: 'Risk Analyst' },
  sara:  { password: 'sara2024', name: 'Sara Williams', role: 'Data Analyst' },
  dev:   { password: 'devteam',  name: 'Dev Team',      role: 'Developer' },
  ops:   { password: 'ops2024',  name: 'Ops Head',      role: 'Operations Head' },
};

export function DataProvider({ children }) {
  // Persist login state in sessionStorage so HMR / page refresh doesn't logout
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aml_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [rawData,     setRawData]       = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataHeaders,  setDataHeaders]  = useState([]);
  const [CM,           setCM]           = useState({});
  const [workbook,     setWorkbook]     = useState(null);
  const [sheetNames,   setSheetNames]   = useState([]);
  const [activeSheet,  setActiveSheet]  = useState(0);
  const [fileName,     setFileName]     = useState('');
  const [activeSheetName, setActiveSheetName] = useState('');
  const [filters,      setFilters]      = useState({ month: '', user: '', level: '', status: '' });

  // ── Sync currentUser to sessionStorage ───────────
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('aml_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('aml_current_user');
    }
  }, [currentUser]);

  // ── AUTH ──────────────────────────────────────
  const doLogin = useCallback((id, pass) => {
    const u = USERS[id.trim().toLowerCase()];
    if (u && u.password === pass) {
      setCurrentUser({ id: id.trim().toLowerCase(), ...u });
      return true;
    }
    return false;
  }, []);

  const doLogout = useCallback(() => {
    sessionStorage.removeItem('aml_current_user');
    setCurrentUser(null);
    setRawData([]);
    setFilteredData([]);
    setDataHeaders([]);
    setCM({});
    setWorkbook(null);
    setSheetNames([]);
    setFileName('');
    setFilters({ month: '', user: '', level: '', status: '' });
  }, []);

  // ── DATA PROCESSING ──────────────────────────
  const processData = useCallback((rows, headers, fname, sheetName) => {
    const cm = detectCols(headers);
    const enriched = rows.map((r) => enrichRow(r, cm));
    setDataHeaders(headers);
    setCM(cm);
    setRawData(enriched);
    setFilteredData(enriched);
    setFileName(fname);
    setActiveSheetName(sheetName || '');
    setFilters({ month: '', user: '', level: '', status: '' });
  }, []);

  // ── CSV ──────────────────────────────────────
  const readCSV = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.trim().split('\n').filter((l) => l.trim());
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map((l) => {
        const vals = splitCSVLine(l);
        return headers.reduce((o, h, i) => {
          o[h] = (vals[i] || '').replace(/"/g, '').trim();
          return o;
        }, {});
      }).filter((r) => Object.values(r).some((v) => v));
      processData(rows, headers, file.name, null);
    };
    reader.readAsText(file);
  }, [processData]);

  // ── EXCEL ────────────────────────────────────
  const loadSheetByIdx = useCallback((wb, idx, fname) => {
    const sn = wb.SheetNames[idx];
    const sh = wb.Sheets[sn];
    const json = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
    if (!json || json.length < 2) return;
    const headers = json[0].map((h) => String(h || '').trim()).filter((h) => h);
    const rows = json.slice(1)
      .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
      .map((r) =>
        headers.reduce((o, h, i) => {
          o[h] = String(r[i] === undefined || r[i] === null ? '' : r[i]).trim();
          return o;
        }, {})
      );
    setActiveSheet(idx);
    processData(rows, headers, fname || 'file.xlsx', sn);
  }, [processData]);

  const readExcel = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      loadSheetByIdx(wb, 0, file.name);
    };
    reader.readAsArrayBuffer(file);
  }, [loadSheetByIdx]);

  const handleUpload = useCallback((file) => {
    if (!file) return;
    const n = file.name.toLowerCase();
    if (n.endsWith('.csv')) readCSV(file);
    else if (n.endsWith('.xls') || n.endsWith('.xlsx')) readExcel(file);
    else alert('Please upload CSV, XLS, or XLSX');
  }, [readCSV, readExcel]);

  const switchSheet = useCallback((idx) => {
    if (workbook) loadSheetByIdx(workbook, idx, fileName);
  }, [workbook, fileName, loadSheetByIdx]);

  // ── FILTERS ───────────────────────────────────
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setFilteredData(
      rawData.filter((r) => {
        if (newFilters.month) {
          const rv = CM.month
            ? (r[CM.month] || '')
            : r._created ? r._created.toISOString().slice(0, 7) : '';
          if (rv !== newFilters.month) return false;
        }
        if (newFilters.user && CM.user && r[CM.user] !== newFilters.user) return false;
        if (newFilters.level && r._level !== newFilters.level) return false;
        if (newFilters.status && CM.status && r[CM.status] !== newFilters.status) return false;
        return true;
      })
    );
  }, [rawData, CM]);

  const resetFilters = useCallback(() => {
    setFilters({ month: '', user: '', level: '', status: '' });
    setFilteredData([...rawData]);
  }, [rawData]);

  return (
    <DataContext.Provider value={{
      // auth
      currentUser, doLogin, doLogout,
      // data
      rawData, filteredData, dataHeaders, CM,
      fileName, activeSheetName,
      // excel sheets
      workbook, sheetNames, activeSheet, switchSheet,
      // upload
      handleUpload,
      // filters
      filters, applyFilters, resetFilters,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

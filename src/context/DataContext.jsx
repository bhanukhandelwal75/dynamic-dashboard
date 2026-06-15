// import { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import { detectCols, enrichRow, splitCSVLine } from '../utils/dataUtils';

// const DataContext = createContext(null);

// // Hardcoded credentials (same as index1.html)
// const USERS = {
//   admin: { password: 'admin123', name: 'Admin User',    role: 'Administrator' },
//   alice: { password: 'pass456',  name: 'Alice Johnson', role: 'Sr. Analyst' },
//   bob:   { password: 'pass789',  name: 'Bob Smith',     role: 'Risk Analyst' },
//   sara:  { password: 'sara2024', name: 'Sara Williams', role: 'Data Analyst' },
//   dev:   { password: 'devteam',  name: 'Dev Team',      role: 'Developer' },
//   ops:   { password: 'ops2024',  name: 'Ops Head',      role: 'Operations Head' },
// };

// export function DataProvider({ children }) {
//   // Persist login state in sessionStorage so HMR / page refresh doesn't logout
//   const [currentUser, setCurrentUser] = useState(() => {
//     try {
//       const saved = sessionStorage.getItem('aml_current_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch { return null; }
//   });
//   const [rawData,     setRawData]       = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [dataHeaders,  setDataHeaders]  = useState([]);
//   const [CM,           setCM]           = useState({});
//   const [workbook,     setWorkbook]     = useState(null);
//   const [sheetNames,   setSheetNames]   = useState([]);
//   const [activeSheet,  setActiveSheet]  = useState(0);
//   const [fileName,     setFileName]     = useState('');
//   const [activeSheetName, setActiveSheetName] = useState('');
//   const [filters,      setFilters]      = useState({ month: '', user: '', level: '', status: '' });

//   // ── Sync currentUser to sessionStorage ───────────
//   useEffect(() => {
//     if (currentUser) {
//       sessionStorage.setItem('aml_current_user', JSON.stringify(currentUser));
//     } else {
//       sessionStorage.removeItem('aml_current_user');
//     }
//   }, [currentUser]);

//   // ── AUTH ──────────────────────────────────────
//   const doLogin = useCallback((id, pass) => {
//     const u = USERS[id.trim().toLowerCase()];
//     if (u && u.password === pass) {
//       setCurrentUser({ id: id.trim().toLowerCase(), ...u });
//       return true;
//     }
//     return false;
//   }, []);

//   const doLogout = useCallback(() => {
//     sessionStorage.removeItem('aml_current_user');
//     setCurrentUser(null);
//     setRawData([]);
//     setFilteredData([]);
//     setDataHeaders([]);
//     setCM({});
//     setWorkbook(null);
//     setSheetNames([]);
//     setFileName('');
//     setFilters({ month: '', user: '', level: '', status: '' });
//   }, []);

//   // ── DATA PROCESSING ──────────────────────────
//   const processData = useCallback((rows, headers, fname, sheetName) => {
//     const cm = detectCols(headers);
//     const enriched = rows.map((r) => enrichRow(r, cm));
//     setDataHeaders(headers);
//     setCM(cm);
//     setRawData(enriched);
//     setFilteredData(enriched);
//     setFileName(fname);
//     setActiveSheetName(sheetName || '');
//     setFilters({ month: '', user: '', level: '', status: '' });
//   }, []);

//   // ── CSV ──────────────────────────────────────
//   const readCSV = useCallback((file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const text = e.target.result;
//       const lines = text.trim().split('\n').filter((l) => l.trim());
//       const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
//       const rows = lines.slice(1).map((l) => {
//         const vals = splitCSVLine(l);
//         return headers.reduce((o, h, i) => {
//           o[h] = (vals[i] || '').replace(/"/g, '').trim();
//           return o;
//         }, {});
//       }).filter((r) => Object.values(r).some((v) => v));
//       processData(rows, headers, file.name, null);
//     };
//     reader.readAsText(file);
//   }, [processData]);

//   // ── EXCEL ────────────────────────────────────
//   const loadSheetByIdx = useCallback((wb, idx, fname) => {
//     const sn = wb.SheetNames[idx];
//     const sh = wb.Sheets[sn];
//     const json = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
//     if (!json || json.length < 2) return;
//     const headers = json[0].map((h) => String(h || '').trim()).filter((h) => h);
//     const rows = json.slice(1)
//       .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
//       .map((r) =>
//         headers.reduce((o, h, i) => {
//           o[h] = String(r[i] === undefined || r[i] === null ? '' : r[i]).trim();
//           return o;
//         }, {})
//       );
//     setActiveSheet(idx);
//     processData(rows, headers, fname || 'file.xlsx', sn);
//   }, [processData]);

//   const readExcel = useCallback((file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
//       setWorkbook(wb);
//       setSheetNames(wb.SheetNames);
//       loadSheetByIdx(wb, 0, file.name);
//     };
//     reader.readAsArrayBuffer(file);
//   }, [loadSheetByIdx]);

//   const handleUpload = useCallback((file) => {
//     if (!file) return;
//     const n = file.name.toLowerCase();
//     if (n.endsWith('.csv')) readCSV(file);
//     else if (n.endsWith('.xls') || n.endsWith('.xlsx')) readExcel(file);
//     else alert('Please upload CSV, XLS, or XLSX');
//   }, [readCSV, readExcel]);

//   const switchSheet = useCallback((idx) => {
//     if (workbook) loadSheetByIdx(workbook, idx, fileName);
//   }, [workbook, fileName, loadSheetByIdx]);

//   // ── FILTERS ───────────────────────────────────
//   const applyFilters = useCallback((newFilters) => {
//     setFilters(newFilters);
//     setFilteredData(
//       rawData.filter((r) => {
//         if (newFilters.month) {
//           const rv = CM.month
//             ? (r[CM.month] || '')
//             : r._created ? r._created.toISOString().slice(0, 7) : '';
//           if (rv !== newFilters.month) return false;
//         }
//         if (newFilters.user && CM.user && r[CM.user] !== newFilters.user) return false;
//         if (newFilters.level && r._level !== newFilters.level) return false;
//         if (newFilters.status && CM.status && r[CM.status] !== newFilters.status) return false;
//         return true;
//       })
//     );
//   }, [rawData, CM]);

//   const resetFilters = useCallback(() => {
//     setFilters({ month: '', user: '', level: '', status: '' });
//     setFilteredData([...rawData]);
//   }, [rawData]);

//   return (
//     <DataContext.Provider value={{
//       // auth
//       currentUser, doLogin, doLogout,
//       // data
//       rawData, filteredData, dataHeaders, CM,
//       fileName, activeSheetName,
//       // excel sheets
//       workbook, sheetNames, activeSheet, switchSheet,
//       // upload
//       handleUpload,
//       // filters
//       filters, applyFilters, resetFilters,
//     }}>
//       {children}
//     </DataContext.Provider>
//   );
// }

// export function useData() {
//   return useContext(DataContext);
// }


// import { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import { detectCols, enrichRow, splitCSVLine } from '../utils/dataUtils';

// const DataContext = createContext(null);

// const SERVER = 'http://localhost:3001';

// // ── Users — add email for each user ──────────────────────────────────────────
// const USERS = {
//   admin: { password: 'admin123', name: 'Admin User',       role: 'Administrator', email: 'your-admin-email@gmail.com'  },
//   alice: { password: 'pass456',  name: 'Alice Johnson',    role: 'Sr. Analyst',   email: 'alice@gmail.com'             },
//   bob:   { password: 'pass789',  name: 'Bob Smith',        role: 'Risk Analyst',  email: 'bob@gmail.com'               },
//   sara:  { password: 'sara2024', name: 'Sara Williams',    role: 'Data Analyst',  email: 'sara@gmail.com'              },
//   dev:   { password: 'devteam',  name: 'Dev Team',         role: 'Developer',     email: 'dev@gmail.com'               },
//   ops:   { password: 'ops2024',  name: 'Ops Head',         role: 'Operations Head', email: 'ops@gmail.com'             },
//   bhanu: { password: 'bhanu123', name: 'Bhanu Khandelwal', role: 'Sr. Analyst',   email: 'bhanu.khandelwal@paytmpayments.com'  },
// };

// export function DataProvider({ children }) {

//   // ── Auth state ────────────────────────────────────────────────────────────
//   const [currentUser, setCurrentUser] = useState(() => {
//     try {
//       const saved = sessionStorage.getItem('aml_current_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch { return null; }
//   });

//   // ── Data state ────────────────────────────────────────────────────────────
//   const [rawData,         setRawData]         = useState([]);
//   const [filteredData,    setFilteredData]    = useState([]);
//   const [dataHeaders,     setDataHeaders]     = useState([]);
//   const [CM,              setCM]              = useState({});
//   const [workbook,        setWorkbook]        = useState(null);
//   const [sheetNames,      setSheetNames]      = useState([]);
//   const [activeSheet,     setActiveSheet]     = useState(0);
//   const [fileName,        setFileName]        = useState('');
//   const [activeSheetName, setActiveSheetName] = useState('');
//   const [filters,         setFilters]         = useState({ month: '', user: '', level: '', status: '' });

//   // ── Sync currentUser to sessionStorage ───────────────────────────────────
//   useEffect(() => {
//     if (currentUser) {
//       sessionStorage.setItem('aml_current_user', JSON.stringify(currentUser));
//     } else {
//       sessionStorage.removeItem('aml_current_user');
//     }
//   }, [currentUser]);

//   // ── AUTH — Step 1: Check password + send OTP ─────────────────────────────
//   const doLogin = useCallback(async (id, pass) => {
//     const u = USERS[id.trim().toLowerCase()];

//     // Wrong credentials
//     if (!u || u.password !== pass) {
//       return { success: false, error: 'Invalid username or password.' };
//     }

//     // Correct password — send OTP
//     try {
//       const res  = await fetch(`${SERVER}/api/send-otp`, {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify({ email: u.email }),
//       });
//       const data = await res.json();

//       if (!data.success) {
//         return { success: false, error: data.error || 'Failed to send OTP.' };
//       }

//       // Return pending OTP state — LoginPage will show OTP screen
//       return {
//         success:     true,
//         requiresOTP: true,
//         email:       u.email,
//         userId:      id.trim().toLowerCase(),
//         user:        u,
//       };

//     } catch {
//       return { success: false, error: 'Cannot reach server. Is proxy_server.cjs running?' };
//     }
//   }, []);

//   // ── AUTH — Step 2: Verify OTP + complete login ────────────────────────────
//   const verifyOTP = useCallback(async (email, otp, userId, user) => {
//     try {
//       const res  = await fetch(`${SERVER}/api/verify-otp`, {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify({ email, otp }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         setCurrentUser({ id: userId, ...user });
//         return { success: true };
//       }

//       return { success: false, error: data.error || 'Invalid OTP.' };

//     } catch {
//       return { success: false, error: 'Cannot reach server. Is proxy_server.cjs running?' };
//     }
//   }, []);

//   // ── AUTH — Logout ─────────────────────────────────────────────────────────
//   const doLogout = useCallback(() => {
//     sessionStorage.removeItem('aml_current_user');
//     setCurrentUser(null);
//     setRawData([]);
//     setFilteredData([]);
//     setDataHeaders([]);
//     setCM({});
//     setWorkbook(null);
//     setSheetNames([]);
//     setFileName('');
//     setFilters({ month: '', user: '', level: '', status: '' });
//   }, []);

//   // ── DATA PROCESSING ───────────────────────────────────────────────────────
//   const processData = useCallback((rows, headers, fname, sheetName) => {
//     const cm      = detectCols(headers);
//     const enriched = rows.map((r) => enrichRow(r, cm));
//     setDataHeaders(headers);
//     setCM(cm);
//     setRawData(enriched);
//     setFilteredData(enriched);
//     setFileName(fname);
//     setActiveSheetName(sheetName || '');
//     setFilters({ month: '', user: '', level: '', status: '' });
//   }, []);

//   // ── CSV ───────────────────────────────────────────────────────────────────
//   const readCSV = useCallback((file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const text    = e.target.result;
//       const lines   = text.trim().split('\n').filter((l) => l.trim());
//       const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
//       const rows    = lines.slice(1).map((l) => {
//         const vals = splitCSVLine(l);
//         return headers.reduce((o, h, i) => {
//           o[h] = (vals[i] || '').replace(/"/g, '').trim();
//           return o;
//         }, {});
//       }).filter((r) => Object.values(r).some((v) => v));
//       processData(rows, headers, file.name, null);
//     };
//     reader.readAsText(file);
//   }, [processData]);

//   // ── EXCEL ─────────────────────────────────────────────────────────────────
//   const loadSheetByIdx = useCallback((wb, idx, fname) => {
//     const sn   = wb.SheetNames[idx];
//     const sh   = wb.Sheets[sn];
//     const json = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
//     if (!json || json.length < 2) return;
//     const headers = json[0].map((h) => String(h || '').trim()).filter((h) => h);
//     const rows    = json.slice(1)
//       .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
//       .map((r) =>
//         headers.reduce((o, h, i) => {
//           o[h] = String(r[i] === undefined || r[i] === null ? '' : r[i]).trim();
//           return o;
//         }, {})
//       );
//     setActiveSheet(idx);
//     processData(rows, headers, fname || 'file.xlsx', sn);
//   }, [processData]);

//   const readExcel = useCallback((file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
//       setWorkbook(wb);
//       setSheetNames(wb.SheetNames);
//       loadSheetByIdx(wb, 0, file.name);
//     };
//     reader.readAsArrayBuffer(file);
//   }, [loadSheetByIdx]);

//   const handleUpload = useCallback((file) => {
//     if (!file) return;
//     const n = file.name.toLowerCase();
//     if      (n.endsWith('.csv'))                    readCSV(file);
//     else if (n.endsWith('.xls') || n.endsWith('.xlsx')) readExcel(file);
//     else alert('Please upload CSV, XLS, or XLSX');
//   }, [readCSV, readExcel]);

//   const switchSheet = useCallback((idx) => {
//     if (workbook) loadSheetByIdx(workbook, idx, fileName);
//   }, [workbook, fileName, loadSheetByIdx]);

//   // ── FILTERS ───────────────────────────────────────────────────────────────
//   const applyFilters = useCallback((newFilters) => {
//     setFilters(newFilters);
//     setFilteredData(
//       rawData.filter((r) => {
//         if (newFilters.month) {
//           const rv = CM.month
//             ? (r[CM.month] || '')
//             : r._created ? r._created.toISOString().slice(0, 7) : '';
//           if (rv !== newFilters.month) return false;
//         }
//         if (newFilters.user   && CM.user   && r[CM.user]   !== newFilters.user)   return false;
//         if (newFilters.level  && r._level  !== newFilters.level)                  return false;
//         if (newFilters.status && CM.status && r[CM.status] !== newFilters.status) return false;
//         return true;
//       })
//     );
//   }, [rawData, CM]);

//   const resetFilters = useCallback(() => {
//     setFilters({ month: '', user: '', level: '', status: '' });
//     setFilteredData([...rawData]);
//   }, [rawData]);

//   // ── Context value ─────────────────────────────────────────────────────────
//   return (
//     <DataContext.Provider value={{
//       // auth
//       currentUser, doLogin, doLogout, verifyOTP,
//       // data
//       rawData, filteredData, dataHeaders, CM,
//       fileName, activeSheetName,
//       // excel sheets
//       workbook, sheetNames, activeSheet, switchSheet,
//       // upload
//       handleUpload,
//       // filters
//       filters, applyFilters, resetFilters,
//     }}>
//       {children}
//     </DataContext.Provider>
//   );
// }

// export function useData() {
//   return useContext(DataContext);
// }






// import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// const DataContext = createContext(null);
// const SERVER = 'http://localhost:3001';

// const USERS = {
//   admin: { password: 'admin123', name: 'Admin User', email: 'your-admin-email@gmail.com' },
//   bhanu: { password: 'bhanu123', name: 'Bhanu Khandelwal', email: 'bhanu.khandelwal@paytmpayments.com' },
// };

// export function DataProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(() => {
//     const saved = sessionStorage.getItem('aml_user');
//     return saved ? JSON.parse(saved) : null;
//   });

//   const doLogin = useCallback(async (idOrEmail, pass) => {
//     const input = idOrEmail.trim().toLowerCase();
//     // Find user by key OR by email property
//     const u = USERS[input] || Object.values(USERS).find(user => user.email.toLowerCase() === input);

//     if (!u || u.password !== pass) {
//       return { success: false, error: 'Invalid credentials' };
//     }

//     try {
//       const res = await fetch(`${SERVER}/api/send-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: u.email }),
//       });
//       const data = await res.json();
//       if (data.success) return { success: true, requiresOTP: true, email: u.email, user: u };
//       return { success: false, error: 'OTP Failed' };
//     } catch {
//       return { success: false, error: 'Server Unreachable' };
//     }
//   }, []);

//   const verifyOTP = useCallback(async (email, otp, user) => {
//     try {
//       const res = await fetch(`${SERVER}/api/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setCurrentUser(user);
//         sessionStorage.setItem('aml_user', JSON.stringify(user));
//         return { success: true };
//       }
//       return { success: false, error: 'Wrong OTP' };
//     } catch {
//       return { success: false, error: 'Verification failed' };
//     }
//   }, []);

//   const doLogout = () => {
//     setCurrentUser(null);
//     sessionStorage.removeItem('aml_user');
//   };

//   return (
//     <DataContext.Provider value={{ currentUser, doLogin, verifyOTP, doLogout }}>
//       {children}
//     </DataContext.Provider>
//   );
// }

// export const useData = () => useContext(DataContext);








import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { detectCols, enrichRow, splitCSVLine } from '../utils/dataUtils';

const DataContext = createContext(null);

const SERVER = 'http://localhost:3001';

// ── Users Configuration ──────────────────────────────────────────────────
const USERS = {
  deepa: { password: 'deepa123', name: 'Deepa',       role: 'Cheif Principal Officer', email: 'deepa1.pandey@paytmpayments.com'  },
  bhanu: { password: 'bhanu123', name: 'Bhanu Khandelwal', role: 'Sr. Analyst',   email: 'bhanu.khandelwal@paytmpayments.com'  },
  alice: { password: 'bhesh123',  name: 'Bhesh',    role: 'Sr. Analyst',   email: 'bhesh.sahu@paytmpayments.com'},
};

export function DataProvider({ children }) {
  // ── Auth State ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aml_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ── Data State ────────────────────────────────────────────────────────────
  const [rawData,         setRawData]         = useState([]);
  const [filteredData,    setFilteredData]    = useState([]);
  const [dataHeaders,     setDataHeaders]     = useState([]);
  const [CM,              setCM]              = useState({});
  const [workbook,        setWorkbook]        = useState(null);
  const [sheetNames,      setSheetNames]      = useState([]);
  const [activeSheet,     setActiveSheet]     = useState(0);
  const [fileName,        setFileName]        = useState('');
  const [activeSheetName, setActiveSheetName] = useState('');
  const [filters,         setFilters]         = useState({ month: '', user: '', level: '', status: '' });

  // ── Auth Actions ──────────────────────────────────────────────────────────
  const doLogin = useCallback(async (idOrEmail, pass) => {
    const input = idOrEmail.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // ✅ TEST ADMIN BYPASS: Isse OTP nahi aayega
    if (input === 'admin' && trimmedPass === 'admin123') {
      const adminUser = { 
        name: 'Test Admin', 
        role: 'Administrator', 
        email: 'admin@test.com' 
      };
      fetch('http://localhost:5050/api/log-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminUser.email }),
      }).catch(e => console.log("Backend offline, but logging in admin..."));
      
      
      setCurrentUser(adminUser);
      sessionStorage.setItem('aml_user', JSON.stringify(adminUser));
      return { success: true, requiresOTP: false }; // requiresOTP ko false rakha hai
    }
    // Lookup by ID or Email
    const u = USERS[input] || Object.values(USERS).find(user => user.email.toLowerCase() === input);

    if (!u || u.password !== pass) {
      return { success: false, error: 'Invalid username or password.' };
    }

    try {
      const res = await fetch(`${SERVER}/api/send-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: u.email }),
      });
      const data = await res.json();

      if (!data.success) return { success: false, error: data.error || 'Failed to send OTP.' };

      return {
        success:     true,
        requiresOTP: true,
        email:       u.email,
        userId:      input,
        user:        u,
      };
    } catch {
      return { success: false, error: 'Cannot reach server. Is proxy_server.cjs running?' };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp, user) => {
    try {
      const res = await fetch(`${SERVER}/api/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentUser(user);
        sessionStorage.setItem('aml_user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid OTP.' };
    } catch {
      return { success: false, error: 'Cannot reach server.' };
    }
  }, []);

  const doLogout = useCallback(() => {
    sessionStorage.removeItem('aml_user');
    setCurrentUser(null);
    setRawData([]);
    setFilteredData([]);
    setFileName('');
  }, []);

  // ── Data Processing Logic ────────────────────────────────────────────────
  const processData = useCallback((rows, headers, fname, sheetName) => {
    const cm = detectCols(headers);
    const enriched = rows.map((r) => enrichRow(r, cm));
    setDataHeaders(headers);
    setCM(cm);
    setRawData(enriched);
    setFilteredData(enriched);
    setFileName(fname);
    setActiveSheetName(sheetName || '');
  }, []);

  const readCSV = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.trim().split('\n').filter((l) => l.trim());
      if (!lines.length) return;
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map((l) => {
        const vals = splitCSVLine(l);
        return headers.reduce((o, h, i) => {
          o[h] = (vals[i] || '').replace(/"/g, '').trim();
          return o;
        }, {});
      });
      processData(rows, headers, file.name, null);
    };
    reader.readAsText(file);
  }, [processData]);

  const loadSheetByIdx = useCallback((wb, idx, fname) => {
    const sn = wb.SheetNames[idx];
    const sh = wb.Sheets[sn];
    const json = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
    if (!json || json.length < 1) return;
    const headers = json[0].map((h) => String(h || '').trim()).filter((h) => h);
    const rows = json.slice(1).map((r) =>
      headers.reduce((o, h, i) => {
        o[h] = String(r[i] === undefined || r[i] === null ? '' : r[i]).trim();
        return o;
      }, {})
    );
    setActiveSheet(idx);
    processData(rows, headers, fname, sn);
  }, [processData]);

  const handleUpload = useCallback((file) => {
    if (!file) return;
    const n = file.name.toLowerCase();
    if (n.endsWith('.csv')) {
      readCSV(file);
    } else if (n.endsWith('.xls') || n.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        loadSheetByIdx(wb, 0, file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload CSV, XLS, or XLSX');
    }
  }, [readCSV, loadSheetByIdx]);

  const switchSheet = useCallback((idx) => {
    if (workbook) loadSheetByIdx(workbook, idx, fileName);
  }, [workbook, fileName, loadSheetByIdx]);

  // ── Value ─────────────────────────────────────────────────────────────────
  return (
    <DataContext.Provider value={{
      currentUser, doLogin, verifyOTP, doLogout,
      rawData, filteredData, dataHeaders, CM,
      fileName, activeSheetName,
      workbook, sheetNames, activeSheet, switchSheet,
      handleUpload,
      filters, setFilters, setFilteredData // Exporting these for the Dashboard
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}

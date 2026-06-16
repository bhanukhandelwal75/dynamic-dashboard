import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';

// ── Icons ─────────────────────────────────────────────────────────────────────
const UploadCloud = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const CheckCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);
const AlertCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
const Percent = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);
const Play = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const Download = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const Terminal = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
);
const Users = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const Settings = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const RotateCcw = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>
);
const X = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const Maximize2 = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
);
const Minimize2 = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
);
const Trash2 = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
);
const FileJson = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>
);
const UploadIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const SHEETS = { DASHBOARD: "Dashboard", RAW: "Raw", SAMPLING: "Sampling", SUMMARY: "Checklist Summary", METADATA: "Run Metadata" };
const LS_KEY = "qc_checklist_config_v4";
const DEFAULT_CHECKLIST = [
  { param: "MID",                         aliases: ["mid", "merchant id", "merchant_id", "pgmid"],                tooltip: "Merchant ID (MID) was mentioned." },
  { param: "Business Name",               aliases: ["business name", "legal name", "entity name"],                tooltip: "Business / entity name was mentioned." },
  { param: "Account Status",              aliases: ["account status", "acc status", "status"],                    tooltip: "Account status was mentioned." },
  { param: "Onboarding Date",             aliases: ["onboarding date", "onboarding", "onboarded", "onboard date"], tooltip: "Merchant onboarding date was mentioned." },
  { param: "Category and Subcategory",    aliases: ["category", "subcategory", "sub-category", "sub category"],   tooltip: "Category and/or subcategory were mentioned." },
  { param: "Merchant Type",               aliases: ["merchant type"],                                             tooltip: "Merchant type / limit tier was mentioned." },
  { param: "Business Type",               aliases: ["business type"],                                             tooltip: "Business type (offline/online) was mentioned." },
  { param: "Entity Type",                 aliases: ["entity type", "constitution"],                               tooltip: "Entity type / constitution was mentioned." },
  { param: "GSTIN",                       aliases: ["gstin", "gst", "gst no", "gst number"],                      tooltip: "GST number was mentioned." },
  { param: "PAN",                         aliases: ["business pan", "company pan", "pan"],                        tooltip: "PAN number was mentioned." },
  { param: "Risk Category",               aliases: ["risk category", "risk rating", "customer risk"],             tooltip: "Risk category / rating was mentioned." },
  { param: "Payment Method",              aliases: ["payment method", "payment mode"],                            tooltip: "Payment method (UPI / Multiple / etc.) was mentioned." },
  { param: "Shop Photo",                  aliases: ["shop photo", "shop image", "shop pic"],                      tooltip: "Shop photo availability was mentioned." },
  { param: "Documents",                   aliases: ["documents", "document", "docs"],                             tooltip: "Documents availability was mentioned." },
  { param: "LEA Checks",                  aliases: ["lea notice", "lea", "law enforcement"],                      tooltip: "LEA (Law Enforcement Agency) notice / checks." },
  { param: "FIU Alerts",                  aliases: ["fiu alerts", "fiu alert", "fiu"],                            tooltip: "FIU (Financial Intelligence Unit) alerts." },
  { param: "Previous STR Filled",         aliases: ["previous str", "str filled", "str filed", "str"],            tooltip: "Previous STR (Suspicious Transaction Report) status." },
  { param: "Public Domain",               aliases: ["public domain"],                                             tooltip: "Public domain / adverse media check." },
  { param: "Physical/Online Business",    aliases: ["physical/online business", "physical business", "online business", "physical/online", "physical merchant", "online merchant"], tooltip: "Physical vs online business nature." },
  { param: "Alerted transaction details", aliases: ["alert trigger", "alert(s) triggered", "alerts triggered", "alert triggered", "rules triggered", "rule triggered", "rule(s) triggered", "transaction value", "transaction period"], tooltip: "Alert/rule that triggered the case + transaction value & period." },
  { param: "Comments adequately inputed", aliases: ["conclusion"],                                                tooltip: "Comment ≥ 200 chars AND contains a 'Conclusion' block." },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const yieldThread    = () => new Promise(r => setTimeout(r, 20));
const cloneChecklist = (cfg) => cfg.map(r => ({ ...r, aliases: [...r.aliases], tooltip: r.tooltip || "" }));
const escapeRegex    = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const aliasMatch = (text, alias) => {
  const esc      = escapeRegex(alias.toLowerCase());
  const trailing = /\w$/.test(alias) ? "\\b" : "";
  try { return new RegExp("\\b" + esc + trailing, "i").test(text); }
  catch (e) { return text.includes(alias.toLowerCase()); }
};

// ── ChecklistConfigEditor ─────────────────────────────────────────────────────
function ChecklistConfigEditor({ config, onChange, disabled }) {
  const [aliasInputs, setAliasInputs] = useState({});
  const [bulkInputs,  setBulkInputs]  = useState({});
  const [showBulk,    setShowBulk]    = useState({});

  const setInput  = (param, val) => setAliasInputs(prev => ({ ...prev, [param]: val }));
  const setBInput = (param, val) => setBulkInputs(prev => ({ ...prev, [param]: val }));

  const addAlias = (param, paramIdx) => {
    const raw = (aliasInputs[param] || "").trim().toLowerCase();
    if (!raw || config[paramIdx].aliases.includes(raw)) { setInput(param, ""); return; }
    onChange(config.map((item, i) => i === paramIdx ? { ...item, aliases: [...item.aliases, raw] } : item));
    setInput(param, "");
  };

  const addBulkAliases = (param, paramIdx) => {
    const newAliases = (bulkInputs[param] || "").split(/[,\n]/).map(s => s.trim().toLowerCase()).filter(s => s && !config[paramIdx].aliases.includes(s));
    if (!newAliases.length) return;
    onChange(config.map((item, i) => i === paramIdx ? { ...item, aliases: [...item.aliases, ...newAliases] } : item));
    setBInput(param, "");
    setShowBulk(prev => ({ ...prev, [param]: false }));
  };

  const removeAlias  = (paramIdx, aliasIdx) => onChange(config.map((item, i) => i === paramIdx ? { ...item, aliases: item.aliases.filter((_, ai) => ai !== aliasIdx) } : item));
  const removeParam  = (paramIdx) => onChange(config.filter((_, i) => i !== paramIdx));
  const handleKeyDown = (e, param, paramIdx) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAlias(param, paramIdx); } };

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {config.map((item, paramIdx) => (
        <div key={item.param} className="flex items-start gap-2 sm:gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="w-32 sm:w-48 shrink-0 pt-0.5" title={item.tooltip || item.param}>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide leading-tight cursor-help select-none">{item.param}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 items-center min-h-6">
              {item.aliases.map((alias, aliasIdx) => (
                <span key={aliasIdx} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {alias}
                  <button onClick={() => removeAlias(paramIdx, aliasIdx)} className="hover:text-red-500 transition-colors ml-0.5"><X size={10} /></button>
                </span>
              ))}
              <input type="text" placeholder="+ alias…" value={aliasInputs[item.param] || ""} onChange={e => setInput(item.param, e.target.value)} onKeyDown={e => handleKeyDown(e, item.param, paramIdx)} onBlur={() => addAlias(item.param, paramIdx)}
                className="text-xs border-0 border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 bg-transparent px-1 py-0.5 w-20 text-slate-500 placeholder-slate-400" />
              <button onClick={() => setShowBulk(prev => ({ ...prev, [item.param]: !prev[item.param] }))} className="text-xs text-slate-400 hover:text-blue-500 transition-colors px-1 leading-none" title="Bulk-add aliases">⊕ bulk</button>
            </div>
            {showBulk[item.param] && (
              <div className="mt-2 flex gap-2">
                <textarea rows={2} placeholder="Paste aliases, comma or newline separated…" value={bulkInputs[item.param] || ""} onChange={e => setBInput(item.param, e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-blue-400 resize-none" />
                <button onClick={() => addBulkAliases(item.param, paramIdx)} className="text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 self-start mt-0.5 shrink-0">Add</button>
              </div>
            )}
          </div>
          <button onClick={() => removeParam(paramIdx)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5" title="Remove parameter"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ── FileUploader ──────────────────────────────────────────────────────────────
function FileUploader({ title, file, setFile, accept, disabled }) {
  const [fileError, setFileError] = useState(null);
  const inputId = `qc-file-${title.replace(/\s+/g, '-')}`;

  const handleFile = (f) => {
    setFileError(null);
    if (!f) return;
    if (f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.name.endsWith(".csv")) {
      setFile(f);
    } else {
      setFileError("Invalid file type. Please upload .xlsx, .xls, or .csv.");
    }
  };

  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    const inp = document.getElementById(inputId);
    if (inp) inp.value = "";
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${fileError ? "border-red-400 bg-red-50" : file ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"}`}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); if (!disabled) handleFile(e.dataTransfer?.files[0]); }}
      onClick={() => !disabled && !file && document.getElementById(inputId).click()}
    >
      <input id={inputId} type="file" className="hidden" accept={accept} disabled={disabled} onChange={e => handleFile(e.target.files[0])} />
      {fileError ? (
        <div className="flex flex-col items-center space-y-2 text-red-500">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">{fileError}</p>
          <button onClick={e => { e.stopPropagation(); setFileError(null); }} className="text-xs text-red-400 underline">Dismiss</button>
        </div>
      ) : file ? (
        <div className="flex flex-col items-center space-y-1.5 text-green-600">
          <CheckCircle size={32} />
          <p className="font-semibold text-sm truncate w-full px-4">{file.name}</p>
          <p className="text-xs opacity-70">{formatSize(file.size)} · Ready to process</p>
          <button onClick={removeFile} className="mt-1 text-xs border border-green-300 hover:border-red-400 hover:text-red-500 rounded-full px-3 py-0.5 transition-colors">× Remove</button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 text-slate-500">
          <UploadCloud size={32} />
          <p className="font-medium text-sm">Drop {title} here</p>
          <p className="text-xs">or click to browse</p>
        </div>
      )}
    </div>
  );
}

// ── Main QC Analyzer Component ────────────────────────────────────────────────
export default function QCChecklistAnalyzer() {
  const [mode, setMode] = useState("raw");

  // Raw mode
  const [cdrFile,    setCdrFile]    = useState(null);
  const [ncFile,     setNcFile]     = useState(null);
  const [percentage, setPercentage] = useState(10);

  // Sampling mode
  const [samplingFile, setSamplingFile] = useState(null);

  // Checklist config — persisted to localStorage
  const [checklistConfig, setChecklistConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }
    return cloneChecklist(DEFAULT_CHECKLIST);
  });

  // Processing state
  const [isProcessing,   setIsProcessing]   = useState(false);
  const [progress,       setProgress]       = useState(0);
  const [currentStep,    setCurrentStep]    = useState("");
  const [logs,           setLogs]           = useState([]);
  const [logExpanded,    setLogExpanded]    = useState(false);
  const [error,          setError]          = useState(null);
  const [results,        setResults]        = useState(null);
  const [matchRateWarning,   setMatchRateWarning]   = useState(null);
  const [emptyCommentsCount, setEmptyCommentsCount] = useState(0);

  const logEndRef      = useRef(null);
  const processDataRef = useRef(null);
  const importInputRef = useRef(null);

  const canRun = mode === "raw" ? (!!cdrFile && !!ncFile) : !!samplingFile;
  const canClear = !isProcessing && (cdrFile || ncFile || samplingFile || results || error);

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(checklistConfig)); } catch (e) { /* ignore */ }
  }, [checklistConfig]);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); processDataRef.current?.(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setCurrentStep(msg);
  };

  const switchMode = (m) => { setMode(m); setError(null); setResults(null); setLogs([]); setProgress(0); setMatchRateWarning(null); setEmptyCommentsCount(0); };

  const resetAll = () => { setCdrFile(null); setNcFile(null); setSamplingFile(null); setError(null); setResults(null); setLogs([]); setProgress(0); setMatchRateWarning(null); setEmptyCommentsCount(0); };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(checklistConfig, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "qc_checklist_config.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed) && parsed.every(r => r.param && Array.isArray(r.aliases))) {
          setChecklistConfig(parsed);
        } else { setError("Invalid config file: expected array of {param, aliases} objects."); }
      } catch (err) { setError("Failed to parse config JSON: " + err.message); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── File Reading ─────────────────────────────────────────────────────────────
  const readExcelFile = async (file, fileName) => {
    addLog(`Reading file: ${fileName}...`);
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    await yieldThread();
    addLog(`Parsing ${fileName} workbook structures...`);
    const workbook = XLSX.read(data, { type: "array" });
    let combinedData = [];
    addLog(`Extracting rows from ${workbook.SheetNames.length} sheet(s) in ${fileName}...`);
    await yieldThread();
    workbook.SheetNames.forEach(sheetName => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 5, defval: "" });
      combinedData = combinedData.concat(rows);
    });
    addLog(`Normalizing ${combinedData.length} total rows from ${fileName}...`);
    await yieldThread();
    const normalized = [];
    const batchSize  = 15000;
    for (let i = 0; i < combinedData.length; i++) {
      const row = combinedData[i]; let isEmpty = true; const newRow = {};
      for (const key in row) {
        if (key.trim() === "") continue;
        const val = row[key]; if (val === "" || val === null) continue;
        isEmpty = false; newRow[key.replace(/\n/g, "").trim().toLowerCase()] = val;
      }
      if (!isEmpty && newRow.case_id !== undefined && String(newRow.case_id).trim() !== "") normalized.push(newRow);
      if (i > 0 && i % batchSize === 0) { addLog(`Normalized ${i} / ${combinedData.length} rows...`); await yieldThread(); }
    }
    addLog(`Successfully extracted ${normalized.length} valid cases from ${fileName}.`);
    return normalized;
  };

  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  // ── Checklist Runner ──────────────────────────────────────────────────────────
  const stripHtml = (text) => text.replace(/<[^>]+>/g, " ");

  const runChecklist = (rows, config) => {
    let emptyCount = 0;
    const checkedRows = rows.map(row => {
      const rawComment = String(row.__comment || row.Comments || row.comments || "");
      const text = stripHtml(rawComment).toLowerCase();
      if (!rawComment.trim()) emptyCount++;
      let yCount = 0; const missing = []; const updated = { ...row };
      for (const { param, aliases } of config) {
        let hit;
        if (param === "Comments adequately inputed") {
          hit = text.length >= 200 && /\bconclusion\b/i.test(text);
        } else {
          hit = aliases.some(a => aliasMatch(text, a));
        }
        updated[param] = hit ? "Y" : "N";
        if (hit) yCount++; else missing.push(param);
      }
      updated["Checklist Score"] = `${yCount}/${config.length}`;
      updated["Missing Fields"]  = missing.join(", ");
      return updated;
    });
    return { rows: checkedRows, emptyCount };
  };

  // ── Summary Builder ───────────────────────────────────────────────────────────
  const buildSummary = (rows, config) => {
    const grouped = {};
    rows.forEach(row => {
      const name = String(row.user_name || row.Name || "Unknown").trim();
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(row);
    });
    const n = config.length;
    return Object.keys(grouped).map(name => {
      const cases = grouped[name]; const total = cases.length;
      const totalYs = cases.reduce((sum, r) => {
        const parts = String(r["Checklist Score"] || "0/0").split("/");
        return sum + (parseInt(parts[0]) || 0);
      }, 0);
      const avgPct = total > 0 ? ((totalYs / (total * n)) * 100).toFixed(1) : "0.0";
      const paramStats = {};
      config.forEach(({ param }) => {
        const yc = cases.filter(r => r[param] === "Y").length;
        paramStats[`${param} %`] = total > 0 ? `${Math.round((yc / total) * 100)}%` : "0%";
      });
      const lvlCounts = {};
      cases.forEach(r => {
        const raw = String(r.investigation_level || r.workflow_status || "").toUpperCase();
        const bucket = raw.includes("L3") ? "L3" : raw.includes("L2") ? "L2" : raw.includes("L1") ? "L1" : "Other";
        lvlCounts[bucket] = (lvlCounts[bucket] || 0) + 1;
      });
      const levelBreakdown = ["L1","L2","L3","Other"].filter(l => lvlCounts[l]).map(l => `${l}:${lvlCounts[l]}`).join(", ") || "—";
      return { "Analyst Name": name, "Total Sampled": total, "Level Breakdown": levelBreakdown, "Avg Score": `${avgPct}%`, ...paramStats, "Score (Y/Total)": `${totalYs}/${total * n}` };
    }).sort((a, b) => parseFloat(a["Avg Score"]) - parseFloat(b["Avg Score"]));
  };

  // ── Mode A — Raw Reports ──────────────────────────────────────────────────────
  const processRawMode = async () => {
    addLog("Starting Automated QC Data Extraction..."); setProgress(5); await yieldThread();
    const cdrRows = await readExcelFile(cdrFile, "CDR Report"); setProgress(30); await yieldThread();
    const ncRows  = await readExcelFile(ncFile,  "Name & Comment Report"); setProgress(55); await yieldThread();
    addLog("Grouping combined data by Case ID...");
    const combinedDataMap = new Map();
    cdrRows.forEach(row => { const id = row.case_id ? String(row.case_id).trim() : null; if (id) combinedDataMap.set(id, { cdrRow: row, ncRow: {} }); });
    ncRows.forEach(row => {
      const id = row.case_id ? String(row.case_id).trim() : null;
      if (id) { if (combinedDataMap.has(id)) { combinedDataMap.get(id).ncRow = row; } else { combinedDataMap.set(id, { cdrRow: {}, ncRow: row }); } }
    });
    addLog("Applying extraction rules and resolving analyst names..."); await yieldThread();
    const rawReport = []; let sNo = 1;
    for (const [caseIdStr, { cdrRow, ncRow }] of combinedDataMap.entries()) {
      const workflowStatus = cdrRow.workflow_status || ncRow.investigation_level || ncRow.workflow_status || "";
      const rawComments    = ncRow.comments || cdrRow.comments || "";
      let   finalName      = ncRow.user_name || cdrRow.assigned_to || "Unassigned";
      if (rawComments) {
        const parts = String(rawComments).split("%%");
        const targetPart = (workflowStatus.includes("L2") || workflowStatus.includes("L3")) ? parts[parts.length - 1].trim() : parts[0].trim();
        const colonIdx = targetPart.indexOf(":");
        if (colonIdx > 0 && colonIdx < 50) { const potentialName = targetPart.substring(0, colonIdx).trim(); if (potentialName.length > 0 && !potentialName.includes("<")) finalName = potentialName; }
      }
      if (!finalName || finalName.trim() === "") finalName = "Unassigned";
      rawReport.push({ "S. No": sNo++, "workflow_sub_status": cdrRow.workflow_sub_status || ncRow.case_sub_status || "", "workflow_status": workflowStatus, "last_acitivity_date": cdrRow.last_acitivity_date || ncRow.last_action_date || "", "disposition_status": cdrRow.disposition_status || ncRow.disposition_status || "", "customer_id": cdrRow.customer_id || ncRow.customer_id || "", "customer_branch": cdrRow.customer_branch || "", "created_date": cdrRow.created_date || ncRow.created_date || "", "case_id": caseIdStr, "Name": finalName, "Comments": rawComments });
    }
    setProgress(70); addLog(`Built Raw DB with ${rawReport.length} cases. Sampling at ${percentage}%...`); await yieldThread();
    const groupedByName = {};
    rawReport.forEach(row => { const name = row.Name || "Unknown"; if (!groupedByName[name]) groupedByName[name] = []; groupedByName[name].push(row); });
    const samplingReport = []; const dashReport = [];
    Object.keys(groupedByName).forEach(name => {
      const cases = groupedByName[name]; const total = cases.length;
      const sampleSize = Math.max(1, Math.ceil(total * (percentage / 100)));
      const sampled = shuffleArray(cases).slice(0, sampleSize);
      sampled.forEach(sRow => {
        samplingReport.push({ "case_id": sRow.case_id, "user_name": sRow.Name, "last_action_date": sRow.last_acitivity_date, "investigation_level": sRow.workflow_status, "disposition_status": sRow.disposition_status, "customer_id": sRow.customer_id, "created_date": sRow.created_date, "Checked by": "", "QC Status": "", "QC Remarks": "", "Closed within TAT": "", "LEA Checks": "", "Comments adequately inputed": "", "MID": "", "Business Name": "", "Account Status": "", "Category and Subcategory": "", "Entity Type": "", "GSTIN": "", "PAN": "", "Alerted transaction details": "", "Risk Category": "", "QC Checker Comments": "", "Recommendation": "", "__comment": sRow.Comments });
      });
      dashReport.push({ "Analyst Name": name, "Total Cases Processed": total, "Cases Sampled": sampled.length });
    });
    setProgress(80); addLog(`Sampled ${samplingReport.length} cases. Running checklist...`); await yieldThread();
    const { rows: checkedRows, emptyCount } = runChecklist(samplingReport, checklistConfig);
    checkedRows.forEach(r => delete r.__comment);
    setEmptyCommentsCount(emptyCount);
    const summaryRows = buildSummary(checkedRows, checklistConfig);
    setProgress(95); addLog("Finalizing datasets and rendering UI..."); await yieldThread();
    setResults({ mode: "raw", checkedRows, summaryRows, rawReport, dashReport });
    setProgress(100); addLog("Processing complete! Your Checklist Report is ready.");
    setTimeout(() => setIsProcessing(false), 500);
  };

  // ── Mode B — Pre-built Sampling ───────────────────────────────────────────────
  const processSamplingMode = async () => {
    addLog("Reading pre-built QC Sampling Report..."); setProgress(10); await yieldThread();
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(samplingFile);
    });
    const workbook = XLSX.read(data, { type: "array" });
    addLog(`Found sheets: ${workbook.SheetNames.join(", ")}`); setProgress(20); await yieldThread();
    const sampSheetName = workbook.SheetNames.find(s => s.trim().toLowerCase() === "sampling");
    if (!sampSheetName) throw new Error(`No sheet named "Sampling" found. Sheets present: ${workbook.SheetNames.join(", ")}`);
    const sampSheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sampSheetName], { defval: "" });
    addLog(`Found ${sampSheetData.length} rows in Sampling sheet.`); setProgress(35); await yieldThread();
    let sampCommentKey = null;
    if (sampSheetData.length > 0) {
      for (const k of Object.keys(sampSheetData[0])) { const kl = k.toLowerCase().trim(); if (kl === "comments" || kl === "comment") { sampCommentKey = k; break; } }
    }
    if (sampCommentKey) {
      addLog(`Sampling sheet has "${sampCommentKey}" column — using it directly.`);
      sampSheetData.forEach(row => { row.__comment = String(row[sampCommentKey] || ""); });
      setProgress(70);
    } else {
      addLog("No Comments column in Sampling sheet — looking for Raw sheet to join comments..."); setProgress(40); await yieldThread();
      const rawSheetName = workbook.SheetNames.find(s => s.trim().toLowerCase() === "raw");
      if (!rawSheetName) throw new Error('No "Raw" sheet found and the Sampling sheet has no Comments column.');
      const rawSheetData = XLSX.utils.sheet_to_json(workbook.Sheets[rawSheetName], { defval: "" });
      addLog(`Found ${rawSheetData.length} rows in Raw sheet.`); setProgress(55); await yieldThread();
      const commentMap = new Map();
      rawSheetData.forEach(row => {
        for (const k of Object.keys(row)) {
          if (k.toLowerCase().replace(/[_\s]/g,"") === "caseid") { commentMap.set(String(row[k]).trim(), String(row.Comments || row.comments || "")); break; }
        }
      });
      let matched = 0;
      sampSheetData.forEach(row => {
        let caseId = null;
        for (const k of Object.keys(row)) { if (k.toLowerCase().replace(/[_\s]/g,"") === "caseid") { caseId = String(row[k]).trim(); break; } }
        const comment = caseId ? (commentMap.get(caseId) || "") : "";
        row.__comment = comment;
        if (comment) matched++;
      });
      const matchRate = sampSheetData.length > 0 ? Math.round((matched / sampSheetData.length) * 100) : 0;
      if (matchRate < 50) setMatchRateWarning(`Low comment match rate: only ${matched}/${sampSheetData.length} (${matchRate}%) Sampling rows found matching comments in Raw sheet.`);
      addLog(`Joined ${matched}/${sampSheetData.length} comments from Raw sheet (${matchRate}% match rate).`);
      setProgress(70);
    }
    addLog("Running checklist on sampled rows..."); await yieldThread();
    const { rows: checkedRows, emptyCount } = runChecklist(sampSheetData, checklistConfig);
    checkedRows.forEach(r => delete r.__comment);
    setEmptyCommentsCount(emptyCount);
    const summaryRows = buildSummary(checkedRows, checklistConfig);
    setProgress(90); addLog("Finalizing..."); await yieldThread();
    setResults({ mode: "sampling", checkedRows, summaryRows });
    setProgress(100); addLog("Processing complete! Your Checklist Report is ready.");
    setTimeout(() => setIsProcessing(false), 500);
  };

  // ── Process Entry ─────────────────────────────────────────────────────────────
  const processData = async () => {
    setIsProcessing(true); setError(null); setResults(null); setLogs([]); setProgress(0); setMatchRateWarning(null); setEmptyCommentsCount(0);
    try {
      if (mode === "raw") await processRawMode(); else await processSamplingMode();
    } catch (err) {
      console.error(err);
      setError(String(err?.message || err));
      setIsProcessing(false);
    }
  };
  processDataRef.current = processData;

  // ── Download Excel ────────────────────────────────────────────────────────────
  const downloadExcel = () => {
    if (!results) return;
    const wb = XLSX.utils.book_new();
    const BORDER_THIN = { top: { style:"thin",color:{rgb:"000000"} }, bottom: { style:"thin",color:{rgb:"000000"} }, left: { style:"thin",color:{rgb:"000000"} }, right: { style:"thin",color:{rgb:"000000"} } };
    const GREEN_BG = { fgColor: { rgb: "C6EFCE" } };
    const RED_BG   = { fgColor: { rgb: "FFC7CE" } };
    const AMBER_BG = { fgColor: { rgb: "FFEB9C" } };

    const applyStandardStyling = (ws, colWidths, headerColorHex) => {
      ws["!cols"] = colWidths;
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r:R, c:C });
          if (!ws[cellRef]) continue;
          if (R === 0) { ws[cellRef].s = { fill: { fgColor: { rgb: headerColorHex } }, font: { color: { rgb:"FFFFFF" }, bold:true }, alignment: { horizontal:"center", vertical:"center", wrapText:true }, border: BORDER_THIN }; }
          else { ws[cellRef].s = { alignment: { vertical:"top", wrapText:false } }; }
        }
      }
    };

    if (results.mode === "raw" && results.dashReport) {
      const { dashReport } = results;
      const totalCases   = dashReport.reduce((s,r) => s+(r["Total Cases Processed"]||0), 0);
      const totalSampled = dashReport.reduce((s,r) => s+(r["Cases Sampled"]||0), 0);
      const aoa = [[], [], [null,"Overall Summary"], [null,"Total Cases Processed",totalCases], [null,"Cases Sampled",totalSampled], [null,"Sampling %",`${percentage}%`], [], [null,"Analyst-wise Summary"], [null,"Analyst Name","Total Cases Processed","Cases Sampled","Sample %"]];
      dashReport.forEach(row => { const pct = row["Total Cases Processed"]>0?`${Math.round((row["Cases Sampled"]/row["Total Cases Processed"])*100)}%`:"0%"; aoa.push([null,row["Analyst Name"],row["Total Cases Processed"],row["Cases Sampled"],pct]); });
      const wsDash = XLSX.utils.aoa_to_sheet(aoa);
      wsDash["!cols"] = [{wch:5},{wch:32},{wch:25},{wch:18},{wch:12}];
      XLSX.utils.book_append_sheet(wb, wsDash, SHEETS.DASHBOARD);
    }

    if (results.mode === "raw" && results.rawReport) {
      const wsRaw = XLSX.utils.json_to_sheet(results.rawReport);
      applyStandardStyling(wsRaw, [{wch:8},{wch:20},{wch:15},{wch:20},{wch:18},{wch:18},{wch:15},{wch:20},{wch:18},{wch:25},{wch:60}], "000000");
      XLSX.utils.book_append_sheet(wb, wsRaw, SHEETS.RAW);
    }

    const wsSamp = XLSX.utils.json_to_sheet(results.checkedRows);
    const sampKeys = results.checkedRows.length ? Object.keys(results.checkedRows[0]) : [];
    const SAMP_WIDTHS = { "case_id":18,"user_name":25,"last_action_date":20,"investigation_level":18,"disposition_status":18,"customer_id":22,"created_date":18,"Checked by":18,"QC Status":20,"QC Remarks":25,"Closed within TAT":20,"Category and Subcategory":28,"Alerted transaction details":30,"Physical/Online Business":30,"QC Checker Comments":25,"Recommendation":20,"Checklist Score":18,"Missing Fields":60 };
    applyStandardStyling(wsSamp, sampKeys.map(k => ({ wch: SAMP_WIDTHS[k]||20 })), "E26B0A");
    const sampRange = XLSX.utils.decode_range(wsSamp["!ref"]);
    const headerColMap = {};
    for (let C = sampRange.s.c; C <= sampRange.e.c; ++C) { const hRef = XLSX.utils.encode_cell({r:0,c:C}); if (wsSamp[hRef]?.v) headerColMap[String(wsSamp[hRef].v)] = C; }
    const checklistParamSet = new Set(checklistConfig.map(r => r.param));
    for (let R = 1; R <= sampRange.e.r; ++R) {
      for (const [colName, C] of Object.entries(headerColMap)) {
        if (!checklistParamSet.has(colName)) continue;
        const cellRef = XLSX.utils.encode_cell({r:R,c:C});
        if (!wsSamp[cellRef]) continue;
        const val = String(wsSamp[cellRef].v||"").toUpperCase();
        if (val==="Y") wsSamp[cellRef].s = { fill:GREEN_BG, font:{bold:true,color:{rgb:"276221"}}, alignment:{horizontal:"center",vertical:"top"}, border:BORDER_THIN };
        else if (val==="N") wsSamp[cellRef].s = { fill:RED_BG, font:{bold:true,color:{rgb:"9C0006"}}, alignment:{horizontal:"center",vertical:"top"}, border:BORDER_THIN };
      }
      const scoreC = headerColMap["Checklist Score"];
      if (scoreC !== undefined) {
        const cr = XLSX.utils.encode_cell({r:R,c:scoreC});
        if (wsSamp[cr]) {
          const parts = String(wsSamp[cr].v||"0/0").split("/"); const num=parseInt(parts[0])||0; const den=parseInt(parts[1])||1; const pct=(num/den)*100;
          const fillBg = pct>=90?GREEN_BG:pct>=70?AMBER_BG:RED_BG;
          wsSamp[cr].s = { fill:fillBg, font:{bold:true}, alignment:{horizontal:"center",vertical:"top"}, border:BORDER_THIN };
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, wsSamp, SHEETS.SAMPLING);

    if (results.summaryRows?.length > 0) {
      const wsSum = XLSX.utils.json_to_sheet(results.summaryRows);
      applyStandardStyling(wsSum, [{wch:28},{wch:16},{wch:22},{wch:14},...checklistConfig.map(()=>({wch:20})),{wch:20}], "1F497D");
      XLSX.utils.book_append_sheet(wb, wsSum, SHEETS.SUMMARY);
    }

    const metaAoa = [["Run Metadata",""],[], ["Run Date",new Date().toLocaleString()], ["Mode",results.mode==="raw"?"Mode A — Raw Reports":"Mode B — Sampling Report"], ["Sampling %",results.mode==="raw"?`${percentage}%`:"N/A"], ["Cases Analyzed",results.checkedRows.length], ["Analysts Found",results.summaryRows.length], ["Parameters Checked",checklistConfig.length], results.mode==="raw"?["CDR File",cdrFile?.name||""]:["Input File",samplingFile?.name||""], results.mode==="raw"?["NC File",ncFile?.name||""]:["",""], [], ["Parameter Configuration","Aliases"], ...checklistConfig.map(({param,aliases})=>[param,aliases.join(", ")])];
    const wsMeta = XLSX.utils.aoa_to_sheet(metaAoa);
    wsMeta["!cols"] = [{wch:28},{wch:80}];
    XLSX.utils.book_append_sheet(wb, wsMeta, SHEETS.METADATA);
    XLSX.writeFile(wb, `QC_Checklist_Report_${new Date().toISOString().split("T")[0]}.xlsx`, { compression: true });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">AML QC Checklist Analyzer</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm">Automatically scan analyst comments for required parameters. Upload raw reports or a pre-built sampling file.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start space-x-3 text-sm font-medium border border-red-100">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0"><X size={16} /></button>
            </div>
          )}

          {/* Match-rate Warning */}
          {matchRateWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1">{matchRateWarning}</span>
              <button onClick={() => setMatchRateWarning(null)} className="text-amber-400 hover:text-amber-600 shrink-0"><X size={14} /></button>
            </div>
          )}

          {/* Mode Switcher + Clear */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Input Mode</p>
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1 max-w-xs">
                {["raw", "sampling"].map(m => (
                  <button key={m} onClick={() => switchMode(m)} disabled={isProcessing}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all capitalize disabled:opacity-50 ${mode === m ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {m === "raw" ? "Raw Reports" : "Sampling Report"}
                  </button>
                ))}
              </div>
            </div>
            {canClear && (
              <button onClick={resetAll} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors">
                <Trash2 size={12} /><span>Clear All</span>
              </button>
            )}
          </div>

          {/* File Inputs */}
          {mode === "raw" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploader title="CDR Report"            file={cdrFile}      setFile={setCdrFile}      accept=".xlsx,.xls,.csv" disabled={isProcessing} />
              <FileUploader title="Name & Comment Report" file={ncFile}        setFile={setNcFile}       accept=".xlsx,.xls,.csv" disabled={isProcessing} />
            </div>
          ) : (
            <div className="max-w-sm space-y-1">
              <FileUploader title="QC Sampling Report"    file={samplingFile}  setFile={setSamplingFile} accept=".xlsx,.xls"      disabled={isProcessing} />
              <p className="text-xs text-slate-400 mt-1 text-center">Requires "Sampling" sheet; "Raw" sheet needed if Comments column is absent</p>
            </div>
          )}

          {/* Sampling % */}
          {mode === "raw" && (
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Percent size={20} /></div>
              <div className="flex flex-col flex-grow">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sampling Target</label>
                <div className="flex items-center space-x-3">
                  <input type="range" min="1" max="100" value={percentage} onChange={e => setPercentage(Number(e.target.value))} disabled={isProcessing} className="w-32 md:w-48 accent-blue-600 disabled:opacity-50" />
                  <span className="font-bold text-lg w-12">{percentage}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <div className="bg-violet-100 p-1.5 rounded-lg text-violet-600"><Settings size={16} /></div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Checklist Parameters</h3>
                  <p className="text-xs text-slate-400">Enter/comma to add alias · Hover param name for description</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importConfig} />
                <button onClick={() => importInputRef.current?.click()} disabled={isProcessing} className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40">
                  <UploadIcon size={12} /><span>Import</span>
                </button>
                <button onClick={exportConfig} disabled={isProcessing} className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40">
                  <FileJson size={12} /><span>Export</span>
                </button>
                <button onClick={() => setChecklistConfig(cloneChecklist(DEFAULT_CHECKLIST))} disabled={isProcessing} className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40">
                  <RotateCcw size={12} /><span>Reset</span>
                </button>
              </div>
            </div>
            <ChecklistConfigEditor config={checklistConfig} onChange={setChecklistConfig} disabled={isProcessing} />
          </div>

          {/* Run Button */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 hidden sm:block">{canRun ? "⌘ Enter to run" : "Upload files to enable"}</p>
            <button onClick={processData} disabled={isProcessing || !canRun}
              className={`px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-sm ${isProcessing || !canRun ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"}`}>
              {isProcessing ? (
                <><div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div><span>Processing…</span></>
              ) : (
                <><Play size={18} /><span>Run Checklist</span></>
              )}
            </button>
          </div>

          {/* Progress + Log Console */}
          {(isProcessing || logs.length > 0) && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                <span className="truncate pr-4">{currentStep}</span>
                <span className="shrink-0">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner overflow-hidden">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
                <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal size={14} /><span>Execution Log</span><span className="text-slate-500">({logs.length} lines)</span>
                  </div>
                  <button onClick={() => setLogExpanded(x => !x)} className="text-slate-500 hover:text-slate-200 transition-colors">
                    {logExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
                <div className={`p-4 overflow-y-auto text-green-400 font-mono text-xs space-y-0.5 transition-all duration-300 ${logExpanded ? "h-96" : "h-48"}`}>
                  {logs.map((log, idx) => <div key={idx} className="opacity-90 leading-relaxed">{log}</div>)}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        {results && !isProcessing && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Users size={24} className="text-blue-600" />
                  <span className="text-slate-800">Checklist Results</span>
                </h2>
                <p className="text-sm text-slate-500">
                  Scanned <span className="font-semibold text-blue-600">{results.checkedRows.length}</span> cases across <span className="font-semibold text-blue-600">{results.summaryRows.length}</span> analysts · {checklistConfig.length} parameters
                </p>
                {emptyCommentsCount > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full inline-block px-3 py-0.5">
                    ⚠ {emptyCommentsCount} case{emptyCommentsCount !== 1 ? "s" : ""} had empty comments (all N)
                  </p>
                )}
              </div>
              <button onClick={downloadExcel} className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 shrink-0">
                <Download size={20} /><span>Download Report</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 whitespace-nowrap">Analyst Name</th>
                    <th className="px-5 py-4 text-center whitespace-nowrap">Cases</th>
                    <th className="px-5 py-4 text-center whitespace-nowrap">Levels</th>
                    <th className="px-5 py-4 text-center whitespace-nowrap">Avg Score</th>
                    <th className="px-5 py-4 whitespace-nowrap">Weakest Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.summaryRows.map((row, idx) => {
                    const score      = parseFloat(row["Avg Score"]) || 0;
                    const scoreColor = score >= 90 ? "text-green-600 bg-green-50" : score >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
                    const weakParams = checklistConfig.map(({ param }) => ({ param, pct: parseInt(row[`${param} %`] || "0") })).filter(p => p.pct < 100).sort((a, b) => a.pct - b.pct).slice(0, 3).map(p => `${p.param} (${p.pct}%)`).join(", ") || "—";
                    return (
                      <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50`}>
                        <td className="px-5 py-3 font-semibold text-slate-800">{row["Analyst Name"]}</td>
                        <td className="px-5 py-3 text-center text-slate-600">{row["Total Sampled"]}</td>
                        <td className="px-5 py-3 text-center text-xs text-slate-500">{row["Level Breakdown"] || "—"}</td>
                        <td className="px-5 py-3 text-center"><span className={`inline-block font-bold px-2 py-0.5 rounded-md text-sm ${scoreColor}`}>{row["Avg Score"]}</span></td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{weakParams}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 text-center">Sorted worst → best · Download for full per-case detail and Run Metadata sheet</p>
          </div>
        )}
      </div>
    </div>
  );
}
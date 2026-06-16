import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

// ── Icons ─────────────────────────────────────────────────────────────────────
const UploadCloud = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>);
const CheckCircle = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>);
const AlertCircle = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const Play = ({ size = 18 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
const Download = ({ size = 18 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const TerminalIco = ({ size = 14 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>);
const UsersIco = ({ size = 22 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const SettingsIco = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const RotateIco = ({ size = 12 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>);
const XIco = ({ size = 12 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const Max2 = ({ size = 14 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>);
const Min2 = ({ size = 14 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>);
const TrashIco = ({ size = 12 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
const JsonIco = ({ size = 12 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>);
const UpIco = ({ size = 12 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const PctIco = ({ size = 20 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>);

// ── Constants ─────────────────────────────────────────────────────────────────
const SHEETS = { DASHBOARD:"Dashboard", RAW:"Raw", SAMPLING:"Sampling", SUMMARY:"Checklist Summary", METADATA:"Run Metadata" };
const LS_KEY = "qc_checklist_config_v4";

const DEFAULT_CHECKLIST = [
  { param:"MID",                         aliases:["mid","merchant id","merchant_id","pgmid"],                 tooltip:"Merchant ID (MID) was mentioned." },
  { param:"Business Name",               aliases:["business name","legal name","entity name"],                tooltip:"Business / entity name was mentioned." },
  { param:"Account Status",              aliases:["account status","acc status","status"],                    tooltip:"Account status was mentioned." },
  { param:"Onboarding Date",             aliases:["onboarding date","onboarding","onboarded","onboard date"], tooltip:"Merchant onboarding date was mentioned." },
  { param:"Category and Subcategory",    aliases:["category","subcategory","sub-category","sub category"],    tooltip:"Category and/or subcategory were mentioned." },
  { param:"Merchant Type",               aliases:["merchant type"],                                           tooltip:"Merchant type / limit tier was mentioned." },
  { param:"Business Type",               aliases:["business type"],                                           tooltip:"Business type (offline/online) was mentioned." },
  { param:"Entity Type",                 aliases:["entity type","constitution"],                              tooltip:"Entity type / constitution was mentioned." },
  { param:"GSTIN",                       aliases:["gstin","gst","gst no","gst number"],                       tooltip:"GST number was mentioned." },
  { param:"PAN",                         aliases:["business pan","company pan","pan"],                        tooltip:"PAN number was mentioned." },
  { param:"Risk Category",               aliases:["risk category","risk rating","customer risk"],             tooltip:"Risk category / rating was mentioned." },
  { param:"Payment Method",              aliases:["payment method","payment mode"],                           tooltip:"Payment method was mentioned." },
  { param:"Shop Photo",                  aliases:["shop photo","shop image","shop pic"],                      tooltip:"Shop photo availability was mentioned." },
  { param:"Documents",                   aliases:["documents","document","docs"],                             tooltip:"Documents availability was mentioned." },
  { param:"LEA Checks",                  aliases:["lea notice","lea","law enforcement"],                      tooltip:"LEA notice / checks." },
  { param:"FIU Alerts",                  aliases:["fiu alerts","fiu alert","fiu"],                            tooltip:"FIU alerts." },
  { param:"Previous STR Filled",         aliases:["previous str","str filled","str filed","str"],             tooltip:"Previous STR status." },
  { param:"Public Domain",               aliases:["public domain"],                                           tooltip:"Public domain / adverse media check." },
  { param:"Physical/Online Business",    aliases:["physical/online business","physical business","online business","physical/online"], tooltip:"Physical vs online business nature." },
  { param:"Alerted transaction details", aliases:["alert trigger","alert(s) triggered","alerts triggered","rules triggered","transaction value","transaction period"], tooltip:"Alert/rule that triggered the case." },
  { param:"Comments adequately inputed", aliases:["conclusion"],                                              tooltip:"Comment >= 200 chars AND contains a Conclusion block." },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const yieldThread    = () => new Promise(r => setTimeout(r, 20));
const cloneChecklist = (cfg) => cfg.map(r => ({ ...r, aliases:[...r.aliases], tooltip:r.tooltip||"" }));
const escapeRegex    = (s) => s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const aliasMatch     = (text, alias) => {
  const esc=escapeRegex(alias.toLowerCase()), trailing=/\w$/.test(alias)?"\\b":"";
  try { return new RegExp("\\b"+esc+trailing,"i").test(text); } catch(e) { return text.includes(alias.toLowerCase()); }
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const QCA_CSS = `
.qca-root{padding:2rem 1.5rem;max-width:1000px;margin:0 auto;font-family:'Segoe UI',system-ui,sans-serif;}
.qca-header{text-align:center;margin-bottom:2rem;}
.qca-header h1{font-size:28px;font-weight:700;color:#0f172a;margin:0 0 6px;}
.qca-header p{font-size:13px;color:#64748b;max-width:520px;margin:0 auto;}
.qca-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:1.8rem;margin-bottom:20px;}
.qca-error{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;padding:12px 16px;border-radius:10px;display:flex;align-items:flex-start;gap:10px;font-size:13px;margin-bottom:16px;}
.qca-warning{background:#fffbeb;border:1px solid #fcd34d;color:#92400e;padding:12px 16px;border-radius:10px;display:flex;align-items:flex-start;gap:10px;font-size:13px;margin-bottom:16px;}
.qca-banner-close{background:none;border:none;cursor:pointer;margin-left:auto;opacity:.6;display:flex;align-items:center;}
.qca-banner-close:hover{opacity:1;}
.qca-mode-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px;}
.qca-mode-label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.qca-mode-group{background:#f1f5f9;border-radius:12px;padding:4px;display:flex;gap:4px;}
.qca-mode-btn{flex:1;padding:8px 16px;border-radius:9px;border:none;font-size:13px;font-weight:600;cursor:pointer;color:#64748b;background:transparent;transition:all .15s;}
.qca-mode-btn.active{background:#fff;color:#2563eb;box-shadow:0 1px 3px rgba(0,0,0,.1);}
.qca-clear-btn{display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8;background:none;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;cursor:pointer;transition:all .15s;}
.qca-clear-btn:hover{color:#ef4444;border-color:#fca5a5;}
.qca-file-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.qca-file-single{max-width:340px;margin-bottom:20px;}
.qca-dropzone{border:2px dashed #cbd5e1;border-radius:12px;padding:28px 16px;text-align:center;transition:all .15s;cursor:pointer;}
.qca-dropzone:hover{border-color:#3b82f6;background:#eff6ff;}
.qca-dropzone.qca-dz-ok{border-color:#22c55e;background:#f0fdf4;border-style:solid;cursor:default;}
.qca-dropzone.qca-dz-err{border-color:#ef4444;background:#fef2f2;border-style:solid;}
.qca-dz-inner{display:flex;flex-direction:column;align-items:center;}
.qca-dz-remove{margin-top:8px;font-size:11px;border:1px solid #86efac;border-radius:99px;padding:2px 12px;background:none;cursor:pointer;color:#166534;transition:all .15s;}
.qca-dz-remove:hover{border-color:#ef4444;color:#ef4444;}
.qca-pct-row{display:flex;align-items:center;gap:16px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:20px;}
.qca-pct-ico{background:#dbeafe;padding:8px;border-radius:8px;color:#2563eb;display:flex;}
.qca-pct-lbl{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
.qca-pct-ctrl{display:flex;align-items:center;gap:12px;}
.qca-pct-val{font-size:18px;font-weight:700;color:#0f172a;min-width:42px;}
.qca-cfg-hdr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;}
.qca-cfg-title-row{display:flex;align-items:center;gap:8px;}
.qca-cfg-ico{background:#ede9fe;padding:6px;border-radius:8px;color:#7c3aed;display:flex;}
.qca-cfg-title{font-size:14px;font-weight:600;color:#0f172a;margin:0;}
.qca-cfg-hint{font-size:11px;color:#94a3b8;margin:2px 0 0;}
.qca-cfg-btns{display:flex;gap:8px;}
.qca-cfg-btn{display:flex;align-items:center;gap:5px;font-size:11px;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;cursor:pointer;transition:all .15s;}
.qca-cfg-btn:hover{color:#7c3aed;border-color:#c4b5fd;}
.qca-cfg-btn:disabled{opacity:.4;cursor:not-allowed;}
.qca-param-row{display:flex;align-items:flex-start;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:6px;transition:border-color .15s;}
.qca-param-row:hover{border-color:#cbd5e1;}
.qca-param-lbl{width:175px;flex-shrink:0;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;padding-top:3px;cursor:help;}
.qca-param-aliases{flex:1;min-width:0;}
.qca-alias-wrap{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:24px;}
.qca-alias-tag{display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:500;padding:2px 8px;border-radius:99px;}
.qca-alias-rm{background:none;border:none;cursor:pointer;color:inherit;opacity:.6;padding:0;display:flex;line-height:1;}
.qca-alias-rm:hover{opacity:1;color:#ef4444;}
.qca-alias-inp{font-size:11px;border:0;border-bottom:1px dashed #cbd5e1;background:transparent;padding:2px 4px;width:80px;color:#64748b;outline:none;}
.qca-alias-inp:focus{border-color:#3b82f6;}
.qca-bulk-btn{font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;padding:0 4px;transition:color .15s;}
.qca-bulk-btn:hover{color:#3b82f6;}
.qca-bulk-row{display:flex;gap:8px;margin-top:8px;}
.qca-bulk-ta{flex:1;font-size:11px;border:1px solid #cbd5e1;border-radius:6px;padding:6px;outline:none;resize:none;}
.qca-bulk-ta:focus{border-color:#3b82f6;}
.qca-bulk-add{font-size:11px;background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;align-self:flex-start;}
.qca-bulk-add:hover{background:#2563eb;}
.qca-param-rm{background:none;border:none;cursor:pointer;color:#cbd5e1;flex-shrink:0;padding:0;margin-top:3px;display:flex;transition:color .15s;}
.qca-param-rm:hover{color:#ef4444;}
.qca-run-row{display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #f1f5f9;margin-top:8px;}
.qca-run-hint{font-size:11px;color:#94a3b8;}
.qca-run-btn{display:flex;align-items:center;gap:8px;padding:12px 28px;border-radius:12px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;}
.qca-run-on{background:#2563eb;color:#fff;box-shadow:0 1px 3px rgba(37,99,235,.3);}
.qca-run-on:hover{background:#1d4ed8;box-shadow:0 4px 12px rgba(37,99,235,.25);}
.qca-run-off{background:#e2e8f0;color:#94a3b8;cursor:not-allowed;border:1px solid #cbd5e1;}
.qca-spinner{width:18px;height:18px;border:2px solid #94a3b8;border-top-color:#475569;border-radius:50%;animation:qca-spin .7s linear infinite;}
@keyframes qca-spin{to{transform:rotate(360deg);}}
.qca-prog-section{padding-top:16px;border-top:1px solid #f1f5f9;margin-top:16px;}
.qca-prog-row{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;}
.qca-prog-bg{background:#e2e8f0;border-radius:99px;height:10px;overflow:hidden;}
.qca-prog-fill{background:#2563eb;height:10px;border-radius:99px;transition:width .3s ease;}
.qca-log-box{background:#0f172a;border-radius:12px;border:1px solid #1e293b;overflow:hidden;margin-top:16px;}
.qca-log-hdr{background:#1e293b;color:#94a3b8;font-size:11px;padding:8px 16px;border-bottom:1px solid #334155;display:flex;align-items:center;justify-content:space-between;}
.qca-log-hdr-l{display:flex;align-items:center;gap:8px;}
.qca-log-exp{background:none;border:none;cursor:pointer;color:#64748b;display:flex;transition:color .15s;}
.qca-log-exp:hover{color:#e2e8f0;}
.qca-log-body{padding:16px;overflow-y:auto;font-family:'Courier New',monospace;font-size:11px;color:#4ade80;line-height:1.7;}
.qca-log-sm{height:180px;}.qca-log-lg{height:360px;}
.qca-res-hdr{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:16px;border-bottom:1px solid #f1f5f9;margin-bottom:20px;flex-wrap:wrap;}
.qca-res-title{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px;}
.qca-res-sub{font-size:13px;color:#64748b;}
.qca-empty-warn{display:inline-block;font-size:11px;color:#92400e;background:#fffbeb;border:1px solid #fcd34d;border-radius:99px;padding:2px 12px;margin-top:6px;}
.qca-dl-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;}
.qca-dl-btn:hover{background:#15803d;transform:translateY(-1px);box-shadow:0 4px 12px rgba(22,163,74,.25);}
.qca-tbl-wrap{overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;}
.qca-tbl{width:100%;border-collapse:collapse;font-size:13px;}
.qca-tbl th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#475569;letter-spacing:.04em;text-transform:uppercase;background:#f8fafc;border-bottom:1px solid #e2e8f0;white-space:nowrap;}
.qca-tbl td{padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#1e293b;vertical-align:middle;}
.qca-tbl tr:last-child td{border-bottom:none;}
.qca-tbl tr:hover td{background:#f0f9ff;}
.qca-tbl tr:nth-child(even) td{background:#fafafa;}
.qca-tbl tr:nth-child(even):hover td{background:#f0f9ff;}
.qca-score{display:inline-block;font-weight:700;padding:2px 10px;border-radius:6px;font-size:13px;}
.qca-sc-g{color:#166534;background:#dcfce7;}.qca-sc-a{color:#92400e;background:#fef9c3;}.qca-sc-r{color:#991b1b;background:#fee2e2;}
.qca-tbl-foot{font-size:11px;color:#94a3b8;text-align:center;margin-top:8px;}
@media(max-width:640px){.qca-file-grid{grid-template-columns:1fr;}.qca-param-lbl{width:110px;}.qca-res-hdr{flex-direction:column;}}
`;

// ── ChecklistConfigEditor ─────────────────────────────────────────────────────
function ChecklistConfigEditor({ config, onChange, disabled }) {
  const [aliasInputs, setAliasInputs] = useState({});
  const [bulkInputs,  setBulkInputs]  = useState({});
  const [showBulk,    setShowBulk]    = useState({});

  const setInput  = (p,v) => setAliasInputs(prev => ({...prev,[p]:v}));
  const setBInput = (p,v) => setBulkInputs(prev => ({...prev,[p]:v}));

  const addAlias = (param, idx) => {
    const raw=(aliasInputs[param]||"").trim().toLowerCase();
    if(!raw||config[idx].aliases.includes(raw)){setInput(param,"");return;}
    onChange(config.map((item,i)=>i===idx?{...item,aliases:[...item.aliases,raw]}:item));
    setInput(param,"");
  };
  const addBulk = (param, idx) => {
    const news=(bulkInputs[param]||"").split(/[,\n]/).map(s=>s.trim().toLowerCase()).filter(s=>s&&!config[idx].aliases.includes(s));
    if(!news.length)return;
    onChange(config.map((item,i)=>i===idx?{...item,aliases:[...item.aliases,...news]}:item));
    setBInput(param,""); setShowBulk(prev=>({...prev,[param]:false}));
  };
  const removeAlias = (pi,ai) => onChange(config.map((item,i)=>i===pi?{...item,aliases:item.aliases.filter((_,j)=>j!==ai)}:item));
  const removeParam = (pi) => onChange(config.filter((_,i)=>i!==pi));
  const onKeyDown   = (e,p,i) => { if(e.key==="Enter"||e.key===","){e.preventDefault();addAlias(p,i);} };

  return (
    <div style={{opacity:disabled?.5:1,pointerEvents:disabled?'none':'auto'}}>
      {config.map((item,pi)=>(
        <div key={item.param} className="qca-param-row">
          <div className="qca-param-lbl" title={item.tooltip||item.param}>{item.param}</div>
          <div className="qca-param-aliases">
            <div className="qca-alias-wrap">
              {item.aliases.map((alias,ai)=>(
                <span key={ai} className="qca-alias-tag">
                  {alias}
                  <button className="qca-alias-rm" onClick={()=>removeAlias(pi,ai)}><XIco size={10}/></button>
                </span>
              ))}
              <input type="text" placeholder="+ alias…" className="qca-alias-inp"
                value={aliasInputs[item.param]||""} onChange={e=>setInput(item.param,e.target.value)}
                onKeyDown={e=>onKeyDown(e,item.param,pi)} onBlur={()=>addAlias(item.param,pi)} />
              <button className="qca-bulk-btn" onClick={()=>setShowBulk(prev=>({...prev,[item.param]:!prev[item.param]}))}>⊕ bulk</button>
            </div>
            {showBulk[item.param]&&(
              <div className="qca-bulk-row">
                <textarea rows={2} placeholder="Paste aliases, comma or newline separated…" className="qca-bulk-ta"
                  value={bulkInputs[item.param]||""} onChange={e=>setBInput(item.param,e.target.value)}/>
                <button className="qca-bulk-add" onClick={()=>addBulk(item.param,pi)}>Add</button>
              </div>
            )}
          </div>
          <button className="qca-param-rm" onClick={()=>removeParam(pi)} title="Remove parameter"><XIco size={14}/></button>
        </div>
      ))}
    </div>
  );
}

// ── FileUploader ──────────────────────────────────────────────────────────────
function FileUploader({ title, file, setFile, accept, disabled }) {
  const [fileError, setFileError] = useState(null);
  const id = `qca-${title.replace(/\s+/g,'-')}`;
  const handleFile = (f) => {
    setFileError(null); if(!f)return;
    if(f.name.match(/\.(xlsx|xls|csv)$/i)) setFile(f);
    else setFileError("Invalid file type. Please upload .xlsx, .xls, or .csv.");
  };
  const fmtSz = (b) => b<1024*1024?`${(b/1024).toFixed(0)} KB`:`${(b/1024/1024).toFixed(1)} MB`;
  const remove = (e) => { e.stopPropagation(); setFile(null); const inp=document.getElementById(id); if(inp)inp.value=""; };
  const cls = `qca-dropzone${fileError?' qca-dz-err':file?' qca-dz-ok':''}`;
  return (
    <div className={cls} style={{opacity:disabled?.5:1,cursor:disabled?'not-allowed':file?'default':'pointer'}}
      onDragOver={e=>e.preventDefault()}
      onDrop={e=>{e.preventDefault();if(!disabled)handleFile(e.dataTransfer?.files[0]);}}
      onClick={()=>!disabled&&!file&&document.getElementById(id).click()}>
      <input id={id} type="file" style={{display:'none'}} accept={accept} disabled={disabled} onChange={e=>handleFile(e.target.files[0])}/>
      {fileError?(
        <div className="qca-dz-inner" style={{color:'#b91c1c'}}>
          <AlertCircle size={32}/><p style={{fontSize:13,fontWeight:500,marginTop:6}}>{fileError}</p>
          <button onClick={e=>{e.stopPropagation();setFileError(null);}} style={{fontSize:11,color:'#b91c1c',textDecoration:'underline',marginTop:4,background:'none',border:'none',cursor:'pointer'}}>Dismiss</button>
        </div>
      ):file?(
        <div className="qca-dz-inner" style={{color:'#166534'}}>
          <CheckCircle size={32}/><p style={{fontSize:13,fontWeight:600,marginTop:6,wordBreak:'break-all',padding:'0 12px'}}>{file.name}</p>
          <p style={{fontSize:11,opacity:.7,marginTop:2}}>{fmtSz(file.size)} · Ready</p>
          <button className="qca-dz-remove" onClick={remove}>× Remove</button>
        </div>
      ):(
        <div className="qca-dz-inner" style={{color:'#64748b'}}>
          <UploadCloud size={32}/><p style={{fontSize:13,fontWeight:500,marginTop:6}}>Drop {title} here</p>
          <p style={{fontSize:11,marginTop:2}}>or click to browse</p>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QCChecklistAnalyzer() {
  const [mode,setMode]               = useState("raw");
  const [cdrFile,setCdrFile]         = useState(null);
  const [ncFile,setNcFile]           = useState(null);
  const [percentage,setPercentage]   = useState(10);
  const [samplingFile,setSamplingFile] = useState(null);
  const [checklistConfig,setChecklistConfig] = useState(()=>{
    try{const s=localStorage.getItem(LS_KEY);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length>0)return p;}}catch(e){}
    return cloneChecklist(DEFAULT_CHECKLIST);
  });
  const [isProcessing,setIsProcessing]       = useState(false);
  const [progress,setProgress]               = useState(0);
  const [currentStep,setCurrentStep]         = useState("");
  const [logs,setLogs]                       = useState([]);
  const [logExpanded,setLogExpanded]         = useState(false);
  const [error,setError]                     = useState(null);
  const [results,setResults]                 = useState(null);
  const [matchRateWarning,setMatchRateWarning] = useState(null);
  const [emptyCommentsCount,setEmptyCommentsCount] = useState(0);
  const logEndRef=useRef(null), processDataRef=useRef(null), importInputRef=useRef(null);
  const canRun   = mode==="raw"?(!!cdrFile&&!!ncFile):!!samplingFile;
  const canClear = !isProcessing&&(cdrFile||ncFile||samplingFile||results||error);

  useEffect(()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(checklistConfig));}catch(e){}},[checklistConfig]);
  useEffect(()=>{if(logEndRef.current)logEndRef.current.scrollIntoView({behavior:"smooth"});},[logs]);
  useEffect(()=>{
    const h=(e)=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter"){e.preventDefault();processDataRef.current?.();}};
    document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);
  },[]);

  const addLog    = (msg)=>{setLogs(prev=>[...prev,`[${new Date().toLocaleTimeString()}] ${msg}`]);setCurrentStep(msg);};
  const switchMode= (m)=>{setMode(m);setError(null);setResults(null);setLogs([]);setProgress(0);setMatchRateWarning(null);setEmptyCommentsCount(0);};
  const resetAll  = ()=>{setCdrFile(null);setNcFile(null);setSamplingFile(null);setError(null);setResults(null);setLogs([]);setProgress(0);setMatchRateWarning(null);setEmptyCommentsCount(0);};
  const exportCfg = ()=>{const b=new Blob([JSON.stringify(checklistConfig,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="qc_checklist_config.json";a.click();URL.revokeObjectURL(u);};
  const importCfg = (e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const p=JSON.parse(ev.target.result);if(Array.isArray(p)&&p.every(r=>r.param&&Array.isArray(r.aliases)))setChecklistConfig(p);else setError("Invalid config file.");}catch(err){setError("Failed to parse config JSON: "+err.message);}};r.readAsText(f);e.target.value="";};

  const readExcelFile = async (file,fn)=>{
    addLog(`Reading file: ${fn}...`);
    const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsArrayBuffer(file);});
    await yieldThread();
    const wb=XLSX.read(data,{type:"array"});
    let combined=[];
    wb.SheetNames.forEach(s=>{combined=combined.concat(XLSX.utils.sheet_to_json(wb.Sheets[s],{range:5,defval:""}));});
    addLog(`Normalizing ${combined.length} rows...`);await yieldThread();
    const norm=[];
    for(let i=0;i<combined.length;i++){
      const row=combined[i];let empty=true;const nr={};
      for(const k in row){if(k.trim()==="")continue;const v=row[k];if(v===""||v===null)continue;empty=false;nr[k.replace(/\n/g,"").trim().toLowerCase()]=v;}
      if(!empty&&nr.case_id!==undefined&&String(nr.case_id).trim()!=="")norm.push(nr);
      if(i>0&&i%15000===0){addLog(`Normalized ${i}/${combined.length}...`);await yieldThread();}
    }
    addLog(`Extracted ${norm.length} valid cases from ${fn}.`);return norm;
  };

  const shuffle = (a)=>{const arr=[...a];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;};
  const stripHtml = (t)=>t.replace(/<[^>]+>/g," ");

  const runChecklist = (rows,config)=>{
    let emptyCount=0;
    const checkedRows=rows.map(row=>{
      const rc=String(row.__comment||row.Comments||row.comments||"");
      const text=stripHtml(rc).toLowerCase();
      if(!rc.trim())emptyCount++;
      let yCount=0;const missing=[];const updated={...row};
      for(const{param,aliases}of config){
        const hit=param==="Comments adequately inputed"?(text.length>=200&&/\bconclusion\b/i.test(text)):aliases.some(a=>aliasMatch(text,a));
        updated[param]=hit?"Y":"N";if(hit)yCount++;else missing.push(param);
      }
      updated["Checklist Score"]=`${yCount}/${config.length}`;
      updated["Missing Fields"]=missing.join(", ");
      return updated;
    });
    return{rows:checkedRows,emptyCount};
  };

  const buildSummary=(rows,config)=>{
    const grouped={};
    rows.forEach(row=>{const n=String(row.user_name||row.Name||"Unknown").trim();if(!grouped[n])grouped[n]=[];grouped[n].push(row);});
    const nn=config.length;
    return Object.keys(grouped).map(name=>{
      const cases=grouped[name];const total=cases.length;
      const totalYs=cases.reduce((s,r)=>{const p=String(r["Checklist Score"]||"0/0").split("/");return s+(parseInt(p[0])||0);},0);
      const avgPct=total>0?((totalYs/(total*nn))*100).toFixed(1):"0.0";
      const ps={};
      config.forEach(({param})=>{const yc=cases.filter(r=>r[param]==="Y").length;ps[`${param} %`]=total>0?`${Math.round((yc/total)*100)}%`:"0%";});
      const lc={};cases.forEach(r=>{const raw=String(r.investigation_level||r.workflow_status||"").toUpperCase();const b=raw.includes("L3")?"L3":raw.includes("L2")?"L2":raw.includes("L1")?"L1":"Other";lc[b]=(lc[b]||0)+1;});
      const lb=["L1","L2","L3","Other"].filter(l=>lc[l]).map(l=>`${l}:${lc[l]}`).join(", ")||"—";
      return{"Analyst Name":name,"Total Sampled":total,"Level Breakdown":lb,"Avg Score":`${avgPct}%`,...ps,"Score (Y/Total)":`${totalYs}/${total*nn}`};
    }).sort((a,b)=>parseFloat(a["Avg Score"])-parseFloat(b["Avg Score"]));
  };

  const processRawMode=async()=>{
    addLog("Starting Automated QC Data Extraction...");setProgress(5);await yieldThread();
    const cdrRows=await readExcelFile(cdrFile,"CDR Report");setProgress(30);await yieldThread();
    const ncRows=await readExcelFile(ncFile,"Name & Comment Report");setProgress(55);await yieldThread();
    addLog("Grouping by Case ID...");
    const map=new Map();
    cdrRows.forEach(r=>{const id=r.case_id?String(r.case_id).trim():null;if(id)map.set(id,{cdrRow:r,ncRow:{}});});
    ncRows.forEach(r=>{const id=r.case_id?String(r.case_id).trim():null;if(id){if(map.has(id))map.get(id).ncRow=r;else map.set(id,{cdrRow:{},ncRow:r});}});
    addLog("Resolving analyst names...");await yieldThread();
    const rawReport=[];let sNo=1;
    for(const[cid,{cdrRow,ncRow}]of map.entries()){
      const ws=cdrRow.workflow_status||ncRow.investigation_level||ncRow.workflow_status||"";
      const rc=ncRow.comments||cdrRow.comments||"";
      let fn=ncRow.user_name||cdrRow.assigned_to||"Unassigned";
      if(rc){const parts=String(rc).split("%%");const tp=(ws.includes("L2")||ws.includes("L3"))?parts[parts.length-1].trim():parts[0].trim();const ci=tp.indexOf(":");if(ci>0&&ci<50){const pn=tp.substring(0,ci).trim();if(pn.length>0&&!pn.includes("<"))fn=pn;}}
      if(!fn||fn.trim()==="")fn="Unassigned";
      rawReport.push({"S. No":sNo++,"workflow_sub_status":cdrRow.workflow_sub_status||ncRow.case_sub_status||"","workflow_status":ws,"last_acitivity_date":cdrRow.last_acitivity_date||ncRow.last_action_date||"","disposition_status":cdrRow.disposition_status||ncRow.disposition_status||"","customer_id":cdrRow.customer_id||ncRow.customer_id||"","customer_branch":cdrRow.customer_branch||"","created_date":cdrRow.created_date||ncRow.created_date||"","case_id":cid,"Name":fn,"Comments":rc});
    }
    setProgress(70);addLog(`Built Raw DB: ${rawReport.length} cases. Sampling at ${percentage}%...`);await yieldThread();
    const gbn={};rawReport.forEach(r=>{const n=r.Name||"Unknown";if(!gbn[n])gbn[n]=[];gbn[n].push(r);});
    const samplingReport=[],dashReport=[];
    Object.keys(gbn).forEach(name=>{
      const cases=gbn[name],total=cases.length,ss=Math.max(1,Math.ceil(total*(percentage/100))),sampled=shuffle(cases).slice(0,ss);
      sampled.forEach(sRow=>samplingReport.push({"case_id":sRow.case_id,"user_name":sRow.Name,"last_action_date":sRow.last_acitivity_date,"investigation_level":sRow.workflow_status,"disposition_status":sRow.disposition_status,"customer_id":sRow.customer_id,"created_date":sRow.created_date,"Checked by":"","QC Status":"","QC Remarks":"","Closed within TAT":"","LEA Checks":"","Comments adequately inputed":"","MID":"","Business Name":"","Account Status":"","Category and Subcategory":"","Entity Type":"","GSTIN":"","PAN":"","Alerted transaction details":"","Risk Category":"","QC Checker Comments":"","Recommendation":"","__comment":sRow.Comments}));
      dashReport.push({"Analyst Name":name,"Total Cases Processed":total,"Cases Sampled":sampled.length});
    });
    setProgress(80);addLog(`Sampled ${samplingReport.length} cases. Running checklist...`);await yieldThread();
    const{rows:checkedRows,emptyCount}=runChecklist(samplingReport,checklistConfig);
    checkedRows.forEach(r=>delete r.__comment);setEmptyCommentsCount(emptyCount);
    const summaryRows=buildSummary(checkedRows,checklistConfig);
    setProgress(95);addLog("Finalizing...");await yieldThread();
    setResults({mode:"raw",checkedRows,summaryRows,rawReport,dashReport});
    setProgress(100);addLog("Processing complete!");
    setTimeout(()=>setIsProcessing(false),500);
  };

  const processSamplingMode=async()=>{
    addLog("Reading pre-built QC Sampling Report...");setProgress(10);await yieldThread();
    const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsArrayBuffer(samplingFile);});
    const wb=XLSX.read(data,{type:"array"});
    addLog(`Found sheets: ${wb.SheetNames.join(", ")}`);setProgress(20);await yieldThread();
    const ssn=wb.SheetNames.find(s=>s.trim().toLowerCase()==="sampling");
    if(!ssn)throw new Error(`No "Sampling" sheet found. Sheets: ${wb.SheetNames.join(", ")}`);
    const sd=XLSX.utils.sheet_to_json(wb.Sheets[ssn],{defval:""});
    addLog(`Found ${sd.length} rows in Sampling sheet.`);setProgress(35);await yieldThread();
    let ck=null;
    if(sd.length>0)for(const k of Object.keys(sd[0])){const kl=k.toLowerCase().trim();if(kl==="comments"||kl==="comment"){ck=k;break;}}
    if(ck){addLog(`Using "${ck}" column directly.`);sd.forEach(row=>{row.__comment=String(row[ck]||"");});setProgress(70);}
    else{
      const rsn=wb.SheetNames.find(s=>s.trim().toLowerCase()==="raw");
      if(!rsn)throw new Error('No "Raw" sheet found and Sampling sheet has no Comments column.');
      const rd=XLSX.utils.sheet_to_json(wb.Sheets[rsn],{defval:""});
      const cm=new Map();rd.forEach(row=>{for(const k of Object.keys(row)){if(k.toLowerCase().replace(/[_\s]/g,"")==="caseid"){cm.set(String(row[k]).trim(),String(row.Comments||row.comments||""));break;}}});
      let matched=0;sd.forEach(row=>{let cid=null;for(const k of Object.keys(row)){if(k.toLowerCase().replace(/[_\s]/g,"")==="caseid"){cid=String(row[k]).trim();break;}}const c=cid?(cm.get(cid)||""):"";row.__comment=c;if(c)matched++;});
      const mr=sd.length>0?Math.round((matched/sd.length)*100):0;
      if(mr<50)setMatchRateWarning(`Low comment match rate: ${matched}/${sd.length} (${mr}%) rows matched.`);
      setProgress(70);
    }
    const{rows:checkedRows,emptyCount}=runChecklist(sd,checklistConfig);
    checkedRows.forEach(r=>delete r.__comment);setEmptyCommentsCount(emptyCount);
    const summaryRows=buildSummary(checkedRows,checklistConfig);
    setProgress(90);addLog("Finalizing...");await yieldThread();
    setResults({mode:"sampling",checkedRows,summaryRows});
    setProgress(100);addLog("Processing complete!");
    setTimeout(()=>setIsProcessing(false),500);
  };

  const processData=async()=>{
    setIsProcessing(true);setError(null);setResults(null);setLogs([]);setProgress(0);setMatchRateWarning(null);setEmptyCommentsCount(0);
    try{if(mode==="raw")await processRawMode();else await processSamplingMode();}
    catch(err){console.error(err);setError(String(err?.message||err));setIsProcessing(false);}
  };
  processDataRef.current=processData;

  const downloadExcel=()=>{
    if(!results)return;
    const wb=XLSX.utils.book_new();
    const G={fgColor:{rgb:"C6EFCE"}},R={fgColor:{rgb:"FFC7CE"}},A={fgColor:{rgb:"FFEB9C"}};
    const B={top:{style:"thin",color:{rgb:"000000"}},bottom:{style:"thin",color:{rgb:"000000"}},left:{style:"thin",color:{rgb:"000000"}},right:{style:"thin",color:{rgb:"000000"}}};
    const sty=(ws,cols,hc)=>{ws["!cols"]=cols;const rng=XLSX.utils.decode_range(ws["!ref"]);for(let Rr=rng.s.r;Rr<=rng.e.r;++Rr)for(let C=rng.s.c;C<=rng.e.c;++C){const ref=XLSX.utils.encode_cell({r:Rr,c:C});if(!ws[ref])continue;ws[ref].s=Rr===0?{fill:{fgColor:{rgb:hc}},font:{color:{rgb:"FFFFFF"},bold:true},alignment:{horizontal:"center",vertical:"center",wrapText:true},border:B}:{alignment:{vertical:"top",wrapText:false}};}};
    if(results.mode==="raw"&&results.dashReport){
      const{dashReport}=results,tC=dashReport.reduce((s,r)=>s+(r["Total Cases Processed"]||0),0),tS=dashReport.reduce((s,r)=>s+(r["Cases Sampled"]||0),0);
      const aoa=[[],[],[null,"Overall Summary"],[null,"Total Cases Processed",tC],[null,"Cases Sampled",tS],[null,"Sampling %",`${percentage}%`],[],[null,"Analyst-wise Summary"],[null,"Analyst Name","Total Cases Processed","Cases Sampled","Sample %"]];
      dashReport.forEach(r=>{const p=r["Total Cases Processed"]>0?`${Math.round((r["Cases Sampled"]/r["Total Cases Processed"])*100)}%`:"0%";aoa.push([null,r["Analyst Name"],r["Total Cases Processed"],r["Cases Sampled"],p]);});
      const wd=XLSX.utils.aoa_to_sheet(aoa);wd["!cols"]=[{wch:5},{wch:32},{wch:25},{wch:18},{wch:12}];XLSX.utils.book_append_sheet(wb,wd,SHEETS.DASHBOARD);
    }
    if(results.mode==="raw"&&results.rawReport){const wr=XLSX.utils.json_to_sheet(results.rawReport);sty(wr,[{wch:8},{wch:20},{wch:15},{wch:20},{wch:18},{wch:18},{wch:15},{wch:20},{wch:18},{wch:25},{wch:60}],"000000");XLSX.utils.book_append_sheet(wb,wr,SHEETS.RAW);}
    const ws2=XLSX.utils.json_to_sheet(results.checkedRows);const sk=results.checkedRows.length?Object.keys(results.checkedRows[0]):[];
    const SW={"case_id":18,"user_name":25,"last_action_date":20,"investigation_level":18,"disposition_status":18,"customer_id":22,"created_date":18,"Checked by":18,"QC Status":20,"QC Remarks":25,"Closed within TAT":20,"Category and Subcategory":28,"Alerted transaction details":30,"Checklist Score":18,"Missing Fields":60};
    sty(ws2,sk.map(k=>({wch:SW[k]||20})),"E26B0A");
    const sr=XLSX.utils.decode_range(ws2["!ref"]);const hcm={};
    for(let C=sr.s.c;C<=sr.e.c;++C){const h=XLSX.utils.encode_cell({r:0,c:C});if(ws2[h]?.v)hcm[String(ws2[h].v)]=C;}
    const cps=new Set(checklistConfig.map(r=>r.param));
    for(let Rr=1;Rr<=sr.e.r;++Rr){for(const[n,C]of Object.entries(hcm)){if(!cps.has(n))continue;const cr=XLSX.utils.encode_cell({r:Rr,c:C});if(!ws2[cr])continue;const v=String(ws2[cr].v||"").toUpperCase();if(v==="Y")ws2[cr].s={fill:G,font:{bold:true,color:{rgb:"276221"}},alignment:{horizontal:"center"},border:B};else if(v==="N")ws2[cr].s={fill:R,font:{bold:true,color:{rgb:"9C0006"}},alignment:{horizontal:"center"},border:B};}const sc=hcm["Checklist Score"];if(sc!==undefined){const cr=XLSX.utils.encode_cell({r:Rr,c:sc});if(ws2[cr]){const pp=String(ws2[cr].v||"0/0").split("/"),pct=(parseInt(pp[0])||0)/(parseInt(pp[1])||1)*100;ws2[cr].s={fill:pct>=90?G:pct>=70?A:R,font:{bold:true},alignment:{horizontal:"center"},border:B};}}}
    XLSX.utils.book_append_sheet(wb,ws2,SHEETS.SAMPLING);
    if(results.summaryRows?.length>0){const ws3=XLSX.utils.json_to_sheet(results.summaryRows);sty(ws3,[{wch:28},{wch:16},{wch:22},{wch:14},...checklistConfig.map(()=>({wch:20})),{wch:20}],"1F497D");XLSX.utils.book_append_sheet(wb,ws3,SHEETS.SUMMARY);}
    const ma=[["Run Metadata",""],[], ["Run Date",new Date().toLocaleString()],["Mode",results.mode==="raw"?"Mode A — Raw Reports":"Mode B — Sampling Report"],["Sampling %",results.mode==="raw"?`${percentage}%`:"N/A"],["Cases Analyzed",results.checkedRows.length],["Analysts Found",results.summaryRows.length],["Parameters Checked",checklistConfig.length],results.mode==="raw"?["CDR File",cdrFile?.name||""]:["Input File",samplingFile?.name||""],results.mode==="raw"?["NC File",ncFile?.name||""]:["",""],[], ["Parameter Configuration","Aliases"],...checklistConfig.map(({param,aliases})=>[param,aliases.join(", ")])];
    const wm=XLSX.utils.aoa_to_sheet(ma);wm["!cols"]=[{wch:28},{wch:80}];XLSX.utils.book_append_sheet(wb,wm,SHEETS.METADATA);
    XLSX.writeFile(wb,`QC_Checklist_Report_${new Date().toISOString().split("T")[0]}.xlsx`,{compression:true});
  };

  return (
    <div className="qca-root">
      <style>{QCA_CSS}</style>

      <div className="qca-header">
        <h1>AML QC Checklist Analyzer</h1>
        <p>Automatically scan analyst comments for required parameters. Upload raw reports or a pre-built sampling file.</p>
      </div>

      <div className="qca-card">
        {error&&(<div className="qca-error"><AlertCircle size={18}/><span style={{flex:1}}>{error}</span><button className="qca-banner-close" onClick={()=>setError(null)}><XIco size={14}/></button></div>)}
        {matchRateWarning&&(<div className="qca-warning"><AlertCircle size={16}/><span style={{flex:1}}>{matchRateWarning}</span><button className="qca-banner-close" onClick={()=>setMatchRateWarning(null)}><XIco size={14}/></button></div>)}

        {/* Mode switcher */}
        <div className="qca-mode-row">
          <div>
            <div className="qca-mode-label">Input Mode</div>
            <div className="qca-mode-group">
              {["raw","sampling"].map(m=>(
                <button key={m} className={`qca-mode-btn${mode===m?' active':''}`} onClick={()=>switchMode(m)} disabled={isProcessing}>
                  {m==="raw"?"Raw Reports":"Sampling Report"}
                </button>
              ))}
            </div>
          </div>
          {canClear&&(<button className="qca-clear-btn" onClick={resetAll}><TrashIco size={12}/> Clear All</button>)}
        </div>

        {/* File inputs */}
        {mode==="raw"?(
          <div className="qca-file-grid">
            <FileUploader title="CDR Report"            file={cdrFile}      setFile={setCdrFile}      accept=".xlsx,.xls,.csv" disabled={isProcessing}/>
            <FileUploader title="Name & Comment Report" file={ncFile}        setFile={setNcFile}       accept=".xlsx,.xls,.csv" disabled={isProcessing}/>
          </div>
        ):(
          <div className="qca-file-single">
            <FileUploader title="QC Sampling Report"   file={samplingFile}  setFile={setSamplingFile} accept=".xlsx,.xls"      disabled={isProcessing}/>
            <p style={{fontSize:11,color:'#94a3b8',textAlign:'center',marginTop:4}}>Requires "Sampling" sheet; "Raw" sheet needed if Comments column is absent</p>
          </div>
        )}

        {/* Sampling % */}
        {mode==="raw"&&(
          <div className="qca-pct-row">
            <div className="qca-pct-ico"><PctIco size={20}/></div>
            <div style={{flex:1}}>
              <div className="qca-pct-lbl">Sampling Target</div>
              <div className="qca-pct-ctrl">
                <input type="range" min="1" max="100" value={percentage} onChange={e=>setPercentage(Number(e.target.value))} disabled={isProcessing} style={{width:180,accentColor:'#2563eb',opacity:isProcessing?.5:1}}/>
                <span className="qca-pct-val">{percentage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Checklist config */}
        <div style={{marginBottom:20}}>
          <div className="qca-cfg-hdr">
            <div className="qca-cfg-title-row">
              <div className="qca-cfg-ico"><SettingsIco size={16}/></div>
              <div><p className="qca-cfg-title">Checklist Parameters</p><p className="qca-cfg-hint">Enter/comma to add alias · Hover param name for description</p></div>
            </div>
            <div className="qca-cfg-btns">
              <input ref={importInputRef} type="file" accept=".json" style={{display:'none'}} onChange={importCfg}/>
              <button className="qca-cfg-btn" onClick={()=>importInputRef.current?.click()} disabled={isProcessing}><UpIco size={12}/> Import</button>
              <button className="qca-cfg-btn" onClick={exportCfg} disabled={isProcessing}><JsonIco size={12}/> Export</button>
              <button className="qca-cfg-btn" onClick={()=>setChecklistConfig(cloneChecklist(DEFAULT_CHECKLIST))} disabled={isProcessing}><RotateIco size={12}/> Reset</button>
            </div>
          </div>
          <ChecklistConfigEditor config={checklistConfig} onChange={setChecklistConfig} disabled={isProcessing}/>
        </div>

        {/* Run button */}
        <div className="qca-run-row">
          <p className="qca-run-hint">{canRun?"⌘ Enter to run":"Upload files to enable"}</p>
          <button className={`qca-run-btn ${isProcessing||!canRun?'qca-run-off':'qca-run-on'}`} onClick={processData} disabled={isProcessing||!canRun}>
            {isProcessing?(<><div className="qca-spinner"/><span>Processing…</span></>):(<><Play size={18}/><span>Run Checklist</span></>)}
          </button>
        </div>

        {/* Progress + Log */}
        {(isProcessing||logs.length>0)&&(
          <div className="qca-prog-section">
            <div className="qca-prog-row">
              <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:16}}>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <div className="qca-prog-bg"><div className="qca-prog-fill" style={{width:`${progress}%`}}/></div>
            <div className="qca-log-box">
              <div className="qca-log-hdr">
                <div className="qca-log-hdr-l"><TerminalIco size={14}/><span>Execution Log</span><span style={{color:'#475569'}}>({logs.length} lines)</span></div>
                <button className="qca-log-exp" onClick={()=>setLogExpanded(x=>!x)}>{logExpanded?<Min2 size={14}/>:<Max2 size={14}/>}</button>
              </div>
              <div className={`qca-log-body ${logExpanded?'qca-log-lg':'qca-log-sm'}`}>
                {logs.map((log,idx)=><div key={idx}>{log}</div>)}
                <div ref={logEndRef}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results&&!isProcessing&&(
        <div className="qca-card">
          <div className="qca-res-hdr">
            <div>
              <div className="qca-res-title"><UsersIco size={22} style={{color:'#2563eb'}}/> Checklist Results</div>
              <div className="qca-res-sub">Scanned <strong style={{color:'#2563eb'}}>{results.checkedRows.length}</strong> cases across <strong style={{color:'#2563eb'}}>{results.summaryRows.length}</strong> analysts · {checklistConfig.length} parameters</div>
              {emptyCommentsCount>0&&(<span className="qca-empty-warn">⚠ {emptyCommentsCount} case{emptyCommentsCount!==1?"s":""} had empty comments (all N)</span>)}
            </div>
            <button className="qca-dl-btn" onClick={downloadExcel}><Download size={18}/> Download Report</button>
          </div>
          <div className="qca-tbl-wrap">
            <table className="qca-tbl">
              <thead>
                <tr>
                  <th>Analyst Name</th>
                  <th style={{textAlign:'center'}}>Cases</th>
                  <th style={{textAlign:'center'}}>Levels</th>
                  <th style={{textAlign:'center'}}>Avg Score</th>
                  <th>Weakest Parameters</th>
                </tr>
              </thead>
              <tbody>
                {results.summaryRows.map((row,idx)=>{
                  const score=parseFloat(row["Avg Score"])||0;
                  const sc=score>=90?'qca-sc-g':score>=70?'qca-sc-a':'qca-sc-r';
                  const weak=checklistConfig.map(({param})=>({param,pct:parseInt(row[`${param} %`]||"0")})).filter(p=>p.pct<100).sort((a,b)=>a.pct-b.pct).slice(0,3).map(p=>`${p.param} (${p.pct}%)`).join(", ")||"—";
                  return(
                    <tr key={idx}>
                      <td style={{fontWeight:600}}>{row["Analyst Name"]}</td>
                      <td style={{textAlign:'center',color:'#475569'}}>{row["Total Sampled"]}</td>
                      <td style={{textAlign:'center',fontSize:11,color:'#64748b'}}>{row["Level Breakdown"]||"—"}</td>
                      <td style={{textAlign:'center'}}><span className={`qca-score ${sc}`}>{row["Avg Score"]}</span></td>
                      <td style={{fontSize:11,color:'#64748b'}}>{weak}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="qca-tbl-foot">Sorted worst → best · Download for full per-case detail and Run Metadata sheet</p>
        </div>
      )}
    </div>
  );
}
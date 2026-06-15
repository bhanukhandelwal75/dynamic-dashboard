// import React, { useState, useEffect, useRef } from 'react';
// import * as XLSX from 'xlsx-js-style';
// import { UploadCloud, Play, Download, Terminal, Users } from 'lucide-react';
// import './QCSampling.css';

// export default function QCSampling() {
//     const [cdrFile, setCdrFile] = useState(null);
//     const [ncFile, setNcFile] = useState(null);
//     const [percentage, setPercentage] = useState(10);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [logs, setLogs] = useState([]);
//     const [dashboardData, setDashboardData] = useState(null);
//     const [rawData, setRawData] = useState(null);
//     const [samplingData, setSamplingData] = useState(null);
//     const [error, setError] = useState(null);
    
//     const logEndRef = useRef(null);

//     useEffect(() => {
//         logEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [logs]);

//     const addLog = (msg) => {
//         setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
//     };

//     // --- Helper: Read and Normalize Excel (Same as your index.html) ---
//     const readExcelFile = async (file, fileName) => {
//         addLog(`Reading ${fileName}...`);
//         const data = await file.arrayBuffer();
//         const workbook = XLSX.read(data, { type: 'array' });
        
//         let combinedData = [];
//         workbook.SheetNames.forEach(sheetName => {
//             const sheet = workbook.Sheets[sheetName];
//             // range: 5 means start from Row 6 as per your original file
//             const rows = XLSX.utils.sheet_to_json(sheet, { range: 5, defval: "" });
//             combinedData = combinedData.concat(rows);
//         });

//         return combinedData.map(row => {
//             const newRow = {};
//             for (let key in row) {
//                 const cleanKey = key.replace(/\n/g, '').trim().toLowerCase();
//                 newRow[cleanKey] = row[key];
//             }
//             return newRow;
//         }).filter(row => row.case_id);
//     };

//     const processData = async () => {
//         if (!cdrFile || !ncFile) return alert("Please upload both reports");
        
//         setIsProcessing(true);
//         setLogs([]);
//         setError(null);

//         try {
//             const cdrRows = await readExcelFile(cdrFile, "CDR Report");
//             const ncRows = await readExcelFile(ncFile, "Name & Comment Report");

//             addLog("Merging data by Case ID...");
//             const combinedMap = new Map();

//             cdrRows.forEach(row => {
//                 const id = String(row.case_id).trim();
//                 combinedMap.set(id, { cdrRow: row, ncRow: {} });
//             });

//             ncRows.forEach(row => {
//                 const id = String(row.case_id).trim();
//                 if (combinedMap.has(id)) {
//                     combinedMap.get(id).ncRow = row;
//                 } else {
//                     combinedMap.set(id, { cdrRow: {}, ncRow: row });
//                 }
//             });

//             const finalRaw = [];
//             const groupedByName = {};

//             addLog("Extracting Analyst Names from comments...");
//             combinedMap.forEach(({ cdrRow, ncRow }, caseId) => {
//                 let comments = ncRow.comments || cdrRow.comments || "";
//                 let status = cdrRow.workflow_status || ncRow.investigation_level || "";
//                 let analystName = ncRow.user_name || cdrRow.assigned_to || "Unassigned";

//                 // Your special Logic: Extract name before colon in comments
//                 if (comments && String(comments).includes(":")) {
//                     const parts = String(comments).split("%%");
//                     const targetPart = (status.includes("L2") || status.includes("L3")) 
//                                         ? parts[parts.length - 1] : parts[0];
                    
//                     const colonIndex = targetPart.indexOf(":");
//                     if (colonIndex > 0 && colonIndex < 50) {
//                         analystName = targetPart.substring(0, colonIndex).trim();
//                     }
//                 }

//                 const entry = {
//                     "Case ID": caseId,
//                     "Name": analystName,
//                     "Status": status,
//                     "Comments": comments
//                 };

//                 finalRaw.push(entry);
//                 if (!groupedByName[analystName]) groupedByName[analystName] = [];
//                 groupedByName[analystName].push(entry);
//             });

//             // Sampling Logic
//             const samplingReport = [];
//             const dashReport = [];

//             Object.keys(groupedByName).forEach(name => {
//                 const cases = groupedByName[name];
//                 const sampleSize = Math.max(1, Math.ceil(cases.length * (percentage / 100)));
//                 const sampled = cases.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
                
//                 samplingReport.push(...sampled);
//                 dashReport.push({
//                     "Analyst Name": name,
//                     "Total Cases Processed": cases.length,
//                     "Cases Sampled": sampled.length
//                 });
//             });

//             setRawData(finalRaw);
//             setSamplingData(samplingReport);
//             setDashboardData(dashReport);
//             addLog("Processing Complete!");

//         } catch (err) {
//             addLog("Error: " + err.message);
//             setError("Failed to process Excel files.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     return (
//         <div className="qc-page-wrapper">
//             <div className="qc-header">
//                 <h1>AML Quality Control Automator</h1>
//                 <p>Professional randomized analyst sampling based on Jocata-STAR reports.</p>
//             </div>

//             <div className="qc-main-card">
//                 <div className="qc-upload-container">
//                     <div className={`qc-upload-box ${cdrFile ? 'active' : ''}`} onClick={() => document.getElementById('cdrIn').click()}>
//                         <input id="cdrIn" type="file" hidden onChange={(e) => setCdrFile(e.target.files[0])} />
//                         <UploadCloud size={32} className={cdrFile ? "text-green-500" : "text-slate-400"} />
//                         <p>{cdrFile ? cdrFile.name : "Upload CDR Report"}</p>
//                     </div>
//                     <div className={`qc-upload-box ${ncFile ? 'active' : ''}`} onClick={() => document.getElementById('ncIn').click()}>
//                         <input id="ncIn" type="file" hidden onChange={(e) => setNcFile(e.target.files[0])} />
//                         <UploadCloud size={32} className={ncFile ? "text-green-500" : "text-slate-400"} />
//                         <p>{ncFile ? ncFile.name : "Upload Name & Comment Report"}</p>
//                     </div>
//                 </div>

//                 <div className="qc-controls-bar">
//                     <div className="qc-range-group">
//                         <span className="font-bold text-slate-600">SAMPLING: {percentage}%</span>
//                         <input type="range" className="qc-range-input" min="1" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
//                     </div>
//                     <button className="qc-btn-primary" onClick={processData} disabled={isProcessing}>
//                         {isProcessing ? "Processing..." : "Generate Sample"}
//                     </button>
//                 </div>

//                 {logs.length > 0 && (
//                     <div className="qc-log-container">
//                         {logs.map((log, i) => <div key={i}>{log}</div>)}
//                         <div ref={logEndRef} />
//                     </div>
//                 )}

//                 {dashboardData && !isProcessing && (
//                     <div className="results-area">
//                         <div className="flex justify-between items-center mt-8 mb-4">
//                             <h2 className="text-xl font-bold flex items-center gap-2">
//                                 <Users size={20} /> Analyst Summary
//                             </h2>
//                             <button className="qc-btn-primary bg-green-600" onClick={() => alert("Downloading...")}>
//                                 <Download size={18} className="inline mr-2" /> Download Excel
//                             </button>
//                         </div>
//                         <table className="qc-results-table">
//                             <thead>
//                                 <tr>
//                                     <th>Analyst Name</th>
//                                     <th>Total Processed</th>
//                                     <th>Cases Sampled</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {dashboardData.map((row, i) => (
//                                     <tr key={i}>
//                                         <td>{row["Analyst Name"]}</td>
//                                         <td>{row["Total Cases Processed"]}</td>
//                                         <td className="font-bold text-blue-600">{row["Cases Sampled"]}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }




// import React, { useState, useEffect, useRef } from 'react';
// import * as XLSX from 'xlsx-js-style';
// import { UploadCloud, Play, Download, Terminal, Users, AlertCircle } from 'lucide-react';
// import './QCSampling.css';

// export default function QCSampling() {
//     // --- States ---
//     const [cdrFile, setCdrFile] = useState(null);
//     const [ncFile, setNcFile] = useState(null);
//     const [percentage, setPercentage] = useState(10);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [progress, setProgress] = useState(0);
//     const [logs, setLogs] = useState([]);
//     const [dashboardData, setDashboardData] = useState(null);
//     const [rawData, setRawData] = useState(null);
//     const [samplingData, setSamplingData] = useState(null);
//     const [error, setError] = useState(null);
    
//     const logEndRef = useRef(null);

//     // Auto-scroll logs
//     useEffect(() => {
//         logEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [logs]);

//     const addLog = (msg) => {
//         setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
//     };

//     // --- Logic: Read Excel File ---
//     const readExcelFile = async (file, fileName) => {
//         addLog(`Reading ${fileName}...`);
//         const data = await file.arrayBuffer();
//         const workbook = XLSX.read(data, { type: 'array' });
        
//         let combinedData = [];
//         workbook.SheetNames.forEach(sheetName => {
//             const sheet = workbook.Sheets[sheetName];
//             // Range 5 means start from Row 6 (Header row)
//             const rows = XLSX.utils.sheet_to_json(sheet, { range: 5, defval: "" });
//             combinedData = combinedData.concat(rows);
//         });

//         return combinedData.map(row => {
//             const newRow = {};
//             for (let key in row) {
//                 const cleanKey = key.replace(/\n/g, '').trim().toLowerCase();
//                 newRow[cleanKey] = row[key];
//             }
//             return newRow;
//         }).filter(row => row.case_id);
//     };

//     // --- Logic: Process and Sample ---
//     const processData = async () => {
//         if (!cdrFile || !ncFile) {
//             setError("Please upload both reports first.");
//             return;
//         }
        
//         setIsProcessing(true);
//         setLogs([]);
//         setError(null);
//         setProgress(10);

//         try {
//             const cdrRows = await readExcelFile(cdrFile, "CDR Report");
//             setProgress(40);
//             const ncRows = await readExcelFile(ncFile, "Name & Comment Report");
//             setProgress(60);

//             addLog("Grouping data by Case ID and resolving Analyst names...");
//             const combinedMap = new Map();

//             cdrRows.forEach(row => {
//                 const id = String(row.case_id).trim();
//                 combinedMap.set(id, { cdrRow: row, ncRow: {} });
//             });

//             ncRows.forEach(row => {
//                 const id = String(row.case_id).trim();
//                 if (combinedMap.has(id)) {
//                     combinedMap.get(id).ncRow = row;
//                 } else {
//                     combinedMap.set(id, { cdrRow: {}, ncRow: row });
//                 }
//             });

//             const finalRaw = [];
//             const groupedByName = {};

//             combinedMap.forEach(({ cdrRow, ncRow }, caseId) => {
//                 let comments = ncRow.comments || cdrRow.comments || "";
//                 let status = String(cdrRow.workflow_status || ncRow.investigation_level || "");
//                 let analystName = ncRow.user_name || cdrRow.assigned_to || "Unassigned";

//                 // Extraction Logic from your original index.html
//                 if (comments && String(comments).includes(":")) {
//                     const parts = String(comments).split("%%");
//                     const targetPart = (status.includes("L2") || status.includes("L3")) 
//                                         ? parts[parts.length - 1].trim() : parts[0].trim();
                    
//                     const colonIndex = targetPart.indexOf(":");
//                     if (colonIndex > 0 && colonIndex < 50) {
//                         analystName = targetPart.substring(0, colonIndex).trim();
//                     }
//                 }

//                 const entry = {
//                     "case_id": caseId,
//                     "user_name": analystName,
//                     "investigation_level": status,
//                     "Comments": comments,
//                     "disposition_status": cdrRow.disposition_status || ncRow.disposition_status || "",
//                     "created_date": cdrRow.created_date || ncRow.created_date || ""
//                 };

//                 finalRaw.push(entry);
//                 if (!groupedByName[analystName]) groupedByName[analystName] = [];
//                 groupedByName[analystName].push(entry);
//             });

//             const samplingReport = [];
//             const dashReport = [];

//             Object.keys(groupedByName).forEach(name => {
//                 const cases = groupedByName[name];
//                 const sampleSize = Math.max(1, Math.ceil(cases.length * (percentage / 100)));
//                 const shuffled = cases.sort(() => 0.5 - Math.random());
//                 const sampled = shuffled.slice(0, sampleSize);
                
//                 samplingReport.push(...sampled);
//                 dashReport.push({
//                     "Analyst Name": name,
//                     "Total Cases Processed": cases.length,
//                     "Cases Sampled": sampled.length
//                 });
//             });

//             setRawData(finalRaw);
//             setSamplingData(samplingReport);
//             setDashboardData(dashReport);
//             setProgress(100);
//             addLog("Processing Complete! Dashboard is ready.");

//         } catch (err) {
//             setError("Error processing files. Ensure formats are correct.");
//             addLog("Error: " + err.message);
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     // --- Logic: Styled Excel Download ---
//     const downloadExcel = () => {
//         if (!dashboardData) return;

//         const wb = XLSX.utils.book_new();

//         // 1. Dashboard Sheet
//         const dashAOA = [
//             [], [], [null, "Overall summary :"],
//             [null, "Total Cases Processed", { t: 'n', f: `SUM(C12:C${11 + dashboardData.length})` }],
//             [null, "Cases Sampled", { t: 'n', f: `SUM(D12:D${11 + dashboardData.length})` }],
//             [null, "Accuracy %", 1],
//             [], [null, "Analyst wise summary :"],
//             [null, "Analyst Name", "Total Cases Processed", "Cases Sampled", "Remarks"]
//         ];

//         dashboardData.forEach(row => {
//             dashAOA.push([null, row["Analyst Name"], row["Total Cases Processed"], row["Cases Sampled"], ""]);
//         });

//         const wsDash = XLSX.utils.aoa_to_sheet(dashAOA);
//         wsDash['!cols'] = [{wch:5}, {wch:30}, {wch:20}, {wch:15}, {wch:30}];

//         // 2. Raw and Sampling Sheets
//         const wsRaw = XLSX.utils.json_to_sheet(rawData);
//         const wsSamp = XLSX.utils.json_to_sheet(samplingData);

//         XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");
//         XLSX.utils.book_append_sheet(wb, wsRaw, "Raw_Data");
//         XLSX.utils.book_append_sheet(wb, wsSamp, "Sampling_Report");

//         XLSX.writeFile(wb, `AML_QC_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
//     };

//     return (
//         <div className="qc-page-wrapper">
//             <div className="qc-header text-center">
//                 <h1 className="text-3xl font-bold text-slate-800">AML Quality Control Automator</h1>
//                 <p className="text-slate-500">Generate randomized analyst samples from Star Reports.</p>
//             </div>

//             <div className="qc-main-card mt-8 max-w-5xl mx-auto shadow-lg bg-white p-8 rounded-2xl border border-slate-200">
//                 {error && (
//                     <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
//                         <AlertCircle size={20} /> {error}
//                     </div>
//                 )}

//                 <div className="qc-upload-container grid grid-cols-2 gap-6 mb-8">
//                     <div className={`qc-upload-box p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${cdrFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:bg-slate-50'}`} 
//                          onClick={() => document.getElementById('cdrInput').click()}>
//                         <input id="cdrInput" type="file" hidden onChange={(e) => setCdrFile(e.target.files[0])} />
//                         <UploadCloud size={40} className={`mx-auto mb-2 ${cdrFile ? 'text-green-500' : 'text-slate-400'}`} />
//                         <p className="font-medium text-slate-600 truncate">{cdrFile ? cdrFile.name : "Upload CDR Report"}</p>
//                     </div>

//                     <div className={`qc-upload-box p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${ncFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:bg-slate-50'}`} 
//                          onClick={() => document.getElementById('ncInput').click()}>
//                         <input id="ncInput" type="file" hidden onChange={(e) => setNcFile(e.target.files[0])} />
//                         <UploadCloud size={40} className={`mx-auto mb-2 ${ncFile ? 'text-green-500' : 'text-slate-400'}`} />
//                         <p className="font-medium text-slate-600 truncate">{ncFile ? ncFile.name : "Upload Name & Comment Report"}</p>
//                     </div>
//                 </div>

//                 <div className="qc-controls-bar flex items-center justify-between p-6 bg-slate-50 rounded-xl mb-8 border border-slate-200">
//                     <div className="flex items-center gap-4 w-1/2">
//                         <span className="font-bold text-slate-700 min-w-[120px]">Sampling: {percentage}%</span>
//                         <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
//                                min="1" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
//                     </div>
//                     <button className={`qc-btn-primary ${isProcessing ? 'disabled' : ''}`} 
//                             onClick={processData} disabled={isProcessing}>
//                         {isProcessing ? "Processing..." : <><Play size={18} /> Generate Sample</>}
//                     </button>
//                 </div>

//                 {logs.length > 0 && (
//                     <div className="qc-log-container bg-slate-900 rounded-xl p-4 mb-8 overflow-hidden border border-slate-800 shadow-inner">
//                         <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 border-b border-slate-800 pb-2">
//                             <Terminal size={14} /> Execution Log
//                         </div>
//                         <div className="h-40 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
//                             {logs.map((log, i) => <div key={i} className="opacity-90">{log}</div>)}
//                             <div ref={logEndRef} />
//                         </div>
//                     </div>
//                 )}

//                 {dashboardData && !isProcessing && (
//                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                         <div className="flex justify-between items-center mb-4 pt-4 border-t border-slate-100">
//                             <div className="qc-results-header">
//                                 <button className="qc-btn-download" onClick={downloadExcel}>
//                                     <Download size={20} /> 
//                                     <span>Download Report</span>
//                                 </button>
//                             </div>    
//                         </div>
//                         <div className="qc-table-container">
//                             <table className="qc-results-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Analyst Name</th>
//                                         <th className="text-center">Total Processed</th>
//                                         <th className="text-center">Cases Sampled</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {dashboardData.map((row, i) => (
//                                         <tr key={i}>
//                                             <td className="font-bold text-slate-800">{row["Analyst Name"]}</td>
//                                             <td className="text-center font-semibold">{row["Total Cases Processed"]}</td>
//                                             <td className="text-center font-extrabold text-blue-700 bg-blue-50/50">
//                                                 {row["Cases Sampled"]}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
//                             <table className="w-full text-left border-collapse">
//                                 <thead className="bg-slate-50 border-b border-slate-200">
//                                     <tr>
//                                         <th className="p-4 font-bold text-slate-700">Analyst Name</th>
//                                         <th className="p-4 text-center font-bold text-slate-700">Total Processed</th>
//                                         <th className="p-4 text-center font-bold text-blue-700 bg-blue-50/30">Cases Sampled</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {dashboardData.map((row, i) => (
//                                         <tr key={i} className="hover:bg-slate-50 transition-colors">
//                                             <td className="p-4 font-medium text-slate-800">{row["Analyst Name"]}</td>
//                                             <td className="p-4 text-center text-slate-600">{row["Total Cases Processed"]}</td>
//                                             <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/20">{row["Cases Sampled"]}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
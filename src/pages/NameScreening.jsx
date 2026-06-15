import { useEffect, useRef } from 'react';

export default function NameScreening() {
  const iframeRef = useRef(null);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Name Screening Processor</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"><\/script>
    <script src="https://unpkg.com/lucide@latest"><\/script>
    <style>
        .drag-active { border-color: #3b82f6; background-color: #eff6ff; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    <\/style>
<\/head>
<body class="bg-gray-50 min-h-screen font-sans text-gray-800">
    <div class="max-w-5xl mx-auto p-6">
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Name Screening Processor</h1>
            <p class="text-gray-600">High-performance automated SSG name screening file processing tool.</p>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div id="drop-zone" class="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-gray-50">
                <div class="flex flex-col items-center justify-center space-y-4">
                    <i data-lucide="upload-cloud" class="w-12 h-12 text-gray-400"><\/i>
                    <div>
                        <p class="text-lg font-medium text-gray-700">Click to upload or drag and drop<\/p>
                        <p class="text-sm text-gray-500">Supported file: .csv<\/p>
                    <\/div>
                    <input type="file" id="file-input" class="hidden" accept=".csv">
                <\/div>
            <\/div>
            <div id="config-section" class="bg-blue-50 border border-blue-100 rounded-lg p-5">
                <h2 class="text-sm font-semibold mb-3 flex items-center text-blue-800">
                    <i data-lucide="settings" class="w-4 h-4 mr-2"><\/i>
                    Configuration Options
                <\/h2>
                <div>
                    <label for="user-id-input" class="block text-sm font-medium text-gray-700 mb-1">User Id for Closure (Column E)<\/label>
                    <input type="text" id="user-id-input" class="w-full md:w-1/2 px-4 py-2 border border-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., manas2.tiwari">
                    <p class="text-xs text-blue-600 mt-1">This ID will be dynamically appended to all bulk closure Excel records.<\/p>
                <\/div>
            <\/div>
            <div id="status-area" class="hidden mt-6">
                <div class="flex items-center justify-between mb-2">
                    <span id="status-text" class="text-sm font-medium text-gray-700">Initializing...<\/span>
                    <span id="status-percent" class="text-sm font-bold text-blue-600">0%<\/span>
                <\/div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div id="progress-bar" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"><\/div>
                <\/div>
            <\/div>
            <div id="result-area" class="hidden mt-8 border-t pt-6">
                <h3 class="text-lg font-semibold mb-4 text-green-700 flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-2"><\/i> Processing Complete
                <\/h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div class="text-blue-600 text-sm font-medium">Total Unique Cases<\/div>
                        <div id="stat-total" class="text-3xl font-bold text-gray-900">0<\/div>
                    <\/div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div class="text-green-600 text-sm font-medium">Auto-Close (Safe)<\/div>
                        <div id="stat-auto" class="text-3xl font-bold text-gray-900">0<\/div>
                    <\/div>
                    <div class="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div class="text-amber-600 text-sm font-medium">Manual Review<\/div>
                        <div id="stat-manual" class="text-3xl font-bold text-gray-900">0<\/div>
                    <\/div>
                <\/div>
                <div class="flex flex-col sm:flex-row gap-4 mb-2">
                    <button id="download-btn" class="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">
                        <i data-lucide="file-spreadsheet" class="w-5 h-5 text-green-600"><\/i>
                        Download Analyzed Excel
                    <\/button>
                    <button id="download-bulk-btn" class="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">
                        <i data-lucide="file-spreadsheet" class="w-5 h-5"><\/i>
                        Download Bulk Closure
                    <\/button>
                    <button id="reset-btn" class="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm">
                        <i data-lucide="rotate-ccw" class="w-5 h-5"><\/i>
                        <span class="hidden sm:inline">Start Over<\/span>
                    <\/button>
                <\/div>
            <\/div>
            <div id="preview-section" class="mt-8 border-t pt-6 hidden">
                <h3 class="text-md font-semibold mb-4 text-gray-800 flex items-center">
                    <i data-lucide="eye" class="w-5 h-5 mr-2 text-amber-600"><\/i>
                    Manual Review Preview (Up to 1000 Cases)
                <\/h3>
                <div class="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-200 rounded-lg">
                    <table class="min-w-full text-sm text-left text-gray-600">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase sticky top-0 shadow-sm">
                            <tr>
                                <th class="px-4 py-3 border-b">Case ID<\/th>
                                <th class="px-4 py-3 border-b">Source Data<\/th>
                                <th class="px-4 py-3 border-b">Matched Data<\/th>
                                <th class="px-4 py-3 border-b text-amber-600">Triggering Risk Factor<\/th>
                            <\/tr>
                        <\/thead>
                        <tbody id="preview-tbody" class="divide-y divide-gray-100 bg-white"><\/tbody>
                    <\/table>
                <\/div>
            <\/div>
            <div id="error-message" class="hidden mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <i data-lucide="alert-triangle" class="w-5 h-5 mr-2"><\/i>
                <span id="error-text"><\/span>
            <\/div>
        <\/div>
    <\/div>

    <script id="worker-code" type="javascript/worker">
        importScripts('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.min.js');
        const GEO_STOPWORDS = new Set(["INDIA","DELHI","NEW DELHI","MUMBAI","BANGALORE","KOLKATA","CHENNAI","HYDERABAD","PUNE","AHMEDABAD","JAIPUR","SURAT","CITY","STATE","AAAA","AAAA INDIA","UNKNOWN","SOUTH DELHI","NORTH DELHI","EAST DELHI","WEST DELHI"]);
        const COMPANY_KEYWORDS = ["PVT","LTD","LIMITED","PRIVATE","LLP","INC","CORP","CORPORATION","WORKS","INDUSTRIES","ENTERPRISE","TRADING","SOLUTIONS","SERVICES","TECHNOLOGIES","GLOBAL","SYSTEMS","CO-OP","COOPERATIVE","ESTATE","TRUST","GROUP","HOLDINGS"];
        const COMPANY_REGEX = new RegExp("\\\\b(" + COMPANY_KEYWORDS.join("|") + ")\\\\b", "i");
        const PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]/;
        const MONTHS = "JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUN(?:E)?|JUL(?:Y)?|AUG(?:UST)?|SEP(?:TEMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?";
        const DATE_REGEX = new RegExp("(?:\\\\b\\\\d{1,2}[-/\\\\.]\\\\d{1,2}[-/\\\\.]\\\\d{2,4}\\\\b)|(?:\\\\b\\\\d{4}[-/\\\\.]\\\\d{1,2}[-/\\\\.]\\\\d{1,2}\\\\b)|(?:\\\\b\\\\d{1,2}[-/\\\\.\\\\s]+(?:" + MONTHS + ")[-/\\\\.\\\\s,]+\\\\d{2,4}\\\\b)","i");
        function hasDateMatch(str){return str?DATE_REGEX.test(str):false;}
        self.onmessage=function(e){const{rawData,userId,originalFileName}=e.data;processData(rawData,userId,originalFileName);};
        function processData(rawData,userId,originalFileName){
            try{
                const caseGroups=new Map();
                rawData.forEach(row=>{const caseId=row.caseid||row['case id']||"UNKNOWN_ID";if(!caseGroups.has(caseId))caseGroups.set(caseId,[]);caseGroups.get(caseId).push(row);});
                const manualReviewCases=[];const autoCloseCases=[];const totalGroups=caseGroups.size;let processedCount=0;
                for(const[caseId,rows]of caseGroups){
                    const analysis=analyzeCase(rows);const bestRow=selectBestRow(rows);
                    if(analysis.requiresManualReview){const aggregatedRow=aggregateCaseData(rows,bestRow);manualReviewCases.push({...aggregatedRow,'Risk_Factor':analysis.reason});}
                    else{autoCloseCases.push(bestRow);}
                    processedCount++;
                    if(processedCount%100===0||processedCount===totalGroups){const percent=30+Math.floor((processedCount/totalGroups)*45);self.postMessage({type:'progress',percent:percent,text:'Analyzing Cases ('+processedCount+'/'+totalGroups+')...'});}
                }
                self.postMessage({type:'progress',percent:80,text:'Building Excel Binaries...'});
                const generatedWorkbook=createConsolidatedWorkbook(rawData,autoCloseCases,manualReviewCases,originalFileName);
                const excelArray=XLSX.write(generatedWorkbook,{bookType:'xlsx',type:'array',compression:true});
                self.postMessage({type:'progress',percent:90,text:'Building Bulk Closure Report...'});
                let bulkArray=null;
                if(autoCloseCases.length>0){const bulkWorkbook=createBulkWorkbook(autoCloseCases,userId);bulkArray=XLSX.write(bulkWorkbook,{bookType:'xlsx',type:'array',compression:true});}
                self.postMessage({type:'complete',excelArray:excelArray,bulkArray:bulkArray,stats:{total:totalGroups,auto:autoCloseCases.length,manual:manualReviewCases.length},previewData:manualReviewCases.slice(0,1000)});
            }catch(e){self.postMessage({type:'error',message:e.message});}
        }
        function analyzeCase(rows){let requiresManualReview=false;let reasons=[];let hasNameSwap=false;for(const row of rows){const source=(row.sourcedata||"").toUpperCase().trim();const match=(row.matcheddata||"").toUpperCase().trim();if(source&&match){const sourceTokens=source.split(/\s+/).sort().join(' ');const matchTokens=match.split(/\s+/).sort().join(' ');if(sourceTokens===matchTokens&&source!==match){hasNameSwap=true;}}if(hasDateMatch(source)||hasDateMatch(match)){requiresManualReview=true;if(!reasons.includes("Date Detected"))reasons.push("Date Detected");}if(PAN_REGEX.test(source)||PAN_REGEX.test(match)){requiresManualReview=true;if(!reasons.includes("ID Pattern Detected"))reasons.push("ID Pattern Detected");}if(COMPANY_REGEX.test(source)||COMPANY_REGEX.test(match)){requiresManualReview=true;if(!reasons.includes("Company/Entity Detected"))reasons.push("Company/Entity Detected");}if(source.length>25&&/\d/.test(source)&&!requiresManualReview){if(!hasNameSwap){requiresManualReview=true;reasons.push("Complex Address Match");}}}return{requiresManualReview,reason:reasons.join(", ")};}
        function isGenericGeo(str){if(!str)return true;const clean=str.replace(/[^A-Z\s]/g,'').trim();const words=clean.split(/\s+/);return words.every(w=>w.length<3||GEO_STOPWORDS.has(w));}
        function selectBestRow(rows){return rows.reduce((prev,curr)=>{const prevSource=(prev.sourcedata||"").toUpperCase();const currSource=(curr.sourcedata||"").toUpperCase();const prevIsGeneric=isGenericGeo(prevSource);const currIsGeneric=isGenericGeo(currSource);if(!currIsGeneric&&prevIsGeneric)return curr;if(!currIsGeneric&&!prevIsGeneric)return currSource.length>prevSource.length?curr:prev;return currSource.length>prevSource.length?curr:prev;});}
        function aggregateCaseData(rows,templateRow){const uniqueSource=new Set();const uniqueMatch=new Set();let sourceCharCount=0;let matchCharCount=0;const CHAR_LIMIT=30000;for(const r of rows){const s=(r.sourcedata||"").trim();const m=(r.matcheddata||"").trim();if(s&&!uniqueSource.has(s)&&sourceCharCount<CHAR_LIMIT){uniqueSource.add(s);sourceCharCount+=s.length+1;}if(m&&!uniqueMatch.has(m)&&matchCharCount<CHAR_LIMIT){uniqueMatch.add(m);matchCharCount+=m.length+1;}}return{...templateRow,sourcedata:Array.from(uniqueSource).join('\\n'),matcheddata:Array.from(uniqueMatch).join('\\n')};}
        function applyStyles(ws){if(!ws['!ref'])return;const range=XLSX.utils.decode_range(ws['!ref']);const borderStyle={top:{style:"thin",color:{auto:1}},bottom:{style:"thin",color:{auto:1}},left:{style:"thin",color:{auto:1}},right:{style:"thin",color:{auto:1}}};const headerStyle={fill:{fgColor:{rgb:"FFFF00"}},font:{bold:true,color:{rgb:"000000"}},alignment:{horizontal:"center",vertical:"center"},border:borderStyle};for(let R=range.s.r;R<=range.e.r;++R){for(let C=range.s.c;C<=range.e.c;++C){const cellRef=XLSX.utils.encode_cell({r:R,c:C});if(!ws[cellRef])continue;ws[cellRef].s=(R===0)?headerStyle:{border:borderStyle};}}}
        function calcColumnWidths(data){if(!data||data.length===0)return[];const keys=Object.keys(data[0]);return keys.map(key=>{const maxLen=data.reduce((max,row)=>{const val=row[key]?row[key].toString():"";const lineMax=val.split('\\n').reduce((lMax,line)=>Math.max(lMax,line.length),0);return Math.max(max,lineMax);},key.length);return{wch:Math.min(maxLen+2,80)};});}
        function createConsolidatedWorkbook(rawData,autoCloseData,manualReviewData,originalFileName){const wb=XLSX.utils.book_new();const ws1=XLSX.utils.json_to_sheet(rawData);applyStyles(ws1);ws1['!cols']=calcColumnWidths(rawData.slice(0,100));XLSX.utils.book_append_sheet(wb,ws1,originalFileName.substring(0,30));const ws2=XLSX.utils.json_to_sheet(autoCloseData);applyStyles(ws2);ws2['!cols']=calcColumnWidths(autoCloseData.slice(0,100));XLSX.utils.book_append_sheet(wb,ws2,"Unique cases for closure");const ws3=XLSX.utils.json_to_sheet(manualReviewData);applyStyles(ws3);if(manualReviewData.length>0)ws3['!cols']=calcColumnWidths(manualReviewData.slice(0,100));XLSX.utils.book_append_sheet(wb,ws3,"Manual Review Required");return wb;}
        function createBulkWorkbook(autoCloseData,userId){const bulkData=autoCloseData.map(row=>{const getVal=(keywords)=>{const key=Object.keys(row).find(k=>keywords.some(kw=>k.toLowerCase().includes(kw)));return key?row[key]:"";};return{"CASE IDS":getVal(["case id","case_id","caseid","case alert"]),"KYB IDS ":getVal(["customerid","customer id","customer_id"]),"DISPOSITION COMMENTS":"FALSE POSITIVE","REASON FOR CLOSURE":"No additional identifiers found to validate the hit","User Id for Closure":userId};});const wb=XLSX.utils.book_new();const ws=XLSX.utils.json_to_sheet(bulkData);applyStyles(ws,true);ws['!cols']=calcColumnWidths(bulkData);XLSX.utils.book_append_sheet(wb,ws,"Bulk Closure");return wb;}
    <\/script>

    <script>
        lucide.createIcons();
        const dropZone=document.getElementById('drop-zone');
        const fileInput=document.getElementById('file-input');
        const statusArea=document.getElementById('status-area');
        const progressBar=document.getElementById('progress-bar');
        const statusText=document.getElementById('status-text');
        const statusPercent=document.getElementById('status-percent');
        const resultArea=document.getElementById('result-area');
        const statTotal=document.getElementById('stat-total');
        const statAuto=document.getElementById('stat-auto');
        const statManual=document.getElementById('stat-manual');
        const downloadBtn=document.getElementById('download-btn');
        const downloadBulkBtn=document.getElementById('download-bulk-btn');
        const resetBtn=document.getElementById('reset-btn');
        const userIdInput=document.getElementById('user-id-input');
        const errorMessage=document.getElementById('error-message');
        const errorText=document.getElementById('error-text');
        const previewSection=document.getElementById('preview-section');
        const previewTbody=document.getElementById('preview-tbody');
        let globalExcelUrl=null;let globalBulkUrl=null;let originalFileName="NameScreening_Output";
        dropZone.addEventListener('click',()=>fileInput.click());
        dropZone.addEventListener('dragover',(e)=>{e.preventDefault();dropZone.classList.add('drag-active');});
        dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-active'));
        dropZone.addEventListener('drop',(e)=>{e.preventDefault();dropZone.classList.remove('drag-active');if(e.dataTransfer.files.length)handleFile(e.dataTransfer.files[0]);});
        fileInput.addEventListener('change',(e)=>{if(e.target.files.length)handleFile(e.target.files[0]);});
        const workerBlob=new Blob([document.getElementById('worker-code').textContent],{type:'application/javascript'});
        const worker=new Worker(URL.createObjectURL(workerBlob));
        worker.onerror=function(e){showError("Worker execution error: "+e.message);};
        worker.onmessage=function(e){
            const data=e.data;
            if(data.type==='progress'){progressBar.style.width=data.percent+'%';statusPercent.textContent=data.percent+'%';statusText.textContent=data.text;}
            else if(data.type==='complete'){
                progressBar.style.width='100%';statusPercent.textContent='100%';statusText.textContent='Ready!';
                statTotal.textContent=data.stats.total;statAuto.textContent=data.stats.auto;statManual.textContent=data.stats.manual;
                if(globalExcelUrl)URL.revokeObjectURL(globalExcelUrl);if(globalBulkUrl)URL.revokeObjectURL(globalBulkUrl);
                globalExcelUrl=URL.createObjectURL(new Blob([data.excelArray],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
                if(data.bulkArray){globalBulkUrl=URL.createObjectURL(new Blob([data.bulkArray],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));downloadBulkBtn.style.pointerEvents='auto';}
                else{globalBulkUrl=null;downloadBulkBtn.style.pointerEvents='none';downloadBulkBtn.textContent='No Auto-Close Data';}
                lucide.createIcons();renderPreviewTable(data.previewData);
                setTimeout(()=>{resultArea.classList.remove('hidden');previewSection.classList.remove('hidden');},400);
            }
            else if(data.type==='error'){showError(data.message);}
        };
        function handleFile(file){
            errorMessage.classList.add('hidden');resultArea.classList.add('hidden');previewSection.classList.add('hidden');
            dropZone.classList.add('hidden');document.getElementById('config-section').classList.add('hidden');
            statusArea.classList.remove('hidden');progressBar.style.width='0%';statusPercent.textContent="0%";statusText.textContent="Reading file...";
            originalFileName=file.name.replace(/\\.[^/.]+$/,"");const userId=userIdInput.value.trim()||'manas2.tiwari';
            let processedRows=[];const fileSize=file.size;
            Papa.parse(file,{header:true,skipEmptyLines:true,transformHeader:(header)=>header.trim().toLowerCase().replace(/^\\ufeff/,''),
                step:(results)=>{if(results.data)processedRows.push(results.data);if(results.meta&&results.meta.cursor&&processedRows.length%2000===0){const percent=Math.min(Math.round((results.meta.cursor/fileSize)*30),30);progressBar.style.width=percent+'%';statusPercent.textContent=percent+'%';statusText.textContent='Parsing Data Stream...';}},
                complete:()=>{progressBar.style.width='30%';statusPercent.textContent='30%';statusText.textContent='Sending to processor...';worker.postMessage({rawData:processedRows,userId,originalFileName});},
                error:(err)=>{showError("Error reading file: "+err.message);}
            });
        }
        function renderPreviewTable(previewData){
            previewTbody.innerHTML='';
            if(!previewData||previewData.length===0){previewTbody.innerHTML='<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500 italic">No manual review cases detected.<\/td><\/tr>';return;}
            previewData.forEach(row=>{const tr=document.createElement('tr');const caseId=row.caseid||row['case id']||row['case ids']||"N/A";const source=(row.sourcedata||"N/A").replace(/"/g,'&quot;');const match=(row.matcheddata||"N/A").replace(/"/g,'&quot;');const risk=row['Risk_Factor']||"Flagged";tr.innerHTML='<td class="px-4 py-3 font-medium text-gray-900 truncate max-w-[120px]" title="'+caseId+'">'+caseId+'<\/td><td class="px-4 py-3 truncate max-w-[200px]" title="'+source+'">'+source+'<\/td><td class="px-4 py-3 truncate max-w-[200px]" title="'+match+'">'+match+'<\/td><td class="px-4 py-3 font-semibold text-amber-600 whitespace-nowrap">'+risk+'<\/td>';previewTbody.appendChild(tr);});
        }
        downloadBtn.addEventListener('click',()=>{if(globalExcelUrl){const a=document.createElement('a');a.href=globalExcelUrl;a.download=originalFileName+'_Processed.xlsx';a.click();}});
        downloadBulkBtn.addEventListener('click',()=>{if(globalBulkUrl){const a=document.createElement('a');a.href=globalBulkUrl;a.download='Bulk_Closure_Report_'+originalFileName+'.xlsx';a.click();}});
        resetBtn.addEventListener('click',()=>{if(globalExcelUrl)URL.revokeObjectURL(globalExcelUrl);if(globalBulkUrl)URL.revokeObjectURL(globalBulkUrl);globalExcelUrl=null;globalBulkUrl=null;fileInput.value='';resultArea.classList.add('hidden');previewSection.classList.add('hidden');statusArea.classList.add('hidden');dropZone.classList.remove('hidden');document.getElementById('config-section').classList.remove('hidden');});
        function showError(msg){statusArea.classList.add('hidden');errorText.textContent=msg;errorMessage.classList.remove('hidden');dropZone.classList.remove('hidden');document.getElementById('config-section').classList.remove('hidden');}
    <\/script>
<\/body>
<\/html>`;

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h1>Name Screening Processor</h1>
          <p>Automated SSG name screening file processing tool</p>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '85vh', border: 'none' }}
          title="Name Screening Processor"
        />
      </div>
    </div>
  );
}
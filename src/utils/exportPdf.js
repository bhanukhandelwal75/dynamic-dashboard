// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// /**
//  * Exports a DOM element to a branded PDF file.
//  * @param {string} elementId - ID of the element to capture
//  * @param {string} pageTitle  - Page title shown in the PDF header
//  * @param {string} subTitle   - Optional sub-line (e.g. file name + record count)
//  */
// export async function exportToPdf(elementId, pageTitle, subTitle = '') {
//   const element = document.getElementById(elementId);
//   if (!element) {
//     console.error(`exportToPdf: element #${elementId} not found`);
//     return;
//   }

//   // ── Capture DOM → Canvas ────────────────────────────────────────
//   const canvas = await html2canvas(element, {
//     scale: 2,                        // 2× for retina quality
//     useCORS: true,
//     logging: false,
//     backgroundColor: '#f0f2f5',
//     scrollX: 0,
//     scrollY: -window.scrollY,        // capture full content, not just viewport
//     windowWidth: element.scrollWidth,
//     windowHeight: element.scrollHeight,
//   });

//   // ── PDF setup (A4 landscape) ────────────────────────────────────
//   const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
//   const PW = pdf.internal.pageSize.getWidth();   // 297
//   const PH = pdf.internal.pageSize.getHeight();  // 210

//   const HEADER_H  = 14;   // mm
//   const MARGIN    = 6;    // mm sides
//   const CONTENT_Y = HEADER_H + 4;
//   const CONTENT_W = PW - MARGIN * 2;

//   // ── Branded header ──────────────────────────────────────────────
//   const drawHeader = (pdf, isFirstPage) => {
//     // Blue bar
//     pdf.setFillColor(26, 115, 232);
//     pdf.rect(0, 0, PW, HEADER_H, 'F');

//     // Left: brand + title
//     pdf.setTextColor(255, 255, 255);
//     pdf.setFontSize(9);
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('Dashboard Panel  |  AML Operations', MARGIN, 5.5);
//     pdf.setFontSize(11);
//     pdf.text(pageTitle, MARGIN, 11);

//     // Right: date + page tag
//     const dateStr = new Date().toLocaleDateString('en-GB', {
//       weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
//     });
//     pdf.setFontSize(8);
//     pdf.setFont('helvetica', 'normal');
//     pdf.text(`Exported: ${dateStr}`, PW - MARGIN, 5.5, { align: 'right' });
//     if (subTitle) {
//       pdf.text(subTitle, PW - MARGIN, 11, { align: 'right' });
//     }
//   };

//   // ── Slice image across pages ────────────────────────────────────
//   const imgWidthPx   = canvas.width;
//   const imgHeightPx  = canvas.height;
//   const scaleFactor  = CONTENT_W / imgWidthPx;          // mm per px
//   const totalHeightMm = imgHeightPx * scaleFactor;

//   const availPerPage = PH - CONTENT_Y - MARGIN;          // mm of content per page
//   const pageCount    = Math.ceil(totalHeightMm / availPerPage);

//   for (let i = 0; i < pageCount; i++) {
//     if (i > 0) pdf.addPage();

//     drawHeader(pdf, i === 0);

//     // How many canvas-px fit on this PDF page
//     const sliceHeightPx = Math.min(availPerPage / scaleFactor, imgHeightPx - i * availPerPage / scaleFactor);
//     const srcY           = Math.round(i * availPerPage / scaleFactor);

//     // Render the slice into a temp canvas
//     const sliceCanvas      = document.createElement('canvas');
//     sliceCanvas.width      = imgWidthPx;
//     sliceCanvas.height     = Math.round(sliceHeightPx);
//     const ctx              = sliceCanvas.getContext('2d');
//     ctx.drawImage(canvas, 0, -srcY);

//     const sliceData    = sliceCanvas.toDataURL('image/png');
//     const sliceH       = sliceHeightPx * scaleFactor;  // mm

//     pdf.addImage(sliceData, 'PNG', MARGIN, CONTENT_Y, CONTENT_W, sliceH, '', 'FAST');

//     // Page number footer
//     pdf.setTextColor(150);
//     pdf.setFontSize(7);
//     pdf.setFont('helvetica', 'normal');
//     pdf.text(`Page ${i + 1} of ${pageCount}`, PW / 2, PH - 2, { align: 'center' });
//   }

//   // ── Download as a properly named .pdf file ──────────────────────
//   // pdf.save() internally uses a blob URL but loses the filename in
//   // Edge / Chrome — causing random UUID downloads with no extension.
//   // Using a manual <a download="..."> approach fixes this.
//   const safeName = pageTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
//   const dateTag  = new Date().toISOString().slice(0, 10);
//   const fileName = `AML-${safeName}-${dateTag}.pdf`;

//   const blob = pdf.output('blob');
//   const url  = URL.createObjectURL(blob);

//   const link    = document.createElement('a');
//   link.href     = url;
//   link.download = fileName;
//   link.style.display = 'none';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   setTimeout(() => URL.revokeObjectURL(url), 5000);
// }



// this code is good not better as light pdf 


import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a DOM element to a branded PDF file.
 */
export async function exportToPdf(elementId, pageTitle, subTitle = '') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`exportToPdf: element #${elementId} not found`);
    return;
  }

  // 🔥 FIX: Force solid colors before capture (VERY IMPORTANT)
  const cards = document.querySelectorAll('.kpi-card');
  const buttons = document.querySelectorAll('.export-btn');

  cards.forEach(el => {
    el.style.background = '#ffffff';
    el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.25)';
  });

  buttons.forEach(el => {
    el.style.background = '#1a73e8';
    el.style.color = '#ffffff';
    el.style.border = 'none';
  });

  // ── Capture DOM → Canvas ────────────────────────────────────────
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  // ── PDF setup ───────────────────────────────────────────────────
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();

  const HEADER_H  = 14;
  const MARGIN    = 6;
  const CONTENT_Y = HEADER_H + 4;
  const CONTENT_W = PW - MARGIN * 2;

  // ── Header ──────────────────────────────────────────────────────
  const drawHeader = (pdf) => {
    pdf.setFillColor(26, 115, 232);
    pdf.rect(0, 0, PW, HEADER_H, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dashboard Panel  |  AML Operations', MARGIN, 5.5);

    pdf.setFontSize(11);
    pdf.text(pageTitle, MARGIN, 11);

    const dateStr = new Date().toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported: ${dateStr}`, PW - MARGIN, 5.5, { align: 'right' });

    if (subTitle) {
      pdf.text(subTitle, PW - MARGIN, 11, { align: 'right' });
    }
  };

  // ── Pagination ──────────────────────────────────────────────────
  const imgWidthPx   = canvas.width;
  const imgHeightPx  = canvas.height;
  const scaleFactor  = CONTENT_W / imgWidthPx;
  const totalHeightMm = imgHeightPx * scaleFactor;

  const availPerPage = PH - CONTENT_Y - MARGIN;
  const pageCount    = Math.ceil(totalHeightMm / availPerPage);

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();

    drawHeader(pdf);

    const sliceHeightPx = Math.min(
      availPerPage / scaleFactor,
      imgHeightPx - i * availPerPage / scaleFactor
    );

    const srcY = Math.round(i * availPerPage / scaleFactor);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidthPx;
    sliceCanvas.height = Math.round(sliceHeightPx);

    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, -srcY);

    const sliceData = sliceCanvas.toDataURL('image/png');
    const sliceH = sliceHeightPx * scaleFactor;

    pdf.addImage(sliceData, 'PNG', MARGIN, CONTENT_Y, CONTENT_W, sliceH, '', 'FAST');

    pdf.setTextColor(150);
    pdf.setFontSize(7);
    pdf.text(`Page ${i + 1} of ${pageCount}`, PW / 2, PH - 2, { align: 'center' });
  }

  // ── Download ────────────────────────────────────────────────────
  const safeName = pageTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const dateTag  = new Date().toISOString().slice(0, 10);
  const fileName = `AML-${safeName}-${dateTag}.pdf`;

  const blob = pdf.output('blob');
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}







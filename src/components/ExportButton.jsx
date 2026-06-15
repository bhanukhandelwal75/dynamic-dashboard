// import { useState } from 'react';
// import { exportToPdf } from '../utils/exportPdf';

// /**
//  * Reusable PDF export button.
//  * @prop {string} targetId   - ID of the DOM element to capture
//  * @prop {string} pageTitle  - Title shown in the PDF header
//  * @prop {string} subTitle   - Optional sub-line (file name, record count, etc.)
//  * @prop {boolean} disabled  - Disable when no data is loaded
//  */
// export default function ExportButton({ targetId, pageTitle, subTitle = '', disabled = false }) {
//   const [loading, setLoading] = useState(false);

//   const handleExport = async () => {
//     if (disabled || loading) return;
//     setLoading(true);
//     try {
//       await exportToPdf(targetId, pageTitle, subTitle);
//     } catch (err) {
//       console.error('PDF export failed:', err);
//       alert('PDF export failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       className="export-btn"
//       onClick={handleExport}
//       disabled={disabled || loading}
//       title={disabled ? 'Upload a CDR file first to enable export' : `Export ${pageTitle} as PDF`}
//     >
//       {loading ? (
//         <>
//           <span className="export-spinner" /> Generating…
//         </>
//       ) : (
//         <>📄 Export PDF</>
//       )}
//     </button>
//   );
// }



import { useState } from 'react';
import { exportToPdf } from '../utils/exportPdf';

/**
 * Reusable PDF export button.
 * @prop {string} targetId   - ID of the DOM element to capture
 * @prop {string} pageTitle  - Title shown in the PDF header
 * @prop {string} subTitle   - Optional sub-line (file name, record count, etc.)
 * @prop {boolean} disabled  - Disable when no data is loaded
 */
export default function ExportButton({ targetId, pageTitle, subTitle = '', disabled = false }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (disabled || loading) return;
    setLoading(true);

    // ─── MAC/PDF WASHED OUT FIX ──────────────────────────────
    // Temporarily remove the fade-in animation from the dashboard
    // so the PDF screenshot captures it at 100% full opacity.
    const targetElement = document.getElementById(targetId);
    let originalAnimation = '';
    let originalOpacity = '';

    if (targetElement) {
      originalAnimation = targetElement.style.animation;
      originalOpacity = targetElement.style.opacity;
      targetElement.style.animation = 'none';
      targetElement.style.opacity = '1';
    }
    // ─────────────────────────────────────────────────────────

    try {
      await exportToPdf(targetId, pageTitle, subTitle);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      // ─── RESTORE PREVIOUS STYLES ───────────────────────────
      if (targetElement) {
        targetElement.style.animation = originalAnimation;
        targetElement.style.opacity = originalOpacity;
      }
      // ─────────────────────────────────────────────────────────
      setLoading(false);
    }
  };

  return (
    <button
      className="export-btn"
      onClick={handleExport}
      disabled={disabled || loading}
      title={disabled ? 'Upload a CDR file first to enable export' : `Export ${pageTitle} as PDF`}
    >
      {loading ? (
        <>
          <span className="export-spinner" /> Generating…
        </>
      ) : (
        <>📄 Export PDF</>
      )}
    </button>
  );
}




// import { useState } from 'react';
// import { exportToPdf } from '../utils/exportPdf';

// /**
//  * Reusable PDF export button.
//  */
// export default function ExportButton({
//   targetId,
//   pageTitle,
//   subTitle = '',
//   disabled = false
// }) {
//   const [loading, setLoading] = useState(false);

//   const handleExport = () => {
//     if (disabled || loading) return;

//     setLoading(true);

//     try {
//       // 🔥 No async/await needed now (print-based)
//       exportToPdf(targetId, pageTitle, subTitle);
//     } catch (err) {
//       console.error('PDF export failed:', err);
//       alert('PDF export failed. Please try again.');
//     }

//     // 🔥 Reset loading after short delay (print dialog time)
//     setTimeout(() => {
//       setLoading(false);
//     }, 1000);
//   };

//   return (
//     <button
//       className="export-btn"
//       onClick={handleExport}
//       disabled={disabled || loading}
//       title={
//         disabled
//           ? 'Upload a CDR file first to enable export'
//           : `Export ${pageTitle} as PDF`
//       }
//     >
//       {loading ? (
//         <>
//           <span className="export-spinner" /> Preparing PDF...
//         </>
//       ) : (
//         <>📄 Export PDF</>
//       )}
//     </button>
//   );
// }







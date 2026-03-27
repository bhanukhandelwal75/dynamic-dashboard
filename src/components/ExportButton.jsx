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
    try {
      await exportToPdf(targetId, pageTitle, subTitle);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
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

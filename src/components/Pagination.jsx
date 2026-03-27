export default function Pagination({ currentPage, totalPages, totalRecords, onPageChange, label = '' }) {
  return (
    <div className="pagination">
      <span>{typeof totalRecords === 'number' ? `${totalRecords.toLocaleString()} records${label ? ' ' + label : ''}` : ''}</span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ‹ Prev
        </button>
        <span className="page-label">
          {currentPage + 1} / {Math.max(1, totalPages)}
        </span>
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

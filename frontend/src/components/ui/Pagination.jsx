import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalItems <= 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`bg-surface border-t border-border px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-text-secondary ${className}`}
    >
      <div>
        <span>
          แสดง <strong className="font-semibold text-text-primary">{startIndex}</strong> -{' '}
          <strong className="font-semibold text-text-primary">{endIndex}</strong> จากทั้งหมด{' '}
          <strong className="font-semibold text-text-primary">{totalItems}</strong> รายการ
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="หน้าก่อนหน้า"
            className="px-3 h-10 rounded-sm border border-border bg-surface text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-fast cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-text-muted">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`min-w-9 h-9 px-2 rounded-sm text-body-sm font-medium transition-colors duration-fast cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'border border-border bg-surface text-text-secondary hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="หน้าถัดไป"
            className="px-3 h-10 rounded-sm border border-border bg-surface text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-fast cursor-pointer"
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;

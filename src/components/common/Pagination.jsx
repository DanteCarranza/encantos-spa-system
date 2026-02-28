import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Pagination.css'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true,
  maxButtons = 5 
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="pagination">
      {/* Botón Primera */}
      {showFirstLast && currentPage > 1 && (
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          title="Primera página"
        >
          Primera
        </button>
      )}

      {/* Botón Anterior */}
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        <FiChevronLeft />
        <span className="pagination-text">Anterior</span>
      </button>

      {/* Números de página */}
      <div className="pagination-numbers">
        {pages[0] > 1 && (
          <>
            <button
              className="pagination-number"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-number"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Botón Siguiente */}
      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Página siguiente"
      >
        <span className="pagination-text">Siguiente</span>
        <FiChevronRight />
      </button>

      {/* Botón Última */}
      {showFirstLast && currentPage < totalPages && (
        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          title="Última página"
        >
          Última
        </button>
      )}
    </div>
  )
}

export default Pagination
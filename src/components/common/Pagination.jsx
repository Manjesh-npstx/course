import PropTypes from "prop-types";
import "./Pagination.css";

/**
 * Reusable pagination component.
 */
export function Pagination({ page, totalPages, total, onPageChange }) {
    if (totalPages <= 1 && total <= 10) return null;

    return (
        <div className="pagination-container">
            <span>Total records: {total}</span>
            <div className="pagination-controls">
                <button
                    type="button"
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </button>
                <span className="pagination-page-indicator">
                    Page {page} of {Math.max(totalPages, 1)}
                </span>
                <button
                    type="button"
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;

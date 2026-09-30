import PropTypes from "prop-types";
import "./SearchBar.css";

/**
 * Reusable SearchBar with icon and clear action.
 */
export function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    onClear,
}) {
    return (
        <div className="search-bar">
            <span className="search-icon" aria-hidden="true">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </span>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    type="button"
                    className="search-clear"
                    onClick={onClear}
                    aria-label="Clear search"
                >
                    &times;
                </button>
            )}
        </div>
    );
}

SearchBar.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    onClear: PropTypes.func.isRequired,
};

export default SearchBar;

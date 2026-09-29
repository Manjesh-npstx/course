import PropTypes from "prop-types";
import "./Input.css";

/**
 * Reusable form input with accessible label and inline error display.
 *
 * @param {Object} props
 * @param {string} props.id - Unique ID connecting label to input.
 * @param {string} props.label - Text shown in the label.
 * @param {string} props.type - HTML input type.
 * @param {string} props.name - Form field name.
 * @param {string} props.value - Current input value.
 * @param {Function} props.onChange - Change handler.
 * @param {string} props.error - Inline validation error message.
 * @param {boolean} props.disabled - Whether input is disabled.
 * @returns {JSX.Element}
 */
function Input({ id, label, type, name, value, onChange, error, disabled }) {
    const hasError = Boolean(error);

    return (
        <div className="input-container">
            <label htmlFor={id} className="input-label">
                {label}
            </label>

            <input
                id={id}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`input-field ${hasError ? "input-error" : ""}`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${id}-error` : undefined}
            />

            {hasError && (
                <p id={`${id}-error`} role="alert" className="error-text">
                    {error}
                </p>
            )}
        </div>
    );
}

Input.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    disabled: PropTypes.bool,
};

Input.defaultProps = {
    type: "text",
    error: "",
    disabled: false,
};

export default Input;

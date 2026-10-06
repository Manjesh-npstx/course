import { useState } from "react";
import PropTypes from "prop-types";
import "./Input.css";

/**
 * Reusable form input with accessible label, inline error display,
 * and optional password visibility toggle.
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
 * @param {string} [props.helperText] - Accessible helper text.
 * @returns {JSX.Element}
 */
function Input({
    id,
    label,
    type,
    name,
    value,
    onChange,
    error,
    disabled,
    helperText,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText) && !hasError;
    const isPasswordField = type === "password";
    const actualType = isPasswordField
        ? showPassword
            ? "text"
            : "password"
        : type;

    return (
        <div className="input-container">
            <label htmlFor={id} className="input-label">
                {label}
            </label>

            <div className="input-wrapper">
                <input
                    id={id}
                    type={actualType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`input-field ${hasError ? "input-error" : ""} ${
                        isPasswordField ? "input-field-has-toggle" : ""
                    }`}
                    aria-invalid={hasError}
                    aria-describedby={
                        hasError
                            ? `${id}-error`
                            : hasHelper
                              ? `${id}-helper`
                              : undefined
                    }
                />

                {isPasswordField && (
                    <button
                        type="button"
                        className="input-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                        title={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {hasHelper && (
                <p id={`${id}-helper`} className="helper-text">
                    {helperText}
                </p>
            )}

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
    helperText: PropTypes.string,
};

Input.defaultProps = {
    type: "text",
    error: "",
    disabled: false,
    helperText: "",
};

export default Input;

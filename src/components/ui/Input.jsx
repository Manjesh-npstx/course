import PropTypes from "prop-types";
import "./Input.css";
/**
 * Reusable form input with an accessible label.
 *
 * @param {Object} props
 * @param {string} props.id - Unique ID connecting the label to the input.
 * @param {string} props.label - Text shown above the input.
 * @param {string} props.type - HTML input type.
 * @param {string} props.name - Form field name.
 * @param {string} props.value - Current input value.
 * @param {Function} props.onChange - Function called when the value changes.
 * @param {string} props.error - Validation error message.
 */
function Input({ id, label, type, name, value, onChange, error }) {
    return (
        <div classname="input-container">
            <label htmlFor={id}>{label}</label>

            <input
                id={id}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
            />

            {error && (
                <p id={`${id}-error`} role="alert">
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
};

Input.defaultProps = {
    type: "text",
    error: "",
};

export default Input;
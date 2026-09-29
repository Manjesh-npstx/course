import PropTypes from "prop-types";
import "./Button.css";
/**
 * Reusable button for user actions throughout the application.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content displayed inside the button.
 * @param {"button"|"submit"|"reset"} props.type - Native button behavior.
 * @param {boolean} props.disabled - Prevents interaction while an action is running.
 * @param {Function} props.onClick - Function called when the button is clicked.
 * @returns {JSX.Element}
 */
function Button({ children, type, disabled, onClick }) {
    return (
        <button
            className="button"
            type={type}
            disabled={disabled}
            onClick={onClick}
        >
            {children}

        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
};

Button.defaultProps = {
    type: "button",
    disabled: false,
    onClick: undefined,
};

export default Button;
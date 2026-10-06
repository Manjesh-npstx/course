import PropTypes from "prop-types";
import "./Button.css";

/**
 * Reusable button for user actions throughout the application.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content displayed inside the button.
 * @param {"button"|"submit"|"reset"} [props.type="button"] - Native button behavior.
 * @param {boolean} [props.disabled=false] - Prevents interaction while an action is running.
 * @param {Function} [props.onClick] - Function called when the button is clicked.
 * @param {"primary"|"secondary"|"danger"} [props.variant="primary"] - Visual style variant.
 * @param {"small"|"medium"|"large"} [props.size="medium"] - Button size.
 * @param {boolean} [props.fullWidth=false] - Whether button fills container width.
 * @param {string} [props.className=""] - Additional CSS classes.
 * @returns {JSX.Element}
 */
export function Button({
    children,
    type = "button",
    disabled = false,
    onClick,
    variant = "primary",
    size = "medium",
    fullWidth = false,
    className = "",
    ...props
}) {
    const classes = [
        "button",
        `button-${variant}`,
        `button-${size}`,
        fullWidth ? "button-full-width" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            className={classes}
            type={type}
            disabled={disabled}
            onClick={onClick}
            {...props}
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
    variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
    size: PropTypes.oneOf(["small", "medium", "large"]),
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
};

export default Button;

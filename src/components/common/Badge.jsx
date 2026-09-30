import PropTypes from "prop-types";
import "./Badge.css";

/**
 * Reusable visual badge for status and role labels.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'default'|'primary'|'success'|'warning'|'danger'} [props.variant='default']
 * @param {string} [props.className='']
 * @returns {JSX.Element}
 */
export function Badge({ children, variant = "default", className = "" }) {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {children}
        </span>
    );
}

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf([
        "default",
        "primary",
        "success",
        "warning",
        "danger",
    ]),
    className: PropTypes.string,
};

export default Badge;

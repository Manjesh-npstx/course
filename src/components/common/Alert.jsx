import PropTypes from "prop-types";

/**
 * Reusable alert banner for announcements and error messages.
 *
 * @param {Object} props
 * @param {'error' | 'success'} [props.type='error'] - Alert visual style and aria role.
 * @param {React.ReactNode} props.children - Banner content.
 * @returns {JSX.Element | null}
 */
function Alert({ type = "error", children }) {
    if (!children) {
        return null;
    }
    const role = type === "error" ? "alert" : "status";
    return (
        <div role={role} className={`alert-banner alert-${type}`}>
            {children}
        </div>
    );
}

Alert.propTypes = {
    type: PropTypes.oneOf(["error", "success"]),
    children: PropTypes.node,
};

export default Alert;

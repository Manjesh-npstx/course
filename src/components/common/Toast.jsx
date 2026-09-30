import { useEffect } from "react";
import PropTypes from "prop-types";
import "./Toast.css";

/**
 * Toast feedback notification with automatic dismissal.
 */
export function Toast({ message, type = "success", onClose, duration = 4000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className={`toast toast-${type}`} role="status">
            <span>{message}</span>
            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                &times;
            </button>
        </div>
    );
}

Toast.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(["success", "error"]),
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
};

export default Toast;

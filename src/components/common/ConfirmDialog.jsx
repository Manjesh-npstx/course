import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import "./ConfirmDialog.css";

/**
 * Reusable modal confirmation dialog for destructive actions.
 */
export function ConfirmDialog({
    isOpen,
    title = "Confirm Action",
    message,
    confirmLabel = "Delete",
    onConfirm,
    onClose,
    isLoading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="confirm-dialog-content">
                <p className="confirm-dialog-message">{message}</p>
                <div className="confirm-dialog-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default ConfirmDialog;

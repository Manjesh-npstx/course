import PropTypes from "prop-types";
import "./PasswordRequirements.css";

import { PASSWORD_RULES } from "./registerSchema";

/**
 * Visual checklist providing real-time feedback on password complexity requirements.
 *
 * @param {Object} props
 * @param {string} props.password - Current password string entered by user.
 * @returns {JSX.Element}
 */
function PasswordRequirements({ password }) {
    const pwd = password || "";

    return (
        <div className="password-requirements" aria-live="polite">
            <p className="password-requirements-title">
                Password must contain:
            </p>
            <ul
                className="password-requirements-list"
                aria-label="Password complexity criteria"
            >
                {PASSWORD_RULES.map((rule) => {
                    const isMet = rule.check(pwd);
                    return (
                        <li
                            key={rule.id}
                            className={`requirement-item ${isMet ? "met" : ""}`}
                        >
                            <span
                                className="requirement-icon"
                                aria-hidden="true"
                            >
                                {isMet ? "✓" : "○"}
                            </span>
                            <span>{rule.label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

PasswordRequirements.propTypes = {
    password: PropTypes.string,
};

PasswordRequirements.defaultProps = {
    password: "",
};

export default PasswordRequirements;

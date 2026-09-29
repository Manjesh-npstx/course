import { APP_CONFIG } from "@/constants/config";
import "./Footer.css";

/**
 * Global footer showing application copyright notice.
 *
 * @returns {JSX.Element}
 */
function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <p>{APP_CONFIG.COPYRIGHT}</p>
            </div>
        </footer>
    );
}

export default Footer;

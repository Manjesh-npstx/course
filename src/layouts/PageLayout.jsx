import PropTypes from "prop-types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./PageLayout.css";

/**
 * Shared page shell wrapping all views in a global Header and Footer.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Route view component to render.
 * @returns {JSX.Element}
 */
function PageLayout({ children }) {
    return (
        <div className="page-layout">
            <Header />
            <main className="page-content">{children}</main>
            <Footer />
        </div>
    );
}

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PageLayout;

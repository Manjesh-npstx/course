import PropTypes from "prop-types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./PageLayout.css";

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
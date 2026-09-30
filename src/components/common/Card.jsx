import PropTypes from "prop-types";
import "./Card.css";
/**
 * Reusable container for grouping related content.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside the card.
 * @returns {JSX.Element}
 */
function Card({ children }) {
    return <section className="card">{children}</section>;
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Card;

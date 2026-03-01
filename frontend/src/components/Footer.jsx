import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>BRIGHT VILLAS</h3>
          <p className="footer-tagline">NEVER MISS A MOMENT</p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>QUICK LINKS</h3>
          <ul className="quick-links">
            <li>
              <Link to="/villas">Our Villas</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms & Conditions</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>CONTACT</h3>
          <div className="contact-info">
            <p>
              <i className="fas fa-phone"></i>
              <span>+91-8999390889</span>
            </p>
            <p>
              <i className="fas fa-envelope"></i>
              <span>websetglob@gmail.com</span>
            </p>
            <Link to="/contact" className="btn-contact-footer">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © 2025 Bright Villas | All rights reserved.</p>
      </div>

      {/* WebSetGlob Branding */}
      <div className="websetglob-branding">
        <a
          href="https://www.instagram.com/websetglob?igsh=MTIzZXNoNmN2cm9uaA=="
          target="_blank"
          rel="noopener noreferrer"
          className="websetglob-link">
          <img
            src="/images/logo.png"
            alt="WebSetGlob Logo"
            className="websetglob-logo"
          />
          <span className="websetglob-name">WebSetGlob</span>
        </a>
        <p className="websetglob-tagline">We Make Websites</p>
      </div>
    </footer>
  );
};

export default Footer;

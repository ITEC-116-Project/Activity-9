import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>🛒 Mini E-Commerce</h3>
          <p className="footer-description">
            Your one-stop shop for quality products at affordable prices. 
            We provide excellent customer service and fast delivery across the Philippines.
          </p>
        </div>
        
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <span>1-1 Aguinaldo Bldg. Centennial Road Kawit, Cavite Philippines</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>+63 998 7654 321</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>admin@shop.com</span>
          </div>
        </div>
        
        <div className="footer-hours">
          <h4>Business Hours</h4>
          <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
          <p>Saturday: 10:00 AM - 4:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Mini E-Commerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

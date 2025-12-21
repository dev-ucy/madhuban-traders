import React from 'react'

export default function AppFooter(){
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📍 Madhuban Traders, Sindhora Bazar , Varanasi, India</p>
          <p>📱 +91 7897061003</p>
          <p>✉️ info@madhubantraders.in</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/catalog">Products</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/shipping">Shipping & Returns</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61576880997873" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="src/assets/facebook_icon.svg.png" className="social-icon" alt="Facebook" />
            </a>
            <a href="https://www.youtube.com/@MadhubanOilCompany" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img src="src/assets/YouTube_Logo_2017.svg.png" className="social-icon" alt="YouTube" />
            </a>
            <a href="https://www.instagram.com/madhubanoil10?igsh=NnIycTE1NWd4Y3h2" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="src/assets/Instagram_logo_2016.svg.png" className="social-icon" alt="Instagram" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Madhuban Traders. All rights reserved.</p>
      </div>
    </footer>
  )
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/">🛒 Mini E-Commerce</Link>
        </div>

        <nav className="header-nav">
          <Link to="/products" className="nav-link">Products</Link>
          
          {user ? (
            <>
              {!isAdmin() && (
                <>
                  <Link to="/cart" className="nav-link">🛒 Cart</Link>
                  <Link to="/orders" className="nav-link">My Orders</Link>
                </>
              )}
              
              {isAdmin() && (
                <Link to="/admin" className="nav-link admin-link">⚙️ Admin Panel</Link>
              )}
              
              <div className="user-section" ref={dropdownRef}>
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.name}</span>
                  <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
                </button>
                
                {showDropdown && (
                  <div className="user-dropdown">
                    {!isAdmin() && (
                      <Link 
                        to="/account/settings" 
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        ⚙️ Account Settings
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

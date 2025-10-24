import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userImage, setUserImage] = useState(null);

  const userName = "John Doe";

  // Load user image from localStorage and listen for updates
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) {
      setUserImage(savedImage);
    }

    // Listen for profile image updates from Settings
    const handleProfileImageUpdate = (event) => {
      setUserImage(event.detail.image);
    };

    window.addEventListener('profileImageUpdate', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdate', handleProfileImageUpdate);
    };
  }, []);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid">
        {/* Left side - Hamburger menu */}
        <button
          className="navbar-toggler border-0 p-2 me-3"
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* App Brand/Logo */}
        <div className="navbar-brand d-flex align-items-center">
          <i className="bi bi-check2-square me-2 brand-icon"></i>
          <span className="brand-text">TaskFlow</span>
        </div>

        {/* Right Side - Theme Toggle & Profile */}
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          {/* Theme Toggle */}
          <button 
            className="theme-toggle-btn me-3"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="dropdown profile-dropdown">
            <button
              className="profile-avatar-btn"
              onClick={handleUserMenuToggle}
              aria-label="User menu"
            >
              <div className="profile-avatar-circle">
                {userImage ? (
                  <img 
                    src={userImage} 
                    alt="Profile" 
                    className="profile-avatar-image"
                  />
                ) : (
                  <i className="bi bi-person-circle"></i>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="dropdown-menu dropdown-menu-end show">
                <div className="dropdown-header">
                  <div className="user-info">
                    <h6 className="user-name">{userName}</h6>
                    <small className="user-email">john.doe@example.com</small>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#profile">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </a>
                <a className="dropdown-item" href="#settings">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </a>
                <a className="dropdown-item" href="#help">
                  <i className="bi bi-question-circle me-2"></i>
                  Help
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item text-danger" href="#logout">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {showUserMenu && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
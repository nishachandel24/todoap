import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState('Guest User');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Auth form data
  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();

    // Listen for profile image updates from Settings
    const handleProfileImageUpdate = (event) => {
      setUserImage(event.detail.image);
    };

    // Listen for auth updates
    const handleAuthUpdate = (event) => {
      if (event.detail.isLoggedIn) {
        setIsLoggedIn(true);
        setUserName(event.detail.user.username);
        setUserEmail(event.detail.user.email);
      } else {
        setIsLoggedIn(false);
        setUserName('Guest User');
        setUserEmail('');
      }
    };

    window.addEventListener('profileImageUpdate', handleProfileImageUpdate);
    window.addEventListener('userAuthUpdate', handleAuthUpdate);

    return () => {
      window.removeEventListener('profileImageUpdate', handleProfileImageUpdate);
      window.removeEventListener('userAuthUpdate', handleAuthUpdate);
    };
  }, []);

  const loadUserData = () => {
    const savedImage = localStorage.getItem('userProfileImage');
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userData');
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedImage) {
      setUserImage(savedImage);
    }
    
    if (token && savedUser) {
      setIsLoggedIn(true);
      const userData = JSON.parse(savedUser);
      setUserName(userData.username || savedName || 'User');
      setUserEmail(userData.email || savedEmail || '');
    } else {
      setUserName(savedName || 'Guest User');
      setUserEmail(savedEmail || '');
    }
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Auth handlers
  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setAuthError('');
    setAuthSuccess('');
    setAuthData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
    setAuthError('');
  };

  const validateAuthForm = () => {
    if (authMode === 'signup') {
      if (!authData.username || authData.username.length < 3) {
        setAuthError('Username must be at least 3 characters long');
        return false;
      }
      if (authData.password !== authData.confirmPassword) {
        setAuthError('Passwords do not match');
        return false;
      }
    }
    
    if (!authData.email || !authData.email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return false;
    }
    
    if (!authData.password || authData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (!validateAuthForm()) return;
    
    setAuthLoading(true);
    
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'login' 
        ? { email: authData.email, password: authData.password }
        : { username: authData.username, email: authData.email, password: authData.password };
      
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('userName', data.user.username);
      localStorage.setItem('userEmail', data.user.email);
      
      // Update state
      setIsLoggedIn(true);
      setUserName(data.user.username);
      setUserEmail(data.user.email);
      
      // Show success message
      setAuthSuccess(authMode === 'login' ? 'Login successful!' : 'Account created successfully!');
      
      // Reset form and close modal
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthData({ username: '', email: '', password: '', confirmPassword: '' });
        setAuthSuccess('');
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('userAuthUpdate', { 
          detail: { isLoggedIn: true, user: data.user } 
        }));
      }, 1500);
      
    } catch (error) {
      setAuthError(error.message || 'An error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserName('Guest User');
      setUserEmail('');
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('userAuthUpdate', { 
        detail: { isLoggedIn: false, user: null } 
      }));
      
      setShowUserMenu(false);
    }
  };

  return (
    <>
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

          {/* Right Side - Theme Toggle, Auth Buttons & Profile */}
          <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2">
            {/* Theme Toggle */}
            <div className="me-2">
              <DarkModeToggle />
            </div>

            {/* Authentication Buttons */}
            {!isLoggedIn ? (
              <div className="d-flex gap-2 me-2">
                <button 
                  className="btn btn-outline-primary btn-sm rounded-3 d-none d-md-inline-flex align-items-center"
                  onClick={() => openAuthModal('login')}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </button>
                <button 
                  className="btn btn-primary btn-sm rounded-3 d-none d-md-inline-flex align-items-center"
                  onClick={() => openAuthModal('signup')}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Sign Up
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-outline-danger btn-sm rounded-3 me-2 d-none d-md-inline-flex align-items-center"
                onClick={handleSignOut}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Sign Out
              </button>
            )}

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
                      <small className="user-email">{userEmail || 'Not logged in'}</small>
                    </div>
                    {isLoggedIn && (
                      <span className="badge bg-success mt-1">Logged In</span>
                    )}
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {/* Mobile Auth Options */}
                  {!isLoggedIn && (
                    <>
                      <a className="dropdown-item d-md-none" href="#login" onClick={(e) => {
                        e.preventDefault();
                        openAuthModal('login');
                        setShowUserMenu(false);
                      }}>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </a>
                      <a className="dropdown-item d-md-none" href="#signup" onClick={(e) => {
                        e.preventDefault();
                        openAuthModal('signup');
                        setShowUserMenu(false);
                      }}>
                        <i className="bi bi-person-plus me-2"></i>
                        Sign Up
                      </a>
                      <div className="dropdown-divider d-md-none"></div>
                    </>
                  )}
                  
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
                  {isLoggedIn ? (
                    <a className="dropdown-item text-danger d-md-none" href="#signout" onClick={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sign Out
                    </a>
                  ) : (
                    <a className="dropdown-item text-primary" href="#login" onClick={(e) => {
                      e.preventDefault();
                      openAuthModal('login');
                      setShowUserMenu(false);
                    }}>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </a>
                  )}
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

      {/* Authentication Modal */}
      {showAuthModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                      <i className={`bi ${authMode === 'login' ? 'bi-box-arrow-in-right' : 'bi-person-plus'} text-primary fs-5`}></i>
                    </div>
                    {authMode === 'login' ? 'Login to Your Account' : 'Create New Account'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAuthModal(false)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <form onSubmit={handleAuth}>
                    {authError && (
                      <div className="alert alert-danger d-flex align-items-center rounded-3 mb-3" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {authError}
                      </div>
                    )}
                    
                    {authSuccess && (
                      <div className="alert alert-success d-flex align-items-center rounded-3 mb-3" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        {authSuccess}
                      </div>
                    )}

                    {authMode === 'signup' && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-person me-2 text-primary"></i>
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          className="form-control form-control-lg rounded-3"
                          placeholder="Choose a username"
                          value={authData.username}
                          onChange={handleAuthInputChange}
                          required
                          minLength={3}
                        />
                        <small className="text-muted">At least 3 characters</small>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-envelope me-2 text-primary"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control form-control-lg rounded-3"
                        placeholder="Enter your email"
                        value={authData.email}
                        onChange={handleAuthInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock me-2 text-primary"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control form-control-lg rounded-3"
                        placeholder="Enter your password"
                        value={authData.password}
                        onChange={handleAuthInputChange}
                        required
                        minLength={6}
                      />
                      <small className="text-muted">At least 6 characters</small>
                    </div>

                    {authMode === 'signup' && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-lock-fill me-2 text-primary"></i>
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control form-control-lg rounded-3"
                          placeholder="Confirm your password"
                          value={authData.confirmPassword}
                          onChange={handleAuthInputChange}
                          required
                        />
                      </div>
                    )}

                    <div className="d-grid gap-2 mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg rounded-3"
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            {authMode === 'login' ? 'Logging in...' : 'Creating account...'}
                          </>
                        ) : (
                          <>
                            <i className={`bi ${authMode === 'login' ? 'bi-box-arrow-in-right' : 'bi-person-plus'} me-2`}></i>
                            {authMode === 'login' ? 'Login' : 'Sign Up'}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center mt-3">
                      <p className="mb-0 text-muted">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                          type="button"
                          className="btn btn-link p-0 text-primary"
                          onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        >
                          {authMode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
import React, { useState, useRef, useEffect } from 'react';

const Settings = () => {
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState('Guest User');
  const [userEmail, setUserEmail] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Auth form data
  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const fileInputRef = useRef(null);

  // Load saved data on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userData');
    const savedImage = localStorage.getItem('userProfileImage');
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (token && savedUser) {
      setIsLoggedIn(true);
      const userData = JSON.parse(savedUser);
      setUserName(userData.username || savedName || 'User');
      setUserEmail(userData.email || savedEmail || '');
    } else {
      setUserName(savedName || 'Guest User');
      setUserEmail(savedEmail || '');
    }
    
    if (savedImage) setUserImage(savedImage);

    // Listen for login/logout requests from Navbar
    const handleLoginRequest = () => {
      openAuthModal('login');
    };

    const handleLogoutRequest = () => {
      handleLogout();
    };

    window.addEventListener('requestLogin', handleLoginRequest);
    window.addEventListener('requestLogout', handleLogoutRequest);

    return () => {
      window.removeEventListener('requestLogin', handleLoginRequest);
      window.removeEventListener('requestLogout', handleLogoutRequest);
    };
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please select an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target.result);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = () => {
    if (tempImage) {
      setUserImage(tempImage);
      localStorage.setItem('userProfileImage', tempImage);
      setShowImagePreview(false);
      setTempImage(null);
      
      // Trigger a custom event to update navbar avatar
      window.dispatchEvent(new CustomEvent('profileImageUpdate', { 
        detail: { image: tempImage } 
      }));
    }
  };

  const handleImageCancel = () => {
    setShowImagePreview(false);
    setTempImage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setUserImage(null);
    localStorage.removeItem('userProfileImage');
    
    // Trigger a custom event to update navbar avatar
    window.dispatchEvent(new CustomEvent('profileImageUpdate', { 
      detail: { image: null } 
    }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', userEmail);
    
    if (isLoggedIn) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.username = userName;
      userData.email = userEmail;
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    setAuthSuccess('Profile updated successfully!');
    setTimeout(() => setAuthSuccess(''), 3000);
  };

  // Authentication handlers
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
        
        // Dispatch event to update navbar
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserName('Guest User');
      setUserEmail('');
      setAuthSuccess('Logged out successfully!');
      
      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('userAuthUpdate', { 
        detail: { isLoggedIn: false, user: null } 
      }));
      
      setTimeout(() => setAuthSuccess(''), 3000);
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setAuthError('');
    setAuthSuccess('');
    setAuthData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="settings-container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="display-6 fw-bold text-dark mb-2">Settings</h2>
          <p className="text-muted mb-0">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {authSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {authSuccess}
          <button type="button" className="btn-close" onClick={() => setAuthSuccess('')}></button>
        </div>
      )}

      {/* Account Status Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Account Status</h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${isLoggedIn ? 'bg-success' : 'bg-warning'} me-2`}>
                  {isLoggedIn ? 'Logged In' : 'Guest Mode'}
                </span>
                {isLoggedIn && <span className="text-muted small">Synced with server</span>}
              </div>
              <p className="mb-0 text-muted">
                {isLoggedIn 
                  ? 'Your data is securely stored and synced across devices.' 
                  : 'Login to sync your data across devices and secure your account.'}
              </p>
            </div>
            <div className="d-flex gap-2">
              {!isLoggedIn ? (
                <>
                  <button 
                    className="btn btn-primary rounded-3"
                    onClick={() => openAuthModal('login')}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </button>
                  <button 
                    className="btn btn-outline-primary rounded-3"
                    onClick={() => openAuthModal('signup')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Sign Up
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-outline-danger rounded-3"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Profile Settings</h5>
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h6 className="fw-semibold mb-3">Profile Photo</h6>
              
              {/* Current Profile Image */}
              <div className="text-center mb-3">
                <div className="profile-image-container position-relative d-inline-block">
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt="Profile" 
                      className="profile-settings-image"
                    />
                  ) : (
                    <div className="profile-placeholder">
                      <i className="bi bi-person-circle fs-1 text-muted"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2">
                <button 
                  className="btn btn-primary rounded-3"
                  onClick={handleImageClick}
                >
                  <i className="bi bi-camera me-2"></i>
                  {userImage ? 'Change Photo' : 'Upload Photo'}
                </button>
                
                {userImage && (
                  <button 
                    className="btn btn-outline-danger rounded-3"
                    onClick={handleRemoveImage}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Remove Photo
                  </button>
                )}
              </div>

              <small className="text-muted mt-2 d-block">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </small>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div className="col-md-8">
              <h6 className="fw-semibold mb-3">Personal Information</h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isLoggedIn}
                  />
                  {isLoggedIn && (
                    <small className="text-muted">Email cannot be changed after registration</small>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-success rounded-3"
                onClick={handleSaveProfile}
              >
                <i className="bi bi-check-lg me-2"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
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

      {/* Image Preview Modal */}
      {showImagePreview && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1060 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1061 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Preview Profile Photo</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleImageCancel}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3 text-center">
                  <div className="mb-3">
                    <img 
                      src={tempImage} 
                      alt="Preview" 
                      className="profile-preview-image"
                    />
                  </div>
                  <p className="text-muted">
                    This is how your profile photo will appear throughout the application.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3"
                    onClick={handleImageCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary rounded-3"
                    onClick={handleImageSave}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    Save Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
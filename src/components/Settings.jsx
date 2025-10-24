import React, { useState, useRef, useEffect } from 'react';

const Settings = () => {
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john.doe@example.com');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  // Load saved data on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedImage) setUserImage(savedImage);
    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);
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
    alert('Profile updated successfully!');
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
                  />
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

      {/* Image Preview Modal */}
      {showImagePreview && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
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
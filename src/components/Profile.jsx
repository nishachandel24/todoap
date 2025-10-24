import { useState, useEffect } from 'react'

const Profile = () => {
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    bio: 'Task management enthusiast who loves staying organized and productive.',
    joinDate: '2024-01-15',
    tasksCompleted: 127,
    totalTasks: 203
  })

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      reminders: true,
      weeklyReport: false,
      taskDeadlines: true
    },
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    taskView: 'list'
  })

  // Form states
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({ ...userProfile })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Available options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
  ]

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ]

  const dateFormats = [
    'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'
  ]

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('todoapp-settings')
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
    }

    const savedProfile = localStorage.getItem('todoapp-profile')
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile(profile)
      setEditedProfile(profile)
    }
  }, [])

  // Save settings to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('todoapp-settings', JSON.stringify(settings))
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-bs-theme')
    }
  }, [settings])

  const handleProfileSave = () => {
    setUserProfile(editedProfile)
    localStorage.setItem('todoapp-profile', JSON.stringify(editedProfile))
    setIsEditing(false)
  }

  const handleProfileCancel = () => {
    setEditedProfile({ ...userProfile })
    setIsEditing(false)
  }

  const handleSettingChange = (category, setting, value) => {
    if (category === 'notifications') {
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [setting]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [setting]: value
      }))
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditedProfile(prev => ({
          ...prev,
          avatar: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setEditedProfile(prev => ({
      ...prev,
      avatar: null
    }))
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getCompletionPercentage = () => {
    return Math.round((userProfile.tasksCompleted / userProfile.totalTasks) * 100)
  }

  const formatJoinDate = () => {
    return new Date(userProfile.joinDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">Profile & Settings</h2>
              <p className="text-muted mb-0">
                Manage your account and customize your experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <ul className="nav nav-pills nav-fill gap-2" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link rounded-3 ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                type="button"
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link rounded-3 ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
                type="button"
              >
                <i className="bi bi-sliders me-2"></i>
                Preferences
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link rounded-3 ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
                type="button"
              >
                <i className="bi bi-bell me-2"></i>
                Notifications
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-pane fade show active">
            <div className="row g-4">
              {/* User Info Card */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="position-relative mb-4">
                      {userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="Avatar"
                          className="rounded-circle mb-3"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                          style={{ width: '120px', height: '120px', fontSize: '2.5rem', fontWeight: 'bold' }}
                        >
                          {getInitials(userProfile.name)}
                        </div>
                      )}
                      {isEditing && (
                        <div className="position-absolute bottom-0 end-0" style={{ transform: 'translate(25%, 25%)' }}>
                          <button
                            className="btn btn-primary btn-sm rounded-circle"
                            onClick={() => document.getElementById('avatar-input').click()}
                          >
                            <i className="bi bi-camera"></i>
                          </button>
                          <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}
                    </div>

                    <h4 className="fw-bold mb-1">{userProfile.name}</h4>
                    <p className="text-muted mb-3">{userProfile.email}</p>
                    
                    {userProfile.bio && (
                      <p className="text-muted small mb-4">{userProfile.bio}</p>
                    )}

                    <div className="d-flex justify-content-around text-center mb-4">
                      <div>
                        <h5 className="fw-bold text-primary mb-0">{userProfile.tasksCompleted}</h5>
                        <small className="text-muted">Completed</small>
                      </div>
                      <div>
                        <h5 className="fw-bold text-info mb-0">{userProfile.totalTasks}</h5>
                        <small className="text-muted">Total Tasks</small>
                      </div>
                      <div>
                        <h5 className="fw-bold text-success mb-0">{getCompletionPercentage()}%</h5>
                        <small className="text-muted">Success Rate</small>
                      </div>
                    </div>

                    <div className="progress mb-3" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      ></div>
                    </div>

                    <small className="text-muted">
                      <i className="bi bi-calendar3 me-2"></i>
                      Member since {formatJoinDate()}
                    </small>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-person-gear me-2 text-primary"></i>
                      Personal Information
                    </h5>
                    {!isEditing ? (
                      <button
                        className="btn btn-outline-primary rounded-3"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary rounded-3"
                          onClick={handleProfileCancel}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary rounded-3"
                          onClick={handleProfileSave}
                        >
                          <i className="bi bi-check-lg me-2"></i>
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={isEditing ? editedProfile.name : userProfile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email Address</label>
                        <input
                          type="email"
                          className="form-control rounded-3"
                          value={isEditing ? editedProfile.email : userProfile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Bio</label>
                        <textarea
                          className="form-control rounded-3"
                          rows="3"
                          value={isEditing ? editedProfile.bio : userProfile.bio}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="Tell us a bit about yourself..."
                        />
                      </div>
                    </div>

                    {isEditing && editedProfile.avatar && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={editedProfile.avatar}
                            alt="New avatar"
                            className="rounded-circle"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <button
                            className="btn btn-outline-danger btn-sm rounded-3"
                            onClick={removeAvatar}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Remove Avatar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="tab-pane fade show active">
            <div className="row g-4">
              {/* Theme Settings */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-palette me-2 text-primary"></i>
                      Appearance
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Theme</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="theme"
                            id="theme-light"
                            checked={settings.theme === 'light'}
                            onChange={() => handleSettingChange(null, 'theme', 'light')}
                          />
                          <label className="form-check-label" htmlFor="theme-light">
                            <i className="bi bi-sun me-2 text-warning"></i>
                            Light
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="theme"
                            id="theme-dark"
                            checked={settings.theme === 'dark'}
                            onChange={() => handleSettingChange(null, 'theme', 'dark')}
                          />
                          <label className="form-check-label" htmlFor="theme-dark">
                            <i className="bi bi-moon me-2 text-info"></i>
                            Dark
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Default Task View</label>
                      <select
                        className="form-select rounded-3"
                        value={settings.taskView}
                        onChange={(e) => handleSettingChange(null, 'taskView', e.target.value)}
                      >
                        <option value="list">List View</option>
                        <option value="grid">Grid View</option>
                        <option value="kanban">Kanban View</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Localization Settings */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-globe me-2 text-success"></i>
                      Localization
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Language</label>
                      <select
                        className="form-select rounded-3"
                        value={settings.language}
                        onChange={(e) => handleSettingChange(null, 'language', e.target.value)}
                      >
                        {languages.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Timezone</label>
                      <select
                        className="form-select rounded-3"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange(null, 'timezone', e.target.value)}
                      >
                        {timezones.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Date Format</label>
                      <select
                        className="form-select rounded-3"
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange(null, 'dateFormat', e.target.value)}
                      >
                        {dateFormats.map(format => (
                          <option key={format} value={format}>{format}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-pane fade show active">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bell-gear me-2 text-warning"></i>
                  Notification Preferences
                </h5>
                <p className="text-muted mb-0 mt-2">
                  Choose how you want to be notified about task updates and reminders
                </p>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      Email Notifications
                    </h6>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <label className="form-label fw-semibold mb-1">General Email Updates</label>
                        <p className="text-muted small mb-0">Receive email notifications for task updates</p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <label className="form-label fw-semibold mb-1">Task Deadline Reminders</label>
                        <p className="text-muted small mb-0">Get reminded about upcoming deadlines</p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.taskDeadlines}
                          onChange={(e) => handleSettingChange('notifications', 'taskDeadlines', e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <label className="form-label fw-semibold mb-1">Weekly Progress Report</label>
                        <p className="text-muted small mb-0">Summary of your weekly productivity</p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.weeklyReport}
                          onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-phone-vibrate me-2 text-success"></i>
                      Push Notifications
                    </h6>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <label className="form-label fw-semibold mb-1">Browser Push Notifications</label>
                        <p className="text-muted small mb-0">Real-time notifications in your browser</p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <label className="form-label fw-semibold mb-1">Task Reminders</label>
                        <p className="text-muted small mb-0">Reminders for scheduled tasks</p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.reminders}
                          onChange={(e) => handleSettingChange('notifications', 'reminders', e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-top">
                  <div className="bg-light rounded-3 p-3">
                    <div className="d-flex align-items-start gap-3">
                      <i className="bi bi-info-circle text-primary mt-1"></i>
                      <div>
                        <h6 className="fw-bold mb-1">Notification Settings</h6>
                        <p className="text-muted mb-2 small">
                          You can customize notification timing and frequency in your browser settings.
                          Some notifications may require permission from your browser.
                        </p>
                        <button className="btn btn-outline-primary btn-sm rounded-3">
                          <i className="bi bi-gear me-2"></i>
                          Advanced Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-danger d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
                      <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
                    </div>
                    Delete Account
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <p className="text-muted mb-3">
                    Are you sure you want to permanently delete your account? This action cannot be undone.
                  </p>
                  <div className="bg-light rounded-3 p-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      All your tasks, settings, and data will be permanently removed.
                    </small>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger rounded-3"
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Profile
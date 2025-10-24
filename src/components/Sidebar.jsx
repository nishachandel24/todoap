import React, { useState } from 'react';
import { HiHome, HiCalendar, HiClock, HiFolderOpen, HiCheckCircle } from 'react-icons/hi';
import AddTaskModal from './AddTaskModal';

const Sidebar = ({ isOpen, isCollapsed, onClose, activeSection, onSectionChange, counts, progress, onAddTask, onAddCategory }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HiHome,
      count: null
    },
    {
      id: 'today',
      label: 'Today',
      icon: HiCalendar,
      count: counts?.today || 0
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: HiClock,
      count: counts?.overdue || 0
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: HiClock,
      count: counts?.upcoming || 0
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: HiFolderOpen,
      count: counts?.categories || 0
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: HiCheckCircle,
      count: counts?.completed || 0
    }
  ];

  const handleLinkClick = (sectionId) => {
    onSectionChange(sectionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  const handleAddTaskClick = () => {
    setShowTaskModal(true);
  };

  const handleAddCategoryClick = () => {
    setShowCategoryModal(true);
  };

  const handleTaskSubmit = (taskData, isEdit) => {
    onAddTask(taskData);
    setShowTaskModal(false);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowCategoryModal(false);
    }
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-lg-none"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar soft-glass-sidebar ${isOpen ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <HiFolderOpen className="brand-icon" />
            <span className="brand-text">TaskFlow</span>
          </div>
          <button 
            className="sidebar-close d-lg-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h6 className="nav-section-title">Navigation</h6>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick(item.id)}
                >
                  <div className="nav-link-content">
                    <div className="nav-link-left">
                      <IconComponent className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </div>
                    {item.count !== null && item.count > 0 && (
                      <span className="nav-count">{item.count}</span>
                    )}
                  </div>
                  {isActive && <div className="nav-active-indicator" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="nav-section">
            <h6 className="nav-section-title">Quick Actions</h6>
            <button 
              className="quick-action-btn"
              onClick={handleAddTaskClick}
            >
              <span>+ Add Task</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={handleAddCategoryClick}
            >
              <span>+ New Category</span>
            </button>
          </div>

          {/* Progress Section */}
          <div className="nav-section">
            <h6 className="nav-section-title">Today's Progress</h6>
            <div className="progress-card">
              <div className="progress-info">
                <span className="progress-label">Tasks Completed</span>
                <span className="progress-value">
                  {progress?.completed || 0} of {progress?.total || 0}
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress?.percentage || 0}%` }} 
                />
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        onSubmit={handleTaskSubmit}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />

      {/* Add Category Modal */}
      {showCategoryModal && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCategoryModalClose}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 10001 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                      <i className="bi bi-folder-plus text-primary fs-5"></i>
                    </div>
                    Add New Category
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCategoryModalClose}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <form onSubmit={handleCategorySubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Category Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        placeholder="Enter category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                        maxLength={30}
                      />
                      <small className="form-text text-muted">
                        {newCategoryName.length}/30 characters
                      </small>
                    </div>
                    
                    <div className="bg-light rounded-3 p-3 mb-3">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Categories help you organize your tasks. You can assign tasks to this category after creating it.
                      </small>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3"
                    onClick={handleCategoryModalClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary rounded-3"
                    onClick={handleCategorySubmit}
                    disabled={!newCategoryName.trim()}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
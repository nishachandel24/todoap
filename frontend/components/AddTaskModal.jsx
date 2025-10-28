import { useState, useEffect } from 'react'

const AddTaskModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  task = null, // null for new task, task object for editing
  categories = ['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance'],
  isToday = false,
  defaultDate = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'Personal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Initialize form data when modal opens or task changes
  useEffect(() => {
    if (task) {
      // Editing existing task
      setFormData({
        title: task.text || task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        category: task.category || 'Personal'
      })
    } else {
      // New task - reset form
      setFormData({
        title: '',
        description: '',
        dueDate: isToday ? (defaultDate || new Date().toISOString().split('T')[0]) : '',
        priority: 'medium',
        category: 'Personal'
      })
    }
    setErrors({})
  }, [task, show, isToday, defaultDate])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }
    
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }
    
    return newErrors
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const taskData = {
        id: task?.id || Date.now(),
        text: formData.title.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate,
        priority: formData.priority,
        category: formData.category,
        completed: task?.completed || false,
        createdAt: task?.createdAt || new Date().toLocaleDateString()
      }
      
      await onSubmit(taskData, !!task) // Pass task data and isEdit flag
      onHide() // Close modal on success
    } catch (error) {
      console.error('Error submitting task:', error)
      setErrors({ submit: 'Failed to save task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onHide()
    }
  }

  // Priority options with colors
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-success', icon: 'bi-arrow-down' },
    { value: 'medium', label: 'Medium Priority', color: 'text-warning', icon: 'bi-dash' },
    { value: 'high', label: 'High Priority', color: 'text-danger', icon: 'bi-arrow-up' }
  ]

  return (
    <>
      {/* Modal Backdrop */}
      {show && (
        <div 
          className={`modal-backdrop fade ${show ? 'show' : ''}`}
          onClick={handleClose}
          style={{ 
            zIndex: 1040,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        ></div>
      )}

      {/* Modal */}
      <div 
        className={`modal fade ${show ? 'show d-block' : 'd-none'}`} 
        tabIndex="-1"
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-labelledby="addTaskModalLabel"
        aria-hidden={!show}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div 
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: '20px',
              animation: show ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-in',
              transform: show ? 'scale(1)' : 'scale(0.9)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Modal Header */}
            <div className="modal-header border-0 pb-2">
              <h5 className="modal-title fw-bold d-flex align-items-center" id="addTaskModalLabel">
                <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                  <i className={`bi ${task ? 'bi-pencil' : 'bi-plus-circle'} text-primary fs-5`}></i>
                </div>
                {task ? 'Edit Task' : 'Add New Task'}
              </h5>
              <button 
                type="button" 
                className="btn-close rounded-circle p-2" 
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body px-4 py-3">
              <form onSubmit={handleSubmit}>
                {/* Title Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-type me-2 text-primary"></i>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control form-control-lg rounded-3 ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Enter task title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    maxLength={100}
                    autoFocus
                  />
                  {errors.title && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.title}
                    </div>
                  )}
                  <small className="form-text text-muted">
                    {formData.title.length}/100 characters
                  </small>
                </div>

                {/* Description Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-text-paragraph me-2 text-primary"></i>
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="form-control rounded-3"
                    rows="4"
                    placeholder="Add a detailed description (optional)..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    maxLength={500}
                    style={{ resize: 'none' }}
                  ></textarea>
                  <small className="form-text text-muted">
                    {formData.description.length}/500 characters
                  </small>
                </div>

                {/* Due Date and Priority Row */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    {!isToday && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Due Date</label>
                        <input
                          type="date"
                          className="form-control form-control-lg rounded-3"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    )}

                    {isToday && (
                      <div className="mb-3">
                        <div className="alert alert-info d-flex align-items-center">
                          <i className="bi bi-calendar-day me-2"></i>
                          <span>This task will be scheduled for today ({new Date().toLocaleDateString()})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark mb-2">
                      <i className="bi bi-flag me-2 text-primary"></i>
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="form-select rounded-3"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <small className="form-text text-muted d-flex align-items-center mt-1">
                      <i className={`bi ${priorityOptions.find(p => p.value === formData.priority)?.icon} me-1 ${priorityOptions.find(p => p.value === formData.priority)?.color}`}></i>
                      Selected: {priorityOptions.find(p => p.value === formData.priority)?.label}
                    </small>
                  </div>
                </div>

                {/* Category Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-tag me-2 text-primary"></i>
                    Category
                  </label>
                  <select
                    name="category"
                    className="form-select rounded-3"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    Choose a category to help organize your tasks
                  </small>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errors.submit}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-0 pt-2 pb-4 px-4">
              <div className="d-flex gap-3 w-100">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-3 flex-fill"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-3 flex-fill"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {task ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${task ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                      {task ? 'Update Task' : 'Add Task'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
        }

        .btn-close:hover {
          background: rgba(0, 0, 0, 0.1) !important;
          transform: scale(1.1);
        }

        .form-control:focus,
        .form-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.15);
        }

        .modal-content {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </>
  )
}

export default AddTaskModal
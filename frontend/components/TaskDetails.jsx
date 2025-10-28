import { useState } from 'react'
import AddTaskModal from './AddTaskModal'

const TaskDetails = ({ task, onClose, onEdit, onDelete, onToggleComplete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!task) {
    return (
      <div className="task-details-container">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle display-1 text-muted mb-3"></i>
          <h5 className="text-muted">Task not found</h5>
          <p className="text-muted">The requested task could not be found.</p>
          <button className="btn btn-primary" onClick={onClose}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Tasks
          </button>
        </div>
      </div>
    )
  }

  // Format due date
  const formatDueDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    let status = ''
    if (diffDays === 0) status = ' (Due Today)'
    else if (diffDays === 1) status = ' (Due Tomorrow)'
    else if (diffDays > 0) status = ` (Due in ${diffDays} days)`
    else if (diffDays === -1) status = ' (Due Yesterday)'
    else status = ` (Overdue by ${Math.abs(diffDays)} days)`
    
    return { formattedDate, status, isOverdue: diffDays < 0, isToday: diffDays === 0, isSoon: diffDays <= 2 && diffDays >= 0 }
  }

  // Get priority configuration
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { 
          color: 'danger', 
          icon: 'bi-exclamation-triangle-fill',
          label: 'High Priority',
          bgClass: 'bg-danger'
        }
      case 'medium':
        return { 
          color: 'warning', 
          icon: 'bi-dash-circle-fill',
          label: 'Medium Priority',
          bgClass: 'bg-warning'
        }
      case 'low':
        return { 
          color: 'success', 
          icon: 'bi-check-circle-fill',
          label: 'Low Priority',
          bgClass: 'bg-success'
        }
      default:
        return { 
          color: 'secondary', 
          icon: 'bi-circle',
          label: 'No Priority',
          bgClass: 'bg-secondary'
        }
    }
  }

  // Get category color
  const getCategoryConfig = (category) => {
    const configs = {
      'work': { color: 'primary', icon: 'bi-briefcase' },
      'personal': { color: 'success', icon: 'bi-person' },
      'shopping': { color: 'warning', icon: 'bi-cart' },
      'health': { color: 'info', icon: 'bi-heart-pulse' },
      'education': { color: 'purple', icon: 'bi-book' },
      'finance': { color: 'danger', icon: 'bi-currency-dollar' }
    }
    return configs[category?.toLowerCase()] || { color: 'secondary', icon: 'bi-tag' }
  }

  const dueDateInfo = formatDueDate(task.dueDate)
  const priorityConfig = getPriorityConfig(task.priority)
  const categoryConfig = getCategoryConfig(task.category)

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleEditSubmit = (updatedTask) => {
    onEdit(updatedTask)
    setShowEditModal(false)
  }

  const handleDelete = () => {
    onDelete(task.id)
    onClose()
  }

  const handleToggleComplete = () => {
    onToggleComplete(task.id)
  }

  return (
    <div className="task-details-container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <button 
              className="btn btn-outline-secondary rounded-3"
              onClick={onClose}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Tasks
            </button>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary rounded-3"
                onClick={handleEdit}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit
              </button>
              <button 
                className="btn btn-outline-danger rounded-3"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="card border-0 shadow-lg rounded-4 mb-4">
        {/* Status Banner */}
        {task.completed && (
          <div className="bg-success text-white p-3 rounded-top-4">
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <span className="fw-semibold">Task Completed</span>
            </div>
          </div>
        )}
        
        {/* Priority Indicator */}
        {task.priority && (
          <div 
            className={`position-absolute top-0 start-0 ${priorityConfig.bgClass}`}
            style={{ 
              height: '6px', 
              width: '100%',
              borderRadius: task.completed ? '0' : '12px 12px 0 0'
            }}
          ></div>
        )}

        <div className="card-body p-5">
          {/* Task Title */}
          <div className="mb-4">
            <h1 className={`display-6 fw-bold mb-3 ${task.completed ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
              {task.text || task.title}
            </h1>
            
            {/* Meta Information */}
            <div className="d-flex flex-wrap gap-3 align-items-center">
              {/* Completion Status */}
              <div className="d-flex align-items-center">
                <button
                  className={`btn btn-lg rounded-circle me-3 ${
                    task.completed ? 'btn-success' : 'btn-outline-secondary'
                  }`}
                  onClick={handleToggleComplete}
                  style={{ width: '50px', height: '50px' }}
                >
                  {task.completed && <i className="bi bi-check-lg"></i>}
                </button>
                <div>
                  <div className="fw-semibold">
                    {task.completed ? 'Completed' : 'Pending'}
                  </div>
                  <small className="text-muted">
                    Click to {task.completed ? 'mark as pending' : 'mark as complete'}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-text-paragraph me-2 text-primary"></i>
                Description
              </h5>
              <div className="bg-light rounded-3 p-4">
                <p className={`mb-0 lh-lg ${task.completed ? 'text-muted' : 'text-dark'}`}>
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="row g-4">
            {/* Due Date */}
            {dueDateInfo && (
              <div className="col-md-6">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-4">
                    <h6 className="card-title fw-bold text-dark mb-3">
                      <i className="bi bi-calendar-event me-2 text-primary"></i>
                      Due Date
                    </h6>
                    <div>
                      <div className="fw-semibold text-dark mb-1">
                        {dueDateInfo.formattedDate}
                      </div>
                      <small className={`fw-medium ${
                        dueDateInfo.isOverdue ? 'text-danger' :
                        dueDateInfo.isToday ? 'text-warning' :
                        dueDateInfo.isSoon ? 'text-info' : 'text-muted'
                      }`}>
                        {dueDateInfo.status}
                        {dueDateInfo.isOverdue && <i className="bi bi-exclamation-triangle ms-1"></i>}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Priority */}
            {task.priority && (
              <div className="col-md-6">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-4">
                    <h6 className="card-title fw-bold text-dark mb-3">
                      <i className="bi bi-flag me-2 text-primary"></i>
                      Priority
                    </h6>
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${priorityConfig.color} me-2 d-flex align-items-center`}>
                        <i className={`${priorityConfig.icon} me-1`}></i>
                        {priorityConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <div className="col-md-6">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-4">
                    <h6 className="card-title fw-bold text-dark mb-3">
                      <i className="bi bi-tag me-2 text-primary"></i>
                      Category
                    </h6>
                    <div className="d-flex align-items-center">
                      <i className={`${categoryConfig.icon} text-${categoryConfig.color} me-2 fs-5`}></i>
                      <span className="fw-semibold text-dark">{task.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="col-md-6">
              <div className="card border-0 bg-light h-100">
                <div className="card-body p-4">
                  <h6 className="card-title fw-bold text-dark mb-3">
                    <i className="bi bi-calendar-plus me-2 text-primary"></i>
                    Created
                  </h6>
                  <div>
                    <div className="fw-semibold text-dark">
                      {task.createdAt}
                    </div>
                    <small className="text-muted">Task creation date</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-top">
            <div className="row g-3">
              <div className="col-md-4">
                <button 
                  className={`btn ${task.completed ? 'btn-warning' : 'btn-success'} btn-lg w-100 rounded-3`}
                  onClick={handleToggleComplete}
                >
                  <i className={`bi ${task.completed ? 'bi-arrow-clockwise' : 'bi-check-lg'} me-2`}></i>
                  {task.completed ? 'Mark as Pending' : 'Mark as Complete'}
                </button>
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-primary btn-lg w-100 rounded-3"
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Task
                </button>
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-outline-danger btn-lg w-100 rounded-3"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AddTaskModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        task={task}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />

      {/* Delete Confirmation Modal */}
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
                    Delete Task
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <p className="text-muted mb-3">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                  <div className="bg-light rounded-3 p-3">
                    <div className="fw-semibold text-dark">"{task.text || task.title}"</div>
                    {task.description && (
                      <small className="text-muted">{task.description.substring(0, 100)}...</small>
                    )}
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
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Task
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

export default TaskDetails
import { useState } from 'react'

const TaskCard = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  showActions = true,
  compact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Format due date
  const formatDueDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due Today'
    if (diffDays === 1) return 'Due Tomorrow'
    if (diffDays > 0) return `Due in ${diffDays} days`
    if (diffDays === -1) return 'Due Yesterday'
    return `Overdue by ${Math.abs(diffDays)} days`
  }

  // Get priority styling
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { 
          badge: 'bg-danger text-white', 
          border: 'border-danger',
          icon: 'bi-exclamation-triangle-fill'
        }
      case 'medium':
        return { 
          badge: 'bg-warning text-dark', 
          border: 'border-warning',
          icon: 'bi-dash-circle-fill'
        }
      case 'low':
        return { 
          badge: 'bg-success text-white', 
          border: 'border-success',
          icon: 'bi-check-circle-fill'
        }
      default:
        return { 
          badge: 'bg-secondary text-white', 
          border: 'border-secondary',
          icon: 'bi-circle'
        }
    }
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'work': 'text-primary',
      'personal': 'text-success',
      'shopping': 'text-warning',
      'health': 'text-info',
      'education': 'text-purple',
      'finance': 'text-danger'
    }
    return colors[category?.toLowerCase()] || 'text-muted'
  }

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && !task.completed
  }

  const priorityConfig = getPriorityConfig(task.priority)
  const dueDateFormatted = formatDueDate(task.dueDate)
  const overdue = isOverdue()

  return (
    <div 
      className={`card border-0 shadow-sm h-100 task-card ${
        task.completed ? 'task-completed' : ''
      } ${overdue ? 'task-overdue' : ''} ${compact ? 'task-compact' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        borderRadius: '12px'
      }}
    >
      {/* Priority Indicator */}
      {task.priority && (
        <div 
          className={`position-absolute top-0 start-0 rounded-top-2 ${priorityConfig.border}`}
          style={{ 
            height: '4px', 
            width: '100%',
            background: task.priority === 'high' ? '#dc3545' : 
                       task.priority === 'medium' ? '#ffc107' : '#198754'
          }}
        ></div>
      )}

      <div className={`card-body ${compact ? 'p-3' : 'p-4'}`}>
        {/* Header with checkbox and priority */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center flex-grow-1">
            <button
              className={`btn btn-sm rounded-circle me-3 flex-shrink-0 ${
                task.completed 
                  ? 'btn-success' 
                  : 'btn-outline-secondary'
              }`}
              onClick={() => onToggleComplete?.(task.id)}
              style={{ 
                width: compact ? '32px' : '40px', 
                height: compact ? '32px' : '40px',
                transition: 'all 0.2s ease'
              }}
            >
              {task.completed && <i className="bi bi-check-lg"></i>}
            </button>

            {/* Priority Badge */}
            {task.priority && (
              <span 
                className={`badge ${priorityConfig.badge} me-2 d-flex align-items-center`}
                style={{ fontSize: '0.7rem' }}
              >
                <i className={`${priorityConfig.icon} me-1`}></i>
                {task.priority}
              </span>
            )}
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ 
                  width: '32px', 
                  height: '32px',
                  opacity: isHovered ? 1 : 0.6,
                  transition: 'opacity 0.2s ease'
                }}
              >
                <i className="bi bi-three-dots"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                <li>
                  <button 
                    className="dropdown-item py-2"
                    onClick={() => onEdit?.(task)}
                  >
                    <i className="bi bi-pencil me-2 text-primary"></i>
                    Edit Task
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item py-2 text-danger"
                    onClick={() => onDelete?.(task.id)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Task
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Task Content */}
        <div className="task-content">
          {/* Title */}
          <h6 
            className={`card-title mb-2 ${
              task.completed 
                ? 'text-decoration-line-through text-muted' 
                : 'text-dark'
            }`}
            style={{ 
              fontSize: compact ? '1rem' : '1.1rem',
              lineHeight: '1.3'
            }}
          >
            {task.text || task.title}
          </h6>

          {/* Description */}
          {task.description && (
            <p 
              className={`card-text small mb-3 ${
                task.completed ? 'text-muted' : 'text-secondary'
              }`}
              style={{ lineHeight: '1.4' }}
            >
              {task.description}
            </p>
          )}

          {/* Category and Due Date */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center flex-wrap gap-2">
              {/* Category */}
              {task.category && (
                <span className="badge bg-light text-dark border">
                  <i className={`bi bi-tag me-1 ${getCategoryColor(task.category)}`}></i>
                  {task.category}
                </span>
              )}

              {/* Creation Date */}
              <small className="text-muted d-flex align-items-center">
                <i className="bi bi-calendar3 me-1"></i>
                {task.createdAt}
              </small>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <small 
                className={`fw-medium d-flex align-items-center ${
                  overdue 
                    ? 'text-danger' 
                    : dueDateFormatted?.includes('Today') || dueDateFormatted?.includes('Tomorrow')
                      ? 'text-warning'
                      : 'text-muted'
                }`}
              >
                <i className={`bi ${
                  overdue ? 'bi-exclamation-triangle' : 'bi-clock'
                } me-1`}></i>
                {dueDateFormatted}
              </small>
            )}
          </div>
        </div>

        {/* Progress indicator for subtasks (if any) */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-3 pt-2 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-muted fw-medium">
                Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
              </small>
              <small className="text-primary">
                {Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%
              </small>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ 
                  width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Completed overlay */}
      {task.completed && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-3"
          style={{ 
            background: 'rgba(25, 135, 84, 0.1)',
            backdropFilter: 'blur(1px)'
          }}
        >
          <div className="text-success opacity-75">
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskCard
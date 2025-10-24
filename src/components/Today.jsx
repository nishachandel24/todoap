import { useState, useMemo } from 'react'
import AddTaskModal from './AddTaskModal'

const Today = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onUpdateTodo, title, subtitle }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Use filtered todos directly for overdue mode, or filter by today for regular mode
  const displayTasks = useMemo(() => {
    if (title) {
      // For overdue mode, use the pre-filtered todos passed from parent
      return todos
    } else {
      // For today mode, filter todos by today's date
      const today = new Date().toDateString()
      return todos.filter(task => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate).toDateString()
        return taskDate === today
      })
    }
  }, [todos, title])

  // Use custom title and subtitle if provided (for overdue view)
  const pageTitle = title || "Today's Tasks"
  const pageSubtitle = subtitle || `Tasks scheduled for ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })}`

  // Calculate task statistics based on displayTasks
  const taskStats = {
    total: displayTasks.length,
    completed: displayTasks.filter(task => task.isCompleted || task.completed).length,
    pending: displayTasks.filter(task => !(task.isCompleted || task.completed)).length
  };

  const handleAddTask = (taskData, isEdit) => {
    if (isEdit) {
      onUpdateTodo(taskData.id, taskData)
    } else {
      // Automatically set due date to today for new tasks
      const newTask = {
        ...taskData,
        dueDate: getTodayDate()
      }
      onAddTodo(newTask)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleToggleComplete = (taskId) => {
    onToggleTodo(taskId)
  }

  const handleDeleteTask = (taskId) => {
    onDeleteTodo(taskId)
  }

  const getCurrentDayInfo = () => {
    const today = new Date()
    return {
      dayName: today.toLocaleDateString('en-US', { weekday: 'long' }),
      dayNumber: today.getDate(),
      monthName: today.toLocaleDateString('en-US', { month: 'long' }),
      year: today.getFullYear()
    }
  }

  const dayInfo = getCurrentDayInfo()

  return (
    <div className="today-container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">{pageTitle}</h2>
              <p className="text-muted mb-0">{pageSubtitle}</p>
            </div>
            <button 
              className="btn btn-primary btn-lg rounded-3 px-4"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              {title ? 'Add New Task' : "Add Today's Task"}
            </button>
          </div>
        </div>
      </div>

      {/* Task Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-gradient-primary text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-list-task display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.total}</h2>
                  <p className="mb-0 opacity-75">Total Tasks</p>
                </div>
              </div>
              <small className="opacity-75">
                {title ? 'Overdue items' : 'Scheduled today'}
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-gradient-warning text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-clock display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.pending}</h2>
                  <p className="mb-0 opacity-75">Pending</p>
                </div>
              </div>
              <small className="opacity-75">Need attention</small>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-gradient-success text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-check-circle display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.completed}</h2>
                  <p className="mb-0 opacity-75">Completed</p>
                </div>
              </div>
              <small className="opacity-75">
                {taskStats.completed > 0 ? 'Well done!' : 'None yet'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {taskStats.total > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                {title ? 'Overdue Progress' : "Today's Progress"}
              </h6>
              <span className="text-muted">
                {taskStats.completed} of {taskStats.total} completed
              </span>
            </div>
            <div className="progress" style={{ height: '12px' }}>
              <div 
                className="progress-bar bg-success"
                style={{ 
                  width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              {title ? 'Overdue Items' : 'Your Tasks for Today'}
            </h5>
          </div>
        </div>
        <div className="card-body p-0">
          {displayTasks.length === 0 ? (
            <div className="text-center py-5">
              <i className={`bi ${title ? 'bi-exclamation-triangle' : 'bi-calendar-day'} display-1 text-muted mb-3 opacity-50`}></i>
              <h5 className="text-muted mb-2">
                {title ? 'No Overdue Tasks Found' : 'No tasks scheduled for today'}
              </h5>
              <p className="text-muted mb-4">
                {title 
                  ? 'You are all caught up! Keep up the great work to stay on schedule.'
                  : 'Add your first task for today to get started!'
                }
              </p>
              <button 
                className="btn btn-primary rounded-3"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                {title ? 'Add New Task' : "Add Today's Task"}
              </button>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {displayTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`list-group-item border-0 py-3 px-4 ${
                    task.isCompleted || task.completed ? 'task-completed' : ''
                  }`}
                >
                  <div className="d-flex align-items-start">
                    <button
                      className={`btn btn-sm rounded-circle me-3 mt-1 ${
                        task.isCompleted || task.completed 
                          ? 'btn-success' 
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleToggleComplete(task.id)}
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className={`bi ${
                        task.isCompleted || task.completed 
                          ? 'bi-check-lg' 
                          : 'bi-circle'
                      }`}></i>
                    </button>
                    
                    <div className="flex-grow-1">
                      <h6 
                        className={`mb-1 ${
                          task.isCompleted || task.completed 
                            ? 'text-decoration-line-through text-muted' 
                            : 'text-dark'
                        }`}
                      >
                        {task.text || task.title}
                      </h6>
                      
                      {task.description && (
                        <p 
                          className={`mb-2 small ${
                            task.isCompleted || task.completed 
                              ? 'text-decoration-line-through text-muted' 
                              : 'text-secondary'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                      
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        {task.category && (
                          <span className="badge bg-primary bg-opacity-75 text-dark">
                            <i className="bi bi-tag me-1"></i>
                            {task.category}
                          </span>
                        )}
                        
                        {task.priority && (
                          <span className={`badge ${
                            task.priority === 'high' ? 'bg-danger' :
                            task.priority === 'medium' ? 'bg-warning text-dark' : 'bg-success'
                          }`}>
                            {task.priority} priority
                          </span>
                        )}

                        {task.dueDate && (
                          <small className={title ? 'text-danger' : 'text-success'}>
                            <i className={`bi ${title ? 'bi-exclamation-triangle' : 'bi-calendar-check'} me-1`}></i>
                            {title ? `Overdue: ${new Date(task.dueDate).toLocaleDateString()}` : 'Due today'}
                          </small>
                        )}
                      </div>
                    </div>
                    
                    <div className="dropdown">
                      <button 
                        className="btn btn-link text-muted p-1"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleEditTask(task)}
                          >
                            <i className="bi bi-pencil me-2"></i>Edit
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <i className="bi bi-trash me-2"></i>Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setEditingTask(null)
        }}
        onSubmit={handleAddTask}
        task={editingTask}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
        isToday={true} // Flag to indicate this is for today's tasks
        defaultDate={getTodayDate()} // Automatically set to today
      />
    </div>
  )
}

export default Today
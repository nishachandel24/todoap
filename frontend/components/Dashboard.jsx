import { useState, useEffect, useRef, useMemo } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'

const Dashboard = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onUpdateTodo, taskProgress }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [userImage, setUserImage] = useState(null)
  const fileInputRef = useRef(null)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  // Show ALL tasks on the home page without any filtering
  const allTasks = useMemo(() => {
    return todos || []
  }, [todos])

  // Calculate statistics for all tasks
  const taskStats = {
    total: allTasks.length,
    completed: allTasks.filter(task => task.isCompleted || task.completed).length,
    pending: allTasks.filter(task => !(task.isCompleted || task.completed)).length,
    overdue: allTasks.filter(task => {
      if (!task.dueDate || task.isCompleted || task.completed) return false
      const taskDate = new Date(task.dueDate)
      const now = new Date()
      return taskDate < now
    }).length
  }

  // Dynamic personalized greeting
  const getPersonalizedGreeting = () => {
    const currentUser = "John Doe"; // This could come from props or context
    
    // Check if we have a real user name or placeholder
    if (!currentUser || currentUser === "John Doe" || currentUser.toLowerCase() === "user") {
      return "Welcome back!";
    }
    
    return `Hello, ${currentUser}!`;
  };

  const handleAddTask = (taskData, isEdit) => {
    if (isEdit) {
      // Handle task editing - you would implement this in the parent component
      console.log('Editing task:', taskData)
      // For now, we'll treat it as adding a new task
      onAddTodo(taskData)
    } else {
      onAddTodo(taskData)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger'
      case 'medium': return 'text-warning'
      case 'low': return 'text-success'
      default: return 'text-secondary'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger'
      case 'medium': return 'bg-warning'
      case 'low': return 'bg-success'
      default: return 'bg-secondary'
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target.result)
        // Save to localStorage
        localStorage.setItem('userProfileImage', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUserImage(null)
    localStorage.removeItem('userProfileImage')
  }

  const handleToggleComplete = (taskId) => {
    onToggleTodo(taskId)
  }

  const handleDeleteTask = (taskId) => {
    onDeleteTodo(taskId)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Load saved image on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage')
    if (savedImage) {
      setUserImage(savedImage)
    }
    
    // Ensure the page is scrolled to show the welcome section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">All Tasks</h2>
              <p className="text-muted mb-0">Complete overview of all your tasks</p>
            </div>
            <button 
              className="btn btn-primary btn-lg rounded-3 px-4"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add New Task
            </button>
          </div>
        </div>
      </div>

      {/* Task Statistics Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-primary text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-list-task display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.total}</h2>
                  <p className="mb-0 opacity-75">Total Tasks</p>
                </div>
              </div>
              <small className="opacity-75">All your tasks</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
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

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-success text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-check-circle display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.completed}</h2>
                  <p className="mb-0 opacity-75">Completed</p>
                </div>
              </div>
              <small className="opacity-75">Well done!</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-danger text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-exclamation-triangle display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{taskStats.overdue}</h2>
                  <p className="mb-0 opacity-75">Overdue</p>
                </div>
              </div>
              <small className="opacity-75">Past deadline</small>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {taskStats.total > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Overall Progress</h6>
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

      {/* All Tasks List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">All Tasks</h5>
            <span className="badge bg-primary">{allTasks.length}</span>
          </div>
        </div>
        <div className="card-body p-0">
          {allTasks.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-list-task display-1 text-muted mb-3 opacity-50"></i>
              <h5 className="text-muted mb-2">No Tasks Yet</h5>
              <p className="text-muted mb-4">Create your first task to get started with your productivity journey!</p>
              <button 
                className="btn btn-primary rounded-3"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Your First Task
              </button>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {allTasks.map((task) => {
                const isOverdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date()
                const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
                
                return (
                  <div 
                    key={task.id} 
                    className={`list-group-item border-0 py-3 px-4 ${
                      task.isCompleted ? 'task-completed' : ''
                    }`}
                  >
                    <div className="d-flex align-items-start">
                      <button
                        className={`btn btn-sm rounded-circle me-3 mt-1 ${
                          task.isCompleted 
                            ? 'btn-success' 
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleToggleComplete(task.id)}
                        style={{ width: '36px', height: '36px' }}
                      >
                        <i className={`bi ${
                          task.isCompleted 
                            ? 'bi-check-lg' 
                            : 'bi-circle'
                        }`}></i>
                      </button>
                      
                      <div className="flex-grow-1">
                        <h6 
                          className={`mb-1 ${
                            task.isCompleted 
                              ? 'text-decoration-line-through text-muted' 
                              : 'text-dark'
                          }`}
                        >
                          {task.text || task.title}
                        </h6>
                        
                        {task.description && (
                          <p 
                            className={`mb-2 small ${
                              task.isCompleted 
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
                            <small className={
                              isOverdue ? 'text-danger' : 
                              isToday ? 'text-warning' : 'text-info'
                            }>
                              <i className={`bi ${
                                isOverdue ? 'bi-exclamation-triangle' :
                                isToday ? 'bi-calendar-day' : 'bi-calendar-check'
                              } me-1`}></i>
                              {isOverdue ? `Overdue: ${new Date(task.dueDate).toLocaleDateString()}` :
                               isToday ? 'Due today' :
                               `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
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
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        show={showModal}
        onHide={handleCloseModal}
        onSubmit={handleAddTask}
        task={editingTask}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default Dashboard
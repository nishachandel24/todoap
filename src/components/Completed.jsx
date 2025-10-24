import { useState, useMemo } from 'react'
import AddTaskModal from './AddTaskModal'

const Completed = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onUpdateTodo }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedViewPeriod, setSelectedViewPeriod] = useState('all')
  const [selectedSortBy, setSortBy] = useState('newest')

  // Calculate completed task counts by period
  const completedCounts = useMemo(() => {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const completedTasks = todos.filter(task => task.isCompleted || task.completed)

    return {
      allTime: completedTasks.length,
      today: completedTasks.filter(task => {
        if (!task.completedAt) return false
        const completedDate = new Date(task.completedAt)
        return completedDate >= startOfToday
      }).length,
      thisWeek: completedTasks.filter(task => {
        if (!task.completedAt) return false
        const completedDate = new Date(task.completedAt)
        return completedDate >= startOfWeek
      }).length,
      thisMonth: completedTasks.filter(task => {
        if (!task.completedAt) return false
        const completedDate = new Date(task.completedAt)
        return completedDate >= startOfMonth
      }).length
    }
  }, [todos])

  // Filter completed tasks by selected period
  const filteredTasks = useMemo(() => {
    const completedTasks = todos.filter(task => task.isCompleted || task.completed)
    
    if (selectedViewPeriod === 'all') return completedTasks

    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    switch (selectedViewPeriod) {
      case 'today':
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const completedDate = new Date(task.completedAt)
          return completedDate >= startOfToday
        })
      
      case 'week':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
        startOfWeek.setHours(0, 0, 0, 0)
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const completedDate = new Date(task.completedAt)
          return completedDate >= startOfWeek
        })
      
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const completedDate = new Date(task.completedAt)
          return completedDate >= startOfMonth
        })
      
      case 'last7days':
        const last7Days = new Date(today)
        last7Days.setDate(today.getDate() - 7)
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const completedDate = new Date(task.completedAt)
          return completedDate >= last7Days
        })
      
      case 'last30days':
        const last30Days = new Date(today)
        last30Days.setDate(today.getDate() - 30)
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const completedDate = new Date(task.completedAt)
          return completedDate >= last30Days
        })
      
      default:
        return completedTasks
    }
  }, [todos, selectedViewPeriod])

  // Sort filtered tasks
  const sortedTasks = useMemo(() => {
    const tasksToSort = [...filteredTasks]
    
    switch (selectedSortBy) {
      case 'newest':
        return tasksToSort.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt || 0)
          const dateB = new Date(b.completedAt || b.createdAt || 0)
          return dateB - dateA
        })
      
      case 'oldest':
        return tasksToSort.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt || 0)
          const dateB = new Date(b.completedAt || b.createdAt || 0)
          return dateA - dateB
        })
      
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        return tasksToSort.sort((a, b) => {
          const priorityA = priorityOrder[a.priority] || 0
          const priorityB = priorityOrder[b.priority] || 0
          return priorityB - priorityA
        })
      
      case 'alphabetical':
        return tasksToSort.sort((a, b) => {
          const titleA = (a.title || a.text || '').toLowerCase()
          const titleB = (b.title || b.text || '').toLowerCase()
          return titleA.localeCompare(titleB)
        })
      
      default:
        return tasksToSort
    }
  }, [filteredTasks, selectedSortBy])

  const getViewPeriodLabel = () => {
    const labels = {
      'all': 'All Time',
      'today': 'Today',
      'week': 'This Week',
      'month': 'This Month',
      'last7days': 'Last 7 Days',
      'last30days': 'Last 30 Days'
    }
    return labels[selectedViewPeriod] || 'All Time'
  }

  const getSortLabel = () => {
    const labels = {
      'newest': 'Newest First',
      'oldest': 'Oldest First',
      'priority': 'Priority',
      'alphabetical': 'Alphabetical'
    }
    return labels[selectedSortBy] || 'Newest First'
  }

  return (
    <div className="completed-container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">Completed Tasks</h2>
              <p className="text-muted mb-0">
                {todos.length} tasks completed • {sortedTasks.length} shown
              </p>
            </div>
            <button 
              className="btn btn-primary btn-lg rounded-3 px-4"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Completed Task Statistics */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-primary text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-calendar-day display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{completedCounts.today}</h2>
                  <p className="mb-0 opacity-75">Today</p>
                </div>
              </div>
              <small className="opacity-75">
                {new Date().toLocaleDateString('en-US', { weekday: 'short' })} {new Date().getDate()}
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-success text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-calendar-week display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{completedCounts.thisWeek}</h2>
                  <p className="mb-0 opacity-75">This Week</p>
                </div>
              </div>
              <small className="opacity-75">Week {Math.ceil(new Date().getDate() / 7)}</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-warning text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-calendar-month display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{completedCounts.thisMonth}</h2>
                  <p className="mb-0 opacity-75">This Month</p>
                </div>
              </div>
              <small className="opacity-75">
                {new Date().toLocaleDateString('en-US', { month: 'short' })}
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-gradient-info text-white h-100">
            <div className="card-body text-center p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-infinity display-6 me-3"></i>
                <div>
                  <h2 className="fw-bold mb-0">{completedCounts.allTime}</h2>
                  <p className="mb-0 opacity-75">All Time</p>
                </div>
              </div>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="fw-bold mb-1">Completed Tasks</h5>
              <p className="text-muted mb-0">
                Showing {sortedTasks.length} completed tasks from {getViewPeriodLabel().toLowerCase()}
              </p>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2">
                {/* View Period Dropdown */}
                <div className="dropdown flex-fill">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle w-100" 
                    type="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-calendar3 me-2"></i>
                    {getViewPeriodLabel()}
                  </button>
                  <ul className="dropdown-menu w-100">
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('all')}>All Time</button></li>
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('today')}>Today</button></li>
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('week')}>This Week</button></li>
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('month')}>This Month</button></li>
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('last7days')}>Last 7 Days</button></li>
                    <li><button className="dropdown-item" onClick={() => setSelectedViewPeriod('last30days')}>Last 30 Days</button></li>
                  </ul>
                </div>

                {/* Sort By Dropdown */}
                <div className="dropdown flex-fill">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle w-100" 
                    type="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-sort-down me-2"></i>
                    {getSortLabel()}
                  </button>
                  <ul className="dropdown-menu w-100">
                    <li><button className="dropdown-item" onClick={() => setSortBy('newest')}>Newest First</button></li>
                    <li><button className="dropdown-item" onClick={() => setSortBy('oldest')}>Oldest First</button></li>
                    <li><button className="dropdown-item" onClick={() => setSortBy('priority')}>Priority</button></li>
                    <li><button className="dropdown-item" onClick={() => setSortBy('alphabetical')}>Alphabetical</button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-check-circle display-1 text-muted mb-3 opacity-50"></i>
              <h5 className="text-muted mb-2">
                {completedCounts.allTime === 0 ? 'No completed tasks yet' : `No completed tasks ${getViewPeriodLabel().toLowerCase()}`}
              </h5>
              <p className="text-muted mb-4">
                {completedCounts.allTime === 0 
                  ? 'Complete some tasks to see them appear here!'
                  : `Try selecting a different time period or complete more tasks.`
                }
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {sortedTasks.map((task) => (
                <div key={task.id} className="list-group-item border-0 py-3 px-4 task-completed">
                  <div className="d-flex align-items-start">
                    <button
                      className="btn btn-success btn-sm rounded-circle me-3 mt-1"
                      onClick={() => onToggleTodo(task.id)}
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                    
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-decoration-line-through text-muted">
                        {task.text || task.title}
                      </h6>
                      
                      {task.description && (
                        <p className="mb-2 small text-decoration-line-through text-muted">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        {task.category && (
                          <span className="badge bg-secondary bg-opacity-75">
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

                        {task.completedAt && (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Completed {new Date(task.completedAt).toLocaleDateString()}
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
                            onClick={() => onToggleTodo(task.id)}
                          >
                            <i className="bi bi-arrow-counterclockwise me-2"></i>Mark as Incomplete
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => onDeleteTodo(task.id)}
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
        onSubmit={(taskData, isEdit) => {
          if (isEdit) {
            onUpdateTodo(taskData)
          } else {
            onAddTodo(taskData)
          }
        }}
        task={editingTask}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />
    </div>
  )
}

export default Completed
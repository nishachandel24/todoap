import { useState, useMemo } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'

const Upcoming = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterPeriod, setFilterPeriod] = useState('all') // 'all', 'thisWeek', 'nextWeek', 'thisMonth'
  const [expandedSections, setExpandedSections] = useState(new Set(['today', 'tomorrow']))

  // Helper functions for date calculations
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date) => {
    const today = new Date()
    return getDateKey(date) === getDateKey(today)
  }

  const isTomorrow = (date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return getDateKey(date) === getDateKey(tomorrow)
  }

  const isThisWeek = (date) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return date >= startOfWeek && date <= endOfWeek
  }

  const isNextWeek = (date) => {
    const today = new Date()
    const startOfNextWeek = new Date(today)
    startOfNextWeek.setDate(today.getDate() - today.getDay() + 7)
    const endOfNextWeek = new Date(startOfNextWeek)
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)
    return date >= startOfNextWeek && date <= endOfNextWeek
  }

  const isThisMonth = (date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const formatSectionDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  // Group and filter tasks
  const groupedTasks = useMemo(() => {
    const today = new Date()
    const upcomingTasks = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false
      const dueDate = new Date(todo.dueDate)
      return dueDate >= today
    })

    // Apply period filter
    const filteredTasks = upcomingTasks.filter(todo => {
      const dueDate = new Date(todo.dueDate)
      switch (filterPeriod) {
        case 'thisWeek':
          return isThisWeek(dueDate)
        case 'nextWeek':
          return isNextWeek(dueDate)
        case 'thisMonth':
          return isThisMonth(dueDate)
        default:
          return true
      }
    })

    // Group tasks by date
    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      later: []
    }

    const weekGroups = new Map()
    const laterGroups = new Map()

    filteredTasks.forEach(todo => {
      const dueDate = new Date(todo.dueDate)
      
      if (dueDate < today) {
        groups.overdue.push(todo)
      } else if (isToday(dueDate)) {
        groups.today.push(todo)
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.push(todo)
      } else if (isThisWeek(dueDate)) {
        const dateKey = getDateKey(dueDate)
        if (!weekGroups.has(dateKey)) {
          weekGroups.set(dateKey, { date: dueDate, tasks: [] })
        }
        weekGroups.get(dateKey).tasks.push(todo)
      } else if (isNextWeek(dueDate)) {
        const dateKey = getDateKey(dueDate)
        if (!weekGroups.has(dateKey)) {
          weekGroups.set(dateKey, { date: dueDate, tasks: [] })
        }
        weekGroups.get(dateKey).tasks.push(todo)
      } else {
        const dateKey = getDateKey(dueDate)
        if (!laterGroups.has(dateKey)) {
          laterGroups.set(dateKey, { date: dueDate, tasks: [] })
        }
        laterGroups.get(dateKey).tasks.push(todo)
      }
    })

    // Convert maps to sorted arrays
    groups.thisWeek = Array.from(weekGroups.values())
      .filter(group => isThisWeek(group.date))
      .sort((a, b) => a.date - b.date)

    groups.nextWeek = Array.from(weekGroups.values())
      .filter(group => isNextWeek(group.date))
      .sort((a, b) => a.date - b.date)

    groups.later = Array.from(laterGroups.values())
      .sort((a, b) => a.date - b.date)

    return groups
  }, [todos, filterPeriod])

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleModalSubmit = (taskData, isEdit) => {
    if (isEdit) {
      onEditTodo(taskData)
    } else {
      onAddTodo(taskData)
    }
  }

  const getTotalTasksCount = () => {
    return Object.values(groupedTasks).reduce((total, group) => {
      if (Array.isArray(group)) {
        if (group.length > 0 && group[0].date) {
          // This is a date group array
          return total + group.reduce((sum, dateGroup) => sum + dateGroup.tasks.length, 0)
        }
        // This is a simple task array
        return total + group.length
      }
      return total
    }, 0)
  }

  const renderTaskGroup = (tasks, sectionId, title, icon, colorClass = 'text-primary') => {
    if (tasks.length === 0) return null

    const isExpanded = expandedSections.has(sectionId)

    return (
      <div className="card border-0 shadow-sm mb-3 upcoming-section">
        <div className="card-header bg-white border-0 py-3">
          <button
            className="btn btn-link text-decoration-none p-0 w-100 text-start d-flex align-items-center justify-content-between"
            onClick={() => toggleSection(sectionId)}
            style={{ border: 'none', background: 'none' }}
          >
            <div className="d-flex align-items-center">
              <i className={`${icon} ${colorClass} me-3 fs-5`}></i>
              <h5 className="mb-0 fw-bold text-dark">{title}</h5>
              <span className="badge bg-light text-dark ms-2">{tasks.length}</span>
            </div>
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`}></i>
          </button>
        </div>
        
        <div className={`collapse ${isExpanded ? 'show' : ''}`}>
          <div className="card-body p-4">
            <div className="row g-3">
              {tasks.map((task) => (
                <div key={task.id} className="col-md-6 col-lg-4">
                  <TaskCard
                    task={task}
                    onToggleComplete={onToggleTodo}
                    onDelete={onDeleteTodo}
                    onEdit={handleEditTask}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDateGroup = (dateGroups, sectionId, title, icon, colorClass = 'text-primary') => {
    if (dateGroups.length === 0) return null

    const isExpanded = expandedSections.has(sectionId)
    const totalTasks = dateGroups.reduce((sum, group) => sum + group.tasks.length, 0)

    return (
      <div className="card border-0 shadow-sm mb-3 upcoming-section">
        <div className="card-header bg-white border-0 py-3">
          <button
            className="btn btn-link text-decoration-none p-0 w-100 text-start d-flex align-items-center justify-content-between"
            onClick={() => toggleSection(sectionId)}
            style={{ border: 'none', background: 'none' }}
          >
            <div className="d-flex align-items-center">
              <i className={`${icon} ${colorClass} me-3 fs-5`}></i>
              <h5 className="mb-0 fw-bold text-dark">{title}</h5>
              <span className="badge bg-light text-dark ms-2">{totalTasks}</span>
            </div>
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`}></i>
          </button>
        </div>
        
        <div className={`collapse ${isExpanded ? 'show' : ''}`}>
          <div className="card-body p-0">
            {dateGroups.map((dateGroup, index) => (
              <div key={getDateKey(dateGroup.date)} className={`p-4 ${index < dateGroups.length - 1 ? 'border-bottom' : ''}`}>
                <h6 className="text-muted mb-3 fw-semibold">
                  <i className="bi bi-calendar3 me-2"></i>
                  {formatSectionDate(dateGroup.date)}
                </h6>
                <div className="row g-3">
                  {dateGroup.tasks.map((task) => (
                    <div key={task.id} className="col-md-6 col-lg-4">
                      <TaskCard
                        task={task}
                        onToggleComplete={onToggleTodo}
                        onDelete={onDeleteTodo}
                        onEdit={handleEditTask}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="upcoming-container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">Upcoming Tasks</h2>
              <p className="text-muted mb-0">
                {getTotalTasksCount()} tasks scheduled ahead
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

      {/* Filter Buttons */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn ${filterPeriod === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-3`}
              onClick={() => setFilterPeriod('all')}
            >
              <i className="bi bi-calendar3 me-2"></i>
              All Upcoming
            </button>
            <button
              className={`btn ${filterPeriod === 'thisWeek' ? 'btn-primary' : 'btn-outline-primary'} rounded-3`}
              onClick={() => setFilterPeriod('thisWeek')}
            >
              <i className="bi bi-calendar-week me-2"></i>
              This Week
            </button>
            <button
              className={`btn ${filterPeriod === 'nextWeek' ? 'btn-primary' : 'btn-outline-primary'} rounded-3`}
              onClick={() => setFilterPeriod('nextWeek')}
            >
              <i className="bi bi-calendar-plus me-2"></i>
              Next Week
            </button>
            <button
              className={`btn ${filterPeriod === 'thisMonth' ? 'btn-primary' : 'btn-outline-primary'} rounded-3`}
              onClick={() => setFilterPeriod('thisMonth')}
            >
              <i className="bi bi-calendar-month me-2"></i>
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Task Groups */}
      {getTotalTasksCount() === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-calendar-check display-1 text-muted mb-3 opacity-50"></i>
            <h5 className="text-muted mb-2">No upcoming tasks</h5>
            <p className="text-muted mb-4">
              {filterPeriod === 'all' 
                ? 'You have no scheduled tasks coming up.'
                : `No tasks scheduled for ${filterPeriod === 'thisWeek' ? 'this week' : filterPeriod === 'nextWeek' ? 'next week' : 'this month'}.`
              }
            </p>
            <button 
              className="btn btn-primary rounded-3"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Schedule Your First Task
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overdue Tasks */}
          {renderTaskGroup(groupedTasks.overdue, 'overdue', 'Overdue', 'bi-exclamation-triangle', 'text-danger')}

          {/* Today */}
          {renderTaskGroup(groupedTasks.today, 'today', 'Today', 'bi-calendar-day', 'text-warning')}

          {/* Tomorrow */}
          {renderTaskGroup(groupedTasks.tomorrow, 'tomorrow', 'Tomorrow', 'bi-calendar-plus', 'text-info')}

          {/* This Week */}
          {renderDateGroup(groupedTasks.thisWeek, 'thisWeek', 'This Week', 'bi-calendar-week', 'text-primary')}

          {/* Next Week */}
          {renderDateGroup(groupedTasks.nextWeek, 'nextWeek', 'Next Week', 'bi-calendar-range', 'text-success')}

          {/* Later */}
          {renderDateGroup(groupedTasks.later, 'later', 'Later', 'bi-calendar2', 'text-secondary')}
        </>
      )}

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setEditingTask(null)
        }}
        onSubmit={handleModalSubmit}
        task={editingTask}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />
    </div>
  )
}

export default Upcoming
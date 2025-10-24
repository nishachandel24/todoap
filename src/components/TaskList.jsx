import { useState, useEffect } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'

const TaskList = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('created') // 'created', 'dueDate', 'priority', 'title'
  const [filterBy, setFilterBy] = useState('all') // 'all', 'pending', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [animatingTasks, setAnimatingTasks] = useState(new Set())

  // Get unique categories and priorities from todos
  const categories = [...new Set(todos.map(todo => todo.category).filter(Boolean))]
  const priorities = ['high', 'medium', 'low']

  // Filter and sort tasks
  const filteredAndSortedTodos = todos
    .filter(todo => {
      // Search filter
      if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false
      }
      
      // Status filter
      if (filterBy === 'pending' && todo.completed) return false
      if (filterBy === 'completed' && !todo.completed) return false
      
      // Category filter
      if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false
      
      // Priority filter
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.text.localeCompare(b.text)
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        case 'created':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

  // Handle task completion with animation
  const handleToggleComplete = (taskId) => {
    setAnimatingTasks(prev => new Set([...prev, taskId]))
    
    // Delay the actual toggle to show animation
    setTimeout(() => {
      onToggleTodo(taskId)
      setAnimatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }, 300)
  }

  // Handle task deletion with animation
  const handleDeleteTask = (taskId) => {
    setAnimatingTasks(prev => new Set([...prev, taskId]))
    
    // Delay the actual deletion to show animation
    setTimeout(() => {
      onDeleteTodo(taskId)
      setAnimatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }, 300)
  }

  // Handle task editing
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  // Handle modal submission
  const handleModalSubmit = (taskData, isEdit) => {
    if (isEdit) {
      onEditTodo(taskData)
    } else {
      onAddTodo(taskData)
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilterBy('all')
    setCategoryFilter('all')
    setPriorityFilter('all')
    setSearchQuery('')
    setSortBy('created')
  }

  // Get filter counts
  const totalTasks = todos.length
  const pendingTasks = todos.filter(todo => !todo.completed).length
  const completedTasks = todos.filter(todo => todo.completed).length

  return (
    <div className="task-list-container">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">All Tasks</h2>
              <p className="text-muted mb-0">
                Showing {filteredAndSortedTodos.length} of {totalTasks} tasks
              </p>
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

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 text-center">
              <div className="text-primary mb-2">
                <i className="bi bi-list-task fs-2"></i>
              </div>
              <h4 className="fw-bold mb-1">{totalTasks}</h4>
              <small className="text-muted">Total Tasks</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-clock fs-2"></i>
              </div>
              <h4 className="fw-bold mb-1">{pendingTasks}</h4>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 text-center">
              <div className="text-success mb-2">
                <i className="bi bi-check-circle fs-2"></i>
              </div>
              <h4 className="fw-bold mb-1">{completedTasks}</h4>
              <small className="text-muted">Completed</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          {/* Search Bar */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 ps-5"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              </div>
            </div>
            <div className="col-md-6 d-flex gap-2 mt-3 mt-md-0">
              {/* View Mode Toggle */}
              <div className="btn-group" role="group">
                <button
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-3`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid-3x3-gap"></i>
                </button>
                <button
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-3`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
              
              {/* Clear Filters */}
              <button 
                className="btn btn-outline-secondary rounded-3"
                onClick={clearAllFilters}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Clear
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">STATUS</label>
              <select
                className="form-select rounded-3"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All Tasks ({totalTasks})</option>
                <option value="pending">Pending ({pendingTasks})</option>
                <option value="completed">Completed ({completedTasks})</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">CATEGORY</label>
              <select
                className="form-select rounded-3"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">PRIORITY</label>
              <select
                className="form-select rounded-3"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">SORT BY</label>
              <select
                className="form-select rounded-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {filteredAndSortedTodos.length === 0 ? (
            /* Empty State */
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3 opacity-50"></i>
              <h5 className="text-muted mb-2">
                {searchQuery || filterBy !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No tasks match your filters'
                  : 'No tasks yet'
                }
              </h5>
              <p className="text-muted mb-4">
                {searchQuery || filterBy !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters to find tasks.'
                  : 'Create your first task to get started with productivity!'
                }
              </p>
              {(searchQuery || filterBy !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
                <button 
                  className="btn btn-outline-primary rounded-3 me-3"
                  onClick={clearAllFilters}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Clear Filters
                </button>
              )}
              <button 
                className="btn btn-primary rounded-3"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add First Task
              </button>
            </div>
          ) : (
            /* Task Grid/List */
            <div className={viewMode === 'grid' ? 'row g-3' : 'list-group list-group-flush'}>
              {filteredAndSortedTodos.map((task, index) => (
                <div 
                  key={task.id}
                  className={`${viewMode === 'grid' ? 'col-md-6 col-lg-4' : 'list-group-item border-0 p-0 mb-3'} task-item`}
                  style={{
                    opacity: animatingTasks.has(task.id) ? 0.5 : 1,
                    transform: animatingTasks.has(task.id) ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <TaskCard
                    task={{
                      ...task,
                      category: task.category || 'General'
                    }}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    compact={viewMode === 'list'}
                  />
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
        onSubmit={handleModalSubmit}
        task={editingTask}
        categories={['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General']}
      />
    </div>
  )
}

export default TaskList
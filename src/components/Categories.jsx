import { useState, useMemo } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'

const Categories = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo, categories = [], onAddCategory, onEditCategory, onDeleteCategory }) => {
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [viewMode, setViewMode] = useState('categories') // 'categories' or 'tasks'
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('primary')

  // Default categories with predefined colors and icons
  const defaultCategories = [
    { id: 'work', name: 'Work', color: 'primary', icon: 'bi-briefcase' },
    { id: 'personal', name: 'Personal', color: 'success', icon: 'bi-person' },
    { id: 'shopping', name: 'Shopping', color: 'warning', icon: 'bi-cart' },
    { id: 'health', name: 'Health', color: 'info', icon: 'bi-heart-pulse' },
    { id: 'education', name: 'Education', color: 'purple', icon: 'bi-book' },
    { id: 'finance', name: 'Finance', color: 'danger', icon: 'bi-currency-dollar' },
    { id: 'general', name: 'General', color: 'secondary', icon: 'bi-tag' }
  ]

  // Available colors for categories
  const colorOptions = [
    { value: 'primary', label: 'Blue', class: 'bg-primary' },
    { value: 'success', label: 'Green', class: 'bg-success' },
    { value: 'warning', label: 'Yellow', class: 'bg-warning' },
    { value: 'danger', label: 'Red', class: 'bg-danger' },
    { value: 'info', label: 'Cyan', class: 'bg-info' },
    { value: 'purple', label: 'Purple', class: 'bg-purple' },
    { value: 'secondary', label: 'Gray', class: 'bg-secondary' }
  ]

  // Get categories that actually have tasks
  const getActiveCategories = () => {
    const categoryMap = new Map();
    
    todos.forEach(task => {
      if (task.category) {
        const category = task.category.toLowerCase();
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: task.category, // Keep original casing
            count: 0,
            completedCount: 0,
            tasks: []
          });
        }
        
        const categoryData = categoryMap.get(category);
        categoryData.count++;
        categoryData.tasks.push(task);
        
        if (task.isCompleted || task.completed) {
          categoryData.completedCount++;
        }
      }
    });
    
    // Convert map to array and sort by task count (descending)
    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  };

  const allCategories = getActiveCategories();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setViewMode('tasks')
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setViewMode('categories')
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: 'bi-tag',
        isCustom: true
      }
      
      if (onAddCategory) {
        onAddCategory(newCategory)
      }
      
      setNewCategoryName('')
      setNewCategoryColor('primary')
      setShowCategoryModal(false)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskModalSubmit = (taskData, isEdit) => {
    if (isEdit) {
      onEditTodo(taskData)
    } else {
      // Set category for new tasks
      if (selectedCategory) {
        taskData.category = selectedCategory.name
      }
      onAddTodo(taskData)
    }
  }

  const getCategoryTasks = (category) => {
    return todos.filter(todo => 
      (todo.category || 'General').toLowerCase() === category.name.toLowerCase()
    )
  }

  if (viewMode === 'tasks' && selectedCategory) {
    const categoryTasks = getCategoryTasks(selectedCategory)
    
    return (
      <div className="categories-container" style={{ paddingTop: '20px' }}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <button 
                className="btn btn-outline-secondary rounded-3"
                onClick={handleBackToCategories}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Categories
              </button>
              <button 
                className="btn btn-primary btn-lg rounded-3 px-4"
                onClick={() => setShowTaskModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderLeft: `6px solid var(--bs-${selectedCategory.color})` }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className={`bg-${selectedCategory.color} bg-opacity-10 rounded-3 p-3 me-4`}>
                <i className={`${selectedCategory.icon} text-${selectedCategory.color} fs-1`}></i>
              </div>
              <div>
                <h2 className="display-6 fw-bold text-dark mb-2">{selectedCategory.name} Tasks</h2>
                <p className="text-muted mb-0">
                  {categoryTasks.length} tasks • {categoryTasks.filter(todo => todo.completed).length} completed • {categoryTasks.filter(todo => !todo.completed).length} pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {categoryTasks.length === 0 ? (
              <div className="text-center py-5">
                <i className={`${selectedCategory.icon} display-1 text-muted mb-3 opacity-50`}></i>
                <h5 className="text-muted mb-2">No tasks in {selectedCategory.name}</h5>
                <p className="text-muted mb-4">Create your first task in this category to get started!</p>
                <button 
                  className="btn btn-primary rounded-3"
                  onClick={() => setShowTaskModal(true)}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add First Task
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {categoryTasks.map((task, index) => (
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
            )}
          </div>
        </div>

        {/* Task Modal */}
        <AddTaskModal
          show={showTaskModal}
          onHide={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSubmit={handleTaskModalSubmit}
          task={editingTask}
          categories={allCategories.map(cat => cat.name)}
        />
      </div>
    )
  }

  return (
    <div className="categories-container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="display-6 fw-bold text-dark mb-2">Categories</h2>
              <p className="text-muted mb-0">
                Organize your tasks by category • {allCategories.length} categories
              </p>
            </div>
            <button 
              className="btn btn-primary btn-lg rounded-3 px-4"
              onClick={() => setShowCategoryModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="row">
        {allCategories.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-folder2-open display-1 text-muted mb-3 opacity-50"></i>
              <h5 className="text-muted mb-2">No categories yet</h5>
              <p className="text-muted mb-4">
                Add some tasks with categories to see them organized here!
              </p>
              <button 
                className="btn btn-primary rounded-3"
                onClick={() => setShowTaskModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Your First Task
              </button>
            </div>
          </div>
        ) : (
          allCategories.map((category) => (
            <div key={category.name} className="col-xl-3 col-lg-4 col-md-6 mb-4">
              <div 
                className="card category-card h-100 border-0 shadow-sm position-relative overflow-hidden"
                role="button"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className={`category-icon bg-${category.color} bg-opacity-10 rounded-3 p-3`}>
                      <i className={`${category.icon} fs-4 text-${category.color}`}></i>
                    </div>
                    <div className="dropdown">
                      <button 
                        className="btn btn-link text-muted p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle category options
                        }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                    </div>
                  </div>
                  
                  <h5 className="card-title fw-bold mb-2 text-capitalize">
                    {category.name}
                  </h5>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Progress</span>
                      <span>{category.completedCount}/{category.count}</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar bg-${category.color}`}
                        style={{ 
                          width: `${category.count > 0 ? (category.completedCount / category.count) * 100 : 0}%`,
                          transition: 'width 0.3s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="row g-2 text-center">
                    <div className="col-6">
                      <div className="bg-light rounded-3 p-2">
                        <div className="fw-bold text-primary">{category.count - category.completedCount}</div>
                        <small className="text-muted">Active</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light rounded-3 p-2">
                        <div className="fw-bold text-success">{category.completedCount}</div>
                        <small className="text-muted">Done</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent border-0 p-3 pt-0">
                  <small className="text-muted d-flex align-items-center">
                    <i className="bi bi-clock me-1"></i>
                    {category.count} task{category.count !== 1 ? 's' : ''} total
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowCategoryModal(false)}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                      <i className="bi bi-tag text-primary fs-5"></i>
                    </div>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowCategoryModal(false)
                      setEditingCategory(null)
                      setNewCategoryName('')
                      setNewCategoryColor('primary')
                    }}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }}>
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
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Category Color</label>
                      <div className="row g-2">
                        {colorOptions.map(color => (
                          <div key={color.value} className="col-auto">
                            <input
                              type="radio"
                              className="btn-check"
                              name="categoryColor"
                              id={`color-${color.value}`}
                              value={color.value}
                              checked={newCategoryColor === color.value}
                              onChange={(e) => setNewCategoryColor(e.target.value)}
                            />
                            <label 
                              className={`btn btn-outline-secondary rounded-3 p-3 ${color.class === 'bg-purple' ? 'text-purple' : ''}`}
                              htmlFor={`color-${color.value}`}
                              style={{ 
                                width: '60px', 
                                height: '60px',
                                backgroundColor: color.value === 'purple' ? '#8b5cf6' : undefined
                              }}
                            >
                              <div className={`w-100 h-100 rounded-2 ${color.class === 'bg-purple' ? '' : color.class}`}></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3"
                    onClick={() => {
                      setShowCategoryModal(false)
                      setEditingCategory(null)
                      setNewCategoryName('')
                      setNewCategoryColor('primary')
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary rounded-3"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    <i className={`bi ${editingCategory ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                    {editingCategory ? 'Update Category' : 'Add Category'}
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

export default Categories
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Categories from './components/Categories';
import Completed from './components/Completed';
import Upcoming from './components/Upcoming';
import Today from './components/Today';
import Settings from './components/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // New state for desktop toggle
  const [activeSection, setActiveSection] = useState('home');
  
  // Initialize tasks from localStorage or default to empty array
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('userTasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  });

  // Initialize categories from localStorage or default to empty array
  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = localStorage.getItem('userCategories');
      return savedCategories ? JSON.parse(savedCategories) : ['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General'];
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return ['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Finance', 'General'];
    }
  });

  // Save tasks to localStorage whenever tasks state changes
  useEffect(() => {
    try {
      localStorage.setItem('userTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Save categories to localStorage whenever categories state changes
  useEffect(() => {
    try {
      localStorage.setItem('userCategories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }, [categories]);

  // Helper functions for task counting
  const getTodayCount = () => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === today && !task.isCompleted;
    }).length;
  };

  const getUpcomingCount = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate > today;
    }).length;
  };

  const getOverdueCount = () => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate < now;
    }).length;
  };

  const getCategoriesCount = () => {
    const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
    return categories.length;
  };

  const getCompletedCount = () => {
    return tasks.filter(task => task.isCompleted).length;
  };

  const getTotalTasksCount = () => {
    return tasks.length;
  };

  const getTaskCompletionProgress = () => {
    const completed = getCompletedCount();
    const total = getTotalTasksCount();
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  // Task management functions
  const addTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now() + Math.random(), // Simple ID generation
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    setTasks(prevTasks => [...prevTasks, taskWithId]);
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              isCompleted: !task.isCompleted, 
              completedAt: !task.isCompleted ? new Date().toISOString() : null,
              completed: !task.isCompleted // Support both naming conventions
            }
          : task
      )
    );
  };

  const updateTask = (taskId, updates) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  // Category management functions
  const addCategory = (categoryName) => {
    if (!categories.includes(categoryName)) {
      setCategories(prevCategories => [...prevCategories, categoryName]);
    }
  };

  // Sidebar controls
  const toggleSidebar = () => {
    if (window.innerWidth < 992) {
      // Mobile behavior - show/hide sidebar
      setSidebarOpen(!sidebarOpen);
    } else {
      // Desktop behavior - collapse/expand sidebar
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Filter tasks based on active section
  const getFilteredTasks = () => {
    const today = new Date().toDateString();
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    switch (activeSection) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate).toDateString();
          return taskDate === today;
        });
      case 'upcoming':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate > now;
        });
      case 'overdue':
        return tasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate < new Date();
        });
      case 'completed':
        return tasks.filter(task => task.isCompleted);
      case 'categories':
        return tasks;
      default:
        return tasks;
    }
  };

  const renderContent = () => {
    const filteredTasks = getFilteredTasks();
    const progress = getTaskCompletionProgress();

    switch (activeSection) {
      case 'today':
        return (
          <Today
            todos={filteredTasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
          />
        );
      case 'overdue':
        // Filter tasks to show ONLY incomplete, past-deadline tasks
        const overdueTasks = tasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          const now = new Date();
          return taskDate < now;
        });

        return (
          <Today
            todos={overdueTasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
            title="Overdue Tasks"
            subtitle="Tasks that have passed their deadline"
          />
        );
      case 'categories':
        return (
          <Categories
            todos={filteredTasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
          />
        );
      case 'completed':
        return (
          <Completed
            todos={tasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
          />
        );
      case 'upcoming':
        return (
          <Upcoming
            todos={filteredTasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            todos={tasks}
            onAddTodo={addTask}
            onToggleTodo={toggleTaskComplete}
            onDeleteTodo={deleteTask}
            onUpdateTodo={updateTask}
            taskProgress={progress}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={closeSidebar}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onAddTask={addTask}
          onAddCategory={addCategory}
          counts={{
            today: getTodayCount(),
            upcoming: getUpcomingCount(),
            overdue: getOverdueCount(),
            categories: getCategoriesCount(),
            completed: getCompletedCount(),
            total: getTotalTasksCount()
          }}
          progress={getTaskCompletionProgress()}
        />

        <main className={`main-content-with-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="content-container">
            {renderContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;

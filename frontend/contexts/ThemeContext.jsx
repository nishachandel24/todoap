import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('userTheme')
      return savedTheme || 'light'
    } catch (error) {
      console.error('Error loading theme from localStorage:', error)
      return 'light'
    }
  })

  // Apply theme class to body element
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : ''
    
    // Save theme to localStorage
    try {
      localStorage.setItem('userTheme', theme)
    } catch (error) {
      console.error('Error saving theme to localStorage:', error)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
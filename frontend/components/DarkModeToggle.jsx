import { useTheme } from '../contexts/ThemeContext';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-wrapper">
      <button
        className={`btn theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'} theme-icon`}></i>
        <span className="theme-label d-none d-md-inline ms-2">
          Toggle
        </span>
      </button>
    </div>
  );
};

export default DarkModeToggle;
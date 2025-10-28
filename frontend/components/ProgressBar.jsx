import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const ProgressBar = ({
  percentage = 0,
  height = 20,
  animated = true,
  striped = false,
  showLabel = true,
  showPercentage = true,
  label = '',
  variant = 'primary',
  className = '',
  background = 'light',
  borderRadius = 'rounded-pill',
  animationDuration = 1000,
  labelPosition = 'center',
  size = 'default'
}) => {
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Animate progress bar on mount or percentage change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      if (animated) {
        // Smooth animation to target percentage
        const increment = percentage / (animationDuration / 50)
        let current = 0
        
        const interval = setInterval(() => {
          current += increment
          if (current >= percentage) {
            current = percentage
            clearInterval(interval)
          }
          setCurrentPercentage(Math.min(Math.max(current, 0), 100))
        }, 50)

        return () => clearInterval(interval)
      } else {
        setCurrentPercentage(Math.min(Math.max(percentage, 0), 100))
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage, animated, animationDuration])

  // Color variants mapping
  const getVariantClasses = (variant) => {
    const variants = {
      primary: 'bg-primary',
      secondary: 'bg-secondary', 
      success: 'bg-success',
      danger: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info',
      light: 'bg-light',
      dark: 'bg-dark',
      gradient: 'bg-gradient',
      // Custom soft colors
      'soft-blue': 'bg-primary bg-opacity-75',
      'soft-green': 'bg-success bg-opacity-75',
      'soft-red': 'bg-danger bg-opacity-75',
      'soft-yellow': 'bg-warning bg-opacity-75',
      'soft-purple': 'bg-info bg-opacity-75',
      'soft-orange': 'bg-warning bg-opacity-90',
      'soft-pink': 'bg-danger bg-opacity-50',
      'soft-teal': 'bg-info bg-opacity-90'
    }
    return variants[variant] || variants.primary
  }

  // Size presets
  const getSizeClasses = (size) => {
    const sizes = {
      xs: { height: 8, fontSize: '0.65rem' },
      sm: { height: 12, fontSize: '0.75rem' },
      default: { height: 20, fontSize: '0.875rem' },
      lg: { height: 28, fontSize: '1rem' },
      xl: { height: 36, fontSize: '1.125rem' }
    }
    return sizes[size] || sizes.default
  }

  const sizeConfig = getSizeClasses(size)
  const progressHeight = height || sizeConfig.height

  // Get text color based on variant
  const getTextColor = (variant, percentage) => {
    if (percentage > 50) {
      return ['warning', 'light', 'soft-yellow'].includes(variant) ? 'text-dark' : 'text-white'
    }
    return 'text-dark'
  }

  // Format percentage display
  const formatPercentage = (value) => {
    return Math.round(value)
  }

  // Get background variant class
  const getBackgroundClass = (bg) => {
    const backgrounds = {
      light: 'bg-light',
      secondary: 'bg-secondary bg-opacity-25',
      white: 'bg-white',
      transparent: 'bg-transparent border',
      dark: 'bg-dark bg-opacity-25'
    }
    return backgrounds[bg] || backgrounds.light
  }

  return (
    <div className={`progress-bar-container ${className}`}>
      {/* Label above progress bar */}
      {showLabel && label && labelPosition === 'top' && (
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-medium text-muted small">{label}</span>
          {showPercentage && (
            <span className="fw-bold text-primary small">
              {formatPercentage(currentPercentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div 
        className={`progress ${borderRadius} ${getBackgroundClass(background)} position-relative overflow-hidden`}
        style={{ 
          height: `${progressHeight}px`,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Progress Fill */}
        <div
          className={`
            progress-bar 
            ${getVariantClasses(variant)}
            ${striped ? 'progress-bar-striped' : ''}
            ${animated && striped ? 'progress-bar-animated' : ''}
            position-relative
            overflow-hidden
          `}
          role="progressbar"
          style={{
            width: `${currentPercentage}%`,
            transition: animated ? `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
            fontSize: sizeConfig.fontSize
          }}
          aria-valuenow={currentPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {/* Shine Effect */}
          {animated && isVisible && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: `shine 2s ease-in-out infinite`,
                animationDelay: `${animationDuration}ms`
              }}
            />
          )}

          {/* Center Label */}
          {showLabel && labelPosition === 'center' && progressHeight >= 20 && (
            <span className={`
              position-absolute top-50 start-50 translate-middle
              fw-semibold
              ${getTextColor(variant, currentPercentage)}
            `}>
              {showPercentage ? `${formatPercentage(currentPercentage)}%` : label}
            </span>
          )}
        </div>

        {/* Overlay Label for light backgrounds */}
        {showLabel && labelPosition === 'center' && currentPercentage < 50 && progressHeight >= 20 && (
          <span className="position-absolute top-50 start-50 translate-middle fw-semibold text-muted">
            {showPercentage ? `${formatPercentage(currentPercentage)}%` : label}
          </span>
        )}
      </div>

      {/* Label below progress bar */}
      {showLabel && label && labelPosition === 'bottom' && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="fw-medium text-muted small">{label}</span>
          {showPercentage && (
            <span className="fw-bold text-primary small">
              {formatPercentage(currentPercentage)}%
            </span>
          )}
        </div>
      )}

      {/* Side-by-side layout */}
      {showLabel && label && labelPosition === 'side' && (
        <div className="d-flex justify-content-between align-items-center">
          <div 
            className="progress flex-grow-1 me-3"
            style={{ height: `${progressHeight}px` }}
          >
            <div
              className={`progress-bar ${getVariantClasses(variant)}`}
              style={{
                width: `${currentPercentage}%`,
                transition: animated ? `width ${animationDuration}ms ease` : 'none'
              }}
            />
          </div>
          <div className="text-end" style={{ minWidth: '80px' }}>
            <div className="fw-medium text-muted small">{label}</div>
            {showPercentage && (
              <div className="fw-bold text-primary small">
                {formatPercentage(currentPercentage)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .progress-bar-container .progress {
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .progress-bar-container .progress-bar {
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .progress-bar-container:hover .progress {
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .progress-bar-container .progress-bar {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

ProgressBar.propTypes = {
  percentage: PropTypes.number,
  height: PropTypes.number,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showLabel: PropTypes.bool,
  showPercentage: PropTypes.bool,
  label: PropTypes.string,
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
    'soft-blue', 'soft-green', 'soft-red', 'soft-yellow', 'soft-purple', 'soft-orange', 'soft-pink', 'soft-teal'
  ]),
  className: PropTypes.string,
  background: PropTypes.oneOf(['light', 'secondary', 'white', 'transparent', 'dark']),
  borderRadius: PropTypes.string,
  animationDuration: PropTypes.number,
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'center', 'side']),
  size: PropTypes.oneOf(['xs', 'sm', 'default', 'lg', 'xl'])
}

// Example usage component for documentation
export const ProgressBarExamples = () => {
  const [progress1, setProgress1] = useState(0)
  const [progress2, setProgress2] = useState(75)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress1(prev => (prev >= 100 ? 0 : prev + 1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container py-4">
      <h3 className="mb-4">ProgressBar Examples</h3>
      
      <div className="row g-4">
        <div className="col-12">
          <h5>Basic Usage</h5>
          <ProgressBar percentage={75} label="Task Completion" />
        </div>
        
        <div className="col-md-6">
          <h5>Animated Progress</h5>
          <ProgressBar 
            percentage={progress1} 
            label="Loading..." 
            variant="soft-blue"
            animated={true}
          />
        </div>
        
        <div className="col-md-6">
          <h5>Different Variants</h5>
          <div className="d-flex flex-column gap-3">
            <ProgressBar percentage={60} variant="success" size="sm" label="Success" />
            <ProgressBar percentage={40} variant="warning" size="sm" label="Warning" />
            <ProgressBar percentage={80} variant="soft-green" size="sm" label="Soft Green" />
          </div>
        </div>
        
        <div className="col-12">
          <h5>Different Sizes & Positions</h5>
          <div className="d-flex flex-column gap-3">
            <ProgressBar 
              percentage={progress2} 
              size="xs" 
              label="Extra Small" 
              labelPosition="top"
              variant="primary"
            />
            <ProgressBar 
              percentage={85} 
              size="lg" 
              label="Large Size" 
              labelPosition="side"
              variant="soft-purple"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
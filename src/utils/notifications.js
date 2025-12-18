/**
 * Simple notification utility for displaying toast messages
 * 
 * Requirement 5.4: Display notification explaining conversion limitations
 */

/**
 * Show a notification toast
 * @param {string} message - The message to display
 * @param {string} type - The notification type: 'info', 'warning', 'error', 'success'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `kiro-notification kiro-notification--${type}`
  notification.textContent = message
  
  // Add styles if not already present
  ensureStyles()
  
  // Add to document
  document.body.appendChild(notification)
  
  // Trigger animation
  requestAnimationFrame(() => {
    notification.classList.add('kiro-notification--visible')
  })
  
  // Remove after duration
  setTimeout(() => {
    notification.classList.remove('kiro-notification--visible')
    setTimeout(() => {
      notification.remove()
    }, 200)
  }, duration)
}

/**
 * Show a warning notification
 * @param {string} message - The warning message
 */
export function showWarning(message) {
  showNotification(message, 'warning', 4000)
}

/**
 * Show an error notification
 * @param {string} message - The error message
 */
export function showError(message) {
  showNotification(message, 'error', 5000)
}

/**
 * Show an info notification
 * @param {string} message - The info message
 */
export function showInfo(message) {
  showNotification(message, 'info', 3000)
}

/**
 * Ensure notification styles are added to the document
 */
function ensureStyles() {
  if (document.getElementById('kiro-notification-styles')) return
  
  const style = document.createElement('style')
  style.id = 'kiro-notification-styles'
  style.textContent = `
    .kiro-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      max-width: 400px;
      text-align: center;
    }
    
    .kiro-notification--visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .kiro-notification--info {
      background-color: #3b82f6;
      color: white;
    }
    
    .kiro-notification--warning {
      background-color: #f59e0b;
      color: white;
    }
    
    .kiro-notification--error {
      background-color: #ef4444;
      color: white;
    }
    
    .kiro-notification--success {
      background-color: #10b981;
      color: white;
    }
  `
  document.head.appendChild(style)
}

export default {
  showNotification,
  showWarning,
  showError,
  showInfo
}

/**
 * ==============================================
 * UTILS.JS - Utility Functions
 * ==============================================
 * Shared helper functions for cart and wishlist
 * - Number formatting (NGN currency)
 * - Price parsing from text
 * - LocalStorage helpers
 * - Toast notifications
 */

(function(window) {
  'use strict';

  const Utils = {
    
    /**
     * Format number as Nigerian Naira (₦)
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency: function(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '₦0';
      }
      return '₦' + parseFloat(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    },

    /**
     * Parse price from text string
     * Handles formats like "₦315,000" or "315000"
     * @param {string} priceText - The price text to parse
     * @returns {number} Numeric price value
     */
    parsePrice: function(priceText) {
      if (typeof priceText === 'number') return priceText;
      if (!priceText) return 0;
      
      // Remove currency symbol, commas, and whitespace
      const cleaned = String(priceText).replace(/[₦,\s]/g, '');
      const parsed = parseFloat(cleaned);
      
      return isNaN(parsed) ? 0 : parsed;
    },

    /**
     * Safely get data from localStorage
     * @param {string} key - LocalStorage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    getLocalStorage: function(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
      }
    },

    /**
     * Safely set data to localStorage
     * @param {string} key - LocalStorage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    setLocalStorage: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
      }
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'info'
     */
    showToast: function(message, type = 'info') {
      // Remove existing toast
      const existing = document.getElementById('ec-toast');
      if (existing) existing.remove();

      // Create toast element
      const toast = document.createElement('div');
      toast.id = 'ec-toast';
      toast.className = `ec-toast ec-toast-${type}`;
      toast.textContent = message;
      
      // Toast styles
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 250px;
        max-width: 400px;
        padding: 16px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        animation: slideInRight 0.3s ease-out;
      `;

      document.body.appendChild(toast);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait = 300) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Generate unique ID for products
     * @param {string} name - Product name
     * @returns {string} Unique ID
     */
    generateId: function(name) {
      if (!name) return 'prod_' + Date.now();
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    },

    /**
     * Trigger custom event
     * @param {string} eventName - Event name
     * @param {*} detail - Event detail data
     */
    triggerEvent: function(eventName, detail = {}) {
      const event = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    },

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    validateEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(String(email || '').trim());
    }
  };

  // Add CSS animations for toast
  if (!document.getElementById('utils-styles')) {
    const style = document.createElement('style');
    style.id = 'utils-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Export to global scope
  window.EcomUtils = Utils;

})(window);


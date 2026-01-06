/**
 * ==============================================
 * NEWSLETTER.JS - Newsletter Subscription
 * ==============================================
 * Handles newsletter subscriptions:
 * - Validates email input
 * - Stores in localStorage
 * - Prevents duplicate emails
 * - Shows success/error messages
 */

(function(window) {
  'use strict';

  // Ensure Utils is loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.error('Newsletter.js requires utils.js to be loaded first');
    return;
  }

  const Utils = window.EcomUtils;
  const NEWSLETTER_STORAGE_KEY = 'esthetical_newsletter_subscribers';

  const NewsletterManager = {
    
    /**
     * Get all subscribers from localStorage
     * @returns {Array} Array of email addresses
     */
    getSubscribers: function() {
      return Utils.getLocalStorage(NEWSLETTER_STORAGE_KEY, []);
    },

    /**
     * Check if email is already subscribed
     * @param {string} email - Email address
     * @returns {boolean} True if already subscribed
     */
    isSubscribed: function(email) {
      const subscribers = this.getSubscribers();
      return subscribers.includes(email.toLowerCase().trim());
    },

    /**
     * Add email to subscribers
     * @param {string} email - Email address
     * @returns {boolean} Success status
     */
    subscribe: function(email) {
      if (!email) {
        return false;
      }

      // Use Utils validation
      if (!Utils.validateEmail || !Utils.validateEmail(email)) {
        return false;
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      // Check for duplicates
      if (this.isSubscribed(normalizedEmail)) {
        return 'duplicate';
      }

      // Add to subscribers
      const subscribers = this.getSubscribers();
      subscribers.push(normalizedEmail);
      Utils.setLocalStorage(NEWSLETTER_STORAGE_KEY, subscribers);
      
      return true;
    },

    /**
     * Handle form submission
     * @param {HTMLElement} form - Form element
     */
    handleSubmit: function(form) {
      const emailInput = form.querySelector('input[type="email"]');
      const submitButton = form.querySelector('button[type="submit"], .btn-submit');
      
      if (!emailInput) return;

      const email = emailInput.value.trim();
      
      // Validate email
      if (!email) {
        emailInput.classList.add('is-invalid');
        Utils.showToast('Please enter your email address', 'error');
        emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        Utils.showToast('Please enter a valid email address', 'error');
        emailInput.focus();
        return;
      }

      // Remove invalid class
      emailInput.classList.remove('is-invalid');

      // Disable button and show loading
      const originalButtonText = submitButton ? submitButton.innerHTML : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      }

      // Subscribe
      const result = this.subscribe(email);

      // Re-enable button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }

      if (result === 'duplicate') {
        Utils.showToast('This email is already subscribed', 'info');
        emailInput.focus();
        return;
      }

      if (result === true) {
        Utils.showToast('Thank you for subscribing!', 'success');
        form.reset();
      } else {
        Utils.showToast('Subscription failed. Please try again.', 'error');
      }
    },

    /**
     * Initialize newsletter functionality
     */
    init: function() {
      // Use event delegation for all newsletter forms
      document.addEventListener('submit', (e) => {
        const form = e.target.closest('.newsletter-form form');
        if (form) {
          e.preventDefault();
          this.handleSubmit(form);
        }
      });

      // Optional: Real-time email validation
      document.addEventListener('input', (e) => {
        if (e.target.matches('.newsletter-form input[type="email"]')) {
          e.target.classList.remove('is-invalid');
        }
      });

      console.log('✓ Newsletter Manager initialized');
    }
  };

  // Export to global scope
  window.NewsletterManager = NewsletterManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NewsletterManager.init());
  } else {
    NewsletterManager.init();
  }

})(window);


/**
 * ==============================================
 * AUTH.JS - Authentication System
 * ==============================================
 * Handles user authentication:
 * - Guest mode by default
 * - Login/Register functionality
 * - localStorage-based (frontend MVP)
 * - State persistence
 * - Header state updates
 */

(function(window) {
  'use strict';

  // Ensure Utils is loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.error('Auth.js requires utils.js to be loaded first');
    return;
  }

  const Utils = window.EcomUtils;
  const AUTH_STORAGE_KEY = 'esthetical_auth';
  const USERS_STORAGE_KEY = 'esthetical_users';

  const AuthManager = {
    
    /**
     * Get all users from localStorage
     * @returns {Array} Array of user objects
     */
    getUsers: function() {
      return Utils.getLocalStorage(USERS_STORAGE_KEY, []);
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} Current user or null
     */
    getCurrentUser: function() {
      return Utils.getLocalStorage(AUTH_STORAGE_KEY, null);
    },

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn: function() {
      return this.getCurrentUser() !== null;
    },

    /**
     * Check if user exists (for login)
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Object|null} User object or null
     */
    findUser: function(email, password) {
      const users = this.getUsers();
      const normalizedEmail = email.toLowerCase().trim();
      
      return users.find(user => 
        user.email.toLowerCase() === normalizedEmail && 
        user.password === password
      ) || null;
    },

    /**
     * Check if email is already registered
     * @param {string} email - Email address
     * @returns {boolean} True if email exists
     */
    emailExists: function(email) {
      const users = this.getUsers();
      const normalizedEmail = email.toLowerCase().trim();
      
      return users.some(user => 
        user.email.toLowerCase() === normalizedEmail
      );
    },

    /**
     * Register a new user
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Object} Result object {success, message}
     */
    register: function(email, password) {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      // Check if email already exists
      if (this.emailExists(email)) {
        return { success: false, message: 'This email is already registered' };
      }

      // Create new user
      const newUser = {
        id: 'user_' + Date.now(),
        email: email.trim().toLowerCase(),
        password: password, // In production, this should be hashed
        registeredAt: Date.now()
      };

      // Save user
      const users = this.getUsers();
      users.push(newUser);
      Utils.setLocalStorage(USERS_STORAGE_KEY, users);

      // Auto-login after registration
      this.login(email, password);

      return { success: true, message: 'Registration successful!' };
    },

    /**
     * Login user
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Object} Result object {success, message, user}
     */
    login: function(email, password) {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const user = this.findUser(email, password);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Save current user (without password)
      const { password: _, ...userWithoutPassword } = user;
      Utils.setLocalStorage(AUTH_STORAGE_KEY, userWithoutPassword);

      // Update UI
      this.updateUI();

      // Trigger event
      Utils.triggerEvent('auth:login', { user: userWithoutPassword });

      return { success: true, message: 'Login successful!', user: userWithoutPassword };
    },

    /**
     * Logout user
     */
    logout: function() {
      Utils.setLocalStorage(AUTH_STORAGE_KEY, null);
      this.updateUI();
      Utils.triggerEvent('auth:logout');
      Utils.showToast('Logged out successfully', 'info');
    },

    /**
     * Update UI to reflect login state
     */
    updateUI: function() {
      const isLoggedIn = this.isLoggedIn();
      const user = this.getCurrentUser();

      // Update header links (find account/login links)
      const accountLinks = document.querySelectorAll('a[href*="account-login"], a[href*="my-account"]');
      
      accountLinks.forEach(link => {
        if (isLoggedIn) {
          // Show user email or "My Account"
          if (link.textContent.toLowerCase().includes('login')) {
            link.textContent = user.email || 'My Account';
            link.href = 'my-account.html';
          }
        } else {
          // Show "Login"
          if (!link.textContent.toLowerCase().includes('login')) {
            link.textContent = 'Login';
            link.href = 'account-login.html';
          }
        }
      });
    },

    /**
     * Handle login form submission
     * @param {HTMLElement} form - Login form
     */
    handleLogin: function(form) {
      const emailInput = form.querySelector('#login_username, input[type="email"]');
      const passwordInput = form.querySelector('#login_pwsd, input[type="password"]');

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validate
      if (!email || !password) {
        Utils.showToast('Please enter email and password', 'error');
        return;
      }

      const result = this.login(email, password);

      if (result.success) {
        Utils.showToast(result.message, 'success');
        // Redirect to my-account or stay on page
        setTimeout(() => {
          window.location.href = 'my-account.html';
        }, 1000);
      } else {
        Utils.showToast(result.message, 'error');
        // If user doesn't exist, suggest registration
        if (result.message.includes('Invalid')) {
          const registerLink = document.querySelector('a[href*="register"]');
          if (!registerLink) {
            // Could redirect to register or show message
          }
        }
      }
    },

    /**
     * Handle register form submission
     * @param {HTMLElement} form - Register form
     */
    handleRegister: function(form) {
      const emailInput = form.querySelector('#register_username, input[type="email"]');
      const passwordInput = form.querySelector('#register_pwsd, input[type="password"]');

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      const result = this.register(email, password);

      if (result.success) {
        Utils.showToast(result.message, 'success');
        // Redirect to my-account
        setTimeout(() => {
          window.location.href = 'my-account.html';
        }, 1000);
      } else {
        Utils.showToast(result.message, 'error');
      }
    },

    /**
     * Initialize authentication system
     */
    init: function() {
      // Update UI on load
      this.updateUI();

      // Handle login form
      document.addEventListener('submit', (e) => {
        const form = e.target;
        
        // Login form
        if (form.querySelector('#login_username, #login_pwsd')) {
          e.preventDefault();
          this.handleLogin(form);
          return;
        }

        // Register form
        if (form.querySelector('#register_username, #register_pwsd')) {
          e.preventDefault();
          this.handleRegister(form);
          return;
        }
      });

      // Handle logout (if logout button exists)
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-logout], .logout-btn')) {
          e.preventDefault();
          this.logout();
        }
      });

      console.log('✓ Auth Manager initialized (Guest mode by default)');
    }
  };

  // Export to global scope
  window.AuthManager = AuthManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthManager.init());
  } else {
    AuthManager.init();
  }

})(window);


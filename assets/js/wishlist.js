/**
 * ==============================================
 * WISHLIST.JS - Wishlist Manager
 * ==============================================
 * Manages wishlist functionality:
 * - Add/Remove items
 * - Prevent duplicates
 * - Persist to localStorage
 * - Update UI (wishlist icon badge, wishlist page)
 * 
 * IMPORTANT: Wishlist starts EMPTY by default
 * Items are only added when user clicks wishlist heart icon
 */

(function(window) {
  'use strict';

  // Ensure Utils is loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.error('Wishlist.js requires utils.js to be loaded first');
    return;
  }

  const Utils = window.EcomUtils;
  const WISHLIST_STORAGE_KEY = 'esthetical_wishlist';

  /**
   * Wishlist Manager Object
   */
  const WishlistManager = {
    
    /**
     * Get all wishlist items from localStorage
     * @returns {Array} Array of wishlist items
     */
    getItems: function() {
      // STRICT RULE: Return empty array if no data exists
      const items = Utils.getLocalStorage(WISHLIST_STORAGE_KEY, []);
      return Array.isArray(items) ? items : [];
    },

    /**
     * Save wishlist items to localStorage
     * @param {Array} items - Array of wishlist items
     */
    saveItems: function(items) {
      Utils.setLocalStorage(WISHLIST_STORAGE_KEY, items);
      this.updateAllUI();
      // Trigger custom event
      Utils.triggerEvent('wishlist:updated', { items: items });
    },

    /**
     * Check if product is in wishlist
     * @param {string} productId - Product ID
     * @returns {boolean} True if in wishlist
     */
    hasItem: function(productId) {
      const items = this.getItems();
      return items.some(item => item.id === productId);
    },

    /**
     * Add item to wishlist
     * @param {Object} product - Product object {id, name, price, image}
     */
    addItem: function(product) {
      if (!product || !product.id) {
        console.error('Invalid product data');
        return false;
      }

      const items = this.getItems();
      
      // Prevent duplicates
      if (this.hasItem(product.id)) {
        Utils.showToast('Product already in wishlist', 'info');
        return false;
      }

      // Add new product
      items.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        addedAt: Date.now()
      });

      this.saveItems(items);
      Utils.showToast(`${product.name} added to wishlist!`, 'success');
      return true;
    },

    /**
     * Remove item from wishlist
     * @param {string} productId - Product ID to remove
     */
    removeItem: function(productId) {
      const items = this.getItems();
      const filtered = items.filter(item => item.id !== productId);
      
      if (filtered.length !== items.length) {
        this.saveItems(filtered);
        Utils.showToast('Item removed from wishlist', 'info');
        return true;
      }
      return false;
    },

    /**
     * Toggle item in wishlist
     * @param {Object} product - Product object
     * @returns {boolean} True if added, false if removed
     */
    toggleItem: function(product) {
      if (this.hasItem(product.id)) {
        this.removeItem(product.id);
        return false;
      } else {
        this.addItem(product);
        return true;
      }
    },

    /**
     * Clear entire wishlist
     */
    clearWishlist: function() {
      Utils.setLocalStorage(WISHLIST_STORAGE_KEY, []);
      this.updateAllUI();
      Utils.showToast('Wishlist cleared', 'info');
      Utils.triggerEvent('wishlist:cleared');
    },

    /**
     * Get wishlist item count
     * @returns {number} Number of items in wishlist
     */
    getItemCount: function() {
      return this.getItems().length;
    },

    /**
     * Move item from wishlist to cart
     * @param {string} productId - Product ID
     */
    moveToCart: function(productId) {
      const items = this.getItems();
      const item = items.find(i => i.id === productId);
      
      if (item && window.CartManager) {
        window.CartManager.addItem(item);
        this.removeItem(productId);
        return true;
      }
      return false;
    },

    /**
     * Update wishlist badge count
     */
    updateWishlistBadge: function() {
      const count = this.getItemCount();
      
      // Update wishlist icon in header and on page
      const wishlistLinks = document.querySelectorAll('a[href*="product-wishlist"], a[href*="wishlist"]');
      
      wishlistLinks.forEach(link => {
        // Remove existing badge
        let badge = link.querySelector('.wishlist-badge');
        
        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'wishlist-badge';
            badge.style.cssText = `
              position: absolute;
              top: -5px;
              right: -5px;
              background: #e85d75;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 600;
              line-height: 1;
            `;
            link.style.position = 'relative';
            link.appendChild(badge);
          }
          badge.textContent = count > 99 ? '99+' : count;
        } else if (badge) {
          badge.remove();
        }
      });
    },

    /**
     * Update wishlist button states (filled heart if in wishlist)
     */
    updateWishlistButtons: function() {
      const wishlistBtns = document.querySelectorAll('.action-btn-wishlist');
      
      wishlistBtns.forEach(btn => {
        const productItem = btn.closest('.product-item');
        if (!productItem) return;
        
        const productId = productItem.dataset.productId;
        const icon = btn.querySelector('i');
        
        if (icon && productId) {
          if (this.hasItem(productId)) {
            // In wishlist - filled heart
            icon.className = 'fa fa-heart';
            icon.style.color = '#e85d75';
          } else {
            // Not in wishlist - outline heart
            icon.className = 'fa fa-heart-o';
            icon.style.color = '';
          }
        }
      });
    },

    /**
     * Update wishlist page (product-wishlist.html)
     */
    updateWishlistPage: function() {
      // Only run on wishlist page
      const wishlistTable = document.querySelector('.wishlist-table tbody');
      if (!wishlistTable) return;

      const items = this.getItems();
      wishlistTable.innerHTML = '';

      if (items.length === 0) {
        // Empty wishlist message
        wishlistTable.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 60px 20px;">
              <i class="fa fa-heart-o" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
              <h4 style="color: #999; margin-bottom: 10px;">Your wishlist is empty</h4>
              <p style="color: #bbb; margin-bottom: 20px;">Save your favorite products here</p>
              <a href="product.html" class="btn btn-primary">Browse Products</a>
            </td>
          </tr>
        `;
        return;
      }

      // Render wishlist items
      items.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'tbody-item';
        row.dataset.wishlistItemId = item.id;
        
        row.innerHTML = `
          <td class="product-remove">
            <a class="remove" href="javascript:void(0)" data-wishlist-remove="${item.id}">×</a>
          </td>
          <td class="product-thumbnail">
            <div class="thumb">
              <a href="product-details.html">
                <img src="${item.image}" width="68" height="84" alt="${item.name}" onerror="this.src='assets/images/shop/1.webp'">
              </a>
            </div>
          </td>
          <td class="product-name">
            <a class="title" href="product-details.html">${item.name}</a>
          </td>
          <td class="product-price">
            <span class="price">${Utils.formatCurrency(item.price)}</span>
          </td>
          <td class="product-stock-status">
            <span class="stock-status in-stock">In Stock</span>
          </td>
          <td class="product-action">
            <button type="button" class="btn btn-sm btn-primary" data-wishlist-to-cart="${item.id}">
              Add to Cart
            </button>
          </td>
        `;
        
        wishlistTable.appendChild(row);
      });
    },

    /**
     * Update all UI components
     */
    updateAllUI: function() {
      this.updateWishlistBadge();
      this.updateWishlistButtons();
      this.updateWishlistPage();
    },

    /**
     * Initialize wishlist functionality
     */
    init: function() {
      // Update UI on page load
      this.updateAllUI();

      // Event delegation for wishlist buttons
      document.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('.action-btn-wishlist');
        if (wishlistBtn) {
          e.preventDefault();
          this.handleToggleWishlist(wishlistBtn);
        }

        // Handle remove from wishlist
        const removeBtn = e.target.closest('[data-wishlist-remove]');
        if (removeBtn) {
          e.preventDefault();
          const productId = removeBtn.dataset.wishlistRemove;
          this.removeItem(productId);
        }

        // Handle move to cart from wishlist
        const toCartBtn = e.target.closest('[data-wishlist-to-cart]');
        if (toCartBtn) {
          e.preventDefault();
          const productId = toCartBtn.dataset.wishlistToCart;
          this.moveToCart(productId);
        }

        // Handle clear wishlist
        if (e.target.id === 'clearWishlist' || e.target.closest('#clearWishlist')) {
          e.preventDefault();
          if (confirm('Are you sure you want to clear your wishlist?')) {
            this.clearWishlist();
          }
        }
      });

      // Update wishlist buttons when cart updates
      document.addEventListener('cart:updated', () => {
        this.updateWishlistButtons();
      });

      console.log('✓ Wishlist Manager initialized');
    },

    /**
     * Handle wishlist button click
     * @param {HTMLElement} button - The clicked button
     */
    handleToggleWishlist: function(button) {
      // Find closest product item
      const productItem = button.closest('.product-item');
      if (!productItem) {
        console.error('Product item not found');
        return;
      }

      // Extract product data from data attributes
      const productData = {
        id: productItem.dataset.productId,
        name: productItem.dataset.productName,
        price: productItem.dataset.productPrice,
        image: productItem.dataset.productImage
      };

      // Validate required data
      if (!productData.id || !productData.name || !productData.price) {
        console.error('Missing required product data attributes');
        return;
      }

      // Toggle wishlist
      this.toggleItem(productData);

      // Close modal if it's open (Bootstrap modal handling)
      const modal = document.getElementById('action-WishlistModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }
  };

  // Export to global scope
  window.WishlistManager = WishlistManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WishlistManager.init());
  } else {
    WishlistManager.init();
  }

})(window);


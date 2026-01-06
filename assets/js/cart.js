/**
 * ==============================================
 * CART.JS - Shopping Cart Manager
 * ==============================================
 * Manages shopping cart functionality:
 * - Add/Remove items
 * - Update quantities
 * - Calculate totals
 * - Persist to localStorage
 * - Update UI (cart icon badge, cart page, aside cart)
 * 
 * IMPORTANT: Cart starts EMPTY by default
 * Items are only added when user clicks "Add to Cart"
 */

(function(window) {
  'use strict';

  // Ensure Utils is loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.error('Cart.js requires utils.js to be loaded first');
    return;
  }

  const Utils = window.EcomUtils;
  const CART_STORAGE_KEY = 'esthetical_cart';

  /**
   * Cart Manager Object
   */
  const CartManager = {
    
    /**
     * Get all cart items from localStorage
     * @returns {Array} Array of cart items
     */
    getItems: function() {
      // STRICT RULE: Return empty array if no data exists
      // Never preload or auto-add items
      const items = Utils.getLocalStorage(CART_STORAGE_KEY, []);
      return Array.isArray(items) ? items : [];
    },

    /**
     * Save cart items to localStorage
     * @param {Array} items - Array of cart items
     */
    saveItems: function(items) {
      Utils.setLocalStorage(CART_STORAGE_KEY, items);
      this.updateAllUI();
      // Trigger custom event for other components
      Utils.triggerEvent('cart:updated', { items: items });
    },

    /**
     * Add item to cart
     * @param {Object} product - Product object {id, name, price, image, quantity}
     */
    addItem: function(product) {
      if (!product || !product.id) {
        console.error('Invalid product data');
        return false;
      }

      const items = this.getItems();
      const existingIndex = items.findIndex(item => item.id === product.id);

      if (existingIndex > -1) {
        // Product exists - increase quantity
        items[existingIndex].quantity += (product.quantity || 1);
        Utils.showToast(`Updated ${product.name} quantity in cart`, 'success');
      } else {
        // New product - add to cart
        items.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.image,
          quantity: product.quantity || 1
        });
        Utils.showToast(`${product.name} added to cart!`, 'success');
      }

      this.saveItems(items);
      return true;
    },

    /**
     * Remove item from cart
     * @param {string} productId - Product ID to remove
     */
    removeItem: function(productId) {
      const items = this.getItems();
      const filtered = items.filter(item => item.id !== productId);
      
      if (filtered.length !== items.length) {
        this.saveItems(filtered);
        Utils.showToast('Item removed from cart', 'info');
        return true;
      }
      return false;
    },

    /**
     * Update item quantity
     * @param {string} productId - Product ID
     * @param {number} quantity - New quantity
     */
    updateQuantity: function(productId, quantity) {
      const items = this.getItems();
      const item = items.find(i => i.id === productId);
      
      if (item) {
        const newQty = parseInt(quantity);
        if (newQty <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = newQty;
          this.saveItems(items);
        }
        return true;
      }
      return false;
    },

    /**
     * Clear entire cart
     */
    clearCart: function() {
      Utils.setLocalStorage(CART_STORAGE_KEY, []);
      this.updateAllUI();
      Utils.showToast('Cart cleared', 'info');
      Utils.triggerEvent('cart:cleared');
    },

    /**
     * Get cart item count
     * @returns {number} Total number of items
     */
    getItemCount: function() {
      const items = this.getItems();
      return items.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Get cart subtotal
     * @returns {number} Subtotal amount
     */
    getSubtotal: function() {
      const items = this.getItems();
      return items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },

    /**
     * Get cart total (for backend integration)
     * Currently same as subtotal, but can add shipping, tax, etc.
     * @returns {number} Total amount
     */
    getTotal: function() {
      return this.getSubtotal();
    },

    /**
     * Get cart data for checkout/backend
     * @returns {Object} Cart data object
     */
    getCartData: function() {
      const items = this.getItems();
      return {
        items: items,
        itemCount: this.getItemCount(),
        subtotal: this.getSubtotal(),
        total: this.getTotal(),
        currency: 'NGN'
      };
    },

    /**
     * Update cart badge count in header
     */
    updateCartBadge: function() {
      const count = this.getItemCount();
      const cartButtons = document.querySelectorAll('[data-bs-target="#AsideOffcanvasCart"]');
      
      cartButtons.forEach(button => {
        // Remove existing badge
        let badge = button.querySelector('.cart-badge');
        
        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
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
            button.style.position = 'relative';
            button.appendChild(badge);
          }
          badge.textContent = count > 99 ? '99+' : count;
        } else if (badge) {
          badge.remove();
        }
      });
    },

    /**
     * Update aside cart (sidebar cart)
     */
    updateAsideCart: function() {
      const asideCart = document.getElementById('AsideOffcanvasCart');
      if (!asideCart) return;

      const items = this.getItems();
      const productList = asideCart.querySelector('.aside-cart-product-list');
      const totalElement = asideCart.querySelector('.cart-total .amount');
      
      if (!productList) return;

      // Clear existing items
      productList.innerHTML = '';

      if (items.length === 0) {
        // Empty cart state
        productList.innerHTML = `
          <li style="text-align: center; padding: 40px 20px; color: #999;">
            <i class="fa fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
            <p style="margin: 0; font-size: 14px;">Your cart is empty</p>
          </li>
        `;
        if (totalElement) totalElement.textContent = Utils.formatCurrency(0);
        return;
      }

      // Render cart items
      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'aside-product-list-item';
        li.innerHTML = `
          <a href="javascript:void(0)" class="remove" data-cart-remove="${item.id}">×</a>
          <a href="product-details.html">
            <img src="${item.image}" width="68" height="84" alt="${item.name}" onerror="this.src='assets/images/shop/1.webp'">
            <span class="product-title">${item.name}</span>
          </a>
          <span class="product-price">${item.quantity} × ${Utils.formatCurrency(item.price)}</span>
        `;
        productList.appendChild(li);
      });

      // Update total
      if (totalElement) {
        totalElement.textContent = Utils.formatCurrency(this.getSubtotal());
      }
    },

    /**
     * Update cart page (product-cart.html)
     */
    updateCartPage: function() {
      // Only run on cart page
      const cartTable = document.querySelector('.shopping-cart-form tbody');
      if (!cartTable) return;

      const items = this.getItems();
      cartTable.innerHTML = '';

      if (items.length === 0) {
        // Empty cart message
        cartTable.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 60px 20px;">
              <i class="fa fa-shopping-cart" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
              <h4 style="color: #999; margin-bottom: 10px;">Your cart is empty</h4>
              <p style="color: #bbb; margin-bottom: 20px;">Add some products to get started</p>
              <a href="product.html" class="btn btn-primary">Continue Shopping</a>
            </td>
          </tr>
        `;
        
        // Hide cart totals section
        const cartTotals = document.querySelector('.cart-totals-wrap');
        if (cartTotals) cartTotals.style.display = 'none';
        
        return;
      }

      // Show cart totals section
      const cartTotals = document.querySelector('.cart-totals-wrap');
      if (cartTotals) cartTotals.style.display = 'block';

      // Render cart items
      items.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'tbody-item';
        row.dataset.cartItemId = item.id;
        
        const itemTotal = item.price * item.quantity;
        
        row.innerHTML = `
          <td class="product-remove">
            <a class="remove" href="javascript:void(0)" data-cart-remove="${item.id}">×</a>
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
          <td class="product-quantity">
            <div class="pro-qty">
              <input type="number" class="quantity" title="Quantity" value="${item.quantity}" 
                     min="1" data-cart-quantity="${item.id}">
            </div>
          </td>
          <td class="product-subtotal">
            <span class="price">${Utils.formatCurrency(itemTotal)}</span>
          </td>
        `;
        
        cartTable.appendChild(row);
      });

      // Add actions row
      const actionsRow = document.createElement('tr');
      actionsRow.className = 'tbody-item-actions';
      actionsRow.innerHTML = `
        <td colspan="6">
          <button type="button" class="btn btn-secondary" id="clearCart">Clear Cart</button>
        </td>
      `;
      cartTable.appendChild(actionsRow);

      // Update totals
      this.updateCartTotals();
    },

    /**
     * Update cart totals on cart page
     */
    updateCartTotals: function() {
      const subtotalElement = document.querySelector('.cart-totals-wrap .subtotal-amount');
      const totalElement = document.querySelector('.cart-totals-wrap .total-amount');
      
      const subtotal = this.getSubtotal();
      const total = this.getTotal();
      
      if (subtotalElement) subtotalElement.textContent = Utils.formatCurrency(subtotal);
      if (totalElement) totalElement.textContent = Utils.formatCurrency(total);
    },

    /**
     * Update all UI components
     */
    updateAllUI: function() {
      this.updateCartBadge();
      this.updateAsideCart();
      this.updateCartPage();
    },

    /**
     * Initialize cart functionality
     */
    init: function() {
      // Update UI on page load
      this.updateAllUI();

      // Event delegation for Add to Cart buttons
      document.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('.action-btn-cart');
        if (cartBtn) {
          e.preventDefault();
          this.handleAddToCart(cartBtn);
        }

        // Handle remove from cart
        const removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
          e.preventDefault();
          const productId = removeBtn.dataset.cartRemove;
          this.removeItem(productId);
        }

        // Handle clear cart
        if (e.target.id === 'clearCart' || e.target.closest('#clearCart')) {
          e.preventDefault();
          if (confirm('Are you sure you want to clear your cart?')) {
            this.clearCart();
          }
        }
      });

      // Event delegation for quantity changes
      document.addEventListener('input', Utils.debounce((e) => {
        if (e.target.matches('[data-cart-quantity]')) {
          const productId = e.target.dataset.cartQuantity;
          const quantity = parseInt(e.target.value) || 1;
          this.updateQuantity(productId, quantity);
        }
      }, 500));

      console.log('✓ Cart Manager initialized');
    },

    /**
     * Handle Add to Cart button click
     * @param {HTMLElement} button - The clicked button
     */
    handleAddToCart: function(button) {
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

      // Add to cart
      this.addItem(productData);

      // Close modal if it's open (Bootstrap modal handling)
      const modal = bootstrap.Modal.getInstance(document.getElementById('action-CartAddModal'));
      if (modal) modal.hide();
    }
  };

  // Export to global scope
  window.CartManager = CartManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CartManager.init());
  } else {
    CartManager.init();
  }

})(window);


/**
 * ==============================================
 * CHECKOUT.JS - Checkout Page Logic
 * ==============================================
 * Handles checkout page functionality:
 * - Load cart items
 * - Payment method selection
 * - Paystack integration
 * - Pay on Delivery
 * - Order confirmation
 */

(function(window) {
  'use strict';

  // Ensure Utils and CartManager are loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.error('Checkout.js requires utils.js to be loaded first');
    return;
  }

  if (typeof window.CartManager === 'undefined') {
    console.error('Checkout.js requires cart.js to be loaded first');
    return;
  }

  const Utils = window.EcomUtils;
  const ORDERS_STORAGE_KEY = 'esthetical_orders';
  let selectedPaymentMethod = null;

  const CheckoutManager = {
    
    /**
     * Initialize checkout page
     */
    init: function() {
      // Only run on checkout page
      if (!document.querySelector('.shopping-checkout-wrap')) return;

      // Check if cart is empty
      const cartItems = window.CartManager.getItems();
      if (cartItems.length === 0) {
        this.showEmptyCartMessage();
        return;
      }

      // Load cart items into checkout
      this.loadCartItems();

      // Set up payment methods
      this.setupPaymentMethods();

      // Set up form submission
      this.setupFormSubmission();

      console.log('✓ Checkout Manager initialized');
    },

    /**
     * Show empty cart message and redirect
     */
    showEmptyCartMessage: function() {
      const checkoutSection = document.querySelector('.shopping-checkout-wrap');
      if (!checkoutSection) return;

      checkoutSection.innerHTML = `
        <div class="container">
          <div style="text-align: center; padding: 60px 20px;">
            <i class="fa fa-shopping-cart" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
            <h2 style="color: #999; margin-bottom: 10px;">Your cart is empty</h2>
            <p style="color: #bbb; margin-bottom: 20px;">Please add items to your cart before checkout</p>
            <a href="product-cart.html" class="btn btn-primary">View Cart</a>
            <a href="product.html" class="btn btn-secondary">Continue Shopping</a>
          </div>
        </div>
      `;
    },

    /**
     * Load cart items into checkout order table
     */
    loadCartItems: function() {
      const cartItems = window.CartManager.getItems();
      const tableBody = document.querySelector('.order-details-table-wrap tbody');
      
      if (!tableBody) return;

      // Clear existing items (keep header if exists)
      const existingItems = tableBody.querySelectorAll('.cart-item');
      existingItems.forEach(item => item.remove());

      // Add cart items
      cartItems.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.innerHTML = `
          <td class="product-name">${item.name} <span class="product-quantity">× ${item.quantity}</span></td>
          <td class="product-total">${Utils.formatCurrency(item.price * item.quantity)}</td>
        `;
        tableBody.appendChild(row);
      });

      // Update totals
      this.updateTotals();
    },

    /**
     * Update order totals
     */
    updateTotals: function() {
      const cartData = window.CartManager.getCartData();
      const subtotalCell = document.querySelector('.order-details-table-wrap .cart-subtotal td, .order-details-table-wrap tfoot .cart-subtotal td');
      const totalCell = document.querySelector('.order-details-table-wrap .order-total td, .order-details-table-wrap tfoot .order-total td');

      if (subtotalCell) {
        subtotalCell.textContent = Utils.formatCurrency(cartData.subtotal);
      }

      if (totalCell) {
        totalCell.textContent = Utils.formatCurrency(cartData.total);
      }
    },

    /**
     * Set up payment methods - show only Paystack and Pay on Delivery
     */
    setupPaymentMethods: function() {
      const paymentAccordion = document.getElementById('PaymentMethodAccordion');
      if (!paymentAccordion) return;

      const paymentCards = paymentAccordion.querySelectorAll('.card');
      
      paymentCards.forEach((card, index) => {
        const titleElement = card.querySelector('.title');
        if (!titleElement) return;

        const title = titleElement.textContent.toLowerCase();
        const isPaystack = title.includes('paystack') || title.includes('pay with paystack');
        const isPayOnDelivery = title.includes('cash on delivery') || title.includes('pay on delivery');

        // Hide/disable other payment methods
        if (!isPaystack && !isPayOnDelivery) {
          // Hide the card but keep it in DOM (don't remove, just hide)
          card.style.display = 'none';
        } else {
          // Make Paystack or Pay on Delivery clickable
          const cardHeader = card.querySelector('.card-header');
          if (cardHeader) {
            cardHeader.style.cursor = 'pointer';
            
            cardHeader.addEventListener('click', (e) => {
              e.preventDefault();
              
              // Set selected payment method
              if (isPaystack) {
                selectedPaymentMethod = 'paystack';
              } else if (isPayOnDelivery) {
                selectedPaymentMethod = 'pay_on_delivery';
              }

              // Close other payment methods
              paymentCards.forEach(otherCard => {
                if (otherCard !== card) {
                  const collapse = otherCard.querySelector('.collapse');
                  if (collapse && bootstrap.Collapse.getInstance(collapse)) {
                    bootstrap.Collapse.getInstance(collapse).hide();
                  }
                }
              });

              // Toggle this payment method
              const collapse = card.querySelector('.collapse');
              if (collapse) {
                let bsCollapse = bootstrap.Collapse.getInstance(collapse);
                if (!bsCollapse) {
                  bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
                }
                bsCollapse.show();
                
                // Add visual indication
                paymentCards.forEach(c => {
                  const header = c.querySelector('.card-header');
                  if (header) header.classList.remove('selected');
                });
                cardHeader.classList.add('selected');
              }
            });
          }
        }
      });

      // Set default payment method to Paystack
      const paystackCard = Array.from(paymentCards).find(card => {
        const title = card.querySelector('.title')?.textContent.toLowerCase();
        return title && title.includes('paystack');
      });
      
      if (paystackCard) {
        selectedPaymentMethod = 'paystack';
        const paystackHeader = paystackCard.querySelector('.card-header');
        if (paystackHeader) paystackHeader.classList.add('selected');
      } else {
        // If no Paystack option exists, create it
        this.addPaystackOption(paymentAccordion);
        selectedPaymentMethod = 'paystack';
      }

      // Ensure Pay on Delivery exists (but don't set as default)
      if (!Array.from(paymentCards).some(card => {
        const title = card.querySelector('.title')?.textContent.toLowerCase();
        return (title && (title.includes('cash on delivery') || title.includes('pay on delivery')));
      })) {
        this.addPayOnDeliveryOption(paymentAccordion);
      }
    },

    /**
     * Add Paystack payment option
     */
    addPaystackOption: function(accordion) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header" id="check_payments_paystack">
          <h5 class="title" data-bs-toggle="collapse" data-bs-target="#itemPaystack" aria-controls="itemPaystack">
            Pay with Paystack
          </h5>
        </div>
        <div id="itemPaystack" class="collapse" aria-labelledby="check_payments_paystack" data-bs-parent="#PaymentMethodAccordion">
          <div class="card-body">
            <p>Pay securely with Paystack. Accepts cards, bank transfers, and more.</p>
          </div>
        </div>
      `;
      accordion.appendChild(card);
      
      // Set up click handler
      const cardHeader = card.querySelector('.card-header');
      cardHeader.style.cursor = 'pointer';
      cardHeader.addEventListener('click', () => {
        selectedPaymentMethod = 'paystack';
      });
    },

    /**
     * Add Pay on Delivery option
     */
    addPayOnDeliveryOption: function(accordion) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header" id="check_payments_pod">
          <h5 class="title" data-bs-toggle="collapse" data-bs-target="#itemPayOnDelivery" aria-controls="itemPayOnDelivery">
            Pay on Delivery
          </h5>
        </div>
        <div id="itemPayOnDelivery" class="collapse" aria-labelledby="check_payments_pod" data-bs-parent="#PaymentMethodAccordion">
          <div class="card-body">
            <p>Pay with cash when your order is delivered.</p>
          </div>
        </div>
      `;
      accordion.appendChild(card);
      
      // Set up click handler
      const cardHeader = card.querySelector('.card-header');
      cardHeader.style.cursor = 'pointer';
      cardHeader.addEventListener('click', () => {
        selectedPaymentMethod = 'pay_on_delivery';
      });
    },

    /**
     * Set up form submission
     */
    setupFormSubmission: function() {
      const checkoutForm = document.getElementById('checkout-form');
      const placeOrderBtn = document.querySelector('.btn-place-order');

      if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handlePlaceOrder();
        });
      }
    },

    /**
     * Handle place order
     */
    handlePlaceOrder: function() {
      // Validate form
      const emailInput = document.getElementById('email');
      const privacyCheckbox = document.getElementById('privacy');

      if (!emailInput || !emailInput.value.trim()) {
        Utils.showToast('Please enter your email address', 'error');
        emailInput?.focus();
        return;
      }

      if (privacyCheckbox && !privacyCheckbox.checked) {
        Utils.showToast('Please agree to the terms and conditions', 'error');
        return;
      }

      // Check payment method
      if (!selectedPaymentMethod) {
        Utils.showToast('Please select a payment method', 'error');
        return;
      }

      // Route to appropriate payment handler
      if (selectedPaymentMethod === 'paystack') {
        this.handlePaystackPayment();
      } else if (selectedPaymentMethod === 'pay_on_delivery') {
        this.handlePayOnDelivery();
      }
    },

    /**
     * Handle Paystack payment
     */
    handlePaystackPayment: function() {
      // Paystack is handled by paystack-checkout.js
      if (typeof window.initiatePaystackPayment === 'function') {
        window.initiatePaystackPayment();
      } else {
        Utils.showToast('Paystack is not loaded. Please refresh the page.', 'error');
      }
    },

    /**
     * Handle Pay on Delivery
     */
    handlePayOnDelivery: function() {
      const cartData = window.CartManager.getCartData();
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value.trim() : '';

      // Get form data
      const formData = {
        email: email,
        firstName: document.getElementById('f_name')?.value || '',
        lastName: document.getElementById('l_name')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('street-address')?.value || '',
        city: document.getElementById('town')?.value || '',
        country: document.getElementById('country')?.value || '',
        orderNotes: document.getElementById('order-notes')?.value || ''
      };

      // Create order
      const order = {
        id: 'ORDER_' + Date.now(),
        items: cartData.items,
        total: cartData.total,
        paymentMethod: 'pay_on_delivery',
        status: 'pending',
        customer: formData,
        createdAt: Date.now()
      };

      // Save order
      const orders = Utils.getLocalStorage(ORDERS_STORAGE_KEY, []);
      orders.push(order);
      Utils.setLocalStorage(ORDERS_STORAGE_KEY, orders);

      // Clear cart
      window.CartManager.clearCart();

      // Show success message
      Utils.showToast('Order placed successfully! You will pay on delivery.', 'success');

      // Redirect to confirmation page (or show message)
      setTimeout(() => {
        window.location.href = 'index.html?order=success&id=' + order.id;
      }, 2000);
    },

    /**
     * Save order (shared function)
     */
    saveOrder: function(paymentMethod, paymentReference) {
      const cartData = window.CartManager.getCartData();
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value.trim() : '';

      const formData = {
        email: email,
        firstName: document.getElementById('f_name')?.value || '',
        lastName: document.getElementById('l_name')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('street-address')?.value || '',
        city: document.getElementById('town')?.value || '',
        country: document.getElementById('country')?.value || '',
        orderNotes: document.getElementById('order-notes')?.value || ''
      };

      const order = {
        id: 'ORDER_' + Date.now(),
        items: cartData.items,
        total: cartData.total,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference || null,
        status: paymentMethod === 'paystack' ? 'paid' : 'pending',
        customer: formData,
        createdAt: Date.now()
      };

      const orders = Utils.getLocalStorage(ORDERS_STORAGE_KEY, []);
      orders.push(order);
      Utils.setLocalStorage(ORDERS_STORAGE_KEY, orders);

      return order;
    }
  };

  // Export to global scope
  window.CheckoutManager = CheckoutManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutManager.init());
  } else {
    CheckoutManager.init();
  }

})(window);


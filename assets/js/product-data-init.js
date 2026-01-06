/**
 * ==============================================
 * PRODUCT-DATA-INIT.JS - Auto Product Data Attributes
 * ==============================================
 * Automatically adds data-* attributes to product items
 * that don't have them yet. This allows existing HTML
 * to work without manually editing every product.
 * 
 * Extracts data from existing HTML structure:
 * - Product name from .title link
 * - Price from .price element
 * - Image from .product-thumb img
 * - Generates unique ID from name
 */

(function(window) {
  'use strict';

  // Ensure Utils is loaded
  if (typeof window.EcomUtils === 'undefined') {
    console.warn('Product data init: EcomUtils not loaded, using fallback functions');
  }

  const Utils = window.EcomUtils || {
    parsePrice: function(text) {
      if (typeof text === 'number') return text;
      if (!text) return 0;
      const cleaned = String(text).replace(/[₦,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    },
    generateId: function(name) {
      if (!name) return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    }
  };

  /**
   * Initialize product data attributes
   */
  function initProductData() {
    const productItems = document.querySelectorAll('.product-item');
    let processedCount = 0;
    let skippedCount = 0;

    productItems.forEach((item, index) => {
      // Skip if already has data attributes
      if (item.dataset.productId && item.dataset.productName && item.dataset.productPrice) {
        skippedCount++;
        return;
      }

      // Extract product data from DOM
      const nameElement = item.querySelector('.product-info .title a, .product-info .title');
      const priceElement = item.querySelector('.product-info .prices .price, .product-info .price');
      const imageElement = item.querySelector('.product-thumb img');

      if (!nameElement || !priceElement) {
        console.warn('Product item missing required elements (name or price):', item);
        return;
      }

      // Extract values
      const productName = nameElement.textContent.trim();
      const productPrice = Utils.parsePrice(priceElement.textContent);
      const productImage = imageElement ? imageElement.getAttribute('src') : 'assets/images/shop/1.webp';
      const productId = Utils.generateId(productName);

      // Set data attributes
      item.dataset.productId = productId;
      item.dataset.productName = productName;
      item.dataset.productPrice = productPrice;
      item.dataset.productImage = productImage;

      processedCount++;
    });

    if (processedCount > 0) {
      console.log(`✓ Product data initialized: ${processedCount} products processed, ${skippedCount} already had data`);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductData);
  } else {
    initProductData();
  }

  // Re-run when products are dynamically added (for future enhancements)
  window.addEventListener('productsLoaded', initProductData);

  // Export for manual calls if needed
  window.initProductData = initProductData;

})(window);


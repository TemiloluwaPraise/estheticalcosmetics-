/**
 * ==============================================
 * SEARCH.JS - Product Search Functionality
 * ==============================================
 * Implements product search:
 * - Searches by product name
 * - Partial matches
 * - Live search or on submit
 * - Shows "No results found"
 * - Does not reload page
 */

(function(window) {
  'use strict';

  const SearchManager = {
    
    /**
     * Get all products from the current page
     * @returns {Array} Array of product elements with data
     */
    getProducts: function() {
      const productItems = document.querySelectorAll('.product-item');
      const products = [];
      
      productItems.forEach(item => {
        const nameElement = item.querySelector('.product-info .title a, .product-info .title');
        if (nameElement) {
          products.push({
            element: item,
            name: nameElement.textContent.trim(),
            id: item.dataset.productId || null
          });
        }
      });
      
      return products;
    },

    /**
     * Search products by name (case-insensitive, partial match)
     * @param {string} query - Search query
     * @returns {Array} Matching products
     */
    searchProducts: function(query) {
      if (!query || query.trim() === '') {
        return this.getProducts();
      }
      
      const searchTerm = query.toLowerCase().trim();
      const allProducts = this.getProducts();
      
      return allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm);
      });
    },

    /**
     * Display search results
     * @param {Array} results - Array of matching products
     * @param {string} query - Search query
     */
    displayResults: function(results, query) {
      const productContainer = document.querySelector('.shop-product-area .row, .product-area .row, .row');
      if (!productContainer) return;

      // Get parent container
      const parentContainer = productContainer.closest('.container, .shop-product-area, .product-area, section');
      if (!parentContainer) return;

      // Hide all products first
      const allProducts = this.getProducts();
      allProducts.forEach(product => {
        product.element.style.display = 'none';
      });

      // Show matching products
      if (results.length > 0) {
        results.forEach(product => {
          product.element.style.display = '';
        });
        
        // Remove any existing no-results message
        const existingNoResults = parentContainer.querySelector('.search-no-results');
        if (existingNoResults) existingNoResults.remove();
      } else {
        // Show "No results found" message
        const existingNoResults = parentContainer.querySelector('.search-no-results');
        if (existingNoResults) return; // Already showing
        
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'search-no-results';
        noResultsDiv.style.cssText = `
          text-align: center;
          padding: 60px 20px;
          grid-column: 1 / -1;
          width: 100%;
        `;
        noResultsDiv.innerHTML = `
          <i class="fa fa-search" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
          <h4 style="color: #999; margin-bottom: 10px;">No products found</h4>
          <p style="color: #bbb; margin-bottom: 20px;">No products match "${query}"</p>
          <a href="product.html" class="btn btn-primary">View All Products</a>
        `;
        
        // Insert after product container or as first child
        if (productContainer.nextSibling) {
          parentContainer.insertBefore(noResultsDiv, productContainer.nextSibling);
        } else {
          parentContainer.appendChild(noResultsDiv);
        }
      }
    },

    /**
     * Handle search input
     * @param {string} query - Search query
     * @param {boolean} isLive - If true, search on input; if false, search on submit
     */
    handleSearch: function(query, isLive = false) {
      // Only search on product pages
      if (!document.querySelector('.product-item')) {
        // Redirect to product page with search query
        window.location.href = `product.html?search=${encodeURIComponent(query)}`;
        return;
      }

      const results = this.searchProducts(query);
      this.displayResults(results, query);
      
      // Update URL without reload
      if (query) {
        const newUrl = window.location.pathname + `?search=${encodeURIComponent(query)}`;
        window.history.pushState({ search: query }, '', newUrl);
      } else {
        window.history.pushState({}, '', window.location.pathname);
      }
    },

    /**
     * Initialize search functionality
     */
    init: function() {
      const searchInput = document.getElementById('SearchInput');
      if (!searchInput) return;

      // Check for search query in URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search');
      if (urlSearch) {
        searchInput.value = urlSearch;
        this.handleSearch(urlSearch, false);
      }

      // Handle form submission
      const searchForm = searchInput.closest('form');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchInput.value.trim();
          
          // If not on product page, redirect
          if (!document.querySelector('.product-item')) {
            window.location.href = `product.html?search=${encodeURIComponent(query)}`;
            return;
          }
          
          this.handleSearch(query, false);
        });
      }

      // Optional: Live search (debounced)
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const query = searchInput.value.trim();
          if (query.length >= 2 || query.length === 0) {
            this.handleSearch(query, true);
          }
        }, 300);
      });

      console.log('✓ Search Manager initialized');
    }
  };

  // Export to global scope
  window.SearchManager = SearchManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchManager.init());
  } else {
    SearchManager.init();
  }

})(window);


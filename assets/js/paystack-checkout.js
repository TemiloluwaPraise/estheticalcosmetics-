/**
 * Paystack Inline Checkout (Static site / Vanilla JS)
 * --------------------------------------------------
 * What this file does:
 * - Listens for click on your existing checkout button (ID "checkoutBtn" OR fallback ".btn-place-order")
 * - Collects customer email from #email
 * - Collects amount (NGN) from an existing global OR from the "Total" row on the page
 * - Opens Paystack Inline popup (currency: NGN)
 * - Handles success callback + user closing the modal
 *
 * IMPORTANT:
 * - Replace PAYSTACK_PUBLIC_KEY below with your Paystack PUBLIC TEST key (starts with pk_test_)
 * - Amount sent to Paystack MUST be in kobo (NGN * 100)
 */

(function () {
  "use strict";

  // ================================
  // 1) CONFIG: REPLACE THIS KEY
  // ================================
  // Replace the value below with YOUR Paystack public test key.
  // Example format: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  var PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PUBLIC_TEST_KEY";

  // ================================
  // 2) ELEMENTS
  // ================================
  // Per your assumption: the button may already have an ID like "checkoutBtn".
  // Fallback to the template's existing button class: ".btn-place-order".
  var checkoutBtn =
    document.getElementById("checkoutBtn") ||
    document.querySelector(".btn-place-order");

  // Email field on product-checkout.html is already: <input id="email" ...>
  var emailInput = document.getElementById("email");

  // ================================
  // 3) HELPERS
  // ================================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  /**
   * Get amount in kobo.
   *
   * Priority:
   * 1) Use CartManager.getTotal() if available (from cart.js)
   * 2) Use an existing amount you set in JS (if you already have one):
   *    - window.checkoutAmountKobo (number, already in kobo), OR
   *    - window.checkoutAmountNgn (number, in NGN)
   * 3) Otherwise, read the "Total" value from the checkout table:
   *    - .order-total td (e.g. "₦175,500")
   */
  function getAmountKobo() {
    // First, try to get total from CartManager (if cart.js is loaded)
    if (typeof window.CartManager !== 'undefined' && typeof window.CartManager.getTotal === 'function') {
      var cartTotal = window.CartManager.getTotal();
      if (cartTotal && cartTotal > 0) {
        return Math.round(cartTotal * 100); // convert NGN to kobo
      }
    }

    if (typeof window.checkoutAmountKobo === "number" && isFinite(window.checkoutAmountKobo)) {
      return Math.round(window.checkoutAmountKobo);
    }

    if (typeof window.checkoutAmountNgn === "number" && isFinite(window.checkoutAmountNgn)) {
      return Math.round(window.checkoutAmountNgn * 100);
    }

    var totalCell = document.querySelector(".order-total td");
    if (!totalCell) return null;

    var text = (totalCell.textContent || "").trim(); // e.g. "₦175,500"
    // Keep digits + dot, remove currency symbol and commas.
    var numeric = text.replace(/[^\d.]/g, "");
    var amountNgn = parseFloat(numeric);
    if (!isFinite(amountNgn) || amountNgn <= 0) return null;

    return Math.round(amountNgn * 100); // convert NGN -> kobo
  }

  function showInlineMessage(message, type) {
    // type: "success" | "error" | "info"
    var existing = document.getElementById("paystackMessage");
    if (existing) existing.remove();

    var el = document.createElement("div");
    el.id = "paystackMessage";
    el.setAttribute("role", "alert");
    el.style.cssText =
      "margin-top:12px;padding:12px 14px;border-radius:6px;font-size:14px;line-height:1.4;" +
      (type === "success"
        ? "background:#e9f8ee;border:1px solid #bfe7c9;color:#146c2e;"
        : type === "error"
          ? "background:#fdecec;border:1px solid #f4b7b7;color:#8a1f1f;"
          : "background:#eef5ff;border:1px solid #b8d6ff;color:#123b6b;");
    el.textContent = message;

    // Place message just after the checkout button (best UX on this template)
    checkoutBtn.insertAdjacentElement("afterend", el);
  }

  function generateRef() {
    // Simple unique-ish reference for a static site demo.
    // In production, references should be created server-side.
    return "ORDER_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
  }

  // ================================
  // 4) PAYSTACK INTEGRATION
  // ================================
  function openPaystack() {
    if (!window.PaystackPop) {
      showInlineMessage(
        "Paystack library not loaded. Make sure you added: <script src=\"https://js.paystack.co/v1/inline.js\"></script>",
        "error"
      );
      return;
    }

    if (!checkoutBtn) {
      // Should never happen because we only call openPaystack from a click handler,
      // but guard anyway.
      return;
    }

    var email = emailInput ? emailInput.value.trim() : "";
    if (!isValidEmail(email)) {
      showInlineMessage("Please enter a valid email address before paying.", "error");
      if (emailInput) emailInput.focus();
      return;
    }

    var amountKobo = getAmountKobo();
    if (!amountKobo) {
      showInlineMessage(
        "Could not determine the total amount. Set window.checkoutAmountNgn or window.checkoutAmountKobo, or ensure the page has a visible Total value.",
        "error"
      );
      return;
    }

    // Open Paystack inline popup
    var handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountKobo, // kobo
      currency: "NGN",
      ref: generateRef(),

      // SUCCESS: Paystack says payment was successful
      callback: function (response) {
        // response.reference contains the transaction reference
        showInlineMessage(
          "Payment successful! Reference: " + response.reference + ". Redirecting...",
          "success"
        );

        // Save order using CheckoutManager if available
        if (typeof window.CheckoutManager !== 'undefined' && typeof window.CheckoutManager.saveOrder === 'function') {
          window.CheckoutManager.saveOrder('paystack', response.reference);
        }

        // Clear cart after successful payment
        if (typeof window.CartManager !== 'undefined' && typeof window.CartManager.clearCart === 'function') {
          window.CartManager.clearCart();
        }

        // Redirect after success
        setTimeout(function () {
          // CHANGE THIS if you have a dedicated thank-you page:
          // window.location.href = "thank-you.html?ref=" + encodeURIComponent(response.reference);
          window.location.href = "index.html?order=success&ref=" + encodeURIComponent(response.reference);
        }, 1200);
      },

      // USER CLOSED MODAL
      onClose: function () {
        showInlineMessage("Payment cancelled (you closed the payment window).", "info");
      }
    });

    handler.openIframe();
  }

  // ================================
  // 5) PAYSTACK PAYMENT FUNCTION (for checkout.js)
  // ================================
  // Export function for CheckoutManager to use
  window.initiatePaystackPayment = function() {
    // Check if Paystack payment method is selected
    // (This is handled by checkout.js, but we verify here too)
    openPaystack();
  };

  // ================================
  // 6) OLD BUTTON HANDLER (for backwards compatibility)
  // ================================
  // Don't auto-attach to button - let checkout.js handle it
  // This prevents double-triggering
  // If checkout.js is not loaded, this won't run anyway
})();



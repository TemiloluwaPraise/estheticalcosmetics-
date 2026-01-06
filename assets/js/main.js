(function($) {
  "use strict";

  var varWindow = $(window);

  // Css Function Js
    const bgSelector = $("[data-bg-img]");
    bgSelector.each(function (index, elem) {
      let element = $(elem),
        bgSource = element.data('bg-img');
      element.css('background-image', 'url(' + bgSource + ')');
    });
    
    const Bgcolorcl = $("[data-bg-color]");
    Bgcolorcl.each(function (index, elem) {
      let element = $(elem),
        Bgcolor = element.data('bg-color');
      element.css('background-color', Bgcolor);
    });

  // Menu Activeion Js
    var cururl = window.location.pathname;
    var curpage = cururl.substr(cururl.lastIndexOf('/') + 1);
    var hash = window.location.hash.substr(1);
    if((curpage === "" || curpage === "/" || curpage === "admin") && hash === "")
      {
      } else {
        $(".header-navigation li").each(function()
      {
        $(this).removeClass("active");
      });
      if(hash != "")
        $(".header-navigation li a[href='"+hash+"']").parents("li").addClass("active");
      else
      $(".header-navigation li a[href='"+curpage+"']").parents("li").addClass("active");
    }

  // Offcanvas Nav Js
    var $offcanvasNav = $("#offcanvasNav a");
    $offcanvasNav.on("click", function () {
      var link = $(this);
      var closestUl = link.closest("ul");
      var activeLinks = closestUl.find(".active");
      var closestLi = link.closest("li");
      var linkStatus = closestLi.hasClass("active");
      var count = 0;

      closestUl.find("ul").slideUp(function () {
        if (++count == closestUl.find("ul").length)
          activeLinks.removeClass("active");
      });

      if (!linkStatus) {
        closestLi.children("ul").slideDown();
        closestLi.addClass("active");
      }
    });

  // Swiper Default Slider JS
    var mainlSlider = new Swiper('.hero-slider-container', {
      slidesPerView : 1,
      slidesPerGroup: 1,
      loop: true,
      speed: 700,
      spaceBetween: 0,
      effect: 'fade',
      autoHeight: true, //enable auto height
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: '.hero-slider-pagination',
        type: 'fraction',
        formatFractionCurrent: function (number) {
            return '0' + number;
        },
        formatFractionTotal: function (number) {
            return '0' + number;
        }
      },
    });

  // Swiper Default Slider JS
    var mainlSlider2 = new Swiper('.hero-two-slider-container', {
      slidesPerView : 1,
      slidesPerGroup: 1,
      loop: true,
      speed: 700,
      spaceBetween: 0,
      effect: 'fade',
      autoHeight: true, //enable auto height
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: ".hero-two-slider-pagination",
        clickable: true,
      },
    });

  // Brand Logo Slider Js
    var brandLogoSlider = new Swiper('.brand-logo-slider-container', {
      autoplay: {
        delay: 5000,
      },
      loop: true,
      slidesPerView : 4,
      slidesPerGroup: 1,
      spaceBetween: 62,
      speed: 500,
      breakpoints: {
        1200: {
          slidesPerView : 4,
        },
        768: {
          slidesPerView : 4,
        },
        576: {
          slidesPerView : 3,
        },
        480: {
          slidesPerView : 2,
        },
        0: {
          slidesPerView : 1,
        },
      }
    });

  // Related Product Slider Js
    var productSliderCol4 = new Swiper('.related-product-slide-container', {
      slidesPerView : 3,
      slidesPerGroup: 1,
      allowTouchMove: false,
      spaceBetween: 30,
      speed: 600,
      breakpoints: {
        1200: {
          slidesPerView : 3,
          allowTouchMove: true,
          autoplay: {
            delay: 5000,
          },
        },
        992: {
          slidesPerView : 3,
          allowTouchMove: true,
          autoplay: {
            delay: 5000,
          },
        },
        576: {
          slidesPerView : 2,
          allowTouchMove: true,
          autoplay: {
            delay: 5000,
          },
        },
        0: {
          slidesPerView : 1,
          allowTouchMove: true,
          autoplay: {
            delay: 5000,
          },
        },
      }
    });

  // Product Quantity JS
    var proQty = $(".pro-qty");
    proQty.each(function() {
      if ($(this).find('.qty-btn').length === 0) {
        $(this).append('<div class="dec qty-btn">-</div>');
        $(this).append('<div class="inc qty-btn">+</div>');
      }
    });
    
    $('.qty-btn').on('click', function (e) {
      e.preventDefault();
      var $button = $(this);
      var $input = $button.parent().find('input');
      var oldValue = parseFloat($input.val()) || 1;
      var newVal;
      
      if ($button.hasClass('inc')) {
        newVal = oldValue + 1;
      } else {
        if (oldValue > 1) {
          newVal = oldValue - 1;
        } else {
          newVal = 1;
        }
      }
      
      $input.val(newVal);
      
      // Update cart totals if on cart page
      if ($('.product-cart-table').length) {
        updateCartTotals();
      }
    });
    
    // Update quantity on input change
    $('.pro-qty input').on('change', function() {
      var val = parseFloat($(this).val()) || 1;
      if (val < 1) {
        $(this).val(1);
        val = 1;
      }
      if ($('.product-cart-table').length) {
        updateCartTotals();
      }
    });

  // Select Js
    $('select').niceSelect();

  // Review Form Rating Function
    var reviewFormRatingSelect = $('#product-review-form-rating-select'),
      reviewFormRatingStar = $("#product-review-form-rating"),
      reviewFormRatingVal = 1;
    reviewFormRatingStar.css('width', (20 * reviewFormRatingVal) + '%')
    $('#product-review-form-rating-select').on('change', function () {
      reviewFormRatingVal = Number($(this)[0].value)
      reviewFormRatingStar.css('width', (20 * reviewFormRatingVal) + '%')
    })

  // Ajax Contact Form JS with Validation
    var form = $('#contact-form');
    var formMessages = $('.form-message');
    
    if (form.length) {
      $(form).submit(function(e) {
        e.preventDefault();
        
        // Basic validation
        var firstName = $('input[name="con_name"]').val().trim();
        var lastName = $('input[placeholder="Last Name"]').val().trim();
        var email = $('input[name="con_email"]').val().trim();
        var message = $('textarea[name="con_message"]').val().trim();
        
        // Remove previous error classes
        $('.form-group').removeClass('has-error');
        formMessages.removeClass('alert alert-danger alert-success').html('');
        
        // Validate fields
        var isValid = true;
        if (!firstName) {
          $('input[name="con_name"]').closest('.form-group').addClass('has-error');
          isValid = false;
        }
        if (!email || !isValidEmail(email)) {
          $('input[name="con_email"]').closest('.form-group').addClass('has-error');
          isValid = false;
        }
        if (!message) {
          $('textarea[name="con_message"]').closest('.form-group').addClass('has-error');
          isValid = false;
        }
        
        if (!isValid) {
          formMessages.addClass('alert alert-danger fade show');
          formMessages.html('<button type="button" class="btn-close" data-bs-dismiss="alert">&times;</button>Please fill in all required fields correctly.');
          return false;
        }
        
        // Show loading state
        var submitBtn = form.find('button[type="submit"]');
        var originalText = submitBtn.text();
        submitBtn.prop('disabled', true).text('Sending...');
        
        // Simulate form submission (replace with actual endpoint)
        setTimeout(function() {
          formMessages.removeClass('alert alert-danger');
          formMessages.addClass('alert alert-success fade show');
          formMessages.html('<button type="button" class="btn-close" data-bs-dismiss="alert">&times;</button><strong>Thank you!</strong> Your message has been sent successfully. We will get back to you soon.');
          
          // Clear the form
          form[0].reset();
          submitBtn.prop('disabled', false).text(originalText);
          
          // For actual implementation, uncomment and configure:
          /*
          var formData = form.serialize();
          $.ajax({
            type: 'POST',
            url: form.attr('action') || 'mail.php',
            data: formData
          }).done(function(response) {
            formMessages.removeClass('alert alert-danger');
            formMessages.addClass('alert alert-success fade show');
            formMessages.html('<button type="button" class="btn-close" data-bs-dismiss="alert">&times;</button>' + response);
            form[0].reset();
            submitBtn.prop('disabled', false).text(originalText);
          }).fail(function(data) {
            formMessages.removeClass('alert alert-success');
            formMessages.addClass('alert alert-danger fade show');
            formMessages.html('<button type="button" class="btn-close" data-bs-dismiss="alert">&times;</button>Oops! An error occurred. Please try again later.');
            submitBtn.prop('disabled', false).text(originalText);
          });
          */
        }, 1000);
      });
    }
    
    // Email validation helper
    function isValidEmail(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

  // scrollToTop Js
    function scrollToTop() {
    var $scrollUp = $('#scroll-to-top'),
      $lastScrollTop = 0,
      $window = $(window);
      $window.on('scroll', function () {
      var st = $(this).scrollTop();
        if (st > $lastScrollTop) {
            $scrollUp.removeClass('show');
            $('.sticky-header').removeClass('sticky-show');
        } else {
          if ($window.scrollTop() > 250) {
            $scrollUp.addClass('show');
            $('.sticky-header').addClass('sticky-show');
          } else {
            $scrollUp.removeClass('show');
            $('.sticky-header').removeClass('sticky-show');
          }
        }
        $lastScrollTop = st;
    });
    $scrollUp.on('click', function (evt) {
      $('html, body').animate({scrollTop: 0}, 50);
      evt.preventDefault();
    });
  }
  scrollToTop();
  varWindow.on('scroll', function(){
    if($('.sticky-header').length){
      var windowpos = $(this).scrollTop();
      if (windowpos >= 250) {
        $('.sticky-header').addClass('sticky');
      } else {
        $('.sticky-header').removeClass('sticky');
      }
    }
  });

  // Newsletter Subscription Form - REMOVED
  // Newsletter functionality is now handled by newsletter.js

  // Cart Functionality
    // Remove item from cart
    $('.product-cart-table .remove, .aside-cart-product-list .remove').on('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to remove this item from your cart?')) {
        $(this).closest('tr, li').fadeOut(300, function() {
          $(this).remove();
          updateCartTotals();
          updateAsideCart();
        });
      }
    });
    
    // Update cart button functionality
    $('.btn-update-cart').on('click', function(e) {
      e.preventDefault();
      var $btn = $(this);
      $btn.prop('disabled', true).text('Updating...');
      
      setTimeout(function() {
        updateCartTotals();
        $btn.prop('disabled', true).addClass('disabled').text('Update cart');
        alert('Cart updated successfully!');
      }, 500);
    });
    
    // Enable update button when quantity changes
    $('.product-cart-table .quantity').on('change', function() {
      $('.btn-update-cart').prop('disabled', false).removeClass('disabled');
    });
    
    // Calculate and update cart totals
    function updateCartTotals() {
      var subtotal = 0;
      
      $('.product-cart-table tbody .tbody-item').each(function() {
        var $row = $(this);
        var priceText = $row.find('.product-price .price').text();
        var quantity = parseFloat($row.find('.quantity').val()) || 1;
        var price = parseFloat(priceText.replace(/[₦,]/g, '')) || 0;
        var rowTotal = price * quantity;
        
        // Update row subtotal
        $row.find('.product-subtotal .price').text(formatNaira(rowTotal));
        subtotal += rowTotal;
      });
      
      // Update cart subtotal
      $('.cart-totals-wrap .cart-subtotal .amount, .cart-totals .cart-subtotal .amount').text(formatNaira(subtotal));
      
      // Calculate shipping (example: flat rate ₦4,500)
      var shipping = 4500;
      $('.cart-totals-wrap .shipping .amount, .cart-totals .shipping .amount').text(formatNaira(shipping));
      
      // Calculate total
      var total = subtotal + shipping;
      $('.cart-totals-wrap .order-total .amount, .cart-totals .order-total .amount').text(formatNaira(total));
    }
    
    // Update aside cart
    function updateAsideCart() {
      var itemCount = $('.aside-cart-product-list li').length;
      if (itemCount === 0) {
        $('.aside-cart-product-list').html('<li class="empty-cart">Your cart is empty</li>');
        $('.cart-total').hide();
      }
    }
    
    // Format Naira currency
    function formatNaira(amount) {
      return '₦' + amount.toLocaleString('en-NG');
    }
    
    // Coupon code functionality
    $('.btn-coupon').on('click', function(e) {
      e.preventDefault();
      var couponCode = $(this).siblings('input').val().trim().toUpperCase();
      
      if (!couponCode) {
        alert('Please enter a coupon code');
        return;
      }
      
      // Example coupon codes
      var coupons = {
        'WELCOME10': 0.1,
        'SAVE20': 0.2,
        'ESTHETICAL15': 0.15
      };
      
      if (coupons[couponCode]) {
        var discount = coupons[couponCode];
        alert('Coupon code applied! You saved ' + (discount * 100) + '%');
        // Apply discount logic here
      } else {
        alert('Invalid coupon code. Please try again.');
      }
    });
    
    // Checkout form validation
    $('#checkout-form, .checkout-form').on('submit', function(e) {
      e.preventDefault();
      var isValid = true;
      var $form = $(this);
      
      // Validate required fields
      $form.find('input[required], select[required]').each(function() {
        if (!$(this).val().trim()) {
          $(this).addClass('is-invalid');
          isValid = false;
        } else {
          $(this).removeClass('is-invalid');
        }
      });
      
      // Validate email
      var email = $form.find('input[type="email"]').val();
      if (email && !isValidEmail(email)) {
        $form.find('input[type="email"]').addClass('is-invalid');
        isValid = false;
      }
      
      // Check privacy policy
      if (!$form.find('#privacy').is(':checked')) {
        alert('Please accept the terms and conditions to continue.');
        isValid = false;
      }
      
      if (isValid) {
        // Show success message
        alert('Order placed successfully! Thank you for your purchase.');
        // In production, submit to server here
        // $form[0].submit();
      }
    });

  // Initialize cart totals on page load
    if ($('.product-cart-table').length) {
      updateCartTotals();
    }

})(window.jQuery);
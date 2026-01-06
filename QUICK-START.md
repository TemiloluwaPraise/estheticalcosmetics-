# 🚀 Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1. Update Paystack Key (Required for Payment)
**File:** `assets/js/paystack-checkout.js`  
**Line:** 23

```javascript
// Replace this:
var PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PUBLIC_TEST_KEY";

// With your actual key:
var PAYSTACK_PUBLIC_KEY = "pk_test_abc123yourkeyhere";
```

### 2. Open in Browser
```
product.html
```

### 3. Test Features
✅ Click "Add to Cart" on any product  
✅ Cart badge appears with count  
✅ Click cart icon → Sidebar shows item  
✅ Navigate to `product-cart.html` → Full cart  
✅ Click heart icon → Wishlist  

---

## 🎯 Key Files

| File | What It Does |
|------|--------------|
| `assets/js/cart.js` | Cart functionality |
| `assets/js/wishlist.js` | Wishlist functionality |
| `assets/js/utils.js` | Helper functions |
| `assets/js/product-data-init.js` | Auto product data |
| `assets/js/paystack-checkout.js` | Payment |

---

## 🧪 Testing Checklist

### Cart
- [ ] Add product → Badge shows count
- [ ] Click cart icon → Sidebar appears
- [ ] Go to cart page → Item listed
- [ ] Update quantity → Total changes
- [ ] Remove item → Cart empties
- [ ] Refresh page → Cart persists

### Wishlist
- [ ] Click heart → Icon fills red
- [ ] Badge shows count
- [ ] Go to wishlist page → Item listed
- [ ] Remove → Wishlist updates
- [ ] Add duplicate → "Already in wishlist"

### Checkout
- [ ] Go to checkout page
- [ ] Enter email
- [ ] Click "Place Order"
- [ ] Paystack popup opens
- [ ] Test with: `5060666666666666666`

---

## 🐛 Troubleshooting

### Nothing Works
1. Open browser console (F12)
2. Look for red errors
3. Check if scripts loaded
4. Try clearing: `localStorage.clear()`

### Cart Empty After Adding
1. Check console for errors
2. Verify scripts loaded in order
3. Check product has data attributes

### Paystack Won't Open
1. Update public key (step 1 above)
2. Check email field is filled
3. Verify cart has items

---

## 📚 Documentation

- **Full Guide:** `ECOMMERCE-IMPLEMENTATION.md`
- **Summary:** `IMPLEMENTATION-SUMMARY.md`
- **This Guide:** `QUICK-START.md`

---

## 💡 Quick Commands

### Clear Cart/Wishlist (Browser Console)
```javascript
localStorage.clear();
location.reload();
```

### Check Cart Items (Browser Console)
```javascript
console.log(CartManager.getItems());
```

### Check Wishlist (Browser Console)
```javascript
console.log(WishlistManager.getItems());
```

### Manually Add to Cart (Browser Console)
```javascript
CartManager.addItem({
  id: 'test-product',
  name: 'Test Product',
  price: 50000,
  image: 'assets/images/shop/1.webp',
  quantity: 1
});
```

---

## ✅ Success Indicators

**Everything is working if:**
- ✅ Cart starts empty
- ✅ Badge appears after adding item
- ✅ Toast notification shows
- ✅ Sidebar cart displays item
- ✅ Cart page shows item
- ✅ Quantity changes update total
- ✅ Items persist after refresh
- ✅ Heart icon fills when clicked
- ✅ Paystack opens on checkout

---

## 🎓 Pages with Full Functionality

All these pages have cart/wishlist working:
- `index.html` ✅
- `index-two.html` ✅
- `product.html` ✅
- `product-four-columns.html` ✅
- `product-left-sidebar.html` ✅
- `product-right-sidebar.html` ✅
- `product-details.html` ✅
- `product-details-normal.html` ✅
- `product-details-group.html` ✅
- `product-details-affiliate.html` ✅
- `product-cart.html` ✅
- `product-wishlist.html` ✅
- `product-checkout.html` ✅

---

## 📞 Need Help?

1. Check `ECOMMERCE-IMPLEMENTATION.md` (full documentation)
2. Check browser console for errors
3. Verify all scripts loaded
4. Clear localStorage and retry
5. Check Paystack key is correct

---

## 🎉 That's It!

Your e-commerce site is ready to use. Start testing and enjoy!

**Happy Coding! 🚀**


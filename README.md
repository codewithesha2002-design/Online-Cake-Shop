# Online Cake Shop

A vanilla HTML, CSS, and JavaScript bakery website with a pink and white storefront design. Week 2 extends the existing frontend with reusable interactive UI components without adding a backend.

## Week 2 Interactive Component

The main component is one reusable Product Quick View modal. It reads the clicked product card, fills the modal dynamically, and provides a quantity selector and Add to Cart action.

## Features Implemented

- Reusable accessible product Quick View modal
- Product image, name, price, category, description, and quantity selector
- Keyboard focus management, focus trap, Escape close, outside click close, and focus restoration
- Lightweight localStorage shopping cart using the existing navbar cart icon
- Cart count, duplicate-item quantity merging, increase/decrease controls, removal, and dynamic total
- Functional product search by name or category with no-results feedback
- Existing category cards filter the Shop products
- Inline Contact form validation and success feedback
- Responsive modal, drawer, search panel, and cart controls
- Defensive handling for invalid product IDs and malformed or unavailable localStorage

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage
- Font Awesome icons already used by the original frontend

## How the Quick View Modal Works

Each existing product card has one eye button. JavaScript builds a product catalog from the card content, then opens the same modal with the selected product's data. The modal is created once and reused for every product.

## How the Cart Works

The selected product ID and quantity are stored in a small array and serialized to the browser's `bakery-cart` localStorage key. Adding the same product increases its quantity. The cart drawer recalculates item quantities and total price whenever the cart changes.

## Accessibility Features

- Modal uses `role="dialog"`, `aria-modal`, and `aria-labelledby`
- Actual buttons are used for interactive controls
- Accessible labels on icon buttons and cart actions
- Focus moves into the modal and returns to the triggering eye button
- Tab navigation is kept inside the Quick View modal
- Escape closes the modal and cart drawer
- Live regions announce cart count and feedback messages

## Error Handling

Missing product data is ignored safely, invalid product IDs do not add items, empty or malformed cart storage falls back to an empty cart, and unavailable storage is caught without stopping the page. Form and no-results feedback is shown in the interface.

## Responsive Behavior

The modal switches to a single-column layout on small screens. The cart becomes a viewport-width drawer on mobile, and the search panel and navbar controls remain usable at tablet and phone widths.

## How to Run/Test

Serve the folder with any static web server so the ES module imports can load correctly. For example, run `python -m http.server 8000` in the project folder and open `http://localhost:8000`. No package installation or backend is required.

## Project Folder Structure

```text
online-cake-shop/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Testing Checklist

- Open modal
- Close modal with X
- Close with Escape key
- Close by clicking outside the modal
- Navigate modal controls with the keyboard
- Add to cart
- Increase and decrease quantity
- Remove an item
- Refresh and verify localStorage persistence
- Search products by name and category
- Filter categories
- Submit invalid contact form
- Submit valid contact form
- Test mobile layout

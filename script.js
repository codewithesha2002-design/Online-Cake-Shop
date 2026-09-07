const CART_STORAGE_KEY = "bakery-cart";
const productCategories = ["fruit cake", "cookies", "cake", "chocolate cake", "cupcake", "fruit cake", "cake", "dark chocolate"];

let products = [];
let cart = [];
let slideIndex = 0;
let lastTrigger = null;
const slides = document.querySelectorAll(".home .slides-container .slide");

function readProducts() {
	return Array.from(document.querySelectorAll(".products .box")).map((card, index) => {
		const name = card.querySelector(".content h3")?.textContent.trim() || "Bakery product";
		return { id: String(index + 1), name, price: Number(card.querySelector(".price")?.textContent.replace(/[^0-9.]/g, "")) || 0, image: card.querySelector("img")?.src || "", category: productCategories[index] || "bakery", description: `A freshly prepared ${name.toLowerCase()} made with care at our bakery.`, card };
	});
}
function findProduct(productId) { return products.find(product => product.id === String(productId)); }
function loadCart() { try { const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"); return Array.isArray(saved) ? saved.filter(item => item?.id && Number(item.quantity) > 0) : []; } catch { return []; } }
function saveCart() { try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* Storage may be unavailable. */ } }
function updateCartCount() { const count = document.querySelector("#cart-count"); if (count) count.textContent = String(cart.reduce((total, item) => total + item.quantity, 0)); }

function updateCart() {
	const drawer = document.querySelector("#cart-drawer"); if (!drawer) return;
	const items = cart.map(item => ({ ...item, product: findProduct(item.id) })).filter(item => item.product);
	drawer.querySelector(".cart-items").innerHTML = items.length ? items.map(item => `<div class="cart-item"><img src="${item.product.image}" alt="${item.product.name}"><div><h3>${item.product.name}</h3><p>$${item.product.price.toFixed(2)}</p><div class="cart-controls"><button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.product.name} quantity">-</button><span>${item.quantity}</span><button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.product.name} quantity">+</button><button type="button" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.product.name}">&times;</button></div></div></div>`).join("") : "<p class='empty-state'>Your cart is empty.</p>";
	drawer.querySelector(".cart-total").textContent = `Total: $${items.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2)}`;
}
function addToCart(productId, quantity = 1) { const product = findProduct(productId); if (!product) return false; const existing = cart.find(item => item.id === product.id); const amount = Math.max(1, Number(quantity) || 1); if (existing) existing.quantity += amount; else cart.push({ id: product.id, quantity: amount }); saveCart(); updateCartCount(); updateCart(); return true; }
function removeFromCart(productId) { cart = cart.filter(item => item.id !== String(productId)); saveCart(); updateCartCount(); updateCart(); }
function toggleCart(force) { const drawer = document.querySelector("#cart-drawer"); const open = typeof force === "boolean" ? force : drawer.getAttribute("aria-hidden") === "true"; drawer.setAttribute("aria-hidden", String(!open)); drawer.classList.toggle("is-open", open); if (open) drawer.querySelector(".modal-close").focus(); }
function initializeCart() {
	const drawer = document.createElement("aside"); drawer.id = "cart-drawer"; drawer.className = "cart-drawer"; drawer.setAttribute("aria-labelledby", "cart-title"); drawer.setAttribute("aria-hidden", "true");
	drawer.innerHTML = `<div class="cart-header"><h2 id="cart-title">Your Cart</h2><button type="button" class="modal-close" aria-label="Close shopping cart">&times;</button></div><div class="cart-items"></div><strong class="cart-total">Total: $0.00</strong><a href="#contact" class="btn cart-checkout">Proceed to Checkout</a><p class="cart-note">Review your order and send your request through the contact form.</p>`;
	document.body.appendChild(drawer); drawer.querySelector(".modal-close").addEventListener("click", () => toggleCart(false)); drawer.querySelector(".cart-checkout").addEventListener("click", () => toggleCart(false));
	document.querySelector("#cart-btn")?.addEventListener("click", () => { document.querySelector("#search-panel")?.setAttribute("hidden", "true"); document.querySelector("#login-panel")?.setAttribute("hidden", "true"); toggleCart(); });
	drawer.addEventListener("click", event => { const button = event.target.closest("button[data-action]"); if (!button) return; const item = cart.find(entry => entry.id === button.dataset.id); if (!item) return; if (button.dataset.action === "remove") removeFromCart(item.id); else { item.quantity = Math.max(1, item.quantity + (button.dataset.action === "increase" ? 1 : -1)); saveCart(); updateCartCount(); updateCart(); } });
	updateCartCount(); updateCart();
}

function openQuickView(productId, trigger) {
	const product = findProduct(productId); const modal = document.querySelector("#quick-view-modal"); if (!product || !modal) return;
	lastTrigger = trigger || document.activeElement; modal.querySelector("#quick-view-image").src = product.image; modal.querySelector("#quick-view-image").alt = product.name; modal.querySelector("#quick-view-title").textContent = product.name; modal.querySelector("#quick-view-category").textContent = product.category; modal.querySelector("#quick-view-price").textContent = `$${product.price.toFixed(2)}`; modal.querySelector("#quick-view-description").textContent = product.description; modal.querySelector("#quick-view-quantity").value = "1"; modal.querySelector("#quick-view-add").dataset.productId = product.id; modal.querySelector("#quick-view-buy").dataset.productId = product.id; modal.querySelector("#quick-view-feedback").textContent = ""; modal.hidden = false; document.body.classList.add("modal-open"); requestAnimationFrame(() => modal.classList.add("is-visible")); modal.querySelector("#quick-view-quantity").focus();
}
function closeQuickView() { const modal = document.querySelector("#quick-view-modal"); if (!modal || modal.hidden) return; modal.classList.remove("is-visible"); setTimeout(() => { modal.hidden = true; document.body.classList.remove("modal-open"); lastTrigger?.focus(); }, 180); }
function initializeQuickView() {
	const modal = document.createElement("div"); modal.className = "interactive-overlay"; modal.id = "quick-view-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-labelledby", "quick-view-title"); modal.hidden = true;
	modal.innerHTML = `<div class="interactive-panel quick-view-panel" tabindex="-1"><button type="button" class="modal-close" aria-label="Close product quick view">&times;</button><div class="quick-view-content"><img id="quick-view-image" alt=""><div class="quick-view-details"><p id="quick-view-category" class="interactive-label"></p><h2 id="quick-view-title"></h2><p id="quick-view-price" class="interactive-price"></p><p id="quick-view-description"></p><label for="quick-view-quantity">Quantity</label><input id="quick-view-quantity" type="number" min="1" value="1"><div class="quick-view-actions"><button type="button" id="quick-view-add" class="btn">Add to Cart</button><button type="button" id="quick-view-buy" class="btn">Buy Now</button></div><p id="quick-view-feedback" class="form-feedback" role="status" aria-live="polite"></p></div></div></div>`;
	document.body.appendChild(modal); modal.querySelector(".modal-close").addEventListener("click", closeQuickView); modal.addEventListener("click", event => { if (event.target === modal) closeQuickView(); });
	modal.querySelector("#quick-view-add").addEventListener("click", event => { addToCart(event.currentTarget.dataset.productId, modal.querySelector("#quick-view-quantity").value); modal.querySelector("#quick-view-feedback").textContent = "Added to your cart."; });
	modal.querySelector("#quick-view-buy").addEventListener("click", event => { addToCart(event.currentTarget.dataset.productId, modal.querySelector("#quick-view-quantity").value); closeQuickView(); toggleCart(true); });
	document.querySelectorAll(".quick-view-btn").forEach((button, index) => button.addEventListener("click", () => openQuickView(index + 1, button)));
	document.querySelectorAll(".home .btn, .banner .btn").forEach((button, index) => button.addEventListener("click", event => { event.preventDefault(); openQuickView((index % products.length) + 1, button); }));
}

function initializeSearch() {
	const panel = document.createElement("div"); panel.id = "search-panel"; panel.className = "search-panel"; panel.hidden = true; panel.innerHTML = `<label for="product-search">Search products</label><input id="product-search" type="search" placeholder="Search by product name or category"><button type="button" id="clear-search" aria-label="Close search">&times;</button><p id="search-feedback" class="empty-state" hidden>No products found.</p>`; document.querySelector(".header")?.appendChild(panel);
	function filter(query = "") { const value = query.trim().toLowerCase(); let visible = 0; products.forEach(product => { const match = !value || `${product.name} ${product.category}`.toLowerCase().includes(value); product.card.hidden = !match; if (match) visible++; }); panel.querySelector("#search-feedback").hidden = visible > 0; }
	document.querySelector("#search-btn")?.addEventListener("click", () => { toggleCart(false); document.querySelector("#login-panel")?.setAttribute("hidden", "true"); panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector("input").focus(); }); panel.querySelector("#product-search").addEventListener("input", event => filter(event.target.value)); panel.querySelector("#clear-search").addEventListener("click", () => { panel.hidden = true; panel.querySelector("input").value = ""; filter(""); });
}
function initializeLogin() {
	const panel = document.createElement("div");
	panel.id = "login-panel";
	panel.className = "login-panel";
	panel.hidden = true;
	panel.innerHTML = `<button type="button" class="modal-close" aria-label="Close account panel">&times;</button><h2>Welcome Back!</h2><p class="login-intro">Please enter your details to access your account.</p><label for="login-email">Email</label><input id="login-email" type="email" placeholder="Enter your email" autocomplete="email"><label for="login-password">Password</label><input id="login-password" type="password" placeholder="Enter your password" autocomplete="current-password"><button type="button" class="btn" id="login-submit">Login</button><div class="login-links"><a href="#forgot-password" id="forgot-password">Forgot Password?</a><span>Don't have an account?</span><a href="#sign-up" id="sign-up">Sign Up</a></div><p id="login-feedback" class="form-feedback" role="status" aria-live="polite"></p>`;
	document.body.appendChild(panel);
	document.querySelector("#login-btn")?.addEventListener("click", () => { toggleCart(false); document.querySelector("#search-panel")?.setAttribute("hidden", "true"); panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector("#login-email").focus(); });
	panel.querySelector(".modal-close").addEventListener("click", () => { panel.hidden = true; });
	panel.querySelector("#login-submit").addEventListener("click", () => {
		const email = panel.querySelector("#login-email").value.trim();
		const password = panel.querySelector("#login-password").value;
		const feedback = panel.querySelector("#login-feedback");
		feedback.textContent = email && password ? "Login is ready for backend connection." : "Enter your email and password.";
		feedback.className = `form-feedback ${email && password ? "success" : "error"}`;
	});
	panel.querySelector("#forgot-password").addEventListener("click", event => { event.preventDefault(); panel.querySelector("#login-feedback").textContent = "Password reset is available after account setup."; panel.querySelector("#login-feedback").className = "form-feedback success"; });
	panel.querySelector("#sign-up").addEventListener("click", event => { event.preventDefault(); panel.querySelector("#login-feedback").textContent = "Sign up is ready for account setup."; panel.querySelector("#login-feedback").className = "form-feedback success"; });
	document.addEventListener("keydown", event => { if (event.key === "Escape") panel.hidden = true; });
}
function initializeFormValidation() { const form = document.querySelector("#contact-form"); if (!form) return; form.addEventListener("submit", event => { event.preventDefault(); const values = Object.fromEntries(["name", "email", "phone", "subject", "message"].map(key => [key, form.elements[key].value.trim()])); const errors = []; if (values.name.length < 2) errors.push("Please enter your name."); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push("Please enter a valid email."); if (!/^[0-9+\s()-]{7,}$/.test(values.phone)) errors.push("Please enter a valid phone number."); if (values.subject.length < 2) errors.push("Please enter a subject."); if (values.message.length < 10) errors.push("Please enter a message of at least 10 characters."); const feedback = document.querySelector("#contact-feedback"); feedback.textContent = errors.join(" ") || "Thanks! Your message has been received."; feedback.className = `form-feedback ${errors.length ? "error" : "success"}`; if (!errors.length) form.reset(); }); }
function initializeCategories() { const aliases = { "fresh cupcake": "cupcake", "brown bread": "cake", wheat: "cake", "dark chocolate": "chocolate" }; document.querySelectorAll(".category-filter").forEach(category => category.addEventListener("click", event => { event.preventDefault(); const value = aliases[category.dataset.category] || category.dataset.category; products.forEach(product => { product.card.hidden = !product.card.textContent.toLowerCase().includes(value); }); document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" }); })); }
function showSlide(nextIndex) { if (!slides.length) return; slides[slideIndex].classList.remove("active"); slideIndex = (nextIndex + slides.length) % slides.length; slides[slideIndex].classList.add("active"); }
function next() { showSlide(slideIndex + 1); } function prev() { showSlide(slideIndex - 1); }

window.next = next;
window.prev = prev;
document.addEventListener("DOMContentLoaded", () => {
	products = readProducts(); cart = loadCart(); initializeCart(); initializeQuickView(); initializeSearch(); initializeLogin(); initializeCategories(); initializeFormValidation();
	document.querySelectorAll(".add-cart-btn").forEach((button, index) => button.addEventListener("click", () => { addToCart(index + 1); toggleCart(true); }));
	document.querySelector("#hamburger")?.addEventListener("click", () => document.querySelector(".navbar")?.classList.toggle("active"));
	document.addEventListener("keydown", event => { if (event.key === "Escape") { closeQuickView(); toggleCart(false); } });
	document.addEventListener("scroll", () => document.querySelector(".navbar")?.classList.remove("active"), { passive: true });
});

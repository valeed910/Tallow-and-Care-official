const API = "https://api.tallowandcare.in";
let turnstileToken = null;
window.onTurnstileSuccess = function (token) {
  turnstileToken = token;
  console.log("TURNSTILE TOKEN:", token);
};

  /* -------------------------
     Contact form validation & submit (handleContact referenced in HTML)
     ------------------------- */
  
     window.handleContact = async function (e) {
      e.preventDefault();

      const statusDiv = document.querySelector("#form-status");
      if (!statusDiv) return;
      const name = document.querySelector("#name")?.value.trim();
      const email = document.querySelector("#email")?.value.trim();
      const phone = document.querySelector("#phone")?.value.trim();
      const interest = document.querySelector("#interest")?.value;
      const message = document.querySelector("#message")?.value.trim();

      if (!name || !email || !message) {
      statusDiv.textContent = "Please fill all required fields.";
      statusDiv.className = "form-status error";
      return;
      }

      if (!turnstileToken) {
        alert("Captcha not verified");
        return;
      }

      try {
        const res = await fetch(`${API}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            interest,
            message,
            captchaToken: turnstileToken
          })
        });

        if (!res.ok) throw new Error("Request failed");

        statusDiv.textContent = "Message sent successfully!";
        statusDiv.className = "form-status success";
        document.querySelector(".contact-form")?.reset();
        turnstileToken = null;

        if (window.turnstile) {
          turnstile.reset();
        }

      } catch (err) {
      statusDiv.textContent = "Something went wrong";
      statusDiv.className = "form-status error";
    }
  };


const products = []; // placeholder data
console.log("Products coming soon", products);

// script.js — cleaned & optimized for Tallow & Care
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", handleContact);
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported');
    return;
  }
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* -------------------------
     Runtime CSS injection (small helpers)
     ------------------------- */
  const runtimeStyleId = 'tallow-runtime-styles';
  if (!document.getElementById(runtimeStyleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = runtimeStyleId;
    styleEl.textContent = `
    /* clickable flipped support */
    .interactive-card.flipped .card-inner,
    .benefit-card.flipped .card-inner,
    .product-card.flipped .card-inner,
    .sustainability-item.flipped .card-inner {
      transform: rotateY(180deg) !important;
    }

    /* back-to-top show/hide */
    .back-to-top { opacity: 0; pointer-events: none; transition: opacity .25s ease, transform .25s ease; transform: translateY(0); }
    .back-to-top.visible { opacity: 1; pointer-events: auto; transform: translateY(-6px); }

    /* runtime ripple */
    .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.45); transform: translate(-50%,-50%) scale(0); pointer-events: none; z-index: 2; animation: tallow-ripple 700ms cubic-bezier(.2,.8,.2,1) forwards; }
    @keyframes tallow-ripple { to { transform: translate(-50%,-50%) scale(18); opacity: 0; } }
      `;
      document.head.appendChild(styleEl);
    }

  /* -------------------------
     Utility: throttle
     ------------------------- */
  function throttle(fn, wait = 100) {
    let last = 0, timer = null;
    return function(...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  /* -------------------------
     Smooth internal anchor scrolling
     - Skip href="#" anchors used as JS triggers
     ------------------------- */
  $$('a[href^="#"]').forEach(anchor => {
    const href = anchor.getAttribute('href') || '';
    if (href === '#' || href === '') return;
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile nav if open
        const navLinks = $('.nav-links');
        const toggle = $('.mobile-menu-toggle');
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          if (toggle) {
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  /* -------------------------
     DOM references (guarded)
     ------------------------- */
  const navbar = document.getElementById("navbar");
  const backToTop = document.querySelector(".back-to-top");
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".nav-link");

  /* -------------------------
     Combined throttled scroll handler
     - navbar scrolled
     - active nav highlight
     - back-to-top visibility
     ------------------------- */
  const onScroll = () => {
    // navbar scrolled state
    if (navbar) {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }

    // active nav link highlight (safe)
    if (sections && sections.length && navItems && navItems.length) {
      let current = "";
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        if (window.scrollY >= sectionTop) current = section.getAttribute("id");
      });
      navItems.forEach(link => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if (href === `#${current}`) link.classList.add("active");
      });
    }

    // back-to-top
    if (backToTop) {
      if (window.scrollY > 400) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
    }
  };

  // install throttled handler (once)
  window.addEventListener("scroll", throttle(onScroll, 100));
  // run once to set initial state
  onScroll();

  /* -------------------------
     Reveal on scroll (IntersectionObserver)
     Adds 'in-view' class
     ------------------------- */
  function setupScrollReveal(selector, options = {}) {
    const els = $$(selector);
    if (!els.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target); // animate only once
        }
      });
    }, options);
    els.forEach(el => observer.observe(el));
  }
  setupScrollReveal('.reveal, .animate-fade-in, .mission-step, .floating-element, [data-animate]', { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  /* -------------------------
     Counter animation (IntersectionObserver)
     ------------------------- */
  function parseNumberAndSuffix(str) {
    if (!str) return null;
    const m = String(str).match(/-?\d+(\.\d+)?/);
    if (!m) return null;
    const num = parseFloat(m[0]);
    const suffix = String(str).replace(m[0], '').trim();
    return { num, suffix };
  }
  function animateCounterTo(el, targetNum, suffix = '', duration = 1600) {
    const isFloat = String(targetNum).indexOf('.') >= 0;
    const start = performance.now();
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = isFloat ? (targetNum * eased) : Math.round(targetNum * eased);
      el.textContent = (isFloat ? value.toFixed(1) : value) + (suffix ? ` ${suffix}` : '');
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = (isFloat ? targetNum.toFixed(1) : targetNum) + (suffix ? ` ${suffix}` : '');
    }
    requestAnimationFrame(frame);
  }
  function setupCounters(selector, options = { threshold: 0.5 }) {
    const els = $$(selector);
    if (!els.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting && !el.classList.contains('counted')) {
          el.classList.add('counted');
          const dataAttr = el.getAttribute('data-target');
          const parsed = parseNumberAndSuffix(dataAttr || el.textContent);
          if (!parsed) { obs.unobserve(el); return; }
          animateCounterTo(el, parsed.num, parsed.suffix || '', 1800);
          obs.unobserve(el);
        }
      });
    }, options);
    els.forEach(el => observer.observe(el));
  }
  setupCounters('.counter-value, .stat-number, .metric-number');

  /* -------------------------
  Add to Cart 
  ----------------------------*/
  const cartIcon = document.getElementById('cart-button');
  const cartPanel = document.getElementById('cart-panel');
  const cartClose = document.getElementById('cart-close');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const cartOverlay = document.getElementById('cart-overlay');

  let cartLock = false;
  let toastTimer;
  
  function showCartToast(message = "Added to cart"){
    const toast = document.getElementById("cart-toast");
    if (!toast) return Promise.resolve();

    return new Promise(resolve => {
      clearTimeout(toastTimer);

      toast.classList.remove("done");
      toast.querySelector(".toast-text").textContent = message;

      toast.classList.add("show");

      toastTimer = setTimeout(() => {

        toast.classList.add("done");   // SHOW TICK

        setTimeout(() => {
          toast.classList.remove("show", "done");
          resolve();
        }, 280); // tick visibility time

      }, 1400);

    });
  }


  function openCart(){
    cartPanel.classList.add('open');
    cartOverlay.classList.add('visible');
    document.body.classList.add('cart-open');
    renderCart();
  }

  function closeCart(){
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('visible');
    document.body.classList.remove('cart-open');
  }


  cartIcon?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
  function renderCart(){
    const cart = getCart();
    cartItemsEl.innerHTML = '';

    if (!cart.length) {
      cartItemsEl.innerHTML = `<div class="cart-empty">🛒 Your cart is empty</div>`;
      cartTotalEl.textContent = 0;
      return;
    }

    let total = 0;

    cart.forEach(item => {
      total += item.price * item.qty;

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.dataset.id = item.id;

      row.innerHTML = `
        <div class="cart-thumb">
          <img src="${item.image}" alt="${item.name}">
        </div>

        <div class="cart-details">
          <div class="cart-title">${item.name}</div>
          <div class="cart-price">₹${item.price}</div>

          <div class="cart-controls">
            <button class="qty-btn minus">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn plus">+</button>
            <button class="remove-btn">Remove</button>
          </div>
        </div>
      `;

      row.querySelector('.minus').onclick = () => updateQty(item.id, -1);
      row.querySelector('.plus').onclick = () => updateQty(item.id, 1);
      row.querySelector('.remove-btn').onclick = () => removeItem(item.id);

      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = total;
  }
  function updateQty(id, delta){
    const row = document.querySelector(`[data-id="${id}"]`);
    row?.classList.add('updating');
    const cart = getCart();
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) return removeItem(id);

    saveCart(cart);
    renderCart();

    setTimeout(() => row?.classList.remove('updating'), 200);
  }

  function removeItem(id){
    let cart = getCart();
    cart = cart.filter(p => p.id !== id);
    saveCart(cart);
    renderCart();
  }

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {

    button.addEventListener('click', async () => {

      if (cartLock) return;   // PREVENT SPAM
      cartLock = true;
      const card = button.closest('.product-card');

      if (!card) {
        cartLock = false;
        return;
      }


      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        image: card.dataset.image,
        qty: 1
      };

      const cart = getCart();
      const existing = cart.find(p => p.id === product.id);

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push(product);
      }

      await showCartToast(); 

      saveCart(cart);
      renderCart();
      cartLock = false;
    });
  });

  /* -------------------------
     Mobile menu toggle & accessibility
     ------------------------- */
  const toggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle) {
    // initial aria-expanded if not set
    if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    toggle.classList.toggle("open");
    const expanded = navLinks.classList.contains('active');
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  });

    // close menu when clicking any link (guarded)
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        toggle.classList.remove("open");
        navLinks.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* -------------------------
     Back to top behavior (click)
     ------------------------- */
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------------
     Interactive cards: click-to-flip, hover (desktop), keyboard
     ------------------------- */
  const benefitCards = $$('.benefit-card') || [];
  benefitCards.forEach(card => {
    const backBtn = card.querySelector('.flipped-back');
    });
    

    const CART_KEY = 'tallow_cart';

    function getCart() {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    function saveCart(cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartCount();
    }

    function addToCart(product) {
      const cart = getCart();
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }

      saveCart(cart);
    }

    function updateCartCount() {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + item.qty, 0);
      const el = document.getElementById('cart-count');
      if (el) el.textContent = count;
    }

    updateCartCount(); // on page load

  /* -------------------------
     Ripple effect (pointerdown) with touch fallback
     ------------------------- */
  function createRipple(e, container) {
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;

    // Fallback for touch events with missing coordinates
    const x = (typeof e.clientX === 'number') ? (e.clientX - rect.left) : (rect.width / 2);
    const y = (typeof e.clientY === 'number') ? (e.clientY - rect.top) : (rect.height / 2);

    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    container.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
    setTimeout(() => { if (ripple.parentElement) ripple.remove(); }, 900);
  }

  const rippleTargets = $$('.btn, .mission-step');
  if (rippleTargets && rippleTargets.length) {
    rippleTargets.forEach(el => {
      el.addEventListener('pointerdown', function (ev) {
        if (ev.button && ev.button !== 0) return;
        createRipple(ev, this);
      });
    });
  }

  /* -------------------------
     Typing text: restart the animation when it enters view
     ------------------------- */
  const typingText = document.querySelector('.typing-text');
  if (typingText) {
    const typingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typingText.style.animation = 'none';
          void typingText.offsetWidth;
          typingText.style.animation = 'typing 3.5s steps(20,end) forwards, blink-caret .75s step-end infinite';
          typingObserver.unobserve(typingText);
        }
      });
    }, { threshold: 0.2 });
    typingObserver.observe(typingText);
  }

  /* -------------------------
     Notify form handler (guarded)
     ------------------------- */
  const notifyForm = document.querySelector('#notifyForm');
  if (notifyForm) {
    notifyForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const section = notifyForm.closest(".notification-section");
      const successMessage = section ? section.querySelector(".success-message") : null;
      notifyForm.style.display = "none";
      if (successMessage) successMessage.style.display = "flex";
      setTimeout(() => {
        if (successMessage) successMessage.style.display = "none";
        notifyForm.reset();
        notifyForm.style.display = "flex";
      }, 4500);
    });
  }

  /* -------------------------
     Footer accordion on mobile
     ------------------------- */
  const footerSections = $$('.footer-section');
  footerSections.forEach(section => {
    const header = section.querySelector('h3');
    if (!header) return;
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      if (window.innerWidth > 768) return;
      const isActive = section.classList.contains('active');
      footerSections.forEach(s => s.classList.remove('active'));
      if (!isActive) section.classList.add('active');
    });
  });

  /* -------------------------
     Provide small keyframes if not present
     ------------------------- */
  if (!document.getElementById('tallow-keyframes')) {
    const style = document.createElement('style');
    style.id = 'tallow-keyframes';
    style.textContent = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
@keyframes slideDown { from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, 100px); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  /* -------------------------
     Small initializations
     ------------------------- */
  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

}); // DOMContentLoaded
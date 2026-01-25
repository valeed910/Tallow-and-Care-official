const API = null; // backend not ready yet

const products = []; // placeholder data
console.log("Products coming soon", products);

// script.js — cleaned & optimized for Tallow & Care
document.addEventListener('DOMContentLoaded', () => {
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
.btn-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.45);
  transform: translate(-50%,-50%) scale(0);
  pointer-events: none;
  z-index: 2;
  animation: tallow-ripple 700ms cubic-bezier(.2,.8,.2,1) forwards;
}
@keyframes tallow-ripple {
  to { transform: translate(-50%,-50%) scale(18); opacity: 0; }
}
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

    // Click to flip (except on back button)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.flipped-back, .back-btn')) return;
      card.classList.toggle('flipped');
    });

    // Keyboard support
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });

    // Hover flip for desktop only
    const handleMouseEnter = () => { if (window.innerWidth > 768) card.classList.add('flipped'); };
    const handleMouseLeave = () => { if (window.innerWidth > 768) card.classList.remove('flipped'); };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('flipped');
      });
    }
  });

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
     Contact form validation & submit (handleContact referenced in HTML)
     ------------------------- */
  const contactForm = document.querySelector('.contact-form');
if (contactForm) {

  const $ = (s) => document.querySelector(s);

  const fields = {
    name: $('#name'),
    email: $('#email'),
    phone: $('#phone'),
    interest: $('#interest'),
    message: $('#message')
  };

  const errs = {
    name: $('#name-error'),
    email: $('#email-error'),
    phone: $('#phone-error'),
    interest: $('#interest-error'),
    message: $('#message-error')
  };

  const statusDiv = $('#form-status');

  function showError(name, msg) {
    if (errs[name]) errs[name].textContent = msg;
    if (fields[name]) fields[name].classList.add('error');
  }

  function clearError(name) {
    if (errs[name]) errs[name].textContent = '';
    if (fields[name]) fields[name].classList.remove('error');
  }

  function validateField(name, value) {
    clearError(name);

    if (name === 'name' && !value.trim()) {
      showError(name, 'Name is required.');
      return false;
    }

    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError(name, 'A valid email is required.');
      return false;
    }

    if (name === 'interest' && !value) {
      showError(name, 'Please select an interest.');
      return false;
    }

    if (name === 'message') {
      if (!value.trim()) {
        showError(name, 'A message is required.');
        return false;
      }
      if (value.trim().length < 10) {
        showError(name, 'Message must be at least 10 characters.');
        return false;
      }
    }

    return true;
  }

  function validateForm() {
    let valid = true;
    for (const key of Object.keys(fields)) {
      if (!validateField(key, fields[key].value)) valid = false;
    }
    return valid;
  }
window.handleContact = async function (e) {
  e.preventDefault();
   const token = await grecaptcha.execute("6LduyVUsAAAAAGwIjOXFjY4aQx89s57LUbaY1Yd1", {
    action: "contact"
  });

  statusDiv.textContent = "";
  statusDiv.className = "form-status";

  if (!validateForm()) return;

  try {
    const res = await fetch("https://tallow-and-care-official.onrender.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        interest: fields.interest.value,
        message: fields.message.value,
        recaptchaToken: token
      })

    });

    const text = await res.text(); // read ONCE
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    statusDiv.textContent = "Message sent successfully!";
    statusDiv.className = "form-status success";
    contactForm.reset();

  } catch (err) {
    statusDiv.textContent = err.message || "Something went wrong";
    statusDiv.className = "form-status error";
  }
};



  /* -------------------------
     Feedback form (guarded)
     ------------------------- */
  const feedbackFormEl = document.getElementById("feedbackForm");
  if (feedbackFormEl) {
    feedbackFormEl.addEventListener("submit", function(e) {
      e.preventDefault();
      const messageBox = document.getElementById("feedbackMessage");
      if (!messageBox) return;
      messageBox.classList.remove("hidden");
      messageBox.style.opacity = "0";
      setTimeout(() => { messageBox.style.opacity = "1"; }, 50);
      this.reset();
      setTimeout(() => { messageBox.style.opacity = "0"; setTimeout(() => messageBox.classList.add("hidden"), 400); }, 4000);
    });
  }

  /* -------------------------
     Notify form handler (guarded)
     ------------------------- */
  const notifyForm = $('#notifyForm');
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

}
}); // DOMContentLoaded
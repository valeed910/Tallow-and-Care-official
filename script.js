document.addEventListener('DOMContentLoaded', () => {
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
.back-to-top.show { opacity: 1; pointer-events: auto; transform: translateY(-6px); }

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
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  /* -------------------------
     Navbar scrolled state
     ------------------------- */
  const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

  /* -------------------------
     Reveal on scroll (IntersectionObserver)
     Adds 'in-view' class (matches the CSS converted earlier)
     ------------------------- */
  function setupScrollReveal(selector, options = {}) {
    const els = $$(selector);
    if (!els.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target); // animate only once
        }
      });
    }, options);
    els.forEach(el => observer.observe(el));
  }
  setupScrollReveal('.reveal, .animate-fade-in, .mission-step, .floating-element', { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  /* -------------------------
     Counter animation (robust parsing)
     - Reads data-target if present; otherwise parses number out of text
     - Skips if no numeric content found
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
          if (!parsed) {
            obs.unobserve(el);
            return;
          }
          animateCounterTo(el, parsed.num, parsed.suffix || '', 1800);
          obs.unobserve(el);
        }
      });
    }, options);
    els.forEach(el => observer.observe(el));
  }

  // call counters for classes you use
  setupCounters('.counter-value, .stat-number, .metric-number');

  /* -------------------------
     Active nav link (IntersectionObserver)
     replaces the scroll-based computation — better perf & accuracy
     ------------------------- */
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-link");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });
  navItems.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

  /* -------------------------
     Mobile menu toggle & accessibility
     ------------------------- */
// Mobile menu toggle
const toggle = document.querySelector(".mobile-menu-toggle");
const navLinks = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  toggle.classList.toggle("open");
  navLinks.classList.toggle("active");
});

// Close mobile menu on link click
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    toggle.classList.remove("open");
    navLinks.classList.remove("active");
  });
});

  /* -------------------------
     Back to top behavior
     ------------------------- */
     const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  if(window.scrollY > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
});
backToTop.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

  /* -------------------------
     Interactive cards: click-to-flip, hover (desktop), and back buttons
     - Adds keyboard accessibility (Enter/Space)
     ------------------------- */
  const benefitCards = $$('.benefit-card');
  benefitCards.forEach(card => {
    const cardInner = card.querySelector('.card-inner');
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
    const handleMouseEnter = () => {
      if (window.innerWidth > 768) {
        card.classList.add('flipped');
      }
    };

    const handleMouseLeave = () => {
      if (window.innerWidth > 768) {
        card.classList.remove('flipped');
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('flipped');
      });
    }
  });

  /* -------------------------
     Ripple effect (pointerdown)
     - Creates a transient .btn-ripple element (styled by injected CSS)
     ------------------------- */
  function createRipple(e, container) {
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    container.appendChild(ripple);     
    ripple.addEventListener('animationend', () => ripple.remove());
    setTimeout(() => { if (ripple.parentElement) ripple.remove(); }, 900);
  }
  $$('.btn, .mission-step').forEach(el => {
    el.addEventListener('pointerdown', function (ev) {
      if (ev.button && ev.button !== 0) return;
      createRipple(ev, this);
    });
  });


  /* -------------------------
     Product-card toast (if product-card present)
     ------------------------- */
  $$('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productName = card.dataset.product || card.querySelector('h3')?.textContent?.trim() || 'Product';
      const notification = document.createElement('div');
      notification.className = 'product-notification';
      notification.textContent = `✓ Added "${productName}" to your wishlist!`;
      Object.assign(notification.style, {
        position: 'fixed',
        left: '50%',
        bottom: '30px',
        transform: 'translateX(-50%)',
        background: '#4caf50',
        color: '#fff',
        padding: '12px 18px',
        borderRadius: '999px',
        zIndex: 1200,
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        opacity: '0',
        transition: 'opacity .3s ease, transform .3s ease'
      });
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(-6px)';
      });
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => notification.remove(), 400);
      }, 3000);
    });
  });

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

  // ===================== Testimonials Auto-Slider =====================
document.addEventListener('DOMContentLoaded', () => {
  const testimonials = [
    {
      text: "Tallow & Care healed my Labrador's dry patches in a week. Natural and safe — I trust this brand now.",
      author: "— Riya S., Bareilly",
      img: "/testimonial-avatar-1.jpg"
    },
    {
      text: "Amazing shine and no more itching. Vet recommended, and my dog loves the smell (gentle, not overpowering).",
      author: "— Arjun V., Lucknow",
      img: "/testimonial-avatar-2.jpg"
    },
    {
      text: "Finally a product that's planet-friendly and pet-safe. Love their mission — will definitely buy again.",
      author: "— Sneha G., Delhi",
      img: "/testimonial-avatar-3.jpg"
    }
  ];

  let idx = 0;
  const intervalMs = 4000;
  let timer = null;
  const textEl = document.getElementById('testimonialText');
  const authorEl = document.getElementById('testimonialAuthor');
  const avatarEl = document.querySelector('.testimonial-avatar');
  const dotsContainer = document.getElementById('testimonialDots');
  const wrap = document.getElementById('testimonialsWrap');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');

  // build dots
  testimonials.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot';
    d.setAttribute('aria-label', `Show testimonial ${i+1}`);
    d.setAttribute('role', 'tab');
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });
  const dots = Array.from(dotsContainer.children);

  function render(i, animate=true) {
    // animate out
    const slide = document.getElementById('testimonialSlide');
    if (animate) slide.classList.add('fade-out');
    setTimeout(() => {
      const t = testimonials[i];
      textEl.textContent = t.text;
      authorEl.textContent = t.author;
      if (avatarEl && t.img) { avatarEl.src = t.img; avatarEl.style.display = ''; }
      dots.forEach(dot => dot.classList.remove('active'));
      if (dots[i]) dots[i].classList.add('active');
      if (animate) slide.classList.remove('fade-out');
    }, animate ? 220 : 0);
  }

  function next() { idx = (idx + 1) % testimonials.length; render(idx); }
  function prev() { idx = (idx - 1 + testimonials.length) % testimonials.length; render(idx); }
  function goTo(i) { idx = i; render(idx); resetTimer(); }

  // autoplay
  function startTimer() {
    stopTimer();
    timer = setInterval(next, intervalMs);
  }
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function resetTimer() { stopTimer(); startTimer(); }

  // pause on hover / focus (accessibility)
  wrap.addEventListener('mouseenter', stopTimer);
  wrap.addEventListener('mouseleave', startTimer);
  wrap.addEventListener('focusin', stopTimer);
  wrap.addEventListener('focusout', startTimer);

  // button events
  prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn.addEventListener('click', () => { next(); resetTimer(); });

  // keyboard support: left / right
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
  });

  // initial render & start
  render(0, false);
  startTimer();
});


  /* -------------------------
     Contact form validation & submit (handleContact referenced in HTML)
     ------------------------- */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
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
      if (name === 'name') {
        if (!value.trim()) { showError(name, 'Name is required.'); return false; }
      } else if (name === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { showError(name, 'A valid email is required.'); return false; }
      } else if (name === 'phone') {
        if (value && !/^\+?[\d\s-]{8,}$/.test(value)) { showError(name, 'If provided, phone must be valid.'); return false; }
      } else if (name === 'interest') {
        if (!value) { showError(name, 'Please select an interest.'); return false; }
      } else if (name === 'message') {
        if (!value.trim()) { showError(name, 'A message is required.'); return false; }
        if (value.trim().length < 10) { showError(name, 'Message must be at least 10 characters.'); return false; }
      }
      return true;
    }
    Object.keys(fields).forEach(key => {
      if (!fields[key]) return;
      fields[key].addEventListener('input', (e) => validateField(key, e.target.value));
      fields[key].addEventListener('blur', (e) => validateField(key, e.target.value));
    });
    window.handleContact = async (e) => {
      e.preventDefault();
      let valid = true;
      for (const key of Object.keys(fields)) {
        const value = fields[key] ? fields[key].value : '';
        if (!validateField(key, value)) valid = false;
      }
      if (!valid) {
        statusDiv.textContent = 'Please fix the errors in the form.';
        statusDiv.className = 'form-status error';
        setTimeout(() => statusDiv.textContent = '', 4500);
        return;
      }
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const spinner = submitBtn ? submitBtn.querySelector('.loading') : null;
      if (spinner) spinner.classList.add('active');
      if (submitBtn) submitBtn.disabled = true;
      await new Promise(res => setTimeout(res, 1400));
      const success = Math.random() > 0.12;
      if (spinner) spinner.classList.remove('active');
      if (submitBtn) submitBtn.disabled = false;
      if (success) {
        statusDiv.textContent = 'Message sent successfully! We will get back to you soon.';
        statusDiv.className = 'form-status success';
        contactForm.reset();
      } else {
        statusDiv.textContent = 'Oops! Something went wrong. Please try again later.';
        statusDiv.className = 'form-status error';
      }
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';
      }, 6000);
    };
  }

//   Feedback
document.getElementById("feedbackForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const messageBox = document.getElementById("feedbackMessage");
  messageBox.classList.remove("hidden");
  messageBox.style.opacity = "0";

  // Fade-in effect
  setTimeout(() => {
    messageBox.style.opacity = "1";
  }, 50);

  // Reset form
  this.reset();

  // Auto-hide after 4s
  setTimeout(() => {
    messageBox.style.opacity = "0";
    setTimeout(() => messageBox.classList.add("hidden"), 400);
  }, 4000);
});



  /* -------------------------
     Notify form handler
     ------------------------- */
  const notifyForm = $('#notifyForm');
  if (notifyForm) {
    notifyForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const section = notifyForm.closest('.notification-section');
      const successMessage = section ? section.querySelector('.success-message') : null;
      notifyForm.style.display = 'none';
      if (successMessage) successMessage.style.display = 'flex';
      setTimeout(() => {
        if (successMessage) successMessage.style.display = 'none';
        notifyForm.reset();
        notifyForm.style.display = 'flex';
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
  const yearSpan = $('#copyright-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

}); // DOMContentLoaded

const animatedEls = document.querySelectorAll('[data-animate]');
const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  animatedEls.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if(top < windowHeight - 100) el.classList.add('in-view');
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


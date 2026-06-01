/**
 * Jaguar Occasions — Premium Animations v2.0
 * Scroll-reveal, counter animations, header effects, mobile menu
 */

(function () {
  'use strict';

  /* ── HEADER SCROLL EFFECT ── */
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = y;
    }, { passive: true });
  }

  /* ── SCROLL REVEAL (Intersection Observer) ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ── AUTO-REVEAL ALL SECTIONS ── */
  // Add reveal class to section children that don't already have it
  const autoTargets = [
    '.service-card',
    '.cat-chip',
    '.product-card',
    '.step-item',
    '.detail-cards div',
    '.contact-line',
    '.category-card',
  ];
  autoTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-scale')) {
        el.classList.add('reveal');
        // stagger by index (max delay 5)
        const delay = Math.min(i + 1, 5);
        el.setAttribute('data-delay', delay);
      }
    });
  });

  // Re-run observer for newly added reveal elements
  document.querySelectorAll('.reveal:not(.visible), .reveal-scale:not(.visible)').forEach(el => {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    io2.observe(el);
  });

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el, target, duration = 1400) {
    const start = performance.now();
    const from = 0;
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (target - from) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // Observe stat counters
  const statEls = ['productsCount', 'categoriesCount', 'availableCount'];
  statEls.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const target = parseInt(el.textContent) || 0;
        if (target > 0) animateCounter(el, target, 1200);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
  });

  // Also watch for when JS updates the counters
  const counterObserver = new MutationObserver(() => {
    statEls.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = parseInt(el.textContent);
      if (val && val > 1 && el.dataset.animated !== '1') {
        el.dataset.animated = '1';
        const target = val;
        el.textContent = '0';
        setTimeout(() => animateCounter(el, target, 1200), 200);
      }
    });
  });
  statEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) counterObserver.observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ── BUTTON RIPPLE EFFECT ── */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,.25);
      border-radius:50%;
      transform:scale(0);
      animation:ripple .5s ease-out forwards;
      pointer-events:none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });

  // Inject ripple keyframe
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(s);
  }

  /* ── SMOOTH IMAGE LOAD ── */
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) return;
    img.style.opacity = '0';
    img.style.transition = 'opacity .4s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
  });

  /* ── PRODUCT CARD HOVER GLOW (dynamic) ── */
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%,rgba(201,168,76,.07),var(--surface) 60%)`;
  });
  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest('.product-card');
    if (card) card.style.background = '';
  }, true);

  /* ── MOBILE: watch for dynamically added cards ── */
  const gridObs = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        // Add reveal to newly added product cards
        if (node.classList && node.classList.contains('product-card')) {
          node.classList.add('reveal');
          requestAnimationFrame(() => node.classList.add('visible'));
        }
        node.querySelectorAll && node.querySelectorAll('.product-card').forEach(c => {
          c.classList.add('reveal');
          requestAnimationFrame(() => c.classList.add('visible'));
        });
      });
    });
  });
  const grids = document.querySelectorAll('.products-grid, #categoriesScroll');
  grids.forEach(g => gridObs.observe(g, { childList: true }));

})();

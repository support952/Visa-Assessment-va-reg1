(() => {
  'use strict';

  // ---------- Header scroll state ----------
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const toggleMenu = (force) => {
    const willOpen = force !== undefined ? force : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', willOpen);
    hamburger.classList.toggle('open', willOpen);
    hamburger.setAttribute('aria-expanded', String(willOpen));
    mobileMenu.hidden = !willOpen;
  };
  hamburger.addEventListener('click', () => toggleMenu());
  mobileMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') toggleMenu(false);
  });

  // ---------- Smooth-scroll offset for sticky header ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // ---------- FAQ: only one open at a time ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Typeform UTM / click-ID forwarding ----------
  // Reads tracking params from the landing URL, persists across navigation
  // via sessionStorage, and injects them into every Typeform popup trigger
  // (data-tf-hidden) + appends them to the href fallback URL.
  const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id'
  ];

  const urlParams = new URLSearchParams(window.location.search);
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('tf_tracking') || '{}'); } catch (e) {}

  let changed = false;
  TRACKING_PARAMS.forEach((p) => {
    const v = urlParams.get(p);
    if (v && v !== stored[p]) { stored[p] = v; changed = true; }
  });
  if (changed) {
    try { sessionStorage.setItem('tf_tracking', JSON.stringify(stored)); } catch (e) {}
  }

  const activeKeys = TRACKING_PARAMS.filter((p) => stored[p]);
  if (activeKeys.length) {
    const hiddenAttr = activeKeys
      .map((p) => p + '=' + encodeURIComponent(stored[p]))
      .join(',');

    document.querySelectorAll('[data-tf-popup]').forEach((el) => {
      // Inject into Typeform's hidden-fields mechanism (popup SDK)
      el.setAttribute('data-tf-hidden', hiddenAttr);

      // Also append to the href fallback so direct-open paths keep tracking
      try {
        const u = new URL(el.href);
        activeKeys.forEach((k) => u.searchParams.set(k, stored[k]));
        el.href = u.toString();
      } catch (e) { /* non-URL href — skip */ }
    });
  }
})();

/* A shared page-visit total. No cookies, visitor identifiers, or browser storage. */
(function () {
  'use strict';
  if (window.__ubtVisitorCounter) return;
  window.__ubtVisitorCounter = true;

  const API = 'https://abacus.jsn.cam';
  const KEY = 'universalbalancetheory.ca/visits';
  const LIVE_HOSTS = new Set(['universalbalancetheory.ca', 'www.universalbalancetheory.ca']);
  const isLive = location.protocol === 'https:' && LIVE_HOSTS.has(location.hostname);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MIN_DIGITS = 6;
  let started = false;
  let value = null;
  let animations = [];
  let animationTimer = 0;
  let counterInView = true;
  let revealPending = false;
  let revealObserver = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const counter = element('details', 'visitor-counter');
  counter.id = 'visitorCounter';
  counter.dataset.state = 'loading';
  const summary = element('summary', 'counter-tab');
  const head = element('span', 'counter-heading');
  const gear = element('span', 'counter-gear', '⚙');
  gear.setAttribute('aria-hidden', 'true');
  head.append(gear, element('span', 'counter-title', 'Visitor Counter'));
  const chevron = element('span', 'counter-chevron', '+');
  chevron.setAttribute('aria-hidden', 'true');
  head.append(chevron);
  const reels = element('span', 'counter-reels');
  reels.setAttribute('aria-hidden', 'true');
  const accessibleCount = element('span', 'counter-a11y', 'Loading visit count.');
  accessibleCount.setAttribute('aria-live', 'polite');
  accessibleCount.setAttribute('aria-atomic', 'true');
  const foot = element('span', 'counter-foot');
  const lamp = element('span', 'counter-lamp');
  lamp.setAttribute('aria-hidden', 'true');
  const status = element('span', 'counter-status', 'Connecting');
  foot.append(lamp, status, element('span', 'counter-cookie-note', 'No cookies'));
  summary.append(head, reels, accessibleCount, foot);

  const notes = element('div', 'counter-notes');
  notes.append(element('strong', '', 'Every visit leaves a little spark.'));
  notes.append(element('p', '', 'Total page visits since November 10, 2026. Reloads and visits to another page count again.'));
  notes.append(element('p', '', 'This counter uses no cookies or browser identifiers. A count request goes to Abacus, which receives ordinary network information.'));
  const privacy = element('a', 'counter-privacy', 'Credits & privacy');
  privacy.href = 'links.html#fine-print';
  notes.append(privacy);
  counter.append(summary, notes);

  // The instrument belongs to the page: hero on the home page, footer elsewhere.
  // Both its closed tab and expanded notes stay inside the modal's inert boundary.
  const heroActions = document.querySelector('.home-title .btns');
  if (heroActions) {
    counter.classList.add('visitor-counter--hero');
    heroActions.insertAdjacentElement('afterend', counter);
  } else {
    counter.classList.add('visitor-counter--footer');
    const parent = document.querySelector('footer .wrap') || document.querySelector('footer') || document.querySelector('main') || document.body;
    const finePrint = parent.querySelector('#fine-print');
    if (finePrint) finePrint.before(counter);
    else parent.append(counter);
  }

  function prefersStill() {
    return motion.matches || document.documentElement.classList.contains('motion-paused') || document.body.classList.contains('motion-paused');
  }

  function paused() {
    return prefersStill() || document.hidden;
  }

  function releaseRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = null;
  }

  function revealWhenVisible() {
    if (!revealPending || value === null) return;
    if (prefersStill()) {
      revealPending = false;
      releaseRevealObserver();
      renderCount(value, false);
    } else if (counterInView && !document.hidden) {
      revealPending = false;
      releaseRevealObserver();
      renderCount(value, true);
    }
  }

  function watchCounter() {
    if (typeof IntersectionObserver !== 'function') return;
    try {
      counterInView = false;
      revealObserver = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.target === counter);
        if (!entry) return;
        counterInView = entry.isIntersecting;
        revealWhenVisible();
      }, { threshold: 0.15 });
      revealObserver.observe(counter);
    } catch (_) {
      // A browser without a usable observer gets the same bounded reveal at load.
      releaseRevealObserver();
      counterInView = true;
    }
  }

  function stopReels() {
    clearTimeout(animationTimer);
    animations.forEach(animation => animation.cancel());
    animations = [];
    counter.classList.remove('is-winding');
  }

  function renderCount(total, animate) {
    stopReels();
    const digits = String(total).padStart(MIN_DIGITS, '0');
    reels.style.setProperty('--counter-digits', digits.length);
    reels.replaceChildren();
    digits.split('').forEach((digit, index) => {
      const window = element('span', 'counter-digit');
      const track = element('span', 'counter-track');
      const target = Number(digit);
      // Each drum makes a bounded number of turns and comes to rest on the true digit.
      const steps = animate ? 20 + target : target;
      for (let n = 0; n <= steps; n++) track.append(element('span', 'counter-number', String(n % 10)));
      window.append(track);
      reels.append(window);
      const finalPosition = `translateY(-${steps * 100 / (steps + 1)}%)`;
      track.style.transform = finalPosition;
      if (animate && typeof track.animate === 'function') {
        animations.push(track.animate([
          { transform: 'translateY(0)' },
          { transform: finalPosition }
        ], {
          duration: 1500 + index * 110,
          delay: (digits.length - index - 1) * 65,
          easing: 'cubic-bezier(.12,.55,.18,1)',
          fill: 'backwards'
        }));
      }
    });
    if (animate && animations.length) {
      counter.classList.add('is-winding');
      animationTimer = setTimeout(() => {
        stopReels();
        // Discard the spare drum rows once the reveal has finished.
        renderCount(total, false);
      }, 1750 + digits.length * 130);
    }
  }

  renderCount(0, false);

  async function requestCount(action) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    try {
      const response = await fetch(`${API}/${action}/${KEY}`, {
        method: 'GET', mode: 'cors', credentials: 'omit',
        referrerPolicy: 'no-referrer', cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) throw new Error(`Counter unavailable (${response.status})`);
      const data = await response.json();
      if (!Number.isSafeInteger(data.value) || data.value < 0) throw new Error('Invalid visit total');
      return data.value;
    } finally {
      clearTimeout(timer);
    }
  }

  async function load() {
    if (started || document.hidden) return;
    started = true;
    try {
      let counted = false;
      if (isLive) {
        try { value = await requestCount('hit'); counted = true; }
        catch (_) {
          // A timed-out hit may have reached the server. Never retry an increment.
          value = await requestCount('get');
        }
      } else {
        value = await requestCount('get');
      }
      counter.dataset.state = 'ready';
      counter.dataset.total = String(value);
      status.textContent = isLive ? 'Page visits' : 'Read-only preview';
      if (isLive && !counted) status.textContent = 'Latest total';
      accessibleCount.textContent = `${value.toLocaleString('en-CA')} total page visits. No cookies.`;
      // Fetch/count immediately; let the visitor actually see the single drum reveal.
      // The settled digits and accessible text already contain the true total.
      renderCount(value, false);
      revealPending = true;
      revealWhenVisible();
    } catch (_) {
      stopReels();
      revealPending = false;
      releaseRevealObserver();
      counter.dataset.state = 'unavailable';
      reels.replaceChildren(element('span', 'counter-unavailable', '— — — — — —'));
      status.textContent = isLive ? 'Temporarily offline' : 'Read-only preview';
      accessibleCount.textContent = 'Visit count temporarily unavailable. No cookies.';
    }
  }

  function honorMotion() {
    if (paused() && value !== null) renderCount(value, false);
    if (prefersStill()) revealWhenVisible();
  }
  motion.addEventListener('change', honorMotion);
  const observer = new MutationObserver(honorMotion);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) honorMotion();
    else { load(); revealWhenVisible(); }
  });
  window.addEventListener('pagehide', () => {
    stopReels();
    if (revealObserver) { revealObserver.disconnect(); counterInView = false; }
  });
  window.addEventListener('pageshow', () => {
    if (revealObserver) revealObserver.observe(counter);
    else revealWhenVisible();
  });
  // Opening details never reloads the count or adds a visit.
  counter.addEventListener('toggle', () => { chevron.textContent = counter.open ? '−' : '+'; });
  counter.addEventListener('keydown', event => {
    if (event.key === 'Escape' && counter.open) { counter.open = false; summary.focus(); }
  });
  watchCounter();
  load();
})();

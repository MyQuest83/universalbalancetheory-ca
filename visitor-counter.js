/* One site visit per tab when sessionStorage works; no cookies or personal identifiers. */
(function () {
  'use strict';
  if (window.__ubtVisitorCounter) return;
  window.__ubtVisitorCounter = true;

  const API = 'https://abacus.jsn.cam';
  const KEY = 'universalbalancetheory.ca/site-visits-v2';
  const TAB_MARKER = 'ubt.ca.site-visit-v2.counted';
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
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
  notes.append(element('p', '', 'Site visits since November 16, 2026. Browsing UBT.ca in the same tab normally counts once. A new tab may count as another visit.'));
  notes.append(element('p', '', 'No cookies or visitor identifiers. One temporary tab-only flag prevents repeat counts and is never sent to the counter service. If tab storage is unavailable, homepage loads are counted instead. Abacus receives ordinary network information.'));
  const privacy = element('a', 'counter-privacy', 'Credits & privacy');
  privacy.href = 'links.html#fine-print';
  notes.append(privacy);
  counter.append(summary, notes);

  // The public counter is shown on Home only; other public pages may record
  // the first tab visit without rendering the instrument.
  const heroActions = document.querySelector('.home-title .btns');
  if (isHome && heroActions) {
    counter.classList.add('visitor-counter--hero');
    heroActions.insertAdjacentElement('afterend', counter);
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
    if (!isHome || typeof IntersectionObserver !== 'function') return;
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

  if (isHome) renderCount(0, false);

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

  function visitAction() {
    if (!isLive) return 'get'; // previews are strictly read-only
    try {
      if (sessionStorage.getItem(TAB_MARKER) === '1') return 'get';
      // Mark first: the network request could succeed even if the reply is lost.
      // Never automatically retry an ambiguous increment.
      sessionStorage.setItem(TAB_MARKER, '1');
      return 'hit';
    } catch (_) {
      // Storage blocked: count homepage openings only, not every subpage.
      return isHome ? 'hit' : 'none';
    }
  }

  async function load() {
    if (started || document.hidden) return;
    started = true;
    const action = visitAction();
    if (action === 'none') return;
    try {
      let counted = false;
      try {
        value = await requestCount(action);
        counted = action === 'hit';
      } catch (error) {
        if (action !== 'hit') throw error;
        // A timed-out hit may have reached the server. Never retry an increment.
        value = await requestCount('get');
      }
      if (!isHome) return; // no counter UI on secondary pages
      counter.dataset.state = 'ready';
      counter.dataset.total = String(value);
      status.textContent = isLive ? 'Site visits' : 'Read-only preview';
      if (isLive && !counted) status.textContent = 'Latest total';
      accessibleCount.textContent = `${value.toLocaleString('en-CA')} UBT.ca site visits since November 16, 2026. No cookies.`;
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
    if (isHome && paused() && value !== null) renderCount(value, false);
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

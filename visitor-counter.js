/* UBT.ca brass counter: no cookies, visitor identifiers or browser storage.
 * A backend must be verified before activating data-first-party-counter="enabled".
 * Until then, this component is decorative and sends ZERO network requests.
 * No visitor IP addresses, paths, or identifiers are stored by this client.
 */
(function () {
  'use strict';
  if (window.__ubtVisitorCounter) return;
  window.__ubtVisitorCounter = true;

  const home = location.pathname === '/' || location.pathname === '/index.html';
  const target = document.querySelector('.home-title .btns');
  if (!home || !target) return;

  const LIVE_HOSTS = new Set(['universalbalancetheory.ca', 'www.universalbalancetheory.ca']);
  const isLive = location.protocol === 'https:' && LIVE_HOSTS.has(location.hostname);
  const ENABLED = isLive && document.currentScript &&
    document.currentScript.dataset.firstPartyCounter === 'enabled';
  const ENDPOINT = '/api/visits'; // same-origin, operator-owned API; no external counter
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let animations = [];
  let timer = 0;
  let observer = null;
  let value = null;

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  const counter = element('details', 'visitor-counter visitor-counter--hero');
  counter.id = 'visitorCounter';
  counter.dataset.state = 'paused';
  const summary = element('summary', 'counter-tab');
  const head = element('span', 'counter-heading');
  const gear = element('span', 'counter-gear', '⚙');
  gear.setAttribute('aria-hidden', 'true');
  const title = element('span', 'counter-title', 'Visitor Counter');
  const chevron = element('span', 'counter-chevron', '+');
  chevron.setAttribute('aria-hidden', 'true');
  head.append(gear, title, chevron);
  const reels = element('span', 'counter-reels');
  reels.setAttribute('aria-hidden', 'true');
  const accessible = element('span', 'counter-a11y', 'Counter paused during privacy upgrade.');
  accessible.setAttribute('aria-live', 'polite');
  accessible.setAttribute('aria-atomic', 'true');
  const foot = element('span', 'counter-foot');
  const lamp = element('span', 'counter-lamp');
  lamp.setAttribute('aria-hidden', 'true');
  const status = element('span', 'counter-status', 'Privacy mode');
  foot.append(lamp, status, element('span', 'counter-cookie-note', 'No cookies'));
  summary.append(head, reels, accessible, foot);

  const notes = element('div', 'counter-notes');
  notes.append(element('strong', '', 'Every visit leaves a little spark.'));
  notes.append(element('p', '', 'Live counting is paused while the first-party counter is prepared and verified. The brass instrument stays here, but it does not currently record or transmit visits.'));
  notes.append(element('p', '', 'The replacement counts homepage openings, including reloads. It does not use cookies, browser storage, visitor identifiers or fingerprinting. Ordinary network information is still processed by whichever host serves the site.'));
  const link = element('a', 'counter-privacy', 'Credits & privacy');
  link.href = 'links.html#fine-print';
  notes.append(link);
  counter.append(summary, notes);
  target.insertAdjacentElement('afterend', counter);

  function setPaused(message, state) {
    stop();
    value = null;
    counter.dataset.state = state || 'paused';
    reels.replaceChildren(element('span', 'counter-unavailable', '— — — — — —'));
    status.textContent = message;
    accessible.textContent = message + '. No visit data is being displayed.';
  }

  function stop() {
    clearTimeout(timer);
    animations.forEach(a => { try { a.cancel(); } catch (_) {} });
    animations = [];
    counter.classList.remove('is-winding');
  }

  function prefersStill() {
    return motion.matches ||
      document.documentElement.classList.contains('motion-paused') ||
      document.body.classList.contains('motion-paused');
  }

  function showNumber(number, animated) {
    stop();
    const digits = String(number).padStart(6, '0');
    reels.style.setProperty('--counter-digits', String(digits.length));
    reels.replaceChildren();
    digits.split('').forEach((digit, index) => {
      const cell = element('span', 'counter-digit');
      const track = element('span', 'counter-track');
      const n = Number(digit);
      const steps = animated ? 20 + n : n;
      for (let k = 0; k <= steps; k++) track.append(element('span', 'counter-number', String(k % 10)));
      cell.append(track);
      reels.append(cell);
      const end = 'translateY(-' + (100 * steps / (steps + 1)) + '%)';
      track.style.transform = end;
      if (animated && typeof track.animate === 'function') {
        animations.push(track.animate([
          { transform: 'translateY(0)' }, { transform: end }
        ], {
          duration: 1500 + 110 * index,
          delay: (digits.length - index - 1) * 65,
          easing: 'cubic-bezier(.12,.55,.18,1)',
          fill: 'backwards'
        }));
      }
    });
    if (animations.length) {
      counter.classList.add('is-winding');
      timer = setTimeout(() => { stop(); showNumber(number, false); }, 1750 + digits.length * 130);
    }
  }

  async function request(method) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 6500);
    try {
      const res = await fetch(ENDPOINT, {
        method, credentials: 'omit', mode: 'same-origin',
        cache: 'no-store', referrerPolicy: 'no-referrer', signal: ctrl.signal
      });
      if (!res.ok) throw new Error('Counter unavailable');
      const data = await res.json();
      if (!Number.isSafeInteger(data.value) || data.value < 0) throw new Error('Invalid total');
      if (data.series !== 'homepage-openings-v1') throw new Error('Unexpected counting series');
      return data.value;
    } finally {
      clearTimeout(timeout);
    }
  }

  function revealWhenVisible() {
    if (value === null || document.hidden) return;
    if (prefersStill()) { showNumber(value, false); return; }
    if (typeof IntersectionObserver !== 'function') { showNumber(value, true); return; }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.target === counter && entry.isIntersecting)) return;
      observer.disconnect(); observer = null;
      showNumber(value, true);
    }, { threshold: .15 });
    observer.observe(counter);
  }

  async function start() {
    if (started || document.hidden) return;
    started = true;
    if (!ENABLED) {
      setPaused('Privacy mode', 'paused');
      return; // NO network requests whatsoever until the operator enables the backend
    }
    counter.dataset.state = 'loading';
    status.textContent = 'Connecting';
    try {
      // One homepage opening is a visit; no session marker, cookies or identifiers.
      // If the POST times out, it may have succeeded. Never retry it.
      try { value = await request('POST'); }
      catch (_) { value = await request('GET'); }
      counter.dataset.state = 'ready';
      counter.dataset.total = String(value);
      status.textContent = 'Homepage openings';
      accessible.textContent = value.toLocaleString('en-CA') + ' homepage openings. No cookies or visitor tracking.';
      notes.querySelectorAll('p')[0].textContent = 'This counter records homepage openings, including refreshes. It does not identify people. The total starts when our first-party backend is activated.';
      revealWhenVisible();
    } catch (_) {
      setPaused('Temporarily unavailable', 'unavailable');
    }
  }

  counter.addEventListener('toggle', () => {
    chevron.textContent = counter.open ? '−' : '+';
  });
  counter.addEventListener('keydown', event => {
    if (event.key === 'Escape' && counter.open) {
      counter.open = false;
      summary.focus();
    }
  });
  motion.addEventListener('change', () => {
    if (value !== null && prefersStill()) showNumber(value, false);
  });
  window.addEventListener('pagehide', () => { stop(); if (observer) observer.disconnect(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!started) start();
    else if (value !== null && counter.dataset.state === 'ready' && observer) observer.observe(counter);
  });
  setPaused('Privacy mode', 'paused');
  start();
})();

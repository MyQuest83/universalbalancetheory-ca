/* Decorative gateway sequence. The warp is artwork, not a physical simulation. */
(function () {
  'use strict';
  const WARP_MS = 7000;
  const INTRO_MS = 4200;
  const RETURN_MS = 780;
  const gate = document.getElementById('introGate');
  const canvas = document.getElementById('gatewayWarp');
  const skipWarp = document.getElementById('skipWarp');
  const skipIntro = document.getElementById('skipIntro');
  const triggers = document.querySelectorAll('[data-intro-trigger]');
  if (!gate || !skipWarp || !skipIntro || !triggers.length) return;

  const background = [...document.querySelectorAll('header.top, .site-header, main, footer, .skip-link')];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 'idle';
  let phaseTimer = 0;
  let frame = 0;
  let startedAt = 0;
  let renderer = null;
  let lastTrigger = null;
  let inertStates = [];
  let quiet = false;
  let anchor = { x: 0, y: 0, radius: 0 };
  const entryTimers = new Map();

  function motionIsPaused() {
    return motionQuery.matches || document.documentElement.classList.contains('motion-paused') || document.body.classList.contains('motion-paused');
  }

  function clearOrbEntries() {
    entryTimers.forEach((timer, node) => {
      window.clearTimeout(timer);
      node.classList.remove('orbs-entering');
    });
    entryTimers.clear();
  }

  function captureOrbs(node) {
    if (!node) return;
    window.clearTimeout(entryTimers.get(node));
    entryTimers.delete(node);
    node.classList.remove('orbs-entering');
    if (document.hidden || quiet || motionIsPaused()) return;
    // Restart only the arrival on each dot, never the rotating parent tracks.
    void node.offsetWidth;
    node.classList.add('orbs-entering');
    entryTimers.set(node, window.setTimeout(() => {
      node.classList.remove('orbs-entering');
      entryTimers.delete(node);
    }, 2500));
  }

  function setPhase(value) {
    phase = value;
    gate.dataset.phase = value;
  }

  function focus(control) {
    if (control && control.isConnected) control.focus({ preventScroll: true });
  }

  function clearWork() {
    window.clearTimeout(phaseTimer);
    window.cancelAnimationFrame(frame);
    phaseTimer = frame = 0;
  }

  function releaseRenderer() {
    if (renderer) {
      try { renderer.dispose(); } catch (_) { /* Page recovery takes priority. */ }
    }
    renderer = null;
  }

  function finish(restoreFocus = true) {
    clearWork();
    clearOrbEntries();
    releaseRenderer();
    gate.classList.remove('on', 'hide', 'warping', 'quiet-intro', 'arriving');
    document.body.classList.remove('intro-open');
    inertStates.forEach(([node, value]) => { node.inert = value; });
    inertStates = [];
    setPhase('idle');
    if (restoreFocus) focus(lastTrigger);
    gate.setAttribute('aria-hidden', 'true');
    gate.setAttribute('aria-labelledby', 'introTitle');
    gate.setAttribute('aria-describedby', 'introSubtitle');
    if (restoreFocus && !document.hidden) captureOrbs(lastTrigger);
  }

  function closeIntro() {
    if (phase === 'idle' || phase === 'closing') return;
    if (phase === 'intro') {
      const copy = gate.querySelector('.intro-copy');
      if (copy) {
        const style = window.getComputedStyle(copy);
        copy.style.setProperty('--exit-opacity', style.opacity);
        copy.style.setProperty('--exit-clip', style.clipPath === 'none' ? 'inset(0)' : style.clipPath);
      }
    }
    clearWork();
    clearOrbEntries();
    // Freeze the current frame during the return fade; dispose after it is hidden.
    setPhase('closing');
    gate.classList.add('hide');
    phaseTimer = window.setTimeout(finish, quiet ? 0 : RETURN_MS);
  }

  function beginNormalIntro() {
    if (phase !== 'warp') return;
    clearWork();
    releaseRenderer();
    setPhase('intro');
    gate.classList.remove('warping');
    gate.classList.add('arriving');
    gate.setAttribute('aria-labelledby', 'introTitle');
    gate.setAttribute('aria-describedby', 'introSubtitle');
    focus(skipIntro);
    captureOrbs(gate.querySelector('.triad-orbit'));
    // The existing intro retains its full duration after the seven-second dive.
    phaseTimer = window.setTimeout(closeIntro, INTRO_MS);
  }

  function updateAnchor() {
    if (!lastTrigger) return;
    const rect = lastTrigger.getBoundingClientRect();
    anchor = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: rect.width / 2 };
    gate.style.setProperty('--warp-x', `${anchor.x}px`);
    gate.style.setProperty('--warp-y', `${anchor.y}px`);
    gate.style.setProperty('--warp-radius', `${anchor.radius}px`);
  }

  function draw(now) {
    if (phase !== 'warp' || quiet || !renderer) return;
    const progress = Math.min(1, (now - startedAt) / WARP_MS);
    try {
      renderer.draw(progress, anchor);
    } catch (_) {
      beginNormalIntro();
      return;
    }
    if (progress >= 1) beginNormalIntro();
    else frame = window.requestAnimationFrame(draw);
  }

  function honorMotionPreference() {
    const pauseRequested = motionIsPaused();
    if (pauseRequested) clearOrbEntries();
    if (phase === 'idle') return;
    // A pause is latched for this play-through, so changing preferences cannot restart a dive unexpectedly.
    quiet = quiet || pauseRequested;
    gate.classList.toggle('quiet-intro', quiet);
    if (quiet) window.cancelAnimationFrame(frame);
  }

  const motionObserver = new MutationObserver(honorMotionPreference);
  // Keep the preference watch active for homepage arrivals as well as the modal.
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  motionObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function playIntro(event) {
    event.preventDefault();
    if (phase !== 'idle') return;
    lastTrigger = event.currentTarget;
    updateAnchor();
    quiet = false;
    setPhase('warp');
    honorMotionPreference();
    inertStates = background.map(node => [node, node.inert]);
    background.forEach(node => { node.inert = true; });
    gate.classList.add('on', 'warping');
    gate.setAttribute('aria-labelledby', 'warpTitle');
    gate.setAttribute('aria-describedby', 'warpDescription');
    gate.setAttribute('aria-hidden', 'false');
    document.body.classList.add('intro-open');
    focus(skipWarp);
    startedAt = performance.now();
    phaseTimer = window.setTimeout(beginNormalIntro, WARP_MS);
    if (quiet) return; // Same timing, with a static halo instead of spatial motion.
    try {
      renderer = window.createUBTWarp && window.createUBTWarp(canvas);
      if (!renderer) throw new Error('Canvas unavailable');
      renderer.resize(gate.clientWidth, gate.clientHeight, window.devicePixelRatio || 1);
      renderer.draw(0, anchor);
      frame = window.requestAnimationFrame(draw);
    } catch (_) {
      // A canvas failure must never block the familiar gateway or the page.
      beginNormalIntro();
    }
  }

  triggers.forEach(trigger => trigger.addEventListener('click', playIntro));
  skipWarp.addEventListener('click', closeIntro);
  skipIntro.addEventListener('click', closeIntro);
  document.addEventListener('keydown', event => {
    if (phase === 'idle') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeIntro();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      focus(gate.classList.contains('warping') ? skipWarp : skipIntro);
    }
  });
  window.addEventListener('resize', () => {
    if (phase !== 'warp') return;
    updateAnchor();
    if (renderer) {
      try { renderer.resize(gate.clientWidth, gate.clientHeight, window.devicePixelRatio || 1); }
      catch (_) { beginNormalIntro(); }
    }
  });
  motionQuery.addEventListener('change', honorMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearOrbEntries();
      if (phase !== 'idle') finish();
    }
  });
  window.addEventListener('pagehide', () => {
    clearOrbEntries();
    if (phase !== 'idle') finish(false);
  });
  setPhase('idle');
  triggers.forEach(captureOrbs);
})();

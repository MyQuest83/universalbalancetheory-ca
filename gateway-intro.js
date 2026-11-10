/* Decorative gateway sequence. The warp is artwork, not a physical simulation.
 * One clock owns every orb position, including docking and staged return.
 * Orb rates remain the published ratios documented in gateway.css.
 */
(function () {
  'use strict';
  const WARP_MS = 7000;
  const INTRO_MS = 4200;
  const ALIGN_MS = 1250;
  const RETURN_MS = 780;
  const TAU = Math.PI * 2;
  const gate = document.getElementById('introGate');
  const canvas = document.getElementById('gatewayWarp');
  const skipWarp = document.getElementById('skipWarp');
  const skipIntro = document.getElementById('skipIntro');
  const triggers = [...document.querySelectorAll('[data-intro-trigger]')];
  if (!gate || !skipWarp || !skipIntro || !triggers.length) return;

  const backgroundSelector = 'header.top, .site-header, main, footer, .skip-link, .visitor-counter';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * t * (10 + t * (-15 + t * 6)); };
  // Integral of smoothstep: angular speed rises gently from zero to full speed.
  const rampIntegral = value => {
    const t = clamp(value);
    return t * t * t * t * (2.5 + t * (-3 + t));
  };
  let phase = 'idle';
  let phaseTimer = 0;
  let frame = 0;
  let orbFrame = 0;
  let startedAt = 0;
  let renderer = null;
  let lastTrigger = null;
  let inertStates = [];
  let quiet = false;
  let anchor = { x: 0, y: 0, radius: 0 };
  let returningFromHidden = false;

  function motionIsPaused() {
    return motionQuery.matches || document.documentElement.classList.contains('motion-paused') || document.body.classList.contains('motion-paused');
  }

  // Quintic Hermite docking preserves the current position and velocity, then
  // finishes exactly at the anchor with zero speed and acceleration.
  function dockAxis(start, speed, target, elapsed, duration) {
    const t = clamp(elapsed / duration);
    const t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t;
    const blend = 10 * t3 - 15 * t4 + 6 * t5;
    const tangent = t - 6 * t3 + 8 * t4 - 3 * t5;
    const blendSpeed = (30 * t2 - 60 * t3 + 30 * t4) / duration;
    const tangentSpeed = 1 - 18 * t2 + 32 * t3 - 15 * t4;
    return { position: start + (target - start) * blend + speed * duration * tangent,
      speed: (target - start) * blendSpeed + speed * tangentSpeed };
  }

  class OrbField {
    constructor(root) {
      this.root = root;
      this.size = 1;
      this.mode = 'parked';
      this.epoch = 0;
      this.paused = false;
      this.orbs = [...root.querySelectorAll('.orbit-lane, .intro-lane')].map(lane => {
        const style = getComputedStyle(lane);
        const angle = parseFloat(style.getPropertyValue('--start-angle')) * Math.PI / 180;
        const rate = parseFloat(style.getPropertyValue('--lane-rate')) || 1;
        return { lane, dot: lane.querySelector('.node, .intro-dot'), anchor: angle, angle,
          rate: TAU * rate / 14000, rank: lane.classList.contains('blue') ? 0 : lane.classList.contains('green') ? 1 : 2,
          radius: .5, x: 0, y: 0, vx: 0, vy: 0, opacity: 1, scale: 1, trail: 0 };
      }).filter(orb => orb.dot && Number.isFinite(orb.anchor));
      root.classList.add('orbits-managed');
      this.measure();
      this.park();
    }

    measure() {
      this.size = this.root.clientWidth || this.size;
      this.orbs.forEach(orb => { orb.radius = Math.max(0, orb.lane.clientWidth / 2 - .5) / this.size; });
      this.render();
    }

    setMode(mode) {
      if (this.mode !== mode || !this.root.dataset.orbState) {
        this.mode = mode;
        this.root.dataset.orbState = mode;
      }
    }

    place(orb, angle, speed = 0) {
      orb.angle = angle;
      orb.x = orb.radius * Math.cos(angle);
      orb.y = orb.radius * Math.sin(angle);
      orb.vx = -orb.radius * Math.sin(angle) * speed;
      orb.vy = orb.radius * Math.cos(angle) * speed;
      orb.opacity = orb.scale = 1;
      orb.trail = 0;
    }

    park() {
      this.orbs.forEach(orb => this.place(orb, orb.anchor));
      this.setMode('parked');
      this.render();
    }

    hide() {
      this.park();
      this.orbs.forEach(orb => { orb.opacity = 0; });
      this.setMode('hidden');
      this.render();
    }

    render() {
      this.orbs.forEach(orb => {
        orb.dot.style.transform = `translate(-50%, -50%) translate3d(${(orb.x * this.size).toFixed(3)}px, ${(orb.y * this.size).toFixed(3)}px, 0) scale(${orb.scale.toFixed(4)})`;
        orb.dot.style.opacity = orb.opacity.toFixed(4);
        orb.dot.style.setProperty('--orb-trail', orb.trail.toFixed(4));
      });
    }

    align(now, duration = ALIGN_MS) {
      this.resumeAfterAlign = false;
      this.update(now);
      if (this.paused || motionIsPaused()) { this.park(); return; }
      this.epoch = now;
      this.duration = duration;
      this.orbs.forEach(orb => {
        orb.start = { x: orb.x, y: orb.y, vx: orb.vx, vy: orb.vy, opacity: orb.opacity, scale: orb.scale };
      });
      this.setMode('aligning');
      requestOrbFrame();
    }

    arrive(now, compact = false) {
      if (this.paused || motionIsPaused() || document.hidden) { this.park(); return; }
      this.measure();
      this.epoch = now;
      this.descent = compact ? 1050 : 1450;
      this.stagger = compact ? 220 : 280;
      this.launch = this.descent + this.stagger * 2 + (compact ? 180 : 250);
      this.launchStagger = compact ? 320 : 420;
      this.ramp = compact ? 1450 : 2200;
      const rect = this.root.getBoundingClientRect();
      this.fromY = -(Math.max(0, rect.top) + rect.height / 2 + 48) / this.size;
      this.orbs.forEach(orb => { orb.launchAngle = orb.anchor; });
      this.setMode('arriving');
      this.update(now);
      requestOrbFrame();
    }

    resume(now) {
      if (this.paused || motionIsPaused() || document.hidden) return;
      this.epoch = now;
      this.launch = 0;
      this.launchStagger = 420;
      this.ramp = 2200;
      this.orbs.forEach(orb => { orb.launchAngle = orb.angle; });
      this.setMode('resuming');
      requestOrbFrame();
    }

    setPaused(value, now) {
      if (this.paused === value) return;
      this.update(now);
      this.paused = value;
      if (value) {
        // An interrupted descent must never leave an inaccessible, offscreen mark.
        if (this.mode === 'arriving' || this.mode === 'aligning') this.park();
        else if (this.mode !== 'hidden') {
          this.orbs.forEach(orb => { orb.vx = orb.vy = 0; });
          this.setMode('parked');
        }
      } else if (this.mode !== 'hidden') this.resume(now);
    }

    update(now) {
      if (this.paused || this.mode === 'hidden' || this.mode === 'parked') return false;
      const elapsed = Math.max(0, now - this.epoch);
      if (this.mode === 'aligning') {
        this.orbs.forEach(orb => {
          const targetX = orb.radius * Math.cos(orb.anchor);
          const targetY = orb.radius * Math.sin(orb.anchor);
          const x = dockAxis(orb.start.x, orb.start.vx, targetX, elapsed, this.duration);
          const y = dockAxis(orb.start.y, orb.start.vy, targetY, elapsed, this.duration);
          orb.x = x.position; orb.y = y.position; orb.vx = x.speed; orb.vy = y.speed;
          orb.opacity = orb.start.opacity + (1 - orb.start.opacity) * smooth(elapsed / this.duration);
          orb.scale = orb.start.scale + (1 - orb.start.scale) * smooth(elapsed / this.duration);
          orb.trail *= .8;
        });
        if (elapsed >= this.duration) {
          this.park();
          if (this.resumeAfterAlign) {
            this.resumeAfterAlign = false;
            this.resume(now);
          }
        }
      } else {
        this.orbs.forEach(orb => {
          const launchAt = this.launch + orb.rank * this.launchStagger;
          const movingFor = Math.max(0, elapsed - launchAt);
          const rampProgress = clamp(movingFor / this.ramp);
          const travel = movingFor <= this.ramp ? this.ramp * rampIntegral(rampProgress) : movingFor - this.ramp / 2;
          this.place(orb, orb.launchAngle + orb.rate * travel, orb.rate * smooth(rampProgress));
          if (this.mode === 'arriving' && elapsed < launchAt) {
            const t = clamp((elapsed - orb.rank * this.stagger) / this.descent);
            const blend = smooth(t);
            const targetY = orb.radius * Math.sin(orb.anchor);
            orb.y = this.fromY + (targetY - this.fromY) * blend;
            orb.vy = (targetY - this.fromY) * (30 * t * t - 60 * t * t * t + 30 * t * t * t * t) / this.descent;
            orb.opacity = smooth(t / .22);
            orb.scale = .68 + .32 * blend;
            orb.trail = Math.sin(Math.PI * t) * .9;
          }
        });
        if (elapsed >= this.launch + this.launchStagger * 2 + this.ramp) this.setMode('orbiting');
      }
      this.render();
      return this.mode !== 'parked';
    }
  }

  const homeFields = new Map(triggers.map(trigger => [trigger, new OrbField(trigger)]));
  const introRoot = gate.querySelector('.triad-orbit');
  const introField = introRoot ? new OrbField(introRoot) : null;
  const fields = [...homeFields.values(), ...(introField ? [introField] : [])];
  if (introField) introField.hide();

  function requestOrbFrame() {
    if (!orbFrame && !document.hidden && !motionIsPaused()) orbFrame = requestAnimationFrame(updateOrbs);
  }

  function updateOrbs(now) {
    orbFrame = 0;
    if (document.hidden || motionIsPaused()) return;
    let active = false;
    fields.forEach(field => { if (field.update(now)) active = true; });
    if (active) requestOrbFrame();
  }

  function setPhase(value) { phase = value; gate.dataset.phase = value; }
  function focus(control) { if (control && control.isConnected) control.focus({ preventScroll: true }); }
  function clearWork() {
    clearTimeout(phaseTimer);
    cancelAnimationFrame(frame);
    phaseTimer = frame = 0;
  }
  function releaseRenderer() {
    if (renderer) { try { renderer.dispose(); } catch (_) { /* Page recovery takes priority. */ } }
    renderer = null;
  }

  function finish(restoreFocus = true) {
    clearWork();
    releaseRenderer();
    if (introField) introField.hide();
    gate.classList.remove('on', 'hide', 'warping', 'quiet-intro', 'arriving', 'aligning');
    document.body.classList.remove('intro-open');
    inertStates.forEach(([node, value]) => { node.inert = value; });
    inertStates = [];
    setPhase('idle');
    gate.setAttribute('aria-hidden', 'true');
    gate.setAttribute('aria-labelledby', 'introTitle');
    gate.setAttribute('aria-describedby', 'introSubtitle');
    if (restoreFocus && !document.hidden) focus(lastTrigger);
    const field = homeFields.get(lastTrigger);
    if (field) {
      if (document.hidden || motionIsPaused()) field.park();
      else if (quiet) { field.park(); field.resume(performance.now()); }
      else if (returningFromHidden) field.arrive(performance.now());
      else {
        // An early skip keeps the visible pose; docking finishes before easing up.
        field.align(performance.now(), 600);
        field.resumeAfterAlign = true;
      }
    }
    returningFromHidden = false;
  }

  function closeIntro() {
    if (phase === 'idle' || phase === 'closing') return;
    const previousPhase = phase;
    if (phase === 'intro') {
      const copy = gate.querySelector('.intro-copy');
      if (copy) {
        const style = getComputedStyle(copy);
        copy.style.setProperty('--exit-opacity', style.opacity);
        copy.style.setProperty('--exit-clip', style.clipPath === 'none' ? 'inset(0)' : style.clipPath);
      }
      if (introField) introField.align(performance.now(), 540);
    }
    clearWork();
    setPhase('closing');
    gate.classList.add('hide');
    if (previousPhase === 'aligning') gate.classList.remove('aligning');
    phaseTimer = setTimeout(finish, quiet ? 0 : RETURN_MS);
  }

  function beginNormalIntro() {
    if (phase !== 'warp') return;
    clearWork();
    releaseRenderer();
    const field = homeFields.get(lastTrigger);
    if (field) field.hide();
    returningFromHidden = true;
    setPhase('intro');
    gate.classList.remove('warping', 'aligning');
    gate.classList.add('arriving');
    gate.setAttribute('aria-labelledby', 'introTitle');
    gate.setAttribute('aria-describedby', 'introSubtitle');
    focus(skipIntro);
    if (introField) {
      introField.measure();
      if (quiet) introField.park();
      else introField.arrive(performance.now(), true);
    }
    phaseTimer = setTimeout(closeIntro, INTRO_MS);
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
    // Reset the home orbs only after the canvas fully covers them.
    if (progress >= .18 && !returningFromHidden) {
      const field = homeFields.get(lastTrigger);
      if (field) field.hide();
      returningFromHidden = true;
    }
    try { renderer.draw(progress, anchor); }
    catch (_) { beginNormalIntro(); return; }
    if (progress >= 1) beginNormalIntro();
    else frame = requestAnimationFrame(draw);
  }

  function beginWarp() {
    if (phase !== 'aligning') return;
    clearWork();
    const field = homeFields.get(lastTrigger);
    if (field) field.park();
    setPhase('warp');
    gate.classList.remove('aligning');
    updateAnchor();
    startedAt = performance.now();
    phaseTimer = setTimeout(beginNormalIntro, WARP_MS);
    if (quiet) return;
    try {
      renderer = window.createUBTWarp && window.createUBTWarp(canvas);
      if (!renderer) throw new Error('Canvas unavailable');
      renderer.resize(gate.clientWidth, gate.clientHeight, window.devicePixelRatio || 1);
      renderer.draw(0, anchor);
      frame = requestAnimationFrame(draw);
    } catch (_) { beginNormalIntro(); }
  }

  function honorMotionPreference() {
    const paused = motionIsPaused();
    const now = performance.now();
    if (phase !== 'idle') quiet = quiet || paused;
    fields.forEach(field => field.setPaused(paused || (field === introField && quiet && phase !== 'idle'), now));
    if (paused) { cancelAnimationFrame(orbFrame); orbFrame = 0; }
    if (phase === 'idle') return;
    // A reduced-motion request stays in force for this play-through.
    quiet = quiet || paused;
    gate.classList.toggle('quiet-intro', quiet);
    if (quiet) cancelAnimationFrame(frame);
    if (quiet && phase === 'aligning') beginWarp();
  }

  function playIntro(event) {
    event.preventDefault();
    if (phase !== 'idle') return;
    lastTrigger = event.currentTarget;
    returningFromHidden = false;
    updateAnchor();
    quiet = motionIsPaused();
    setPhase('aligning');
    const background = [...document.querySelectorAll(backgroundSelector)];
    inertStates = background.map(node => [node, node.inert]);
    background.forEach(node => { node.inert = true; });
    gate.classList.add('on', 'warping', 'aligning');
    gate.classList.toggle('quiet-intro', quiet);
    gate.setAttribute('aria-labelledby', 'warpTitle');
    gate.setAttribute('aria-describedby', 'warpDescription');
    gate.setAttribute('aria-hidden', 'false');
    document.body.classList.add('intro-open');
    focus(skipWarp);
    const field = homeFields.get(lastTrigger);
    if (field) field.align(performance.now());
    if (quiet) beginWarp();
    else phaseTimer = setTimeout(beginWarp, ALIGN_MS + 40);
  }

  triggers.forEach(trigger => trigger.addEventListener('click', playIntro));
  skipWarp.addEventListener('click', closeIntro);
  skipIntro.addEventListener('click', closeIntro);
  document.addEventListener('keydown', event => {
    if (phase === 'idle') return;
    if (event.key === 'Escape') { event.preventDefault(); closeIntro(); }
    else if (event.key === 'Tab') {
      event.preventDefault();
      focus(gate.classList.contains('warping') ? skipWarp : skipIntro);
    }
  });
  window.addEventListener('resize', () => {
    fields.forEach(field => field.measure());
    if (phase !== 'warp' && phase !== 'aligning') return;
    updateAnchor();
    if (renderer) {
      try { renderer.resize(gate.clientWidth, gate.clientHeight, window.devicePixelRatio || 1); }
      catch (_) { beginNormalIntro(); }
    }
  });
  const motionObserver = new MutationObserver(honorMotionPreference);
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  motionObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  motionQuery.addEventListener('change', honorMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(orbFrame); orbFrame = 0;
      if (phase !== 'idle') finish(false);
      homeFields.forEach(field => field.park());
    } else homeFields.forEach(field => field.resume(performance.now()));
  });
  window.addEventListener('pagehide', () => {
    if (phase !== 'idle') finish(false);
    cancelAnimationFrame(orbFrame); orbFrame = 0;
    homeFields.forEach(field => field.park());
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) homeFields.forEach(field => field.resume(performance.now()));
  });
  setPhase('idle');
  honorMotionPreference();
  homeFields.forEach(field => field.arrive(performance.now()));
})();

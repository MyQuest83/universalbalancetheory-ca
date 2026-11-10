/* Decorative gateway sequence. The warp is artwork, not a physical simulation.
 * One clock owns the perspective launch, magnetic logo capture and orbital release.
 * Trajectories are physically inspired artwork; only the decorative lane rates
 * below reuse the published ratios. New launches use browser cryptographic RNG.
 * Orb rates remain the published ratios documented in gateway.css.
 */
(function () {
  'use strict';
  const WARP_MS = 7000;
  const INTRO_MS = 6200;
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

  // All three docking points are the actual logo vertices: the SVG occupies
  // 66% of the sigil and its triangle circumradius is 128 / 320 of that box.
  const LOGO_TIP_RADIUS = .66 * 128 / 320;
  const PERSPECTIVE = 2.8;
  const motionTimings = Object.freeze({
    home: { flight: 2250, capture: 1150, stagger: 200, hold: 950, ringLead: 650, launchStagger: 440, transfer: 1400, ramp: 2000 },
    intro: { flight: 1400, capture: 850, stagger: 160, hold: 750, ringLead: 450, launchStagger: 300, transfer: 1000, ramp: 1450 }
  });

  function capturePose(orb, elapsed, timing, reach) {
    const duration = timing.flight + timing.capture;
    const t = clamp(elapsed / duration);
    const approach = smooth(elapsed / timing.flight);
    const magnet = smooth((elapsed - timing.flight) / timing.capture);
    const theta = orb.flight.azimuth + orb.flight.turns * TAU * smooth(t);
    const radius = orb.flight.startRadius + (orb.flight.swirlRadius - orb.flight.startRadius) * smooth(t / .48);
    const cameraRelease = 1 - smooth(t / .48);
    const orbitalDepth = Math.sin(theta) * Math.sin(orb.flight.tilt) * radius;
    const depth = orb.flight.depth * cameraRelease + orbitalDepth * smooth(t / .3);
    const perspective = PERSPECTIVE / Math.max(.3, PERSPECTIVE - depth);
    const bank = orb.flight.bank;
    const ox = Math.cos(theta) * radius;
    const oy = Math.sin(theta) * radius * Math.cos(orb.flight.tilt);
    let x = (ox * Math.cos(bank) - oy * Math.sin(bank)) * perspective;
    let y = (ox * Math.sin(bank) + oy * Math.cos(bank)) * perspective;
    // A smooth radial lens keeps the foreground launch inside a narrow screen.
    // Magnetic capture is applied after it, so the SVG tip coordinates are exact.
    const distance = Math.hypot(x, y);
    const bounded = distance > .000001 ? reach * Math.tanh(distance / reach) / distance : 1;
    x *= bounded; y *= bounded;
    return {
      x: x * (1 - magnet) + orb.tipX * magnet,
      y: y * (1 - magnet) + orb.tipY * magnet,
      scale: perspective * (1 - magnet) + magnet,
      depth: depth * (1 - magnet),
      opacity: smooth(elapsed / 210),
      trail: Math.sin(Math.PI * t) * (.45 + .55 * approach) * (1 - magnet)
    };
  }

  class OrbField {
    constructor(root) {
      this.root = root;
      this.size = 1;
      this.reach = .8;
      this.mode = 'parked';
      this.epoch = 0;
      this.paused = false;
      this.ringAwake = 0;
      this.initialRingAwake = 0;
      this.wellStrength = 0;
      this.lockStrength = 0;
      this.arrivalNumber = 0;
      this.orbs = [...root.querySelectorAll('.orbit-lane, .intro-lane')].map(lane => {
        const style = getComputedStyle(lane);
        const angle = parseFloat(style.getPropertyValue('--start-angle')) * Math.PI / 180;
        const rate = parseFloat(style.getPropertyValue('--lane-rate')) || 1;
        const rank = lane.classList.contains('blue') ? 0 : lane.classList.contains('green') ? 1 : 2;
        const marker = document.createElement('span');
        marker.className = `gateway-ring-marker ${['blue', 'green', 'red'][rank]}`;
        marker.setAttribute('aria-hidden', 'true');
        root.appendChild(marker);
        return { lane, marker, dot: lane.querySelector('.node, .intro-dot'), anchor: angle, angle,
          rate: TAU * rate / 14000, rank, tipX: LOGO_TIP_RADIUS * Math.cos(angle), tipY: LOGO_TIP_RADIUS * Math.sin(angle),
          radius: .5, x: 0, y: 0, vx: 0, vy: 0, opacity: 1, scale: 1, vScale: 0, depth: 0, vDepth: 0,
          trail: 0, tailAngle: 0, ringAngle: angle, ringSpeed: 0 };
      }).filter(orb => orb.dot && Number.isFinite(orb.anchor));
      this.well = document.createElement('span');
      this.well.className = 'gateway-gravity-well';
      this.well.setAttribute('aria-hidden', 'true');
      root.appendChild(this.well);
      root.classList.add('orbits-managed');
      this.measure();
      this.park();
    }

    measure() {
      const rect = this.root.getBoundingClientRect();
      this.size = this.root.clientWidth || this.size;
      this.orbs.forEach(orb => {
        if (orb.lane.clientWidth) orb.radius = Math.max(0, orb.lane.clientWidth / 2 - .5) / this.size;
      });
      if (rect.width) {
        const centre = rect.left + rect.width / 2;
        const centreY = rect.top + rect.height / 2;
        const clippedBy = this.root.closest && this.root.closest('.home-title');
        const clipTop = clippedBy ? Math.max(0, clippedBy.getBoundingClientRect().top) : 0;
        const clearance = Math.min(centre, (window.innerWidth || document.documentElement.clientWidth) - centre,
          centreY - clipTop, (window.innerHeight || document.documentElement.clientHeight) - centreY);
        this.reach = Math.max(.32, Math.min(1.05, (clearance - 54) / this.size));
      }
      this.render();
    }

    setMode(mode) {
      if (this.mode !== mode || !this.root.dataset.orbState) {
        this.mode = mode;
        this.root.dataset.orbState = mode;
      }
    }

    place(orb, angle, speed = 0, radius = orb.radius, radialSpeed = 0) {
      orb.angle = angle;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      orb.x = radius * cos; orb.y = radius * sin;
      orb.vx = radialSpeed * cos - radius * sin * speed;
      orb.vy = radialSpeed * sin + radius * cos * speed;
      orb.opacity = orb.scale = 1;
      orb.trail = orb.depth = orb.vScale = orb.vDepth = 0;
    }

    park() {
      this.orbs.forEach(orb => { this.place(orb, orb.anchor, 0, LOGO_TIP_RADIUS); orb.ringSpeed = 0; });
      this.wellStrength = 0;
      this.lockStrength = 1;
      this.setMode('parked');
      this.render();
    }

    hide() {
      this.resumeAfterAlign = false;
      this.park();
      this.orbs.forEach(orb => { orb.opacity = 0; });
      this.ringAwake = this.lockStrength = 0;
      this.setMode('hidden');
      this.render();
    }

    render() {
      this.root.style.setProperty('--ring-awake', this.ringAwake.toFixed(4));
      this.root.style.setProperty('--well-strength', this.wellStrength.toFixed(4));
      this.root.style.setProperty('--lock-strength', this.lockStrength.toFixed(4));
      this.orbs.forEach(orb => {
        orb.dot.style.transform = `translate(-50%, -50%) translate3d(${(orb.x * this.size).toFixed(3)}px, ${(orb.y * this.size).toFixed(3)}px, 0) scale(${orb.scale.toFixed(4)})`;
        orb.dot.style.opacity = orb.opacity.toFixed(4);
        orb.dot.style.setProperty('--orb-trail', orb.trail.toFixed(4));
        orb.dot.style.setProperty('--orb-tail-angle', `${orb.tailAngle.toFixed(4)}rad`);
        orb.dot.style.setProperty('--orb-shade', (orb.depth < 0 ? .7 + .3 / (1 + Math.abs(orb.depth) * 5) : 1).toFixed(4));
        orb.lane.style.zIndex = orb.depth < -.015 ? '0' : '4';
        orb.marker.style.transform = `rotate(${orb.ringAngle.toFixed(6)}rad)`;
      });
    }

    align(now, duration = ALIGN_MS) {
      this.resumeAfterAlign = false;
      this.update(now);
      if (this.paused || motionIsPaused()) { this.park(); return; }
      this.epoch = now;
      this.duration = duration;
      this.alignWell = this.wellStrength;
      this.orbs.forEach(orb => {
        orb.start = { x: orb.x, y: orb.y, vx: orb.vx, vy: orb.vy, opacity: orb.opacity, scale: orb.scale,
          depth: orb.depth, vScale: orb.vScale, vDepth: orb.vDepth, trail: orb.trail, ringAngle: orb.ringAngle, ringSpeed: orb.ringSpeed };
        // A fast foreground contraction can settle sooner than the position.
        // Keeping the initial derivative while shortening its docking interval
        // avoids the negative scales a long high-speed Hermite curve can cause.
        orb.scaleDockMs = orb.vScale * (1 - orb.scale) > 0 ?
          Math.min(duration, Math.max(16, 2 * Math.abs((1 - orb.scale) / orb.vScale))) : duration;
      });
      this.setMode('aligning');
      requestOrbFrame();
    }

    arrive(now, compact = false) {
      if (this.paused || motionIsPaused() || document.hidden) { this.park(); return; }
      this.measure();
      const random = new Uint32Array(this.orbs.length * 5);
      try { window.crypto.getRandomValues(random); }
      catch (_) {
        // No invented randomness: a static logo is the safe offline fallback.
        this.root.dataset.randomSource = 'unavailable';
        this.park();
        this.resume(now);
        return;
      }
      this.root.dataset.randomSource = 'crypto';
      this.root.dataset.arrival = String(++this.arrivalNumber);
      this.epoch = now;
      this.timing = compact ? motionTimings.intro : motionTimings.home;
      this.captureEnd = this.timing.flight + this.timing.capture + this.timing.stagger * 2;
      this.ringAt = this.captureEnd + this.timing.hold;
      this.launch = this.ringAt + this.timing.ringLead;
      this.launchStagger = this.timing.launchStagger;
      this.transfer = this.timing.transfer;
      this.ramp = this.timing.ramp;
      this.initialRingAwake = this.ringAwake = this.lockStrength = this.wellStrength = 0;
      this.orbs.forEach((orb, index) => {
        const unit = i => random[index * 5 + i] / 4294967296;
        const scale = 6 + unit(1) * 2;
        orb.flight = {
          azimuth: unit(0) * TAU,
          depth: PERSPECTIVE * (1 - 1 / scale),
          startRadius: (.8 + .25 * unit(4)) / scale,
          swirlRadius: .37 + .13 * unit(4),
          tilt: .5 + unit(2) * .65,
          bank: (unit(4) - .5) * 1.2,
          turns: .85 + unit(3) * .65
        };
        orb.launchAngle = orb.anchor;
        orb.launchRadius = LOGO_TIP_RADIUS;
        orb.ringAngle = orb.ringStart = orb.anchor;
        orb.ringSpeed = 0;
      });
      this.setMode('capturing');
      this.update(now);
      requestOrbFrame();
    }

    resume(now) {
      if (this.paused || motionIsPaused() || document.hidden) return;
      this.epoch = now;
      this.captureEnd = this.ringAt = 0;
      this.initialRingAwake = this.ringAwake;
      this.launch = 180;
      this.launchStagger = 440;
      this.transfer = 1400;
      this.ramp = 2000;
      this.orbs.forEach(orb => {
        orb.launchAngle = Math.atan2(orb.y, orb.x);
        orb.launchRadius = Math.hypot(orb.x, orb.y);
        orb.ringStart = orb.ringAngle;
      });
      this.setMode('resuming');
      requestOrbFrame();
    }

    setPaused(value, now) {
      if (this.paused === value) return;
      if (value) {
        this.update(now);
        this.pausedAt = now;
        this.paused = true;
        // Reduced motion presents the finished readable mark; the manual pause
        // freezes a trajectory in place and resumes its exact clock later.
        this.reducedPause = motionQuery.matches;
        if (this.reducedPause && this.mode !== 'hidden') this.park();
      } else {
        this.paused = false;
        this.epoch += Math.max(0, now - this.pausedAt);
        if ((this.reducedPause || this.mode === 'parked') && this.mode !== 'hidden') this.resume(now);
        else requestOrbFrame();
        this.reducedPause = false;
      }
      this.root.dataset.motion = value ? 'paused' : 'running';
    }

    update(now) {
      if (this.paused || this.mode === 'hidden' || this.mode === 'parked') return false;
      const elapsed = Math.max(0, now - this.epoch);
      if (this.mode === 'aligning') {
        const blend = smooth(elapsed / this.duration);
        this.orbs.forEach(orb => {
          const x = dockAxis(orb.start.x, orb.start.vx, orb.tipX, elapsed, this.duration);
          const y = dockAxis(orb.start.y, orb.start.vy, orb.tipY, elapsed, this.duration);
          const ring = dockAxis(orb.start.ringAngle, orb.start.ringSpeed,
            orb.start.ringAngle + orb.start.ringSpeed * this.duration / 2, elapsed, this.duration);
          orb.x = x.position; orb.y = y.position; orb.vx = x.speed; orb.vy = y.speed;
          const scale = dockAxis(orb.start.scale, orb.start.vScale, 1, elapsed, orb.scaleDockMs);
          const depth = dockAxis(orb.start.depth, orb.start.vDepth, 0, elapsed, this.duration);
          orb.opacity = orb.start.opacity + (1 - orb.start.opacity) * blend;
          orb.scale = scale.position; orb.vScale = scale.speed;
          orb.depth = depth.position; orb.vDepth = depth.speed;
          orb.trail = orb.start.trail * (1 - blend);
          orb.ringAngle = ring.position; orb.ringSpeed = ring.speed;
        });
        this.wellStrength = this.alignWell * (1 - blend);
        this.lockStrength = blend;
        if (elapsed >= this.duration) {
          this.park();
          if (this.resumeAfterAlign) { this.resumeAfterAlign = false; this.resume(now); }
        }
      } else {
        const ringTime = Math.max(0, elapsed - this.ringAt);
        const ringProgress = clamp(ringTime / 1000);
        const ringTravel = ringTime <= 1000 ? 1000 * rampIntegral(ringProgress) : ringTime - 500;
        this.ringAwake = this.initialRingAwake + (1 - this.initialRingAwake) * smooth(ringTime / 320);
        this.wellStrength = this.captureEnd ? smooth(elapsed / 480) * (1 - smooth((elapsed - this.captureEnd + 650) / 650)) : 0;
        this.lockStrength = this.captureEnd ? smooth((elapsed - this.captureEnd + 380) / 380) * (1 - smooth(ringTime / 650)) : 1 - smooth(ringTime / 650);
        this.root.style.setProperty('--well-turn', `${(elapsed * .0007).toFixed(5)}rad`);
        this.orbs.forEach(orb => {
          orb.ringAngle = orb.ringStart + orb.rate * ringTravel * .8;
          orb.ringSpeed = orb.rate * smooth(ringProgress) * .8;
          const launchAt = this.launch + orb.rank * this.launchStagger;
          if (this.captureEnd && elapsed < launchAt) {
            const local = elapsed - orb.rank * this.timing.stagger;
            const duration = this.timing.flight + this.timing.capture;
            if (local >= duration) {
              this.place(orb, orb.anchor, 0, LOGO_TIP_RADIUS);
              orb.dot.dataset.orbStage = 'locked';
            } else {
              const pose = capturePose(orb, Math.max(0, local), this.timing, this.reach);
              const previous = capturePose(orb, Math.max(0, local - .5), this.timing, this.reach);
              const next = capturePose(orb, Math.max(0, local + .5), this.timing, this.reach);
              Object.assign(orb, pose);
              orb.vx = local < 0 ? 0 : next.x - previous.x;
              orb.vy = local < 0 ? 0 : next.y - previous.y;
              orb.vScale = local < 0 ? 0 : next.scale - previous.scale;
              orb.vDepth = local < 0 ? 0 : next.depth - previous.depth;
              orb.tailAngle = Math.atan2(-orb.vy, -orb.vx);
              orb.dot.dataset.orbStage = local < this.timing.flight ? 'flight' : 'capture';
            }
          } else {
            const movingFor = Math.max(0, elapsed - launchAt);
            const rampProgress = clamp(movingFor / this.ramp);
            const travel = movingFor <= this.ramp ? this.ramp * rampIntegral(rampProgress) : movingFor - this.ramp / 2;
            const transferProgress = clamp(movingFor / this.transfer);
            const radius = orb.launchRadius + (orb.radius - orb.launchRadius) * smooth(transferProgress);
            const u = transferProgress;
            const radialSpeed = (orb.radius - orb.launchRadius) * (30 * u * u - 60 * u * u * u + 30 * u * u * u * u) / this.transfer;
            this.place(orb, orb.launchAngle + orb.rate * travel, orb.rate * smooth(rampProgress), radius, radialSpeed);
            orb.dot.dataset.orbStage = movingFor >= this.ramp ? 'orbit' : movingFor ? 'release' : 'locked';
          }
        });
        if (this.captureEnd && elapsed < this.captureEnd) this.setMode('capturing');
        else if (this.captureEnd && elapsed < this.launch) this.setMode('locked');
        else if (elapsed < this.launch + this.launchStagger * 2 + this.ramp) this.setMode('releasing');
        else this.setMode('orbiting');
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

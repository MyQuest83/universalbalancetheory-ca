'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '..', 'gateway-intro.js'), 'utf8');

function scene(options = {}) {
  let clock = 0, sequence = 0, seed = options.seed || 17;
  const cancelled = new Set();
  const queue = [];
  const invalid = [];
  const schedule = (cb, delay, raf = false) => {
    const id = ++sequence;
    queue.push({ id, at: clock + Math.max(0, delay), cb, raf });
    return id;
  };
  function advance(ms) {
    const end = clock + ms;
    let count = 0;
    while (true) {
      queue.sort((a, b) => a.at - b.at || a.id - b.id);
      if (!queue.length || queue[0].at > end) break;
      const task = queue.shift();
      if (cancelled.has(task.id)) continue;
      clock = task.at;
      if (++count > 15000) throw Error('Unbounded task queue');
      task.cb(task.raf ? clock : undefined);
    }
    clock = end;
  }
  function el(classes = [], width = 220) {
    const names = new Set(classes);
    const listeners = {};
    const style = { setProperty(name, val) { this[name] = val; } };
    let transform = '';
    Object.defineProperty(style, 'transform', {
      get() { return transform; },
      set(value) {
        transform = String(value);
        if (/NaN|Infinity|scale\(-/.test(transform)) invalid.push(transform);
      }
    });
    const element = {
      clientWidth: width, clientHeight: width, dataset: {}, style,
      isConnected: true, inert: false, attrs: {},
      classList: {
        add(...xs) { xs.forEach(x => names.add(x)); },
        remove(...xs) { xs.forEach(x => names.delete(x)); },
        contains(x) { return names.has(x); },
        toggle(x, force) {
          const enabled = force === undefined ? !names.has(x) : Boolean(force);
          if (enabled) names.add(x); else names.delete(x);
          return enabled;
        }
      },
      setAttribute(key, value) { this.attrs[key] = String(value); },
      appendChild(child) { (this.children ||= []).push(child); return child; },
      getBoundingClientRect() {
        return { left: 78, top: 70, width: this.clientWidth, height: this.clientHeight };
      },
      closest(selector) {
        return selector === '.home-title' ? { getBoundingClientRect() { return { top: 0 }; } } : null;
      },
      addEventListener(name, handler) { (listeners[name] ||= []).push(handler); },
      emit(name, extra = {}) {
        for (const cb of listeners[name] || []) {
          cb(Object.assign({ currentTarget: element, preventDefault() {} }, extra));
        }
      },
      focus() { this.focusCount = (this.focusCount || 0) + 1; },
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    return element;
  }
  const colors = ['red', 'green', 'blue'];
  function orbRoot(classes, width) {
    const root = el(classes, width);
    root.lanes = colors.map(color => {
      const widthRatio = color === 'red' ? 1 : color === 'green' ? .68 : .36;
      const lane = el([classes[0] === 'triad-orbit' ? 'intro-lane' : 'orbit-lane', color], width * widthRatio);
      lane.color = color;
      lane.dot = el([color === 'red' ? 'node' : 'node']);
      lane.querySelector = selector => /node|intro-dot/.test(selector) ? lane.dot : null;
      return lane;
    });
    root.querySelectorAll = selector => /orbit-lane|intro-lane/.test(selector) ? root.lanes : [];
    return root;
  }
  const home = orbRoot(['home-sigil'], 220);
  const intro = orbRoot(['triad-orbit'], 156);
  const gate = el(['intro-gate'], 390);
  const copy = el(['intro-copy']);
  gate.clientHeight = 844;
  gate.querySelector = q => q === '.triad-orbit' ? intro : q === '.intro-copy' ? copy : null;
  const trigger = home, skipWarp = el(['warp-skip']), skipIntro = el(['intro-skip']);
  const body = el(['body']);
  const documentElement = el(['html']);
  const background = el(['background']);
  const events = {};
  const document = {
    hidden: false, body, documentElement,
    getElementById(id) {
      return ({ introGate: gate, gatewayWarp: el(['canvas']), skipWarp, skipIntro })[id] || null;
    },
    querySelectorAll(q) { return q === '[data-intro-trigger]' ? [trigger] : [background]; },
    createElement() { return el([]); },
    addEventListener(name, handler) { (events[name] ||= []).push(handler); },
    emit(name) { (events[name] || []).forEach(fn => fn({})); }
  };
  const mediaListeners = [];
  const media = {
    matches: Boolean(options.reduced),
    addEventListener(name, fn) { if (name === 'change') mediaListeners.push(fn); }
  };
  const windowListeners = {};
  const window = {
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
    matchMedia() { return media; },
    crypto: { getRandomValues(arr) {
      for (let i = 0; i < arr.length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        arr[i] = seed;
      }
      return arr;
    } },
    createUBTWarp() { return { resize() {}, draw() {}, dispose() {} }; },
    addEventListener(name, fn) { (windowListeners[name] ||= []).push(fn); },
    emit(name, event) { (windowListeners[name] || []).forEach(fn => fn(event || {})); }
  };
  const context = {
    window, document,
    performance: { now: () => clock },
    getComputedStyle(item) {
      if (item.color) {
        return { getPropertyValue(name) {
          const angle = { red: '150deg', green: '30deg', blue: '-90deg' };
          const rate = { red: '1.1547005383792517', green: '1.1381966011250105', blue: '1' };
          return name === '--start-angle' ? angle[item.color] : rate[item.color];
        } };
      }
      return { opacity: '1', clipPath: 'none', getPropertyValue() { return ''; } };
    },
    MutationObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: cb => schedule(cb, 16, true),
    cancelAnimationFrame: id => cancelled.add(id),
    setTimeout: (cb, ms) => schedule(cb, ms),
    clearTimeout: id => cancelled.add(id),
    Uint32Array, Math, Number
  };
  vm.runInNewContext(source, context, { filename: 'gateway-intro.js' });
  function untilPhase(want, limit = 16000) {
    for (let i = 0; i <= limit / 16; i++) {
      if (gate.dataset.phase === want) return;
      advance(16);
    }
    throw Error('Never reached phase ' + want + '; got ' + gate.dataset.phase);
  }
  return {
    home, intro, gate, body, document, window, trigger, skipWarp, skipIntro,
    advance, untilPhase, invalid,
    setReduced(val) { media.matches = val; mediaListeners.forEach(fn => fn()); },
    now() { return clock; }
  };
}

test('Intro shows no forming orbs, then begins formation on returned page', () => {
  const s = scene();
  assert.equal(s.home.dataset.orbState, 'capturing');
  assert.equal(s.intro.dataset.orbState, 'hidden');
  s.trigger.emit('click');
  s.untilPhase('warp');
  s.untilPhase('intro');
  assert.equal(s.intro.dataset.orbState, 'hidden');
  assert.ok(s.intro.lanes.every(l => Number(l.dot.style.opacity) === 0));
  s.untilPhase('closing');
  s.advance(730);
  assert.notEqual(s.gate.dataset.phase, 'idle');
  s.untilPhase('idle');
  assert.equal(s.gate.classList.contains('on'), false);
  s.advance(38);
  assert.equal(s.home.dataset.orbState, 'capturing');
  assert.equal(s.invalid.length, 0, 'all transforms remain finite and nonnegative');
});

test('Exact triangle-tip locking and staggered release survive random trajectories', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const s = scene({ seed });
    s.advance(4100);
    const size = s.home.clientWidth;
    for (const lane of s.home.lanes) {
      assert.equal(lane.dot.dataset.orbStage, 'locked');
      const match = /translate3d\(([-\d.]+)px, ([-\d.]+)px, 0\)/.exec(lane.dot.style.transform);
      assert.ok(match, lane.color + ' has a rendered position');
      const angle = { red: 150, green: 30, blue: -90 }[lane.color] * Math.PI / 180;
      const r = .66 * 128 / 320 * size;
      assert.ok(Math.abs(Number(match[1]) - r * Math.cos(angle)) < .002, 'tip x');
      assert.ok(Math.abs(Number(match[2]) - r * Math.sin(angle)) < .002, 'tip y');
    }
    s.advance(1500);
    const stages = Object.fromEntries(s.home.lanes.map(l => [l.color, l.dot.dataset.orbStage]));
    assert.equal(stages.blue, 'release');
    assert.equal(stages.green, 'locked');
    assert.equal(stages.red, 'locked');
    s.advance(5500);
    assert.ok(s.home.lanes.every(l => l.dot.dataset.orbStage === 'orbit'));
    assert.equal(s.invalid.length, 0, 'no NaN, infinity or negative scale');
  }
});

test('Early skip closes before new home orbs begin forming', () => {
  const s = scene();
  s.trigger.emit('click');
  s.skipWarp.emit('click');
  s.untilPhase('idle', 1600);
  assert.equal(s.home.dataset.orbState, 'hidden');
  s.advance(38);
  assert.equal(s.home.dataset.orbState, 'capturing');
  assert.equal(s.intro.dataset.orbState, 'hidden');
});

test('A hidden tab during intro waits until visible to launch new orbs', () => {
  const s = scene();
  s.trigger.emit('click');
  s.advance(350);
  s.document.hidden = true;
  s.document.emit('visibilitychange');
  assert.equal(s.gate.dataset.phase, 'idle');
  s.advance(1000);
  assert.equal(s.home.dataset.orbState, 'parked');
  s.document.hidden = false;
  s.document.emit('visibilitychange');
  s.advance(40);
  assert.equal(s.home.dataset.orbState, 'capturing');
});

test('A hidden tab during the post-intro paint gap still launches on return', () => {
  const s = scene();
  s.trigger.emit('click');
  s.skipWarp.emit('click');
  s.untilPhase('idle', 1600);
  s.document.hidden = true;
  s.document.emit('visibilitychange');
  s.advance(500);
  s.document.hidden = false;
  s.document.emit('visibilitychange');
  s.advance(40);
  assert.equal(s.home.dataset.orbState, 'capturing');
});

test('Back-forward cache return after interrupted intro restarts formation', () => {
  const s = scene();
  s.trigger.emit('click');
  s.window.emit('pagehide');
  assert.equal(s.home.dataset.orbState, 'parked');
  s.window.emit('pageshow', { persisted: true });
  s.advance(40);
  assert.equal(s.home.dataset.orbState, 'capturing');
});

test('Reduced-motion intro does not wait through a motionless seven-second warp', () => {
  const s = scene({ reduced: true });
  assert.equal(s.home.dataset.orbState, 'parked');
  s.trigger.emit('click');
  assert.equal(s.gate.dataset.phase, 'warp');
  s.advance(260);
  assert.equal(s.gate.dataset.phase, 'intro');
  assert.equal(s.intro.dataset.orbState, 'hidden');
  s.untilPhase('idle', 8000);
  assert.equal(s.home.dataset.orbState, 'parked');
});

test('Enabling reduced motion mid-warp advances directly to readable intro', () => {
  const s = scene();
  s.trigger.emit('click');
  s.untilPhase('warp');
  s.setReduced(true);
  assert.equal(s.gate.dataset.phase, 'intro');
  assert.equal(s.intro.dataset.orbState, 'hidden');
});

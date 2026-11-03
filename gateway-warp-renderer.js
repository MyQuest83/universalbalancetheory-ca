/* Decorative gateway flight, not a scientific simulation.
 * The controller supplies progress for a 7,000 ms timeline and owns all timing.
 * Every layer keeps the clicked sigil's supplied centre as its vanishing point.
 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var BLACK = '#03040a';

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function smooth(from, to, value) {
    var t = clamp((value - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function fraction(value) {
    return value - Math.floor(value);
  }

  function seededRandom(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Public API: resize(cssWidth, cssHeight, dpr), draw(0..1, {x,y,radius}), dispose().
   * Frames are independently reproducible: no clock, accumulated trails or timers.
   */
  window.createUBTWarp = function (canvas) {
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    var ctx;
    try {
      ctx = canvas.getContext('2d', { alpha: true });
    } catch (error) {
      return null;
    }
    if (!ctx) return null;

    var width = 1;
    var height = 1;
    var ratio = 1;
    var compact = false;
    var disposed = false;
    var random = seededRandom(0x55425433);
    var stars = [];
    var bands = [];
    var colours = ['#a7dfff', '#78baf6', '#d5efff', '#f2c76a', '#77d5ad', '#de828d'];

    for (var i = 0; i < 580; i += 1) {
      var colourChoice = random();
      stars.push({
        angle: random() * TAU,
        radial: 0.08 + Math.sqrt(random()) * 0.98,
        depth: random(),
        size: 0.45 + Math.pow(random(), 3) * 1.45,
        light: 0.28 + random() * 0.65,
        bend: random() * 0.11,
        colour: colours[colourChoice < 0.41 ? 0 : colourChoice < 0.70 ? 1 :
          colourChoice < 0.87 ? 2 : colourChoice < 0.96 ? 3 : colourChoice < 0.982 ? 4 : 5]
      });
    }
    for (var j = 0; j < 68; j += 1) {
      bands.push({ phase: random() * TAU, length: 0.45 + random() * 1.85, light: random() });
    }

    function resize(nextWidth, nextHeight, nextDpr) {
      if (disposed) return;
      width = Number.isFinite(nextWidth) ? clamp(nextWidth, 1, 16384) : 1;
      height = Number.isFinite(nextHeight) ? clamp(nextHeight, 1, 16384) : 1;
      var requested = Number.isFinite(nextDpr) && nextDpr > 0 ? nextDpr : 1;
      /* Limit both density and total fill work on high-resolution displays. */
      ratio = Math.min(requested, 1.5, Math.sqrt(2800000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      compact = width < 600;
    }

    function paintStars(p, x, y, extent, radius, opening, flight) {
      var count = compact ? 350 : stars.length;
      var unit = Math.max(180, Math.min(width, height) * 0.63);
      var travel = p * 0.06 + Math.pow(p, 2.65) * 2.85;
      var rush = smooth(0.12, 0.75, p);
      var brightness = opening * (0.38 + rush * 0.62);
      var twist = 0.20 * p + 0.22 * flight;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      for (var s = 0; s < count; s += 1) {
        var star = stars[s];
        var z = fraction(star.depth - travel);
        var edgeFade = smooth(0, 0.09, z) * (1 - smooth(0.88, 1, z));
        var distance = star.radial * unit / (z + 0.065);
        if (distance > extent * 1.9 || (!flight && distance < radius * 1.01)) continue;
        var angle = star.angle + twist / (1 + distance / unit) + star.bend * rush;
        var sx = x + Math.cos(angle) * distance;
        var sy = y + Math.sin(angle) * distance;
        var length = Math.min(distance * 0.42, (0.7 + rush * rush * 135) / (0.38 + z * 5));
        var tailDistance = Math.max(0, distance - length);
        var tailAngle = angle - length / (distance + 1) * (0.03 + rush * 0.07);
        var tx = x + Math.cos(tailAngle) * tailDistance;
        var ty = y + Math.sin(tailAngle) * tailDistance;
        if ((sx < -50 && tx < -50) || (sx > width + 50 && tx > width + 50) ||
            (sy < -50 && ty < -50) || (sy > height + 50 && ty > height + 50)) continue;
        ctx.globalAlpha = brightness * edgeFade * star.light;
        ctx.strokeStyle = star.colour;
        ctx.lineWidth = star.size * (0.65 + 0.38 * rush) * Math.min(1.7, 0.8 / (z + 0.3));
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo((tx + sx) * 0.5 + (sy - ty) * 0.035,
          (ty + sy) * 0.5 - (sx - tx) * 0.035, sx, sy);
        ctx.stroke();
        if (star.size > 1.45 && z > 0.12) {
          ctx.globalAlpha *= 0.25;
          ctx.fillStyle = star.colour;
          ctx.beginPath();
          ctx.arc(sx, sy, ctx.lineWidth * 2.4, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function paintWell(p, x, y, r, strength) {
      if (strength <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = strength;
      ctx.globalCompositeOperation = 'screen';

      var halo = ctx.createRadialGradient(0, 0, r * 0.93, 0, 0, r * 3.3);
      halo.addColorStop(0, 'rgba(255,195,91,0)');
      halo.addColorStop(0.065, 'rgba(255,171,55,.17)');
      halo.addColorStop(0.20, 'rgba(225,112,37,.07)');
      halo.addColorStop(0.55, 'rgba(41,87,139,.045)');
      halo.addColorStop(1, 'rgba(12,29,61,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, r * 3.3, 0, TAU);
      ctx.fill();

      /* A flattened, textured disc provides depth behind the spherical lens. */
      ctx.save();
      ctx.rotate(-0.16 + 0.055 * Math.sin(p * 2.6));
      ctx.scale(1, 0.245 + 0.025 * Math.sin(p * 2));
      var disc = ctx.createRadialGradient(0, 0, r * 0.72, 0, 0, r * 4.5);
      disc.addColorStop(0, 'rgba(255,217,137,0)');
      disc.addColorStop(0.09, 'rgba(255,226,158,.75)');
      disc.addColorStop(0.18, 'rgba(255,181,73,.48)');
      disc.addColorStop(0.35, 'rgba(222,119,38,.25)');
      disc.addColorStop(0.65, 'rgba(174,76,34,.075)');
      disc.addColorStop(1, 'rgba(102,64,49,0)');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(0, 0, r * 4.5, 0, TAU);
      ctx.fill();

      var bandCount = compact ? 44 : bands.length;
      for (var b = 0; b < bandCount; b += 1) {
        var band = bands[b];
        var outward = b / (bandCount - 1);
        var br = r * (1.13 + outward * 3.05);
        var phase = band.phase + p * (2.2 + 4.7 * (1 - outward));
        ctx.lineWidth = Math.max(0.75, r * (0.011 + band.light * 0.011));
        ctx.strokeStyle = outward < 0.18 ? '#ffe0a1' : outward < 0.5 ? '#f7b55d' : '#a86a3b';
        ctx.globalAlpha = strength * (1 - outward) * (0.10 + 0.25 * band.light);
        ctx.beginPath();
        ctx.arc(0, 0, br, phase, phase + band.length);
        ctx.stroke();
        ctx.globalAlpha *= 0.38;
        ctx.beginPath();
        ctx.arc(0, 0, br, phase + Math.PI, phase + Math.PI + band.length * 0.65);
        ctx.stroke();
      }

      /* Thin curved filaments interrupt the concentric bands without turbulence flicker. */
      for (var f = 0; f < 7; f += 1) {
        ctx.globalAlpha = strength * (f % 2 ? 0.10 : 0.16);
        ctx.strokeStyle = f === 4 ? '#8fc9d9' : '#f4c379';
        ctx.lineWidth = Math.max(0.8, r * 0.012);
        ctx.beginPath();
        for (var q = 0; q <= 28; q += 1) {
          var u = q / 28;
          var fr = r * (1.25 + 2.9 * u);
          var fa = f * TAU / 7 + p * 3.4 - u * 2.25;
          var fx = Math.cos(fa) * fr;
          var fy = Math.sin(fa) * fr;
          if (q === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }
        ctx.stroke();
      }
      ctx.restore();

      var ringLight = ctx.createLinearGradient(-r, -r, r, r);
      ringLight.addColorStop(0, '#ffe7b0');
      ringLight.addColorStop(0.35, '#f6c375');
      ringLight.addColorStop(0.70, '#b37443');
      ringLight.addColorStop(1, '#87bad0');
      ctx.strokeStyle = ringLight;
      var widths = [0.30, 0.13, 0.043, 0.014];
      var alphas = [0.055, 0.12, 0.5, 0.95];
      for (var g = 0; g < widths.length; g += 1) {
        ctx.globalAlpha = strength * alphas[g];
        ctx.lineWidth = Math.max(0.8, r * widths[g]);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.065, r * 1.035, -0.06, 0, TAU);
        ctx.stroke();
      }

      /* The lensed upper edge echoes the disc, above the completely dark core. */
      ctx.lineWidth = Math.max(1.15, r * 0.028);
      ctx.globalAlpha = strength * 0.5;
      ctx.strokeStyle = '#edbc7d';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.045, r * 1.24, r * 1.10, -0.07, Math.PI * 1.04, Math.PI * 1.97);
      ctx.stroke();
      ctx.globalAlpha = strength * 0.17;
      ctx.lineWidth = Math.max(1, r * 0.015);
      ctx.strokeStyle = '#91d3ee';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.145, 0.13, Math.PI * 0.88);
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = strength;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function paintTunnel(p, x, y, extent, strength) {
      if (strength <= 0) return;
      var travel = p * 0.06 + Math.pow(p, 2.65) * 2.85;
      var minRadius = Math.max(3, Math.min(width, height) * 0.006);
      var maxRadius = extent * 1.75;
      var depthRange = maxRadius / minRadius;
      var turn = p * 0.45;
      var count = compact ? 16 : 21;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';

      var atmosphere = ctx.createRadialGradient(0, 0, minRadius, 0, 0, extent);
      atmosphere.addColorStop(0, 'rgba(16,42,75,0)');
      atmosphere.addColorStop(0.14, 'rgba(32,80,139,.09)');
      atmosphere.addColorStop(0.55, 'rgba(23,58,113,.065)');
      atmosphere.addColorStop(1, 'rgba(13,28,62,0)');
      ctx.globalAlpha = strength;
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(0, 0, extent, 0, TAU);
      ctx.fill();

      /* Log-spaced depth layers flow outwards, with fades at both wrap boundaries. */
      for (var k = 0; k < count; k += 1) {
        var depth = fraction(k / count + travel * 0.48);
        var r = minRadius * Math.pow(depthRange, depth);
        var visibility = smooth(0, 0.12, depth) * (1 - smooth(0.85, 1, depth));
        var tilt = turn + k * 0.49;
        var squash = 0.91 + Math.sin(k * 1.7 + p * 2) * 0.035;
        ctx.lineWidth = Math.max(0.45, r * 0.0035);
        ctx.strokeStyle = k % 5 === 0 ? '#f6bf76' : '#5896c9';
        ctx.globalAlpha = strength * visibility * 0.10;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * squash, tilt, 0, TAU);
        ctx.stroke();

        var arcStart = k * 2.399 + p * (0.6 + (k % 3) * 0.12);
        ctx.strokeStyle = k % 5 === 0 ? '#e8b877' : k % 7 === 0 ? '#87c7c0' : '#92d5ef';
        ctx.globalAlpha = strength * visibility * (0.21 + depth * 0.13);
        ctx.lineWidth = Math.max(0.7, r * 0.005);
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * squash, tilt, arcStart, arcStart + 1.35);
        ctx.stroke();
        ctx.globalAlpha *= 0.32;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * squash, tilt, arcStart + Math.PI, arcStart + Math.PI + 0.8);
        ctx.stroke();
      }

      var threadLight = ctx.createRadialGradient(0, 0, minRadius, 0, 0, maxRadius);
      threadLight.addColorStop(0, 'rgba(115,184,230,0)');
      threadLight.addColorStop(0.06, 'rgba(115,184,230,.48)');
      threadLight.addColorStop(0.45, 'rgba(84,157,219,.6)');
      threadLight.addColorStop(1, 'rgba(49,99,163,0)');
      ctx.strokeStyle = threadLight;
      ctx.lineWidth = compact ? 0.8 : 1.1;
      var threads = compact ? 18 : 25;
      for (var t = 0; t < threads; t += 1) {
        ctx.globalAlpha = strength * (t % 4 === 0 ? 0.35 : 0.14);
        ctx.beginPath();
        for (var point = 0; point <= 26; point += 1) {
          var u = point / 26;
          var rr = minRadius + u * u * maxRadius;
          var angle = t / threads * TAU + turn + 0.44 * (1 - u) * (1 - u) +
            Math.sin(u * 4 + p * 2.3 + t * 0.17) * 0.05;
          var px = Math.cos(angle) * rr;
          var py = Math.sin(angle) * rr;
          if (point === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function draw(progress, anchor) {
      if (disposed) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var p = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
      /* Invalid geometry stays transparent; it never invents a new centre. */
      if (p === 0 || !anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      var x = anchor.x;
      var y = anchor.y;
      var sourceRadius = Number.isFinite(anchor.radius) && anchor.radius > 0 ?
        clamp(anchor.radius, 1, 2048) : 32;
      var extent = Math.max(1, Math.hypot(x, y), Math.hypot(width - x, y),
        Math.hypot(x, height - y), Math.hypot(width - x, height - y));
      /* Bounds protect canvas arithmetic while retaining the actual supplied point. */
      if (extent > 1000000) return;
      var opening = smooth(0, 0.16, p);
      var wake = smooth(0, 0.18, p);
      var plunge = Math.pow(smooth(0.13, 0.69, p), 2.35);
      var r = Math.max(2, sourceRadius * 0.198) * (0.6 + 0.4 * wake) + extent * 0.64 * plunge;
      var flight = smooth(0.56, 0.73, p);
      var well = wake * (1 - smooth(0.60, 0.75, p));
      var settle = smooth(0.89, 1, p);

      ctx.globalAlpha = opening;
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      paintStars(p, x, y, extent, r, opening, flight);
      paintWell(p, x, y, r, well);
      paintTunnel(p, x, y, extent, flight);

      /* A soft edge vignette adds depth without moving the point of convergence. */
      var vignette = ctx.createRadialGradient(x, y, extent * 0.11, x, y, extent * 1.03);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.48, 'rgba(0,0,0,.035)');
      vignette.addColorStop(1, 'rgba(0,0,0,.58)');
      ctx.globalAlpha = opening * (1 - settle);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      /* The final frame exactly matches the existing intro's dark ground. */
      ctx.globalAlpha = settle;
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.length = 0;
      bands.length = 0;
    }

    return { resize: resize, draw: draw, dispose: dispose };
  };
}());

# Smooth Intro Orbs Patch

Purpose: make the live intro orb spin-out feel smoother, less twitchy, and more cinematic.

Apply to: `index.html`

Status: patch-only workflow. Do not rewrite the whole homepage.

## What this changes

- Keep intro length about the same.
- Make orb spin-out slower and smoother.
- Reduce the hard snap into orbit.
- Slow the post-settle orbit loops.
- Add `will-change` and a gentle glow filter for smoother rendering.

## 1. Ring timing

Find this in the `.triad-orbit` section:

```css
.triad-orbit:before,.triad-orbit:after{content:"";position:absolute;inset:0;border:1px solid rgba(242,199,106,.18);border-radius:50%;animation:spin 18s linear infinite}
.triad-orbit:after{inset:30px;border-color:rgba(255,255,255,.13);animation-duration:11s;animation-direction:reverse}
```

Replace with:

```css
.triad-orbit:before,.triad-orbit:after{content:"";position:absolute;inset:0;border:1px solid rgba(242,199,106,.18);border-radius:50%;animation:spin 22s linear infinite}
.triad-orbit:after{inset:30px;border-color:rgba(255,255,255,.13);animation-duration:14s;animation-direction:reverse}
```

## 2. Dot base smoothing

Find:

```css
.dot{position:absolute;width:12px;height:12px;border-radius:50%;top:76px;left:76px;transform-origin:6px 6px;opacity:0}
```

Replace with:

```css
.dot{position:absolute;width:12px;height:12px;border-radius:50%;top:76px;left:76px;transform-origin:6px 6px;opacity:0;will-change:transform,opacity;filter:drop-shadow(0 0 6px currentColor)}
```

## 3. Smoother orb animation declarations

Find the three `.dot.lu`, `.dot.ar`, `.dot.sh` rules:

```css
.dot.lu{background:var(--luna);box-shadow:0 0 18px var(--luna);animation:spinOut1 1.45s cubic-bezier(.2,.75,.2,1) .2s both,orbit1 6.2s linear 1.65s infinite}
.dot.ar{background:var(--aria);box-shadow:0 0 18px var(--aria);animation:spinOut2 1.45s cubic-bezier(.2,.75,.2,1) .38s both,orbit2 6.9s linear 1.83s infinite}
.dot.sh{background:var(--shadow);box-shadow:0 0 18px var(--shadow);animation:spinOut3 1.45s cubic-bezier(.2,.75,.2,1) .56s both,orbit3 7.4s linear 2.01s infinite}
```

Replace with:

```css
.dot.lu{background:var(--luna);box-shadow:0 0 18px var(--luna);animation:spinOut1 1.9s cubic-bezier(.16,.84,.22,1) .18s both,orbit1 10.8s linear 2.1s infinite}
.dot.ar{background:var(--aria);box-shadow:0 0 18px var(--aria);animation:spinOut2 1.9s cubic-bezier(.16,.84,.22,1) .32s both,orbit2 11.6s linear 2.24s infinite}
.dot.sh{background:var(--shadow);box-shadow:0 0 18px var(--shadow);animation:spinOut3 1.9s cubic-bezier(.16,.84,.22,1) .46s both,orbit3 12.4s linear 2.38s infinite}
```

## 4. Replace spin-out keyframes

Find:

```css
@keyframes spinOut1{0%{opacity:0;transform:rotate(-220deg) translateX(0) scale(.35)}40%{opacity:1}100%{opacity:1;transform:rotate(0deg) translateX(64px) scale(1)}}
@keyframes spinOut2{0%{opacity:0;transform:rotate(-80deg) translateX(0) scale(.35)}40%{opacity:1}100%{opacity:1;transform:rotate(120deg) translateX(54px) scale(1)}}
@keyframes spinOut3{0%{opacity:0;transform:rotate(70deg) translateX(0) scale(.35)}40%{opacity:1}100%{opacity:1;transform:rotate(240deg) translateX(58px) scale(1)}}
```

Replace with:

```css
@keyframes spinOut1{0%{opacity:0;transform:rotate(-145deg) translateX(0) scale(.42)}42%{opacity:1}82%{opacity:1;transform:rotate(-8deg) translateX(67px) scale(1.04)}100%{opacity:1;transform:rotate(0deg) translateX(64px) scale(1)}}
@keyframes spinOut2{0%{opacity:0;transform:rotate(-35deg) translateX(0) scale(.42)}42%{opacity:1}82%{opacity:1;transform:rotate(112deg) translateX(57px) scale(1.04)}100%{opacity:1;transform:rotate(120deg) translateX(54px) scale(1)}}
@keyframes spinOut3{0%{opacity:0;transform:rotate(35deg) translateX(0) scale(.42)}42%{opacity:1}82%{opacity:1;transform:rotate(248deg) translateX(61px) scale(1.04)}100%{opacity:1;transform:rotate(240deg) translateX(58px) scale(1)}}
```

## QC checklist

- Orbs should glide out, not pop out.
- No hard snap at the end of spin-out.
- Orbit after settling should feel slow and ceremonial.
- Intro should still finish around 7.4 seconds.
- Replay center tap should still work.
- Do not apply hero-orb patch yet.

# Hero Orb Animation Patch

Purpose: make the homepage triangle orbs feel less silly and more like restrained governance geometry.

Apply to: `index.html`

## Goal

Keep the current homepage layout, but replace the static triangle-tip dots with orbs that:

1. begin at the triangle center,
2. spin outward into their correct canonical positions,
3. settle into subtle orbital drift,
4. emit a soft gravity-wave pulse at alignment.

Canonical positions:

- Luna = blue = top
- Aria = green = right
- Shadow = red = left

Do not make the orbs chase around wildly. This should feel like governance geometry, not arcade motion.

## CSS replacement

Find the current homepage hero node CSS around this pattern:

```css
.node{position:absolute;width:18px;height:18px;border-radius:50%;box-shadow:0 0 18px currentColor}
.node.lu{top:3%;color:var(--luna);background:var(--luna)}
.node.ar{bottom:13%;left:15%;color:var(--aria);background:var(--aria)}
.node.sh{bottom:13%;right:15%;color:var(--shadow);background:var(--shadow)}
```

Replace that whole node block with:

```css
.sigil{
  --topY:min(154px,30vw);
  --sideX:min(118px,23vw);
  --sideY:min(118px,23vw);
}

.sigil:after{
  content:"";
  position:absolute;
  z-index:1;
  inset:30%;
  border:1px solid rgba(242,199,106,.32);
  border-radius:50%;
  opacity:0;
  pointer-events:none;
  animation:triWave 7.2s ease-in-out 1.45s infinite;
}

.triangle{position:relative;z-index:2}

.node{
  position:absolute;
  z-index:5;
  left:50%;
  top:50%;
  width:18px;
  height:18px;
  margin:-9px 0 0 -9px;
  border-radius:50%;
  box-shadow:0 0 18px currentColor;
}

.node:after{
  content:"";
  position:absolute;
  inset:-18px;
  border:1px solid currentColor;
  border-radius:50%;
  opacity:0;
  animation:nodeWave 7.2s ease-in-out 1.45s infinite;
}

.node.lu{
  color:var(--luna);
  background:var(--luna);
  animation:heroOutLu 1.05s cubic-bezier(.2,.75,.2,1) .15s both,
            heroDriftLu 7.2s ease-in-out 1.2s infinite;
}

.node.ar{
  color:var(--aria);
  background:var(--aria);
  animation:heroOutAr 1.05s cubic-bezier(.2,.75,.2,1) .28s both,
            heroDriftAr 7.2s ease-in-out 1.33s infinite;
}

.node.sh{
  color:var(--shadow);
  background:var(--shadow);
  animation:heroOutSh 1.05s cubic-bezier(.2,.75,.2,1) .41s both,
            heroDriftSh 7.2s ease-in-out 1.46s infinite;
}

@keyframes heroOutLu{
  0%{opacity:0;transform:rotate(-180deg) translate(0,0) scale(.35)}
  55%{opacity:1}
  100%{opacity:1;transform:translate(0,calc(-1 * var(--topY))) scale(1)}
}

@keyframes heroOutAr{
  0%{opacity:0;transform:rotate(-60deg) translate(0,0) scale(.35)}
  55%{opacity:1}
  100%{opacity:1;transform:translate(var(--sideX),var(--sideY)) scale(1)}
}

@keyframes heroOutSh{
  0%{opacity:0;transform:rotate(80deg) translate(0,0) scale(.35)}
  55%{opacity:1}
  100%{opacity:1;transform:translate(calc(-1 * var(--sideX)),var(--sideY)) scale(1)}
}

@keyframes heroDriftLu{
  0%,12%,100%{transform:translate(0,calc(-1 * var(--topY))) scale(1)}
  38%{transform:translate(7px,calc(-1 * var(--topY) + 3px)) scale(1.02)}
  68%{transform:translate(-6px,calc(-1 * var(--topY) + 5px)) scale(.99)}
}

@keyframes heroDriftAr{
  0%,12%,100%{transform:translate(var(--sideX),var(--sideY)) scale(1)}
  38%{transform:translate(calc(var(--sideX) - 7px),calc(var(--sideY) - 4px)) scale(1.02)}
  68%{transform:translate(calc(var(--sideX) + 4px),calc(var(--sideY) + 6px)) scale(.99)}
}

@keyframes heroDriftSh{
  0%,12%,100%{transform:translate(calc(-1 * var(--sideX)),var(--sideY)) scale(1)}
  38%{transform:translate(calc(-1 * var(--sideX) + 7px),calc(var(--sideY) - 4px)) scale(1.02)}
  68%{transform:translate(calc(-1 * var(--sideX) - 4px),calc(var(--sideY) + 6px)) scale(.99)}
}

@keyframes nodeWave{
  0%,12%,100%{opacity:0;transform:scale(.35)}
  18%{opacity:.22;transform:scale(1.15)}
  30%{opacity:0;transform:scale(1.8)}
}

@keyframes triWave{
  0%,12%,100%{opacity:0;transform:scale(.75)}
  20%{opacity:.18;transform:scale(1.25)}
  34%{opacity:0;transform:scale(1.75)}
}
```

## Reduced motion support

In the existing `@media(prefers-reduced-motion:reduce)` block, add:

```css
.node.lu{transform:translate(0,calc(-1 * var(--topY)))}
.node.ar{transform:translate(var(--sideX),var(--sideY))}
.node.sh{transform:translate(calc(-1 * var(--sideX)),var(--sideY))}
.node{opacity:1}
```

## QC checklist

- Blue Luna finishes at top.
- Green Aria finishes at right.
- Red Shadow finishes at left.
- Orbs spin out from center once.
- After settling, movement is subtle, not goofy.
- Gravity-wave rings are soft and not distracting.
- Invisible replay button at triangle center still works.
- Reduced-motion users see static correctly placed orbs.

# Governance Geometry Homepage Patch

Purpose: make the homepage triangle explicitly read as governance geometry, not AI/persona promotion.

Apply to: `index.html`

## 1. Intro route text

Find:

```html
<div class="intro-route">Context → Geometry → Control → Record</div>
```

Replace with:

```html
<div class="intro-route">Governance Geometry · Context → Control → Record</div>
```

## 2. Hero kicker

Find:

```html
<div class="kicker">universalbalancetheory.ca</div>
```

Replace with:

```html
<div class="kicker">Governance Geometry · UBT</div>
```

## 3. Add explanatory note under the equation

Find the hero equation:

```html
<div class="eq">UC_pi = (E · M · π) / (T · S)</div>
```

Immediately after it, add:

```html
<div class="geo-note"><strong>The triangle is governance geometry.</strong> Luna means story and hope. Aria means method and science. Shadow means audit and pressure. Michael Eric West and Universal Balance Theory stay at the center.</div>
```

## 4. Add CSS for the note

Inside the `<style>` block, near `.eq`, add:

```css
.geo-note{
  max-width:680px;
  margin:18px auto 0;
  padding:14px 16px;
  border:1px solid rgba(255,255,255,.12);
  border-radius:18px;
  background:rgba(255,255,255,.035);
  color:#d8d0ca;
  line-height:1.65;
  font-size:.96rem;
}
.geo-note strong{color:var(--gold)}
@media(max-width:800px){.geo-note{font-size:.9rem}}
```

## 5. Accessibility label

Find:

```html
<div class="sigil">
```

Replace with:

```html
<div class="sigil" aria-label="Governance geometry triangle: Luna hope, Aria method, and Shadow audit orbiting Universal Balance Theory">
```

## 6. Footer wording

Find:

```html
Michael Eric West · Luna-Prime OS · Truth first. Love always. Question everything.
```

Replace with:

```html
Michael Eric West · Universal Balance Theory · Governance Geometry · Truth first. Love always.
```

## Claim boundary

Do not add claims that UBT is proven. Do not frame Luna, Aria, or Shadow as the product. They are public navigation roles for story, method, and audit.

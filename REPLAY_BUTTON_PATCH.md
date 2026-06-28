# Replay intro button patch

Goal: add a subtle replay button in the center of the homepage triangle/sigil.

Add this button inside the `.sigil` element in `index.html`, near the triangle SVG:

```html
<button class="replayCore" id="replayIntro" aria-label="Replay opening animation" title="Replay intro">↻</button>
```

Add this CSS near the existing `.node` styles:

```css
.replayCore{
  position:absolute;
  z-index:6;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  width:54px;
  height:54px;
  border-radius:50%;
  border:1px solid rgba(242,199,106,.18);
  background:radial-gradient(circle,rgba(242,199,106,.12),rgba(3,4,10,.14));
  color:rgba(242,199,106,.55);
  font-size:1.05rem;
  cursor:pointer;
  opacity:.18;
  transition:opacity .2s ease,transform .2s ease,border-color .2s ease;
}
.sigil:hover .replayCore,.replayCore:focus{
  opacity:1;
  transform:translate(-50%,-50%) scale(1.04);
  border-color:rgba(242,199,106,.55);
  outline:none;
}
@media(max-width:800px){.replayCore{opacity:.36}}
```

Add this JavaScript inside the existing homepage script, after `finish()` is defined:

```js
const replay=document.getElementById('replayIntro');
function replayIntro(){
  if(reduced||!intro)return;
  try{localStorage.removeItem('ubtIntroSeen')}catch(e){}
  clearTimeout(timer);
  gate.classList.remove('open');
  intro.classList.remove('hide');
  intro.style.display='grid';
  void intro.offsetWidth;
  timer=setTimeout(finish,2600);
}
if(replay)replay.addEventListener('click',replayIntro);
```

Also add `let timer=null;` near the top of the homepage script, then replace existing intro timeout calls with `timer=setTimeout(...)` where appropriate.

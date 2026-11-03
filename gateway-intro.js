(function(){
  const intro=document.getElementById('introGate');
  const skip=document.getElementById('skipIntro');
  const triggers=document.querySelectorAll('[data-intro-trigger]');
  const background=[document.querySelector('.site-header'),document.querySelector('main'),document.querySelector('footer')].filter(Boolean);
  let timer=null;
  let lastTrigger=null;
  function setBackgroundInert(value){
    background.forEach(node=>{node.inert=value;});
  }
  function closeIntro(){
    if(!intro||!intro.classList.contains('on'))return;
    clearTimeout(timer);
    intro.classList.add('hide');
    window.setTimeout(()=>{
      intro.classList.remove('on','open','hide');
      intro.setAttribute('aria-hidden','true');
      document.body.classList.remove('intro-open');
      setBackgroundInert(false);
      if(lastTrigger)lastTrigger.focus();
    },780);
  }
  function playIntro(event){
    if(event){event.preventDefault();lastTrigger=event.currentTarget;}
    if(!intro)return;
    clearTimeout(timer);
    intro.classList.remove('hide','open');
    intro.classList.add('on');
    intro.setAttribute('aria-hidden','false');
    document.body.classList.add('intro-open');
    setBackgroundInert(true);
    window.setTimeout(()=>{
      intro.classList.add('open');
      if(skip)skip.focus();
    },80);
    timer=window.setTimeout(closeIntro,4200);
  }
  triggers.forEach(trigger=>trigger.addEventListener('click',playIntro));
  if(skip)skip.addEventListener('click',closeIntro);
  document.addEventListener('keydown',event=>{
    if(!intro||!intro.classList.contains('on'))return;
    if(event.key==='Escape'){event.preventDefault();closeIntro();return;}
    if(event.key==='Tab'&&skip){event.preventDefault();skip.focus();}
  });
})();

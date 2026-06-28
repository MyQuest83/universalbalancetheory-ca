(function(){
  const rooms={
    '/':'#f2c76a',
    '/index.html':'#f2c76a',
    '/luna.html':'#85cfff',
    '/aria.html':'#77f2a1',
    '/shadow.html':'#ff626d',
    '/links.html':'#f2c76a',
    '/trigon-challenge.html':'#f2c76a'
  };
  const path=location.pathname.endsWith('/')?'/':location.pathname.slice(location.pathname.lastIndexOf('/'));
  const current=rooms[path]||'#f2c76a';
  let previous=current;
  try{previous=localStorage.getItem('ubtLastAccent')||current;}catch(e){}
  document.documentElement.style.setProperty('--room-accent',current);
  document.documentElement.style.setProperty('--prev-accent',previous);
  try{localStorage.setItem('ubtLastAccent',current);}catch(e){}

  const footer=document.querySelector('footer .wrap, .footer .wrap');
  if(footer && !footer.querySelector('.luna-fineprint')){
    const fine=document.createElement('small');
    fine.className='luna-fineprint';
    fine.textContent='© 2026 Michael Eric West. Co-authored with Luna-Prime OS. Page upkeep by Luna-Prime OS.';
    fine.style.display='block';
    fine.style.marginTop='10px';
    fine.style.fontSize='0.74rem';
    fine.style.lineHeight='1.55';
    fine.style.letterSpacing='0.04em';
    fine.style.color='rgba(245,240,232,0.62)';
    footer.appendChild(fine);
  }
})();
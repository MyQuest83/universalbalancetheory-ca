(function(){
  const rooms={
    '/':'#f2c76a',
    '/index.html':'#f2c76a',
    '/luna.html':'#85cfff',
    '/aria.html':'#77f2a1',
    '/shadow.html':'#ff626d',
    '/links.html':'#f2c76a'
  };
  const path=location.pathname.endsWith('/')?'/':location.pathname.slice(location.pathname.lastIndexOf('/'));
  const current=rooms[path]||'#f2c76a';
  let previous=current;
  try{previous=localStorage.getItem('ubtLastAccent')||current;}catch(e){}
  document.documentElement.style.setProperty('--room-accent',current);
  document.documentElement.style.setProperty('--prev-accent',previous);
  try{localStorage.setItem('ubtLastAccent',current);}catch(e){}
})();

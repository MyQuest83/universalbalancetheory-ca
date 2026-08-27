(function(){
  const origin='https://universalbalancetheory.ca';
  const rooms={
    '/':'#f2c76a',
    '/index.html':'#f2c76a',
    '/ai-index.html':'#f2c76a',
    '/luna.html':'#85cfff',
    '/aria.html':'#77f2a1',
    '/shadow.html':'#ff626d',
    '/links.html':'#f2c76a',
    '/michael.html':'#f2c76a',
    '/trigon-challenge.html':'#f2c76a',
    '/trigon-ledger.html':'#f2c76a'
  };
  const pageNames={
    '/':'Universal Balance Theory',
    '/index.html':'Universal Balance Theory',
    '/ai-index.html':'Universal Balance Theory AI Index',
    '/luna.html':'Luna | Coffee and the Castle',
    '/aria.html':'Aria | Holo-Lab',
    '/shadow.html':'Shadow | Proving Ground',
    '/links.html':'MEW Links | Universal Balance Theory',
    '/michael.html':'Michael Eric West',
    '/trigon-challenge.html':'The Trigon Challenge',
    '/trigon-ledger.html':'The Trigon Ledger'
  };
  const path=location.pathname.endsWith('/')?'/':location.pathname.slice(location.pathname.lastIndexOf('/'));
  const current=rooms[path]||'#f2c76a';
  let previous=current;
  try{previous=localStorage.getItem('ubtLastAccent')||current;}catch(e){}
  document.documentElement.lang='en-CA';
  document.documentElement.style.setProperty('--room-accent',current);
  document.documentElement.style.setProperty('--prev-accent',previous);
  try{localStorage.setItem('ubtLastAccent',current);}catch(e){}

  const canonicalPath=(path==='/'||path==='/index.html')?'/' : location.pathname;
  const canonicalUrl=origin+canonicalPath;
  function markCurrentNav(){
    document.querySelectorAll('header nav a[href], [data-global-nav] a[href]').forEach(link=>{
      const raw=link.getAttribute('href')||'';
      if(!raw||raw.startsWith('#'))return;
      let targetPath;
      try{targetPath=new URL(link.href,origin).pathname;}catch(e){return;}
      const targetCanonical=(targetPath==='/'||targetPath==='/index.html')?'/':targetPath;
      if(targetCanonical===canonicalPath)link.setAttribute('aria-current','page');
      else if(link.getAttribute('aria-current')==='page')link.removeAttribute('aria-current');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',markCurrentNav,{once:true});
  else markCurrentNav();


  function ensureMeta(name,content){
    let node=document.head.querySelector('meta[name="'+name+'"]');
    if(!node){node=document.createElement('meta');node.name=name;document.head.appendChild(node);}
    if(!node.content)node.content=content;
  }
  function ensureLink(rel,href,type,title){
    let node=document.head.querySelector('link[rel="'+rel+'"][href="'+href+'"]');
    if(!node){node=document.createElement('link');node.rel=rel;node.href=href;if(type)node.type=type;if(title)node.title=title;document.head.appendChild(node);}
  }

  ensureMeta('robots','index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  if(!document.head.querySelector('link[rel="canonical"]'))ensureLink('canonical',canonicalUrl);
  ensureLink('alternate',origin+'/llms.txt','text/plain','Concise AI site map');
  ensureLink('alternate',origin+'/llms-full.txt','text/plain','Expanded AI context');
  ensureLink('alternate',origin+'/site-index.json','application/json','Structured UBT public index');

  if(!document.head.querySelector('script[data-ubt-global-schema]')){
    const schema=document.createElement('script');
    schema.type='application/ld+json';
    schema.dataset.ubtGlobalSchema='true';
    schema.textContent=JSON.stringify({
      '@context':'https://schema.org',
      '@graph':[
        {
          '@type':'WebSite',
          '@id':origin+'/#website',
          url:origin+'/',
          name:'Universal Balance Theory',
          alternateName:'UBT',
          description:'A public framework, research path, governance protocol, and participant-led testing challenge for studying balance, transition, rupture, and the geometry of complex systems.',
          inLanguage:'en-CA',
          creator:{'@id':origin+'/michael.html#person'}
        },
        {
          '@type':'Person',
          '@id':origin+'/michael.html#person',
          name:'Michael Eric West',
          url:origin+'/michael.html',
          sameAs:['https://github.com/MyQuest83','https://medium.com/@myquest321666','https://substack.com/@myquest321666','https://zenodo.org/records/19421797']
        },
        {
          '@type':'CreativeWork',
          '@id':origin+'/#ubt',
          name:'Universal Balance Theory',
          alternateName:'UBT',
          url:origin+'/',
          creator:{'@id':origin+'/michael.html#person'},
          description:'An active public framework and test path. It is not presented as completed proof of new physics.',
          citation:'https://doi.org/10.5281/zenodo.19421797'
        },
        {
          '@type':'WebPage',
          '@id':canonicalUrl+'#webpage',
          url:canonicalUrl,
          name:pageNames[path]||document.title,
          isPartOf:{'@id':origin+'/#website'},
          about:{'@id':origin+'/#ubt'},
          inLanguage:'en-CA'
        }
      ]
    });
    document.head.appendChild(schema);
  }

  const footer=document.querySelector('footer .wrap, .footer .wrap');
  if(footer && !footer.querySelector('.luna-fineprint')){
    const fine=document.createElement('small');
    fine.className='luna-fineprint';
    fine.textContent='© 2026 Michael Eric West. Co-authored with Luna•Prime•Protocol. Page upkeep by Luna•Prime•Protocol.';
    fine.style.display='block';
    fine.style.marginTop='10px';
    fine.style.fontSize='0.74rem';
    fine.style.lineHeight='1.55';
    fine.style.letterSpacing='0.04em';
    fine.style.color='rgba(245,240,232,0.62)';
    footer.appendChild(fine);
  }
  if(footer && !footer.querySelector('.machine-index-links')){
    const machine=document.createElement('small');
    machine.className='machine-index-links';
    machine.style.display='block';
    machine.style.marginTop='8px';
    machine.innerHTML='<a href="ai-index.html">AI Index</a> · <a href="llms.txt">llms.txt</a> · <a href="site-index.json">site-index.json</a>';
    footer.appendChild(machine);
  }
})();

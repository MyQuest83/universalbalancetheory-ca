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

  function applyExactLivingMarks(){
    document.querySelectorAll('.live-mark').forEach(mark=>{
      let core=mark.querySelector('.live-sphere');
      if(!core){core=document.createElement('span');core.className='live-sphere';mark.prepend(core);}
      let svg=mark.querySelector('svg.live-triad');
      if(!svg){
        svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('class','live-triad');
        svg.setAttribute('viewBox','0 0 100 100');
        svg.setAttribute('focusable','false');
        mark.appendChild(svg);
      }
      svg.setAttribute('viewBox','0 0 100 100');
      svg.innerHTML='<path class="outline" d="M50 8.3064516 L86.1076721 70.8467742 L13.8923279 70.8467742 Z"></path><circle class="tip-blue" cx="50" cy="8.3064516" r="4.9274194"></circle><circle class="tip-green" cx="86.1076721" cy="70.8467742" r="4.9274194"></circle><circle class="tip-red" cx="13.8923279" cy="70.8467742" r="4.9274194"></circle>';
    });
  }

  if(!document.head.querySelector('style[data-ubt-approved-mark]')){
    const markStyle=document.createElement('style');
    markStyle.dataset.ubtApprovedMark='20260830-mp4-exact-centred';
    markStyle.textContent=`
.live-mark{position:relative;display:inline-grid;place-items:center;isolation:isolate;overflow:visible;border-radius:50%;filter:drop-shadow(0 0 8px rgba(242,199,106,.26))!important}
.live-mark img{display:none!important}
.live-mark:before{content:""!important;display:block!important;position:absolute!important;inset:1px!important;z-index:-1!important;border:1px solid rgba(242,199,106,.92)!important;border-radius:50%!important;box-shadow:0 0 5px rgba(242,199,106,.18)!important;animation:none!important}
.live-sphere{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;inset:auto!important;width:2px!important;height:2px!important;margin:-1px 0 0 -1px!important;border-radius:50%!important;background:#f2c76a!important;box-shadow:0 0 4px rgba(242,199,106,.92)!important;filter:none!important;transform:none!important;animation:none!important;z-index:3!important}
.live-triad{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:visible!important;transform-origin:50% 50%!important;animation:ubtApprovedTriadSpin 6s linear infinite!important;z-index:1!important}
.live-triad .outline{fill:none!important;stroke:rgba(242,199,106,.96)!important;stroke-width:2.5!important;stroke-linejoin:round!important;stroke-linecap:round!important;filter:drop-shadow(0 0 2px rgba(242,199,106,.42))!important}
.live-triad .tip-blue{fill:#85cfff!important;color:#85cfff!important}
.live-triad .tip-green{fill:#77f2a1!important;color:#77f2a1!important}
.live-triad .tip-red{fill:#ff626d!important;color:#ff626d!important}
.live-triad circle{filter:drop-shadow(0 0 4px currentColor)!important}
@keyframes ubtApprovedTriadSpin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.live-triad{animation:none!important;transform:none!important}.live-mark:before,.live-sphere{animation:none!important}}
`;
    document.head.appendChild(markStyle);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyExactLivingMarks,{once:true});
  else applyExactLivingMarks();

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

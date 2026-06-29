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

  const isHome=path==='/'||path==='/index.html';
  if(isHome){
    const style=document.createElement('style');
    style.textContent=`
      .home-title,.home-hero,.hero{min-height:auto!important;padding:108px 16px 62px!important;text-align:center!important;display:grid!important;place-items:center!important;overflow:hidden!important}
      .home-title:after,.home-title:before,.home-hero:after,.home-hero:before,.hero:after,.hero:before{display:none!important}
      .home-fixed-shell{max-width:920px;margin:auto;text-align:center;position:relative;z-index:2}
      .home-fixed-mark{width:min(220px,48vw);aspect-ratio:1;margin:0 auto 22px;position:relative;display:grid;place-items:center}
      .home-fixed-mark:before,.home-fixed-mark:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.14)}
      .home-fixed-mark:before{inset:8%;border-color:rgba(242,199,106,.18)}
      .home-fixed-mark:after{inset:24%;border-style:dashed;border-color:rgba(255,255,255,.14)}
      .home-fixed-core{width:34%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 36% 28%,#fff 0,#f2c76a 28%,rgba(242,199,106,.38) 56%,rgba(5,7,17,.05) 74%);box-shadow:0 0 42px rgba(242,199,106,.22)}
      .home-fixed-node{position:absolute;width:12px;height:12px;border-radius:50%;box-shadow:0 0 14px currentColor}.home-fixed-node.lu{color:var(--luna);background:var(--luna);top:18%;left:50%}.home-fixed-node.ar{color:var(--aria);background:var(--aria);right:18%;bottom:30%}.home-fixed-node.sh{color:var(--shadow);background:var(--shadow);left:18%;bottom:30%}
      .home-fixed-owner{display:inline-block;margin:0 auto 14px;padding:6px 14px;border:1px solid rgba(242,199,106,.22);border-radius:999px;background:rgba(242,199,106,.055);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:clamp(.68rem,1.8vw,.9rem);letter-spacing:.2em;color:#f6d88c;text-shadow:0 0 16px rgba(242,199,106,.28)}
      .home-fixed-title{font-family:Georgia,"Times New Roman",serif;font-size:clamp(3.05rem,10vw,7.7rem);line-height:.86;letter-spacing:-.055em;margin:0 auto 16px;max-width:94vw;text-wrap:balance;text-shadow:0 0 30px rgba(242,199,106,.08)}
      .home-fixed-title span{display:block}.home-fixed-title .balance{color:#f8eedf}
      .home-fixed-governed{display:inline-block;margin:0 auto 22px;padding:8px 15px;border:1px solid rgba(242,199,106,.22);border-radius:999px;background:rgba(255,255,255,.035);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.22em;font-size:clamp(.68rem,2vw,.9rem);color:#f7dda0;box-shadow:0 0 16px rgba(242,199,106,.14)}
      .home-fixed-sub{max-width:760px;margin:0 auto;color:#ddd4cb;font-size:clamp(1rem,2.2vw,1.22rem);line-height:1.62;font-style:italic}.home-fixed-eq{display:inline-flex;flex-wrap:wrap;justify-content:center;margin:22px 0 0;padding:12px 16px;border:1px solid rgba(242,199,106,.24);border-radius:18px;background:rgba(242,199,106,.06);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#f7dda0}.home-fixed-credit{font-size:.94rem;color:#cfc6bf;margin-top:14px}
      @media(max-width:760px){.home-title,.home-hero,.hero{padding:98px 16px 50px!important}.home-fixed-mark{width:min(178px,43vw);margin-bottom:18px}.home-fixed-node{width:10px;height:10px}.home-fixed-owner{font-size:.62rem;letter-spacing:.1em;padding:5px 10px;margin-bottom:10px}.home-fixed-title{font-size:clamp(2.42rem,10.8vw,3.8rem);line-height:.9;letter-spacing:-.03em;margin-bottom:12px;max-width:96vw}.home-fixed-governed{font-size:.56rem;letter-spacing:.08em;padding:7px 10px;margin-bottom:18px;max-width:94vw}.home-fixed-sub{font-size:.96rem;line-height:1.48;max-width:92vw}.home-fixed-eq{font-size:.78rem;margin-top:14px;padding:9px 11px}.home-fixed-credit{font-size:.82rem;margin-top:10px}.home-fixed-shell .btns{display:grid;grid-template-columns:1fr 1fr;gap:9px;max-width:300px;margin:20px auto 0}.home-fixed-shell .btn{min-height:40px;padding:10px 12px;font-size:.86rem}.home-fixed-shell .btn:nth-child(n+3){display:none}}
    `;
    document.head.appendChild(style);
    const hero=document.querySelector('main .home-title, main .home-hero, main .hero');
    if(hero){
      hero.classList.add('home-fixed-active');
      hero.innerHTML=`<div class="home-fixed-shell"><div class="home-fixed-mark" aria-hidden="true"><span class="home-fixed-node lu"></span><span class="home-fixed-node ar"></span><span class="home-fixed-node sh"></span><div class="home-fixed-core"></div></div><div class="home-fixed-owner">Michael Eric West’s</div><h1 class="home-fixed-title" aria-label="Universal Balance Theory"><span>Universal</span><span class="balance">Balance</span><span>Theory</span></h1><div class="home-fixed-governed">A Geometry Governed Framework</div><div class="home-fixed-sub">A public framework for balance, transition, rupture, and the geometry of complex systems. Beautiful enough to invite wonder. Disciplined enough to survive controls.</div><div class="home-fixed-eq">UC_pi = (E · M · π) / (T · S)</div><p class="home-fixed-credit">Co-authored with Luna-Prime OS. Tested through the Trigon Challenge.</p><div class="btns"><a class="btn" href="trigon-challenge.html">Start Trigon</a><a class="btn" href="links.html">Links</a><a class="btn" href="luna.html">Luna</a><a class="btn" href="aria.html">Aria</a><a class="btn" href="shadow.html">Shadow</a><a class="btn" href="https://zenodo.org/records/19421797">Read Book 1</a></div></div>`;
    }
  }

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
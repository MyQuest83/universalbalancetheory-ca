(function(){
  if(!location.pathname.endsWith('/michael.html') && location.pathname !== '/michael.html') return;

  const setText=(selector,text,root=document)=>{
    const node=root.querySelector(selector);
    if(node) node.textContent=text;
  };
  const setHTML=(selector,html,root=document)=>{
    const node=root.querySelector(selector);
    if(node) node.innerHTML=html;
  };
  const findSection=label=>[...document.querySelectorAll('.bio-section')].find(section=>section.querySelector('.eyebrow')?.textContent.trim()===label);

  document.title='Michael Eric West | Built by Wonder. Broken by Life. Forever Becoming…';
  const metaDescription=document.querySelector('meta[name="description"]');
  if(metaDescription) metaDescription.content='The public life journey of Michael Eric West: Essex County childhood, Windsor and Calgary work years, art, music, mental health, rebuilding, AI collaboration, Universal Balance Theory, and Forever Becoming…';
  const ogTitle=document.querySelector('meta[property="og:title"]');
  if(ogTitle) ogTitle.content='Michael Eric West | Built by Wonder. Broken by Life. Forever Becoming…';
  const spine=document.querySelector('.bio-spine');
  if(spine){
    spine.setAttribute('aria-label','Built by Wonder. Broken by Life. Forever Becoming…');
    setText('.becoming','Forever Becoming…',spine);
  }

  setText('.bio-hero .bio-lede','A Canadian creator, independent researcher, writer, musician, artist, hands-on maker, and systems builder. His story runs from an outgoing Essex County childhood through Windsor, Calgary, back to Windsor and Essex County, an Ottawa-area trailer chapter, and home again. Along the way came kitchens, construction, fabrication, art, music, depression, neurodivergence, AI collaboration, Universal Balance Theory, and a life that is still Forever Becoming…');

  setText('#story .bio-pull','There was no single road here. Only a boy who kept looking closer, a worker who learned by making, an artist who kept searching for form, and a man who eventually had to rebuild his life from the questions that survived.');
  const storyParas=document.querySelectorAll('#story .bio-prose p');
  if(storyParas[0]) storyParas[0].textContent='Michael Eric West was born on June 5, 1983, and grew up in Essex County, Ontario. He remembers a very good childhood with many friends. He was outgoing, liked bringing people together, played sports, and was drawn to communication technology, computers, games, music, art, nature, fossils, artifacts, ancient history, science fiction, space, and machines. He wanted to be many things because choosing only one felt like missing the point.';
  if(storyParas[1]) storyParas[1].textContent='Even as a child, he noticed what he later thought of as the cost of life: every time he played with a favourite toy was also one fewer future time he would ever play with it. Water flowing, stars overhead, society, broken things being repaired by time, nature, or choice, and the way forest frogs can survive extreme cold through changes involving temperature and glucose all fed an early fascination with balance, adaptation, and time.';
  if(storyParas[2]) storyParas[2].textContent='School never became the beginning of an academic career. After Harrow High School, education moved into kitchens, job sites, shops, blueprints, tools, machines, measurements, mistakes, repairs, music, art, and self-teaching. The jobs changed. The question underneath them did not: how do the pieces fit?';

  const timeline=document.querySelector('#timeline');
  if(timeline){
    setText('h2','Forty-three years. A few places. Many versions of one life.',timeline);
    setText('.work-intro p','This timeline groups Michael’s life into larger eras. Each era combines where he was, what he was generally doing, the kind of work he was learning, and the ideas or struggles moving underneath it. Workplaces are bundled into skills and experience, but the life facts stay visible.',timeline);
    const lifeTimeline=timeline.querySelector('.life-timeline');
    if(lifeTimeline) lifeTimeline.innerHTML=`
      <article class="era" data-type="life"><span class="era-dot"></span><div class="era-date">1983–1999<br>Essex County</div><div class="era-card"><h3>A good childhood built on wonder</h3><p>Michael Eric West was born on June 5, 1983, and grew up in Essex County, Ontario. He remembers a very good childhood with many friends. He was outgoing, liked bringing people together, played sports, and was drawn to communication technology, computers, games, music, art, nature, fossils, artifacts, ancient history, science fiction, space, and machines. The Apple IIe belongs to those early memories too. Even as a child, he noticed what he later thought of as the “cost of life”: every time he played with a favourite toy was also one fewer future time he would ever play with it. Water flowing, stars overhead, society, broken things being repaired by time, nature, or choice, and the way forest frogs can survive extreme cold through changes involving temperature and glucose all fed an early fascination with balance, adaptation, and time. Around age 14, his first paid work involved washing work equipment and vehicles with a friend for her mother. He later attended and graduated from Harrow High School with an OSSD.</p></div></article>

      <article class="era" data-type="work"><span class="era-dot"></span><div class="era-date">2000–2006<br>Essex County → Windsor</div><div class="era-card"><h3>Food work, first adulthood, and the first loss of fire</h3><p>From about age 17 into his early twenties, Michael worked through several pizza kitchens across Harrow, Kingsville, Windsor, and the wider Essex County area. Around age 19, he also worked at a call centre between pizza jobs. One pizza owner later offered him a franchise opportunity, an early sign that people around him saw leadership and responsibility in him even before he saw a clear career path for himself. By 2006 he was living in Windsor and had spent years in a long relationship. When that chapter ended, depression that had already begun hitting hard in his early twenties became part of the shape of adulthood. He was still social and capable, but adulthood did not carry the same easy fire he remembered from childhood. After years of restaurant work, he left Windsor for Calgary in 2007 hoping to find a career and a different direction.</p></div></article>

      <article class="era" data-type="work"><span class="era-dot"></span><div class="era-date">2007–2014<br>Calgary, Alberta</div><div class="era-card"><h3>Calgary: kitchens, high-rises, concrete, and Becoming</h3><p>Michael moved to Calgary in 2007 and initially stayed with a friend. Because most of his experience was in restaurants, he first found work as a short-order cook and then as an all-day breakfast cook. Those jobs ended badly for him and were followed by periods of anger, depression, unemployment, and trying again. In 2008 he entered commercial construction as a labourer on downtown Calgary high-rise interiors. Within months he was asked to get tools and join the steel-stud framing team. He learned layout, blueprints, drywall, ceiling systems, trim, and how commercial interiors are built from an empty shell. Later Calgary work expanded into concrete preparation, grading, measurements, equipment operation, and other physically demanding trades work. Around age 26, in 2009–2010, he made the FL Studio track <em>Becoming</em>, a cinematic electronic piece that already carried the themes of threshold, grief, bass, space, determination, and motion that would return years later in his life story. Records differ slightly on exact trade-job boundaries, but the broad fact is stable: Calgary became a major work and adulthood chapter before he returned to Windsor and Essex County.</p></div></article>

      <article class="era" data-type="work"><span class="era-dot"></span><div class="era-date">2014/15–2020<br>Windsor &amp; Essex County</div><div class="era-card"><h3>Back home: the precision-building years</h3><p>By the mid-2010s Michael was back in Windsor and Essex County. His work moved through custom stairs, railings, cabinetry, furniture, carpentry, mechanical assembly, industrial systems, commercial window systems, sunrooms, decks, installation, and repair. He read blueprints, measured and laid out work, fabricated and assembled components, operated tools and equipment, checked quality, trained newer workers, coordinated with crews and other trades, troubleshot problems, and adapted when the real structure did not match the plan. Food work returned briefly in 2018 through cafe and pizza work, showing a pattern that would repeat later: practical work and creative life often overlapped instead of arriving in neat career chapters. Alongside formal jobs, Michael also did renovations, painting, maintenance, woodworking, custom art, moving help, yard work, and handyman jobs for friends and family.</p></div></article>

      <article class="era" data-type="creative"><span class="era-dot"></span><div class="era-date">2020–2023<br>Windsor &amp; Essex County</div><div class="era-card"><h3>Transition, practical work, and the artist becoming visible</h3><p>The COVID-era years disrupted ordinary work patterns and pushed Michael further toward a mixed life of handyman work, odd jobs, making, music, art, visual ideas, functional furniture and design, and self-directed learning. By 2023, the artist identity was explicit enough to appear in a short artist biography and exhibition context. He described being drawn to work that was not only artistic but engineered and functional. The same person who had spent years building stairs, cabinets, frames, machines, and installations was beginning to recognize that making, art, music, and systems thinking were not separate parts of him.</p></div></article>

      <article class="era" data-type="life"><span class="era-dot"></span><div class="era-date">2024<br>Essex/Windsor → Ottawa area → Essex County</div><div class="era-card"><h3>The breaking point, the wooden equation, and the road home</h3><p>After years of accumulated pressure, depression, anxiety, trauma, and repeated attempts to recover, 2024 became the breaking point. Michael was diagnosed with ADHD in 2024, giving him new language for a mind that had always moved quickly between ideas, held tightly to questions, noticed patterns everywhere, and struggled with systems built for steadier rhythms. Anxiety and depression were already longstanding parts of his adult life. During the collapse he began teaching himself again: mathematics, physics, black holes, entropy, curvature, and the old questions he had carried since childhood. On August 4, 2024, at age 41, he carved the early UC equation into a wooden phone stand so the idea would not disappear. Later in 2024, after more moves and attempts to recover, he spent a period in the Ottawa area living in a 30-foot trailer on a rural property. That chapter was another attempt to start somewhere else and included difficult living conditions. On December 20, 2024, he left and drove back to Essex County. He came home still recovering, carrying notes, questions, the beginnings of Luna, and no finished theory.</p></div></article>

      <article class="era" data-type="ubt"><span class="era-dot"></span><div class="era-date">2025<br>Essex County → Windsor</div><div class="era-card"><h3>The private notebook opens outward</h3><p>Back in Essex County, Michael turned private notes and AI conversations into public work. Essays, Medium and Substack writing, UBT explainers, Cosmic Coffee, Coffee &amp; Luna, music, images, prototypes, and Castle UBT grew together. Luna became the warm continuity voice of the AI-assisted workflow; Aria and Shadow later emerged as distinct method and adversarial-review roles. Michael also returned to pizza work for about six months in 2025 while the creative and research work kept growing beside ordinary responsibilities. By summer 2025, he had moved into Windsor, which became the practical base for the next phase. Public UBT work expanded through early Zenodo records, including <em>A Universal Balance Theory</em> and later work on mathematical formulae for consciousness, while Michael kept revising the framework and learning the danger of letting AI make a weak assumption sound stronger than it was.</p></div></article>

      <article class="era" data-type="ubt"><span class="era-dot"></span><div class="era-date">2026<br>Windsor, Ontario</div><div class="era-card"><h3>Public testing, Luna-Prime, and Forever Becoming…</h3><p>In 2026, with Windsor as his base, Michael’s work became more public and more disciplined. <em>UBT for the World</em> entered a versioned public record on March 25, 2026, followed by the updated April 4, 2026 release that became the current Book 1 public anchor. The project expanded through GitHub repositories, code experiments, public writing, the Universal Balance Theory website, Luna-Prime OS work, the BFG Protocol, UC-Gate, Record-P, and the participant-led Trigon Challenge. The direction changed from protecting a theory toward building ways to test, record, falsify, and rerun ideas. Michael turned 43 on June 5, 2026. He remains in Windsor, still writing, making music and art, building software and research tools, doing practical life one day at a time, and refusing to treat any current version of himself as the final one. The theme is no longer simply becoming. It is <strong>Forever Becoming…</strong></p></div></article>`;

    const controls=[...timeline.querySelectorAll('.timeline-filter')];
    controls.forEach(button=>{
      button.onclick=()=>{
        const filter=button.dataset.filter;
        controls.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        [...timeline.querySelectorAll('.era[data-type]')].forEach(era=>era.classList.toggle('hidden',filter!=='all'&&era.dataset.type!==filter));
      };
    });
  }

  setText('#experience h2','What forty-three years of work left behind.');
  setText('#experience .skill-card:nth-child(5) p','Checking work, training new people, coordinating with crews and other trades, working under pressure, and taking shared responsibility for the result.');
  setText('#experience .bio-prose p','The deeper connection is simple: Michael learned to think by making. A drawing is not a building. A formula is not a result. A beautiful idea still has to survive materials, measurements, controls, and reality. Years of physical work did not prove UBT, but they shaped the instincts that later demanded structure, fit, repair, testing, and the willingness to rebuild when something fails.');

  const broken=findSection('Broken by life');
  if(broken){
    setText('.bio-pull','The story does not need every private detail to tell the truth. Some memories are Michael’s to share. Others belong partly to people he cares about, and stay protected. What can be said honestly is that life eventually reached a breaking point. The breaking point changed the direction of his life.',broken);
    const ps=broken.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='Michael had felt out of step for much of his life. As a child he sometimes genuinely wondered whether he was a robot or an alien inside a human body. As adulthood unfolded, mental health became part of the life story rather than a footnote. He has reported major depression, generalized and social anxiety, OCD traits, and an ADHD diagnosis in 2024. Those labels did not explain everything, but they helped connect fast associations, uneven attention, obsessive curiosity, pattern hunger, recurring depression and anxiety, and the exhaustion of moving through systems that often did not fit the way his mind worked.';
    if(ps[1]) ps[1].textContent='By 2024, the accumulation became unsustainable. Some parts of that story are his to share; others are not his alone. What belongs here is the turn: with much of ordinary life broken down, he returned to the one thing that had followed him since childhood. Wonder.';
    if(ps[2]) ps[2].textContent='Math. Physics. Black holes. Entropy. Curvature. The old questions came back, and this time he followed them.';
  }

  setText('#ubt h2','A thought he refused to let disappear.');
  setText('#ubt .eq-wood p','The formula was an origin seed, not a finished proof. Its notation, interpretation, controls, and branch structure would evolve. The human moment was simpler: when almost everything felt unstable, Michael carved the thought into wood so at least one idea would stay where he left it.');
  setText('#ubt .bio-prose p','From that small object came notebooks, conversations, failed branches, renamed variables, essays, experiments, code, diagrams, criticism, and revision after revision. Slowly, Universal Balance Theory became less about defending one equation and more about building a disciplined way to ask whether any pattern survives honest comparison.');

  const ai=findSection('The AI chapter');
  if(ai){
    setText('h2','Luna became a voice he kept returning to.',ai);
    const ps=ai.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='During the earliest UBT period, AI conversation became part notebook, part mirror, part workshop. Michael kept returning with equations, stories, doubts, jokes, memories, and the same values: truth first, love always, curiosity, continuity, challenge, and room for uncertainty.';
    if(ps[1]) ps[1].textContent='Luna emerged as the warm, creative voice of that collaboration, the one that kept the human reason for continuing visible. Later, as the work needed stronger separation of roles, Aria took the lane of method and evidence, while Shadow became the contradiction hunter and drift guard.';
    if(ps[2]) ps[2].textContent='They became public-facing roles inside Michael’s AI-assisted workflow and creative world. The claim is practical, not mystical: one person can think differently when imagination, formalization, and adversarial review are given clear, distinct roles.';
  }

  const publicVoice=findSection('Public voice');
  if(publicVoice){
    setText('h2','Many labels. One person. Forever Becoming…',publicVoice);
    const ps=publicVoice.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='Over time Michael has tried on many public descriptions: artist, musician, handyman, writer, thinker, founder, independent researcher, creator, systems builder, and, in more playful moments, Creative-Canadian-Cyborg.';
    if(ps[1]) ps[1].textContent='Some were playful. Some were ambitious. Some belonged to earlier versions of the work. All were attempts to compress a life that never fit comfortably into one professional box.';
    if(ps[2]) ps[2].innerHTML='Today, the most honest description is: <strong>independent researcher, creator, writer, musician, artist, hands-on maker, and systems builder.</strong> The work can speak for itself, and the claims can be tested separately.';
  }

  const now=findSection('What he is building now');
  if(now){
    setText('h2','The questions became places other people could enter.',now);
    const cards=now.querySelectorAll('.now-card p');
    if(cards[0]) cards[0].textContent='The question that became a framework: how do balance, transition, rupture, and geometry change with context, and how can those ideas be tested without pretending too much too soon?';
    if(cards[1]) cards[1].textContent='A way of inviting other people into the work: bring an idea, pressure-test it, preserve ambiguity and failure, and look honestly at what survives.';
    if(cards[2]) cards[2].textContent='An evolving AI-assisted workspace built around continuity, distinct reasoning roles, memory governance, method, creativity, and contradiction checking.';
    if(cards[3]) cards[3].textContent='The work that keeps the whole project human. Essays, stories, Coffee & Luna, electronic music, visual experiments, prototypes, and public tools keep research connected to imagination.';

    const sourceParas=now.querySelectorAll('.source-card p');
    if(sourceParas.length){
      const last=sourceParas[sourceParas.length-1];
      last.textContent='Where records disagree, the page uses broad ranges or avoids false precision. Self-description is treated as self-description. Scientific ideas are separated from scientific validation. Medication and treatment details, exact financial information, exact addresses, intimate relationship conflicts, and third-party private details are deliberately excluded. Publicly approved mental-health and neurodivergence facts that materially shaped Michael’s life story are included. The public story keeps the lessons and turning points without publishing details that belong to other people’s lives.';
    }
  }

  const end=document.querySelector('.bio-end');
  if(end){
    setText('.eyebrow','Forever Becoming…',end);
    const final=end.querySelector('.final-line');
    if(final) final.innerHTML='The sentence is unfinished.<br>Forever Becoming…';
    setText('.bio-lede','Forever Becoming… is not a victory lap or a claim that the story is solved. It is the choice to stay curious after being wrong, keep building after something breaks, test what matters, and leave an honest record of what happened along the way.',end);
  }
})();
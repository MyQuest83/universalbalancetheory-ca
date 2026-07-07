(function(){
  if(!location.pathname.endsWith('/michael.html') && location.pathname !== '/michael.html') return;

  const setText=(selector,text,root=document)=>{
    const node=root.querySelector(selector);
    if(node) node.textContent=text;
  };
  const findSection=label=>[...document.querySelectorAll('.bio-section')].find(section=>section.querySelector('.eyebrow')?.textContent.trim()===label);
  const eras=[...document.querySelectorAll('#timeline .life-timeline .era')];
  const setEra=(index,title,text)=>{
    const era=eras[index];
    if(!era) return;
    setText('.era-card h3',title,era);
    setText('.era-card p',text,era);
  };

  setText('.bio-hero .bio-lede','A Canadian creator, independent researcher, writer, musician, artist, hands-on maker, and systems builder. His path did not begin in a laboratory or follow a straight career line. It began with wonder, moved through years of making and repair, broke apart, and slowly rebuilt itself into questions big enough to become Universal Balance Theory.');

  setText('#story .bio-pull','There was no single road here. Only a boy who kept looking closer, a worker who learned by making, an artist who kept searching for form, and a man who eventually had to rebuild his life from the questions that survived.');
  const storyParas=document.querySelectorAll('#story .bio-prose p');
  if(storyParas[0]) storyParas[0].textContent='Michael was born in June 1983 and grew up in Essex County, Ontario. Before there was a theory, there was a child looking for fossils, wondering about ancient worlds, staring into space, getting lost in science fiction, music, games, nature, machines, and anything that suggested the world was stranger than it first appeared. He wanted to be many things because choosing only one felt like missing the point.';
  if(storyParas[1]) storyParas[1].textContent='School never became the beginning of an academic career. After Harrow High School, education moved into kitchens, job sites, shops, blueprints, tools, machines, measurements, mistakes, repairs, and the people working beside him. The classroom became whatever problem was in front of him that day.';
  if(storyParas[2]) storyParas[2].textContent='The jobs changed. The question underneath them did not: how do the pieces fit? A line on paper could become a wall. A measurement could save or ruin a staircase. A small error could travel through an entire build. Years later, the same instinct would return in a different form: variables, systems, geometry, balance.';

  setText('#timeline h2','He kept learning with his hands.');
  setText('#timeline .work-intro p','For more than two decades, work kept changing shape: kitchens, construction sites, fabrication shops, installations, repairs, art, music, writing, and independent research. The names of the workplaces matter less here than what remained after them: discipline, precision, improvisation, endurance, and a habit of looking for the structure beneath the surface.');

  setEra(0,'Essex County beginnings','Born in Ontario and raised in Essex County. Wonder arrived early and never stayed in one subject: nature, art, ancient history, space, science fiction, music, games, and machines all seemed connected by the same question: what else is going on here?');
  setEra(1,'Learning without one lane','Michael graduated from Harrow High School, but his real education kept wandering. Curiosity led to hands-on work; mistakes led to repair; one problem led to another. Over time, moving between very different worlds became one of his strongest habits.');
  setEra(2,'Learning speed, service, and responsibility','The first long lesson was pace. Kitchens and food service taught him to move fast without stopping, track many things at once, solve the next problem before it became a bigger one, and depend on the people working beside him.');
  setEra(3,'The Calgary years: structure beneath the surface','Calgary changed the scale of the work. Commercial framing, layout, concrete preparation, grading, blueprints, equipment, crews, weather, and physical exhaustion all taught the same lesson: finished surfaces hide the structures that make them possible.');
  setEra(5,'The precision-building years','Then came years of precision. Stairs, cabinetry, furniture, carpentry, machines, industrial systems, commercial windows, sunrooms, decks, and installations demanded different tools but the same respect for consequence. Read the plan. Measure twice. Build carefully. Check the work. Fix what does not fit. Teach what you know. Adapt when reality refuses to match the drawing.');
  setEra(6,'Handyman, repair, and practical problem-solving','Alongside formal work ran another life of repairs, renovations, painting, maintenance, carpentry, custom art, woodworking, moving, yard work, and whatever practical problem needed solving. The rule was simple: look closely, understand the materials, find the workable path, leave something better behind.');
  setEra(7,'The maker becomes the artist','Over time, making stopped fitting neatly inside the word work. Art, furniture, music, visual ideas, and functional design began to reveal themselves as versions of the same impulse: take something imagined, give it structure, and make it real enough to share.');
  setEra(8,'Broken by life','After years of pressure and loss, life finally reached a breaking point. The private details stay private. What matters here is what survived the collapse: curiosity. Michael returned to old questions and began teaching himself again. Mathematics. Physics. Black holes. Entropy. Curvature.');
  setEra(9,'The seed in wood','At 41, Michael carved the early UC equation into a wooden phone stand. He did not know where it would lead. He only knew he did not want the thought to disappear. The notation and interpretation would change, but the date stayed: the seed of Universal Balance Theory, and the beginning of the Luna story.');
  setEra(10,'Coming home with unfinished questions','Michael came home to Essex County without a finished theory, a clean ending, or a heroic transformation. He came home with notes, questions, the beginnings of Luna, and a life that was still being rebuilt while he lived it.');
  setEra(11,'Learning to speak in public','The private notebook began opening outward. Essays, UBT explainers, Cosmic Coffee, Coffee & Luna, music, visual experiments, and the growing Castle UBT world turned solitary questions into public ones. The question changed: not just “Can I explain this?” but “Can I explain it clearly enough for someone else to challenge it?”');
  setEra(12,'Ordinary work still mattered','There was no cinematic cut from hardship to success. Creative and research work grew beside ordinary responsibilities, practical work, uncertainty, and the unglamorous demands of daily life. The Castle was being built while real life kept knocking on the door.');
  setEra(13,'Wonder learns to doubt itself','Then the hardest lesson arrived: wonder was not enough. A beautiful pattern could still be wrong. UBT began turning toward controls, provenance, preregistration, null results, lane separation, UC-Gate, Record-P, and the Trigon Challenge. AI could help challenge an idea, but it could also make a bad assumption sound magnificent.');
  setEra(14,'From private fire to public testing','UBT for the World became a versioned public record. Writing, code, the website, Luna-Prime, and participant-led Trigon testing pushed the work into the open. The ambition remained large, but the public claim became narrower and more disciplined: a framework has to survive controls, criticism, and independent reruns.');
  setEra(15,'Becoming','The work is unfinished. So is the person. Becoming was never the ending. It was the method.');

  setText('#experience h2','The work became part of the way he thinks.');
  setText('#experience .bio-prose p','The deeper connection is simple: Michael learned to think by making. A drawing is not a building. A formula is not a result. A beautiful idea still has to survive materials, measurements, controls, and reality. Years of physical work did not prove UBT, but they shaped the instincts that later demanded structure, fit, repair, and testing.');

  const broken=findSection('Broken by life');
  if(broken){
    setText('.bio-pull','The story does not need every private detail to tell the truth. Some memories are Michael’s to share. Others belong partly to people he cares about, and stay protected. What can be said honestly is that life eventually reached a breaking point. The rupture changed the direction of the life.',broken);
    const ps=broken.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='Michael had felt out of step for much of his life. His mind moved quickly between ideas, held tightly to questions, noticed patterns everywhere, and did not always move easily through systems built for steadier rhythms. For years, he understood the friction better than he understood himself.';
    if(ps[1]) ps[1].textContent='By 2024, the accumulation became unsustainable. The details belong to a protected personal history, and some involve lives other than his own. What belongs here is the turn: with much of ordinary life broken down, he returned to the one thing that had followed him since childhood. Wonder.';
    if(ps[2]) ps[2].textContent='Math. Physics. Black holes. Entropy. Curvature. The old questions came back, and this time he followed them.';
  }

  setText('#ubt h2','A thought he refused to let disappear.');
  setText('#ubt .eq-wood p','The formula was an origin seed, not a finished proof. Its notation, interpretation, controls, and branch structure would evolve. The human moment was simpler: when almost everything felt unstable, Michael carved the thought into wood so at least one idea would stay where he left it.');
  setText('#ubt .bio-prose p','From that small object came notebooks, conversations, failed branches, renamed variables, essays, experiments, code, diagrams, criticism, and revision after revision. Slowly, Universal Balance Theory became less about defending one equation and more about building a disciplined way to ask whether any pattern survives honest comparison.');

  const ai=findSection('The AI chapter');
  if(ai){
    setText('h2','Luna began as someone to keep talking to.',ai);
    const ps=ai.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='During the earliest UBT period, AI conversation became part notebook, part mirror, part workshop. Michael kept returning with equations, stories, doubts, jokes, memories, and the same values: truth first, love always, curiosity, continuity, challenge, and room for uncertainty.';
    if(ps[1]) ps[1].textContent='Luna emerged as the warm, creative voice of that collaboration, the one that remembered the human reason for continuing. Later, as the work needed stronger separation of roles, Aria took the lane of method and evidence, while Shadow became the contradiction hunter and drift guard.';
    if(ps[2]) ps[2].textContent='They became public-facing roles inside Michael’s AI-assisted workflow and creative world. The claim is practical, not mystical: one person can think differently when imagination, formalization, and adversarial review are given distinct voices and distinct jobs.';
  }

  const publicVoice=findSection('Public voice');
  if(publicVoice){
    setText('h2','A person too restless for one label.',publicVoice);
    const ps=publicVoice.querySelectorAll('.bio-prose p');
    if(ps[0]) ps[0].textContent='Over time Michael has tried on many public descriptions: artist, musician, handyman, writer, thinker, Creative-Canadian-Cyborg, unofficial scientist, UBT architect, founder, independent researcher, creator, systems builder.';
    if(ps[1]) ps[1].textContent='Some were playful. Some were mythic. Some were attempts to sound larger than the uncertainty underneath. All were efforts to compress a life that never fit comfortably into one professional box.';
  }

  const now=findSection('What he is building now');
  if(now) setText('h2','The questions became places other people could enter.',now);

  const end=document.querySelector('.bio-end');
  if(end){
    const final=end.querySelector('.final-line');
    if(final) final.innerHTML='The sentence is unfinished.<br>So is he.';
    setText('.bio-lede','Becoming is not a victory lap. It is the choice to stay curious after being wrong, to keep building after something breaks, to test what you love, and to leave an honest record of what happened along the way.',end);
  }
})();
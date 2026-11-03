(function () {
  'use strict';
  const menuDetails = Array.from(document.querySelectorAll('.nav-disclosure, .mobile-navigation'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') menuDetails.forEach((menu) => {
      if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  });
  document.addEventListener('click', (event) => {
    menuDetails.forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
  });
  const motionButtons = document.querySelectorAll('[data-motion-toggle]');
  let paused = false;
  try { paused = localStorage.getItem('ubtPauseMotion') === 'true'; } catch (_) {}
  const setMotion = (value) => {
    paused = value;
    document.documentElement.classList.toggle('motion-paused', value);
    motionButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(value));
      button.textContent = value ? 'Resume decorative motion' : 'Pause decorative motion';
    });
    try { localStorage.setItem('ubtPauseMotion', String(value)); } catch (_) {}
  };
  setMotion(paused);
  motionButtons.forEach((button) => button.addEventListener('click', () => setMotion(!paused)));

  const search = document.getElementById('pathway-search');
  if (!search) return;
  const field = document.getElementById('field-filter');
  const cards = Array.from(document.querySelectorAll('.pathway-card'));
  const count = document.getElementById('pathway-count');
  const empty = document.getElementById('pathway-empty');
  const expand = document.getElementById('expand-pathways');
  const controls = document.querySelector('.research-controls');
  controls.hidden = false;
  expand.hidden = false;
  const searchableText = new Map(cards.map((card) => [card, card.textContent.toLocaleLowerCase()]));
  function syncExpand() {
    const visible = cards.filter((card) => !card.hidden);
    const allOpen = visible.length > 0 && visible.every((card) => card.querySelector('details').open);
    expand.textContent = allOpen ? 'Collapse all details' : 'Expand all details';
    expand.disabled = visible.length === 0;
  }
  function applyFilters() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    cards.forEach((card) => {
      card.hidden = (field.value !== 'all' && card.dataset.field !== field.value) || !terms.every((term) => searchableText.get(card).includes(term));
    });
    const visible = cards.filter((card) => !card.hidden).length;
    count.textContent = visible === cards.length ? 'Showing all 12 pathways' : `Showing ${visible} of 12 pathways`;
    empty.hidden = visible > 0;
    syncExpand();
  }
  function reset() { search.value = ''; field.value = 'all'; applyFilters(); }
  search.addEventListener('input', applyFilters);
  field.addEventListener('change', applyFilters);
  document.getElementById('clear-pathway-filters').addEventListener('click', () => { reset(); search.focus(); });
  document.getElementById('reset-empty').addEventListener('click', () => { reset(); search.focus(); });
  expand.addEventListener('click', () => {
    const visible = cards.filter((card) => !card.hidden);
    const shouldOpen = !visible.every((card) => card.querySelector('details').open);
    visible.forEach((card) => { card.querySelector('details').open = shouldOpen; });
    syncExpand();
  });
  cards.forEach((card) => card.querySelector('details').addEventListener('toggle', () => {
    card.classList.toggle('is-expanded', card.querySelector('details').open);
    syncExpand();
  }));
  function openHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const card = cards.find((candidate) => candidate.id === id);
    if (!card) return;
    if (card.hidden) reset();
    card.querySelector('details').open = true;
    card.classList.add('is-expanded');
    syncExpand();
    requestAnimationFrame(() => card.scrollIntoView({block: 'start', behavior: 'instant'}));
  }
  window.addEventListener('hashchange', openHash);
  document.querySelectorAll('.pathway-jump a').forEach((link) => link.addEventListener('click', () => {
    if (location.hash === link.hash) openHash();
  }));
  applyFilters();
  openHash();
})();

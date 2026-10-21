(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const prompt = $('#promptText');
  const template = prompt.value;
  const feedback = $('#copyStatus');
  let lane = '';
  let depth = '';

  function updatePrompt() {
    $('#selectedLane').textContent = `Lane: ${lane || 'not selected'}`;
    $('#selectedDepth').textContent = `Depth: ${depth || 'not selected'}`;
    $('#promptSetup').textContent = lane && depth
      ? `${lane} lane · ${depth} test. Ready to copy or download.`
      : `${lane || 'Choose a lane'} · ${depth ? `${depth} test` : 'choose a depth'}. Unselected choices remain as placeholders.`;
    prompt.value = template
      .replace(/^Lane: .*$/m, `Lane: ${lane || '[SELECT A LANE]'}`)
      .replace(/^Depth: .*$/m, `Depth: ${depth || '[SELECT A TEST DEPTH]'}`);
    feedback.textContent = '';
    $('#copyPrompt').textContent = 'Copy prompt';
  }

  function wireSelection(attribute, setValue) {
    const buttons = $$(`[data-${attribute}]`);
    buttons.forEach(button => {
      const label = button.textContent;
      button.dataset.originalLabel = label;
      button.addEventListener('click', () => {
        setValue(button.dataset[attribute]);
        buttons.forEach(item => {
          const selected = item === button;
          item.setAttribute('aria-pressed', String(selected));
          item.textContent = selected ? `✓ ${item.dataset[attribute]} selected` : item.dataset.originalLabel;
          const card = item.closest('article');
          card.classList.toggle('is-selected', selected);
          let next = card.querySelector('.selection-next');
          if (!next && selected) {
            next = document.createElement('a');
            next.className = 'selection-next';
            next.href = attribute === 'lane' ? '#depth-choice' : '#prompt';
            next.textContent = attribute === 'lane' ? 'Next: choose test depth →' : 'Next: get the prompt →';
            card.append(next);
          }
          if (next) next.hidden = !selected;
        });
        updatePrompt();
      });
    });
  }
  wireSelection('lane', value => { lane = value; });
  wireSelection('depth', value => { depth = value; });

  function selectPrompt() {
    $('#promptPreview').open = true;
    prompt.focus();
    prompt.select();
    prompt.setSelectionRange(0, prompt.value.length);
    feedback.textContent = 'Prompt selected. Use your device’s Copy command, then paste it into a fresh chat.';
  }
  ['copyPrompt', 'downloadPrompt', 'selectPrompt'].forEach(id => { $(`#${id}`).hidden = false; });
  $('#selectPrompt').addEventListener('click', selectPrompt);
  $('#copyPrompt').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt.value);
      $('#copyPrompt').textContent = '✓ Copied';
      feedback.textContent = lane && depth
        ? 'Prompt copied. Paste it into a fresh chat and fill in your framework and scenarios.'
        : 'Template copied. Fill in the lane, depth, framework, and scenario placeholders before testing.';
    } catch {
      selectPrompt();
    }
  });
  $('#downloadPrompt').addEventListener('click', () => {
    const file = new Blob([prompt.value + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trigon-testing-prompt.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = lane && depth
      ? 'Text download requested with your selected lane and depth.'
      : 'Template download requested. Fill in all placeholders before testing.';
  });

  const list = $('#recordList');
  const search = $('#recordSearch');
  const statusFilter = $('#statusFilter');
  const domainFilter = $('#domainFilter');
  const depthFilter = $('#depthFilter');
  const sortFilter = $('#sortFilter');
  const controls = [search, statusFilter, domainFilter, depthFilter, sortFilter];
  const arr = value => Array.isArray(value) ? value : [];
  const norm = value => String(value ?? '').trim().toLowerCase();
  let records = [];
  let loaded = false;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }

  // Only public web links are rendered; record strings never become HTML.
  function publicHref(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (url.username || url.password) return null;
      if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin)) return url.href;
    } catch { /* An invalid link is omitted, while the record stays visible. */ }
    return null;
  }

  function recordCard(record) {
    const card = element('details', undefined, 'record-card');
    const summary = element('summary');
    const heading = element('span', undefined, 'record-heading');
    heading.append(element('span', record.title || record.question || record.record_id || 'Untitled record', 'record-title'));
    const meta = element('span', undefined, 'record-meta');
    [record.record_id || 'Record ID pending', record.status || 'unclassified', record.test_depth || 'depth pending', record.domain]
      .filter(Boolean).forEach(value => meta.append(element('span', value, 'record-pill')));
    heading.append(meta);
    const chevron = element('span', '+', 'record-chevron');
    chevron.setAttribute('aria-hidden', 'true');
    summary.append(heading, chevron);
    const body = element('div', undefined, 'record-body');
    body.append(element('h3', 'Summary'), element('p', record.summary || record.question || 'Summary pending.', 'record-pane'));
    const sections = [
      ['Sources', arr(record.source_ids).join('\n') || 'No public source list is attached.'],
      ['Methods', record.method_summary || 'Method summary pending.'],
      ['Evidence', record.evidence_summary || 'Evidence summary pending.'],
      ['Ambiguities and failures', arr(record.ambiguities).concat(arr(record.failures)).join('\n') || 'No public ambiguity or failure notes are attached.']
    ];
    sections.forEach(([label, text]) => {
      const detail = element('details', undefined, 'record-detail');
      detail.append(element('summary', label), element('p', text, 'record-pane'));
      body.append(detail);
    });
    const downloads = element('div', undefined, 'download-row');
    arr(record.downloads).forEach(file => {
      if (!file || typeof file !== 'object') return;
      const href = publicHref(file.href);
      if (!href) return;
      const link = element('a', file.label || file.format || 'Open file', 'btn');
      link.href = href;
      downloads.append(link);
    });
    if (downloads.childElementCount) body.append(downloads);
    card.append(summary, body);
    return card;
  }

  function addOptions(select, values) {
    select.replaceChildren(select.options[0]);
    [...new Set(values.filter(value => typeof value === 'string' && value.trim()))].sort().forEach(value => {
      const option = element('option', value);
      option.value = norm(value);
      select.append(option);
    });
  }

  function applyFilters() {
    if (!loaded) return;
    const query = norm(search.value);
    const status = norm(statusFilter.value);
    const domain = norm(domainFilter.value);
    const depthChoice = norm(depthFilter.value);
    const rank = { light: 1, medium: 2, heavy: 3 };
    const filtered = records.filter(record => {
      const haystack = norm([record.record_id, record.title, record.question, record.summary, record.domain,
        arr(record.tags).join(' '), arr(record.source_ids).join(' ')].join(' '));
      return (!query || haystack.includes(query)) && (!status || norm(record.status) === status)
        && (!domain || norm(record.domain) === domain) && (!depthChoice || norm(record.test_depth) === depthChoice);
    });
    filtered.sort((a, b) => {
      switch (sortFilter.value) {
        case 'updated-asc': return String(a.updated_at || '').localeCompare(String(b.updated_at || ''));
        case 'title-asc': return String(a.title || a.record_id || '').localeCompare(String(b.title || b.record_id || ''));
        case 'depth-asc': return (rank[norm(a.test_depth)] || 9) - (rank[norm(b.test_depth)] || 9);
        case 'status-asc': return String(a.status || '').localeCompare(String(b.status || ''));
        default: return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
      }
    });
    list.replaceChildren(...filtered.map(recordCard));
    $('#archiveToolbar').hidden = records.length === 0;
    $('#archiveEmpty').hidden = records.length !== 0;
    $('#archiveNoMatch').hidden = !records.length || filtered.length !== 0;
    $('#archiveCount').textContent = records.length ? `${filtered.length} of ${records.length} records` : 'No released records';
    $('#archiveStatus').textContent = records.length ? 'Public archive loaded.' : 'Public archive loaded. No records released yet.';
    $('#clearFilters').hidden = ![search, statusFilter, domainFilter, depthFilter].some(control => control.value) && sortFilter.value === 'updated-desc';
  }

  function clearFilters() {
    [search, statusFilter, domainFilter, depthFilter].forEach(control => { control.value = ''; });
    sortFilter.value = 'updated-desc';
    applyFilters();
    search.focus();
  }
  $('#clearFilters').addEventListener('click', clearFilters);
  $('#resetSearch').addEventListener('click', clearFilters);
  controls.forEach(control => control.addEventListener(control === search ? 'input' : 'change', applyFilters));

  async function loadArchive() {
    loaded = false;
    $('#archiveError').hidden = true;
    $('#archiveEmpty').hidden = true;
    $('#archiveNoMatch').hidden = true;
    $('#archiveToolbar').hidden = true;
    $('#archiveStatus').textContent = 'Loading public records…';
    $('#archiveCount').textContent = 'Loading…';
    controls.forEach(control => { control.disabled = true; });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('trigon/manifest.json', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Manifest request failed');
      const manifest = await response.json();
      if (!manifest || !Array.isArray(manifest.records)) throw new Error('Invalid public manifest');
      records = manifest.records.filter(record => record && typeof record === 'object' && record.public_release === true);
      addOptions(statusFilter, records.map(record => record.status));
      addOptions(domainFilter, records.map(record => record.domain));
      loaded = true;
      controls.forEach(control => { control.disabled = false; });
      applyFilters();
    } catch {
      list.replaceChildren();
      $('#archiveStatus').textContent = 'Public archive connection unavailable.';
      $('#archiveCount').textContent = 'Unable to load';
      $('#archiveError').hidden = false;
    } finally {
      clearTimeout(timeout);
    }
  }
  $('#retryArchive').addEventListener('click', loadArchive);
  loadArchive();
})();

'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const pages = ['index.html','links.html','luna.html','aria.html','shadow.html','trigon-challenge.html','evidence.html','michael.html','ai-index.html','trigon-ledger.html','luna-prime.html','404.html'];

test('Only homepage may load the counter; no public page authorizes Abacus', () => {
  for (const p of pages) {
    const source = read(p);
    assert.doesNotMatch(source, /abacus\.jsn\.cam/i, p + ' third-party endpoint');
    if (p === 'index.html') {
      assert.match(source, /visitor-counter\.js\?v=20261124-gateway-entry/);
      assert.doesNotMatch(source, /data-first-party-counter=["']enabled/);
    } else assert.doesNotMatch(source, /src=["']visitor-counter\.js/i, p);
  }
});

test('Site scripts do not persist colour history or visitor identities', () => {
  const site = read('site.js');
  const client = read('visitor-counter.js');
  for (const [name, code] of [['site.js',site], ['visitor-counter.js',client]]) {
    assert.doesNotMatch(code, /\b(localStorage|sessionStorage|indexedDB)\b|\bdocument\.cookie\b/i, name);
  }
  assert.doesNotMatch(client, /https?:\/\/abacus\.jsn\.cam/);
  assert.match(client, /ENDPOINT\s*=\s*['"]\/api\/visits['"]/);
  assert.match(client, /if \(!ENABLED\)/, 'fail-closed client gate');
});

test('Reviewed CSS does not import a third-party asset', () => {
  for (const p of ['styles.css','gateway.css','gateway-intro.css','links-page.css','visitor-counter.css','usability.css']) {
    const s=read(p);
    assert.doesNotMatch(s, /@import\s+url\(\s*['"]?https?:|url\(\s*['"]?https?:/i, p);
  }
});

test('Home counter mounts but makes ZERO calls when not operator-activated', () => {
  let requests = 0, mounted = null;
  const mk = tag => ({
    tag, className:'', dataset:{}, attrs:{}, children:[], textContent:'',
    style:{setProperty(){}},
    classList:{add(){},remove(){},contains(){return false;}},
    setAttribute(k,v){this.attrs[k]=v;},
    append(...els){this.children.push(...els);},
    replaceChildren(...els){this.children=els;},
    addEventListener(){}, querySelectorAll(){return []},
    insertAdjacentElement(place,element){mounted=element;}
  });
  const target=mk('div');
  target.insertAdjacentElement=(where,what)=>{assert.equal(where,'afterend');mounted=what;};
  const doc={
    hidden:false,currentScript:{dataset:{}},body:mk('body'),documentElement:mk('html'),
    querySelector(q){return q==='.home-title .btns'?target:null;},
    createElement:mk,addEventListener(){}
  };
  vm.runInNewContext(read('visitor-counter.js'),{
    window:{matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}},
    document:doc,location:{pathname:'/',hostname:'universalbalancetheory.ca',protocol:'https:'},
    fetch(){requests++;throw Error('No third-party traffic permitted');},
    clearTimeout, setTimeout, AbortController, IntersectionObserver:undefined
  });
  assert.equal(requests,0,'no request, even on a real production hostname');
  assert.ok(mounted,'counter remains displayed on homepage');
  assert.equal(mounted.dataset.state,'paused');
  assert.equal(mounted.id,'visitorCounter');
});

test('Counter never mounts on a secondary page', () => {
  let count=0;
  vm.runInNewContext(read('visitor-counter.js'),{
    window:{},document:{querySelector(){count++;return null;}},
    location:{pathname:'/links.html',hostname:'universalbalancetheory.ca',protocol:'https:'}
  });
  assert.equal(count,1);
});

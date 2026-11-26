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
      assert.match(source, /visitor-counter\.js\?v=20261125-final-polish/);
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

function counterScene({enabled = false, failPost = false, failGet = false, observe = false, endpoint} = {}) {
  const calls = [], docListeners = {}, winListeners = {};
  const observers = [];
  let mounted = null, revealCount = 0;
  function element(tag) {
    const names = new Set();
    return {
      tag, className:'', dataset:{}, attrs:{}, children:[], textContent:'',
      style:{setProperty(){}},
      classList:{add(x){names.add(x)},remove(x){names.delete(x)},contains(x){return names.has(x)}},
      setAttribute(k,v){this.attrs[k]=v},
      append(...els){this.children.push(...els)},
      replaceChildren(...els){this.children=els},
      addEventListener(){},
      querySelectorAll(t){return this.children.filter(n=>n.tag===t)},
      animate(){revealCount++;return {cancel(){}}},
      insertAdjacentElement(where, el){assert.equal(where,'afterend');mounted=el;}
    };
  }
  const target=element('div');
  const doc={
    hidden:false,currentScript:{dataset:{...(enabled?{firstPartyCounter:'enabled'}:{}), ...(endpoint===undefined?{}:{counterEndpoint:endpoint})}},
    body:element('body'),documentElement:element('html'),
    querySelector(q){return q==='.home-title .btns'?target:null},
    createElement:element,
    addEventListener(name,fn){(docListeners[name]||=[]).push(fn)},
    emit(name){for(const fn of docListeners[name]||[])fn({type:name})}
  };
  const win={
    matchMedia:()=>({matches:false,addEventListener(){}}),
    addEventListener(name,fn){(winListeners[name]||=[]).push(fn)},
    emit(name){for(const fn of winListeners[name]||[])fn({type:name,persisted:true})}
  };
  class Observer {
    constructor(callback) { this.callback=callback; this.disconnected=false; observers.push(this); }
    observe(target) { this.target=target; this.disconnected=false; }
    disconnect() { this.disconnected=true; }
    // Disconnecting does not discard already queued IntersectionObserver entries.
    deliver() { this.callback([{target:this.target,isIntersecting:true}],this); }
  }
  vm.runInNewContext(read('visitor-counter.js'),{
    window:win,document:doc,location:{pathname:'/',hostname:'universalbalancetheory.ca',protocol:'https:'},
    async fetch(url,options){
      calls.push({url,method:options.method,credentials:options.credentials,mode:options.mode,referrerPolicy:options.referrerPolicy,...(endpoint===undefined?{}:{headers:options.headers,redirect:options.redirect})});
      if ((options.method==='POST'&&failPost)||(options.method==='GET'&&failGet)) throw new Error('synthetic outage');
      return {ok:true,json:async()=>({series:'homepage-openings-v1',value:12})};
    },
    setTimeout:()=>1,clearTimeout(){},AbortController,IntersectionObserver:observe?Observer:undefined
  });
  return {
    doc,win,calls,mounted,observers,
    entry(){
      doc.body.classList.add('intro-open');
      doc.documentElement.dataset.gatewayEntry='started';
      doc.emit('ubt:gateway-entry');
    },
    returned(){doc.body.classList.remove('intro-open');doc.emit('ubt:gateway-return');},
    reveals:()=>revealCount,
    flush:()=>new Promise(resolve=>setImmediate(resolve))
  };
}

test('Disabled live counter makes zero requests even after a real entry event',async()=>{
  const s=counterScene();
  s.entry();s.returned();
  s.doc.emit('visibilitychange');
  await s.flush();
  assert.equal(s.calls.length,0);
  assert.equal(s.mounted.dataset.state,'paused');
});
test('Enabled counter waits for automatic entry and sends exactly one credential-free POST',async()=>{
  const s=counterScene({enabled:true});
  await s.flush();
  assert.equal(s.calls.length,0);
  s.doc.emit('ubt:gateway-entry'); // no started marker
  await s.flush();
  assert.equal(s.calls.length,0);
  s.entry();
  await s.flush();
  assert.deepEqual(s.calls,[{url:'/api/visits',method:'POST',credentials:'omit',mode:'same-origin',referrerPolicy:'no-referrer'}]);
  assert.equal(s.mounted.dataset.total,'12');
  assert.equal(s.mounted.dataset.state,'ready');
  assert.equal(s.reveals(),0,'rolling digits wait until the intro returns');
  s.returned();
  assert.ok(s.reveals()>0);
  const n=s.reveals();
  s.doc.hidden=true;s.doc.emit('visibilitychange');
  s.doc.hidden=false;s.doc.emit('visibilitychange');
  s.win.emit('pageshow');s.doc.emit('ubt:gateway-entry');s.returned();
  await s.flush();
  assert.equal(s.calls.length,1);
  assert.equal(s.reveals(),n);
});
test('Uncertain POST is never retried; GET is read-only fallback',async()=>{
  const s=counterScene({enabled:true,failPost:true});
  s.entry();await s.flush();
  s.doc.emit('ubt:gateway-entry');s.returned();await s.flush();
  assert.deepEqual(s.calls.map(x=>x.method),['POST','GET']);
  assert.equal(s.mounted.dataset.total,'12');
});
test('Both unavailable responses display no invented number',async()=>{
  const s=counterScene({enabled:true,failPost:true,failGet:true});
  s.entry();await s.flush();
  assert.deepEqual(s.calls.map(x=>x.method),['POST','GET']);
  assert.equal(s.mounted.dataset.state,'unavailable');
  assert.equal(s.mounted.dataset.total,undefined);
});

test('Queued entries from a replaced observer cannot interrupt the current reveal',async()=>{
  const s=counterScene({enabled:true,observe:true});
  s.entry();await s.flush();s.returned();
  const stale=s.observers.at(-1);
  assert.ok(stale,'returned homepage waits for the counter to enter the viewport');
  s.doc.hidden=true;s.doc.emit('visibilitychange');
  s.doc.hidden=false;s.doc.emit('visibilitychange');
  const current=s.observers.at(-1);
  assert.notEqual(current,stale,'visible return creates a fresh observation');
  assert.equal(stale.disconnected,true);
  assert.doesNotThrow(()=>stale.deliver());
  assert.equal(s.reveals(),0,'stale queued entry does not consume the pending reveal');
  assert.equal(current.disconnected,false,'stale callback does not disconnect its replacement');
  assert.doesNotThrow(()=>current.deliver());
  assert.ok(s.reveals()>0,'current observer reveals the digits');
  const count=s.reveals();
  assert.doesNotThrow(()=>current.deliver());
  assert.doesNotThrow(()=>stale.deliver());
  assert.equal(s.reveals(),count,'queued callbacks do not replay the reels');
  assert.equal(s.calls.length,1,'observation lifecycle never increments again');
});

test('BFCache restoration reconnects a reveal that has not reached the viewport',async()=>{
  const s=counterScene({enabled:true,observe:true});
  s.entry();await s.flush();s.returned();
  const stale=s.observers.at(-1);
  s.win.emit('pagehide');
  assert.equal(stale.disconnected,true);
  s.win.emit('pageshow');
  const current=s.observers.at(-1);
  assert.notEqual(current,stale,'pageshow alone reconnects the pending viewport observation');
  assert.doesNotThrow(()=>stale.deliver());
  assert.equal(s.reveals(),0);
  assert.equal(current.disconnected,false);
  assert.doesNotThrow(()=>current.deliver());
  assert.ok(s.reveals()>0);
  assert.equal(s.calls.length,1,'cached document does not create another entry');
});

const isolatedEndpoint='https://ubt-first-party-counter.example-account.workers.dev/api/visits';
test('Isolated counter remains paused without the explicit activation flag',async()=>{
  const s=counterScene({endpoint:isolatedEndpoint});
  s.entry();s.returned();await s.flush();
  assert.equal(s.calls.length,0);
  assert.equal(s.mounted.dataset.state,'paused');
});
test('Approved isolated candidate sends one credential-free CORS POST, no redirects',async()=>{
  const s=counterScene({enabled:true,endpoint:isolatedEndpoint});
  s.entry();await s.flush();s.returned();s.entry();await s.flush();
  assert.equal(s.calls.length,1);
  const c=s.calls[0];
  assert.equal(c.url,isolatedEndpoint);
  assert.equal(c.method,'POST');
  assert.equal(c.mode,'cors');
  assert.equal(c.credentials,'omit');
  assert.equal(c.referrerPolicy,'no-referrer');
  assert.equal(c.redirect,'error');
  assert.equal(c.headers['X-UBT-Gateway'],'1');
  assert.equal(s.mounted.dataset.total,'12');
});
test('Isolated lost POST response never triggers another POST',async()=>{
  const s=counterScene({enabled:true,endpoint:isolatedEndpoint,failPost:true});
  s.entry();await s.flush();s.returned();
  assert.deepEqual(s.calls.map(x=>x.method),['POST','GET']);
  assert.equal(s.calls[1].headers,undefined);
});
test('An invalid isolated endpoint fails closed instead of falling back',async()=>{
  for(const endpoint of ['', 'https://evil.example/api/visits',isolatedEndpoint+'?x=1',isolatedEndpoint.replace('https:','http:'),isolatedEndpoint.replace('/api/visits','/bad')]){
    const s=counterScene({enabled:true,endpoint});
    s.entry();s.returned();await s.flush();
    assert.equal(s.calls.length,0);
    assert.equal(s.mounted.dataset.state,'paused');
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.mjs';

const endpoint = 'https://universalbalancetheory.ca/api/visits';
function db(value = 0, throwError = false) {
  const store = { value, writes: 0, statements: [] };
  return {
    store,
    prepare(sql) {
      store.statements.push(sql);
      return {
        async first() {
          if (throwError) throw new Error('sensitive database error that must not leak');
          if (/^UPDATE visits/.test(sql)) {
            store.value++;
            store.writes++;
          } else if (!/^SELECT value FROM visits/.test(sql)) {
            throw Error('Unexpected query');
          }
          return { value: store.value };
        }
      };
    }
  };
}
function request(method = 'GET', url = endpoint, headers = {}) {
  return new Request(url, {method, headers});
}
function post(url = endpoint, extra = {}) {
  return request('POST',url,{'Origin':new URL(url).origin,'Sec-Fetch-Site':'same-origin', ...extra});
}
async function output(resp) {
  const body=await resp.json();
  return {status:resp.status,body,headers:resp.headers};
}

test('Read-only GET returns exactly the aggregate, no write', async () => {
 const d=db(17);
 const x=await output(await worker.fetch(request(),{DB:d}));
 assert.equal(x.status,200);
 assert.deepEqual(x.body,{series:'homepage-openings-v1',value:17});
 assert.equal(d.store.writes,0);
 assert.equal(x.headers.get('Cache-Control'),'no-store, max-age=0');
 assert.equal(x.headers.get('Set-Cookie'),null);
 assert.equal(x.headers.get('Access-Control-Allow-Origin'),null);
});

test('Same-origin POST atomically increments the homepage count', async () => {
 const d=db(3);
 for(const expected of [4,5,6]) {
   const x=await output(await worker.fetch(post(),{DB:d}));
   assert.equal(x.status,200);
   assert.equal(x.body.value,expected);
 }
 assert.equal(d.store.writes,3);
 assert.ok(d.store.statements.every(s=>s.startsWith('UPDATE visits SET value = value + 1')));
});

test('Cross-site or missing Origin cannot increment', async () => {
 const d=db(7);
 for(const req of [
   request('POST',endpoint,{}),
   request('POST',endpoint,{'Origin':'https://evil.example'}),
   post(endpoint,{'Sec-Fetch-Site':'cross-site'}),
   post(endpoint,{'Sec-Fetch-Site':'same-site'})
 ]) {
   const x=await output(await worker.fetch(req,{DB:d}));
   assert.equal(x.status,403);
 }
 assert.equal(d.store.writes,0);
});

test('Only exact endpoint and approved HTTP methods are served',async () => {
 const d=db();
 for(const url of [endpoint+'/bad',endpoint+'?test=1','https://another.example/api/visits']) {
   const x=await output(await worker.fetch(request('GET',url),{DB:d}));
   assert.notEqual(x.status,200);
 }
 const denied=await output(await worker.fetch(request('DELETE'),{DB:d}));
 assert.equal(denied.status,405);
 assert.equal(denied.headers.get('Allow'),'GET, POST');
 assert.equal(d.store.writes,0);
});

test('WWW hostname works with matching same-origin Origin',async () => {
 const d=db();
 const x=await output(await worker.fetch(post('https://www.universalbalancetheory.ca/api/visits'),{DB:d}));
 assert.equal(x.status,200);
 assert.equal(x.body.value,1);
});

test('Localhost is denied unless explicitly in dev mode', async () => {
 const d=db();
 const url='http://127.0.0.1:8787/api/visits';
 assert.equal((await worker.fetch(request('GET',url),{DB:d})).status,404);
 assert.equal((await worker.fetch(request('GET',url),{DB:d,DEV:'true'})).status,200);
});

test('Without D1 binding or migration record the counter fails closed', async () => {
 const unbound=await output(await worker.fetch(post(),{}));
 assert.equal(unbound.status,503);
 const missing={prepare(){return {async first(){return null;}}}};
 assert.equal((await worker.fetch(request(),{DB:missing})).status,503);
});

test('Database errors do not leak headers, visitor data, or stack details',async () => {
 const d=db(0,true);
 const req=post(endpoint,{'User-Agent':'PRIVATE-USER-AGENT','X-Visitor-Secret':'PRIVATE-VALUE'});
 const x=await output(await worker.fetch(req,{DB:d}));
 assert.equal(x.status,503);
 assert.deepEqual(x.body,{error:'Counter unavailable'});
 assert.doesNotMatch(JSON.stringify(x.body),/PRIVATE|database error/i);
 assert.equal(x.headers.get('Access-Control-Allow-Origin'),null);
});

test('No application-side visitor records are written', async () => {
 const d=db();
 const r=post(endpoint,{'User-Agent':'Safari example','X-Client-IP':'192.0.2.9'});
 await worker.fetch(r,{DB:d});
 assert.deepEqual(Object.keys(d.store).sort(),['statements','value','writes']);
 assert.equal(d.store.statements.length,1);
 assert.equal(d.store.value,1);
});

test('Reject malformed or non-integer database values', async () => {
 for(const value of [-1, NaN, '7', Number.MAX_SAFE_INTEGER+2]) {
   const d=db(value);
   const x=await output(await worker.fetch(request(),{DB:d}));
   assert.equal(x.status,503);
 }
});

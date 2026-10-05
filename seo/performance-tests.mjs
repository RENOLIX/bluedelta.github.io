import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const source=fs.readFileSync('src/catalog-client.js','utf8');
const originalFetch=globalThis.fetch;
const photo='data:image/webp;base64,dGVzdA==';
const local=[{id:'old',name:'Old',image:'admin-old.webp',imageHash:createHash('sha256').update(photo).digest('hex')}];
const fields={name:{stringValue:'Updated'},price:{integerValue:'3000'},stock:{integerValue:'7'},active:{booleanValue:true},image:{stringValue:photo},benefits:{arrayValue:{values:[{stringValue:'Benefit'}]}}};
let calls=[];
globalThis.fetch=async url=>{
  calls.push(String(url));
  if(url==='/products.json')return{ok:true,json:async()=>local};
  return{ok:true,json:async()=>String(url).includes('pageToken=next')?{documents:[{name:'products/inactive',fields:{active:{booleanValue:false}}}]}:{documents:[{name:'products/old',fields}],nextPageToken:'next'}};
};
try{
  const module=await import('data:text/javascript,'+encodeURIComponent(source));
  const fallback=await module.localCatalog;
  const [first,second]=await Promise.all([module.loadProducts(fallback),module.loadProducts(fallback)]);
  assert.equal(first,second,'One catalogue request is shared across callers');
  assert.equal(calls.filter(url=>url.includes('firestore')).length,2,'Pagination reads every page once');
  assert.equal(first.length,1,'Inactive products are excluded');
  assert.equal(first[0].name,'Updated','Admin changes replace snapshot data');
  assert.equal(first[0].price,3000);
  assert.equal(first[0].stock,7);
  assert.equal(first[0].image,'admin-old.webp','Identical admin photo reuses the optimized local asset');
  assert.deepEqual(first[0].benefits,['Benefit']);
  globalThis.fetch=async url=>url==='/products.json'?{ok:true,json:async()=>local}:{ok:false,status:403};
  const offline=await import('data:text/javascript,'+encodeURIComponent(source+'\n// offline'));
  assert.equal(await offline.loadProducts(await offline.localCatalog),local,'A denied/offline catalogue retains the real snapshot');
  assert.deepEqual(module.decodeValue({mapValue:{fields:{empty:{nullValue:null},quantity:{doubleValue:1.5}}}}),{empty:null,quantity:1.5});
  console.log('Catalogue: shared requests, pagination, admin updates, stock, active filtering, photo reuse, nested decoding and offline fallback verified.');
}finally{globalThis.fetch=originalFetch}

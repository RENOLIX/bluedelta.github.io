import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {topics} from '../seo-topics.mjs';
const titles=new Set(),descriptions=new Set(),errors=[];
let count=0;
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory()){visit(file);continue;}
 if(entry.name!=='index.html'||file.includes(path.join('dist','admin')))continue;
 const html=fs.readFileSync(file,'utf8');count++;
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];
 const desc=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 if(!title||titles.has(title))errors.push(file+' missing/duplicate title');titles.add(title);
 if(!desc||descriptions.has(desc))errors.push(file+' missing/duplicate description');descriptions.add(desc);
 if(!file.includes(path.join('dist','produit','index.html'))&&(html.match(/<h1[ >]/g)||[]).length!==1)errors.push(file+' H1 count');
 const schema=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
 try{JSON.parse(schema)}catch{errors.push(file+' invalid JSON-LD')}
 for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)){
  let target=path.join('dist',decodeURIComponent(match[1]));
  if(match[1].endsWith('/'))target=path.join(target,'index.html');
  if(!fs.existsSync(target))errors.push(file+' missing target '+match[1]);
 }
}}
visit('dist');
for(const topic of topics){assert.equal(topic.keywords.length,50);assert.equal(new Set(topic.keywords).size,50)}
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
for(const topic of topics)assert.ok(sitemap.includes('/guides/'+topic.slug+'/'));
const snapshot=JSON.parse(fs.readFileSync('catalog-snapshot.json','utf8'));
const normalize=text=>text.replace(/[\s\u00a0\u202f]/g,'');
for(const product of snapshot){
 const html=fs.readFileSync(`dist/produits/${product.id}/index.html`,'utf8');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(Number(graph.find(item=>item['@type']==='Product').offers.price),product.price,product.id+' structured price');
 const offer=graph.find(item=>item['@type']==='Product').offers;
 assert.equal(offer.availability,Number.isFinite(product.stock)&&product.stock<=0?'https://schema.org/OutOfStock':'https://schema.org/InStock');
 assert.equal(offer.shippingDetails.shippingRate.value,0);
 assert.equal(offer.shippingDetails.shippingRate.currency,offer.priceCurrency);
 assert.equal(offer.shippingDetails.shippingDestination.addressCountry,'DZ');
 assert.equal(offer.shippingDetails.deliveryTime.transitTime.maxValue,2);
 assert.equal(offer.hasMerchantReturnPolicy.merchantReturnDays,14);
 assert.equal(offer.hasMerchantReturnPolicy.returnFees,'https://schema.org/ReturnFeesCustomerResponsibility');
 const price=html.match(/class="detail-price">([^<]+)/)?.[1]||'';
 assert.ok(normalize(price).startsWith(String(product.price)+'DA'),product.id+' visible price');
 assert.ok(sitemap.includes('/produits/'+product.id+'/'));
}
for(const route of ['','produits/','guides/',...topics.map(topic=>'guides/'+topic.slug+'/')]){
 const html=fs.readFileSync(`dist/${route}index.html`,'utf8');
 assert.ok(html.includes(`<link rel="canonical" href="https://bluedelta.dz/${route}">`),'canonical '+route);
 assert.ok(html.includes('content="index,follow,max-image-preview:large"'),'indexable '+route);
 const title=html.match(/<title>(.*?)<\/title>/)[1];
 assert.ok(html.includes(`name="twitter:title" content="${title}"`),'social title '+route);
}
for(const topic of topics){
 const html=fs.readFileSync(`dist/guides/${topic.slug}/index.html`,'utf8');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const faq=graph.find(item=>item['@type']==='FAQPage');
 for(const question of faq.mainEntity){assert.ok(html.includes(question.name));assert.ok(html.includes(question.acceptedAnswer.text));}
}
const catalogueHtml=fs.readFileSync('dist/produits/index.html','utf8');
const catalogueGraph=JSON.parse(catalogueHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
assert.equal(catalogueGraph.find(item=>item['@type']==='CollectionPage').mainEntity.itemListElement.length,snapshot.length);
const rootHtml=fs.readFileSync('dist/index.html','utf8');
const policyHtml=fs.readFileSync('dist/livraison-retours/index.html','utf8');
for(const wording of ['48 heures','14 jours','Paiement à réception','livraison des produits BLUE DELTA est gratuite'])assert.ok(policyHtml.includes(wording));
assert.ok(!fs.readFileSync('dist/conditions/index.html','utf8').includes('unité est de 3 000'));
for(const topic of topics)assert.ok(rootHtml.includes(`href="/guides/${topic.slug}/"`),'linked from home: '+topic.slug);
const activeIds=new Set(snapshot.map(product=>product.id));
for(const entry of fs.readdirSync('dist/produits',{withFileTypes:true}).filter(entry=>entry.isDirectory()&&!activeIds.has(entry.name))){
 assert.ok(!sitemap.includes('/produits/'+entry.name+'/'),'removed product not in sitemap');
 assert.ok(fs.readFileSync(`dist/produits/${entry.name}/index.html`,'utf8').includes('content="noindex,nofollow"'));
}
assert.equal(errors.length,0,errors.join('\n'));
console.log(`Verified ${count} public HTML pages, unique titles/descriptions, H1s, JSON-LD and local links; ${topics.length*50} keyword candidates.`);

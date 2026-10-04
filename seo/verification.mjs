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
assert.equal(errors.length,0,errors.join('\n'));
console.log(`Verified ${count} public HTML pages, unique titles/descriptions, H1s, JSON-LD and local links; ${topics.length*50} keyword candidates.`);

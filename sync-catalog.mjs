import fs from 'node:fs';
import crypto from 'node:crypto';

const source=process.argv[2];
const endpoint='https://firestore.googleapis.com/v1/projects/bluedelta-eae0a/databases/(default)/documents/products?pageSize=100&key=AIzaSyDo-JGqAlPGpRU9fQ6iRZD0esHHvBjdJwE';
const response=source?JSON.parse(fs.readFileSync(source,'utf8').replace(/^\uFEFF/,'')):await fetch(endpoint).then(r=>{if(!r.ok)throw Error(`Firestore HTTP ${r.status}`);return r.json()});
const decode=value=>{
  if('stringValue'in value)return value.stringValue;
  if('integerValue'in value)return Number(value.integerValue);
  if('doubleValue'in value)return Number(value.doubleValue);
  if('booleanValue'in value)return value.booleanValue;
  if('nullValue'in value)return null;
  if('arrayValue'in value)return(value.arrayValue.values||[]).map(decode);
  if('mapValue'in value)return Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([key,item])=>[key,decode(item)]));
  return undefined;
};
const products=(response.documents||[]).map(document=>({id:document.name.split('/').pop(),...Object.fromEntries(Object.entries(document.fields||{}).map(([key,value])=>[key,decode(value)]))})).filter(p=>p.id!=='_catalog'&&p.active!==false).sort((a,b)=>(a.position??999)-(b.position??999)||a.name.localeCompare(b.name,'fr'));
fs.mkdirSync('dist/assets',{recursive:true});
const snapshot=products.map(product=>{
  const p={...product};
  p.imageHash=crypto.createHash('sha256').update(p.image||'').digest('hex');
  const match=/^data:image\/(png|jpeg|webp);base64,(.+)$/s.exec(p.image||'');
  if(match){
    if(!/^[a-z0-9-]+$/.test(p.id))throw Error(`Identifiant produit invalide : ${p.id}`);
    const extension=match[1]==='jpeg'?'jpg':match[1];
    p.image=`admin-${p.id}.${extension}`;
    fs.writeFileSync(`dist/assets/${p.image}`,Buffer.from(match[2],'base64'));
  }
  return p;
});
fs.writeFileSync('catalog-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');
console.log(`Instantané Firebase : ${snapshot.length} produits et leurs photos.`);

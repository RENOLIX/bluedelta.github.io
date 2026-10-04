import {loadProducts,submitOrder,imageUrl} from './firebase-client.js?v=3';

const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('fr-DZ').format(Number(value)||0)+' DA';
const local=await fetch('/products.json').then(r=>r.json());
const products=await loadProducts(local);
async function matchesSnapshot(){
  if(products===local)return true;
  if(products.length!==local.length)return false;
  try{
    for(const product of products){
      const saved=local.find(p=>p.id===product.id);
      if(!saved)return false;
      for(const key of ['name','subtitle','cat','format','price','stock','description','applications','tag','active','position','tech','color','temp'])if(JSON.stringify(product[key]??null)!==JSON.stringify(saved[key]??null))return false;
      if(JSON.stringify(product.benefits||[])!==JSON.stringify(saved.benefits||[]))return false;
      const bytes=new TextEncoder().encode(product.image||'');
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
      if(hash!==saved.imageHash)return false;
    }
    return true;
  }catch{return false}
}
const snapshotMatches=await matchesSnapshot();
const byId=Object.fromEntries(products.map(p=>[p.id,p]));
const detailUrl=p=>local.some(x=>x.id===p.id)?`/produits/${encodeURIComponent(p.id)}/`:`/produit/?id=${encodeURIComponent(p.id)}`;
const photo=p=>esc(imageUrl(p));
const isOut=p=>Number.isInteger(p.stock)&&p.stock<=0;

function card(p){
  return `<article class="product-card" data-cat="${esc(p.cat)}" data-name="${esc((p.name+' '+(p.subtitle||'')).toLowerCase())}"><a class="product-picture" href="${detailUrl(p)}"><span class="pill">${esc(p.format||'Produit')}</span><img src="${photo(p)}" alt="${esc(p.name)} BLUE DELTA" loading="lazy"></a><div class="card-copy"><div class="card-cat">${p.cat==='industrie'?'Industrie':'Automobile & BTP'}</div><h3><a href="${detailUrl(p)}">${esc(p.name)}</a></h3><p>${esc(p.subtitle||'')}</p><div class="card-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${esc(p.id)}" aria-label="Ajouter ${esc(p.name)} au panier" ${isOut(p)?'disabled title="Rupture de stock"':''}>+</button></div>${isOut(p)?'<small class="stock-badge">Rupture de stock</small>':''}</div></article>`;
}

const grid=$('#catalog-grid')||$('.product-grid');
if(grid){
  let displayed=products;
  if(grid.dataset.guideProducts)displayed=products.filter(p=>grid.dataset.guideProducts.split(',').includes(p.id));
  else if(location.pathname==='/')displayed=[products[0],products[2],products[8],products[10]].filter(Boolean);
  else if(location.pathname.startsWith('/produits/')&&location.pathname!=='/produits/'){
    const id=location.pathname.split('/')[2];const current=byId[id];
    if(current)displayed=products.filter(p=>p.cat===current.cat&&p.id!==id).slice(0,4);
  }
  if(!snapshotMatches)grid.innerHTML=displayed.map(card).join('');
  if($('#catalog-grid')){
    const selected=new URLSearchParams(location.search).get('categorie');
    const category=['auto','industrie'].includes(selected)?selected:'all';
    let count=0;
    grid.querySelectorAll('.product-card').forEach(el=>{el.hidden=category!=='all'&&el.dataset.cat!==category;if(!el.hidden)count++});
    if($('#result-count'))$('#result-count').textContent=count+' produit'+(count>1?'s':'');
    document.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('active',button.dataset.filter===category);button.setAttribute('aria-pressed',button.dataset.filter===category)});
    $('#product-search')?.dispatchEvent(new Event('input'));
  }
}

const oldId=location.pathname.match(/^\/produits\/([^/]+)\/$/)?.[1];
if(oldId){
  const p=byId[oldId];
  if(!p){$('main').innerHTML='<div class="wrap empty"><h1>Produit indisponible</h1><a href="/produits/" class="btn">Retour au catalogue</a></div>';}
  else if(!snapshotMatches){
    const image=$('.detail-image img');if(image){image.src=imageUrl(p);image.alt=p.name+' BLUE DELTA'}
    if($('.detail-copy h1'))$('.detail-copy h1').textContent=p.name;
    if($('.detail-copy .subtitle'))$('.detail-copy .subtitle').textContent=p.subtitle||'';
    if($('.detail-copy .desc'))$('.detail-copy .desc').textContent=p.description||'';
    if($('.detail-copy .format'))$('.detail-copy .format').textContent=p.format||'';
    if($('.detail-price'))$('.detail-price').innerHTML=`${money(p.price)} <small>/ unité</small>`;
    if($('.detail-image .pill'))$('.detail-image .pill').textContent=p.tag||p.format||'';
    if($('.detail-copy .eyebrow'))$('.detail-copy .eyebrow').textContent=p.cat==='industrie'?'Industrie':'Automobile & BTP';
    const breadcrumb=$('main .breadcrumb span:last-child');if(breadcrumb)breadcrumb.textContent=p.name;
    const add=$('.purchase [data-add]');if(add){add.disabled=isOut(p);add.textContent=isOut(p)?'Rupture de stock':'Ajouter au panier'}
    const sections=[...document.querySelectorAll('main .detail-sections')];
    if(sections[0])sections[0].innerHTML=`<div><h2>Applications</h2><p>${esc(p.applications||'Contactez notre équipe pour vérifier la compatibilité avec votre application.')}</p></div><div><h2>Informations produit</h2><table class="specs"><tr><th>Catégorie</th><td>${p.cat==='industrie'?'Industrie':'Automobile & BTP'}</td></tr><tr><th>Format</th><td>${esc(p.format||'À confirmer')}</td></tr><tr><th>Disponibilité</th><td>${isOut(p)?'Rupture de stock':'À confirmer avec BLUE DELTA'}</td></tr></table></div>`;
    sections.slice(1).forEach(section=>section.closest('section')?.remove());
  }
}

if($('#dynamic-detail')){
  const p=byId[new URLSearchParams(location.search).get('id')];
  $('#dynamic-detail').innerHTML=p?`<div class="wrap"><div class="breadcrumb"><a href="/">Accueil</a><span>/</span><a href="/produits/">Nos produits</a><span>/</span><span>${esc(p.name)}</span></div><section class="product-detail"><div class="detail-image"><span class="pill">${esc(p.tag||p.format||'Produit')}</span><img src="${photo(p)}" alt="${esc(p.name)} BLUE DELTA"></div><div class="detail-copy"><div class="eyebrow">${p.cat==='industrie'?'Industrie':'Automobile & BTP'}</div><h1>${esc(p.name)}</h1><p class="subtitle">${esc(p.subtitle||'')}</p><p class="desc">${esc(p.description||'')}</p><span class="format">${esc(p.format||'')}</span><div class="detail-price">${money(p.price)} <small>/ unité</small></div><p class="fine">Livraison et disponibilité à confirmer.</p><div class="purchase"><div class="quantity"><button type="button" data-qty-step="-1">−</button><input id="product-quantity" type="number" min="1" max="99" value="1" aria-label="Quantité"><button type="button" data-qty-step="1">+</button></div><button class="btn" data-add="${esc(p.id)}" data-detail ${isOut(p)?'disabled':''}>${isOut(p)?'Rupture de stock':'Ajouter au panier'}</button></div><a href="/contact/?produit=${encodeURIComponent(p.id)}" class="btn outline full">Demander un conseil</a></div></section></div><section class="section gray"><div class="wrap detail-sections"><div><h2>Applications</h2><p>${esc(p.applications||'Contactez notre équipe pour vérifier la compatibilité avec votre application.')}</p></div><div><h2>Informations produit</h2><table class="specs"><tr><th>Catégorie</th><td>${p.cat==='industrie'?'Industrie':'Automobile & BTP'}</td></tr><tr><th>Format</th><td>${esc(p.format||'À confirmer')}</td></tr><tr><th>Disponibilité</th><td>${isOut(p)?'Rupture de stock':'À confirmer avec BLUE DELTA'}</td></tr></table></div></div></section>`:'<div class="wrap empty"><h1>Produit introuvable</h1><p>Cette référence n’est plus disponible.</p><a href="/produits/" class="btn">Voir le catalogue</a></div>';
  if(p)document.title=p.name+' | BLUE DELTA';
}

// La commande est réellement enregistrée avant d'afficher une confirmation.
$('#checkout-form')?.addEventListener('submit',async event=>{
  event.preventDefault();event.stopImmediatePropagation();
  const form=event.currentTarget,button=form.querySelector('button[type="submit"]'),result=$('#checkout-result');
  let cart={};try{cart=JSON.parse(localStorage.getItem('bluedelta-cart')||'{}')}catch{}
  const items=Object.entries(cart).map(([id,quantity])=>({product:byId[id],quantity:Number(quantity)})).filter(x=>x.product&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=99);
  if(!items.length){result.hidden=false;result.innerHTML='<p>Votre panier est vide. <a href="/produits/">Voir les produits</a></p>';return}
  const data=new FormData(form),wilaya=$('#wilaya')?.selectedOptions?.[0]?.textContent||data.get('wilaya');
  const payload={name:String(data.get('name')||'').trim(),phone:String(data.get('phone')||'').trim(),company:String(data.get('company')||'').trim(),email:String(data.get('email')||'').trim(),wilaya:String(wilaya||''),commune:String(data.get('commune')||''),address:String(data.get('address')||'').trim(),message:String(data.get('message')||'').trim(),items:items.map(({product,quantity})=>({id:product.id,name:product.name,format:product.format||'',image:product.image||'',price:Number(product.price),quantity})),total:items.reduce((sum,{product,quantity})=>sum+Number(product.price)*quantity,0),source:'site'};
  button.disabled=true;button.textContent='Envoi en cours…';
  try{const ref=await submitOrder(payload);result.hidden=false;result.innerHTML=`<h3>Commande reçue</h3><p>Votre demande a été enregistrée sous la référence <strong>${esc(ref.id)}</strong>. BLUE DELTA vous contactera pour confirmer la disponibilité, la livraison et le paiement.</p><a class="btn outline" href="/produits/">Retour aux produits</a>`;form.hidden=true;localStorage.removeItem('bluedelta-cart');result.scrollIntoView({behavior:'smooth',block:'center'})}
  catch(error){console.error(error);result.hidden=false;result.innerHTML='<h3>Envoi impossible</h3><p>Votre commande n’a pas été enregistrée. Vérifiez votre connexion et réessayez, ou contactez BLUE DELTA par téléphone.</p>';button.disabled=false;button.textContent='Réessayer l’envoi'}
},true);

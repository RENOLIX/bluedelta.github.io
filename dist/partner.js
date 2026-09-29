import {loadProducts,submitPartnership,imageUrl} from './firebase-client.js';

async function notifyWeb3Forms(payload,reference){
  const data=new FormData();
  // Web3Forms may decode multipart field names as Latin-1. Keep labels ASCII;
  // field values remain UTF-8 so names, communes and product names keep accents.
  const fields={access_key:'ff2db899-0440-4431-8422-ad44b4061148',subject:`Nouvelle demande de partenariat BLUE DELTA - ${payload.company}`,from_name:'BLUE DELTA - Site web',replyto:payload.email,'Reference admin':reference,'Nom et prenom':payload.name,'Entreprise / enseigne':payload.company,'Telephone':payload.phone,'E-mail':payload.email,'Activite':payload.activity,'Volume envisage':payload.volume,'Wilaya':payload.wilaya,'Commune':payload.commune,'Produits souhaites':payload.products.map(p=>p.name).join(' ; '),'Projet / besoins':payload.message||'Non précisé','Consentement au traitement des donnees':'Oui'};
  for(const [key,value] of Object.entries(fields))data.append(key,value);
  const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:data});
  const result=await response.json();
  if(!response.ok||!result.success)throw Error(result.message||'Notification Web3Forms impossible');
}

const form=document.querySelector('#partner-form');
if(form){
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local=await fetch('/products.json').then(r=>r.json());
  const products=await loadProducts(local);
  document.querySelector('#partner-products').innerHTML=products.map(p=>`<label class="partner-product"><input type="checkbox" name="products" value="${esc(p.id)}"><img src="${esc(imageUrl(p))}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.format||'')} · ${p.cat==='industrie'?'Industrie':'Automobile & BTP'}</small></span></label>`).join('');
  const locations=await fetch('/locations.json').then(r=>r.json());
  const wilaya=document.querySelector('#partner-wilaya'),commune=document.querySelector('#partner-commune');
  wilaya.innerHTML='<option value="">Choisir une wilaya</option>'+locations.map(w=>`<option value="${esc(w.code)}">${esc(w.code)} — ${esc(w.name)}</option>`).join('');
  wilaya.addEventListener('change',()=>{const selected=locations.find(w=>w.code===wilaya.value);commune.innerHTML='<option value="">Choisir une commune</option>'+(selected?selected.communes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''):'');commune.disabled=!selected});
  form.addEventListener('submit',async event=>{
    event.preventDefault();const result=document.querySelector('#partner-result'),button=form.querySelector('button[type="submit"]');
    const data=new FormData(form),ids=data.getAll('products');
    if(!ids.length){result.hidden=false;result.innerHTML='<p>Choisissez au moins un produit avant d’envoyer votre demande.</p>';return}
    const payload={name:String(data.get('name')||'').trim(),company:String(data.get('company')||'').trim(),phone:String(data.get('phone')||'').trim(),email:String(data.get('email')||'').trim(),activity:String(data.get('activity')||''),volume:String(data.get('volume')||''),wilaya:wilaya.selectedOptions[0].textContent,commune:String(data.get('commune')||''),products:ids.map(id=>({id,name:products.find(p=>p.id===id)?.name||id})),message:String(data.get('message')||'').trim()};
    button.disabled=true;button.textContent='Envoi en cours…';
    let ref;
    try{ref=await submitPartnership(payload)}
    catch(error){console.error(error);result.hidden=false;result.innerHTML='<h3>Envoi impossible</h3><p>Votre demande n’a pas été enregistrée. Vérifiez votre connexion puis réessayez, ou contactez notre équipe par téléphone.</p>';button.disabled=false;button.textContent='Réessayer l’envoi';return}
    form.hidden=true;result.hidden=false;result.innerHTML='<p>Demande enregistrée. Envoi de la notification en cours…</p>';result.scrollIntoView({behavior:'smooth',block:'center'});
    const sendNotification=async()=>{try{await notifyWeb3Forms(payload,ref.id);result.innerHTML=`<h3>Demande envoyée</h3><p>Merci ${esc(payload.name)}. Votre référence est <strong>${esc(ref.id)}</strong>. Notre équipe vous recontactera pour étudier votre projet.</p>`}catch(error){console.error(error);result.innerHTML=`<h3>Demande enregistrée dans l’administration</h3><p>Votre référence est <strong>${esc(ref.id)}</strong>. La notification e-mail n’a pas pu être transmise.</p><button type="button" class="btn outline" id="partner-retry-email">Réessayer la notification</button>`;result.querySelector('#partner-retry-email').addEventListener('click',()=>{result.innerHTML='<p>Nouvel essai de notification…</p>';sendNotification()},{once:true})}};
    await sendNotification();
  });
}

import {loadProducts,submitPartnership,imageUrl} from './firebase-client.js';

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
    try{const ref=await submitPartnership(payload);result.hidden=false;result.innerHTML=`<h3>Demande enregistrée</h3><p>Merci ${esc(payload.name)}. Votre référence est <strong>${esc(ref.id)}</strong>. Notre équipe vous recontactera pour étudier votre projet.</p>`;form.hidden=true;result.scrollIntoView({behavior:'smooth',block:'center'})}
    catch(error){console.error(error);result.hidden=false;result.innerHTML='<h3>Envoi impossible</h3><p>Vérifiez votre connexion puis réessayez, ou contactez notre équipe par téléphone.</p>';button.disabled=false;button.textContent='Réessayer l’envoi'}
  });
}

import {auth,ADMIN_UID,login,logout,watchAuth,hasAdminAccess,createAdminUser,revokeAdminUser,listCollection,saveProduct,removeProduct,removePartnership,updateRecord,imageUrl} from './firebase-client.js?v=2';

const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('fr-DZ').format(Number(value)||0)+' DA';
const date=value=>value?.seconds?new Date(value.seconds*1000).toLocaleString('fr-DZ',{dateStyle:'medium',timeStyle:'short'}):'Date non disponible';
const statusOptions=['nouvelle','confirmée','en préparation','expédiée','terminée','annulée'];
const state={products:[],orders:[],partnerships:[],users:[],selectedOrder:null,selectedPartner:null,section:'overview'};
let toastTimer;
function toast(message){$('#admin-toast').textContent=message;$('#admin-toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#admin-toast').classList.remove('show'),3200)}
function errorMessage(error){console.error(error);return error?.code==='auth/invalid-credential'?'Adresse e-mail ou mot de passe incorrect.':error?.message||'Une erreur est survenue.'}
const photo=p=>esc(imageUrl(p));
const productById=id=>state.products.find(p=>p.id===id);

$('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),error=$('#login-error');
  error.hidden=true;button.disabled=true;button.textContent='Connexion…';
  try{const credential=await login(form.elements.email.value.trim(),form.elements.password.value);if(!await hasAdminAccess(credential.user)){await logout();throw Error('Ce compte n’est pas autorisé à administrer BLUE DELTA.')}}
  catch(reason){error.textContent=errorMessage(reason);error.hidden=false}
  finally{button.disabled=false;button.textContent='Se connecter'}
});
$('#logout-button').addEventListener('click',()=>logout());
watchAuth(async user=>{
  let authorized=false;
  try{authorized=await hasAdminAccess(user)}catch(error){console.error(error)}
  $('#login-view').hidden=authorized;$('#admin-view').hidden=!authorized;$('#admin-loading').hidden=true;
  if(!authorized){if(user)await logout();return}
  $('#nav-users').hidden=user.uid!==ADMIN_UID;
  $('#admin-email').textContent=user.email||'Administrateur';
  await refresh();
});

async function refresh(){
  try{
    const [products,orders,partnerships]=await Promise.all(['products','orders','partnerships'].map(listCollection));
    let users=[];
    if(!$('#nav-users').hidden)try{users=await listCollection('adminUsers')}catch(error){console.warn('Liste des utilisateurs indisponible tant que les règles Firebase ne sont pas publiées.',error)}
    if(!products.length){
      const defaults=await fetch('/products.json').then(r=>r.json());
      await Promise.all([...defaults.map((p,index)=>saveProduct(p.id,{...p,position:index,active:true,stock:null})),saveProduct('_catalog',{active:false,system:true})]);
      state.products=defaults.map((p,index)=>({...p,position:index,active:true,stock:null}));
      toast('Catalogue initial synchronisé avec Firebase.');
    }else state.products=products.filter(p=>!p.system).sort((a,b)=>(a.position??999)-(b.position??999));
    state.orders=orders;state.partnerships=partnerships;state.users=users||[];
    renderAll();
  }catch(reason){toast('Chargement impossible : '+errorMessage(reason))}
}

function renderAll(){
  $('#stat-orders').textContent=state.orders.length;$('#stat-partners').textContent=state.partnerships.length;
  $('#stat-products').textContent=state.products.filter(p=>p.active!==false).length;
  $('#stat-stock').textContent=state.products.filter(p=>Number.isInteger(p.stock)&&p.stock<=5&&p.active!==false).length;
  $('#nav-orders').textContent=state.orders.filter(o=>o.status==='nouvelle').length;
  $('#nav-partners').textContent=state.partnerships.filter(p=>p.status==='nouvelle').length;
  $('#recent-orders').innerHTML=state.orders.slice(0,5).map(o=>`<button class="admin-row" data-view-order="${esc(o.id)}"><img src="${photo(o.items?.[0]||{})}" alt=""><span class="admin-row-copy"><strong>${esc(o.name)}</strong><small>${esc(o.items?.map(i=>i.name).join(', ')||'Commande')}</small></span><span class="admin-row-side"><strong>${money(o.total)}</strong><small>${date(o.createdAt)}</small></span></button>`).join('')||'<p class="admin-empty">Aucune commande reçue.</p>';
  $('#recent-partners').innerHTML=state.partnerships.slice(0,5).map(p=>`<button class="admin-row" data-view-partner="${esc(p.id)}"><span class="admin-row-copy"><strong>${esc(p.company)}</strong><small>${esc(p.name)} · ${esc(p.activity)}</small></span><span class="admin-row-side"><small>${date(p.createdAt)}</small></span></button>`).join('')||'<p class="admin-empty">Aucune demande reçue.</p>';
  renderOrders();renderPartners();renderProducts();renderUsers();
  if(state.selectedOrder)showOrder(state.selectedOrder);
  if(state.selectedPartner)showPartner(state.selectedPartner);
}

function section(name){if(name==='users'&&auth.currentUser?.uid!==ADMIN_UID)return;state.section=name;document.querySelectorAll('.admin-section').forEach(el=>el.hidden=el.id!=='section-'+name);document.querySelectorAll('.admin-nav').forEach(el=>el.classList.toggle('active',el.dataset.section===name));$('#section-title').textContent={overview:'Vue d’ensemble',orders:'Commandes',partnerships:'Partenariats',products:'Produits & stock',users:'Utilisateurs'}[name]||name;window.scrollTo({top:0,behavior:'smooth'})}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-section],[data-go]');if(nav)section(nav.dataset.section||nav.dataset.go);
  const order=event.target.closest('[data-view-order]');if(order){section('orders');showOrder(order.dataset.viewOrder)}
  const partner=event.target.closest('[data-view-partner]');if(partner){section('partnerships');showPartner(partner.dataset.viewPartner)}
  const deletePartner=event.target.closest('[data-delete-partner]');if(deletePartner)deletePartnership(deletePartner.dataset.deletePartner);
  const edit=event.target.closest('[data-edit-product]');if(edit)openProduct(productById(edit.dataset.editProduct));
  const del=event.target.closest('[data-delete-product]');if(del)deleteProduct(del.dataset.deleteProduct);
  if(event.target.closest('[data-close-modal]'))closeProduct();
});

function renderOrders(){const q=$('#order-search').value.toLowerCase();const rows=state.orders.filter(o=>(o.name+' '+o.phone+' '+o.company+' '+o.id+' '+o.items?.map(i=>i.name).join(' ')).toLowerCase().includes(q));$('#orders-list').innerHTML=rows.map(o=>`<button class="admin-row ${state.selectedOrder===o.id?'active':''}" data-view-order="${esc(o.id)}"><img src="${photo(o.items?.[0]||{})}" alt=""><span class="admin-row-copy"><strong>${esc(o.name)}</strong><small>${esc(o.items?.map(i=>`${i.quantity} × ${i.name}`).join(' · ')||'Commande')}</small><small>${date(o.createdAt)}</small></span><span class="admin-row-side"><strong>${money(o.total)}</strong><small class="admin-status">${esc(o.status||'nouvelle')}</small></span></button>`).join('')||'<div class="admin-empty">Aucune commande trouvée.</div>'}
function renderPartners(){const q=$('#partner-search').value.toLowerCase();const rows=state.partnerships.filter(p=>(p.company+' '+p.name+' '+p.phone+' '+p.id).toLowerCase().includes(q));$('#partnerships-list').innerHTML=rows.map(p=>`<button class="admin-row ${state.selectedPartner===p.id?'active':''}" data-view-partner="${esc(p.id)}"><span class="admin-row-copy"><strong>${esc(p.company)}</strong><small>${esc(p.name)} · ${esc(p.activity)}</small><small>${date(p.createdAt)}</small></span><span class="admin-row-side"><small class="admin-status">${esc(p.status||'nouvelle')}</small></span></button>`).join('')||'<div class="admin-empty">Aucune demande trouvée.</div>'}
function statusSelect(type,record){return `<label class="admin-status-edit">Statut <select data-status-type="${type}" data-status-id="${esc(record.id)}">${statusOptions.map(s=>`<option value="${s}" ${record.status===s?'selected':''}>${s}</option>`).join('')}</select></label>`}
function detailField(label,value){return `<div><small>${label}</small><strong>${esc(value||'—')}</strong></div>`}
function showOrder(id){
  const order=state.orders.find(o=>o.id===id);if(!order)return;state.selectedOrder=id;renderOrders();
  $('#order-detail').innerHTML=`<div class="admin-detail-head"><div><span class="admin-kicker">COMMANDE · ${esc(order.id)}</span><h2>${esc(order.name)}</h2><small>${date(order.createdAt)}</small></div><span class="admin-status ${order.status==='terminée'?'done':order.status==='annulée'?'cancelled':''}">${esc(order.status||'nouvelle')}</span></div><div class="admin-detail-grid">${detailField('Téléphone',order.phone)}${detailField('E-mail',order.email)}${detailField('Entreprise',order.company)}${detailField('Wilaya',order.wilaya)}${detailField('Commune',order.commune)}${detailField('Adresse complète',order.address)}</div><h3>Produits commandés</h3>${(order.items||[]).map(i=>`<div class="admin-item"><img src="${photo(i)}" alt="${esc(i.name)}"><span><strong>${esc(i.name)}</strong><small>${esc(i.format)} · ${esc(i.quantity)} × ${money(i.price)}</small></span><strong>${money(Number(i.quantity)*Number(i.price))}</strong></div>`).join('')}<div class="summary-line total"><span>Total produits</span><strong>${money(order.total)}</strong></div><p class="fine">Livraison et paiement à confirmer avec le client.</p><h3>Informations complémentaires</h3><div class="note">${esc(order.message||'Aucune')}</div><h3>Suivi</h3>${statusSelect('orders',order)}<p class="fine">La modification du statut est enregistrée automatiquement.</p>`;
}
function showPartner(id){
  const p=state.partnerships.find(x=>x.id===id);if(!p)return;state.selectedPartner=id;renderPartners();
  $('#partnership-detail').innerHTML=`<div class="admin-detail-head"><div><span class="admin-kicker">PARTENARIAT · ${esc(p.id)}</span><h2>${esc(p.company)}</h2><small>${date(p.createdAt)}</small></div><span class="admin-status">${esc(p.status||'nouvelle')}</span></div><div class="admin-detail-grid">${detailField('Contact',p.name)}${detailField('Téléphone',p.phone)}${detailField('E-mail',p.email)}${detailField('Activité',p.activity)}${detailField('Wilaya',p.wilaya)}${detailField('Commune',p.commune)}${detailField('Volume envisagé',p.volume)}</div><h3>Produits souhaités</h3><div class="admin-request-products">${(p.products||[]).map(i=>`<div class="admin-item"><img src="${photo(productById(i.id)||{})}" alt=""><span><strong>${esc(i.name)}</strong><small>${esc(productById(i.id)?.format||'')}</small></span></div>`).join('')}</div><h3>Projet / message</h3><div class="note">${esc(p.message||'Aucun détail supplémentaire')}</div><h3>Suivi</h3>${statusSelect('partnerships',p)}<div class="admin-delete-row"><button type="button" class="admin-secondary admin-danger" data-delete-partner="${esc(p.id)}">Supprimer cette demande</button></div>`;
}
async function deletePartnership(id){
  const request=state.partnerships.find(p=>p.id===id);
  if(!request||!confirm(`Supprimer définitivement la demande de partenariat de « ${request.company} » ?`))return;
  try{
    await removePartnership(id);
    state.partnerships=state.partnerships.filter(p=>p.id!==id);
    if(state.selectedPartner===id){state.selectedPartner=null;$('#partnership-detail').innerHTML='<div class="admin-placeholder">Sélectionnez une demande pour afficher ses détails.</div>'}
    renderAll();toast('Demande de partenariat supprimée.');
  }catch(reason){toast('Suppression impossible : '+errorMessage(reason))}
}
document.addEventListener('change',async event=>{const field=event.target.closest('[data-status-type]');if(!field)return;try{await updateRecord(field.dataset.statusType,field.dataset.statusId,{status:field.value});const record=state[field.dataset.statusType].find(x=>x.id===field.dataset.statusId);record.status=field.value;renderAll();toast('Statut mis à jour.')}catch(reason){toast('Erreur : '+errorMessage(reason))}});
$('#order-search').addEventListener('input',renderOrders);$('#partner-search').addEventListener('input',renderPartners);

function renderProducts(){const q=$('#product-search-admin').value.toLowerCase();const rows=state.products.filter(p=>(p.name+' '+p.subtitle+' '+p.cat).toLowerCase().includes(q));$('#product-count-admin').textContent=rows.length+' produit'+(rows.length>1?'s':'');$('#admin-products').innerHTML=rows.map(p=>`<article class="admin-product"><img src="${photo(p)}" alt="${esc(p.name)}"><div class="admin-product-copy"><strong>${esc(p.name)}</strong><small>${p.cat==='industrie'?'Industrie & maintenance':'Automobile & BTP'} · ${esc(p.format||'')}</small><p>${money(p.price)} · <span class="${Number.isInteger(p.stock)&&p.stock<=5?'stock-low':''}">Stock : ${Number.isInteger(p.stock)?p.stock:'non renseigné'}</span></p><small>${p.active===false?'Masqué du site':'Visible sur le site'}</small><div class="admin-product-actions"><button data-edit-product="${esc(p.id)}">Modifier</button><button class="delete" data-delete-product="${esc(p.id)}">Supprimer</button></div></div></article>`).join('')||'<div class="admin-empty">Aucun produit trouvé.</div>'}
$('#product-search-admin').addEventListener('input',renderProducts);

function renderUsers(){
  const entries=[{id:ADMIN_UID,email:'contact@bluedelta.dz',owner:true},...state.users];
  $('#users-list').innerHTML=entries.map(user=>`<article class="admin-user-row"><div><strong>${esc(user.email)}</strong><small>${user.owner?'Compte principal · accès permanent':'Administrateur · accès au catalogue et aux demandes'}</small></div>${user.owner?'<span class="admin-status">Principal</span>':`<button class="admin-secondary" type="button" data-revoke-user="${esc(user.id)}">Supprimer l’utilisateur</button>`}</article>`).join('');
}
$('#add-user-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('button[type="submit"]'),error=$('#user-error');error.hidden=true;button.disabled=true;button.textContent='Création…';
  try{const email=form.elements.email.value.trim(),password=form.elements.password.value;if(password.length<12)throw Error('Choisissez un mot de passe de 12 caractères minimum.');await createAdminUser(email,password);form.reset();state.users=await listCollection('adminUsers');renderUsers();toast('Utilisateur ajouté. Transmettez-lui son mot de passe de façon privée.')}catch(reason){error.textContent=errorMessage(reason);error.hidden=false}finally{button.disabled=false;button.textContent='Ajouter l’utilisateur'}
});
document.addEventListener('click',async event=>{const button=event.target.closest('[data-revoke-user]');if(!button)return;const user=state.users.find(x=>x.id===button.dataset.revokeUser);if(!user||!confirm(`Supprimer l’accès de ${user.email} ? Ce compte ne pourra plus voir les données ni modifier le catalogue.`))return;button.disabled=true;try{await revokeAdminUser(user.id);state.users=state.users.filter(x=>x.id!==user.id);renderUsers();toast('Accès supprimé immédiatement.')}catch(reason){button.disabled=false;toast('Suppression impossible : '+errorMessage(reason))}});

const modal=$('#product-modal'),productForm=$('#product-form');
let photoObjectUrl=null,photoRemoved=false;
function clearPhotoObjectUrl(){if(photoObjectUrl){URL.revokeObjectURL(photoObjectUrl);photoObjectUrl=null}}
function setPhotoPreview(src,label='Photo actuelle'){const preview=$('#product-photo-preview');preview.hidden=!src;if(src){$('#product-photo-thumb').src=src;$('#product-photo-label').textContent=label}else $('#product-photo-thumb').removeAttribute('src')}
function openProduct(p){productForm.reset();clearPhotoObjectUrl();photoRemoved=false;$('#product-error').hidden=true;productForm.elements.id.value=p?.id||'';$('#product-modal-title').textContent=p?'Modifier le produit':'Ajouter un produit';for(const key of ['name','cat','subtitle','format','price','description','applications'])if(p)productForm.elements[key].value=p[key]??'';productForm.elements.stock.value=Number.isInteger(p?.stock)?p.stock:'';productForm.elements.active.checked=p?.active!==false;productForm.elements.imageUrl.value=p?.image?.startsWith('https://')?p.image:'';setPhotoPreview(p?.image?imageUrl(p):'');modal.hidden=false;document.body.style.overflow='hidden';productForm.elements.name.focus()}
function closeProduct(){modal.hidden=true;document.body.style.overflow='';clearPhotoObjectUrl()}
$('#new-product').addEventListener('click',()=>openProduct());
productForm.elements.photo.addEventListener('change',()=>{clearPhotoObjectUrl();const file=productForm.elements.photo.files[0];if(file){photoRemoved=false;photoObjectUrl=URL.createObjectURL(file);setPhotoPreview(photoObjectUrl,'Nouvelle photo')}else{const original=productById(productForm.elements.id.value);setPhotoPreview(photoRemoved?'':original?.image?imageUrl(original):'')}});
productForm.elements.imageUrl.addEventListener('input',()=>{const value=productForm.elements.imageUrl.value.trim();if(/^https?:\/\//.test(value)){productForm.elements.photo.value='';clearPhotoObjectUrl();photoRemoved=false;setPhotoPreview(value,'Photo par URL')}else if(!value&&productById(productForm.elements.id.value)?.image?.startsWith('https://')){photoRemoved=true;setPhotoPreview('')}});
$('#remove-product-photo').addEventListener('click',()=>{clearPhotoObjectUrl();photoRemoved=true;productForm.elements.photo.value='';productForm.elements.imageUrl.value='';setPhotoPreview('')});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)closeProduct()});
function makeSlug(name){return name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'produit'}
async function optimizedPhoto(file){const bitmap=await createImageBitmap(file),max=640,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',.72);bitmap.close();if(data.length>650000)throw Error('Cette image est trop lourde. Choisissez une photo plus légère.');return data}
productForm.addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#save-product'),err=$('#product-error'),f=new FormData(productForm),original=productById(String(f.get('id')));err.hidden=true;button.disabled=true;button.textContent='Enregistrement…';
  try{
    const name=String(f.get('name')).trim(),id=original?.id||makeSlug(name)+'-'+Date.now().toString(36).slice(-5);let image=photoRemoved?'':original?.image||'';
    const file=productForm.elements.photo.files[0];if(file)image=await optimizedPhoto(file);else if(String(f.get('imageUrl')||'').trim())image=String(f.get('imageUrl')).trim();
    const stockRaw=String(f.get('stock')||'');const stock=stockRaw===''?null:Number(stockRaw);
    if(stock!==null&&(!Number.isInteger(stock)||stock<0))throw Error('Le stock doit être un nombre entier positif.');
    const data={...original,id,name,cat:String(f.get('cat')),subtitle:String(f.get('subtitle')||'').trim(),format:String(f.get('format')||'').trim(),price:Number(f.get('price')),stock,description:String(f.get('description')||'').trim(),applications:String(f.get('applications')||'').trim(),image,active:f.has('active'),position:original?.position??state.products.length};
    if(!['auto','industrie'].includes(data.cat)||!Number.isInteger(data.price)||data.price<0)throw Error('Vérifiez la catégorie et le prix.');
    await saveProduct(id,data);closeProduct();await refresh();toast(original?'Produit mis à jour.':'Produit ajouté au catalogue.');
  }catch(reason){err.textContent=errorMessage(reason);err.hidden=false}
  finally{button.disabled=false;button.textContent='Enregistrer le produit'}
});
async function deleteProduct(id){const p=productById(id);if(!p||!confirm(`Supprimer définitivement « ${p.name} » du catalogue ? Les anciennes commandes resteront consultables.`))return;try{await removeProduct(id);state.products=state.products.filter(x=>x.id!==id);renderAll();toast('Produit supprimé.')}catch(reason){toast('Suppression impossible : '+errorMessage(reason))}}

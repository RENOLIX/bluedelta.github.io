import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const app=initializeApp({
  apiKey:'AIzaSyDo-JGqAlPGpRU9fQ6iRZD0esHHvBjdJwE',
  authDomain:'bluedelta-eae0a.firebaseapp.com',
  projectId:'bluedelta-eae0a',
  storageBucket:'bluedelta-eae0a.firebasestorage.app',
  messagingSenderId:'499845671254',
  appId:'1:499845671254:web:10dbc28956539990594ef7'
});
export const db=getFirestore(app);
export const auth=getAuth(app);
export const ADMIN_UID='7Q26B4VGTXddJo9O6rmmOiOhwka2';
export const imageUrl=p=>p?.image?.startsWith('data:image/')||p?.image?.startsWith('https://')?p.image:'/assets/'+(p?.image||'logo.png');
export async function loadProducts(fallback){
  try{const snap=await getDocs(collection(db,'products'));return snap.empty?fallback:snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.active!==false).sort((a,b)=>(a.position??999)-(b.position??999)||a.name.localeCompare(b.name,'fr'))}
  catch(error){console.warn('Catalogue Firebase indisponible, affichage du catalogue local.',error);return fallback}
}
export async function submitOrder(payload){return addDoc(collection(db,'orders'),{...payload,status:'nouvelle',createdAt:serverTimestamp()})}
export async function submitPartnership(payload){return addDoc(collection(db,'partnerships'),{...payload,status:'nouvelle',createdAt:serverTimestamp()})}
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
export const logout=()=>signOut(auth);
export const watchAuth=callback=>onAuthStateChanged(auth,callback);
export async function listCollection(name){const snap=await getDocs(collection(db,name));return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))}
export const saveProduct=(id,data)=>setDoc(doc(db,'products',id),data);
export const removeProduct=id=>deleteDoc(doc(db,'products',id));
export const updateRecord=(name,id,data)=>updateDoc(doc(db,name,id),data);

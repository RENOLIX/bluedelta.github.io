import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('src/public-extra.js','utf8');
const handler=source.slice(source.indexOf('// La commande est réellement'),source.indexOf('const products=await loadProducts(local);'));
async function fixture({stock=5,quantity=2,fail=false}={}){
 let callback,sent=0,cleared=false;
 const button={disabled:false,textContent:''};
 const result={hidden:true,innerHTML:'',scrollIntoView(){}};
 const form={querySelector:()=>button,hidden:false};
 const product={id:'test',name:'Test product',format:'5 L',price:3000,stock,image:'test.webp'};
 const context={
   $:selector=>selector==='#checkout-form'?{addEventListener:(_,cb)=>{callback=cb}}:selector==='#checkout-result'?result:selector==='#wilaya'?{selectedOptions:[{textContent:'35 — Boumerdès'}]}:null,
   local:[product],loadProducts:async()=>[product],
   localStorage:{getItem:()=>JSON.stringify({test:quantity}),removeItem:()=>{cleared=true}},
   FormData:class{get(key){return {name:'Test',phone:'0550000000',commune:'Ouled Moussa',address:'Test address'}[key]||''}},
   esc:String,console:{error(){}},
   submitOrder:async payload=>{sent++;assert.equal(result.hidden,true,'No success before persistence');assert.equal(payload.total,6000);if(fail)throw Error('Network failure');return{id:'mock-only'}}
 };
 vm.runInNewContext(handler,context);
 await callback({preventDefault(){},stopImmediatePropagation(){},currentTarget:form});
 return{sent,cleared,button,result,form};
}
let result=await fixture();
assert.equal(result.sent,1);assert.equal(result.cleared,true);assert.equal(result.form.hidden,true);assert.match(result.result.innerHTML,/mock-only/);
result=await fixture({fail:true});assert.equal(result.sent,1);assert.equal(result.cleared,false);assert.equal(result.button.disabled,false);assert.match(result.result.innerHTML,/n’a pas été enregistrée/);
result=await fixture({stock:1});assert.equal(result.sent,0);assert.equal(result.cleared,false);assert.equal(result.button.disabled,false);
result=await fixture({quantity:0});assert.equal(result.sent,0);assert.equal(result.button.disabled,false);
console.log('Mock checkout: confirmed persistence, failure recovery, stock validation and empty-cart guards verified; no order sent.');

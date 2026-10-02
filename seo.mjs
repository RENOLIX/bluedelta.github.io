import fs from 'node:fs';
import path from 'node:path';

const root='dist';
const origin=(process.env.SITE_ORIGIN||'https://bluedelta.dz').replace(/\/$/,'');
const maps='https://maps.app.goo.gl/y1R1cGbHGoQCWba16';
const products=JSON.parse(fs.readFileSync('catalog-snapshot.json','utf8'));
const byId=new Map(products.map(product=>[product.id,product]));
const publicRoutes=[];
const escapeHtml=value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const escapeXml=escapeHtml;
const business={
  '@context':'https://schema.org','@type':'LocalBusiness','@id':origin+'/#business',
  name:'SARL BLUE DELTA',alternateName:'BLUE DELTA',url:origin+'/',
  description:'Solutions de refroidissement, de protection et de nettoyage pour l’automobile, le BTP et l’industrie en Algérie.',
  logo:origin+'/assets/logo.png',image:origin+'/assets/hero-day.png',
  telephone:'+21324937609',email:'contact@bluedelta.dz',
  contactPoint:[{'@type':'ContactPoint',telephone:'+213770866417',contactType:'commercial',areaServed:'DZ',availableLanguage:['fr','ar']},{'@type':'ContactPoint',telephone:'+213557802176',contactType:'commercial',areaServed:'DZ',availableLanguage:['fr','ar']}],
  address:{'@type':'PostalAddress',streetAddress:'Rue Amirat Abdelkader',addressLocality:'Ouled Moussa',addressRegion:'Boumerdès',addressCountry:'DZ'},
  geo:{'@type':'GeoCoordinates',latitude:36.65424365,longitude:3.0769152},
  hasMap:maps,sameAs:[maps],areaServed:{'@type':'Country',name:'Algérie'}
};

function visit(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){visit(file);continue}
    if(entry.name!=='index.html'||file===path.join(root,'admin','index.html'))continue;
    const route=path.relative(root,path.dirname(file)).replaceAll('\\','/');
    const segment=!route||route==='.'?'':route+'/';
    const url=origin+'/'+segment;
    const noindex=['panier','commande','produit'].includes(route);
    if(!noindex)publicRoutes.push(segment);
    let html=fs.readFileSync(file,'utf8');
    const title=html.match(/<title>(.*?)<\/title>/)?.[1]||'BLUE DELTA';
    const description=html.match(/<meta name="description" content="([^"]*)">/)?.[1]||'';
    const product=route.startsWith('produits/')?byId.get(route.split('/')[1]):undefined;
    const image=product?origin+'/assets/'+product.image:origin+'/assets/hero-day.png';
    const graph=[business,{'@type':'WebPage','@id':url+'#webpage',url,name:title.replaceAll('&amp;','&'),description:description.replaceAll('&amp;','&'),inLanguage:'fr-DZ',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#business'}}];
    if(product)graph.push({'@type':'Product','@id':url+'#product',name:product.name,description:product.description||'',image:[image],sku:product.id,brand:{'@type':'Brand',name:'BLUE DELTA'},category:product.cat==='industrie'?'Industrie et maintenance':'Automobile et BTP',offers:{'@type':'Offer',url,price:String(product.price),priceCurrency:'DZD',availability:product.stock===0?'https://schema.org/OutOfStock':'https://schema.org/InStock',seller:{'@id':origin+'/#business'}}});
    graph.unshift({'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'BLUE DELTA',publisher:{'@id':origin+'/#business'},inLanguage:'fr-DZ'});
    const meta=`<meta name="robots" content="${noindex?'noindex,nofollow':'index,follow,max-image-preview:large'}"><meta property="og:locale" content="fr_DZ"><meta property="og:url" content="${escapeHtml(url)}"><meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${escapeHtml(product?product.name+' BLUE DELTA':'BLUE DELTA, solutions automobiles et industrielles')}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${escapeHtml(image)}"><link rel="alternate" hreflang="fr-DZ" href="${escapeHtml(url)}">`;
    html=html.replace('<meta name="theme-color"',meta+'<meta name="theme-color"');
    if(product)html=html.replace('<meta property="og:type" content="website">','<meta property="og:type" content="product">');
    html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`);
    fs.writeFileSync(file,html);
  }
}
visit(root);
publicRoutes.sort((a,b)=>a.localeCompare(b,'fr'));
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+publicRoutes.map(route=>`  <url><loc>${escapeXml(origin+'/'+route)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /commande/\nDisallow: /panier/\nDisallow: /produit/\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(root,'google8be11d5bcf6901b9.html'),'google-site-verification: google8be11d5bcf6901b9.html');
fs.writeFileSync(path.join(root,'llms.txt'),`# BLUE DELTA\n\nBLUE DELTA est une entreprise à Ouled Moussa, Boumerdès, Algérie. Elle propose des produits de refroidissement, de protection et de nettoyage pour l’automobile, le BTP et l’industrie.\n\n- Site officiel : ${origin}/\n- Catalogue : ${origin}/produits/\n- Applications : ${origin}/applications/\n- Partenariat et fourniture : ${origin}/partenariat/\n- Contact et localisation : ${origin}/contact/\n- Carte : ${maps}\n- Adresse : Rue Amirat Abdelkader, Ouled Moussa, Boumerdès, Algérie\n- Téléphone : 024 93 76 09 ; mobiles : 0770 86 64 17 et 0557 80 21 76\n- Courriel : contact@bluedelta.dz\n\nLes prix affichés sont en dinars algériens (DA). La livraison, la disponibilité et le paiement sont confirmés directement avec BLUE DELTA. Vérifier la compatibilité technique et demander la fiche technique applicable avant utilisation.\n`);
console.log(`SEO: ${publicRoutes.length} pages indexables, carte et validation Google.`);

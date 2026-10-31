import fs from 'node:fs';
import path from 'node:path';
import {topics} from './seo-topics.mjs';

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
  logo:origin+'/assets/logo.webp',image:origin+'/assets/hero-day.webp',
  telephone:'+21324937609',email:'contact@bluedelta.dz',
  contactPoint:[{'@type':'ContactPoint',telephone:'+213770866417',contactType:'commercial',areaServed:'DZ',availableLanguage:['fr','ar']},{'@type':'ContactPoint',telephone:'+213557802176',contactType:'commercial',areaServed:'DZ',availableLanguage:['fr','ar']}],
  address:{'@type':'PostalAddress',streetAddress:'Rue Amirat Abdelkader',addressLocality:'Ouled Moussa',addressRegion:'Boumerdès',addressCountry:'DZ'},
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
    const product=route.startsWith('produits/')?byId.get(route.split('/')[1]):undefined;
    const noindex=['panier','commande','produit'].includes(route)||(route.startsWith('produits/')&&!product);
    if(!noindex)publicRoutes.push(segment);
    let html=fs.readFileSync(file,'utf8');
    const guide=topics.find(t=>route==='guides/'+t.slug);
    const productTitles={
      'oatec-vert':'Liquide de refroidissement OATEC Vert 5 L',
      'oatec-jaune':'Liquide de refroidissement OATEC Jaune 5 L',
      'g12-rose':'Liquide de refroidissement G12 Rose 5 L',
      'full-protect':'Liquide de refroidissement Full Protect 5 L',
      'refroidissement-industriel':'Liquide de refroidissement industriel anticorrosion',
      'refroidissement-cuve':'Liquide de refroidissement industriel en cuve IBC',
      'eau-demineralisee':'Eau déminéralisée 5 L pour usages techniques',
      'antitartre-20l':'Nettoyant antitartre canalisations 20 L',
      'antitartre-cuve':'Nettoyant antitartre canalisations en cuve IBC'
    };
    if(product&&productTitles[product.id]){
      const optimized=escapeHtml(productTitles[product.id]+' | BLUE DELTA Algérie');
      html=html.replace(/<title>.*?<\/title>/,`<title>${optimized}</title>`).replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${optimized}">`);
    }
    const pageMetadata={
      '':['Liquide de refroidissement en Algérie | BLUE DELTA','Liquide de refroidissement auto et industriel, antigel selon référence, eau déminéralisée 5 L. Prix en DA et conseil BLUE DELTA à Ouled Moussa, Boumerdès.'],
      'produits':['Liquides de refroidissement et eau déminéralisée | BLUE DELTA','Comparez les liquides de refroidissement OATEC, G12 et industriels, l’eau déminéralisée et les antitartres BLUE DELTA en Algérie. Prix par référence en DA.'],
      'guides':['Guides : liquide de refroidissement, antigel et eau | BLUE DELTA','Choisir un liquide de refroidissement auto, un antigel ou une eau technique en Algérie : guides BLUE DELTA sur les usages, différences et compatibilités.']
    };
    if(pageMetadata[route]){
      const [pageTitle,pageDescription]=pageMetadata[route].map(escapeHtml);
      html=html.replace(/<title>.*?<\/title>/,`<title>${pageTitle}</title>`)
        .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${pageTitle}">`)
        .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${pageDescription}">`)
        .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${pageDescription}">`);
    }
    if(!segment)html=html.replace('Des solutions de refroidissement, de protection et de nettoyage pour vos moteurs et vos installations industrielles.','Liquides de refroidissement auto et industriels, eau déminéralisée et solutions de nettoyage pour vos équipements en Algérie.');
    if(product){
      const guides=topics.filter(t=>t.products.includes(product.id));
      if(guides.length)html=html.replace('</main>',`<section class="section"><div class="wrap"><div class="eyebrow">Pour aller plus loin</div><h2>Choix et entretien : nos guides</h2><div class="guide-links">${guides.map(t=>`<a href="/guides/${t.slug}/">${t.label} →</a>`).join('')}</div></div></section></main>`);
    }
    if(!segment)html=html.replace('</main>',`<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Conseils techniques · Algérie</div><h2>Liquide de refroidissement<br>et eaux techniques.</h2></div><a class="textlink" href="/guides/">Tous nos guides →</a></div><p>Pour une voiture, un atelier ou une installation industrielle, choisissez votre liquide de refroidissement selon la spécification de l’équipement. Antigel, antifreeze et eau de refroidissement : nos guides expliquent ces appellations et les points à vérifier avant de commander.</p><div class="guide-links">${topics.map(t=>`<a href="/guides/${t.slug}/">${t.label} →</a>`).join('')}</div><p>Vous recherchez une eau traitée, déminéralisée ou distillée ? Comparez les procédés et les usages. BLUE DELTA propose une <a class="textlink" href="/produits/eau-demineralisee/">eau déminéralisée 5 L</a> ; l’eau distillée n’est pas une référence distincte du catalogue actuel. Pour un devis en Algérie, précisez votre application, votre volume et votre wilaya à notre équipe à Ouled Moussa, Boumerdès.</p></div></section></main>`);
    if(!segment)html=html.replace('</head>','<link rel="preload" as="image" type="image/webp" href="/assets/hero-day.webp" media="(min-width:761px)" fetchpriority="high"><link rel="preload" as="image" type="image/webp" href="/assets/hero-day-mobile.webp" media="(max-width:760px)" fetchpriority="high"></head>');
    const title=html.match(/<title>(.*?)<\/title>/)?.[1]||'BLUE DELTA';
    const description=html.match(/<meta name="description" content="([^"]*)">/)?.[1]||'';
    const image=origin+'/assets/'+(product?.image||guide?.image||'hero-day.webp');
    const graph=[business,{'@type':'WebPage','@id':url+'#webpage',url,name:title.replaceAll('&amp;','&'),description:description.replaceAll('&amp;','&'),inLanguage:'fr-DZ',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#business'}}];
    if(product)graph.push({'@type':'Product','@id':url+'#product',name:product.name,description:product.description||'',image:[image],sku:product.id,brand:{'@type':'Brand',name:'BLUE DELTA'},category:product.cat==='industrie'?'Industrie et maintenance':'Automobile et BTP',offers:{'@type':'Offer',url,price:String(product.price),priceCurrency:'DZD',...(typeof product.stock==='number'?{availability:product.stock===0?'https://schema.org/OutOfStock':'https://schema.org/InStock'}:{}),seller:{'@id':origin+'/#business'}}});
    if(route&&route!=='.'){
      const crumbs=[{name:'Accueil',item:origin+'/'}];
      if(product)crumbs.push({name:'Nos produits',item:origin+'/produits/'});
      if(guide)crumbs.push({name:'Guides techniques',item:origin+'/guides/'});
      crumbs.push({name:guide?.label||product?.name||title.split(' | ')[0],item:url});
      graph.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
    }
    if(guide){
      graph.push({'@type':'Article','@id':url+'#article',headline:guide.title,description:guide.description,inLanguage:'fr-DZ',mainEntityOfPage:{'@id':url+'#webpage'},author:{'@id':origin+'/#business'},publisher:{'@id':origin+'/#business'},image:origin+'/assets/'+guide.image});
      graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:guide.faq.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
    }
    if(route==='guides'||route==='produits'){
      graph[1]['@type']='CollectionPage';
      const items=route==='guides'?topics.map(t=>({name:t.label,url:origin+'/guides/'+t.slug+'/'})):products.filter(p=>p.active!==false).map(p=>({name:p.name,url:origin+'/produits/'+p.id+'/'}));
      graph[1].mainEntity={'@type':'ItemList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,...item}))};
    }
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
// Public transaction pages must remain crawlable so their noindex can be read.
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(root,'google8be11d5bcf6901b9.html'),'google-site-verification: google8be11d5bcf6901b9.html');
fs.writeFileSync(path.join(root,'llms.txt'),`# BLUE DELTA

> Solutions de refroidissement, de protection anticorrosion et de nettoyage pour l’automobile, le BTP et l’industrie en Algérie.

BLUE DELTA est une entreprise située à Ouled Moussa, dans la wilaya de Boumerdès. Les prix affichés sont en dinars algériens (DA). La livraison, la disponibilité et le paiement sont confirmés directement avec BLUE DELTA. Vérifier la compatibilité technique et demander la fiche technique applicable avant utilisation.

## Site et catalogue

- [Site officiel](${origin}/): Présentation de BLUE DELTA et de ses deux gammes.
- [Catalogue des produits](${origin}/produits/): Produits automobiles et industriels, photos, prix et fiches produit.
- [Applications](${origin}/applications/): Usages automobiles, BTP et maintenance industrielle.
- [Documentation technique](${origin}/documentation/): Demande de fiches techniques et de fiches de données de sécurité.
- [Partenariat et distribution](${origin}/partenariat/): Formulaire pour les distributeurs et les approvisionnements professionnels.
- [Contact et localisation](${origin}/contact/): Coordonnées, devis et carte de localisation.

## Guides techniques

- [Liquide de refroidissement auto en Algérie](${origin}/guides/liquide-refroidissement-auto/): Choix automobile, prix par référence, eau de refroidissement et recherche Glaciol sans équivalence automatique.
- [Antigel et antifreeze](${origin}/guides/antigel-antifreeze/): Terminologie, concentré ou prêt à l’emploi et protection au gel.
- [Eau traitée et eaux techniques](${origin}/guides/eau-traitee/): Adoucissement, déminéralisation, osmose et distillation.
- [Liquide de refroidissement industriel](${origin}/guides/liquide-refroidissement-industriel/): Choix d’un liquide et vérification des caractéristiques techniques.
- [Protection anticorrosion industrielle](${origin}/guides/protection-anticorrosion-industrielle/): Préservation des circuits et des matériaux.
- [Eau déminéralisée](${origin}/guides/eau-demineralisee/): Usages techniques et précautions.
- [Eau distillée](${origin}/guides/eau-distillee/): Différences avec l’eau déminéralisée et disponibilité à confirmer.
- [Nettoyant antitartre pour canalisations](${origin}/guides/nettoyant-antitartre-canalisations/): Compatibilité, dosage et entretien.
- [Système de refroidissement industriel](${origin}/guides/systeme-refroidissement-industriel/): Contrôles et maintenance des installations.

## Coordonnées

Adresse : Rue Amirat Abdelkader, Ouled Moussa, Boumerdès, Algérie.
Téléphone : 024 93 76 09. Mobiles : 0770 86 64 17 et 0557 80 21 76.
Courriel : contact@bluedelta.dz.

## Optional

- [Localisation Google Maps](${maps}): Itinéraire vers BLUE DELTA à Ouled Moussa.
- [Politique de confidentialité](${origin}/confidentialite/): Traitement des données des formulaires.
- [Conditions de commande](${origin}/conditions/): Confirmation de la disponibilité, de la livraison et du paiement.
`);
console.log(`SEO: ${publicRoutes.length} pages indexables, carte et validation Google.`);

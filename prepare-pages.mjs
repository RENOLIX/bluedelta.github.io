import fs from 'node:fs';
// Keep local source URLs at the root and prefix only the published output.
const base=(process.env.SITE_BASE_PATH||'').replace(/\/$/,'');
const mapUrl='https://maps.app.goo.gl/y1R1cGbHGoQCWba16';
const mapSection=`<section class="location-section section" aria-labelledby="location-heading"><div class="wrap location-grid"><div class="location-copy"><div class="eyebrow">BLUE DELTA · OULED MOUSSA</div><h2 id="location-heading">Venez nous rencontrer.</h2><p>Un besoin en refroidissement, entretien automobile ou maintenance industrielle ? Notre équipe vous accueille à Ouled Moussa, dans la wilaya de Boumerdès.</p><address>Rue Amirat Abdelkader<br>Ouled Moussa, Boumerdès, Algérie</address><div class="location-actions"><a class="btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Itinéraire sur Google Maps ↗</a><a class="btn outline" href="tel:+213770866417">0770 86 64 17</a></div></div><div class="location-map"><iframe title="Carte Google Maps de BLUE DELTA à Ouled Moussa" data-map-src="https://www.google.com/maps?q=Blue%20delta%2C%20W122%2C%20Ouled%20Moussa&amp;z=16&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a href="${mapUrl}" target="_blank" rel="noopener noreferrer">Ouvrir la fiche BLUE DELTA sur Google Maps ↗</a></div></div></section>`;
const paths=['/assets/','/produits/','/panier/','/commande/','/products.json','/locations.json'];
let app=fs.readFileSync('src/app.js','utf8');
if(base)for(const p of paths)app=app.replaceAll(p,base+p);
fs.writeFileSync('dist/app.js',app);
let css=fs.readFileSync('src/styles.css','utf8');
if(base)css=css.replaceAll("url('/assets/","url('"+base+'/assets/');
fs.writeFileSync('dist/styles.css',css);
for(const file of ['catalog-client.js','firebase-client.js','public-extra.js','partner.js','hero.js','admin.js','admin.css']){
  fs.copyFileSync('src/'+file,'dist/'+file);
}
fs.mkdirSync('dist/admin',{recursive:true});
fs.copyFileSync('src/admin.html','dist/admin/index.html');
const walkHtml=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())walkHtml(file);else if(file.endsWith('.html')){
  let html=fs.readFileSync(file,'utf8').replaceAll('/assets/logo.png','/assets/logo.webp').replaceAll('/assets/cuve-rose.jpg','/assets/cuve-rose-editorial.webp');
  html=html.replace(/src="\/assets\/(category-auto|category-industrie)\.png"/g,(_,name)=>'src="/assets/'+name+'.webp" srcset="/assets/'+name+'-mobile.webp 768w, /assets/'+name+'.webp 1200w" sizes="(max-width:760px) 90vw, 45vw" width="1200" height="800"');
  if(file!=='dist/admin/index.html'){
    html=html.replace('/styles.css?v=5','/styles.css?v=11');
    html=html.replace('<a href="/applications/">Applications</a><a href="/a-propos/">','<a href="/applications/">Applications</a><a href="/partenariat/">Partenariat</a><a href="/a-propos/">');
    html=html.replace('<div><h3>BLUE DELTA</h3>','<div><h3>BLUE DELTA</h3><a href="/partenariat/">Partenariat & fournisseurs</a>');
    html=html.replace('<script type="module" src="/app.js"></script>','<script type="module" src="/app.js?v=4"></script><script type="module" src="/public-extra.js?v=8"></script>');
  }
  if(file==='dist/index.html'){
    html=html.replace('<section class="hero"><div class="wrap">','<section class="hero"><div class="hero-slides" aria-hidden="true"><div class="hero-track"><div class="hero-slide active"></div><div class="hero-slide"></div><div class="hero-slide"></div></div></div><div class="wrap">');
    html=html.replace('</div></div></section><div class="strip">','</div></div><div class="hero-dots" role="group" aria-label="Choisir une ambiance"><button class="hero-dot active" type="button" aria-label="Image 1 : protection industrielle" aria-pressed="true"></button><button class="hero-dot" type="button" aria-label="Image 2 : convoi de camions" aria-pressed="false"></button><button class="hero-dot" type="button" aria-label="Image 3 : engins de travaux publics" aria-pressed="false"></button></div><script type="module" src="/hero.js?v=4"></script></section><div class="strip">');
  }
  if(file==='dist/index.html'||file==='dist/contact/index.html'){
    html=html.replace('</main>',mapSection+'</main>');
    if(file==='dist/contact/index.html')html=html.replace('https://www.google.com/maps/search/?api=1&query=Rue+Amirat+Abdelkader+Ouled+Moussa+Boumerdes+Algerie',mapUrl);
  }
  if(file==='dist/partenariat/index.html')html=html.replace('</main>','<script type="module" src="/partner.js?v=5"></script></main>');
  fs.writeFileSync(file,html);
}}};walkHtml('dist');
if(base){
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else if(p.endsWith('.html')){const html=fs.readFileSync(p,'utf8').replace(/(href|src)="\/(?!\/)/g,'$1="'+base+'/');fs.writeFileSync(p,html)}}};walk('dist');
 fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: ${base}/\nDisallow: ${base}/commande/\nDisallow: ${base}/panier/\nSitemap: ${process.env.SITE_ORIGIN}/sitemap.xml\n`);
}
fs.writeFileSync('dist/.nojekyll','');
fs.writeFileSync('dist/CNAME','bluedelta.dz\n');

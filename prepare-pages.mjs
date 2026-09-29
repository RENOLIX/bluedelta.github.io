import fs from 'node:fs';
// Keep local source URLs at the root and prefix only the published output.
const base=(process.env.SITE_BASE_PATH||'').replace(/\/$/,'');
const paths=['/assets/','/produits/','/panier/','/commande/','/products.json','/locations.json'];
let app=fs.readFileSync('src/app.js','utf8');
if(base)for(const p of paths)app=app.replaceAll(p,base+p);
fs.writeFileSync('dist/app.js',app);
let css=fs.readFileSync('src/styles.css','utf8');
if(base)css=css.replaceAll("url('/assets/","url('"+base+'/assets/');
fs.writeFileSync('dist/styles.css',css);
for(const file of ['firebase-client.js','public-extra.js','partner.js','hero.js','admin.js','admin.css']){
  fs.copyFileSync('src/'+file,'dist/'+file);
}
fs.mkdirSync('dist/admin',{recursive:true});
fs.copyFileSync('src/admin.html','dist/admin/index.html');
const walkHtml=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())walkHtml(file);else if(file.endsWith('.html')){
  let html=fs.readFileSync(file,'utf8');
  if(file!=='dist/admin/index.html'){
    html=html.replace('<a href="/applications/">Applications</a><a href="/a-propos/">','<a href="/applications/">Applications</a><a href="/partenariat/">Partenariat</a><a href="/a-propos/">');
    html=html.replace('<div><h3>BLUE DELTA</h3>','<div><h3>BLUE DELTA</h3><a href="/partenariat/">Partenariat & fournisseurs</a>');
    html=html.replace('<script type="module" src="/app.js"></script>','<script type="module" src="/app.js?v=2"></script><script type="module" src="/public-extra.js?v=2"></script>');
  }
  if(file==='dist/index.html'){
    html=html.replace('<section class="hero"><div class="wrap">','<section class="hero"><div class="hero-slides" aria-hidden="true"><div class="hero-slide active"></div><div class="hero-slide"></div><div class="hero-slide"></div></div><div class="wrap">');
    html=html.replace('</div></div></section><div class="strip">','</div></div><div class="hero-dots" role="group" aria-label="Choisir une ambiance"><button class="hero-dot active" type="button" aria-label="Image 1 : protection industrielle" aria-pressed="true"></button><button class="hero-dot" type="button" aria-label="Image 2 : convoi de camions" aria-pressed="false"></button><button class="hero-dot" type="button" aria-label="Image 3 : engins de travaux publics" aria-pressed="false"></button></div><script type="module" src="/hero.js?v=2"></script></section><div class="strip">');
  }
  if(file==='dist/partenariat/index.html')html=html.replace('</main>','<script type="module" src="/partner.js?v=2"></script></main>');
  fs.writeFileSync(file,html);
}}};walkHtml('dist');
if(base){
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else if(p.endsWith('.html')){const html=fs.readFileSync(p,'utf8').replace(/(href|src)="\/(?!\/)/g,'$1="'+base+'/');fs.writeFileSync(p,html)}}};walk('dist');
 fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: ${base}/\nDisallow: ${base}/commande/\nDisallow: ${base}/panier/\nSitemap: ${process.env.SITE_ORIGIN}/sitemap.xml\n`);
}
fs.writeFileSync('dist/.nojekyll','');
fs.writeFileSync('dist/CNAME','bluedelta.dz\n');

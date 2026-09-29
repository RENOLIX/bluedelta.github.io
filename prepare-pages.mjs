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
if(base){
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else if(p.endsWith('.html')){const html=fs.readFileSync(p,'utf8').replace(/(href|src)="\/(?!\/)/g,'$1="'+base+'/');fs.writeFileSync(p,html)}}};walk('dist');
 fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: ${base}/\nDisallow: ${base}/commande/\nDisallow: ${base}/panier/\nSitemap: ${process.env.SITE_ORIGIN}/sitemap.xml\n`);
}
fs.writeFileSync('dist/.nojekyll','');

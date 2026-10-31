import fs from 'node:fs';
import {availability} from './commerce-policy.mjs';
const origin=(process.env.SITE_ORIGIN||'https://bluedelta.dz').replace(/\/$/,'');
const products=JSON.parse(fs.readFileSync('catalog-snapshot.json','utf8')).filter(p=>p.active!==false);
const xml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const tag=(name,value)=>`<g:${name}>${xml(value)}</g:${name}>`;
const items=products.map(p=>`<item>${tag('id',p.id)}${tag('title',p.name+' BLUE DELTA — '+p.format)}${tag('description',p.description)}${tag('link',origin+'/produits/'+encodeURIComponent(p.id)+'/')}<g:image_link>${xml(p.image?.startsWith('https://')?p.image:origin+'/assets/'+p.image)}</g:image_link>${tag('availability',availability(p).endsWith('/OutOfStock')?'out_of_stock':'in_stock')}${tag('price',Number(p.price).toFixed(2)+' DZD')}${tag('condition','new')}${tag('brand','BLUE DELTA')}<g:shipping>${tag('country','DZ')}${tag('price','0.00 DZD')}${tag('min_handling_time','0')}${tag('max_handling_time','0')}${tag('min_transit_time','0')}${tag('max_transit_time','2')}</g:shipping></item>`).join('\n');
fs.writeFileSync('dist/merchant-feed.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>BLUE DELTA — Catalogue Algérie</title><link>${xml(origin)}/</link><description>Produits BLUE DELTA, prix en DA, livraison gratuite et paiement à réception.</description>\n${items}\n</channel></rss>\n`);
console.log(`Merchant feed: ${products.length} références, sans avis ni identifiants GTIN inventés.`);

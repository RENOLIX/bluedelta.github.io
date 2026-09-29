import fs from 'node:fs';
const file='build.mjs';let source=fs.readFileSync(file,'utf8');
source=source.replace('<img src="/assets/oatec-vert.jpg" alt="Liquide automobile OATEC vert" loading="lazy">','<img src="/assets/category-auto.png" alt="Véhicule, poids lourd et engin de chantier — Automobile et BTP" loading="lazy">');
source=source.replace('<img src="/assets/cuve-bleue.jpg" alt="Cuve antitartre industrielle" loading="lazy">','<img src="/assets/category-industrie.png" alt="Installation industrielle de refroidissement et de maintenance" loading="lazy">');
fs.writeFileSync(file,source);

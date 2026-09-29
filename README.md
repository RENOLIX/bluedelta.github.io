# BLUE DELTA

Site vitrine et catalogue automobile/BTP et industrie, avec 11 fiches produits, panier et préparation de commande sur WhatsApp ou par e-mail.

## Démarrer

Node.js suffit, sans installation de dépendances.

```sh
npm run build
npm run dev
```

L’aperçu est disponible sur `http://127.0.0.1:4173/`.

## Contenu

- `catalog.mjs` : produits, prix en DZD et caractéristiques.
- `build.mjs` : génération des 21 pages HTML et métadonnées.
- `dist/` : site complet et images, prêt à servir avec un hébergement statique.
- `dist/app.js` : panier local, filtres et formulaires.
- `dist/styles.css` : présentation responsive.
- `communes-source.json` : données publiques des wilayas et communes, provenant de https://github.com/othmanus/algeria-cities.

Les prix sont actuellement fixés à 3 000 DA par unité. Les frais de livraison et modalités de paiement sont confirmés par BLUE DELTA. Les formulaires préparent un message que le visiteur doit envoyer : aucun paiement en ligne ni stockage serveur des commandes.

## Hébergement

Servir le dossier `dist/` à la racine d’un domaine ou sous-domaine. Pour GitHub Pages sous un chemin de projet, adapter les URL absolues du site à ce chemin avant activation. Mettre également à jour l’origine des liens canoniques et du sitemap dans `build.mjs`.

Les retouches HD de certaines photos restent à finaliser ; les photos d’origine correspondantes sont conservées. Le logo transparent et les visuels générés pour l’accueil et les deux catégories sont inclus.

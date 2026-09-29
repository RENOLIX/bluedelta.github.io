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

Le site est publié à la racine de `https://bluedelta.dz/` par GitHub Pages. La commande `npm run build` génère les liens internes, les URL canoniques et le sitemap pour ce domaine. Le fichier `dist/CNAME` conserve la configuration du domaine personnalisé dans l’artefact publié.

Les retouches HD de certaines photos restent à finaliser ; les photos d’origine correspondantes sont conservées. Le logo transparent et les visuels générés pour l’accueil et les deux catégories sont inclus.

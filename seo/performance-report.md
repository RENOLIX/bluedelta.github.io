# Vérification des performances — 5 octobre 2026

Site : https://bluedelta.dz/
Version mesurée : `791ea5721f5f64878501205cb7f94a2f383e4227`.

| Mesure mobile | Avant | Après |
|---|---:|---:|
| Performances | 66/100 | 100/100 |
| Premier affichage (FCP) | 2,9 s | 0,9 s |
| Affichage principal (LCP) | 8,6 s | 1,7 s |
| Speed Index | 5,3 s | 1,3 s |
| Blocage JavaScript (TBT) | 0 ms | 0 ms |
| Décalage de mise en page (CLS) | 0,037 | 0,037 |
| Bonnes pratiques | 96/100 | 100/100 |
| SEO | 100/100 | 100/100 |

Ordinateur : performances 100/100, LCP 0,5 s, TBT 0 ms, CLS 0, SEO 100/100.

- Rapport initial : https://pagespeed.web.dev/analysis/https-bluedelta-dz/3lc4qxi9pj?form_factor=mobile
- Rapport final mobile : https://pagespeed.web.dev/analysis/https-bluedelta-dz/jz94v8ilk3?form_factor=mobile
- Rapport final ordinateur : https://pagespeed.web.dev/analysis/https-bluedelta-dz/jz94v8ilk3?form_factor=desktop

Tests Lighthouse 13.5.0, mobile Moto G Power en 4G lente, réalisés à 16:33 UTC+1. Ce sont des mesures de laboratoire pouvant varier entre les exécutions ; aucune donnée terrain CrUX n'était disponible.

## Changements

Images du hero et des catégories livrées en WebP avec versions mobiles. Logo optimisé. Miniatures responsives des produits et image éditoriale allégée ; les fiches conservent leurs photos originales. Polices officielles hébergées localement, licences incluses. Diaporama animé par transform sur une couche graphique, avec intervalle de deux secondes et respect du mouvement réduit. Google Maps se charge à proximité de sa zone d'affichage.

Lecture du catalogue public via REST, partagée entre scripts et sans SDK d'authentification. L'instantané des dix produits actuels de l'admin s'affiche immédiatement ; les données sont ensuite actualisées. Les photos identiques réutilisent les fichiers locaux. Le SDK Firebase demeure utilisé pour l'admin et les enregistrements des commandes et partenariats.

Les durées de cache HTTP sont imposées par GitHub Pages et n'ont pas été modifiées. Des recommandations d'accessibilité restent présentes (92 mobile / 96 ordinateur).

## Validation

- `npm run build`
- `node seo/verification.mjs` : titres, descriptions, H1, JSON-LD, liens locaux et sitemap.
- `node seo/performance-tests.mjs` : requête unique, pagination, mises à jour admin, stock, photos, décodage et secours hors ligne.
- `node seo/checkout-performance-tests.mjs` : persistance avant confirmation, panne d'envoi, stock insuffisant et panier vide, avec enregistrement simulé.
- Navigateur : panier, quantités et total, sélection wilaya/commune, navigation mobile, filtre Industrie, photos et formulaire de partenariat. Aucun formulaire commercial envoyé lors des tests.

# Refroidissement automobile et eaux techniques — 31 octobre 2026

## Recherches et pages principales

| Recherche demandée | Page privilégiée | Traitement |
|---|---|---|
| Liquide de refroidissement | / | Titre, description et présentation de l’offre en Algérie |
| Liquide de refroidissement algérie | / | Même intention, une seule page principale |
| Liquide de refroidissement auto | /guides/liquide-refroidissement-auto/ | Choix automobile, prix par référence, liens vers OATEC/G12/Full Protect |
| Glaciol | /guides/liquide-refroidissement-auto/ | Section et question explicites ; aucun produit BLUE DELTA annoncé comme Glaciol ou comme substitut validé |
| Antigel | /guides/antigel-antifreeze/ | Protection au gel, concentré/prêt à l’emploi et compatibilité |
| Antifreeze | /guides/antigel-antifreeze/ | Même notion en anglais ; aucune page dupliquée artificiellement |
| Eau de refroidissement | /guides/liquide-refroidissement-auto/ | Distinction entre appellation courante, eau seule et fluide formulé |
| Eau déminéralisée | /produits/eau-demineralisee/ et /guides/eau-demineralisee/ | Achat et information : deux besoins distincts, prix provenant du catalogue |
| Eau traité | /guides/eau-traitee/ | Variante orthographique, rédaction en français correct « eau traitée » |
| Eau distillée | /guides/eau-distillee/ | Explication informative et disponibilité distincte non annoncée au catalogue |

## Mise en œuvre

Trois guides ajoutés, portant l’ensemble à neuf guides. Les fiches auto utilisent des titres descriptifs avec le nom de référence, le format et l’Algérie. Les contenus sont accessibles dans le HTML initial. Les guides sont liés depuis l’accueil, les fiches produit correspondantes et l’index ; ils se relient également entre eux. Aucun changement de prix, de stock, d’image produit, d’authentification ou de formulaires n’est requis.

Les métadonnées de l’accueil, du catalogue et de l’index des guides sont harmonisées avec Open Graph et Twitter. Les données structurées Article et FAQ reprennent les contenus visibles. Le catalogue et l’index utilisent CollectionPage et ItemList. Sitemap et llms.txt incluent les nouvelles pages. Une ancienne fiche produit absente du catalogue est retirée du sitemap et placée en noindex.

Le CSV `mots-cles.csv` compte désormais 450 propositions éditoriales (50 par sujet), sans estimation de volumes ni de positions. Ce fichier sert au suivi éditorial ; ces expressions ne sont pas répétées artificiellement dans les pages et aucun bloc de texte caché n’est ajouté.

## Contrôles et suite

`npm run build` et `node seo/verification.mjs` vérifient les titres/descriptions uniques, H1, canoniques, liens locaux, présence au sitemap, cohérence des prix visibles et structurés avec le catalogue, listes de produits et correspondance FAQ/texte visible.

Les contrôles locaux passent sur 33 pages HTML publiques et le sitemap compte 29 URL indexables. Une lecture du catalogue public Firebase confirme les dix références actives et leurs prix avant publication. Le contrôle visuel Chrome a été interrompu par la protection de l’outil, qui ne parvenait pas à identifier l’URL de la fenêtre ; aucun contrôle visuel terminé n’est revendiqué pour cette mise à jour.

Après publication, soumettre ou contrôler `https://bluedelta.dz/sitemap.xml` dans la propriété propriétaire Google Search Console et inspecter les trois nouveaux guides. Ce fichier ne constitue pas une preuve de soumission, d’indexation ou de classement. Les résultats doivent être suivis dans Search Console par requête, page et pays (Algérie), puis améliorés à partir des données réelles.

Le travail sur le site ne garantit pas la première place, notamment pour les recherches très générales ou celles visant un nom de produit différent. Maintenir aussi la fiche Google Business Profile, les coordonnées cohérentes, les avis authentiques et les liens de partenaires pertinents. Les caractéristiques techniques vérifiées et les documents de produit constituent les enrichissements éditoriaux suivants les plus utiles.

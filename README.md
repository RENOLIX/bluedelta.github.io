# BLUE DELTA

Site vitrine et boutique BLUE DELTA, publié sur [bluedelta.dz](https://bluedelta.dz/). Le catalogue statique reprend les produits et photos enregistrés dans Firebase lors de la dernière synchronisation. Le panier et la page de commande enregistrent les demandes dans Firebase Cloud Firestore ; aucun paiement en ligne n'est prélevé. La livraison, la disponibilité et le paiement sont confirmés avec BLUE DELTA.

## Développement et publication

Node.js suffit, sans dépendances à installer :

```sh
npm run build
npm run dev
```

Le site local est disponible sur `http://127.0.0.1:4173/`. La génération écrit les pages, scripts et images dans `dist/`, qui est publié par GitHub Pages. Les liens sont absolus depuis la racine de `bluedelta.dz` ; `dist/CNAME` conserve le domaine personnalisé.

`seo.mjs` génère les métadonnées, les données structurées, `sitemap.xml`, `robots.txt`, `llms.txt` et le fichier de validation Google. La carte BLUE DELTA est affichée sur l'accueil et sur la page Contact.

Après une modification du catalogue dans l'admin, le site public charge les nouvelles données Firebase. Pour remettre aussi à jour la version statique affichée pendant le chargement, exécuter `npm run sync:catalog`, puis `npm run build` et republier le site. Cette commande lit le catalogue public Firebase et enregistre les photos dans `dist/assets/`.

## Gestion

L'administration se trouve à `/admin/`. Firebase Authentication utilise l'e-mail et le mot de passe, sans validation de l'adresse e-mail. Le compte principal peut créer d'autres utilisateurs administrateurs et révoquer leur accès. Les règles de `firestore.rules` protègent les commandes, les demandes de partenariat et les modifications de produits. La révocation supprime le rôle Firestore ; pour effacer aussi l'identité Firebase Authentication, utilisez la console Firebase. Les identifiants ne sont pas conservés dans ce dépôt.

L'admin peut ajouter, modifier et supprimer des références, définir la catégorie (Automobile & BTP ou Industrie), le prix, la photo et le stock. Un stock non renseigné est affiché comme tel ; un stock de zéro bloque l'ajout au panier. Les commandes et demandes de partenariat sont affichées dans deux sections distinctes, avec détail et suivi de statut.

Les deux formulaires publics enregistrent les demandes dans Firestore. La base est hébergée dans la région `europe-southwest1` (Madrid). `src/firebase-client.js` contient uniquement la configuration publique de l'application Web Firebase. La sécurité repose sur Authentication et les règles Firestore publiées, et non sur le secret de cette configuration.

## Contenu

- `catalog-snapshot.json` et `catalog.mjs` : instantané du catalogue Firebase utilisé pour la première version affichée.
- `build.mjs`, `prepare-pages.mjs` et `seo.mjs` : génération des pages, copie des ressources et référencement.
- `src/` : scripts et styles maintenables, y compris le diaporama, les formulaires et l'admin.
- `dist/` : site statique publié.
- `communes-source.json` : wilayas et communes d'Algérie, à partir de [algeria-cities](https://github.com/othmanus/algeria-cities).

Les stocks réels n'ont pas été fournis et restent non renseignés jusqu'à leur saisie par BLUE DELTA. Pour changer d'administrateur, mettre à jour l'UID autorisé dans `firestore.rules` et publier les règles dans Firebase avant de retirer le compte actuel.

## Remise au client

L'archive du projet contient le code source, `dist/` prêt à héberger, la configuration GitHub Pages et les règles Firestore. L'accès au projet Firebase, au dépôt GitHub et à la gestion du domaine doit être remis séparément au propriétaire. Aucun identifiant administrateur ni mot de passe ne figure dans cette archive.

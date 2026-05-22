
# Présentation du Projet Incubateur

## Objectif du projet


Le projet **Incubateur** est une plateforme web moderne destinée à accompagner, soutenir et valoriser les initiatives entrepreneuriales et associatives, en particulier dans les quartiers populaires. Elle permet aux porteurs de projets de soumettre leurs idées, de bénéficier d'un accompagnement personnalisé, d'accéder à des ressources, et de suivre l'évolution de leur dossier via un tableau de bord.


## Fonctionnalités principales
- Soumission de candidatures pour l'incubation de projets
- Gestion des inscriptions et des connexions utilisateurs
- Tableau de bord pour le suivi des projets
- Pages d'information (accueil, à propos, contact, FAQ, partenaires, etc.)
- Composants réutilisables (navbar, footer, layout)
- Gestion des services (API, authentification, sécurité)
- Interface d'administration (à développer)


## Architecture du projet

Le projet suit une architecture modulaire Angular, avec une séparation claire entre :
- **Pages** : chaque fonctionnalité ou vue principale (accueil, candidature, inscription, etc.)
- **Services** : logique métier, communication avec l’API, gestion de l’authentification, etc.
- **Components** : éléments d’interface réutilisables (navbar, footer, layout)
- **Themes** : centralisation des variables de style et thèmes graphiques
- **Modules partagés** : layout, inscription, etc.

### Arborescence simplifiée
```
angular-incubateur/
│
├── docker-compose.yml, Dockerfile         # Conteneurisation et orchestration
├── README.md, SECURITY_BACKEND.md         # Documentation
│
├── incubateur/                            # Application Angular principale
│   ├── angular.json, package.json         # Configurations Angular et dépendances
│   ├── proxy.conf.js, proxy.conf.json     # Proxy pour le backend
│   ├── public/                            # Fichiers statiques publics
│   └── src/
│       ├── index.html, main.ts, styles.scss   # Entrée de l'app et styles globaux
│       └── app/
│           ├── app.config.ts, app.html, app.ts, app.scss  # Racine de l'app
│           ├── app.routes.ts, app.spec.ts                  # Routing et tests
│           ├── components/
│           │   ├── footer/
│           │   └── navbar/
│           ├── pages/
│           │   ├── accueil/
│           │   ├── apropos/
│           │   ├── candidature/
│           │   ├── inscription/
│           │   └── ...
│           ├── services/
│           └── themes/
│
├── inscription/, layout/, service/         # Modules ou composants partagés
│
├── candidature_new.html, candidature_old.html, ...   # Anciennes versions ou templates
```


### Détail des dossiers clés
- **pages/** : chaque sous-dossier correspond à une page ou fonctionnalité majeure (accueil, candidature, inscription, etc.)
- **services/** : logique métier, accès API, sécurité, etc.
- **components/** : composants d’interface réutilisables (navbar, footer, etc.)
- **themes/** : variables de couleurs, thèmes graphiques
- **public/** : ressources statiques accessibles directement
- **layout/**, **inscription/**, **service/** : modules ou composants partagés


## Technologies utilisées
- **Angular** (framework principal)
- **TypeScript** (langage principal)
- **SCSS** (préprocesseur CSS pour les styles)
- **Docker** (pour la conteneurisation et le déploiement)
- **RxJS** (programmation réactive)
- **Angular Material** (UI components)


## Bonnes pratiques
- Architecture modulaire et évolutive
- Séparation claire entre logique métier, présentation et accès aux données
- Utilisation de variables CSS/SCSS pour la personnalisation du thème
- Prise en charge de la responsivité et de l’accessibilité
- Utilisation de composants réutilisables pour la cohérence UI
- Gestion centralisée des appels API et de la sécurité
## Exemple de flux utilisateur

1. L'utilisateur arrive sur la page d'accueil et découvre la mission de l'incubateur.
2. Il peut s'inscrire ou se connecter via la page dédiée.
3. Une fois connecté, il accède à son tableau de bord et peut soumettre un projet via la page candidature.
4. Il suit l'évolution de son dossier et reçoit des notifications.
5. L'équipe d'administration traite les candidatures via une interface dédiée (à venir).

## Intégration backend/API

L'application Angular communique avec un backend (API REST) pour la gestion des utilisateurs, des candidatures et des données. Le proxy Angular permet de faciliter le développement local.

## Conteneurisation

Le projet est prêt à être déployé via Docker grâce aux fichiers `Dockerfile` et `docker-compose.yml`.

---


Pour toute question ou contribution, consultez le fichier `README.md` ou contactez l'équipe projet.

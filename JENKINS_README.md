# Configuration Jenkins pour Incubateur Frontend

Ce document explique comment configurer et utiliser Jenkins pour l'intégration continue du projet Incubateur Frontend.

## 📋 Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)
- Git configuré

## 🚀 Démarrage rapide

### 1. Lancement de Jenkins

```bash
# Rendre le script exécutable (Linux/Mac)
chmod +x jenkins.sh

# Démarrer Jenkins
./jenkins.sh
```

### 2. Configuration initiale

1. Ouvrez http://localhost:8080
2. Utilisez le mot de passe affiché dans le terminal
3. Installez les plugins suggérés
4. Créez un utilisateur administrateur

### 3. Configuration du pipeline

1. Créez un nouveau job "Pipeline"
2. Dans la section "Pipeline", sélectionnez "Pipeline script from SCM"
3. Configurez votre repository Git
4. Spécifiez le chemin vers le `Jenkinsfile`

## 🔧 Configuration Jenkins

### Plugins nécessaires

- **Pipeline**: Pour les pipelines as code
- **Git**: Intégration Git
- **NodeJS**: Support Node.js
- **Docker Pipeline**: Support Docker
- **HTML Publisher**: Publication des rapports HTML
- **JUnit**: Rapports de tests JUnit
- **Coverage**: Rapports de couverture de code
- **Email Extension**: Notifications par email

### Configuration NodeJS

1. Allez dans "Manage Jenkins" > "Global Tool Configuration"
2. Dans la section "NodeJS", ajoutez une installation :
   - Name: `18.x`
   - Version: `NodeJS 18.x.x`
   - Cochez "Install automatically"

### Configuration Docker

Assurez-vous que Jenkins a accès au daemon Docker :
```bash
# Ajouter l'utilisateur jenkins au groupe docker
sudo usermod -aG docker jenkins
```

## 📊 Pipeline de CI/CD

Le pipeline Jenkins exécute les étapes suivantes :

### 1. **Checkout**
- Récupération du code source depuis Git

### 2. **Install Dependencies**
- Installation des dépendances npm
- Cache des `node_modules` pour optimiser les builds

### 3. **Code Quality Analysis**
- ESLint pour l'analyse statique du code
- Vérification des standards de codage

### 4. **Unit Tests**
- Exécution des tests unitaires avec Karma/Jasmine
- Génération des rapports de couverture
- Publication des résultats dans Jenkins

### 5. **Build Application**
- Construction de l'application pour la production
- Optimisation et minification des assets

### 6. **E2E Tests**
- Tests end-to-end avec Protractor
- Tests sur Chrome headless

### 7. **Security Scan**
- Audit des vulnérabilités avec `npm audit`
- Vérification des dépendances

### 8. **Docker Build**
- Construction de l'image Docker
- Tag avec le numéro de build

### 9. **Deployment**
- Déploiement automatique en staging (branche develop)
- Déploiement manuel en production (branche master)

## 🧪 Exécution des tests

### Tests locaux
```bash
# Tests unitaires
npm run test:ci

# Tests avec couverture
npm run test:coverage

# Lint du code
npm run lint

# Construction
npm run build:prod
```

### Tests avec Docker
```bash
# Tests unitaires
docker-compose -f docker-compose.test.yml run --rm frontend-test

# Construction
docker-compose -f docker-compose.test.yml run --rm frontend-build

# Tests E2E
docker-compose -f docker-compose.test.yml run --rm frontend-e2e
```

## 📈 Rapports et métriques

### Rapports de tests
- **Résultats JUnit**: Résultats des tests unitaires
- **Couverture de code**: Pourcentage de code testé
- **Tests E2E**: Résultats des tests d'intégration

### Métriques de qualité
- **ESLint**: Violations des règles de codage
- **Audit de sécurité**: Vulnérabilités détectées
- **Performance**: Taille des bundles, temps de build

## 🔔 Notifications

### Configuration des emails
1. Allez dans "Manage Jenkins" > "Configure System"
2. Configurez la section "Extended E-mail Notification"
3. Testez la configuration

### Intégrations possibles
- **Slack**: Notifications temps réel
- **Microsoft Teams**: Intégration équipe
- **GitHub**: Status checks sur les PRs

## 🐳 Configuration Docker

### Images utilisées
- **Node.js 18 Alpine**: Base légère pour les tests
- **Nginx Alpine**: Serveur web pour la production
- **Jenkins LTS**: Serveur d'intégration continue

### Volumes persistants
- `jenkins_home`: Configuration et données Jenkins
- `test-results`: Résultats des tests
- `coverage`: Rapports de couverture

## 🔧 Maintenance

### Sauvegarde
```bash
# Sauvegarde de la configuration Jenkins
docker exec incubateur-jenkins tar -czf /tmp/jenkins_backup.tar.gz -C /var/jenkins_home .
docker cp incubateur-jenkins:/tmp/jenkins_backup.tar.gz ./jenkins_backup_$(date +%Y%m%d).tar.gz
```

### Mise à jour
```bash
# Arrêter Jenkins
./jenkins.sh stop

# Mettre à jour les images
docker-compose -f docker-compose.test.yml pull

# Redémarrer Jenkins
./jenkins.sh
```

### Nettoyage
```bash
# Nettoyer les images inutilisées
docker system prune -f

# Nettoyer les volumes orphelins
docker volume prune -f
```

## 🚨 Dépannage

### Problèmes courants

1. **Jenkins ne démarre pas**
   ```bash
   docker logs incubateur-jenkins
   ```

2. **Tests échouent**
   ```bash
   # Vérifier les logs de test
   docker-compose -f docker-compose.test.yml logs frontend-test
   ```

3. **Problèmes de permissions Docker**
   ```bash
   # Vérifier les permissions
   ls -la /var/run/docker.sock
   ```

### Contacts
- 📧 Email: support@incubateur.com
- 📞 Téléphone: +33 1 23 45 67 89
- 💬 Slack: #devops-support

## 📚 Ressources

- [Documentation Jenkins](https://www.jenkins.io/doc/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Pipeline as Code](https://www.jenkins.io/doc/book/pipeline-as-code/)

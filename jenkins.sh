#!/bin/bash

# Script de configuration et démarrage Jenkins pour le projet Incubateur

echo "🚀 Configuration Jenkins pour Incubateur Frontend..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_message() {
    echo -e "${2}${1}${NC}"
}

# Vérification des prérequis
print_message "Vérification des prérequis..." $BLUE

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    print_message "❌ Docker n'est pas installé" $RED
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_message "❌ Docker Compose n'est pas installé" $RED
    exit 1
fi

print_message "✅ Docker et Docker Compose sont installés" $GREEN

# Création des dossiers nécessaires
print_message "Création des dossiers de test..." $BLUE
mkdir -p incubateur/test-results/junit
mkdir -p incubateur/coverage
mkdir -p incubateur/e2e-results

# Démarrage de Jenkins avec Docker Compose
print_message "Démarrage de Jenkins..." $BLUE
docker-compose -f docker-compose.test.yml up -d jenkins

# Attendre que Jenkins soit prêt
print_message "Attente du démarrage de Jenkins..." $YELLOW
sleep 30

# Récupération du mot de passe initial de Jenkins
print_message "Récupération du mot de passe initial Jenkins..." $BLUE
JENKINS_PASSWORD=$(docker exec incubateur-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)

if [ -n "$JENKINS_PASSWORD" ]; then
    print_message "🔐 Mot de passe initial Jenkins: $JENKINS_PASSWORD" $GREEN
    print_message "📝 Copiez ce mot de passe pour la configuration initiale" $YELLOW
else
    print_message "⚠️  Impossible de récupérer le mot de passe Jenkins" $YELLOW
    print_message "Consultez les logs: docker logs incubateur-jenkins" $BLUE
fi

# Affichage des informations de connexion
print_message "
📊 Jenkins Dashboard: http://localhost:8080
🔐 Mot de passe: $JENKINS_PASSWORD

📋 Étapes suivantes:
1. Ouvrez http://localhost:8080 dans votre navigateur
2. Utilisez le mot de passe affiché ci-dessus
3. Installez les plugins suggérés
4. Créez un utilisateur admin
5. Configurez le pipeline avec le Jenkinsfile

🛠️  Plugins Jenkins recommandés:
- Pipeline
- Git
- NodeJS
- Docker Pipeline
- HTML Publisher
- JUnit
- Coverage
" $GREEN

# Fonction pour exécuter les tests
run_tests() {
    print_message "🧪 Exécution des tests unitaires..." $BLUE
    docker-compose -f docker-compose.test.yml run --rm frontend-test
    
    print_message "🏗️  Construction de l'application..." $BLUE
    docker-compose -f docker-compose.test.yml run --rm frontend-build
    
    print_message "🌐 Tests end-to-end..." $BLUE
    docker-compose -f docker-compose.test.yml run --rm frontend-e2e
}

# Option pour exécuter directement les tests
if [ "$1" = "test" ]; then
    run_tests
fi

# Option pour arrêter Jenkins
if [ "$1" = "stop" ]; then
    print_message "⏹️  Arrêt de Jenkins..." $BLUE
    docker-compose -f docker-compose.test.yml down
    print_message "✅ Jenkins arrêté" $GREEN
fi

print_message "
💡 Commandes utiles:
   ./jenkins.sh test     - Exécuter les tests
   ./jenkins.sh stop     - Arrêter Jenkins
   docker logs incubateur-jenkins - Voir les logs Jenkins
" $BLUE

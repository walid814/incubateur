#!/bin/bash

# Script de monitoring Jenkins pour le projet Incubateur
# Usage: ./jenkins-monitor.sh [start|stop|status|logs|health]

set -e

JENKINS_URL="http://localhost:8080"
JENKINS_CONTAINER="incubateur-jenkins"
LOG_FILE="jenkins-monitor.log"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Fonction d'affichage coloré
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✓ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}✗ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ $message${NC}"
            ;;
    esac
    log "$status: $message"
}

# Vérifier si Docker est installé et en cours d'exécution
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_status "ERROR" "Docker n'est pas installé"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_status "ERROR" "Docker n'est pas en cours d'exécution"
        exit 1
    fi

    print_status "SUCCESS" "Docker est opérationnel"
}

# Vérifier l'état du conteneur Jenkins
check_container() {
    if docker ps | grep -q $JENKINS_CONTAINER; then
        print_status "SUCCESS" "Conteneur Jenkins en cours d'exécution"
        return 0
    elif docker ps -a | grep -q $JENKINS_CONTAINER; then
        print_status "WARNING" "Conteneur Jenkins arrêté"
        return 1
    else
        print_status "ERROR" "Conteneur Jenkins non trouvé"
        return 2
    fi
}

# Vérifier la santé de Jenkins
check_jenkins_health() {
    local max_attempts=30
    local attempt=1

    print_status "INFO" "Vérification de la santé de Jenkins..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $JENKINS_URL/login > /dev/null 2>&1; then
            print_status "SUCCESS" "Jenkins est accessible sur $JENKINS_URL"
            return 0
        fi

        print_status "WARNING" "Tentative $attempt/$max_attempts - Jenkins non accessible"
        sleep 10
        ((attempt++))
    done

    print_status "ERROR" "Jenkins n'est pas accessible après $max_attempts tentatives"
    return 1
}

# Afficher les métriques du conteneur
show_container_metrics() {
    if check_container; then
        echo -e "\n${BLUE}=== Métriques du conteneur ===${NC}"
        docker stats $JENKINS_CONTAINER --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
        
        echo -e "\n${BLUE}=== Espace disque ===${NC}"
        docker exec $JENKINS_CONTAINER df -h
        
        echo -e "\n${BLUE}=== Processus Jenkins ===${NC}"
        docker exec $JENKINS_CONTAINER ps aux | grep -i jenkins
    fi
}

# Afficher les logs Jenkins
show_logs() {
    local lines=${1:-50}
    
    if check_container; then
        echo -e "\n${BLUE}=== Logs Jenkins (dernières $lines lignes) ===${NC}"
        docker logs --tail $lines $JENKINS_CONTAINER
    fi
}

# Démarrer Jenkins avec monitoring
start_jenkins() {
    print_status "INFO" "Démarrage de Jenkins..."
    
    # Vérifier si le script jenkins.sh existe
    if [ ! -f "./jenkins.sh" ]; then
        print_status "ERROR" "Script jenkins.sh non trouvé"
        exit 1
    fi

    # Démarrer Jenkins
    chmod +x ./jenkins.sh
    ./jenkins.sh

    # Attendre que Jenkins soit prêt
    check_jenkins_health
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "Jenkins démarré avec succès"
        show_initial_setup_info
    else
        print_status "ERROR" "Échec du démarrage de Jenkins"
        show_logs 20
        exit 1
    fi
}

# Arrêter Jenkins
stop_jenkins() {
    print_status "INFO" "Arrêt de Jenkins..."
    
    if docker ps | grep -q $JENKINS_CONTAINER; then
        docker stop $JENKINS_CONTAINER
        print_status "SUCCESS" "Jenkins arrêté"
    else
        print_status "WARNING" "Jenkins n'était pas en cours d'exécution"
    fi
}

# Afficher les informations de configuration initiale
show_initial_setup_info() {
    echo -e "\n${BLUE}=== Informations de configuration ===${NC}"
    echo "🌐 URL Jenkins: $JENKINS_URL"
    echo "📁 Répertoire de travail: $(pwd)"
    echo "📊 Dashboard: $JENKINS_URL/blue"
    
    # Récupérer le mot de passe initial si disponible
    if docker exec $JENKINS_CONTAINER test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
        echo -e "\n${YELLOW}🔑 Mot de passe administrateur initial:${NC}"
        docker exec $JENKINS_CONTAINER cat /var/jenkins_home/secrets/initialAdminPassword
        echo -e "\n${YELLOW}⚠️  Sauvegardez ce mot de passe !${NC}"
    fi

    echo -e "\n${BLUE}📋 Étapes suivantes:${NC}"
    echo "1. Ouvrez $JENKINS_URL dans votre navigateur"
    echo "2. Utilisez le mot de passe ci-dessus"
    echo "3. Installez les plugins suggérés"
    echo "4. Créez un utilisateur administrateur"
    echo "5. Configurez votre premier pipeline"
}

# Effectuer un check complet
perform_health_check() {
    echo -e "${BLUE}=== Vérification complète de Jenkins ===${NC}\n"
    
    check_docker
    
    if check_container; then
        check_jenkins_health
        show_container_metrics
        
        # Vérifier l'espace disque
        local disk_usage=$(docker exec $JENKINS_CONTAINER df /var/jenkins_home | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ $disk_usage -gt 80 ]; then
            print_status "WARNING" "Espace disque Jenkins > 80% ($disk_usage%)"
        else
            print_status "SUCCESS" "Espace disque Jenkins OK ($disk_usage%)"
        fi
        
        # Vérifier la mémoire
        local mem_usage=$(docker stats $JENKINS_CONTAINER --no-stream --format "{{.MemPerc}}" | sed 's/%//')
        if (( $(echo "$mem_usage > 85" | bc -l) )); then
            print_status "WARNING" "Utilisation mémoire > 85% ($mem_usage%)"
        else
            print_status "SUCCESS" "Utilisation mémoire OK ($mem_usage%)"
        fi
    fi
}

# Nettoyer les ressources
cleanup() {
    print_status "INFO" "Nettoyage des ressources Docker..."
    
    # Nettoyer les images inutilisées
    docker image prune -f
    
    # Nettoyer les volumes orphelins
    docker volume prune -f
    
    # Nettoyer les réseaux inutilisés
    docker network prune -f
    
    print_status "SUCCESS" "Nettoyage terminé"
}

# Sauvegarder la configuration Jenkins
backup_jenkins() {
    local backup_file="jenkins_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    print_status "INFO" "Création de la sauvegarde: $backup_file"
    
    if check_container; then
        docker exec $JENKINS_CONTAINER tar -czf /tmp/jenkins_backup.tar.gz -C /var/jenkins_home . --exclude='workspace/*' --exclude='logs/*'
        docker cp $JENKINS_CONTAINER:/tmp/jenkins_backup.tar.gz ./$backup_file
        docker exec $JENKINS_CONTAINER rm /tmp/jenkins_backup.tar.gz
        
        print_status "SUCCESS" "Sauvegarde créée: $backup_file"
    else
        print_status "ERROR" "Impossible de créer la sauvegarde - Jenkins non accessible"
        exit 1
    fi
}

# Afficher l'aide
show_help() {
    echo -e "${BLUE}Jenkins Monitor - Script de monitoring pour Incubateur${NC}\n"
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer Jenkins avec monitoring"
    echo "  stop      - Arrêter Jenkins"
    echo "  status    - Vérifier l'état de Jenkins"
    echo "  health    - Effectuer une vérification complète"
    echo "  logs      - Afficher les logs Jenkins"
    echo "  metrics   - Afficher les métriques du conteneur"
    echo "  cleanup   - Nettoyer les ressources Docker"
    echo "  backup    - Sauvegarder la configuration Jenkins"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 start         # Démarrer Jenkins"
    echo "  $0 health        # Vérification complète"
    echo "  $0 logs 100      # Afficher les 100 dernières lignes de log"
}

# Point d'entrée principal
main() {
    case "${1:-help}" in
        "start")
            start_jenkins
            ;;
        "stop")
            stop_jenkins
            ;;
        "status")
            check_container
            if [ $? -eq 0 ]; then
                check_jenkins_health
            fi
            ;;
        "health")
            perform_health_check
            ;;
        "logs")
            show_logs ${2:-50}
            ;;
        "metrics")
            show_container_metrics
            ;;
        "cleanup")
            cleanup
            ;;
        "backup")
            backup_jenkins
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_status "ERROR" "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Gestion des signaux
trap 'print_status "INFO" "Script interrompu par l'"'"'utilisateur"' INT TERM

# Exécuter la fonction principale
main "$@"

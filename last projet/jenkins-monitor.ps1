# Script de monitoring Jenkins pour Windows PowerShell
# Usage: .\jenkins-monitor.ps1 [start|stop|status|logs|health]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "logs", "health", "metrics", "cleanup", "backup", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [int]$Lines = 50
)

# Configuration
$JenkinsUrl = "http://localhost:8080"
$JenkinsContainer = "incubateur-jenkins"
$LogFile = "jenkins-monitor.log"

# Couleurs pour l'affichage
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
}

# Fonction de logging
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Tee-Object -FilePath $LogFile -Append
}

# Fonction d'affichage coloré
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    $symbol = switch ($Status) {
        "SUCCESS" { "✓" }
        "WARNING" { "⚠" }
        "ERROR" { "✗" }
        "INFO" { "ℹ" }
        default { "•" }
    }
    
    Write-Host "$symbol $Message" -ForegroundColor $Colors[$Status]
    Write-Log "$Status: $Message"
}

# Vérifier si Docker est installé et en cours d'exécution
function Test-Docker {
    try {
        if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Status "ERROR" "Docker n'est pas installé"
            exit 1
        }

        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Status "ERROR" "Docker n'est pas en cours d'exécution"
            exit 1
        }

        Write-Status "SUCCESS" "Docker est opérationnel"
        return $true
    }
    catch {
        Write-Status "ERROR" "Erreur lors de la vérification de Docker: $_"
        return $false
    }
}

# Vérifier l'état du conteneur Jenkins
function Test-Container {
    try {
        $runningContainers = docker ps --format "{{.Names}}"
        if ($runningContainers -contains $JenkinsContainer) {
            Write-Status "SUCCESS" "Conteneur Jenkins en cours d'exécution"
            return 0
        }

        $allContainers = docker ps -a --format "{{.Names}}"
        if ($allContainers -contains $JenkinsContainer) {
            Write-Status "WARNING" "Conteneur Jenkins arrêté"
            return 1
        }
        else {
            Write-Status "ERROR" "Conteneur Jenkins non trouvé"
            return 2
        }
    }
    catch {
        Write-Status "ERROR" "Erreur lors de la vérification du conteneur: $_"
        return 3
    }
}

# Vérifier la santé de Jenkins
function Test-JenkinsHealth {
    $maxAttempts = 30
    $attempt = 1

    Write-Status "INFO" "Vérification de la santé de Jenkins..."

    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "$JenkinsUrl/login" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Status "SUCCESS" "Jenkins est accessible sur $JenkinsUrl"
                return $true
            }
        }
        catch {
            # Ignorer les erreurs de connexion
        }

        Write-Status "WARNING" "Tentative $attempt/$maxAttempts - Jenkins non accessible"
        Start-Sleep 10
        $attempt++
    }

    Write-Status "ERROR" "Jenkins n'est pas accessible après $maxAttempts tentatives"
    return $false
}

# Afficher les métriques du conteneur
function Show-ContainerMetrics {
    if ((Test-Container) -eq 0) {
        Write-Host "`n=== Métriques du conteneur ===" -ForegroundColor $Colors.Info
        docker stats $JenkinsContainer --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.MemPerc}}`t{{.NetIO}}`t{{.BlockIO}}"
        
        Write-Host "`n=== Espace disque ===" -ForegroundColor $Colors.Info
        docker exec $JenkinsContainer df -h
        
        Write-Host "`n=== Processus Jenkins ===" -ForegroundColor $Colors.Info
        docker exec $JenkinsContainer ps aux | Select-String "jenkins"
    }
}

# Afficher les logs Jenkins
function Show-Logs {
    param([int]$LineCount = 50)
    
    if ((Test-Container) -eq 0) {
        Write-Host "`n=== Logs Jenkins (dernières $LineCount lignes) ===" -ForegroundColor $Colors.Info
        docker logs --tail $LineCount $JenkinsContainer
    }
}

# Démarrer Jenkins avec monitoring
function Start-Jenkins {
    Write-Status "INFO" "Démarrage de Jenkins..."
    
    # Vérifier si le script jenkins.sh existe
    if (!(Test-Path "./jenkins.sh")) {
        Write-Status "ERROR" "Script jenkins.sh non trouvé"
        exit 1
    }

    # Démarrer Jenkins (utiliser WSL ou Git Bash pour exécuter le script bash)
    try {
        if (Get-Command wsl -ErrorAction SilentlyContinue) {
            wsl chmod +x ./jenkins.sh
            wsl ./jenkins.sh
        }
        else {
            # Alternative avec PowerShell/Docker directement
            docker-compose -f docker-compose.test.yml up -d jenkins
        }

        # Attendre que Jenkins soit prêt
        if (Test-JenkinsHealth) {
            Write-Status "SUCCESS" "Jenkins démarré avec succès"
            Show-InitialSetupInfo
        }
        else {
            Write-Status "ERROR" "Échec du démarrage de Jenkins"
            Show-Logs 20
            exit 1
        }
    }
    catch {
        Write-Status "ERROR" "Erreur lors du démarrage: $_"
        exit 1
    }
}

# Arrêter Jenkins
function Stop-Jenkins {
    Write-Status "INFO" "Arrêt de Jenkins..."
    
    $runningContainers = docker ps --format "{{.Names}}"
    if ($runningContainers -contains $JenkinsContainer) {
        docker stop $JenkinsContainer
        Write-Status "SUCCESS" "Jenkins arrêté"
    }
    else {
        Write-Status "WARNING" "Jenkins n'était pas en cours d'exécution"
    }
}

# Afficher les informations de configuration initiale
function Show-InitialSetupInfo {
    Write-Host "`n=== Informations de configuration ===" -ForegroundColor $Colors.Info
    Write-Host "🌐 URL Jenkins: $JenkinsUrl"
    Write-Host "📁 Répertoire de travail: $(Get-Location)"
    Write-Host "📊 Dashboard: $JenkinsUrl/blue"
    
    # Récupérer le mot de passe initial si disponible
    try {
        $password = docker exec $JenkinsContainer cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
        if ($password) {
            Write-Host "`n🔑 Mot de passe administrateur initial:" -ForegroundColor $Colors.Warning
            Write-Host $password -ForegroundColor $Colors.Warning
            Write-Host "⚠️  Sauvegardez ce mot de passe !" -ForegroundColor $Colors.Warning
        }
    }
    catch {
        # Ignorer si le fichier n'existe pas
    }

    Write-Host "`n📋 Étapes suivantes:" -ForegroundColor $Colors.Info
    Write-Host "1. Ouvrez $JenkinsUrl dans votre navigateur"
    Write-Host "2. Utilisez le mot de passe ci-dessus"
    Write-Host "3. Installez les plugins suggérés"
    Write-Host "4. Créez un utilisateur administrateur"
    Write-Host "5. Configurez votre premier pipeline"
}

# Effectuer un check complet
function Invoke-HealthCheck {
    Write-Host "=== Vérification complète de Jenkins ===" -ForegroundColor $Colors.Info
    Write-Host ""
    
    Test-Docker
    
    $containerStatus = Test-Container
    if ($containerStatus -eq 0) {
        Test-JenkinsHealth
        Show-ContainerMetrics
        
        # Vérifier l'espace disque
        try {
            $diskInfo = docker exec $JenkinsContainer df /var/jenkins_home | Select-String -Pattern "/var/jenkins_home"
            if ($diskInfo) {
                $diskUsage = [int]($diskInfo -split '\s+')[4].TrimEnd('%')
                if ($diskUsage -gt 80) {
                    Write-Status "WARNING" "Espace disque Jenkins > 80% ($diskUsage%)"
                }
                else {
                    Write-Status "SUCCESS" "Espace disque Jenkins OK ($diskUsage%)"
                }
            }
        }
        catch {
            Write-Status "WARNING" "Impossible de vérifier l'espace disque"
        }
        
        # Vérifier la mémoire
        try {
            $memInfo = docker stats $JenkinsContainer --no-stream --format "{{.MemPerc}}"
            if ($memInfo) {
                $memUsage = [double]$memInfo.TrimEnd('%')
                if ($memUsage -gt 85) {
                    Write-Status "WARNING" "Utilisation mémoire > 85% ($memUsage%)"
                }
                else {
                    Write-Status "SUCCESS" "Utilisation mémoire OK ($memUsage%)"
                }
            }
        }
        catch {
            Write-Status "WARNING" "Impossible de vérifier l'utilisation mémoire"
        }
    }
}

# Nettoyer les ressources
function Invoke-Cleanup {
    Write-Status "INFO" "Nettoyage des ressources Docker..."
    
    # Nettoyer les images inutilisées
    docker image prune -f | Out-Null
    
    # Nettoyer les volumes orphelins
    docker volume prune -f | Out-Null
    
    # Nettoyer les réseaux inutilisés
    docker network prune -f | Out-Null
    
    Write-Status "SUCCESS" "Nettoyage terminé"
}

# Sauvegarder la configuration Jenkins
function Backup-Jenkins {
    $backupFile = "jenkins_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').tar.gz"
    
    Write-Status "INFO" "Création de la sauvegarde: $backupFile"
    
    if ((Test-Container) -eq 0) {
        try {
            docker exec $JenkinsContainer tar -czf /tmp/jenkins_backup.tar.gz -C /var/jenkins_home . --exclude='workspace/*' --exclude='logs/*'
            docker cp "${JenkinsContainer}:/tmp/jenkins_backup.tar.gz" ".\$backupFile"
            docker exec $JenkinsContainer rm /tmp/jenkins_backup.tar.gz
            
            Write-Status "SUCCESS" "Sauvegarde créée: $backupFile"
        }
        catch {
            Write-Status "ERROR" "Erreur lors de la sauvegarde: $_"
            exit 1
        }
    }
    else {
        Write-Status "ERROR" "Impossible de créer la sauvegarde - Jenkins non accessible"
        exit 1
    }
}

# Afficher l'aide
function Show-Help {
    Write-Host "Jenkins Monitor - Script de monitoring pour Incubateur" -ForegroundColor $Colors.Info
    Write-Host ""
    Write-Host "Usage: .\jenkins-monitor.ps1 [COMMANDE]"
    Write-Host ""
    Write-Host "Commandes disponibles:"
    Write-Host "  start     - Démarrer Jenkins avec monitoring"
    Write-Host "  stop      - Arrêter Jenkins"
    Write-Host "  status    - Vérifier l'état de Jenkins"
    Write-Host "  health    - Effectuer une vérification complète"
    Write-Host "  logs      - Afficher les logs Jenkins"
    Write-Host "  metrics   - Afficher les métriques du conteneur"
    Write-Host "  cleanup   - Nettoyer les ressources Docker"
    Write-Host "  backup    - Sauvegarder la configuration Jenkins"
    Write-Host "  help      - Afficher cette aide"
    Write-Host ""
    Write-Host "Exemples:"
    Write-Host "  .\jenkins-monitor.ps1 start         # Démarrer Jenkins"
    Write-Host "  .\jenkins-monitor.ps1 health        # Vérification complète"
    Write-Host "  .\jenkins-monitor.ps1 logs 100      # Afficher les 100 dernières lignes de log"
}

# Point d'entrée principal
function Main {
    switch ($Command) {
        "start" {
            Start-Jenkins
        }
        "stop" {
            Stop-Jenkins
        }
        "status" {
            $status = Test-Container
            if ($status -eq 0) {
                Test-JenkinsHealth | Out-Null
            }
        }
        "health" {
            Invoke-HealthCheck
        }
        "logs" {
            Show-Logs $Lines
        }
        "metrics" {
            Show-ContainerMetrics
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "backup" {
            Backup-Jenkins
        }
        "help" {
            Show-Help
        }
        default {
            Write-Status "ERROR" "Commande inconnue: $Command"
            Show-Help
            exit 1
        }
    }
}

# Gestion des erreurs
trap {
    Write-Status "ERROR" "Erreur inattendue: $_"
    exit 1
}

# Exécuter la fonction principale
Main

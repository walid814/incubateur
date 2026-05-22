pipeline {
    agent any
    
    tools {
        nodejs '18.x' // Assurez-vous que Node.js 18.x est configuré dans Jenkins
    }
    
    environment {
        // Variables d'environnement
        NODE_ENV = 'test'
        CHROME_BIN = '/usr/bin/google-chrome'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Récupération du code source...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installation des dépendances...'
                dir('incubateur') {
                    bat 'npm install'
                }
            }
        }
        
        stage('Code Quality Analysis') {
            steps {
                echo 'Analyse de la qualité du code...'
                dir('incubateur') {
                    // Lint du code TypeScript
                    bat 'npm run lint'
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo 'Exécution des tests unitaires...'
                dir('incubateur') {
                    bat 'npm run test:ci'
                }
            }
            post {
                always {
                    // Publication des résultats de tests
                    publishTestResults testResultsPattern: 'incubateur/test-results/**/*.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'incubateur/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Construction de l\'application...'
                dir('incubateur') {
                    bat 'npm run build:prod'
                }
            }
        }
        
        stage('E2E Tests') {
            steps {
                echo 'Tests end-to-end...'
                dir('incubateur') {
                    script {
                        try {
                            bat 'npm run e2e:ci'
                        } catch (Exception e) {
                            echo 'E2E tests failed, but continuing pipeline...'
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Analyse de sécurité...'
                dir('incubateur') {
                    bat 'npm audit --audit-level=high'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                echo 'Construction de l\'image Docker...'
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    bat "docker build -t incubateur-frontend:${imageTag} ."
                    bat "docker tag incubateur-frontend:${imageTag} incubateur-frontend:latest"
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Déploiement en environnement de staging...'
                script {
                    // Commandes de déploiement staging
                    bat 'echo "Déploiement staging simulé"'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                echo 'Déploiement en production...'
                script {
                    // Confirmation manuelle pour la production
                    input message: 'Déployer en production?', ok: 'Déployer'
                    bat 'echo "Déploiement production simulé"'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Nettoyage...'
            // Nettoyage des ressources
            bat 'docker system prune -f'
        }
        success {
            echo 'Pipeline exécuté avec succès!'
            // Notifications de succès
            emailext (
                subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Le build ${env.BUILD_NUMBER} s'est terminé avec succès.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Pipeline échoué!'
            // Notifications d'échec
            emailext (
                subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Le build ${env.BUILD_NUMBER} a échoué. Consultez les logs pour plus d'informations.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        unstable {
            echo 'Pipeline instable!'
            emailext (
                subject: "⚠️ Build Unstable: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Le build ${env.BUILD_NUMBER} est instable. Certains tests peuvent avoir échoué.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}

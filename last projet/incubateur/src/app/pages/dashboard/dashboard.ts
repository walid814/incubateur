import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ProjectService, Project, ProjectFinancing } from '../../services/project.service';
import { CandidatureAdminService } from '../../services/candidature-admin.service';
import { UserAdminService } from '../../services/user-admin.service';
import { DashboardSidebarComponent } from './components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardStatsOverviewComponent } from './components/dashboard-stats-overview/dashboard-stats-overview.component';
import { DashboardAdminSectionsComponent } from './components/dashboard-admin-sections/dashboard-admin-sections.component';
import { DashboardUserProjectsComponent } from './components/dashboard-user-projects/dashboard-user-projects.component';
import { DashboardActivityTasksComponent } from './components/dashboard-activity-tasks/dashboard-activity-tasks.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardSidebarComponent,
    DashboardHeaderComponent,
    DashboardStatsOverviewComponent,
    DashboardAdminSectionsComponent,
    DashboardUserProjectsComponent,
    DashboardActivityTasksComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Données des projets
  activeProjects: Project[] = [];
  projectFinancing: ProjectFinancing[] = [];
  projectStats: any = {};
  
  // Données du tableau de bord
  oldProjectStats = {
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  };

  // Statistiques pour administrateur
  adminStats = {
    totalUsers: 0,
    activeProjects: 0,
    totalFunding: 0, // €0
    approvedThisMonth: 0,
    pendingProjects: 0,
    openTickets: 0,
    pendingFunding: 0 // €0
  };

  // Statistiques des candidatures
  candidatureStats = {
    total: 0,
    enAttente: 0,
    enCoursEvaluation: 0,
    acceptees: 0,
    refusees: 0,
    montantTotalDemande: 0,
    montantAccorde: 0,
    tauxAcceptation: 0
  };

  // Statistiques des utilisateurs pour admin
  userStats = {
    total: 0,
    recent: 0,
    active: 0,
    admins: 0
  };

  recentActivities = [
    { icon: 'info', title: 'Aucune activité récente', description: 'Pas d\'activité enregistrée', time: 'N/A' }
  ];

  upcomingEvents = [
    { title: 'Aucun événement programmé', date: 'N/A', time: 'N/A' }
  ];

  resources = [
    { title: 'Aucune ressource disponible', type: 'N/A', icon: 'info' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private candidatureAdminService: CandidatureAdminService,
    private userAdminService: UserAdminService
  ) {
    console.log('🚀 Dashboard constructor appelé');
  }

  ngOnInit() {
    console.log('🚀 Dashboard ngOnInit appelé');
    
    // Forcer la récupération des données utilisateur
    console.log('🔍 localStorage token:', localStorage.getItem('token'));
    console.log('🔍 localStorage user:', localStorage.getItem('user'));
    
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Utilisateur actuel:', this.currentUser);
    console.log('🔐 Token présent:', !!this.authService.getToken());
    
    // Si pas d'utilisateur mais token présent, essayer de récupérer depuis localStorage
    if (!this.currentUser && this.authService.getToken()) {
      console.log('🔄 Tentative de récupération manuelle des données utilisateur');
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
          console.log('✅ Utilisateur récupéré manuellement:', this.currentUser);
        } catch (error) {
          console.error('❌ Erreur parsing userData:', error);
        }
      }
    }

    // Bloc de redirection désactivé temporairement pour permettre l'accès au dashboard sans connexion.
    // if (!this.currentUser) {
    //   this.router.navigate(['/connexion']);
    //   return;
    // }

    // Charger les données des projets
    this.loadProjectData();
    
    // Charger les statistiques des candidatures si admin
    if (this.isAdmin()) {
      this.loadCandidatureStats();
      this.loadUserStats();
    }
  }

  private loadProjectData() {
    // Charger les projets actifs
    this.projectService.getActiveProjects().subscribe(projects => {
      this.activeProjects = projects;
      console.log('📊 Projets actifs chargés:', projects);
    });

    // Charger les financements
    this.projectService.getProjectFinancing().subscribe(financing => {
      this.projectFinancing = financing;
      console.log('💰 Financements chargés:', financing);
    });

    // Charger les statistiques
    this.projectStats = this.projectService.getProjectStats();
    console.log('📈 Statistiques projets:', this.projectStats);
  }

  private loadCandidatureStats() {
    this.candidatureAdminService.getStatistiques().subscribe(stats => {
      this.candidatureStats = stats;
      console.log('📊 Statistiques candidatures chargées:', stats);
    });
  }

  private loadUserStats() {
    // Charger les vraies statistiques des utilisateurs via l'API
    this.userAdminService.getAllUsers().subscribe({
      next: (users) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        this.userStats = {
          total: users.length,
          recent: users.filter(user => {
            // Utiliser dateCreation si disponible, sinon considérer comme récent
            const createdAt = user.dateCreation ? new Date(user.dateCreation) : oneWeekAgo;
            return createdAt >= oneWeekAgo;
          }).length,
          active: users.filter(user => user.enabled !== false).length,
          admins: users.filter(user => user.role === 'ADMIN').length
        };
        
        console.log('👥 Statistiques utilisateurs chargées:', this.userStats);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques utilisateurs:', error);
        // Valeurs par défaut en cas d'erreur
        this.userStats = {
          total: 0,
          recent: 0,
          active: 0,
          admins: 1 // Au moins l'admin connecté
        };
      }
    });
  }

  exportUserData() {
    console.log('📥 Exportation des données utilisateurs...');
    
    this.userAdminService.getAllUsers().subscribe({
      next: (users) => {
        // Créer un CSV simple avec les données utilisateurs
        const csvHeader = 'ID,Prénom,Nom,Email,Téléphone,Ville,Rôle,Statut,Date de création\n';
        const csvData = users.map(user => 
          `${user.id},"${user.firstname}","${user.lastname}","${user.email}","${user.telephone || ''}","${user.ville || ''}","${user.role}","${user.enabled ? 'Actif' : 'Inactif'}","${user.dateCreation || ''}"`
        ).join('\n');
        
        const csvContent = csvHeader + csvData;
        
        // Créer et télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Exportation terminée');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'exportation:', error);
        alert('Erreur lors de l\'exportation des données utilisateurs');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getProgressPercentage(): number {
    if (this.projectStats.total > 0) {
      return Math.round((this.projectStats.completed / this.projectStats.total) * 100);
    }
    return Math.round((this.oldProjectStats.completed / this.oldProjectStats.total) * 100);
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    
    const firstname = this.currentUser.firstname || '';
    const lastname = this.currentUser.lastname || '';
    
    const firstInitial = firstname.charAt(0).toUpperCase();
    const lastInitial = lastname.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial || 'U';
  }

  // Méthodes pour la gestion des rôles
  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUser?.role === 'USER' || this.currentUser?.role === 'user' || !this.currentUser?.role;
  }

  getDashboardTitle(): string {
    if (this.isAdmin()) {
      return 'Tableau de bord administrateur';
    }
    return 'Tableau de bord entrepreneur';
  }

  getWelcomeMessage(): string {
    if (this.isAdmin()) {
      return 'Gérez la plateforme et accompagnez les entrepreneurs dans leur parcours';
    }
    return 'Pour développer votre projet entrepreneurial, pensez à compléter votre profil !';
  }

  getAdminStats() {
    // Retourner les statistiques en utilisant les vraies données des utilisateurs
    return {
      totalUsers: this.userStats.total,
      activeProjects: this.adminStats.activeProjects,
      totalFunding: this.adminStats.totalFunding,
      approvedThisMonth: this.adminStats.approvedThisMonth,
      pendingProjects: this.adminStats.pendingProjects,
      openTickets: this.adminStats.openTickets,
      pendingFunding: this.adminStats.pendingFunding
    };
  }

  formatAdminCurrency(amount: number): string {
    if (amount >= 1000000) {
      return '€' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '€' + (amount / 1000).toFixed(0) + 'K';
    }
    return '€' + amount.toLocaleString('fr-FR');
  }

  getRecentActivities() {
    // Données simulées pour l'administrateur
    if (this.isAdmin()) {
      return [
        { action: 'Aucune activité récente', time: 'Aucune', type: 'none' }
      ];
    }
    // Données pour entrepreneur
    return [
      { action: 'Aucune activité récente', time: 'Aucune', type: 'none' }
    ];
  }

  getPendingTasks() {
    if (this.isAdmin()) {
      return [
        { task: 'Aucune tâche en attente', priority: 'low', link: '#' }
      ];
    }
    return [
      { task: 'Aucune tâche en attente', priority: 'low', link: '#' }
    ];
  }

  // Nouvelles méthodes pour les projets et financements
  getStatusColor(status: string): string {
    switch (status) {
      case 'en_cours': return 'primary';
      case 'approuve': return 'accent';
      case 'en_attente': return 'warn';
      case 'termine': return 'success';
      case 'suspendu': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'approuve': return 'Approuvé';
      case 'en_attente': return 'En attente';
      case 'termine': return 'Terminé';
      case 'suspendu': return 'Suspendu';
      default: return status;
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'primary';
      case 'low': return 'accent';
      default: return 'primary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getProjectFinancingById(projectId: string): ProjectFinancing | undefined {
    return this.projectFinancing.find(f => f.projectId === projectId);
  }

  getFundingUtilizationPercentage(project: Project): number {
    if (project.fundingAllocated === 0) return 0;
    return Math.round((project.fundingUsed / project.fundingAllocated) * 100);
  }

  getNextMilestone(project: Project) {
    const incompleteMilestones = project.milestones
      .filter(m => !m.completed)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return incompleteMilestones[0] || null;
  }

  getDaysUntilDeadline(date: Date): number {
    const today = new Date();
    const deadline = new Date(date);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  navigateToProject(projectId: string) {
    this.router.navigate(['/projet', projectId]);
  }

  navigateToFinancing() {
    this.router.navigate(['/financement']);
  }
}

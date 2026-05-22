import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Project, ProjectFinancing } from '../../../../services/project.service';

// Type local: statistiques compactes des projets utilisateur.
export interface DashboardProjectStats {
  total?: number;
  active?: number;
  totalFunding?: number;
  totalUsed?: number;
  completed?: number;
}

// Composant: affichage des projets actifs et du financement associe.
@Component({
  selector: 'app-dashboard-user-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard-user-projects.component.html',
  styleUrls: ['./dashboard-user-projects.component.scss']
})
export class DashboardUserProjectsComponent {
  // Liste des projets actifs de l'entrepreneur.
  @Input() activeProjects: Project[] = [];

  // Liste des details de financement par projet.
  @Input() projectFinancing: ProjectFinancing[] = [];

  // Remonte la navigation vers un projet precis.
  @Output() navigateToProjectRequested = new EventEmitter<string>();

  // Remonte la navigation vers l'espace financement.
  @Output() navigateToFinancingRequested = new EventEmitter<void>();

  // Associe un statut a une couleur Material.
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

  // Traduit un statut technique en libelle lisible.
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

  // Selectionne l'icone selon le niveau de priorite.
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  // Selectionne la couleur selon la priorite.
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'primary';
      case 'low': return 'accent';
      default: return 'primary';
    }
  }

  // Formate un montant en EUR.
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  // Retourne les informations de financement d'un projet via son identifiant.
  getProjectFinancingById(projectId: string): ProjectFinancing | undefined {
    return this.projectFinancing.find(f => f.projectId === projectId);
  }

  // Calcule le taux d'utilisation du financement.
  getFundingUtilizationPercentage(project: Project): number {
    if (project.fundingAllocated === 0) return 0;
    return Math.round((project.fundingUsed / project.fundingAllocated) * 100);
  }

  // Extrait la prochaine etape non terminee pour afficher l'echeance.
  getNextMilestone(project: Project) {
    const incompleteMilestones = project.milestones
      .filter(m => !m.completed)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return incompleteMilestones[0] || null;
  }

  // Calcule le nombre de jours restants avant une date limite.
  getDaysUntilDeadline(date: Date): number {
    const today = new Date();
    const deadline = new Date(date);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ProjectService, Project, ProjectFinancing, FundingSource } from '../../services/project.service';

@Component({
  selector: 'app-financement',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './financement.html',
  styleUrls: ['./financement.scss']
})
export class FinancementComponent implements OnInit {
  projects: Project[] = [];
  projectFinancing: ProjectFinancing[] = [];
  fundingStats: any = {};
  displayedColumns = ['dataset', 'type', 'amount', 'status', 'date', 'actions'];

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    this.projectService.getProjectFinancing().subscribe(financing => {
      this.projectFinancing = financing;
      this.calculateFundingStats();
    });
  }

  private calculateFundingStats() {
    const allSources = this.projectFinancing.flatMap(f => f.fundingSources);
    
    this.fundingStats = {
      totalSources: allSources.length,
      obtainedAmount: allSources.filter(s => s.status === 'obtenu').reduce((sum, s) => sum + s.amount, 0),
      pendingAmount: allSources.filter(s => s.status === 'en_cours').reduce((sum, s) => sum + s.amount, 0),
      subventions: allSources.filter(s => s.type === 'subvention').reduce((sum, s) => sum + s.amount, 0),
      investissements: allSources.filter(s => s.type === 'investissement').reduce((sum, s) => sum + s.amount, 0),
      prets: allSources.filter(s => s.type === 'pret').reduce((sum, s) => sum + s.amount, 0),
      aides: allSources.filter(s => s.type === 'aide_publique').reduce((sum, s) => sum + s.amount, 0)
    };
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  }

  getFundingTypeIcon(type: string): string {
    switch (type) {
      case 'subvention': return 'redeem';
      case 'pret': return 'account_balance';
      case 'investissement': return 'trending_up';
      case 'aide_publique': return 'language';
      default: return 'help_center';
    }
  }

  getFundingTypeLabel(type: string): string {
    switch (type) {
      case 'subvention': return 'Subvention';
      case 'pret': return 'Prêt';
      case 'investissement': return 'Investissement';
      case 'aide_publique': return 'Aide publique';
      default: return type;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'obtenu': return 'accent';
      case 'en_cours': return 'primary';
      case 'refuse': return 'warn';
      case 'en_attente': return 'basic';
      default: return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'obtenu': return 'Obtenu';
      case 'en_cours': return 'En cours';
      case 'refuse': return 'Refusé';
      case 'en_attente': return 'En attente';
      default: return status;
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

  getAllFundingSources(): (FundingSource & { projectId: string; projectName: string })[] {
    const sources: (FundingSource & { projectId: string; projectName: string })[] = [];
    
    this.projectFinancing.forEach(financing => {
      financing.fundingSources.forEach(source => {
        sources.push({
          ...source,
          projectId: financing.projectId,
          projectName: this.getProjectName(financing.projectId)
        });
      });
    });

    return sources.sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
  }

  navigateToProject(projectId: string) {
    this.router.navigate(['/projet', projectId]);
  }

  goBackToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}


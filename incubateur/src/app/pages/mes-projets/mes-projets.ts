import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjetService, ProjetASoutenir } from '../../services/projet.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-mes-projets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    DashboardSidebarComponent
  ],
  templateUrl: './mes-projets.html',
  styleUrls: ['./mes-projets.scss']
})
export class MesProjetsComponent implements OnInit {
  projets: ProjetASoutenir[] = [];
  loading = true;

  constructor(
    private projetService: ProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.projetService.getMesProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getProgression(projet: ProjetASoutenir): number {
    if (!projet.montantRecherche) return 0;
    return Math.min(Math.round((projet.montantSoutenu / projet.montantRecherche) * 100), 100);
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(montant || 0);
  }

  formatDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  }
}

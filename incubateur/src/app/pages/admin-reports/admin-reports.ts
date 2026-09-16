import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CandidatureAdminService } from '../../services/candidature-admin.service';
import { UserAdminService } from '../../services/user-admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

interface ProjetAdmin {
  montantRecherche: number;
  montantSoutenu: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, DashboardSidebarComponent],
  templateUrl: './admin-reports.html',
  styleUrls: ['./admin-reports.scss']
})
export class AdminReportsComponent implements OnInit {
  loading = true;

  candidatureStats: any = {
    total: 0, enAttente: 0, enCoursEvaluation: 0, acceptees: 0, refusees: 0, tauxAcceptation: 0
  };

  projetStats = { total: 0, montantRecherche: 0, montantSoutenu: 0, tauxMoyen: 0 };

  userStats = { total: 0, admins: 0, entrepreneurs: 0 };

  constructor(
    private candidatureAdminService: CandidatureAdminService,
    private userAdminService: UserAdminService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.candidatureAdminService.getStatistiques().subscribe(stats => {
      this.candidatureStats = stats;
    });

    this.userAdminService.getAllUsers().subscribe(users => {
      this.userStats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        entrepreneurs: users.filter(u => u.role === 'USER').length
      };
    });

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<ProjetAdmin[]>('/api/projets', { headers }).subscribe({
      next: (projets) => {
        const montantRecherche = projets.reduce((s, p) => s + (p.montantRecherche || 0), 0);
        const montantSoutenu = projets.reduce((s, p) => s + (p.montantSoutenu || 0), 0);
        this.projetStats = {
          total: projets.length,
          montantRecherche,
          montantSoutenu,
          tauxMoyen: montantRecherche > 0 ? Math.round((montantSoutenu / montantRecherche) * 100) : 0
        };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 0
    }).format(montant || 0);
  }
}

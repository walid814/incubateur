import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

interface ProjetAdmin {
  id: number;
  titre: string;
  secteur: string;
  description: string;
  porteurFirstname: string;
  porteurLastname: string;
  montantRecherche: number;
  montantSoutenu: number;
  dateCreation: string;
}

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatProgressBarModule, DashboardSidebarComponent],
  templateUrl: './admin-projects.html',
  styleUrls: ['./admin-projects.scss']
})
export class AdminProjectsComponent implements OnInit {
  projets: ProjetAdmin[] = [];
  dataSource = new MatTableDataSource<ProjetAdmin>();
  loading = true;

  displayedColumns = ['titre', 'prenom', 'nom', 'secteur', 'financement', 'dateCreation'];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<ProjetAdmin[]>('/api/projets', { headers }).subscribe({
      next: (projets) => {
        this.projets = projets;
        this.dataSource.data = projets;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalProjets(): number {
    return this.projets.length;
  }

  get totalRecherche(): number {
    return this.projets.reduce((sum, p) => sum + (p.montantRecherche || 0), 0);
  }

  get totalSoutenu(): number {
    return this.projets.reduce((sum, p) => sum + (p.montantSoutenu || 0), 0);
  }

  get tauxFinancementMoyen(): number {
    if (this.projets.length === 0) return 0;
    const total = this.projets.reduce((sum, p) => {
      const taux = p.montantRecherche > 0 ? (p.montantSoutenu / p.montantRecherche) * 100 : 0;
      return sum + taux;
    }, 0);
    return Math.round(total / this.projets.length);
  }

  getProgression(projet: ProjetAdmin): number {
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}

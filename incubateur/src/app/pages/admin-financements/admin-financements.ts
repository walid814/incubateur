import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

interface SoutienAdmin {
  id: number;
  projetId: number;
  projetTitre: string;
  societaireFirstname: string;
  societaireLastname: string;
  montant: number;
  message?: string;
  dateCreation: string;
}

@Component({
  selector: 'app-admin-financements',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, DashboardSidebarComponent],
  templateUrl: './admin-financements.html',
  styleUrls: ['./admin-financements.scss']
})
export class AdminFinancementsComponent implements OnInit {
  soutiens: SoutienAdmin[] = [];
  dataSource = new MatTableDataSource<SoutienAdmin>();
  loading = true;

  displayedColumns = ['projet', 'societaire', 'montant', 'message', 'date'];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<SoutienAdmin[]>('/api/projets/soutiens', { headers }).subscribe({
      next: (soutiens) => {
        this.soutiens = soutiens;
        this.dataSource.data = soutiens;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalSoutenu(): number {
    return this.soutiens.reduce((sum, s) => sum + (s.montant || 0), 0);
  }

  get nombreSocietaires(): number {
    const set = new Set(this.soutiens.map(s => s.societaireFirstname + '|' + s.societaireLastname));
    return set.size;
  }

  get projetsFinances(): number {
    const set = new Set(this.soutiens.map(s => s.projetId));
    return set.size;
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(montant || 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

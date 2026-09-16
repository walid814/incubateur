import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

interface MaCandidature {
  id: number;
  firstname: string;
  lastname: string;
  motivation: string;
  objectifs: string;
  statut: 'en_attente' | 'en_cours_evaluation' | 'accepte' | 'refuse';
  dateCreation: string;
  dateEvaluation?: string;
  commentaires?: string;
}

@Component({
  selector: 'app-mes-candidatures',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule, DashboardSidebarComponent],
  templateUrl: './mes-candidatures.html',
  styleUrls: ['./mes-candidatures.scss']
})
export class MesCandidaturesComponent implements OnInit {
  candidatures: MaCandidature[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<MaCandidature[]>('/api/candidatures/mine', { headers }).subscribe({
      next: (candidatures) => {
        this.candidatures = candidatures;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours_evaluation': return "En cours d'évaluation";
      case 'accepte': return 'Acceptée';
      case 'refuse': return 'Refusée';
      default: return statut;
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'accepte': return 'check_circle';
      case 'refuse': return 'cancel';
      case 'en_cours_evaluation': return 'rate_review';
      default: return 'schedule';
    }
  }

  formatDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  }
}

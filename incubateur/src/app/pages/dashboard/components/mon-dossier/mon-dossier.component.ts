import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

interface MaCandidature {
  id: number;
  motivation: string;
  statut: 'en_attente' | 'en_cours_evaluation' | 'accepte' | 'refuse';
  dateCreation: string;
  commentaires?: string;
}

@Component({
  selector: 'app-mon-dossier',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, RouterModule],
  templateUrl: './mon-dossier.component.html',
  styleUrls: ['./mon-dossier.component.scss']
})
export class MonDossierComponent implements OnInit {
  candidatures: MaCandidature[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<MaCandidature[]>('/api/candidatures/mine', { headers }).subscribe({
      next: (candidatures) => {
        this.candidatures = candidatures;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours_evaluation': return 'En cours d\'évaluation';
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}

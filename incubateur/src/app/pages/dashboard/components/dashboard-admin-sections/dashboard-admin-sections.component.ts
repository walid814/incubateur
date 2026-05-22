import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';

// Composant: sections d'administration (utilisateurs, candidatures, actions rapides).
@Component({
  selector: 'app-dashboard-admin-sections',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule, RouterModule],
  templateUrl: './dashboard-admin-sections.component.html',
  styleUrls: ['./dashboard-admin-sections.component.scss']
})
export class DashboardAdminSectionsComponent {
  // Statistiques de candidatures pour la vue admin.
  @Input() candidatureStats: any = {};

  // Statistiques utilisateurs pour la vue admin.
  @Input() userStats: any = {};

  // Remonte la demande d'export CSV vers le parent.
  @Output() exportRequested = new EventEmitter<void>();

  // Formate les montants en EUR dans les cartes de synthese.
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Composant: vue d'ensemble des statistiques du dashboard.
@Component({
  selector: 'app-dashboard-stats-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-stats-overview.component.html',
  styleUrls: ['./dashboard-stats-overview.component.scss']
})
export class DashboardStatsOverviewComponent {
  // Active l'affichage des statistiques administrateur.
  @Input() isAdmin = false;

  // Active l'affichage des statistiques entrepreneur.
  @Input() isUser = false;

  // Donnees statistiques cote administrateur.
  @Input() adminStats: any = {};

  // Donnees statistiques cote entrepreneur.
  @Input() projectStats: any = {};

  // Formate un montant en devise EUR pour l'UI.
  formatCurrency(amount: number): string {
    if (!amount) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

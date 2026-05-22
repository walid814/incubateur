import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

// Composant: activites recentes et taches en attente du dashboard.
@Component({
  selector: 'app-dashboard-activity-tasks',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './dashboard-activity-tasks.component.html',
  styleUrls: ['./dashboard-activity-tasks.component.scss']
})
export class DashboardActivityTasksComponent {
  // Flux d'activites a afficher dans la timeline.
  @Input() activities: Array<{ action: string; time: string; type: string }> = [];

  // Liste des taches actionnables (avec lien de navigation).
  @Input() tasks: Array<{ task: string; priority: string; link: string }> = [];
}

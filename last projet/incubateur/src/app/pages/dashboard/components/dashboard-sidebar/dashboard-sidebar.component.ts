import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

// Composant: navigation laterale du dashboard (admin ou entrepreneur).
@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent {
  // Active les liens admin dans la sidebar.
  @Input() isAdmin = false;

  // Active les liens entrepreneur dans la sidebar.
  @Input() isUser = false;

  // Remonte l'action de deconnexion au composant parent.
  @Output() logoutRequested = new EventEmitter<void>();
}

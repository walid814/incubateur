import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { User } from '../../../../services/auth.service';

// Composant: en-tete du dashboard avec avatar, message et actions par role.
@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressBarModule, MatTooltipModule, RouterModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  // Utilisateur courant pour affichage nom, avatar et role.
  @Input() currentUser: User | null = null;

  // Indique si le role courant est administrateur.
  @Input() isAdmin = false;

  // Indique si le role courant est entrepreneur.
  @Input() isUser = false;

  // Pourcentage de progression du profil/projet.
  @Input() progressPercentage = 0;

  // Message de bienvenue contextualise par role.
  @Input() welcomeMessage = '';

  // Initiales affichees dans l'avatar.
  @Input() initials = 'U';

  // Remonte l'action de deconnexion au parent.
  @Output() logoutRequested = new EventEmitter<void>();
}

import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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

  // Etat du tiroir mobile (off-canvas). Sans effet sur desktop, ou
  // la sidebar reste fixe en permanence (le drawer est masque par CSS).
  isMobileOpen = false;

  // Ouvre/ferme le tiroir et verrouille le scroll du body quand ouvert.
  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.lockBodyScroll(this.isMobileOpen);
  }

  // Ferme le tiroir (clic sur scrim, sur un lien, ou touche Echap).
  closeMobile(): void {
    if (!this.isMobileOpen) { return; }
    this.isMobileOpen = false;
    this.lockBodyScroll(false);
  }

  // Echap referme le tiroir pour l'accessibilite clavier.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobile();
  }

  private lockBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') { return; }
    document.body.style.overflow = lock ? 'hidden' : '';
  }
}

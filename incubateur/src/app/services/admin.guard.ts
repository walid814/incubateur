import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated() || !this.authService.getCurrentUser()) {
      this.authService.logout();
      return this.router.createUrlTree(['/connexion']);
    }

    if (!this.authService.isAdmin()) {
      this.notificationService.showError(
        'Accès refusé',
        'Cette page est réservée aux administrateurs.'
      );
      return this.router.createUrlTree(['/dashboard']);
    }

    return true;
  }
}

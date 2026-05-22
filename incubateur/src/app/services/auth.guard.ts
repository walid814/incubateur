import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Bloque l'acces aux routes protegees si l'utilisateur n'est pas vraiment connecte.
  canActivate(): boolean | UrlTree {
    const hasToken = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();

    // La route est autorisee uniquement si le token existe ET les donnees utilisateur sont chargees.
    if (hasToken && user) {
      return true;
    }

    // Nettoie l'etat d'authentification incoherent puis redirige vers la connexion.
    this.authService.logout();
    return this.router.createUrlTree(['/connexion']);
  }
}

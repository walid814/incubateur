import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id?: number; // Optionnel si pas présent dans votre backend
    firstname: string;
    lastname: string;
    email: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    role?: string; // Optionnel si pas présent dans votre backend
  };
}

export interface User {
  id?: number; // Optionnel si pas présent dans votre backend
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role?: string; // Optionnel si pas présent dans votre backend
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth'; // Match backend controller: api/v1/auth
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier s'il y a un token stocké au démarrage
    this.checkStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials, { headers })
      .pipe(
        tap(response => {
          if (!response?.token) {
            return;
          }
          localStorage.setItem('token', response.token);

          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(error => throwError(() => error))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    // Si le subject est vide mais qu'on a des données en localStorage, les recharger.
    if (!this.currentUserSubject.value && localStorage.getItem('user')) {
      this.checkStoredAuth();
    }
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      return;
    }

    try {
      this.currentUserSubject.next(JSON.parse(userData));
    } catch {
      // Storage corrompu : on nettoie pour repartir d'un état sain.
      this.logout();
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  // Obtenir le rôle de l'utilisateur actuel
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  hasPermission(action: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    const role = this.getCurrentUser()?.role;

    switch (action) {
      case 'manage_candidatures':
      case 'manage_users':
      case 'view_admin_dashboard':
        return role === 'ADMIN';
      default:
        return true;
    }
  }

}

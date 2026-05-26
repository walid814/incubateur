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
    console.log('AuthService: Tentative de connexion vers:', `${this.apiUrl}/authenticate`);
    console.log('AuthService: Credentials:', { email: credentials.email, password: '***' });
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('AuthService: Réponse reçue:', response);
          console.log('AuthService: Type de response:', typeof response);
          console.log('AuthService: response.token:', response.token);
          console.log('AuthService: response.user:', response.user);
          console.log('AuthService: Keys de response:', Object.keys(response));
          console.log('AuthService: response complète stringifiée:', JSON.stringify(response, null, 2));
          
          // Vérifier si response.user existe et n'est pas undefined
          if (response.user === undefined) {
            console.error('⚠️ response.user est undefined !');
            console.log('🔍 Contenu de response:', response);
          }
          
          // Stocker le token et les informations utilisateur
          localStorage.setItem('token', response.token);
          
          // Ne stocker user que s'il existe
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            console.log('✅ User stocké avec succès');
          } else {
            console.error('❌ Impossible de stocker user: response.user est undefined');
          }
          
        }),
        catchError(error => {
          console.error('AuthService: Erreur de connexion:', error);
          console.error('AuthService: Status:', error.status);
          console.error('AuthService: Message:', error.message);
          console.error('AuthService: URL tentée:', `${this.apiUrl}/authenticate`);
          if (error.error) {
            console.error('AuthService: Réponse du serveur:', error.error);
          }
          return throwError(() => error);
        })
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
    console.log('🔍 getCurrentUser() appelée');
    console.log('🔍 currentUserSubject.value:', this.currentUserSubject.value);
    console.log('🔍 localStorage user:', localStorage.getItem('user'));
    
    // Si currentUserSubject est null mais qu'on a des données en localStorage, les recharger
    if (!this.currentUserSubject.value && localStorage.getItem('user')) {
      console.log('🔍 Rechargement des données depuis localStorage');
      this.checkStoredAuth();
    }
    
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private checkStoredAuth(): void {
    console.log('🔍 checkStoredAuth() appelée');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 Token récupéré:', token ? 'Présent' : 'Absent');
    console.log('🔍 UserData récupéré (brut):', userData);
    console.log('🔍 UserData type:', typeof userData);
    console.log('🔍 UserData length:', userData?.length);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('🔍 User parsé:', user);
        this.currentUserSubject.next(user);
        console.log('🔍 currentUserSubject value après next:', this.currentUserSubject.value);
      } catch (error) {
        console.error('🔍 Erreur parsing userData:', error);
        console.error('🔍 Contenu exact de userData:', JSON.stringify(userData));
        console.error('🔍 Premier caractère:', userData.charAt(0), 'Code:', userData.charCodeAt(0));
        
        // Si erreur de parsing, nettoyer le storage
        this.logout();
      }
    } else {
      console.log('🔍 Token ou userData manquant');
    }
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    const isAdmin = user?.role === 'ADMIN';
    console.log('🔐 Vérification admin:', { user: user?.email, role: user?.role, isAdmin });
    return isAdmin;
  }

  // Obtenir le rôle de l'utilisateur actuel
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Vérifier les permissions pour une action spécifique
  hasPermission(action: string): boolean {
    if (!this.isAuthenticated()) {
      console.log('🔐 Permission refusée: utilisateur non authentifié');
      return false;
    }

    const user = this.getCurrentUser();
    const role = user?.role;

    console.log('🔐 Vérification permission:', { action, userRole: role });

    switch (action) {
      case 'manage_candidatures':
      case 'manage_users':
      case 'view_admin_dashboard':
        return role === 'ADMIN';
      default:
        return true; // Actions de base autorisées pour tous les utilisateurs connectés
    }
  }

  // Méthode de diagnostic complète
  diagnoseAuthState(): void {
    console.log('🔬 === DIAGNOSTIC AUTHENTIFICATION ===');
    
    // 1. Vérifier le token
    const token = this.getToken();
    console.log('🔑 Token présent:', !!token);
    if (token) {
      console.log('🔑 Token length:', token.length);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    
    // 2. Vérifier l'utilisateur actuel
    const user = this.getCurrentUser();
    console.log('👤 Utilisateur actuel:', user);
    
    // 3. Vérifier le statut d'authentification
    console.log('✅ Authentifié:', this.isAuthenticated());
    
    // 4. Vérifier les permissions admin
    console.log('🔐 Est admin:', this.isAdmin());
    console.log('🔐 Rôle utilisateur:', this.getUserRole());
    
    // 5. Tester les permissions spécifiques
    console.log('🔐 Permission manage_users:', this.hasPermission('manage_users'));
    console.log('🔐 Permission manage_candidatures:', this.hasPermission('manage_candidatures'));
    
    console.log('🔬 === FIN DIAGNOSTIC ===');
  }

  // Méthode pour simuler une connexion admin de test
  simulateAdminLogin(): void {
    console.log('🧪 Simulation d\'une connexion admin...');
    
    const mockAdminUser: User = {
      id: 1,
      firstname: 'Admin',
      lastname: 'Test',
      email: 'admin@test.com',
      role: 'ADMIN'
    };
    
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImV4cCI6OTk5OTk5OTk5OX0.test';
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockAdminUser));
    
    this.currentUserSubject.next(mockAdminUser);
    
    console.log('✅ Connexion admin simulée');
    this.diagnoseAuthState();
  }
}

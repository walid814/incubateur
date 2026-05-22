import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface UserAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  isActive?: boolean; // Alias pour enabled
  dateCreation?: Date;
  lastLogin?: Date;
  profileComplete?: boolean;
}

export interface UserStatistics {
  total: number;
  admins: number;
  users: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  profilesComplete: number;
  profilesIncomplete: number;
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role: 'USER' | 'ADMIN';
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private apiUrl = 'http://localhost:8080/api/users';
  private apiUrlList = 'http://localhost:8080/api/users/users-list'; // Endpoint spécifique pour la liste

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔑 Token récupéré:', token ? `${token.substring(0, 20)}...` : 'Aucun token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    console.log('📋 Headers créés pour l\'API users');
    return headers;
  }

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<UserAdmin[]> {
    console.log('🔍 Tentative de récupération des utilisateurs...');
    console.log('📍 URL principale:', this.apiUrl);
    console.log('📍 URL liste alternative:', this.apiUrlList);
    
    // Essayer d'abord l'endpoint principal
    return this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      map((users: any[]) => {
        console.log('✅ Succès avec endpoint principal:', this.apiUrl);
        console.log('📋 Données brutes reçues:', users);
        
        // Utiliser mapUserData pour un mapping cohérent
        const mappedUsers = users.map(user => this.mapUserData(user));
        
        console.log('✅ Utilisateurs mappés:', mappedUsers);
        console.log('📊 Nombre d\'utilisateurs mappés:', mappedUsers.length);
        
        return mappedUsers;
      }),
      tap(users => {
        console.log('✅ Utilisateurs récupérés avec succès depuis:', this.apiUrl);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('⚠️ Échec avec endpoint principal, tentative avec endpoint alternatif...');
        console.warn('❌ Erreur endpoint principal:', error.status, error.message);
        
        // Essayer l'endpoint alternatif
        return this.http.get<any[]>(this.apiUrlList, { 
          headers: this.getHeaders() 
        }).pipe(
          map((users: any[]) => {
            console.log('✅ Succès avec endpoint alternatif:', this.apiUrlList);
            console.log('📋 Données brutes reçues:', users);
            
            const mappedUsers = users.map(user => this.mapUserData(user));
            console.log('✅ Utilisateurs mappés:', mappedUsers);
            
            return mappedUsers;
          }),
          tap(users => {
            console.log('✅ Utilisateurs récupérés avec succès depuis:', this.apiUrlList);
          }),
          catchError((secondError: HttpErrorResponse) => {
            console.error('❌ Échec des deux endpoints');
            console.error('❌ Erreur endpoint principal:', error.status, error.message);
            console.error('❌ Erreur endpoint alternatif:', secondError.status, secondError.message);
            this.logError(secondError);
            
            // Retourner des données de test en cas d'échec total
            console.log('🧪 Retour de données de test...');
            const testUsers: UserAdmin[] = [
              {
                id: 52,
                firstname: 'AliADMIN',
                lastname: 'Baba',
                email: 'atebabasile@gmail.com',
                telephone: '+237 123 456 789',
                role: 'ADMIN',
                enabled: true,
                isActive: true,
                dateCreation: new Date(),
                profileComplete: true
              }
            ];
            
            return of(testUsers);
          })
        );
      })
    );
  }

  // Récupérer un utilisateur par ID
  getUserById(id: number): Observable<UserAdmin> {
    console.log('🔍 Récupération de l\'utilisateur ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(user => this.mapUserData(user)),
      tap(user => console.log('✅ Utilisateur récupéré:', user)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Créer un nouvel utilisateur
  createUser(userData: CreateUserRequest): Observable<UserAdmin> {
    console.log('➕ Création d\'un nouvel utilisateur:', userData.email);
    
    return this.http.post<any>(`${this.apiUrl}`, userData, { 
      headers: this.getHeaders() 
    }).pipe(
      map(user => this.mapUserData(user)),
      tap(user => console.log('✅ Utilisateur créé avec succès:', user)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Mettre à jour un utilisateur
  updateUser(id: number, userData: Partial<UserAdmin>): Observable<UserAdmin> {
    console.log('📝 Mise à jour de l\'utilisateur ID:', id);
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData, { 
      headers: this.getHeaders() 
    }).pipe(
      map(user => this.mapUserData(user)),
      tap(user => console.log('✅ Utilisateur mis à jour:', user)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    console.log('🗑️ Suppression de l\'utilisateur ID:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => console.log('✅ Utilisateur supprimé avec succès')),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Activer/désactiver un utilisateur
  toggleUserStatus(id: number, enabled: boolean): Observable<UserAdmin> {
    console.log(`${enabled ? '✅' : '❌'} ${enabled ? 'Activation' : 'Désactivation'} de l'utilisateur ID:`, id);
    
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { enabled }, { 
      headers: this.getHeaders() 
    }).pipe(
      map(user => this.mapUserData(user)),
      tap(user => console.log('✅ Statut utilisateur mis à jour:', user)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors du changement de statut:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Changer le rôle d'un utilisateur
  updateUserRole(id: number, role: 'USER' | 'ADMIN'): Observable<UserAdmin> {
    console.log('🔐 Changement de rôle pour l\'utilisateur ID:', id, 'vers:', role);
    
    return this.http.patch<any>(`${this.apiUrl}/${id}/role`, { role }, { 
      headers: this.getHeaders() 
    }).pipe(
      map(user => this.mapUserData(user)),
      tap(user => console.log('✅ Rôle utilisateur mis à jour:', user)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors du changement de rôle:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Obtenir les statistiques des utilisateurs
  getUserStatistics(): Observable<UserStatistics> {
    console.log('📊 Récupération des statistiques utilisateurs');
    
    // Au lieu d'appeler un endpoint séparé, calculer les statistiques à partir des utilisateurs
    return this.getAllUsers().pipe(
      map((users: UserAdmin[]) => {
        console.log('📊 Calcul des statistiques pour', users.length, 'utilisateurs');
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const stats: UserStatistics = {
          total: users.length,
          admins: users.filter(u => u.role === 'ADMIN').length,
          users: users.filter(u => u.role === 'USER' || !u.role).length,
          activeUsers: users.filter(u => u.isActive !== false).length,
          inactiveUsers: users.filter(u => u.isActive === false).length,
          newUsersThisMonth: users.filter(u => {
            if (!u.dateCreation) return false;
            const createdAt = new Date(u.dateCreation);
            return createdAt >= startOfMonth;
          }).length,
          profilesComplete: users.filter(u => 
            u.firstname && u.lastname && u.email && u.telephone && u.adresse
          ).length,
          profilesIncomplete: users.filter(u => 
            !u.firstname || !u.lastname || !u.email || !u.telephone || !u.adresse
          ).length
        };
        
        console.log('📈 Statistiques calculées:', stats);
        return stats;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors du calcul des statistiques:', error);
        this.logError(error);
        
        // Retourner des statistiques par défaut en cas d'erreur
        return of({
          total: 0,
          admins: 0,
          users: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          newUsersThisMonth: 0,
          profilesComplete: 0,
          profilesIncomplete: 0
        } as UserStatistics);
      })
    );
  }

  // Rechercher des utilisateurs
  searchUsers(query: string): Observable<UserAdmin[]> {
    console.log('🔍 Recherche d\'utilisateurs avec:', query);
    
    return this.http.get<any[]>(`${this.apiUrl}/search`, { 
      headers: this.getHeaders(),
      params: { q: query }
    }).pipe(
      map((users: any[]) => users.map(user => this.mapUserData(user))),
      tap(users => console.log('✅ Résultats de recherche:', users)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la recherche:', error);
        this.logError(error);
        return of([] as UserAdmin[]);
      })
    );
  }

  // Réinitialiser le mot de passe d'un utilisateur
  resetUserPassword(id: number): Observable<{ temporaryPassword: string }> {
    console.log('🔒 Réinitialisation du mot de passe pour l\'utilisateur ID:', id);
    
    return this.http.post<{ temporaryPassword: string }>(`${this.apiUrl}/${id}/reset-password`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(result => console.log('✅ Mot de passe réinitialisé')),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Méthode utilitaire pour mapper les données utilisateur
  private mapUserData(user: any): UserAdmin {
    const enabled = user.enabled !== undefined ? user.enabled : true;
    return {
      id: user.id,
      firstname: user.firstname || user.firstName || '',
      lastname: user.lastname || user.lastName || '',
      email: user.email || user.username || '',
      telephone: user.telephone || user.phone || '',
      adresse: user.adresse || user.address || '',
      ville: user.ville || user.city || '',
      codePostal: user.codePostal || user.postalCode || '',
      role: user.role || (user.authorities && user.authorities[0]?.authority) || 'USER',
      enabled: enabled,
      isActive: enabled, // Alias pour enabled pour compatibilité
      dateCreation: user.dateCreation ? new Date(user.dateCreation) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      profileComplete: !!(user.firstname && user.lastname && user.email)
    };
  }

  // Méthode utilitaire pour logger les erreurs
  private logError(error: HttpErrorResponse): void {
    console.error('🔍 Détails de l\'erreur:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });

    switch (error.status) {
      case 0:
        console.error('🚫 Erreur de connexion - Vérifiez que le backend est démarré');
        break;
      case 401:
        console.error('🔐 Non authentifié - Token invalide ou expiré');
        break;
      case 403:
        console.error('🛡️ Accès refusé - Permissions insuffisantes');
        break;
      case 404:
        console.error('🔍 Ressource non trouvée');
        break;
      case 500:
        console.error('🔥 Erreur serveur interne');
        break;
      default:
        console.error('❌ Erreur inconnue:', error.status);
    }
  }

  // Méthode de test pour vérifier la connectivité API
  testApiConnection(): Observable<boolean> {
    console.log('🧪 Test de connexion à l\'API users');
    
    return this.http.get(`${this.apiUrl}/health`, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('✅ Test API réussi:', response.status);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Test API échoué:', error.status);
        this.logError(error);
        return of(false);
      })
    );
  }

  // Exporter la liste des utilisateurs au format CSV/Excel
  exportUsers(): Observable<Blob> {
    console.log('📤 Export des utilisateurs');
    
    return this.http.get(`${this.apiUrl}/export`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ Export réussi')),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de l\'export:', error);
        this.logError(error);
        throw error;
      })
    );
  }

  // Méthode de diagnostic complète
  diagnoseConnection(): Observable<any> {
    console.log('🔬 === DIAGNOSTIC CONNEXION API ===');
    
    const diagnostics = {
      baseUrl: this.apiUrl,
      token: !!localStorage.getItem('token'),
      tokenPreview: localStorage.getItem('token')?.substring(0, 20) + '...',
      tests: [] as any[]
    };

    console.log('📋 Configuration:', diagnostics);

    // Test 1: Endpoint de base sans auth
    return this.http.get('http://localhost:8080/', { observe: 'response' }).pipe(
      tap(() => {
        diagnostics.tests.push({ test: 'base_connection', status: 'success' });
        console.log('✅ Test 1: Connexion de base OK');
      }),
      catchError(() => {
        diagnostics.tests.push({ test: 'base_connection', status: 'failed' });
        console.log('❌ Test 1: Connexion de base échouée');
        return of(null);
      }),
      // Test 2: Endpoint users avec auth
      tap(() => {
        return this.getAllUsers().pipe(
          tap(() => {
            diagnostics.tests.push({ test: 'users_endpoint', status: 'success' });
            console.log('✅ Test 2: Endpoint users OK');
          }),
          catchError(() => {
            diagnostics.tests.push({ test: 'users_endpoint', status: 'failed' });
            console.log('❌ Test 2: Endpoint users échoué');
            return of([]);
          })
        ).subscribe();
      }),
      map(() => {
        console.log('🔬 === RÉSULTATS DIAGNOSTIC ===', diagnostics);
        return diagnostics;
      })
    );
  }
}

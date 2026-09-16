import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export type UserRole = 'USER' | 'SOCIETAIRE' | 'ADMIN';

export interface UserAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role: UserRole;
  enabled: boolean;
  isActive?: boolean; // Alias pour enabled
  dateCreation?: Date;
  profileComplete?: boolean;
}

export interface UserStatistics {
  total: number;
  admins: number;
  societaires: number;
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
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  getAllUsers(): Observable<UserAdmin[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map((users: any[]) => users.map(user => this.mapUserData(user))),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  createUser(userData: CreateUserRequest): Observable<UserAdmin> {
    return this.http.post<any>(this.apiUrl, userData, { headers: this.getHeaders() }).pipe(
      map(user => this.mapUserData(user)),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<UserAdmin> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData, { headers: this.getHeaders() }).pipe(
      map(user => this.mapUserData(user)),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  toggleUserStatus(id: number, enabled: boolean): Observable<UserAdmin> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { enabled }, { headers: this.getHeaders() }).pipe(
      map(user => this.mapUserData(user)),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  updateUserRole(id: number, role: UserRole): Observable<UserAdmin> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/role`, { role }, { headers: this.getHeaders() }).pipe(
      map(user => this.mapUserData(user)),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  getUserStatistics(): Observable<UserStatistics> {
    return this.getAllUsers().pipe(
      map((users: UserAdmin[]) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
          total: users.length,
          admins: users.filter(u => u.role === 'ADMIN').length,
          societaires: users.filter(u => u.role === 'SOCIETAIRE').length,
          users: users.filter(u => u.role === 'USER' || !u.role).length,
          activeUsers: users.filter(u => u.isActive !== false).length,
          inactiveUsers: users.filter(u => u.isActive === false).length,
          newUsersThisMonth: users.filter(u => {
            if (!u.dateCreation) return false;
            return new Date(u.dateCreation) >= startOfMonth;
          }).length,
          profilesComplete: users.filter(u =>
            u.firstname && u.lastname && u.email && u.telephone && u.adresse
          ).length,
          profilesIncomplete: users.filter(u =>
            !u.firstname || !u.lastname || !u.email || !u.telephone || !u.adresse
          ).length
        } as UserStatistics;
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        return of({
          total: 0, admins: 0, societaires: 0, users: 0,
          activeUsers: 0, inactiveUsers: 0, newUsersThisMonth: 0,
          profilesComplete: 0, profilesIncomplete: 0
        } as UserStatistics);
      })
    );
  }

  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logError(error);
        throw error;
      })
    );
  }

  private mapUserData(user: any): UserAdmin {
    const enabled = user.enabled !== undefined ? user.enabled : true;
    return {
      id: user.id,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      ville: user.ville || '',
      codePostal: user.codePostal || '',
      role: user.role || 'USER',
      enabled,
      isActive: enabled,
      dateCreation: user.dateCreation ? new Date(user.dateCreation) : undefined,
      profileComplete: !!(user.firstname && user.lastname && user.email)
    };
  }

  private logError(error: HttpErrorResponse): void {
    console.error('❌ Erreur API utilisateurs :', error.status, error.message, error.error);
  }
}

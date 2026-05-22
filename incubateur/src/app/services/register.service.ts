import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = '/api/v1/auth'; // Utiliser le proxy
  private registeredEmails = new Set<string>();
  private lastRegistrationTime = 0;
  private readonly MIN_INTERVAL = 60000; // 1 minute minimum entre enregistrements

  constructor(private http: HttpClient) {}

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    // Validation de sécurité côté service
    const validationError = this.validateRegistration(userData);
    if (validationError) {
      return throwError(() => ({ message: validationError, status: 400 }));
    }

    // Marquer cet email comme en cours d'enregistrement
    this.registeredEmails.add(userData.email.toLowerCase());
    this.lastRegistrationTime = Date.now();

    // Headers de sécurité
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Registration-ID': this.generateId(),
      'X-Client-Time': new Date().toISOString()
    });

    // Préparer les données à envoyer (sans confirmPassword)
    const { confirmPassword, ...registerData } = userData;
    const payload = {
      ...registerData,
      role: registerData.role || 'USER',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, payload, { headers }).pipe(
      retry(1),
      catchError(error => {
        // Retirer l'email du cache en cas d'erreur légitime
        if (error.status !== 429 && error.status !== 409) {
          this.registeredEmails.delete(userData.email.toLowerCase());
        }
        return throwError(() => error);
      })
    );
  }

  private validateRegistration(userData: RegisterRequest): string | null {
    // Vérifier l'interval minimum
    const timeSinceLastRegistration = Date.now() - this.lastRegistrationTime;
    if (timeSinceLastRegistration < this.MIN_INTERVAL) {
      return `Veuillez attendre ${Math.ceil((this.MIN_INTERVAL - timeSinceLastRegistration) / 1000)} secondes.`;
    }

    // Vérifier si cet email a déjà été utilisé
    if (this.registeredEmails.has(userData.email.toLowerCase())) {
      return 'Cette adresse email a déjà été utilisée récemment.';
    }

    // Validation des mots de passe
    if (userData.password !== userData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas.';
    }

    // Validation de la force du mot de passe
    if (!this.isPasswordStrong(userData.password)) {
      return 'Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.';
    }

    // Validation basique des données
    if (!userData.email || !userData.firstname || !userData.lastname || !userData.password) {
      return 'Tous les champs obligatoires doivent être remplis.';
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return 'Format email invalide.';
    }

    // Vérification de la longueur des champs
    if (userData.firstname.length > 50 || userData.lastname.length > 50) {
      return 'Le prénom et nom doivent faire moins de 50 caractères.';
    }

    return null;
  }

  private isPasswordStrong(password: string): boolean {
    // Au moins 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour vérifier la disponibilité d'un email
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-email?email=${encodeURIComponent(email)}`);
  }

  // Méthode pour nettoyer le cache
  clearCache(): void {
    this.registeredEmails.clear();
    this.lastRegistrationTime = 0;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, retry, catchError, tap } from 'rxjs/operators';

export interface CandidaturePayload {
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  motivation: string;
  objectifs: string;
}

// Interface étendue pour les données internes
interface CandidatureFormData extends CandidaturePayload {
  timestamp?: string;
  userAgent?: string;
  submissionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8080/api/candidatures/addCandidature'; // URL complète temporaire
  private submittedEmails = new Set<string>(); // Cache des emails déjà soumis
  private lastSubmissionTime = 0;
  private readonly MIN_INTERVAL = 30000; // 30 secondes minimum entre soumissions

  constructor(private http: HttpClient) {}

  enregistrerCandidature(formData: CandidatureFormData): Observable<any> {
    // Extraire seulement les champs que le backend attend
    const payload: CandidaturePayload = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse,
      ville: formData.ville,
      codePostal: formData.codePostal,
      motivation: formData.motivation,
      objectifs: formData.objectifs
    };

    // Validation de sécurité côté service
    const validationError = this.validateSubmission(formData);
    if (validationError) {
      return throwError(() => ({ message: validationError, status: 429 }));
    }

    // Marquer cet email comme soumis
    this.submittedEmails.add(payload.email.toLowerCase());
    this.lastSubmissionTime = Date.now();

    // Headers de sécurité
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Submission-ID': formData.submissionId || this.generateId()
    });

    console.log('Envoi de la candidature:', payload); // Debug
    console.log('Headers:', headers); // Debug
    console.log('URL:', this.apiUrl); // Debug

    // Le backend renvoie du texte plain, pas du JSON
    return this.http.post(this.apiUrl, payload, { 
      headers, 
      responseType: 'text' // Spécifier que la réponse est en texte
    }).pipe(
      retry(1), // Une seule tentative de retry
      tap((response) => {
        console.log('Réponse reçue avec succès (texte):', response);
      }),
      catchError(error => {
        console.error('Erreur HTTP candidature:', error); // Debug
        
        // Si c'est un status 200 avec une erreur de parsing, c'est en fait un succès
        if (error.status === 200 && error.error && error.error.text) {
          console.log('Candidature enregistrée avec succès (réponse text):', error.error.text);
          return of(error.error.text); // Retourner le texte comme succès
        }
        
        // Gestion spécifique des erreurs CORS
        if (error.status === 0) {
          console.error('Erreur CORS ou connexion - Vérifiez que le backend est démarré sur le port 8080');
        }
        
        // Retirer l'email du cache en cas d'erreur légitime
        if (error.status !== 429 && error.status !== 409) {
          this.submittedEmails.delete(payload.email.toLowerCase());
        }
        return throwError(() => error);
      })
    );
  }

  private validateSubmission(formData: CandidatureFormData): string | null {
    // Vérifier l'interval minimum
    const timeSinceLastSubmission = Date.now() - this.lastSubmissionTime;
    if (timeSinceLastSubmission < this.MIN_INTERVAL) {
      return `Veuillez attendre ${Math.ceil((this.MIN_INTERVAL - timeSinceLastSubmission) / 1000)} secondes.`;
    }

    // Vérifier si cet email a déjà été soumis
    if (this.submittedEmails.has(formData.email.toLowerCase())) {
      return 'Cette adresse email a déjà été utilisée pour une candidature.';
    }

    // Validation basique des données
    if (!formData.email || !formData.firstname || !formData.lastname) {
      return 'Données incomplètes détectées.';
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Format email invalide.';
    }

    // Vérification de la longueur des champs (protection contre les attaques et limites DB)
    if (formData.firstname && formData.firstname.length > 100) {
      return 'Le prénom est trop long (max 100 caractères).';
    }

    if (formData.lastname && formData.lastname.length > 100) {
      return 'Le nom est trop long (max 100 caractères).';
    }

    if (formData.email && formData.email.length > 150) {
      return 'L\'email est trop long (max 150 caractères).';
    }

    if (formData.telephone && formData.telephone.length > 20) {
      return 'Le téléphone est trop long (max 20 caractères).';
    }

    if (formData.adresse && formData.adresse.length > 255) {
      return 'L\'adresse est trop longue (max 255 caractères).';
    }

    if (formData.ville && formData.ville.length > 100) {
      return 'La ville est trop longue (max 100 caractères).';
    }

    if (formData.codePostal && formData.codePostal.length > 10) {
      return 'Le code postal est trop long (max 10 caractères).';
    }

    if (formData.motivation && formData.motivation.length > 255) {
      return 'Le texte de motivation est trop long (max 255 caractères).';
    }

    if (formData.objectifs && formData.objectifs.length > 255) {
      return 'Le texte des objectifs est trop long (max 255 caractères).';
    }

    return null;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour nettoyer le cache (optionnel)
  clearCache(): void {
    this.submittedEmails.clear();
    this.lastSubmissionTime = 0;
  }
}

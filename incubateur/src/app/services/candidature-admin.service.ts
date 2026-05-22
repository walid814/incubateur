import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface CandidatureAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  motivation: string;
  objectifs: string;
  statut?: 'en_attente' | 'en_cours_evaluation' | 'accepte' | 'refuse';
  dateCreation?: Date;
  dateEvaluation?: Date;
  commentaires?: string;
  evaluateur?: string;
  score?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureAdminService {
  private apiUrl = 'http://localhost:8080/api/candidatures';
  private listeUrl = 'http://localhost:8080/api/candidatures/liste-candidatures';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔑 Token récupéré:', token ? `${token.substring(0, 20)}...` : 'Aucun token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    console.log('📋 Headers créés:', {
      'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'Pas de token',
      'Content-Type': 'application/json'
    });
    
    return headers;
  }

  // Récupérer toutes les candidatures (admin seulement)
  getAllCandidatures(): Observable<CandidatureAdmin[]> {
    console.log('🔍 Récupération des candidatures depuis:', this.listeUrl);
    console.log('🔑 Headers:', this.getHeaders());
    
    return this.http.get<CandidatureAdmin[]>(this.listeUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((candidatures: CandidatureAdmin[]) => {
        console.log('✅ Candidatures récupérées avec succès:', candidatures);
        console.log('📊 Nombre de candidatures:', candidatures.length);
      }),
      catchError((error: any) => {
        console.error('❌ Erreur lors de la récupération des candidatures:', error);
        console.error('🔍 Status:', error.status);
        console.error('🔍 Message:', error.message);
        console.error('🔍 URL appelée:', this.listeUrl);
        
        // En cas d'erreur, retourner un tableau vide ou des données de fallback
        if (error.status === 0) {
          console.error('🚫 Erreur CORS ou connexion - Vérifiez que le backend est démarré sur http://localhost:8080');
        } else if (error.status === 401) {
          console.error('🔐 Erreur d\'authentification - Vérifiez le token');
        } else if (error.status === 403) {
          console.error('🛡️ Accès refusé - Vérifiez les permissions admin');
        } else if (error.status === 404) {
          console.error('🔍 Endpoint non trouvé - Vérifiez que l\'API existe');
        }
        
        // Retourner un tableau vide en cas d'erreur
        return of([] as CandidatureAdmin[]);
      })
    );
  }

  // Mettre à jour le statut d'une candidature
  updateStatut(id: number, statut: CandidatureAdmin['statut'], commentaires?: string): Observable<CandidatureAdmin> {
    return this.http.put<CandidatureAdmin>(
      `${this.apiUrl}/${id}/statut`, 
      { statut, commentaires },
      { headers: this.getHeaders() }
    );
  }

  // Attribuer un évaluateur
  assignEvaluateur(id: number, evaluateur: string): Observable<CandidatureAdmin> {
    return this.http.put<CandidatureAdmin>(
      `${this.apiUrl}/${id}/evaluateur`, 
      { evaluateur },
      { headers: this.getHeaders() }
    );
  }

  // Ajouter un commentaire d'évaluation
  addCommentaire(id: number, commentaires: string, score?: number): Observable<CandidatureAdmin> {
    return this.http.put<CandidatureAdmin>(
      `${this.apiUrl}/${id}/evaluation`, 
      { commentaires, score },
      { headers: this.getHeaders() }
    );
  }

  // Supprimer une candidature
  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Statistiques des candidatures
  getStatistiques(): Observable<any> {
    return this.getAllCandidatures().pipe(
      tap((candidatures: CandidatureAdmin[]) => {
        console.log('Calcul des statistiques pour:', candidatures.length, 'candidatures');
      }),
      map((candidatures: CandidatureAdmin[]) => {
        const stats = {
          total: candidatures.length,
          enAttente: candidatures.filter((c: CandidatureAdmin) => c.statut === 'en_attente' || !c.statut).length,
          enCoursEvaluation: candidatures.filter((c: CandidatureAdmin) => c.statut === 'en_cours_evaluation').length,
          acceptees: candidatures.filter((c: CandidatureAdmin) => c.statut === 'accepte').length,
          refusees: candidatures.filter((c: CandidatureAdmin) => c.statut === 'refuse').length,
          montantTotalDemande: 0, // Pas de montant dans les candidatures actuelles
          montantAccorde: 0, // Pas de montant dans les candidatures actuelles
          tauxAcceptation: candidatures.length > 0 ? 
            Math.round((candidatures.filter((c: CandidatureAdmin) => c.statut === 'accepte').length / candidatures.length) * 100) : 0
        };
        console.log('Statistiques calculées:', stats);
        return stats;
      }),
      catchError((error: any) => {
        console.error('Erreur lors du calcul des statistiques:', error);
        // Retourner des statistiques vides en cas d'erreur
        return of({
          total: 0,
          enAttente: 0,
          enCoursEvaluation: 0,
          acceptees: 0,
          refusees: 0,
          montantTotalDemande: 0,
          montantAccorde: 0,
          tauxAcceptation: 0
        });
      })
    );
  }

  // Exporter les candidatures
  exportCandidatures(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Méthode pour tester la connectivité à l'API
  testApiConnection(): Observable<any> {
    console.log('🧪 Test de connexion à l\'API...');
    return this.http.get(`${this.apiUrl}/test`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('✅ API accessible')),
      catchError((error) => {
        console.error('❌ API inaccessible:', error);
        return of(null);
      })
    );
  }

  // Méthode pour récupérer les candidatures sans authentification (pour debug)
  getCandidaturesPublic(): Observable<any> {
    console.log('🧪 Test sans authentification...');
    return this.http.get(this.listeUrl).pipe(
      tap((data) => console.log('✅ Données publiques:', data)),
      catchError((error) => {
        console.error('❌ Erreur publique:', error);
        return of(null);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjetASoutenir {
  id: number;
  titre: string;
  secteur: string;
  description: string;
  porteurFirstname: string;
  porteurLastname: string;
  montantRecherche: number;
  montantSoutenu: number;
  dateCreation: string;
}

export interface Soutien {
  id: number;
  projetId: number;
  projetTitre: string;
  montant: number;
  message?: string;
  dateCreation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = '/api/projets';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProjets(): Observable<ProjetASoutenir[]> {
    return this.http.get<ProjetASoutenir[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  soutenir(projetId: number, montant: number, message?: string): Observable<Soutien> {
    return this.http.post<Soutien>(`${this.apiUrl}/${projetId}/soutenir`, { montant, message }, { headers: this.getHeaders() });
  }

  getMesSoutiens(): Observable<Soutien[]> {
    return this.http.get<Soutien[]>(`${this.apiUrl}/mes-soutiens`, { headers: this.getHeaders() });
  }

  getMesProjets(): Observable<ProjetASoutenir[]> {
    return this.http.get<ProjetASoutenir[]>(`${this.apiUrl}/mes-projets`, { headers: this.getHeaders() });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = '/api/v1/auth';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
  const { confirmPassword, acceptTerms, ...payload } = userData;
  return this.http.post(`${this.apiUrl}/register`, payload, { responseType: 'text' });
}

  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-email?email=${encodeURIComponent(email)}`);
  }
}

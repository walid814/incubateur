import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  private requestCounts = new Map<string, { count: number, timestamp: number }>();
  private readonly MAX_REQUESTS_PER_MINUTE = 5;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Appliquer le rate limiting aux endpoints sensibles
    if (req.url.includes('/candidatures/addCandidature') || req.url.includes('/auth/register')) {
      const clientId = this.getClientIdentifier();
      
      if (this.isRateLimited(clientId)) {
        throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
      }

      this.recordRequest(clientId);
    }

    // Ajouter des headers de sécurité
    const secureReq = req.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Time': new Date().toISOString(),
        'X-Request-ID': this.generateRequestId()
      }
    });

    return next.handle(secureReq);
  }

  private getClientIdentifier(): string {
    // Utiliser une combinaison de facteurs pour identifier le client
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return btoa(`${userAgent}-${screenResolution}-${timezone}`).substring(0, 32);
  }

  private isRateLimited(clientId: string): boolean {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData) {
      return false;
    }

    // Nettoyer les anciennes entrées
    if (now - clientData.timestamp > this.RATE_LIMIT_WINDOW) {
      this.requestCounts.delete(clientId);
      return false;
    }

    return clientData.count >= this.MAX_REQUESTS_PER_MINUTE;
  }

  private recordRequest(clientId: string): void {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now - clientData.timestamp > this.RATE_LIMIT_WINDOW) {
      this.requestCounts.set(clientId, { count: 1, timestamp: now });
    } else {
      clientData.count++;
    }
  }

  private generateRequestId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

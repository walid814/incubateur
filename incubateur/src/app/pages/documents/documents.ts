import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

interface DocumentEntreprise {
  id: number;
  type: string;
  typeLibelle: string;
  nomOriginal: string;
  contentType: string;
  taille: number;
  dateImport: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatTooltipModule,
    DashboardSidebarComponent
  ],
  templateUrl: './documents.html',
  styleUrls: ['./documents.scss']
})
export class DocumentsComponent implements OnInit {
  documents: DocumentEntreprise[] = [];
  loading = true;
  uploading = false;

  typeSelectionne = '';
  fichierSelectionne: File | null = null;

  readonly typesDocuments = [
    { value: 'piece_identite', label: "Pièce d'identité" },
    { value: 'justificatif_domicile', label: 'Justificatif de domicile' },
    { value: 'business_plan', label: 'Business plan / présentation du projet' },
    { value: 'devis_budget', label: 'Devis ou budget prévisionnel' },
    { value: 'rib', label: 'RIB' },
    { value: 'statuts', label: "Statuts de l'entreprise" }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerDocuments();
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private chargerDocuments() {
    this.loading = true;
    this.http.get<DocumentEntreprise[]>('/api/documents/mine', { headers: this.headers() }).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fichierSelectionne = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  importer() {
    if (!this.typeSelectionne || !this.fichierSelectionne || this.uploading) {
      return;
    }
    this.uploading = true;

    const formData = new FormData();
    formData.append('type', this.typeSelectionne);
    formData.append('file', this.fichierSelectionne);

    this.http.post('/api/documents', formData, { headers: this.headers() }).subscribe({
      next: () => {
        this.notify.showSuccess('Document importé', 'Votre document a bien été ajouté.');
        this.typeSelectionne = '';
        this.fichierSelectionne = null;
        const input = document.getElementById('file-input') as HTMLInputElement;
        if (input) { input.value = ''; }
        this.uploading = false;
        this.chargerDocuments();
      },
      error: (error) => {
        const message = error?.error?.message || "Impossible d'importer ce document.";
        this.notify.showError('Erreur', message);
        this.uploading = false;
      }
    });
  }

  supprimer(doc: DocumentEntreprise) {
    if (!confirm(`Supprimer "${doc.nomOriginal}" ?`)) {
      return;
    }
    this.http.delete(`/api/documents/${doc.id}`, { headers: this.headers() }).subscribe({
      next: () => {
        this.notify.showSuccess('Supprimé', 'Le document a été supprimé.');
        this.chargerDocuments();
      },
      error: () => {
        this.notify.showError('Erreur', 'Impossible de supprimer ce document.');
      }
    });
  }

  telecharger(doc: DocumentEntreprise) {
    const token = localStorage.getItem('token');
    fetch(`/api/documents/${doc.id}/telecharger`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.nomOriginal;
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => this.notify.showError('Erreur', 'Impossible de télécharger ce document.'));
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  formatTaille(octets: number): string {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getIconePour(contentType: string): string {
    if (contentType?.includes('pdf')) return 'picture_as_pdf';
    if (contentType?.includes('image')) return 'image';
    return 'description';
  }
}

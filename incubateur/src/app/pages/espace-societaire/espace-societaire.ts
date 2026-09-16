import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { ProjetService, ProjetASoutenir, Soutien } from '../../services/projet.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-espace-societaire',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    DashboardSidebarComponent
  ],
  templateUrl: './espace-societaire.html',
  styleUrls: ['./espace-societaire.scss']
})
export class EspaceSocietaireComponent implements OnInit {
  projets: ProjetASoutenir[] = [];
  mesSoutiens: Soutien[] = [];
  loading = true;

  // --- Recherche et filtres sur les projets à soutenir ---
  rechercheTexte = '';
  filtreSecteur = '';
  secteurOptions: string[] = [];

  // Le projet actuellement en train d'être soutenu (formulaire ouvert), ou null.
  projetEnCoursDeSoutien: ProjetASoutenir | null = null;
  soutienForm: FormGroup;
  isSubmitting = false;

  constructor(
    private projetService: ProjetService,
    private notify: NotificationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {
    this.soutienForm = this.fb.group({
      montant: [50, [Validators.required, Validators.min(1)]],
      message: ['']
    });
  }

  ngOnInit() {
    this.chargerProjets();
    this.chargerMesSoutiens();
  }

  private chargerProjets() {
    this.loading = true;
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.secteurOptions = Array.from(new Set(projets.map(p => p.secteur))).sort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notify.showError('Erreur', 'Impossible de charger les projets à soutenir.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private chargerMesSoutiens() {
    this.projetService.getMesSoutiens().subscribe({
      next: (soutiens) => {
        this.mesSoutiens = soutiens;
        this.cdr.detectChanges();
      },
      error: () => { /* silencieux : section secondaire */ }
    });
  }

  ouvrirFormulaireSoutien(projet: ProjetASoutenir) {
    this.projetEnCoursDeSoutien = projet;
    this.soutienForm.reset({ montant: 50, message: '' });
    this.cdr.detectChanges();
  }

  annulerSoutien() {
    this.projetEnCoursDeSoutien = null;
    this.cdr.detectChanges();
  }

  confirmerSoutien() {
    if (!this.projetEnCoursDeSoutien || this.soutienForm.invalid || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const { montant, message } = this.soutienForm.value;
    const projet = this.projetEnCoursDeSoutien;

    this.projetService.soutenir(projet.id, montant, message || undefined).subscribe({
      next: () => {
        this.notify.showSuccess(
          'Merci pour votre soutien !',
          `Votre intention de soutien de ${montant} € pour "${projet.titre}" a bien été enregistrée.`
        );
        this.projetEnCoursDeSoutien = null;
        this.isSubmitting = false;
        this.chargerProjets();
        this.chargerMesSoutiens();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notify.showError('Erreur', 'Impossible d\'enregistrer votre soutien. Réessayez.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  getProgression(projet: ProjetASoutenir): number {
    if (!projet.montantRecherche) return 0;
    return Math.min(Math.round((projet.montantSoutenu / projet.montantRecherche) * 100), 100);
  }

  // Filtrage côté client : le volume de projets ne justifie pas (encore) un
  // filtrage côté serveur — voir section 3.x du mémoire pour la justification.
  get projetsFiltres(): ProjetASoutenir[] {
    const texte = this.rechercheTexte.trim().toLowerCase();
    return this.projets.filter(p => {
      const matchTexte = !texte
        || p.titre.toLowerCase().includes(texte)
        || p.description.toLowerCase().includes(texte)
        || `${p.porteurFirstname} ${p.porteurLastname}`.toLowerCase().includes(texte);
      const matchSecteur = !this.filtreSecteur || p.secteur === this.filtreSecteur;
      return matchTexte && matchSecteur;
    });
  }

  resetFiltres(): void {
    this.rechercheTexte = '';
    this.filtreSecteur = '';
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(montant);
  }

  // --- Tableau de bord sociétaire : quelques indicateurs calculés côté client
  // à partir des données déjà chargées (pas d'appel réseau supplémentaire). ---

  get montantTotalInvesti(): number {
    return this.mesSoutiens.reduce((total, s) => total + (s.montant || 0), 0);
  }

  get nombreProjetsSoutenus(): number {
    return new Set(this.mesSoutiens.map(s => s.projetId)).size;
  }

  get nombreOpportunites(): number {
    return this.projets.length;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

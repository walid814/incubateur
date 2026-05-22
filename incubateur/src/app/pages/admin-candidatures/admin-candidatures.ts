import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidatureAdminService, CandidatureAdmin } from '../../services/candidature-admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './admin-candidatures.html',
  styleUrls: ['./admin-candidatures.scss']
})
export class AdminCandidaturesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'lastname', 
    'firstname', 
    'email', 
    'telephone',
    'ville', 
    'motivation', 
    'statut', 
    'dateCreation', 
    'actions'
  ];

  dataSource = new MatTableDataSource<CandidatureAdmin>();
  candidatures: CandidatureAdmin[] = [];
  statistiques: any = {};
  
  // Filtres
  filtreStatut: string = '';
  filtreSecteur: string = '';
  
  // Options pour les filtres
  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_cours_evaluation', label: 'En cours d\'évaluation' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'refuse', label: 'Refusé' }
  ];

  secteurOptions = [
    { value: '', label: 'Toutes les villes' }
  ];

  constructor(
    private candidatureService: CandidatureAdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation du composant admin-candidatures');
    
    // Diagnostic complet de l'authentification
    this.authService.diagnoseAuthState();
    
    // Vérifier d'abord l'authentification et les permissions
    if (!this.checkAuthentication()) {
      return; // Arrêter l'initialisation si pas autorisé
    }
    
    // this.testConnection(); // Commenté pour la production
    this.loadCandidatures();
    this.loadStatistiques();
  }

  checkAuthentication() {
    const token = localStorage.getItem('token');
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    const hasPermission = this.authService.hasPermission('manage_candidatures');
    const user = this.authService.getCurrentUser();
    
    console.log('🔐 État de l\'authentification:');
    console.log('  - Token présent:', !!token);
    console.log('  - Authentifié:', isAuthenticated);
    console.log('  - Est admin:', isAdmin);
    console.log('  - Permission candidatures:', hasPermission);
    console.log('  - Utilisateur actuel:', user);
    
    if (token) {
      console.log('🔑 Token (début):', token.substring(0, 50) + '...');
    }
    
    if (!isAuthenticated) {
      console.warn('⚠️ Utilisateur non authentifié');
      this.snackBar.open('Vous devez être connecté pour accéder à cette page', 'Fermer', {
        duration: 5000
      });
      return false;
    }
    
    if (!hasPermission) {
      console.warn('⚠️ Permission insuffisante pour gérer les candidatures');
      this.snackBar.open('Vous n\'avez pas les permissions pour gérer les candidatures', 'Fermer', {
        duration: 5000
      });
      return false;
    }
    
    return true;
  }

  // Méthodes de debug commentées pour la production
  /*
  testConnection() {
    console.log('🔍 Test de la connexion API...');
    
    // Test avec authentification
    this.candidatureService.testApiConnection().subscribe({
      next: (result) => console.log('✅ Test API avec auth:', result),
      error: (error) => console.error('❌ Test API avec auth échoué:', error)
    });
    
    // Test sans authentification
    this.candidatureService.getCandidaturesPublic().subscribe({
      next: (result) => console.log('✅ Test API sans auth:', result),
      error: (error) => console.error('❌ Test API sans auth échoué:', error)
    });
  }

  // Méthode pour forcer le rechargement
  forceReload() {
    console.log('🔄 Rechargement forcé des candidatures...');
    this.candidatures = [];
    this.dataSource.data = [];
    this.loadCandidatures();
  }
  */

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCandidatures() {
    console.log('📋 Début du chargement des candidatures...');
    
    this.candidatureService.getAllCandidatures().subscribe({
      next: (candidatures) => {
        console.log('✅ Candidatures reçues:', candidatures);
        console.log('📊 Nombre de candidatures:', candidatures.length);
        console.log('🔍 Première candidature:', candidatures[0]);
        
        this.candidatures = candidatures;
        this.dataSource.data = candidatures;
        
        // Mettre à jour les secteurs pour le filtre
        this.updateSecteurOptions();
        
        console.log('📋 Candidatures chargées dans dataSource');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des candidatures:', error);
        console.error('🔍 Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        this.snackBar.open(
          `Erreur lors du chargement des candidatures: ${error.status} - ${error.statusText}`, 
          'Fermer', 
          { duration: 5000 }
        );
      }
    });
  }

  // Mettre à jour les options de secteur basées sur les candidatures
  updateSecteurOptions() {
    const villes = [...new Set(this.candidatures.map(c => c.ville))].filter(v => v);
    this.secteurOptions = [
      { value: '', label: 'Toutes les villes' },
      ...villes.map(v => ({ value: v, label: v }))
    ];
    console.log('🏙️ Villes disponibles:', villes);
  }

  loadStatistiques() {
    this.candidatureService.getStatistiques().subscribe({
      next: (stats) => {
        this.statistiques = stats;
        console.log('📊 Statistiques chargées:', stats);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  appliquerFiltres() {
    let candidaturesFiltrees = [...this.candidatures];

    if (this.filtreStatut) {
      candidaturesFiltrees = candidaturesFiltrees.filter(c => c.statut === this.filtreStatut);
    }

    if (this.filtreSecteur) {
      candidaturesFiltrees = candidaturesFiltrees.filter(c => c.ville === this.filtreSecteur);
    }

    this.dataSource.data = candidaturesFiltrees;
  }

  resetFiltres() {
    this.filtreStatut = '';
    this.filtreSecteur = '';
    this.dataSource.data = this.candidatures;
  }

  changerStatut(candidature: CandidatureAdmin, nouveauStatut: CandidatureAdmin['statut']) {
    this.candidatureService.updateStatut(candidature.id, nouveauStatut).subscribe({
      next: () => {
        candidature.statut = nouveauStatut;
        candidature.dateEvaluation = new Date();
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadStatistiques(); // Recharger les stats
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
        this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  exporterCandidatures() {
    this.candidatureService.exportCandidatures().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `candidatures_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Export réalisé avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'primary';
      case 'en_cours_evaluation': return 'accent';
      case 'accepte': return 'success';
      case 'refuse': return 'warn';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours_evaluation': return 'En évaluation';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      default: return statut;
    }
  }

  getScoreColor(score?: number): string {
    if (!score) return '';
    if (score >= 80) return 'success';
    if (score >= 60) return 'accent';
    return 'warn';
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  voirDetails(candidature: CandidatureAdmin) {
    // Logique pour ouvrir une modal avec les détails
    console.log('Voir détails:', candidature);
  }

  supprimerCandidature(candidature: CandidatureAdmin) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la candidature de ${candidature.firstname} ${candidature.lastname} ?`)) {
      this.candidatureService.deleteCandidature(candidature.id).subscribe({
        next: () => {
          this.candidatures = this.candidatures.filter(c => c.id !== candidature.id);
          this.dataSource.data = this.candidatures;
          this.snackBar.open('Candidature supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadStatistiques();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  // Méthodes pour les statistiques des utilisateurs
  getUsersFromCandidatures(): number {
    // Compter les utilisateurs uniques par email
    const uniqueEmails = new Set(this.candidatures.map(c => c.email));
    return uniqueEmails.size;
  }

  getUniqueVilles(): string[] {
    const villes = this.candidatures
      .map(c => c.ville)
      .filter(ville => ville && ville.trim() !== '')
      .filter((ville, index, array) => array.indexOf(ville) === index);
    return villes;
  }

  getCandidaturesThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.candidatures.filter(c => {
      if (!c.dateCreation) return false;
      const candidatureDate = new Date(c.dateCreation);
      return candidatureDate >= startOfMonth;
    }).length;
  }

  getTauxAcceptation(): number {
    if (this.candidatures.length === 0) return 0;
    
    const acceptees = this.candidatures.filter(c => c.statut === 'accepte').length;
    const traitees = this.candidatures.filter(c => 
      c.statut === 'accepte' || c.statut === 'refuse'
    ).length;
    
    if (traitees === 0) return 0;
    
    return Math.round((acceptees / traitees) * 100);
  }

  getTempsTraitementMoyen(): string {
    const candidaturesTraitees = this.candidatures.filter(c => 
      c.dateEvaluation && c.dateCreation &&
      (c.statut === 'accepte' || c.statut === 'refuse')
    );
    
    if (candidaturesTraitees.length === 0) return 'N/A';
    
    let totalJours = 0;
    candidaturesTraitees.forEach(c => {
      const debut = new Date(c.dateCreation!);
      const fin = new Date(c.dateEvaluation!);
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalJours += diffDays;
    });
    
    const moyenne = Math.round(totalJours / candidaturesTraitees.length);
    return `${moyenne} jour${moyenne > 1 ? 's' : ''}`;
  }
}

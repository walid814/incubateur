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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserAdminService, UserAdmin, UserStatistics, UserRole } from '../../services/user-admin.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-admin-users',
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
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    DashboardSidebarComponent
  ],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss']
})
export class AdminUsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'lastname',
    'firstname',
    'email',
    'role',
    'isActive',
    'dateCreation',
    'actions'
  ];

  dataSource = new MatTableDataSource<UserAdmin>();
  users: UserAdmin[] = [];
  statistics: UserStatistics = {
    total: 0,
    admins: 0,
    societaires: 0,
    users: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0,
    profilesComplete: 0,
    profilesIncomplete: 0
  };

  // Filtres
  filtreRole: string = '';
  filtreStatut: string = '';
  searchQuery: string = '';

  roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'USER', label: 'Entrepreneur' },
    { value: 'SOCIETAIRE', label: 'Sociétaire' },
    { value: 'ADMIN', label: 'Administrateur' }
  ];

  // Choix de rôle disponibles dans le formulaire créer/modifier (sans l'option "Tous").
  roleFormOptions = this.roleOptions.filter(o => o.value !== '');

  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  // --- Formulaire créer / modifier (même modale pour les deux cas) ---
  formOuvert = false;
  modeEdition = false;
  utilisateurEnEdition: UserAdmin | null = null;
  isSubmitting = false;
  userForm: FormGroup;

  constructor(
    private userService: UserAdminService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      ville: [''],
      codePostal: [''],
      role: ['USER', Validators.required],
      password: ['']
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Le compte actuellement connecté ne doit jamais pouvoir se supprimer,
  // se désactiver ou changer son propre rôle depuis cette interface.
  estSoi(user: UserAdmin): boolean {
    return this.authService.getCurrentUser()?.id === user.id;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.dataSource.data = users;
        this.loadStatistics();
      },
      error: (error) => {
        this.snackBar.open(
          `Impossible de charger les utilisateurs (${error.status === 0 ? 'backend injoignable' : error.status})`,
          'Fermer',
          { duration: 5000 }
        );
      }
    });
  }

  loadStatistics() {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => { this.statistics = stats; }
    });
  }

  applyFilter() {
    let usersFiltres = [...this.users];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      usersFiltres = usersFiltres.filter(u =>
        u.firstname.toLowerCase().includes(query) ||
        u.lastname.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    if (this.filtreRole) {
      usersFiltres = usersFiltres.filter(u => u.role === this.filtreRole);
    }

    if (this.filtreStatut) {
      if (this.filtreStatut === 'active') {
        usersFiltres = usersFiltres.filter(u => u.isActive !== false);
      } else if (this.filtreStatut === 'inactive') {
        usersFiltres = usersFiltres.filter(u => u.isActive === false);
      }
    }

    this.dataSource.data = usersFiltres;
  }

  clearFilters() {
    this.filtreRole = '';
    this.filtreStatut = '';
    this.searchQuery = '';
    this.dataSource.data = this.users;
  }

  // --- Créer / Modifier ---

  ouvrirCreation() {
    this.modeEdition = false;
    this.utilisateurEnEdition = null;
    this.userForm.reset({ role: 'USER' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.formOuvert = true;
  }

  ouvrirEdition(user: UserAdmin) {
    this.modeEdition = true;
    this.utilisateurEnEdition = user;
    this.userForm.reset({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      ville: user.ville || '',
      codePostal: user.codePostal || '',
      role: user.role
    });
    // Le mot de passe ne se modifie pas depuis ce formulaire.
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.formOuvert = true;
  }

  fermerFormulaire() {
    this.formOuvert = false;
    this.utilisateurEnEdition = null;
  }

  soumettreFormulaire() {
    if (this.userForm.invalid || this.isSubmitting) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const valeurs = this.userForm.value;

    if (this.modeEdition && this.utilisateurEnEdition) {
      this.userService.updateUser(this.utilisateurEnEdition.id, {
        firstname: valeurs.firstname,
        lastname: valeurs.lastname,
        email: valeurs.email,
        telephone: valeurs.telephone,
        adresse: valeurs.adresse,
        ville: valeurs.ville,
        codePostal: valeurs.codePostal,
        role: valeurs.role
      }).subscribe({
        next: () => {
          this.snackBar.open('Compte modifié avec succès', 'Fermer', { duration: 3000 });
          this.isSubmitting = false;
          this.fermerFormulaire();
          this.loadUsers();
        },
        error: (error) => this.gererErreurFormulaire(error)
      });
    } else {
      this.userService.createUser({
        firstname: valeurs.firstname,
        lastname: valeurs.lastname,
        email: valeurs.email,
        telephone: valeurs.telephone,
        adresse: valeurs.adresse,
        ville: valeurs.ville,
        codePostal: valeurs.codePostal,
        role: valeurs.role,
        password: valeurs.password
      }).subscribe({
        next: () => {
          this.snackBar.open('Compte créé avec succès', 'Fermer', { duration: 3000 });
          this.isSubmitting = false;
          this.fermerFormulaire();
          this.loadUsers();
        },
        error: (error) => this.gererErreurFormulaire(error)
      });
    }
  }

  private gererErreurFormulaire(error: any) {
    this.isSubmitting = false;
    const message = error.status === 409
      ? 'Cette adresse email est déjà utilisée par un autre compte.'
      : 'Une erreur est survenue. Réessayez.';
    this.snackBar.open(message, 'Fermer', { duration: 4000 });
  }

  // --- Actions rapides ---

  toggleUserStatus(user: UserAdmin) {
    if (this.estSoi(user)) { return; }
    const newStatus = !user.isActive;
    const action = newStatus ? 'activer' : 'désactiver';

    if (confirm(`Voulez-vous ${action} l'utilisateur ${user.firstname} ${user.lastname} ?`)) {
      this.userService.toggleUserStatus(user.id, newStatus).subscribe({
        next: () => {
          this.snackBar.open(`Utilisateur ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`, 'Fermer', { duration: 3000 });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  supprimerUtilisateur(user: UserAdmin) {
    if (this.estSoi(user)) { return; }
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ? Cette action est irréversible.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          const message = error?.error?.message || 'Erreur lors de la suppression';
          this.snackBar.open(message, 'Fermer', { duration: 6000 });
        }
      });
    }
  }

  exporterUtilisateurs() {
    this.userService.exportUsers().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Méthodes utilitaires
  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'SOCIETAIRE': return 'Sociétaire';
      case 'USER': return 'Entrepreneur';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'SOCIETAIRE': return 'accent';
      default: return 'primary';
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}

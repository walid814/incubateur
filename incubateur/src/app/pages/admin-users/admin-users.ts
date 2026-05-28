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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserAdminService, UserAdmin, UserStatistics } from '../../services/user-admin.service';
import { AuthService } from '../../services/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule
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
    'profileComplete',
    'actions'
  ];

  dataSource = new MatTableDataSource<UserAdmin>();
  users: UserAdmin[] = [];
  statistics: UserStatistics = {
    total: 0,
    admins: 0,
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
  
  // Options pour les filtres
  roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'USER', label: 'Utilisateur' },
    { value: 'ADMIN', label: 'Administrateur' }
  ];

  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  constructor(
    private userService: UserAdminService,
    public authService: AuthService, // Rendre public pour l'accès depuis le template
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Vérifier d'abord l'authentification et les permissions
    if (!this.checkAuthentication()) {
      return; // Arrêter l'initialisation si pas autorisé
    }
    
    // this.testConnection(); // Commenté pour la production
    this.loadUsers(); // Les statistiques seront chargées automatiquement après les utilisateurs
  }

  checkAuthentication(): boolean {
    const token = localStorage.getItem('token');
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    const hasPermission = this.authService.hasPermission('manage_users');
    const user = this.authService.getCurrentUser();
    
    console.log('🔐 État de l\'authentification:');
    console.log('  - Token présent:', !!token);
    console.log('  - Authentifié:', isAuthenticated);
    console.log('  - Est admin:', isAdmin);
    console.log('  - Permission utilisateurs:', hasPermission);
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
      console.warn('⚠️ Permission insuffisante pour gérer les utilisateurs');
      this.snackBar.open('Vous n\'avez pas les permissions pour gérer les utilisateurs', 'Fermer', {
        duration: 5000
      });
      return false;
    }
    
    return true;
  }

  // Méthodes de debug commentées pour la production
  /*
  testConnection() {
    console.log('🧪 Test de connexion API...');
    
    // Test 1: Vérifier l'authentification
    console.log('🔐 Test 1: Vérification authentification');
    this.checkAuthentication();
    
    // Test 2: Tester la connectivité API
    console.log('🌐 Test 2: Test connectivité API');
    this.userService.testApiConnection().subscribe({
      next: (result) => {
        if (result) {
          console.log('✅ API accessible');
          this.snackBar.open('API accessible - Test réussi!', 'Fermer', { duration: 3000 });
        } else {
          console.log('❌ API non accessible');
          this.snackBar.open('API non accessible', 'Fermer', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('❌ Erreur de test API:', error);
        this.snackBar.open(`Erreur API: ${error.status}`, 'Fermer', { duration: 5000 });
      }
    });
    
    // Test 3: Forcer un rechargement après le test
    setTimeout(() => {
      console.log('🔄 Rechargement automatique après test...');
      this.forceReload();
    }, 2000);
  }

  // Méthode de debug avancée pour l'API
  debugApiCall() {
    console.log('🔬 === DEBUG API CALL ===');
    
    // Vérifier l'état de l'authentification
    const token = localStorage.getItem('token');
    const user = this.authService.getCurrentUser();
    
    console.log('🔐 État authentification:', {
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...',
      user: user,
      isAuthenticated: this.authService.isAuthenticated(),
      isAdmin: this.authService.isAdmin()
    });
    
    // Appel direct à getAllUsers avec logging détaillé
    console.log('📞 Appel direct getAllUsers...');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ DEBUG: Utilisateurs reçus:', users);
        console.log('✅ DEBUG: Nombre d\'utilisateurs:', users.length);
        console.log('✅ DEBUG: Premier utilisateur:', users[0]);
        
        // Forcer l'affichage dans le tableau
        this.users = users;
        this.dataSource.data = users;
        this.dataSource._updateChangeSubscription();
        
        this.snackBar.open(`Debug: ${users.length} utilisateurs reçus`, 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('❌ DEBUG: Erreur API:', error);
        console.error('❌ DEBUG: Status:', error.status);
        console.error('❌ DEBUG: Message:', error.message);
        console.error('❌ DEBUG: URL:', error.url);
        
        this.snackBar.open(`Debug Error: ${error.status} - ${error.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  // Méthode pour forcer le rechargement
  forceReload() {
    console.log('🔄 Rechargement forcé des utilisateurs...');
    this.users = [];
    this.dataSource.data = [];
    this.loadUsers();
  }

  // Méthode pour simuler une connexion admin
  simulateAdmin() {
    console.log('🧪 Simulation connexion admin...');
    this.authService.simulateAdminLogin();
    
    // Attendre un peu puis recharger
    setTimeout(() => {
      this.forceReload();
    }, 1000);
  }
  */

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    console.log('👥 Début du chargement des utilisateurs...');
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Utilisateurs reçus:', users);
        console.log('📊 Nombre d\'utilisateurs:', users.length);
        console.log('🔍 Premier utilisateur:', users[0]);
        
        this.users = users;
        this.dataSource.data = users;
        console.log('👥 Utilisateurs chargés dans dataSource');
        
        // Recharger les statistiques après avoir chargé les utilisateurs
        this.loadStatistics();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        console.error('🔍 Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        this.snackBar.open(
          `Erreur lors du chargement des utilisateurs: ${error.status} - ${error.statusText}`, 
          'Fermer', 
          { duration: 5000 }
        );
      }
    });
  }

  // Méthode pour forcer le rechargement
  forceReload() {
    console.log('🔄 Rechargement forcé des utilisateurs...');
    this.users = [];
    this.dataSource.data = [];
    this.loadUsers();
  }

  loadStatistics() {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        console.log('Statistiques chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  applyFilter() {
    let usersFiltres = [...this.users];

    // Filtre par recherche textuelle
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      usersFiltres = usersFiltres.filter(u => 
        u.firstname.toLowerCase().includes(query) ||
        u.lastname.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // Filtre par rôle
    if (this.filtreRole) {
      usersFiltres = usersFiltres.filter(u => u.role === this.filtreRole);
    }

    // Filtre par statut
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

  // Gestion des actions sur les utilisateurs
  toggleUserRole(user: UserAdmin) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    
    if (confirm(`Changer le rôle de ${user.firstname} ${user.lastname} vers ${newRole} ?`)) {
      this.userService.updateUserRole(user.id, newRole).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilter();
            this.loadStatistics();
          }
          this.snackBar.open('Rôle mis à jour avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du rôle:', error);
          this.snackBar.open('Erreur lors de la mise à jour du rôle', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  toggleUserStatus(user: UserAdmin) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activer' : 'désactiver';
    
    if (confirm(`Voulez-vous ${action} l'utilisateur ${user.firstname} ${user.lastname} ?`)) {
      this.userService.toggleUserStatus(user.id, newStatus).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilter();
            this.loadStatistics();
          }
          this.snackBar.open(`Utilisateur ${action} avec succès`, 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors du changement de statut:', error);
          this.snackBar.open('Erreur lors du changement de statut', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  supprimerUtilisateur(user: UserAdmin) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ? Cette action est irréversible.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilter();
          this.loadStatistics();
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
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
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // Méthodes utilitaires
  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'USER': return 'primary';
      default: return 'accent';
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

  getProfileCompleteIcon(complete: boolean): string {
    return complete ? 'check_circle' : 'radio_button_unchecked';
  }

  getProfileCompleteColor(complete: boolean): string {
    return complete ? 'primary' : 'warn';
  }
}

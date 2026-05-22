import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './connexion.html',
  styleUrls: ['./connexion.scss']
})
export class ConnexionComponent {
  connexionForm: FormGroup;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.connexionForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      const { email, password } = this.connexionForm.value;
      
      // Debug : Afficher les données envoyées
      console.log('Tentative de connexion avec:', { email, password: '***' });
      
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          console.log('Connexion réussie:', response);
          
          // Attendre un court délai pour s'assurer que le token est bien stocké
          setTimeout(() => {
            console.log('Redirection vers dashboard...');
            console.log('Token stocké:', this.authService.getToken());
            console.log('Utilisateur authentifié:', this.authService.isAuthenticated());
            
            this.router.navigate(['/dashboard']).then(
              (success) => {
                if (success) {
                  console.log('✅ Redirection réussie vers /dashboard');
                } else {
                  console.log('❌ Échec de la redirection vers /dashboard');
                  // Fallback vers accueil si dashboard ne fonctionne pas
                  this.router.navigate(['/']);
                }
              }
            ).catch(error => {
              console.error('Erreur lors de la navigation:', error);
              this.router.navigate(['/']);
            });
          }, 100);
        },
        error: (error) => {
          console.error('Erreur de connexion complète:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Body:', error.error);
          
          if (error.status === 401) {
            alert('Email ou mot de passe incorrect.');
          } else if (error.status === 0) {
            alert('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
          } else {
            alert(`Erreur de connexion (${error.status}): ${error.error?.message || error.message || 'Erreur inconnue'}`);
          }
        }
      });
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToSignup() {
    this.router.navigate(['/candidature']);
  }

  // Méthode de test pour vérifier la connectivité du backend
  testBackendConnection() {
    console.log('Test de connexion backend...');
    
    // Test simple avec les identifiants
    const testCredentials = {
      email: this.connexionForm.get('email')?.value || 'test@example.com',
      password: this.connexionForm.get('password')?.value || 'password123'
    };

    this.authService.login(testCredentials).subscribe({
      next: (response) => {
        console.log('✅ Test réussi:', response);
        alert('Test de connexion réussi !');
      },
      error: (error) => {
        console.error('❌ Test échoué:', error);
        alert(`Test échoué: ${error.status} - ${JSON.stringify(error.error)}`);
      }
    });
  }
}

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
import { NotificationService } from '../../services/notification.service';

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
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.connexionForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (!this.connexionForm.valid) {
      this.notify.showWarning('Formulaire incomplet', 'Veuillez remplir tous les champs correctement.');
      return;
    }

    const { email, password } = this.connexionForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']).then(success => {
          if (!success) {
            this.router.navigate(['/']);
          }
        }).catch(() => this.router.navigate(['/']));
      },
      error: (error) => {
        if (error.status === 401) {
          this.notify.showError('Connexion refusée', 'Email ou mot de passe incorrect.');
        } else if (error.status === 0) {
          this.notify.showError('Serveur injoignable', 'Impossible de contacter le serveur. Réessayez plus tard.');
        } else {
          this.notify.showError(
            'Erreur de connexion',
            error.error?.message || error.message || 'Une erreur est survenue. Réessayez.'
          );
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToSignup() {
    this.router.navigate(['/candidature']);
  }
}

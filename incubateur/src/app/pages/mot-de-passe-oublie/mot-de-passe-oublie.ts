import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrls: ['./mot-de-passe-oublie.scss']
})
export class MotDePasseOublieComponent {
  // Étape 1 : demander le code par email. Étape 2 : saisir le code + le nouveau mot de passe.
  step: 'email' | 'reset' = 'email';
  isSubmitting = false;
  email = '';

  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private notify: NotificationService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  demanderCode() {
    if (!this.emailForm.valid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.email = this.emailForm.value.email;

    this.http.post('/api/v1/auth/forgot-password', { email: this.email }, { responseType: 'text' }).subscribe({
      next: () => {
        this.notify.showSuccess('Code envoyé !', `Un code de réinitialisation a été envoyé à ${this.email}.`);
        this.step = 'reset';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.notify.showError('Erreur', err.error?.message || 'Impossible d\'envoyer le code. Vérifiez votre email.');
        this.isSubmitting = false;
      }
    });
  }

  reinitialiser() {
    if (!this.resetForm.valid || this.isSubmitting) return;

    const { newPassword, confirmPassword } = this.resetForm.value;
    if (newPassword !== confirmPassword) {
      this.notify.showError('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    this.isSubmitting = true;
    this.http.post('/api/v1/auth/reset-password', {
      email: this.email,
      code: this.resetForm.value.code,
      newPassword
    }, { responseType: 'text' }).subscribe({
      next: () => {
        this.notify.showSuccess('Mot de passe réinitialisé !', 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');
        this.router.navigate(['/connexion']);
      },
      error: (err) => {
        this.notify.showError('Code invalide', err.error?.message || 'Code incorrect ou expiré.');
        this.isSubmitting = false;
      }
    });
  }

  retourEmail() {
    this.step = 'email';
  }
}

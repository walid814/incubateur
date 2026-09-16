import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.scss']
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  isSubmitting = false;
  isResending = false;
  email = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private notify: NotificationService
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/register']);
      }
    });
  }

  onSubmit() {
    if (!this.verifyForm.valid || this.isSubmitting) return;
    this.isSubmitting = true;

    this.http.post('/api/v1/auth/verify-email', {
      email: this.email,
      code: this.verifyForm.value.code
    }).subscribe({
      next: () => {
        this.notify.showSuccess('Compte activé !', 'Votre compte est maintenant actif. Vous pouvez vous connecter.');
        this.router.navigate(['/connexion']);
      },
      error: (err) => {
        this.notify.showError('Code invalide', err.error?.message || 'Code incorrect ou expiré.');
        this.isSubmitting = false;
      }
    });
  }

  resendCode() {
    if (this.isResending) return;
    this.isResending = true;

    this.http.post(`/api/v1/auth/resend-code?email=${this.email}`, {}, { responseType: 'text' }).subscribe({
      next: () => {
        this.notify.showSuccess('Code renvoyé !', 'Un nouveau code a été envoyé à votre email.');
        this.isResending = false;
      },
      error: () => {
        this.notify.showError('Erreur', 'Impossible de renvoyer le code. Réessayez.');
        this.isResending = false;
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { NotificationService } from '../../services/notification.service';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isSubmitting = false;
  submitCooldown = false;
  emailAvailabilityChecking = false;
  emailAvailable: boolean | null = null;
  private readonly COOLDOWN_TIME = 60000; // 1 minute

  roles = [
    { value: 'USER', label: 'Utilisateur' },
    { value: 'ENTREPRENEUR', label: 'Entrepreneur' },
    { value: 'MENTOR', label: 'Mentor' },
    { value: 'INVESTOR', label: 'Investisseur' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private notify: NotificationService
  ) {
    this.registerForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Vérification de disponibilité email en temps réel
    this.registerForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      switchMap(email => {
        if (email && this.registerForm.get('email')?.valid) {
          this.emailAvailabilityChecking = true;
          return this.registerService.checkEmailAvailability(email);
        }
        return [];
      })
    ).subscribe({
      next: (result: any) => {
        this.emailAvailable = result.available;
        this.emailAvailabilityChecking = false;
      },
      error: () => {
        this.emailAvailabilityChecking = false;
        this.emailAvailable = null;
      }
    });
  }

  // Validateur personnalisé pour la force du mot de passe
  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
    const hasMinLength = value.length >= 8;

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial && hasMinLength;

    return passwordValid ? null : {
      passwordStrength: {
        hasNumber,
        hasUpper,
        hasLower,
        hasSpecial,
        hasMinLength
      }
    };
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  onSubmit() {
    if (this.isSubmitting) {
      this.notify.showInfo('Patientez', 'Enregistrement en cours…');
      return;
    }

    if (this.submitCooldown) {
      this.notify.showWarning('Trop rapide', 'Veuillez attendre une minute avant de réessayer.');
      return;
    }

    if (this.emailAvailable === false) {
      this.notify.showError('Email indisponible', 'Cette adresse email est déjà utilisée.');
      return;
    }

    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
      this.notify.showWarning('Formulaire incomplet', 'Veuillez corriger les erreurs avant de soumettre.');
      return;
    }

    this.isSubmitting = true;
    this.submitCooldown = true;

    const formData = { ...this.registerForm.value };

    this.registerService.register(formData).subscribe({
      next: () => {
        this.notify.showSuccess('Compte créé', 'Votre compte a été créé. Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/connexion']);
        this.resetSubmissionState();
      },
      error: (error) => {
        if (error.status === 429) {
          this.notify.showError('Trop de tentatives', 'Veuillez réessayer plus tard.');
        } else if (error.status === 409) {
          this.notify.showError('Email indisponible', 'Cette adresse email est déjà utilisée.');
        } else {
          this.notify.showError('Échec de la création', error.message || 'Une erreur est survenue. Réessayez.');
        }
        this.resetSubmissionState();
      }
    });

    setTimeout(() => {
      this.submitCooldown = false;
    }, this.COOLDOWN_TIME);
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetSubmissionState() {
    this.isSubmitting = false;
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }

  getPasswordStrengthErrors() {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.errors?.['passwordStrength']) {
      return passwordControl.errors['passwordStrength'];
    }
    return null;
  }
}

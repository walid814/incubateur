import { Component, ElementRef, Injector, afterNextRender, inject } from '@angular/core';
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
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { NotificationService } from '../../services/notification.service';

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
    MatProgressSpinnerModule,
    BackButtonComponent
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isSubmitting = false;

  readonly nationalites: string[] = [
    'Algérienne', 'Allemande', 'Américaine', 'Angolaise', 'Belge', 'Béninoise',
    'Brésilienne', 'Britannique', 'Burkinabè', 'Camerounaise', 'Canadienne',
    'Centrafricaine', 'Chinoise', 'Colombienne', 'Comorienne', 'Congolaise (RC)',
    'Congolaise (RDC)', 'Ivoirienne', 'Djiboutienne', 'Égyptienne', 'Espagnole',
    'Française', 'Gabonaise', 'Ghanéenne', 'Grecque', 'Guinéenne', 'Haïtienne',
    'Indienne', 'Italienne', 'Japonaise', 'Malgache', 'Malienne', 'Marocaine',
    'Mauritanienne', 'Mexicaine', 'Néerlandaise', 'Nigériane', 'Nigérienne',
    'Pakistanaise', 'Polonaise', 'Portugaise', 'Roumaine', 'Russe', 'Sénégalaise',
    'Sud-africaine', 'Suisse', 'Syrienne', 'Tchadienne', 'Togolaise', 'Tunisienne',
    'Turque', 'Ukrainienne', 'Vietnamienne', 'Autre'
  ];

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private notify: NotificationService
  ) {
    afterNextRender(() => this.drawTrajectory(), { injector: this.injector });

    this.registerForm = this.formBuilder.group({
      firstname:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:           ['', [Validators.required, Validators.email]],
      telephone:       ['', [Validators.pattern(/^[+]?[0-9]{8,15}$/)]],
      ville:           [''],
      pays:            [''],
      nationalite:     [''],
      role:            ['', Validators.required],
      password:        ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms:     [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private drawTrajectory() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const path = (this.host.nativeElement as HTMLElement).querySelector<SVGPathElement>('.aside-path');
    if (!path) return;
    if (reduced) { path.style.strokeDashoffset = '0'; return; }
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(.22,1,.36,1)';
    requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const hasNumber   = /[0-9]/.test(value);
    const hasUpper    = /[A-Z]/.test(value);
    const hasLower    = /[a-z]/.test(value);
    const hasSpecial  = /[@$!%*?&]/.test(value);
    const hasMinLength = value.length >= 8;
    const valid = hasNumber && hasUpper && hasLower && hasSpecial && hasMinLength;
    return valid ? null : { passwordStrength: { hasNumber, hasUpper, hasLower, hasSpecial, hasMinLength } };
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password');
    const confirm  = group.get('confirmPassword');
    if (!password || !confirm) return null;
    return password.value === confirm.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') this.hidePassword = !this.hidePassword;
    else this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getPasswordStrengthErrors() {
    const ctrl = this.registerForm.get('password');
    return ctrl?.errors?.['passwordStrength'] ?? null;
  }

  onSubmit() {
    if (this.isSubmitting) return;

    if (!this.registerForm.valid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.notify.showWarning('Formulaire incomplet', 'Veuillez corriger les erreurs avant de soumettre.');
      return;
    }

    this.isSubmitting = true;

    const { confirmPassword, acceptTerms, ...formData } = this.registerForm.value;

    this.registerService.register(formData).subscribe({
     next: () => {
  this.notify.showSuccess('Compte créé !', 'Un code de vérification a été envoyé à votre email.');
 this.router.navigate(['/verify-email'], { queryParams: { email: this.registerForm.value.email } });
  this.isSubmitting = false;
},
      error: (error) => {
        if (error.status === 409) {
          this.notify.showError('Email indisponible', 'Cette adresse email est déjà utilisée.');
        } else {
          this.notify.showError('Échec', error.error?.message || 'Une erreur est survenue. Réessayez.');
        }
        this.isSubmitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }
}

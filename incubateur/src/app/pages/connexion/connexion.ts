import { Component, ElementRef, Injector, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
    MatCheckboxModule,
    RouterLink
  ],
  templateUrl: './connexion.html',
  styleUrls: ['./connexion.scss']
})
export class ConnexionComponent {
  connexionForm: FormGroup;
  hidePassword = true;
  isSubmitting = false;

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private notify: NotificationService
  ) {
    this.connexionForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    afterNextRender(() => this.drawTrajectory(), { injector: this.injector });
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

  onSubmit() {
    console.log('onSubmit appele');
    if (!this.connexionForm.valid || this.isSubmitting) return;
    this.isSubmitting = true;
    const { email, password } = this.connexionForm.value;
    this.http.post<any>('/api/v1/auth/authenticate', { email, password }).subscribe({
      next: (response) => {
        console.log('Reponse:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          email: response.email,
          firstname: response.firstname,
          lastname: response.lastname,
          role: response.role
        }));
        this.notify.showSuccess('Connexion reussie', 'Bienvenue ' + response.firstname);
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/candidatures']);
        } else if (response.role === 'SOCIETAIRE') {
          this.router.navigate(['/espace-societaire']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.log('Erreur:', err);
        this.notify.showError('Echec', err.error?.message || 'Email ou mot de passe incorrect.');
        this.isSubmitting = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToSignup() {
    this.router.navigate(['/register']);
  }
}
